# MySQL에서 CSV 다운로드 방법들

## 1. Python 스크립트 사용 (권장)

### 기본 사용법
```bash
# 특정 테이블 내보내기
python scripts/export_to_csv.py --table videos

# 모든 테이블 내보내기
python scripts/export_to_csv.py --all

# 분석 데이터만 내보내기
python scripts/export_to_csv.py --analytics

# 사용자 행동 데이터 내보내기
python scripts/export_to_csv.py --behavior

# 행 수 제한
python scripts/export_to_csv.py --table videos --limit 1000

# 출력 디렉토리 지정
python scripts/export_to_csv.py --analytics --output-dir my_exports
```

### 지원하는 데이터 타입
- **기본 테이블**: videos, channels, comments, sentiment_analysis
- **분석 데이터**: video_analytics, channel_analytics, sentiment_analysis, recommendations, trending_topics
- **사용자 행동**: user_behavior_logs (최근 30일)

## 2. MySQL 명령어 직접 사용

### INTO OUTFILE 사용
```sql
-- 비디오 데이터 내보내기
SELECT * FROM videos 
INTO OUTFILE 'C:/temp/videos.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';

-- 채널 데이터 내보내기
SELECT * FROM channels 
INTO OUTFILE 'C:/temp/channels.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';
```

### Docker 컨테이너 내에서 실행
```bash
# Docker 컨테이너에 접속
docker exec -it project-mysql bash

# MySQL 접속
mysql -u ytuser -pytpw yt

# CSV 내보내기
SELECT * FROM videos INTO OUTFILE '/tmp/videos.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
```

## 3. mysqldump 사용

### 전체 데이터베이스 백업
```bash
# 전체 데이터베이스 덤프
docker exec project-mysql mysqldump -u ytuser -pytpw yt > backup.sql

# 특정 테이블만 덤프
docker exec project-mysql mysqldump -u ytuser -pytpw yt videos channels > tables.sql
```

## 4. API를 통한 데이터 조회

### REST API 사용
```bash
# 비디오 데이터 조회
curl "http://localhost:8001/api/videos?limit=100"

# 채널 데이터 조회
curl "http://localhost:8001/api/channels"

# 실시간 이벤트 조회
curl "http://localhost:8001/api/realtime/events"
```

### Python으로 API 호출
```python
import requests
import pandas as pd

# API에서 데이터 가져오기
response = requests.get("http://localhost:8001/api/videos")
data = response.json()

# DataFrame으로 변환
df = pd.DataFrame(data['videos'])

# CSV로 저장
df.to_csv('videos_from_api.csv', index=False, encoding='utf-8-sig')
```

## 5. 실시간 데이터 내보내기

### Kafka 토픽에서 데이터 추출
```python
from kafka import KafkaConsumer
import json
import pandas as pd

# Kafka 컨슈머 생성
consumer = KafkaConsumer(
    'youtube_events',
    bootstrap_servers=['localhost:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

# 데이터 수집
messages = []
for message in consumer:
    messages.append(message.value)
    if len(messages) >= 1000:  # 1000개 수집 후 중단
        break

# CSV로 저장
df = pd.DataFrame(messages)
df.to_csv('kafka_events.csv', index=False, encoding='utf-8-sig')
```

## 6. 배치 스케줄링

### Airflow DAG로 자동 내보내기
```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta

def export_daily_data():
    import subprocess
    subprocess.run([
        'python', 'scripts/export_to_csv.py', 
        '--analytics', 
        '--output-dir', f'exports/daily_{datetime.now().strftime("%Y%m%d")}'
    ])

dag = DAG(
    'daily_csv_export',
    schedule_interval='0 2 * * *',  # 매일 오전 2시
    start_date=datetime(2024, 1, 1)
)

export_task = PythonOperator(
    task_id='export_csv',
    python_callable=export_daily_data,
    dag=dag
)
```

## 7. 고급 내보내기 옵션

### 필터링된 데이터 내보내기
```python
# 특정 기간의 데이터만 내보내기
query = """
SELECT * FROM videos 
WHERE published_at >= '2024-01-01' 
AND published_at < '2024-02-01'
"""

# 인기 비디오만 내보내기
query = """
SELECT * FROM videos 
WHERE view_count > 1000000
ORDER BY view_count DESC
"""
```

### JSON 데이터 처리
```python
# JSON 컬럼이 있는 경우
query = """
SELECT 
    id,
    title,
    JSON_EXTRACT(tags, '$') as tags_json,
    JSON_EXTRACT(preferences, '$.category') as user_category
FROM videos v
LEFT JOIN user_profiles u ON v.channel_id = u.user_id
"""
```

## 8. 성능 최적화

### 대용량 데이터 처리
```python
# 청크 단위로 처리
def export_large_table(table_name, chunk_size=10000):
    offset = 0
    while True:
        query = f"SELECT * FROM {table_name} LIMIT {chunk_size} OFFSET {offset}"
        df = pd.read_sql(query, conn)
        
        if df.empty:
            break
            
        df.to_csv(f'{table_name}_chunk_{offset}.csv', index=False)
        offset += chunk_size
```

### 병렬 처리
```python
from concurrent.futures import ThreadPoolExecutor

def export_table_parallel(table_name):
    return export_table_to_csv(table_name)

# 여러 테이블을 동시에 내보내기
tables = ['videos', 'channels', 'comments']
with ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(export_table_parallel, tables))
```

## 9. 파일 형식 옵션

### 다양한 형식 지원
```python
# Excel 파일로 내보내기
df.to_excel('data.xlsx', index=False)

# JSON으로 내보내기
df.to_json('data.json', orient='records', indent=2)

# Parquet 형식 (빅데이터용)
df.to_parquet('data.parquet', compression='snappy')
```

## 10. 자동화 스크립트

### 완전 자동화된 내보내기
```bash
#!/bin/bash
# daily_export.sh

DATE=$(date +%Y%m%d)
OUTPUT_DIR="exports/daily_$DATE"

# 디렉토리 생성
mkdir -p $OUTPUT_DIR

# 데이터 내보내기
python scripts/export_to_csv.py --analytics --output-dir $OUTPUT_DIR

# 압축
cd exports
tar -czf "daily_$DATE.tar.gz" "daily_$DATE"

# 이전 파일 삭제 (7일 이상)
find . -name "daily_*" -type d -mtime +7 -exec rm -rf {} \;
```

이렇게 다양한 방법으로 MySQL 데이터를 CSV로 다운로드할 수 있습니다!
