-- YouTube 분석을 위한 향상된 스키마
-- 채널 분석, 트렌드 분석, 감정 분석, 경쟁사 분석, 콘텐츠 최적화를 위한 테이블들

-- 1. 채널 분석 테이블
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subscriber_count (subscriber_count),
    INDEX idx_video_count (video_count),
    INDEX idx_published_at (published_at)
);

-- 2. 채널 성장률 추적 테이블
CREATE TABLE IF NOT EXISTS channel_growth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscriber_count BIGINT NOT NULL,
    view_count BIGINT NOT NULL,
    video_count INT NOT NULL,
    growth_rate DECIMAL(5,2) DEFAULT 0.00, -- 성장률 (%)
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_channel_recorded (channel_id, recorded_at),
    INDEX idx_growth_rate (growth_rate)
);

-- 3. 비디오 테이블 (기존 확장)
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    channel_id VARCHAR(64) NOT NULL,
    published_at DATETIME NOT NULL,
    duration VARCHAR(20), -- ISO 8601 duration format
    view_count BIGINT DEFAULT 0,
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    category_id INT,
    tags JSON, -- 태그 배열
    thumbnail_url VARCHAR(500),
    definition VARCHAR(10), -- hd, sd
    caption BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_channel_published (channel_id, published_at),
    INDEX idx_view_count (view_count),
    INDEX idx_like_count (like_count),
    INDEX idx_category (category_id),
    INDEX idx_published_at (published_at)
);

-- 4. 댓글 테이블 (기존 확장)
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(128) PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    parent_id VARCHAR(128), -- 답글인 경우 부모 댓글 ID
    author_name VARCHAR(255) NOT NULL,
    author_channel_id VARCHAR(64),
    text TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    like_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_video_published (video_id, published_at),
    INDEX idx_author (author_name),
    INDEX idx_like_count (like_count)
);

-- 5. 키워드 트렌드 분석 테이블
CREATE TABLE IF NOT EXISTS keyword_trends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    search_volume INT DEFAULT 0,
    competition_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 ~ 1.00
    trend_score DECIMAL(5,2) DEFAULT 0.00, -- 트렌드 점수
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_keyword_recorded (keyword, recorded_at),
    INDEX idx_trend_score (trend_score)
);

-- 6. 카테고리별 성과 테이블
CREATE TABLE IF NOT EXISTS category_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    total_videos INT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_likes BIGINT DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_recorded (category_id, recorded_at),
    INDEX idx_engagement_rate (avg_engagement_rate)
);

-- 7. 감정 분석 테이블
CREATE TABLE IF NOT EXISTS sentiment_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id VARCHAR(128) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    sentiment_score DECIMAL(3,2) NOT NULL, -- -1.00 ~ 1.00
    sentiment_label ENUM('positive', 'negative', 'neutral') NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.00, -- 신뢰도 0.00 ~ 1.00
    emotion_tags JSON, -- ['joy', 'anger', 'sadness', 'fear', 'surprise']
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    INDEX idx_video_sentiment (video_id, sentiment_label),
    INDEX idx_sentiment_score (sentiment_score),
    INDEX idx_analyzed_at (analyzed_at)
);

-- 8. 비디오별 감정 집계 테이블
CREATE TABLE IF NOT EXISTS video_sentiment_agg (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    positive_count INT DEFAULT 0,
    negative_count INT DEFAULT 0,
    neutral_count INT DEFAULT 0,
    total_comments INT DEFAULT 0,
    avg_sentiment_score DECIMAL(3,2) DEFAULT 0.00,
    sentiment_ratio DECIMAL(3,2) DEFAULT 0.00, -- positive/total
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_video_sentiment (video_id),
    INDEX idx_sentiment_ratio (sentiment_ratio)
);

-- 9. 경쟁사 분석 테이블
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target_channel_id VARCHAR(64) NOT NULL,
    competitor_channel_id VARCHAR(64) NOT NULL,
    similarity_score DECIMAL(3,2) DEFAULT 0.00, -- 유사도 점수
    content_overlap DECIMAL(3,2) DEFAULT 0.00, -- 콘텐츠 겹침 정도
    audience_overlap DECIMAL(3,2) DEFAULT 0.00, -- 시청자 겹침 정도
    competitive_index DECIMAL(3,2) DEFAULT 0.00, -- 경쟁 지수
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (competitor_channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_target_competitor (target_channel_id, competitor_channel_id),
    INDEX idx_similarity_score (similarity_score)
);

-- 10. 콘텐츠 최적화 테이블
CREATE TABLE IF NOT EXISTS content_optimization (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    optimal_publish_hour INT, -- 0-23
    optimal_publish_day INT, -- 0-6 (월-일)
    best_performing_tags JSON, -- 인기 태그 배열
    best_video_length INT, -- 초 단위
    best_category_id INT,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    view_velocity DECIMAL(8,2) DEFAULT 0.00, -- 조회수 증가 속도
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_channel_analyzed (channel_id, analyzed_at),
    INDEX idx_engagement_rate (engagement_rate)
);

-- 11. 태그 분석 테이블
CREATE TABLE IF NOT EXISTS tag_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255) NOT NULL,
    usage_count INT DEFAULT 0,
    avg_views BIGINT DEFAULT 0,
    avg_likes INT DEFAULT 0,
    avg_comments INT DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0.00,
    trend_direction ENUM('up', 'down', 'stable') DEFAULT 'stable',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag_recorded (tag, recorded_at),
    INDEX idx_performance_score (performance_score)
);

-- 12. 시청자 행동 분석 테이블
CREATE TABLE IF NOT EXISTS viewer_behavior (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    avg_watch_duration INT DEFAULT 0, -- 평균 시청 시간 (초)
    retention_rate DECIMAL(3,2) DEFAULT 0.00, -- 시청 유지율
    click_through_rate DECIMAL(3,2) DEFAULT 0.00, -- 클릭률
    engagement_rate DECIMAL(3,2) DEFAULT 0.00, -- 참여율
    drop_off_points JSON, -- 시청 중단 지점들
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    INDEX idx_video_analyzed (video_id, analyzed_at),
    INDEX idx_retention_rate (retention_rate)
);

-- 13. 실시간 이벤트 테이블 (Kafka에서 수집)
CREATE TABLE IF NOT EXISTS realtime_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('view', 'like', 'comment', 'share', 'subscribe') NOT NULL,
    video_id VARCHAR(64),
    channel_id VARCHAR(64),
    user_id VARCHAR(128),
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type_created (event_type, created_at),
    INDEX idx_video_created (video_id, created_at),
    INDEX idx_channel_created (channel_id, created_at)
);

-- 14. 트렌드 토픽 테이블
CREATE TABLE IF NOT EXISTS trending_topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    topic_score DECIMAL(5,2) DEFAULT 0.00,
    related_keywords JSON,
    video_count INT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    trend_period ENUM('hourly', 'daily', 'weekly', 'monthly') DEFAULT 'daily',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_topic_recorded (topic, recorded_at),
    INDEX idx_topic_score (topic_score)
);

-- 15. 채널 성과 지표 테이블
CREATE TABLE IF NOT EXISTS channel_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id VARCHAR(64) NOT NULL,
    metric_date DATE NOT NULL,
    daily_views BIGINT DEFAULT 0,
    daily_subscribers INT DEFAULT 0,
    daily_videos INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    subscriber_growth_rate DECIMAL(5,2) DEFAULT 0.00,
    view_growth_rate DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_channel_date (channel_id, metric_date),
    INDEX idx_channel_date (channel_id, metric_date)
);

-- 뷰 생성: 채널별 종합 분석
CREATE VIEW channel_analytics AS
SELECT 
    c.id,
    c.title,
    c.subscriber_count,
    c.view_count,
    c.video_count,
    COALESCE(cg.growth_rate, 0) as recent_growth_rate,
    0 as avg_sentiment,
    0 as positive_ratio,
    0 as engagement_rate
FROM channels c
LEFT JOIN (
    SELECT channel_id, growth_rate 
    FROM channel_growth 
    WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ORDER BY recorded_at DESC 
    LIMIT 1
) cg ON c.id = cg.channel_id;

-- 뷰 생성: 인기 비디오 분석
CREATE VIEW popular_videos_analysis AS
SELECT 
    v.id,
    v.title,
    v.channel_id,
    c.title as channel_name,
    v.view_count,
    v.like_count,
    v.comment_count,
    v.published_at,
    0 as avg_sentiment_score,
    0 as sentiment_ratio,
    0 as retention_rate,
    0 as engagement_rate
FROM videos v
JOIN channels c ON v.channel_id = c.id
WHERE v.view_count > 10000
ORDER BY v.view_count DESC;
