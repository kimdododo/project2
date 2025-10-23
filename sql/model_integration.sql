-- 모델 통합을 위한 추가 테이블들

-- 1. 모델 저장소 테이블
CREATE TABLE IF NOT EXISTS model_storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type ENUM('sentiment', 'topic_modeling', 'recommendation', 'classification') NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_path VARCHAR(500) NOT NULL,
    model_size BIGINT DEFAULT 0,
    accuracy_score DECIMAL(5,4) DEFAULT 0.0000,
    training_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_model_version (model_name, model_version),
    INDEX idx_model_type (model_type),
    INDEX idx_is_active (is_active)
);

-- 2. 토픽 모델링 결과 테이블
CREATE TABLE IF NOT EXISTS topic_modeling_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    topic_id INT NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    topic_probability DECIMAL(5,4) NOT NULL,
    topic_keywords JSON,
    model_version VARCHAR(50) NOT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    INDEX idx_video_topic (video_id, topic_id),
    INDEX idx_topic_probability (topic_probability),
    INDEX idx_model_version (model_version)
);

-- 3. 추천 시스템 테이블
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    recommendation_type ENUM('content_based', 'collaborative', 'hybrid', 'trending') NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    INDEX idx_user_recommendations (user_id, is_active),
    INDEX idx_video_recommendations (video_id),
    INDEX idx_recommendation_type (recommendation_type),
    INDEX idx_score (score)
);

-- 4. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(128) PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    preferences JSON,
    watch_history JSON,
    favorite_categories JSON,
    favorite_channels JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- 5. 사용자 행동 로그 테이블
CREATE TABLE IF NOT EXISTS user_behavior_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    action_type ENUM('view', 'like', 'dislike', 'comment', 'share', 'subscribe', 'unsubscribe') NOT NULL,
    action_data JSON,
    session_id VARCHAR(128),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    INDEX idx_user_actions (user_id, action_type),
    INDEX idx_video_actions (video_id, action_type),
    INDEX idx_session (session_id),
    INDEX idx_created_at (created_at)
);

-- 6. 모델 성능 추적 테이블
CREATE TABLE IF NOT EXISTS model_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,6) NOT NULL,
    evaluation_date DATETIME NOT NULL,
    test_data_size INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model_metric (model_name, model_version, metric_name),
    INDEX idx_evaluation_date (evaluation_date)
);

-- 7. 추천 시스템 피드백 테이블
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    video_id VARCHAR(64) NOT NULL,
    recommendation_id INT,
    feedback_type ENUM('positive', 'negative', 'neutral') NOT NULL,
    feedback_score INT, -- 1-5 scale
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
    INDEX idx_user_feedback (user_id, feedback_type),
    INDEX idx_video_feedback (video_id, feedback_type)
);

-- 8. 임베딩 벡터 저장 테이블 (Hugging Face 모델용)
CREATE TABLE IF NOT EXISTS embeddings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_id VARCHAR(128) NOT NULL, -- video_id 또는 comment_id
    content_type ENUM('video', 'comment', 'channel') NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    embedding_vector JSON NOT NULL, -- 벡터를 JSON으로 저장
    embedding_dimension INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content (content_id, content_type),
    INDEX idx_model (model_name)
);

-- 9. 토픽 클러스터링 결과 테이블
CREATE TABLE IF NOT EXISTS topic_clusters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cluster_id INT NOT NULL,
    cluster_name VARCHAR(255) NOT NULL,
    cluster_center JSON, -- 클러스터 중심 벡터
    cluster_size INT DEFAULT 0,
    keywords JSON, -- 클러스터 키워드들
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cluster (cluster_id),
    INDEX idx_model_version (model_version)
);

-- 10. 비디오-토픽 클러스터 매핑 테이블
CREATE TABLE IF NOT EXISTS video_topic_clusters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(64) NOT NULL,
    cluster_id INT NOT NULL,
    membership_score DECIMAL(5,4) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (cluster_id) REFERENCES topic_clusters(cluster_id) ON DELETE CASCADE,
    INDEX idx_video_cluster (video_id, cluster_id),
    INDEX idx_membership_score (membership_score)
);

-- 뷰 생성: 활성 모델 정보
CREATE VIEW active_models AS
SELECT 
    model_name,
    model_type,
    model_version,
    model_path,
    accuracy_score,
    training_date,
    model_size
FROM model_storage 
WHERE is_active = TRUE
ORDER BY training_date DESC;

-- 뷰 생성: 사용자별 추천 요약
CREATE VIEW user_recommendation_summary AS
SELECT 
    u.user_id,
    u.username,
    COUNT(r.id) as total_recommendations,
    AVG(r.score) as avg_recommendation_score,
    COUNT(CASE WHEN r.recommendation_type = 'content_based' THEN 1 END) as content_based_count,
    COUNT(CASE WHEN r.recommendation_type = 'collaborative' THEN 1 END) as collaborative_count,
    COUNT(CASE WHEN r.recommendation_type = 'hybrid' THEN 1 END) as hybrid_count
FROM user_profiles u
LEFT JOIN recommendations r ON u.user_id = r.user_id AND r.is_active = TRUE
GROUP BY u.user_id, u.username;

-- 뷰 생성: 토픽별 비디오 분포
CREATE VIEW topic_video_distribution AS
SELECT 
    t.topic_name,
    t.topic_id,
    COUNT(tmr.video_id) as video_count,
    AVG(tmr.topic_probability) as avg_probability,
    MAX(tmr.topic_probability) as max_probability
FROM topic_modeling_results tmr
JOIN (
    SELECT DISTINCT topic_id, topic_name 
    FROM topic_modeling_results
) t ON tmr.topic_id = t.topic_id
GROUP BY t.topic_id, t.topic_name
ORDER BY video_count DESC;
