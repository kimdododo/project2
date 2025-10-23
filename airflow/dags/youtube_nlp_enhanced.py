import os, json, time, requests, pymysql
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import LatentDirichletAllocation
from textblob import TextBlob
import joblib

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_DB   = os.getenv("MYSQL_DB", "yt")
MYSQL_USER = os.getenv("MYSQL_USER", "ytuser")
MYSQL_PW   = os.getenv("MYSQL_PW", "ytpw")

def get_mysql_conn():
    return pymysql.connect(
        host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
        password=MYSQL_PW, database=MYSQL_DB,
        charset="utf8mb4", autocommit=True
    )

def ensure_enhanced_tables():
    """향상된 테이블 구조 생성"""
    ddl_sentiment = """
    CREATE TABLE IF NOT EXISTS comment_sentiment (
        comment_id VARCHAR(128) PRIMARY KEY,
        video_id VARCHAR(64) NOT NULL,
        label VARCHAR(32) NOT NULL,
        score FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(video_id)
    );
    """
    
    ddl_topics = """
    CREATE TABLE IF NOT EXISTS topics (
        video_id VARCHAR(64) NOT NULL,
        topic_id INT NOT NULL,
        topic_label VARCHAR(255) NOT NULL,
        probability FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (video_id, topic_id),
        INDEX(video_id)
    );
    """
    
    ddl_video_sentiment_agg = """
    CREATE TABLE IF NOT EXISTS video_sentiment_agg (
        video_id VARCHAR(64) PRIMARY KEY,
        pos FLOAT NOT NULL DEFAULT 0,
        neu FLOAT NOT NULL DEFAULT 0,
        neg FLOAT NOT NULL DEFAULT 0,
        n INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """
    
    ddl_model_versions = """
    CREATE TABLE IF NOT EXISTS model_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_type VARCHAR(50) NOT NULL,
        version VARCHAR(20) NOT NULL,
        accuracy FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT FALSE
    );
    """
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        cur.execute(ddl_sentiment)
        cur.execute(ddl_topics)
        cur.execute(ddl_video_sentiment_agg)
        cur.execute(ddl_model_versions)

def analyze_sentiment(**context):
    """댓글 감정 분석"""
    print("[INFO] Starting sentiment analysis...")
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 댓글 데이터 조회
        cur.execute("""
            SELECT id, video_id, text 
            FROM comments 
            WHERE text IS NOT NULL AND text != ''
            ORDER BY published_at DESC
            LIMIT 1000
        """)
        
        comments = cur.fetchall()
        print(f"[INFO] Processing {len(comments)} comments...")
        
        for comment_id, video_id, text in comments:
            try:
                # TextBlob을 사용한 감정 분석
                blob = TextBlob(text)
                polarity = blob.sentiment.polarity
                
                # 감정 라벨 결정
                if polarity > 0.1:
                    label = "pos"
                elif polarity < -0.1:
                    label = "neg"
                else:
                    label = "neu"
                
                # 점수 정규화 (0-1 범위)
                score = (polarity + 1) / 2
                
                # DB에 저장
                cur.execute("""
                    INSERT INTO comment_sentiment (comment_id, video_id, label, score)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        label = VALUES(label),
                        score = VALUES(score)
                """, (comment_id, video_id, label, score))
                
            except Exception as e:
                print(f"[WARN] Failed to analyze comment {comment_id}: {e}")
        
        print("[INFO] Sentiment analysis completed")

def aggregate_video_sentiment(**context):
    """비디오별 감정 분석 집계"""
    print("[INFO] Aggregating video sentiment...")
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 비디오별 감정 분석 집계
        cur.execute("""
            SELECT 
                video_id,
                AVG(CASE WHEN label = 'pos' THEN score ELSE 0 END) as pos,
                AVG(CASE WHEN label = 'neu' THEN score ELSE 0 END) as neu,
                AVG(CASE WHEN label = 'neg' THEN score ELSE 0 END) as neg,
                COUNT(*) as n
            FROM comment_sentiment
            GROUP BY video_id
        """)
        
        sentiment_data = cur.fetchall()
        print(f"[INFO] Aggregating sentiment for {len(sentiment_data)} videos...")
        
        for video_id, pos, neu, neg, n in sentiment_data:
            cur.execute("""
                INSERT INTO video_sentiment_agg (video_id, pos, neu, neg, n)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    pos = VALUES(pos),
                    neu = VALUES(neu),
                    neg = VALUES(neg),
                    n = VALUES(n)
            """, (video_id, pos, neu, neg, n))
        
        print("[INFO] Video sentiment aggregation completed")

def extract_topics(**context):
    """토픽 모델링"""
    print("[INFO] Starting topic extraction...")
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 비디오별 댓글 텍스트 수집
        cur.execute("""
            SELECT v.id, GROUP_CONCAT(c.text SEPARATOR ' ') as combined_text
            FROM videos v
            LEFT JOIN comments c ON v.id = c.video_id
            WHERE c.text IS NOT NULL AND c.text != ''
            GROUP BY v.id
            HAVING combined_text IS NOT NULL
        """)
        
        video_texts = cur.fetchall()
        print(f"[INFO] Processing topics for {len(video_texts)} videos...")
        
        if len(video_texts) < 5:
            print("[WARN] Not enough data for topic modeling")
            return
        
        # 텍스트 전처리
        texts = []
        video_ids = []
        
        for video_id, combined_text in video_texts:
            if combined_text and len(combined_text.strip()) > 10:
                texts.append(combined_text)
                video_ids.append(video_id)
        
        if len(texts) < 5:
            print("[WARN] Not enough text data for topic modeling")
            return
        
        # TF-IDF 벡터화
        vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # LDA 토픽 모델링
        n_topics = min(5, len(texts))
        lda = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=10
        )
        
        lda.fit(tfidf_matrix)
        
        # 토픽 라벨 생성
        feature_names = vectorizer.get_feature_names_out()
        topic_labels = []
        
        for topic_idx, topic in enumerate(lda.components_):
            top_words_idx = topic.argsort()[-5:][::-1]
            top_words = [feature_names[i] for i in top_words_idx]
            topic_label = " ".join(top_words)
            topic_labels.append(topic_label)
        
        # 비디오별 토픽 확률 저장
        topic_probs = lda.transform(tfidf_matrix)
        
        for i, video_id in enumerate(video_ids):
            for topic_idx, prob in enumerate(topic_probs[i]):
                if prob > 0.1:  # 임계값 이상의 확률만 저장
                    cur.execute("""
                        INSERT INTO topics (video_id, topic_id, topic_label, probability)
                        VALUES (%s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            topic_label = VALUES(topic_label),
                            probability = VALUES(probability)
                    """, (video_id, topic_idx, topic_labels[topic_idx], float(prob)))
        
        print("[INFO] Topic extraction completed")

def retrain_models(**context):
    """모델 재학습"""
    print("[INFO] Starting model retraining...")
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 최신 데이터 수집
        cur.execute("""
            SELECT c.text, cs.label, cs.score
            FROM comments c
            JOIN comment_sentiment cs ON c.id = cs.comment_id
            WHERE c.text IS NOT NULL AND c.text != ''
            ORDER BY c.published_at DESC
            LIMIT 5000
        """)
        
        training_data = cur.fetchall()
        print(f"[INFO] Training with {len(training_data)} samples...")
        
        if len(training_data) < 100:
            print("[WARN] Not enough training data")
            return
        
        # 데이터 준비
        texts = [row[0] for row in training_data]
        labels = [row[1] for row in training_data]
        
        # TF-IDF 벡터화
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        X = vectorizer.fit_transform(texts)
        
        # 간단한 분류기 (실제로는 더 복잡한 모델 사용)
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, labels, test_size=0.2, random_state=42
        )
        
        # 모델 학습
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 정확도 계산
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"[INFO] Model accuracy: {accuracy:.3f}")
        
        # 모델 버전 저장
        model_version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        cur.execute("""
            INSERT INTO model_versions (model_type, version, accuracy, is_active)
            VALUES (%s, %s, %s, %s)
        """, ("sentiment_classifier", model_version, accuracy, True))
        
        # 기존 모델 비활성화
        cur.execute("""
            UPDATE model_versions 
            SET is_active = FALSE 
            WHERE model_type = 'sentiment_classifier' AND version != %s
        """, (model_version,))
        
        # 모델 저장 (실제로는 파일 시스템이나 모델 저장소에 저장)
        model_path = f"/tmp/sentiment_model_{model_version}.joblib"
        joblib.dump({
            'model': model,
            'vectorizer': vectorizer,
            'version': model_version,
            'accuracy': accuracy
        }, model_path)
        
        print(f"[INFO] Model saved to {model_path}")
        print("[INFO] Model retraining completed")

def normalize_data(**context):
    """데이터 정규화"""
    print("[INFO] Starting data normalization...")
    
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 채널 정보 정규화
        cur.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 고유 채널 추출 및 정규화
        cur.execute("""
            INSERT IGNORE INTO channels (id, name)
            SELECT DISTINCT channel_id, CONCAT('Channel_', channel_id) as name
            FROM videos
            WHERE channel_id IS NOT NULL
        """)
        
        # 비디오 통계 정규화
        cur.execute("""
            CREATE TABLE IF NOT EXISTS video_stats (
                video_id VARCHAR(64) PRIMARY KEY,
                view_count BIGINT DEFAULT 0,
                like_count INT DEFAULT 0,
                comment_count INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # 댓글 수 집계
        cur.execute("""
            INSERT INTO video_stats (video_id, comment_count)
            SELECT video_id, COUNT(*) as comment_count
            FROM comments
            GROUP BY video_id
            ON DUPLICATE KEY UPDATE
                comment_count = VALUES(comment_count)
        """)
        
        print("[INFO] Data normalization completed")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="youtube_nlp_enhanced",
    default_args=default_args,
    start_date=datetime(2025, 1, 1),
    schedule_interval=timedelta(hours=6),  # 6시간마다 실행
    catchup=False,
    tags=["youtube", "nlp", "ml"],
) as dag:
    
    # 테이블 생성
    create_tables = PythonOperator(
        task_id="ensure_enhanced_tables",
        python_callable=ensure_enhanced_tables,
    )
    
    # 데이터 정규화
    normalize = PythonOperator(
        task_id="normalize_data",
        python_callable=normalize_data,
    )
    
    # 감정 분석
    sentiment_analysis = PythonOperator(
        task_id="analyze_sentiment",
        python_callable=analyze_sentiment,
    )
    
    # 감정 분석 집계
    sentiment_aggregation = PythonOperator(
        task_id="aggregate_video_sentiment",
        python_callable=aggregate_video_sentiment,
    )
    
    # 토픽 추출
    topic_extraction = PythonOperator(
        task_id="extract_topics",
        python_callable=extract_topics,
    )
    
    # 모델 재학습
    model_retraining = PythonOperator(
        task_id="retrain_models",
        python_callable=retrain_models,
    )
    
    # 의존성 설정
    create_tables >> normalize
    normalize >> [sentiment_analysis, topic_extraction]
    sentiment_analysis >> sentiment_aggregation
    [sentiment_aggregation, topic_extraction] >> model_retraining
