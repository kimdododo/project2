-- 추천 결과
CREATE TABLE IF NOT EXISTS recs (
  video_id VARCHAR(64), similar_id VARCHAR(64), score DOUBLE,
  PRIMARY KEY (video_id, similar_id), INDEX(video_id), INDEX(similar_id)
);

-- 토픽 결과
CREATE TABLE IF NOT EXISTS topics (
  video_id VARCHAR(64) PRIMARY KEY,
  topic_id INT, topic_label VARCHAR(255), probability DOUBLE
);

-- 댓글 감정
CREATE TABLE IF NOT EXISTS comment_sentiment (
  comment_id VARCHAR(128) PRIMARY KEY,
  video_id VARCHAR(64), label VARCHAR(32), score DOUBLE,
  INDEX(video_id)
);

-- 영상별 감정 집계
CREATE TABLE IF NOT EXISTS video_sentiment_agg (
  video_id VARCHAR(64) PRIMARY KEY,
  pos DOUBLE, neu DOUBLE, neg DOUBLE, n INT
);