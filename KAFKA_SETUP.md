# Kafka 설치 및 사용 가이드

## 설치된 구성 요소

### 1. Docker Compose 서비스
- **Zookeeper**: Kafka의 메타데이터 관리
- **Kafka**: 메시지 브로커
- **Kafka UI**: Kafka 관리용 웹 인터페이스 (포트 8081)

### 2. Python 클라이언트
- **kafka-python**: Python용 Kafka 클라이언트 라이브러리
- **kafka_client.py**: Kafka 연결 및 메시지 처리 유틸리티
- **kafka_example.py**: FastAPI에서 Kafka 사용 예제

## 서비스 시작

```bash
# 전체 서비스 시작 (Kafka 포함)
docker-compose -f docker-compose.full.yml up -d

# 또는 Kafka만 시작
docker-compose -f docker-compose.full.yml up -d zookeeper kafka kafka-ui
```

## 접속 정보

- **Kafka**: `localhost:9092`
- **Kafka UI**: `http://localhost:8081`
- **Zookeeper**: `localhost:2181`

## API 사용 예제

### 1. 메시지 전송
```bash
curl -X POST "http://localhost:8000/kafka/send" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "message": {"key": "value", "data": "test message"},
    "key": "message-key"
  }'
```

### 2. 메시지 소비
```bash
curl "http://localhost:8000/kafka/topics/test-topic/consume?group_id=my-group&limit=10"
```

### 3. YouTube 데이터 처리
```bash
curl -X POST "http://localhost:8000/kafka/youtube/process" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "abc123",
    "title": "테스트 비디오",
    "channel_id": "UC123456",
    "published_at": "2025-01-01T00:00:00Z"
  }'
```

## Python 코드에서 사용

```python
from app.kafka_client import send_to_kafka, consume_from_kafka

# 메시지 전송
success = send_to_kafka(
    topic="youtube-videos",
    message={"video_id": "123", "title": "테스트"},
    key="video-123"
)

# 메시지 소비
for message in consume_from_kafka("youtube-videos", "my-group"):
    print(f"Received: {message['value']}")
```

## 토픽 생성

Kafka UI에서 토픽을 생성하거나, 다음 명령어를 사용:

```bash
# Kafka 컨테이너에 접속
docker exec -it project-kafka bash

# 토픽 생성
kafka-topics --create --topic youtube-videos --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# 토픽 목록 확인
kafka-topics --list --bootstrap-server localhost:9092
```

## 환경 변수

백엔드 서비스에서 사용하는 Kafka 관련 환경 변수:
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka 브로커 주소 (기본값: `kafka:29092`)

## 모니터링

Kafka UI (`http://localhost:8081`)에서 다음을 확인할 수 있습니다:
- 토픽 목록 및 설정
- 메시지 전송/소비 현황
- 컨슈머 그룹 상태
- 파티션 정보
