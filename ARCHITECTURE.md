# 실시간 + 배치 하이브리드 아키텍처

## 개요

이 프로젝트는 YouTube 데이터 분석을 위한 실시간 + 배치 하이브리드 아키텍처를 구현합니다.

```
배치: Airflow → MySQL 적재·정규화·모델 재학습
실시간: Kafka → Flink → MySQL/Redis 반영, API 즉시 조회
```

## 아키텍처 다이어그램

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   YouTube API   │    │   User Events   │    │  Analytics API  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Airflow      │    │     Kafka       │    │   FastAPI       │
│   (Batch)       │    │   (Stream)      │    │  (Real-time)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     MySQL       │    │     Flink       │    │     Redis       │
│  (Data Lake)    │    │  (Processing)   │    │   (Cache)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   Spark         │
                    │  (Analytics)    │
                    └─────────────────┘
```

## 구성 요소

### 1. 배치 처리 (Airflow)

**목적**: 대용량 데이터 수집, 정규화, 모델 재학습

**구성 요소**:
- **Airflow DAG**: `youtube_ingest.py`, `youtube_nlp_enhanced.py`
- **데이터 소스**: YouTube API
- **처리 과정**:
  1. YouTube 데이터 수집
  2. 데이터 정규화 및 정제
  3. 감정 분석 (TextBlob)
  4. 토픽 모델링 (LDA)
  5. 모델 재학습 (RandomForest)
  6. MySQL 적재

**스케줄**: 6시간마다 실행

### 2. 실시간 처리 (Kafka + Flink)

**목적**: 실시간 이벤트 처리 및 즉시 반영

**구성 요소**:
- **Kafka**: 이벤트 스트림 수집
- **Flink**: 실시간 스트림 처리
- **Redis**: 실시간 데이터 캐싱
- **MySQL**: 영구 저장

**처리 과정**:
1. 실시간 이벤트 수집 (조회, 좋아요, 댓글)
2. Flink 스트림 처리
3. 실시간 분석 (트렌딩 스코어, 감정 분석)
4. Redis 캐싱
5. MySQL 업데이트

### 3. API 서버 (FastAPI)

**목적**: 실시간 데이터 조회 및 대시보드

**엔드포인트**:
- `POST /api/realtime/events`: 실시간 이벤트 발행
- `GET /api/realtime/analytics/{video_id}`: 비디오 분석 데이터
- `GET /api/realtime/trending`: 트렌딩 비디오 목록
- `GET /api/realtime/dashboard`: 실시간 대시보드
- `GET /api/realtime/status`: 시스템 상태

## 데이터 플로우

### 배치 플로우
```
YouTube API → Airflow → MySQL → Spark → 분석 결과
```

### 실시간 플로우
```
User Events → Kafka → Flink → Redis/MySQL → API → Dashboard
```

## 기술 스택

### 백엔드
- **FastAPI**: REST API 서버
- **Airflow**: 배치 작업 스케줄링
- **Apache Kafka**: 실시간 스트림 처리
- **Apache Flink**: 스트림 처리 엔진
- **Apache Spark**: 대용량 데이터 분석

### 데이터베이스
- **MySQL**: 메인 데이터 저장소
- **Redis**: 실시간 캐싱
- **PostgreSQL**: Airflow 메타데이터

### ML/AI
- **TextBlob**: 감정 분석
- **scikit-learn**: 머신러닝 모델
- **LDA**: 토픽 모델링
- **RandomForest**: 분류 모델

## 실행 방법

### 1. 전체 시스템 시작
```bash
# Docker Compose로 전체 시스템 시작
docker-compose -f docker-compose.full.yml up -d

# 실시간 처리 파이프라인 시작
python scripts/start_realtime_processing.py
```

### 2. 개별 서비스 시작
```bash
# 배치 처리만 시작
docker-compose -f docker-compose.airflow.yml up -d

# 실시간 처리만 시작
docker-compose up -d kafka redis flink-jobmanager flink-taskmanager
```

### 3. API 테스트
```bash
# 실시간 이벤트 발행
curl -X POST "http://localhost:8000/api/realtime/events" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "view",
    "video_id": "test_video_001",
    "user_id": "user_001",
    "timestamp": "2025-01-01T00:00:00Z",
    "data": {"source": "web"}
  }'

# 트렌딩 비디오 조회
curl "http://localhost:8000/api/realtime/trending?limit=10"

# 실시간 대시보드
curl "http://localhost:8000/api/realtime/dashboard"
```

## 모니터링

### 웹 UI 접근
- **Airflow**: http://localhost:8080 (admin/admin)
- **Flink**: http://localhost:8081
- **Kafka UI**: http://localhost:8081
- **Spark Master**: http://localhost:8083
- **Jupyter**: http://localhost:8888

### 로그 확인
```bash
# 실시간 처리 로그
docker logs project-flink-taskmanager

# API 서버 로그
docker logs project-backend

# Airflow 로그
docker logs project2-airflow-webserver-1
```

## 성능 최적화

### 배치 처리
- **병렬 처리**: Airflow DAG 병렬 실행
- **데이터 파티셔닝**: 날짜별 파티션
- **인덱스 최적화**: 복합 인덱스 활용

### 실시간 처리
- **Redis 캐싱**: 자주 조회되는 데이터 캐싱
- **Kafka 파티셔닝**: 토픽별 파티션 분산
- **Flink 체크포인팅**: 장애 복구 지원

## 확장성

### 수평 확장
- **Kafka**: 브로커 추가
- **Flink**: TaskManager 추가
- **Redis**: 클러스터 구성
- **MySQL**: 읽기 복제본

### 수직 확장
- **메모리**: JVM 힙 크기 조정
- **CPU**: 병렬성 증가
- **스토리지**: SSD 사용

## 보안

### 인증/인가
- **JWT 토큰**: API 인증
- **RBAC**: 역할 기반 접근 제어
- **API 키**: 외부 서비스 인증

### 데이터 보호
- **암호화**: 전송 중 암호화 (TLS)
- **마스킹**: 개인정보 마스킹
- **백업**: 정기적 데이터 백업

## 트러블슈팅

### 일반적인 문제
1. **Kafka 연결 실패**: 네트워크 설정 확인
2. **Redis 메모리 부족**: 메모리 할당량 조정
3. **MySQL 연결 제한**: 커넥션 풀 설정
4. **Flink 작업 실패**: 체크포인트 복구

### 로그 레벨 조정
```bash
# 디버그 모드로 실행
export LOG_LEVEL=DEBUG
python scripts/start_realtime_processing.py
```

## 향후 개선 사항

### 단기 (1-3개월)
- [ ] 실시간 알림 시스템
- [ ] A/B 테스트 프레임워크
- [ ] 성능 모니터링 대시보드

### 중기 (3-6개월)
- [ ] 머신러닝 파이프라인 자동화
- [ ] 실시간 추천 시스템
- [ ] 다국어 지원

### 장기 (6-12개월)
- [ ] AI 기반 콘텐츠 분석
- [ ] 예측 분석 모델
- [ ] 클라우드 네이티브 배포
