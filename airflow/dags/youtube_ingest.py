import os, json, time, requests, pymysql
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

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

def ensure_tables():
    ddl_videos = """
    CREATE TABLE IF NOT EXISTS videos (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255),
      channel_id VARCHAR(64),
      published_at DATETIME,
      INDEX(channel_id)
    );
    """
    ddl_comments = """
    CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(128) PRIMARY KEY,
      video_id VARCHAR(64),
      author VARCHAR(128),
      text LONGTEXT,
      published_at DATETIME,
      INDEX(video_id),
      CONSTRAINT fk_comments_video FOREIGN KEY (video_id) REFERENCES videos(id)
    );
    """
    with get_mysql_conn() as conn, conn.cursor() as cur:
        cur.execute(ddl_videos)
        cur.execute(ddl_comments)

def fetch_videos_and_comments(**context):
    conf = context.get("dag_run").conf or {}
    keyword = conf.get("keyword") or "여행"

    # 1) YouTube Search API
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "maxResults": 20,
        "type": "video",
        "q": keyword,
        "key": YOUTUBE_API_KEY,
        "order": "relevance",
    }

    items = []
    page_token = None
    for _ in range(3):  # 3페이지까지만 예시
        if page_token:
            params["pageToken"] = page_token
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        items.extend(data.get("items", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
        time.sleep(0.2)

    # 2) DB 적재
    ensure_tables()
    with get_mysql_conn() as conn, conn.cursor() as cur:
        for it in items:
            vid = it["id"]["videoId"]
            sn  = it["snippet"]
            title = sn.get("title", "")[:255]
            channel_id = sn.get("channelId", "")[:64]
            published_at = sn.get("publishedAt", None)
            # ISO → DATETIME
            if published_at:
                try:
                    published_at = datetime.fromisoformat(published_at.replace("Z","+00:00"))
                except Exception:
                    published_at = None

            # upsert videos
            cur.execute("""
            INSERT INTO videos (id, title, channel_id, published_at)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                title=VALUES(title),
                channel_id=VALUES(channel_id),
                published_at=VALUES(published_at)
            """, (vid, title, channel_id, published_at))

            # (선택) 댓글 일부 수집 - CommentThreads
            c_url = "https://www.googleapis.com/youtube/v3/commentThreads"
            c_params = {
                "part": "snippet",
                "videoId": vid,
                "maxResults": 20,
                "textFormat": "plainText",
                "key": YOUTUBE_API_KEY,
            }
            try:
                cr = requests.get(c_url, params=c_params, timeout=30)
                if cr.status_code == 200:
                    cdata = cr.json()
                    for ct in cdata.get("items", []):
                        top = ct["snippet"]["topLevelComment"]["snippet"]
                        cid = ct["id"]
                        author = (top.get("authorDisplayName") or "")[:128]
                        text   = top.get("textDisplay") or ""
                        ctime  = top.get("publishedAt")
                        if ctime:
                            try:
                                ctime = datetime.fromisoformat(ctime.replace("Z","+00:00"))
                            except Exception:
                                ctime = None
                        cur.execute("""
                        INSERT INTO comments (id, video_id, author, text, published_at)
                        VALUES (%s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            author=VALUES(author),
                            text=VALUES(text),
                            published_at=VALUES(published_at)
                        """, (cid, vid, author, text, ctime))
                time.sleep(0.1)
            except Exception as e:
                print(f"[WARN] comments fetch failed for {vid}: {e}")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "retries": 0,
}

with DAG(
    dag_id="youtube_ingest",
    default_args=default_args,
    start_date=datetime(2025, 10, 1),
    schedule=None,  # 수동 트리거
    catchup=False,
    tags=["youtube", "ingest"],
) as dag:
    ingest = PythonOperator(
        task_id="fetch_videos_and_comments",
        python_callable=fetch_videos_and_comments,
        provide_context=True,
    )
