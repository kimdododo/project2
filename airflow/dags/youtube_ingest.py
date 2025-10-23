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
        
        # channel_growth 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS channel_growth (
                id INT AUTO_INCREMENT PRIMARY KEY,
                channel_id VARCHAR(64) NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                subscriber_count BIGINT NOT NULL,
                view_count BIGINT NOT NULL,
                video_count INT NOT NULL,
                growth_rate DECIMAL(5,2) DEFAULT 0.00,
                FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
            )
        """)
        
        # sentiment_analysis 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sentiment_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                comment_id VARCHAR(128) NOT NULL,
                video_id VARCHAR(64) NOT NULL,
                sentiment_score DECIMAL(3,2) NOT NULL,
                sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
                confidence DECIMAL(3,2) DEFAULT 0.00,
                emotion_tags JSON,
                analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
            )
        """)
        
        # video_sentiment_agg 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS video_sentiment_agg (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id VARCHAR(64) NOT NULL,
                positive_count INT DEFAULT 0,
                negative_count INT DEFAULT 0,
                neutral_count INT DEFAULT 0,
                total_comments INT DEFAULT 0,
                avg_sentiment_score DECIMAL(3,2) DEFAULT 0.00,
                sentiment_ratio DECIMAL(3,2) DEFAULT 0.00,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
                UNIQUE KEY unique_video_sentiment (video_id)
            )
        """)
        
        print("[INFO] Enhanced tables ensured")

def generate_sample_data(keyword):
    """키워드에 따른 샘플 데이터 생성"""
    import random
    from datetime import datetime, timedelta
    
    # 키워드별 샘플 데이터
    sample_data = {
        "AI": [
            {"id": "ai_video_001", "title": f"Introduction to {keyword} - Complete Guide", "channel_id": "UC_AI_Channel"},
            {"id": "ai_video_002", "title": f"{keyword} Tutorial for Beginners", "channel_id": "UC_AI_Channel"},
            {"id": "ai_video_003", "title": f"Advanced {keyword} Techniques", "channel_id": "UC_AI_Channel"},
            {"id": "ai_video_004", "title": f"{keyword} in Real World Applications", "channel_id": "UC_AI_Channel"},
            {"id": "ai_video_005", "title": f"Future of {keyword} Technology", "channel_id": "UC_AI_Channel"},
        ],
        "Machine Learning": [
            {"id": "ml_video_001", "title": f"{keyword} Fundamentals", "channel_id": "UC_ML_Channel"},
            {"id": "ml_video_002", "title": f"Deep Learning with {keyword}", "channel_id": "UC_ML_Channel"},
            {"id": "ml_video_003", "title": f"{keyword} Algorithms Explained", "channel_id": "UC_ML_Channel"},
        ],
        "Python": [
            {"id": "py_video_001", "title": f"Learn {keyword} Programming", "channel_id": "UC_Python_Channel"},
            {"id": "py_video_002", "title": f"{keyword} for Data Science", "channel_id": "UC_Python_Channel"},
            {"id": "py_video_003", "title": f"Advanced {keyword} Concepts", "channel_id": "UC_Python_Channel"},
        ]
    }
    
    # 기본 데이터 (키워드가 없을 때)
    default_data = [
        {"id": "sample_001", "title": f"Amazing {keyword} Content", "channel_id": "UC_Sample_Channel"},
        {"id": "sample_002", "title": f"Best {keyword} Tutorial", "channel_id": "UC_Sample_Channel"},
        {"id": "sample_003", "title": f"{keyword} Tips and Tricks", "channel_id": "UC_Sample_Channel"},
    ]
    
    # 키워드에 맞는 데이터 선택
    videos = sample_data.get(keyword, default_data)
    
    # YouTube API 형식으로 변환
    items = []
    for i, video in enumerate(videos):
        # 랜덤 날짜 생성 (최근 30일 내)
        days_ago = random.randint(1, 30)
        published_at = datetime.now() - timedelta(days=days_ago)
        
        item = {
            "id": {"videoId": video["id"]},
            "snippet": {
                "title": video["title"],
                "channelId": video["channel_id"],
                "publishedAt": published_at.isoformat() + "Z",
                "description": f"This is a sample video about {keyword}. Great content for learning!",
                "thumbnails": {
                    "default": {"url": f"https://img.youtube.com/vi/{video['id']}/default.jpg"}
                }
            }
        }
        items.append(item)
    
    print(f"[INFO] Generated {len(items)} sample videos for keyword: {keyword}")
    return items

def generate_sample_comments(cursor, video_id, video_title):
    """영상에 대한 샘플 댓글 생성"""
    import random
    from datetime import datetime, timedelta
    
    # 댓글 템플릿
    comment_templates = [
        "Great video! Very informative.",
        "Thanks for sharing this content.",
        "This is exactly what I was looking for.",
        "Amazing explanation!",
        "Very helpful tutorial.",
        "Keep up the good work!",
        "This helped me a lot.",
        "Excellent content!",
        "I learned so much from this.",
        "Perfect explanation!",
        "This is so useful!",
        "Great job on this video.",
        "Very well explained.",
        "I love this channel!",
        "This is fantastic!",
    ]
    
    # 영상당 3-8개의 댓글 생성
    num_comments = random.randint(3, 8)
    
    for i in range(num_comments):
        comment_id = f"comment_{video_id}_{i+1}"
        author = f"User{random.randint(1, 100)}"
        text = random.choice(comment_templates)
        
        # 랜덤 날짜 (최근 7일 내)
        days_ago = random.randint(1, 7)
        published_at = datetime.now() - timedelta(days=days_ago)
        
        try:
            cursor.execute("""
            INSERT INTO comments (id, video_id, author_name, text, published_at, like_count, reply_count, is_public)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                author_name=VALUES(author_name),
                text=VALUES(text),
                published_at=VALUES(published_at),
                like_count=VALUES(like_count),
                reply_count=VALUES(reply_count),
                is_public=VALUES(is_public)
            """, (comment_id, video_id, author, text, published_at, random.randint(0, 50), random.randint(0, 5), True))
        except Exception as e:
            print(f"[WARN] Failed to insert comment {comment_id}: {e}")
    
    print(f"[INFO] Generated {num_comments} sample comments for video: {video_title}")

def fetch_videos_and_comments(**context):
    conf = context.get("dag_run").conf or {}
    keyword = conf.get("keyword") or "AI"
    
    # API 키 검증
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "AIzaSyBvOkBwv7wjH4fE8oY2cQ9mN3pL6sT1uV7w":
        print(f"[WARNING] Invalid YouTube API key. Using sample data for keyword: {keyword}")
        # 샘플 데이터 생성
        items = generate_sample_data(keyword)
    else:
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
        try:
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
        except Exception as e:
            print(f"[ERROR] YouTube API failed: {e}")
            print(f"[FALLBACK] Using sample data for keyword: {keyword}")
            items = generate_sample_data(keyword)

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
            
            # upsert videos (확장된 스키마)
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

            # 댓글 수집 (API 키가 유효한 경우에만)
            if YOUTUBE_API_KEY and YOUTUBE_API_KEY != "AIzaSyBvOkBwv7wjH4fE8oY2cQ9mN3pL6sT1uV7w":
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
                    time.sleep(0.1)
                except Exception as e:
                    print(f"[WARN] comments fetch failed for {vid}: {e}")
            else:
                # 샘플 댓글 생성
                generate_sample_comments(cur, vid, title)

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
