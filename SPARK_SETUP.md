# Apache Spark 설치 및 사용 가이드

## 설치된 구성 요소

### 1. Docker Compose 서비스
- **Spark Master**: 클러스터 관리자 (포트 8083, 7077)
- **Spark Worker 1**: 워커 노드 1 (포트 8084)
- **Spark Worker 2**: 워커 노드 2 (포트 8085)
- **Jupyter Notebook**: Spark 개발 환경 (포트 8888)

### 2. Python 클라이언트
- **PySpark**: Python용 Spark API
- **findspark**: Spark 자동 감지 라이브러리
- **spark_client.py**: Spark 연결 및 데이터 처리 유틸리티
- **spark_example.py**: FastAPI에서 Spark 사용 예제

## 서비스 시작

```bash
# 전체 서비스 시작 (Spark 포함)
docker-compose -f docker-compose.full.yml up -d

# 또는 Spark만 시작
docker-compose -f docker-compose.full.yml up -d spark-master spark-worker-1 spark-worker-2
```

## 접속 정보

- **Spark Master UI**: `http://localhost:8083`
- **Spark Worker 1 UI**: `http://localhost:8084`
- **Spark Worker 2 UI**: `http://localhost:8085`
- **Jupyter Notebook**: `http://localhost:8888`
- **Spark Master**: `spark://spark-master:7077`

## API 사용 예제

### 1. Spark 상태 확인
```bash
curl "http://localhost:8000/spark/status"
```

### 2. 비디오 데이터 처리
```bash
curl -X POST "http://localhost:8000/spark/process/videos" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "video_id": "abc123",
      "title": "테스트 비디오",
      "channel_id": "UC123456",
      "published_at": "2025-01-01T00:00:00Z",
      "view_count": 1000
    }
  ]'
```

### 3. 댓글 감정 분석
```bash
curl -X POST "http://localhost:8000/spark/process/comments" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "video_id": "abc123",
      "text": "좋은 영상이네요!",
      "sentiment_label": "pos",
      "sentiment_score": 0.8
    }
  ]'
```

### 4. Kafka 스트리밍
```bash
curl -X POST "http://localhost:8000/spark/stream/kafka?topic=youtube-videos"
```

### 5. 배치 처리
```bash
curl -X POST "http://localhost:8000/spark/batch/process" \
  -H "Content-Type: application/json" \
  -d '{
    "videos_data": [...],
    "comments_data": [...]
  }'
```

### 6. Spark SQL 실행
```bash
curl "http://localhost:8000/spark/sql/execute?query=SELECT%20*%20FROM%20videos%20LIMIT%2010"
```

### 7. ML 감정 분석
```bash
curl -X POST "http://localhost:8000/spark/ml/sentiment" \
  -H "Content-Type: application/json" \
  -d '["좋은 영상이네요!", "별로네요", "최고입니다!"]'
```

## Python 코드에서 사용

```python
from app.spark_client import get_spark_session, process_data_with_spark

# Spark 세션 가져오기
spark = get_spark_session()

# 데이터 처리
data = [{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]
result = process_data_with_spark(data, "basic")

# DataFrame 생성
df = spark.createDataFrame(data)
df.show()
```

## Jupyter Notebook 사용

1. `http://localhost:8888`에 접속
2. 새 노트북 생성
3. Spark 코드 작성:

```python
from pyspark.sql import SparkSession

# Spark 세션 생성
spark = SparkSession.builder \
    .appName("Jupyter Spark") \
    .master("spark://spark-master:7077") \
    .getOrCreate()

# 데이터 로드 및 처리
df = spark.read.json("data.json")
df.show()
```

## 환경 변수

백엔드 서비스에서 사용하는 Spark 관련 환경 변수:
- `SPARK_MASTER`: Spark 마스터 주소 (기본값: `spark://spark-master:7077`)
- `SPARK_APP_NAME`: Spark 애플리케이션 이름 (기본값: `youtube-analytics`)

## 모니터링

### Spark Master UI (`http://localhost:8083`)
- 클러스터 상태
- 실행 중인 애플리케이션
- 워커 노드 상태
- 리소스 사용량

### Spark Worker UI
- Worker 1: `http://localhost:8084`
- Worker 2: `http://localhost:8085`
- 각 워커의 실행 상태
- 메모리 및 CPU 사용량

## 성능 최적화

### 1. 메모리 설정
```yaml
environment:
  - SPARK_WORKER_MEMORY=2G
  - SPARK_DRIVER_MEMORY=1G
```

### 2. 병렬성 설정
```python
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.coalescePartitions.enabled", "true")
```

### 3. 캐싱
```python
df.cache()
df.persist()
```

## Kafka와 연동

```python
# Kafka에서 데이터 스트리밍
df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:29092") \
    .option("subscribe", "youtube-videos") \
    .load()

# 실시간 처리
processed_df = df.select(
    col("key").cast("string"),
    col("value").cast("string")
)

# 결과를 다른 Kafka 토픽으로 전송
processed_df.writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:29092") \
    .option("topic", "processed-videos") \
    .start()
```

## 트러블슈팅

### 1. Spark 연결 실패
- Spark Master가 실행 중인지 확인
- 네트워크 연결 상태 확인
- 방화벽 설정 확인

### 2. 메모리 부족
- Worker 메모리 증가
- Driver 메모리 증가
- 데이터 파티셔닝 조정

### 3. 성능 이슈
- 병렬성 설정 조정
- 캐싱 활용
- 데이터 스키마 최적화
