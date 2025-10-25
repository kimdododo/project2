# 🎬 YouTube 실시간 감정 분석 및 추천 시스템

AI 기반 YouTube 댓글 실시간 감정 분석과 개인화된 비디오 추천 시스템입니다.

## ✨ 주요 기능

### 🚀 실시간 처리 시스템

* **실시간 데이터 수집**: 5분마다 YouTube 데이터 자동 수집
* **실시간 감정분석**: 댓글 즉시 분석 및 분류
* **실시간 추천**: 사용자 행동 기반 즉시 추천
* **실시간 알림**: WebSocket을 통한 즉시 업데이트
* **실시간 캐싱**: Redis를 통한 빠른 데이터 접근

### 🧠 AI 감정 분석

* **댓글 감정 분석**: BERT 기반 AI 모델로 댓글을 긍정/부정/중립으로 분류
* **실시간 분석**: YouTube 댓글을 실시간으로 수집하고 분석
* **토픽 모델링**: BERTopic을 사용한 주제별 댓글 분류
* **한국어 특화**: 한국어 채널 및 콘텐츠 전용 분석

### 🎯 개인화 추천

* **감정 기반 추천**: 사용자의 감정 상태에 따른 맞춤형 비디오 추천
* **실시간 추천**: 사용자 행동 기반 즉시 추천 생성
* **채널 분석**: YouTube 채널의 성장 추이 및 참여도 분석
* **트렌드 분석**: 인기 키워드 및 트렌드 실시간 분석

### 📊 실시간 대시보드

* **실시간 통계**: 비디오 조회수, 댓글 수, 감정 분포 등
* **실시간 시각화**: 차트와 그래프를 통한 실시간 데이터 시각화
* **실시간 필터링**: 점수별, 감정별 비디오 실시간 필터링
* **실시간 모니터링**: 시스템 상태 및 성능 실시간 모니터링

## 🛠️ 기술 스택

### Frontend

* **Next.js 14**: React 기반 풀스택 프레임워크
* **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
* **DaisyUI**: Tailwind CSS 컴포넌트 라이브러리
* **Zustand**: 경량 상태 관리 라이브러리
* **WebSocket**: 실시간 프론트엔드 통신

### Backend

* **FastAPI**: 고성능 Python 웹 프레임워크
* **SQLAlchemy**: Python ORM
* **MySQL**: 관계형 데이터베이스
* **JWT**: JSON Web Token 인증
* **WebSocket**: 실시간 서버 통신

### 실시간 처리

* **Kafka**: 실시간 메시지 스트리밍
* **Flink**: 스트리밍 데이터 처리
* **Redis**: 실시간 캐싱 및 세션 관리
* **Airflow**: 데이터 파이프라인 오케스트레이션

### AI/ML

* **Transformers**: Hugging Face Transformers 라이브러리
* **BERTopic**: 토픽 모델링
* **SentenceTransformer**: 문장 임베딩
* **한국어 NLP**: 한국어 특화 자연어 처리

### Infrastructure

* **Docker**: 컨테이너화
* **Docker Compose**: 멀티 컨테이너 오케스트레이션
* **Kafka UI**: Kafka 관리 웹 인터페이스
* **Flink UI**: Flink 작업 모니터링

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/kimdododo/project2.git
cd project2
```

### 2. 환경 변수 설정

```bash
# .env 파일 생성
YOUTUBE_API_KEY=your_youtube_api_key_here
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DB=yt
MYSQL_USER=ytuser
MYSQL_PW=ytpw
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Docker로 실행

```bash
# 전체 실시간 처리 시스템 실행
docker-compose -f docker-compose.full.yml up -d

# 개별 서비스 실행
docker-compose -f docker-compose.full.yml up mysql backend frontend kafka redis flink
```

### 4. 접속

* **Frontend**: http://localhost:3000
* **Backend API**: http://localhost:8000
* **Airflow**: http://localhost:8080 (admin/admin)
* **Kafka UI**: http://localhost:8090
* **Flink UI**: http://localhost:8082
* **실시간 테스트**: http://localhost:3000/realtime-test

## 📁 프로젝트 구조

```
project2/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/                    # App Router 페이지
│   │   ├── realtime-test/      # 실시간 테스트 페이지
│   │   ├── travel/            # 여행 데이터 페이지
│   │   └── ...
│   ├── components/             # React 컴포넌트
│   │   └── ui/                # UI 컴포넌트
│   └── libs/                  # 유틸리티 라이브러리
├── backend/                   # FastAPI 백엔드
│   ├── app/                  # FastAPI 애플리케이션
│   │   ├── realtime_*.py     # 실시간 처리 모듈
│   │   ├── korean_ml_api.py  # 한국어 ML API
│   │   └── main.py           # API 엔드포인트
│   └── models.py             # 데이터베이스 모델
├── airflow/                  # Airflow DAG
│   └── dags/                 # 데이터 파이프라인
│       └── korean_travel_collection.py  # 한국어 여행 데이터 수집
├── sql/                      # 데이터베이스 스키마
├── scripts/                  # 유틸리티 스크립트
│   └── start_realtime_processing.py  # 실시간 처리 시작
└── docker-compose.full.yml   # Docker 설정
```

## 🔧 주요 API 엔드포인트

### 실시간 처리

* `GET /realtime-test/` - 실시간 테스트 정보
* `POST /realtime-test/trigger/video` - 비디오 데이터 테스트
* `POST /realtime-test/trigger/comment` - 댓글 데이터 테스트
* `POST /realtime-test/trigger/sentiment` - 감정분석 데이터 테스트
* `POST /realtime-test/trigger/recommendation` - 추천 데이터 테스트
* `POST /realtime-test/trigger/all` - 모든 테스트 한번에
* `WebSocket /ws` - 실시간 WebSocket 연결

### 인증

* `POST /api/auth/login` - 로그인
* `POST /api/auth/register` - 회원가입

### 데이터 수집

* `POST /api/run` - YouTube 데이터 수집 시작
* `GET /api/summary` - 데이터 수집 요약

### 추천 시스템

* `GET /api/videos` - 비디오 목록 조회
* `GET /api/queries` - 쿼리 목록 조회

## 🤖 AI 모델

### 감정 분석

* **모델**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
* **대안**: `nlptown/bert-base-multilingual-uncased-sentiment`
* **한국어**: `beomi/KcELECTRA-base-v2022`
* **언어**: 한국어, 영어 지원

### 토픽 모델링

* **모델**: BERTopic
* **임베딩**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`

### 추천 시스템

* **임베딩**: SentenceTransformer
* **유사도**: 코사인 유사도 계산
* **실시간**: 사용자 행동 기반 즉시 추천

## 📊 데이터베이스 스키마

### 주요 테이블

* `korean_travel_videos`: 한국어 여행 비디오 정보
* `korean_travel_comments`: 한국어 댓글 데이터
* `sentiment_analysis`: 댓글 감정 분석 결과
* `recommendations`: 사용자 추천 데이터
* `realtime_events`: 실시간 이벤트 로그

## 🔄 실시간 데이터 파이프라인

1. **데이터 수집**: Airflow DAG (5분마다) → YouTube API
2. **메시지 스트리밍**: Kafka → 실시간 메시지 큐
3. **스트리밍 처리**: Flink → 실시간 데이터 처리
4. **감정 분석**: 실시간 댓글 감정 분류
5. **추천 생성**: 사용자 행동 기반 즉시 추천
6. **캐싱**: Redis → 실시간 데이터 캐싱
7. **알림**: WebSocket → 프론트엔드 실시간 업데이트
8. **저장**: MySQL → 영구 데이터 저장

## 🎨 UI/UX 특징

* **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
* **다크/라이트 모드**: 사용자 선호도에 따른 테마
* **실시간 업데이트**: WebSocket을 통한 즉시 데이터 반영
* **실시간 모니터링**: 시스템 상태 실시간 표시
* **인터랙티브 대시보드**: 실시간 데이터 시각화

## 📈 성능 최적화

* **실시간 캐싱**: Redis를 통한 빠른 데이터 접근
* **스트리밍 처리**: Kafka + Flink로 대용량 실시간 처리
* **비동기 처리**: FastAPI 비동기 처리
* **컨테이너화**: Docker를 통한 일관된 환경
* **로드 밸런싱**: 다중 워커 노드 지원

## 🧪 실시간 테스트

### 1. 실시간 테스트 페이지

```
http://localhost:3000/realtime-test
```

### 2. API 테스트

```bash
# 비디오 데이터 테스트
curl -X POST http://localhost:8000/realtime-test/trigger/video

# 댓글 데이터 테스트
curl -X POST http://localhost:8000/realtime-test/trigger/comment

# 감정분석 데이터 테스트
curl -X POST http://localhost:8000/realtime-test/trigger/sentiment

# 추천 데이터 테스트
curl -X POST http://localhost:8000/realtime-test/trigger/recommendation

# 모든 테스트 한번에
curl -X POST http://localhost:8000/realtime-test/trigger/all
```

### 3. WebSocket 테스트

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
    console.log('실시간 데이터:', JSON.parse(event.data));
};
```

## 🔍 모니터링

### 서비스 상태 확인

* **Kafka UI**: http://localhost:8090
* **Flink UI**: http://localhost:8082
* **Airflow UI**: http://localhost:8080
* **Redis**: localhost:6379

### 로그 확인

```bash
# 백엔드 로그
docker logs project-backend

# 프론트엔드 로그
docker logs project-frontend

# Kafka 로그
docker logs project-kafka

# Flink 로그
docker logs project-flink-jobmanager
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/kimdododo/project2](https://github.com/kimdododo/project2)

## 🙏 감사의 말

* **Hugging Face** - AI 모델 제공
* **YouTube API** - 데이터 수집
* **FastAPI** - 백엔드 프레임워크
* **Next.js** - 프론트엔드 프레임워크
* **Apache Kafka** - 실시간 메시지 스트리밍
* **Apache Flink** - 스트리밍 데이터 처리
* **Redis** - 실시간 캐싱

## 🚀 최신 업데이트

### v2.0.0 - 실시간 처리 시스템

* ✅ **실시간 데이터 수집**: 5분마다 자동 수집
* ✅ **실시간 감정분석**: 댓글 즉시 분석
* ✅ **실시간 추천**: 사용자 행동 기반 즉시 추천
* ✅ **WebSocket 통신**: 실시간 프론트엔드 업데이트
* ✅ **Redis 캐싱**: 실시간 데이터 캐싱
* ✅ **Kafka 스트리밍**: 실시간 메시지 처리
* ✅ **Flink 처리**: 스트리밍 데이터 처리
* ✅ **실시간 모니터링**: 시스템 상태 실시간 표시

---

**🎯 실시간 처리 시스템으로 YouTube 데이터를 실시간으로 분석하고 추천하세요!**