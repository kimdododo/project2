-- 실시간 처리를 위한 테이블 스키마

-- 실시간 이벤트 테이블
CREATE TABLE IF NOT EXISTS realtime_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64),
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_video_id (video_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
);

-- 실시간 분석 데이터 테이블
CREATE TABLE IF NOT EXISTS realtime_analytics (
    video_id VARCHAR(64) PRIMARY KEY,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    trending_score FLOAT DEFAULT 0.0,
    sentiment_score FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_trending_score (trending_score),
    INDEX idx_last_updated (last_updated)
);

-- 실시간 알림 구독 테이블
CREATE TABLE IF NOT EXISTS realtime_subscriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    notification_types JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_subscription (video_id, user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_user_id (user_id)
);

-- 실시간 통계 집계 테이블
CREATE TABLE IF NOT EXISTS realtime_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stat_type VARCHAR(50) NOT NULL,
    stat_value FLOAT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stat_type (stat_type),
    INDEX idx_created_at (created_at)
);

-- 채널 정보 테이블 (정규화)
CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    subscriber_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_subscriber_count (subscriber_count)
);

-- 비디오 통계 테이블 (정규화)
CREATE TABLE IF NOT EXISTS video_stats (
    video_id VARCHAR(64) PRIMARY KEY,
    view_count BIGINT DEFAULT 0,
    like_count INT DEFAULT 0,
    dislike_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_view_count (view_count),
    INDEX idx_like_count (like_count),
    INDEX idx_updated_at (updated_at)
);

-- 실시간 트렌딩 랭킹 테이블
CREATE TABLE IF NOT EXISTS trending_rankings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    ranking INT NOT NULL,
    trending_score FLOAT NOT NULL,
    category VARCHAR(50),
    period VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ranking (ranking),
    INDEX idx_category (category),
    INDEX idx_period (period),
    INDEX idx_created_at (created_at)
);

-- 실시간 사용자 활동 테이블
CREATE TABLE IF NOT EXISTS user_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    video_id VARCHAR(64),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_video_id (video_id),
    INDEX idx_created_at (created_at)
);

-- 실시간 알림 로그 테이블
CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    INDEX idx_user_id (user_id),
    INDEX idx_video_id (video_id),
    INDEX idx_sent_at (sent_at)
);

-- 실시간 성능 메트릭 테이블
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_unit VARCHAR(20),
    tags JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
);

-- 인덱스 최적화
CREATE INDEX idx_realtime_events_composite ON realtime_events (video_id, event_type, created_at);
CREATE INDEX idx_realtime_analytics_composite ON realtime_analytics (trending_score DESC, last_updated DESC);
CREATE INDEX idx_trending_rankings_composite ON trending_rankings (period, category, ranking);

-- 파티셔닝 (선택사항 - 대용량 데이터의 경우)
-- ALTER TABLE realtime_events PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027)
-- );
