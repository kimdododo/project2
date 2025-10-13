# airflow/dags/youtube_nlp.py
import os
from datetime import datetime
import pymysql

from airflow import DAG
from airflow.operators.python import PythonOperator

# ------- DB utils -------
MYSQL_HOST=os.getenv("MYSQL_HOST","mysql")
MYSQL_PORT=int(os.getenv("MYSQL_PORT","3306"))
MYSQL_DB=os.getenv("MYSQL_DB","yt")
MYSQL_USER=os.getenv("MYSQL_USER","ytuser")
MYSQL_PW=os.getenv("MYSQL_PW","ytpw")

def get_conn():
    return pymysql.connect(host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
                           password=MYSQL_PW, database=MYSQL_DB,
                           charset="utf8mb4", autocommit=True)

def ensure_nlp_tables():
    ddl = [
        """CREATE TABLE IF NOT EXISTS recs(
             video_id VARCHAR(64), similar_id VARCHAR(64), score DOUBLE,
             PRIMARY KEY(video_id,similar_id), INDEX(video_id), INDEX(similar_id)
           )""",
        """CREATE TABLE IF NOT EXISTS topics(
             video_id VARCHAR(64) PRIMARY KEY,
             topic_id INT, topic_label VARCHAR(255), probability DOUBLE
           )""",
        """CREATE TABLE IF NOT EXISTS comment_sentiment(
             comment_id VARCHAR(128) PRIMARY KEY,
             video_id VARCHAR(64), label VARCHAR(32), score DOUBLE,
             INDEX(video_id)
           )""",
        """CREATE TABLE IF NOT EXISTS video_sentiment_agg(
             video_id VARCHAR(64) PRIMARY KEY,
             pos DOUBLE, neu DOUBLE, neg DOUBLE, n INT
           )"""
    ]
    with get_conn() as c, c.cursor() as cur:
        for q in ddl: cur.execute(q)

def load_videos_comments():
    # 제목 + 상위 댓글 일부를 비디오별 문서로 묶기
    from collections import defaultdict
    corp = defaultdict(list)
    with get_conn() as c, c.cursor() as cur:
        cur.execute("SELECT id,title FROM videos")
        vids = cur.fetchall()
        for vid,title in vids:
            corp[vid].append(title or "")
        cur.execute("SELECT video_id,text FROM comments WHERE text IS NOT NULL AND text<>''")
        for vid,tx in cur.fetchall():
            corp[vid].append(tx or "")
    ids, texts = [], []
    for vid, lst in corp.items():
        text = "\n".join([t for t in lst if t])
        if text.strip():
            ids.append(vid); texts.append(text)
    return ids, texts

# ------- Tasks -------
def task_recommendations(**_):
    # Lazy import (파서 안정)
    from sentence_transformers import SentenceTransformer
    import numpy as np

    ensure_nlp_tables()
    ids, texts = load_videos_comments()
    if not ids: return

    model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    embs = model.encode(texts, batch_size=64, show_progress_bar=False, normalize_embeddings=True)
    embs = np.asarray(embs, dtype=np.float32)
    sim = embs @ embs.T

    K = 10
    with get_conn() as c, c.cursor() as cur:
        # 간단히 전량 재생성
        cur.execute("DELETE FROM recs")
        for i, vid in enumerate(ids):
            idx = np.argpartition(-sim[i], range(1, K+1))[1:K+1]
            for j in idx:
                if ids[j] == vid: continue
                cur.execute(
                    "INSERT INTO recs(video_id,similar_id,score) VALUES(%s,%s,%s) "
                    "ON DUPLICATE KEY UPDATE score=VALUES(score)",
                    (vid, ids[j], float(sim[i, j]))
                )

def task_topics(**_):
    from bertopic import BERTopic

    ensure_nlp_tables()
    ids, texts = load_videos_comments()
    if not ids: return

    topic_model = BERTopic(language="multilingual")
    topics, probs = topic_model.fit_transform(texts)
    info = topic_model.get_topic_info()
    id2label = {int(r["Topic"]): str(r["Name"]) for _, r in info.iterrows()}

    with get_conn() as c, c.cursor() as cur:
        for vid, t, p in zip(ids, topics, probs):
            label = id2label.get(int(t), f"Topic {t}")[:255]
            cur.execute(
                "INSERT INTO topics(video_id,topic_id,topic_label,probability) VALUES(%s,%s,%s,%s) "
                "ON DUPLICATE KEY UPDATE topic_id=VALUES(topic_id), topic_label=VALUES(topic_label), probability=VALUES(probability)",
                (vid, int(t), label, float(p) if p is not None else None)
            )

def task_sentiment(**_):
    # 더 안정적인 감정 분석: 간단한 모델 사용
    from transformers import pipeline
    import torch

    ensure_nlp_tables()

    # 댓글 로드
    with get_conn() as c, c.cursor() as cur:
        cur.execute("SELECT id,video_id,text FROM comments WHERE text IS NOT NULL AND text<>''")
        rows = cur.fetchall()
    if not rows: return

    # 더 안정적인 모델 사용 (SentencePiece 문제 회피)
    try:
        # 간단한 영어 감정 분석 모델
        pipe = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=-1,  # CPU 강제
            return_all_scores=True
        )
        print("[INFO] Using twitter-roberta-base-sentiment-latest")
    except Exception as e:
        print(f"[WARN] Primary model failed: {e}")
        try:
            # 대안: 더 기본적인 모델
            pipe = pipeline(
                "sentiment-analysis",
                model="nlptown/bert-base-multilingual-uncased-sentiment",
                device=-1,
                return_all_scores=True
            )
            print("[INFO] Using bert-base-multilingual-uncased-sentiment")
        except Exception as e2:
            print(f"[ERROR] All sentiment models failed: {e2}")
            return

    BATCH = 32  # 더 작은 배치로 안정성 향상
    to_ins = []
    for i in range(0, len(rows), BATCH):
        chunk = rows[i:i+BATCH]
        texts = [r[2] for r in chunk]
        try:
            # pipeline은 자동으로 배치 처리
            outs = pipe(texts, truncation=True, max_length=256, batch_size=BATCH)
        except Exception as e:
            print(f"[WARN] batch {i}-{i+len(chunk)} failed: {e}")
            continue

        for (cid, vid, _), result in zip(chunk, outs):
            if isinstance(result, list) and len(result) > 0:
                # return_all_scores=True인 경우
                scores = {s["label"].lower(): float(s["score"]) for s in result}
                lab_full = max(scores.items(), key=lambda x: x[1])[0]
            else:
                # 단일 결과인 경우
                lab_full = result["label"].lower()
                scores = {lab_full: float(result["score"])}
            
            # 표준 축약 라벨
            lab = "pos" if lab_full.startswith("pos") else ("neg" if lab_full.startswith("neg") else "neu")
            sc = scores.get(lab_full, 0.5)
            to_ins.append((cid, vid, lab, sc))

    with get_conn() as c, c.cursor() as cur:
        for cid, vid, lab, sc in to_ins:
            cur.execute(
                "INSERT INTO comment_sentiment(comment_id,video_id,label,score) VALUES(%s,%s,%s,%s) "
                "ON DUPLICATE KEY UPDATE label=VALUES(label), score=VALUES(score)",
                (cid, vid, lab, sc)
            )
        # 집계 갱신
        cur.execute("DELETE FROM video_sentiment_agg")
        cur.execute("""
        INSERT INTO video_sentiment_agg(video_id,pos,neu,neg,n)
        SELECT video_id,
               AVG(label='pos'), AVG(label='neu'), AVG(label='neg'), COUNT(*)
        FROM comment_sentiment
        GROUP BY video_id
        """)

# ------- DAG -------
default_args = {"owner":"airflow","retries":0}
with DAG(
    dag_id="youtube_nlp",
    default_args=default_args,
    start_date=datetime(2025,10,1),
    schedule=None,
    catchup=False,
    tags=["nlp","recommend","topic","sentiment"],
) as dag:

    recommendations = PythonOperator(
        task_id="build_recommendations",
        python_callable=task_recommendations,
    )
    topics = PythonOperator(
        task_id="build_topics",
        python_callable=task_topics,
    )
    sentiment = PythonOperator(
        task_id="analyze_sentiment",
        python_callable=task_sentiment,
    )

    recommendations >> [topics, sentiment]