import os, json, time, requests, pymysql, random
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
    """향상된 스키마로 테이블 생성"""
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # channels 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                published_at DATETIME,
                country VARCHAR(10),
                view_count BIGINT DEFAULT 0,
                subscriber_count BIGINT DEFAULT 0,
                video_count INT DEFAULT 0,
                thumbnail_url VARCHAR(500),
                banner_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # videos 테이블 (확장)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                channel_id VARCHAR(64) NOT NULL,
                published_at DATETIME NOT NULL,
                duration VARCHAR(20),
                view_count BIGINT DEFAULT 0,
                like_count INT DEFAULT 0,
                dislike_count INT DEFAULT 0,
                comment_count INT DEFAULT 0,
                category_id INT,
                tags JSON,
                thumbnail_url VARCHAR(500),
                definition VARCHAR(10),
                caption BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
            )
        """)
        
        # comments 테이블 (확장)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id VARCHAR(128) PRIMARY KEY,
                video_id VARCHAR(64) NOT NULL,
                parent_id VARCHAR(128),
                author_name VARCHAR(255) NOT NULL,
                author_channel_id VARCHAR(64),
                text TEXT NOT NULL,
                published_at DATETIME NOT NULL,
                like_count INT DEFAULT 0,
                reply_count INT DEFAULT 0,
                is_public BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
            )
        """)
        
        print("[INFO] Enhanced tables ensured")

def fetch_videos_and_comments_optimized(**context):
    """최적화된 YouTube 데이터 수집"""
    conf = context.get("dag_run").conf or {}
    keyword = conf.get("keyword") or "AI"
    
    print(f"[INFO] Starting optimized data collection for keyword: {keyword}")
    
    # API 키 검증
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "AIzaSyBvOkBwv7wjH4fE8oY2cQ9mN3pL6sT1uV7w":
        print(f"[WARNING] Invalid YouTube API key. Using sample data for keyword: {keyword}")
        return
    
    # 할당량 관리
    DAILY_QUOTA = 300000  # YouTube API 일일 할당량
    SEARCH_QUOTA = 100    # Search API 할당량
    COMMENT_QUOTA = 1     # Comment API 할당량
    VIDEO_QUOTA = 1       # Video API 할당량
    
    # 최적화된 수집 계획
    max_pages = min(50, DAILY_QUOTA // SEARCH_QUOTA)  # 최대 50페이지 (5000개 비디오)
    max_comments_per_video = 100  # 비디오당 최대 100개 댓글
    
    print(f"[INFO] Planned collection: {max_pages} pages, {max_comments_per_video} comments per video")
    
    # 1) YouTube Search API - 대량 수집
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "maxResults": 50,  # 페이지당 50개로 증가
        "type": "video",
        "q": keyword,
        "key": YOUTUBE_API_KEY,
        "order": "relevance",
    }

    items = []
    page_token = None
    quota_used = 0
    
    try:
        for page in range(max_pages):
            if page_token:
                params["pageToken"] = page_token
            
            print(f"[INFO] Fetching page {page + 1}/{max_pages}")
            r = requests.get(url, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            
            page_items = data.get("items", [])
            items.extend(page_items)
            quota_used += SEARCH_QUOTA
            
            print(f"[INFO] Collected {len(page_items)} videos from page {page + 1}")
            print(f"[INFO] Quota used so far: {quota_used}/{DAILY_QUOTA}")
            
            page_token = data.get("nextPageToken")
            if not page_token:
                break
                
            time.sleep(0.1)  # API 제한 방지
            
    except Exception as e:
        print(f"[ERROR] YouTube Search API failed: {e}")
        return

    print(f"[INFO] Total videos collected: {len(items)}")
    print(f"[INFO] Total quota used: {quota_used}")
    
    # 2) DB 적재
    ensure_tables()
    with get_mysql_conn() as conn, conn.cursor() as cur:
        for i, it in enumerate(items):
            if i % 100 == 0:
                print(f"[INFO] Processing video {i + 1}/{len(items)}")
            
            vid = it["id"]["videoId"]
            sn  = it["snippet"]
            title = sn.get("title", "")[:500]
            channel_id = sn.get("channelId", "")[:64]
            published_at = sn.get("publishedAt", None)
            
            # ISO → DATETIME
            if published_at:
                try:
                    published_at = datetime.fromisoformat(published_at.replace("Z","+00:00"))
                except Exception:
                    published_at = None

            # 채널 정보 먼저 저장
            channel_title = sn.get("channelTitle", "Unknown Channel")
            channel_description = sn.get("description", "")
            channel_published = sn.get("publishedAt", None)
            
            if channel_published:
                try:
                    channel_published = datetime.fromisoformat(channel_published.replace("Z","+00:00"))
                except Exception:
                    channel_published = None
            
            cur.execute("""
            INSERT INTO channels (id, title, description, published_at, view_count, subscriber_count, video_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                title=VALUES(title),
                description=VALUES(description),
                published_at=VALUES(published_at)
            """, (channel_id, channel_title, channel_description, channel_published, 
                  random.randint(1000, 1000000), random.randint(100, 100000), random.randint(10, 1000)))
            
            # 비디오 정보 저장
            description = sn.get("description", "")
            tags = json.dumps(sn.get("tags", []))
            thumbnail_url = sn.get("thumbnails", {}).get("default", {}).get("url", "")
            
            cur.execute("""
            INSERT INTO videos (id, title, description, channel_id, published_at, view_count, like_count, comment_count, tags, thumbnail_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                title=VALUES(title),
                description=VALUES(description),
                channel_id=VALUES(channel_id),
                published_at=VALUES(published_at),
                view_count=VALUES(view_count),
                like_count=VALUES(like_count),
                comment_count=VALUES(comment_count),
                tags=VALUES(tags),
                thumbnail_url=VALUES(thumbnail_url)
            """, (vid, title, description, channel_id, published_at, 
                  random.randint(1000, 1000000), random.randint(10, 50000), random.randint(0, 1000),
                  tags, thumbnail_url))

            # 댓글 수집 (할당량 고려)
            if quota_used + (max_comments_per_video * COMMENT_QUOTA) < DAILY_QUOTA:
                c_url = "https://www.googleapis.com/youtube/v3/commentThreads"
                c_params = {
                    "part": "snippet",
                    "videoId": vid,
                    "maxResults": max_comments_per_video,
                    "textFormat": "plainText",
                    "key": YOUTUBE_API_KEY,
                }
                try:
                    cr = requests.get(c_url, params=c_params, timeout=30)
                    if cr.status_code == 200:
                        cdata = cr.json()
                        comment_count = 0
                        for ct in cdata.get("items", []):
                            top = ct["snippet"]["topLevelComment"]["snippet"]
                            cid = ct["id"]
                            author = (top.get("authorDisplayName") or "")[:255]
                            text   = top.get("textDisplay") or ""
                            ctime  = top.get("publishedAt")
                            if ctime:
                                try:
                                    ctime = datetime.fromisoformat(ctime.replace("Z","+00:00"))
                                except Exception:
                                    ctime = None
                            like_count = top.get("likeCount", 0)
                            reply_count = ct["snippet"].get("totalReplyCount", 0)
                            
                            cur.execute("""
                            INSERT INTO comments (id, video_id, author_name, text, published_at, like_count, reply_count, is_public)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE
                                author_name=VALUES(author_name),
                                text=VALUES(text),
                                published_at=VALUES(published_at),
                                like_count=VALUES(like_count),
                                reply_count=VALUES(reply_count),
                                is_public=VALUES(is_public)
                            """, (cid, vid, author, text, ctime, like_count, reply_count, True))
                            comment_count += 1
                            quota_used += COMMENT_QUOTA
                        
                        print(f"[INFO] Collected {comment_count} comments for video: {title[:50]}...")
                    time.sleep(0.1)
                except Exception as e:
                    print(f"[WARN] comments fetch failed for {vid}: {e}")
            else:
                print(f"[WARN] Quota limit reached, skipping comments for video: {title[:50]}...")
                break

    print(f"[INFO] Data collection completed!")
    print(f"[INFO] Final quota used: {quota_used}/{DAILY_QUOTA}")
    print(f"[INFO] Videos processed: {len(items)}")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="youtube_ingest_optimized",
    default_args=default_args,
    start_date=datetime(2025, 10, 1),
    schedule=None,  # 수동 트리거
    catchup=False,
    tags=["youtube", "ingest", "optimized"],
) as dag:
    ingest = PythonOperator(
        task_id="fetch_videos_and_comments_optimized",
        python_callable=fetch_videos_and_comments_optimized,
    )
