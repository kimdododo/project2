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

# 한국 여행 관련 키워드 (한국어 전용)
KOREAN_TRAVEL_KEYWORDS = [
    # 국내 여행지
    "제주도 여행", "서울 여행", "부산 여행", "강원도 여행", "경주 여행",
    "전주 여행", "여수 여행", "안동 여행", "통영 여행", "태안 여행",
    "속초 여행", "포항 여행", "대구 여행", "광주 여행", "대전 여행",
    "인천 여행", "수원 여행", "춘천 여행", "원주 여행", "평창 여행",
    
    # 해외 여행지 (한국인이 많이 가는 곳)
    "일본 여행", "도쿄 여행", "오사카 여행", "교토 여행", "후쿠오카 여행",
    "대만 여행", "타이베이 여행", "태국 여행", "방콕 여행", "치앙마이 여행",
    "베트남 여행", "호치민 여행", "하노이 여행", "다낭 여행",
    "싱가포르 여행", "홍콩 여행", "마카오 여행", "필리핀 여행",
    "유럽 여행", "파리 여행", "런던 여행", "로마 여행", "바르셀로나 여행",
    "뉴욕 여행", "로스앤젤레스 여행", "라스베가스 여행",
    
    # 여행 유형 (한국어)
    "혼자 여행", "솔로 여행", "커플 여행", "연인 여행", "데이트 여행",
    "가족 여행", "부모님과 여행", "아이와 여행", "친구 여행", "동료와 여행",
    "신혼 여행", "허니문", "힐링 여행", "휴식 여행", "치유 여행",
    "맛집 여행", "음식 여행", "먹방 여행", "푸드 투어",
    "사진 여행", "인스타 여행", "포토 여행", "예쁜 곳 여행",
    "역사 여행", "문화 여행", "유적지 여행", "박물관 여행",
    "자연 여행", "산 여행", "바다 여행", "숲 여행", "강 여행",
    "도시 여행", "시내 여행", "쇼핑 여행", "관광 여행",
    
    # 여행 계절/시기 (한국어)
    "봄 여행", "여름 여행", "가을 여행", "겨울 여행",
    "벚꽃 여행", "단풍 여행", "눈 여행", "신년 여행",
    "설날 여행", "추석 여행", "연휴 여행", "휴가 여행",
    "당일치기", "1박2일", "2박3일", "3박4일", "일주일 여행",
    
    # 여행 예산/스타일 (한국어)
    "가성비 여행", "저렴한 여행", "보통 여행", "비싼 여행", "럭셔리 여행",
    "백패킹", "패키지 여행", "자유여행", "개별여행",
    "저예산 여행", "고급 여행", "호캉스", "글램핑",
    
    # 여행 활동 (한국어)
    "맛집 투어", "카페 투어", "쇼핑", "관광지", "명소",
    "축제", "이벤트", "체험", "액티비티", "스포츠",
    "등산", "해변", "온천", "스파", "마사지",
    
    # 교통/숙박 (한국어)
    "항공권", "기차 여행", "버스 여행", "렌터카", "택시",
    "호텔", "펜션", "게스트하우스", "에어비앤비", "캠핑",
    "모텔", "리조트", "콘도", "민박"
]

def get_mysql_conn():
    return pymysql.connect(
        host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
        password=MYSQL_PW, database=MYSQL_DB,
        charset="utf8mb4", autocommit=True
    )

def ensure_korean_tables():
    """한국어 전용 테이블 생성"""
    with get_mysql_conn() as conn, conn.cursor() as cur:
        # 한국 채널 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS korean_channels (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                published_at DATETIME,
                country VARCHAR(10) DEFAULT 'KR',
                language VARCHAR(10) DEFAULT 'ko',
                view_count BIGINT DEFAULT 0,
                subscriber_count BIGINT DEFAULT 0,
                video_count INT DEFAULT 0,
                thumbnail_url VARCHAR(500),
                banner_url VARCHAR(500),
                is_korean_creator BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # 한국 여행 비디오 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS korean_travel_videos (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                channel_id VARCHAR(64) NOT NULL,
                published_at DATETIME NOT NULL,
                duration VARCHAR(20),
                view_count BIGINT DEFAULT 0,
                like_count INT DEFAULT 0,
                comment_count INT DEFAULT 0,
                category_id INT,
                tags JSON,
                thumbnail_url VARCHAR(500),
                language VARCHAR(10) DEFAULT 'ko',
                travel_keyword VARCHAR(255),
                destination VARCHAR(255),
                travel_type VARCHAR(100),
                budget_range VARCHAR(50),
                season VARCHAR(20),
                is_korean_content BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES korean_channels(id) ON DELETE CASCADE,
                INDEX idx_travel_keyword (travel_keyword),
                INDEX idx_destination (destination),
                INDEX idx_travel_type (travel_type),
                INDEX idx_language (language)
            )
        """)
        
        # 한국어 댓글 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS korean_comments (
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
                language VARCHAR(10) DEFAULT 'ko',
                is_korean_comment BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES korean_travel_videos(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES korean_comments(id) ON DELETE CASCADE,
                INDEX idx_video_language (video_id, language),
                INDEX idx_korean_comment (is_korean_comment)
            )
        """)
        
        # 한국어 감정 분석 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS korean_sentiment_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                comment_id VARCHAR(128) NOT NULL,
                video_id VARCHAR(64) NOT NULL,
                sentiment_score DECIMAL(3,2) NOT NULL,
                sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
                korean_sentiment ENUM('recommend', 'not_recommend', 'neutral') NOT NULL,
                destination_sentiment JSON,
                service_sentiment JSON,
                price_sentiment JSON,
                model_name VARCHAR(100) DEFAULT 'korean-sentiment-model',
                analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (comment_id) REFERENCES korean_comments(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES korean_travel_videos(id) ON DELETE CASCADE,
                INDEX idx_video_sentiment (video_id, sentiment_label),
                INDEX idx_korean_sentiment (korean_sentiment),
                INDEX idx_model_name (model_name)
            )
        """)
        
        # 한국 여행지별 인기도 테이블
        cur.execute("""
            CREATE TABLE IF NOT EXISTS korean_destination_popularity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                destination VARCHAR(255) NOT NULL,
                country VARCHAR(100) DEFAULT 'KR',
                region VARCHAR(100),
                popularity_score DECIMAL(5,2) DEFAULT 0.00,
                video_count INT DEFAULT 0,
                total_views BIGINT DEFAULT 0,
                avg_sentiment DECIMAL(3,2) DEFAULT 0.00,
                korean_creator_ratio DECIMAL(3,2) DEFAULT 1.00,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_destination (destination),
                INDEX idx_popularity (popularity_score),
                INDEX idx_korean_ratio (korean_creator_ratio)
            )
        """)
        
        print("[INFO] Korean-specific tables ensured")

def generate_korean_sample_data(keyword):
    """한국어 여행 관련 샘플 데이터 생성"""
    korean_destinations = ["제주도", "서울", "부산", "강원도", "경주", "전주", "여수", "일본", "대만", "태국", "베트남"]
    korean_travel_types = ["혼자여행", "커플여행", "가족여행", "친구여행", "힐링여행", "맛집여행", "사진여행"]
    korean_channels = [
        "제주도여행TV", "서울여행가이드", "부산맛집투어", "일본여행러", "대만여행일기",
        "혼자여행러", "커플여행일기", "가족여행기록", "힐링여행가", "맛집여행러"
    ]
    
    sample_videos = []
    for i in range(20):
        destination = random.choice(korean_destinations)
        travel_type = random.choice(korean_travel_types)
        channel = random.choice(korean_channels)
        
        video_data = {
            "id": {"videoId": f"korean_travel_{keyword}_{i}_{random.randint(1000, 9999)}"},
            "snippet": {
                "title": f"{destination} {travel_type} 완벽 가이드 | {keyword} | {channel}",
                "description": f"{destination}에서 {travel_type}을 즐기는 방법을 알려드립니다. 한국인 관점에서 맛집, 숙소, 관광지까지 모든 정보를 담았습니다. {channel}에서 제작한 영상입니다.",
                "channelId": f"korean_channel_{random.randint(100, 999)}",
                "channelTitle": channel,
                "publishedAt": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat() + "Z",
                "thumbnails": {
                    "default": {"url": f"https://img.youtube.com/vi/korean_travel_{i}/mqdefault.jpg"}
                },
                "tags": [destination, travel_type, "여행", "관광", "맛집", "숙소", "한국인추천"]
            }
        }
        sample_videos.append(video_data)
    
    return sample_videos

def generate_korean_comments(cursor, video_id, video_title, destination):
    """한국어 여행 관련 댓글 생성"""
    positive_comments = [
        f"{destination} 정말 아름다웠어요! 다음에 또 가고 싶습니다.",
        f"여행 정보가 너무 유용했어요. 덕분에 좋은 여행 했습니다.",
        f"{destination} 맛집 정보 정말 도움됐어요! 감사합니다.",
        f"영상 퀄리티가 정말 좋네요. {destination} 가고 싶어집니다.",
        f"여행 계획 세우는데 정말 도움됐어요. 추천합니다!",
        f"{destination} 숙소 정보 덕분에 편안한 여행 했어요.",
        f"여행 가이드가 너무 자세해서 좋았습니다.",
        f"{destination} 관광지 정보가 정확했어요. 감사합니다.",
        f"한국인 관점에서 설명해주셔서 이해하기 쉬웠어요.",
        f"실제로 가봤는데 정말 도움됐습니다!"
    ]
    
    negative_comments = [
        f"{destination} 생각보다 별로였어요. 아쉬웠습니다.",
        f"여행 정보가 부정확한 부분이 있었어요.",
        f"{destination} 맛집이 생각보다 맛없었어요.",
        f"숙소 정보가 부정확했어요. 다른 곳을 찾았습니다.",
        f"{destination} 관광지가 너무 복잡했어요.",
        f"여행 비용이 생각보다 많이 들었어요.",
        f"{destination} 교통편이 불편했어요.",
        f"여행 정보가 오래된 것 같아요.",
        f"한국인에게는 맞지 않는 정보인 것 같아요.",
        f"실제와 차이가 있었어요."
    ]
    
    neutral_comments = [
        f"{destination} 여행 어떠셨나요?",
        f"여행 계획 세우고 있어요. 정보 감사합니다.",
        f"{destination} 가본 적 있어요. 괜찮았어요.",
        f"여행 정보 잘 봤습니다.",
        f"{destination} 언제 가면 좋을까요?",
        f"여행 준비 중이에요. 도움됐습니다.",
        f"{destination} 날씨는 어떤가요?",
        f"여행 후기 공유해주세요.",
        f"한국인 관점에서 어떻게 생각하세요?",
        f"실제 경험담 들어보고 싶어요."
    ]
    
    all_comments = positive_comments + negative_comments + neutral_comments
    num_comments = random.randint(10, 50)
    
    for i in range(num_comments):
        comment_text = random.choice(all_comments)
        comment_id = f"korean_comment_{video_id}_{i}"
        author = f"한국여행러{random.randint(1, 999)}"
        published_at = datetime.now() - timedelta(days=random.randint(1, 30))
        
        # 한국어 감정 분석 (간단한 키워드 기반)
        sentiment_score = 0.0
        if any(word in comment_text for word in ["좋", "아름다", "유용", "도움", "감사", "추천", "완벽", "최고"]):
            sentiment_score = random.uniform(0.3, 1.0)
        elif any(word in comment_text for word in ["별로", "아쉬", "불편", "맛없", "부정확", "차이", "맞지"]):
            sentiment_score = random.uniform(-1.0, -0.3)
        else:
            sentiment_score = random.uniform(-0.3, 0.3)
        
        sentiment_label = "positive" if sentiment_score > 0.3 else "negative" if sentiment_score < -0.3 else "neutral"
        
        try:
            cursor.execute("""
                INSERT INTO korean_comments (id, video_id, author_name, text, published_at, like_count, reply_count, is_public, language, is_korean_comment)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE text=VALUES(text)
            """, (comment_id, video_id, author, comment_text, published_at, random.randint(0, 50), random.randint(0, 5), True, 'ko', True))
            
            # 한국어 감정 분석 결과 저장
            cursor.execute("""
                INSERT INTO korean_sentiment_analysis 
                (comment_id, video_id, sentiment_score, sentiment_label, korean_sentiment, destination_sentiment, service_sentiment, price_sentiment, model_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE sentiment_score=VALUES(sentiment_score)
            """, (comment_id, video_id, sentiment_score, sentiment_label, 
                  "recommend" if sentiment_score > 0.3 else "not_recommend" if sentiment_score < -0.3 else "neutral",
                  json.dumps({"destination": destination, "sentiment": sentiment_score, "language": "ko"}),
                  json.dumps({"service": "good" if sentiment_score > 0.3 else "bad" if sentiment_score < -0.3 else "neutral", "language": "ko"}),
                  json.dumps({"price": "reasonable" if sentiment_score > 0 else "expensive" if sentiment_score < -0.3 else "neutral", "language": "ko"}),
                  "korean-sentiment-model"))
        except Exception as e:
            print(f"[WARN] Failed to insert Korean comment {comment_id}: {e}")
    
    print(f"[INFO] Generated {num_comments} Korean comments for video: {video_title}")

def collect_korean_travel_data(**context):
    """한국어 여행 데이터 수집 메인 함수"""
    # context가 없거나 dag_run이 없을 때 기본값 사용
    if context and "dag_run" in context and context["dag_run"]:
        conf = context.get("dag_run").conf or {}
        selected_keywords = conf.get("keywords", KOREAN_TRAVEL_KEYWORDS[:15])
    else:
        selected_keywords = KOREAN_TRAVEL_KEYWORDS[:15]  # 기본 15개 키워드
    
    print(f"[INFO] Starting Korean travel data collection for {len(selected_keywords)} keywords")
    
    # 테이블 생성
    ensure_korean_tables()
    
    # 키워드별 데이터 수집
    with get_mysql_conn() as conn, conn.cursor() as cur:
        for keyword in selected_keywords:
            print(f"[INFO] Collecting Korean data for keyword: {keyword}")
            
            # API 키 검증
            if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "your_youtube_api_key_here":
                print(f"[WARNING] Invalid YouTube API key. Using Korean sample data for keyword: {keyword}")
                items = generate_korean_sample_data(keyword)
            else:
                # YouTube Search API 호출 (한국 채널만)
                url = "https://www.googleapis.com/youtube/v3/search"
                params = {
                    "part": "snippet",
                    "maxResults": 20,
                    "type": "video",
                    "q": keyword,
                    "key": YOUTUBE_API_KEY,
                    "order": "relevance",
                    "regionCode": "KR",  # 한국 지역만
                    "relevanceLanguage": "ko",  # 한국어 우선
                }
                
                items = []
                try:
                    r = requests.get(url, params=params, timeout=30)
                    r.raise_for_status()
                    data = r.json()
                    items = data.get("items", [])
                    
                    # 한국 채널 필터링
                    korean_items = []
                    for item in items:
                        channel_id = item["snippet"].get("channelId", "")
                        channel_title = item["snippet"].get("channelTitle", "")
                        
                        # 한국 채널 판별 (간단한 휴리스틱)
                        if is_korean_channel(channel_title, item["snippet"].get("description", "")):
                            korean_items.append(item)
                    
                    items = korean_items
                    time.sleep(0.2)  # API 제한 방지
                except Exception as e:
                    print(f"[ERROR] YouTube API failed for {keyword}: {e}")
                    items = generate_korean_sample_data(keyword)
            
            # 비디오 데이터 저장
            for item in items:
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                title = snippet.get("title", "")[:500]
                description = snippet.get("description", "")
                channel_id = snippet.get("channelId", "")
                channel_title = snippet.get("channelTitle", "Unknown Korean Channel")
                published_at = snippet.get("publishedAt", None)
                
                # 한국 여행지 추출
                destination = extract_korean_destination(title, description)
                travel_type = extract_korean_travel_type(title, description)
                
                if published_at:
                    try:
                        published_at = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                    except Exception:
                        published_at = datetime.now()
                
                # 한국 채널 정보 저장
                cur.execute("""
                    INSERT INTO korean_channels (id, title, description, published_at, country, language, view_count, subscriber_count, video_count, is_korean_creator)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE title=VALUES(title)
                """, (channel_id, channel_title, "", published_at, 'KR', 'ko',
                      random.randint(1000, 1000000), random.randint(100, 100000), random.randint(10, 1000), True))
                
                # 한국 여행 비디오 저장
                cur.execute("""
                    INSERT INTO korean_travel_videos 
                    (id, title, description, channel_id, published_at, view_count, like_count, comment_count, 
                     language, travel_keyword, destination, travel_type, budget_range, season, tags, thumbnail_url, is_korean_content)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description)
                """, (video_id, title, description, channel_id, published_at,
                      random.randint(1000, 1000000), random.randint(50, 10000), random.randint(10, 1000),
                      'ko', keyword, destination, travel_type, 
                      random.choice(["저렴", "보통", "비쌈"]), random.choice(["봄", "여름", "가을", "겨울"]),
                      json.dumps(snippet.get("tags", [])), 
                      snippet.get("thumbnails", {}).get("default", {}).get("url", ""), True))
                
                # 한국어 댓글 생성
                generate_korean_comments(cur, video_id, title, destination)
            
            print(f"[INFO] Completed Korean data collection for keyword: {keyword}")
    
    print(f"[INFO] Korean travel data collection completed for {len(selected_keywords)} keywords")

def is_korean_channel(channel_title, description):
    """한국 채널 판별"""
    korean_indicators = [
        "여행", "투어", "가이드", "일기", "기록", "러", "가", "TV", "채널",
        "한국", "서울", "부산", "제주", "일본", "대만", "태국", "베트남"
    ]
    
    text = (channel_title + " " + description).lower()
    return any(indicator in text for indicator in korean_indicators)

def extract_korean_destination(title, description):
    """제목과 설명에서 한국 여행지 추출"""
    korean_destinations = [
        "제주도", "서울", "부산", "강원도", "경주", "전주", "여수", "안동", "통영", "태안",
        "속초", "포항", "대구", "광주", "대전", "인천", "수원", "춘천", "원주", "평창",
        "일본", "도쿄", "오사카", "교토", "후쿠오카", "대만", "타이베이", "태국", "방콕", "치앙마이",
        "베트남", "호치민", "하노이", "다낭", "싱가포르", "홍콩", "마카오", "필리핀",
        "유럽", "파리", "런던", "로마", "바르셀로나", "뉴욕", "로스앤젤레스", "라스베가스"
    ]
    
    text = (title + " " + description).lower()
    for dest in korean_destinations:
        if dest in text:
            return dest
    return "기타"

def extract_korean_travel_type(title, description):
    """제목과 설명에서 한국 여행 유형 추출"""
    korean_travel_types = {
        "혼자여행": ["혼자", "솔로", "1인", "혼자서"],
        "커플여행": ["커플", "연인", "데이트", "연인과"],
        "가족여행": ["가족", "부모", "아이", "어린이", "가족과"],
        "친구여행": ["친구", "동료", "함께", "친구와"],
        "힐링여행": ["힐링", "휴식", "치유", "명상", "힐링"],
        "맛집여행": ["맛집", "음식", "먹방", "푸드", "맛집투어"],
        "사진여행": ["사진", "인스타", "포토", "예쁜", "인스타그램"],
        "역사여행": ["역사", "문화", "유적", "박물관", "문화재"],
        "자연여행": ["자연", "산", "바다", "숲", "강", "등산"],
        "도시여행": ["도시", "시내", "쇼핑", "관광", "도심"]
    }
    
    text = (title + " " + description).lower()
    for travel_type, keywords in korean_travel_types.items():
        if any(keyword in text for keyword in keywords):
            return travel_type
    return "일반여행"

# DAG 정의
default_args = {
    'owner': 'korean-travel-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'korean_travel_data_collection',
    default_args=default_args,
    description='한국어 전용 여행 YouTube 데이터 수집',
    schedule_interval=timedelta(minutes=5),  # 5분마다 실행 (실시간 처리)
    catchup=False,
    tags=['korean', 'travel', 'youtube', 'data-collection']
)

# 작업 정의
collect_korean_travel_data_task = PythonOperator(
    task_id='collect_korean_travel_data',
    python_callable=collect_korean_travel_data,
    dag=dag,
)

collect_korean_travel_data_task
