# 🎬 YouTube 감정 분석 및 추천 시스템

AI 기반 YouTube 댓글 감정 분석과 개인화된 비디오 추천 시스템입니다.

## ✨ 주요 기능

### 🧠 AI 감정 분석
- **댓글 감정 분석**: BERT 기반 AI 모델로 댓글을 긍정/부정/중립으로 분류
- **실시간 분석**: YouTube 댓글을 실시간으로 수집하고 분석
- **토픽 모델링**: BERTopic을 사용한 주제별 댓글 분류

### 🎯 개인화 추천
- **감정 기반 추천**: 사용자의 감정 상태에 따른 맞춤형 비디오 추천
- **채널 분석**: YouTube 채널의 성장 추이 및 참여도 분석
- **트렌드 분석**: 인기 키워드 및 트렌드 분석

### 📊 대시보드
- **실시간 통계**: 비디오 조회수, 댓글 수, 감정 분포 등
- **시각화**: 차트와 그래프를 통한 데이터 시각화
- **필터링**: 점수별, 감정별 비디오 필터링

## 🛠️ 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **DaisyUI**: Tailwind CSS 컴포넌트 라이브러리
- **Zustand**: 경량 상태 관리 라이브러리

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy**: Python ORM
- **MySQL**: 관계형 데이터베이스
- **JWT**: JSON Web Token 인증

### AI/ML
- **Transformers**: Hugging Face Transformers 라이브러리
- **BERTopic**: 토픽 모델링
- **SentenceTransformer**: 문장 임베딩
- **Airflow**: 데이터 파이프라인 오케스트레이션

### Infrastructure
- **Docker**: 컨테이너화
- **Docker Compose**: 멀티 컨테이너 오케스트레이션

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd project
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
```

### 3. Docker로 실행
```bash
# 전체 시스템 실행
docker-compose -f docker-compose.full.yml up -d

# 개별 서비스 실행
docker-compose -f docker-compose.full.yml up mysql backend frontend
```

### 4. 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Airflow**: http://localhost:8080 (admin/admin)

## 📁 프로젝트 구조

```
project/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                 # App Router 페이지
│   ├── components/          # React 컴포넌트
│   ├── libs/               # 유틸리티 라이브러리
│   └── public/             # 정적 파일
├── backend/                # FastAPI 백엔드
│   ├── app/                # FastAPI 애플리케이션
│   ├── models.py           # 데이터베이스 모델
│   └── main.py             # API 엔드포인트
├── airflow/                # Airflow DAG
│   ├── dags/               # 데이터 파이프라인
│   └── requirements.txt    # Python 의존성
├── sql/                    # 데이터베이스 스키마
└── docker-compose.full.yml # Docker 설정
```

## 🔧 주요 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 데이터 수집
- `POST /api/run` - YouTube 데이터 수집 시작
- `GET /api/summary` - 데이터 수집 요약

### 추천 시스템
- `GET /api/videos` - 비디오 목록 조회
- `GET /api/queries` - 쿼리 목록 조회

## 🤖 AI 모델

### 감정 분석
- **모델**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **대안**: `nlptown/bert-base-multilingual-uncased-sentiment`
- **언어**: 한국어, 영어 지원

### 토픽 모델링
- **모델**: BERTopic
- **임베딩**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`

### 추천 시스템
- **임베딩**: SentenceTransformer
- **유사도**: 코사인 유사도 계산

## 📊 데이터베이스 스키마

### 주요 테이블
- `videos`: YouTube 비디오 정보
- `comments`: 댓글 데이터
- `comment_sentiment`: 댓글 감정 분석 결과
- `topics`: 토픽 모델링 결과
- `queries`: 검색 쿼리 기록

## 🔄 데이터 파이프라인

1. **데이터 수집**: YouTube API로 비디오 및 댓글 수집
2. **감정 분석**: AI 모델로 댓글 감정 분류
3. **토픽 모델링**: 주제별 댓글 분류
4. **추천 생성**: 유사도 기반 비디오 추천
5. **API 제공**: 프론트엔드에 데이터 제공

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크/라이트 모드**: 사용자 선호도에 따른 테마
- **토글 UI**: 클릭으로 펼쳐지는 인터랙티브 댓글 섹션
- **실시간 업데이트**: 실시간 데이터 반영

## 📈 성능 최적화

- **캐싱**: 채널 정보 및 API 응답 캐싱
- **배치 처리**: 대량 데이터 처리 최적화
- **비동기 처리**: FastAPI 비동기 처리
- **컨테이너화**: Docker를 통한 일관된 환경

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/username/project](https://github.com/username/project)

## 🙏 감사의 말

- [Hugging Face](https://huggingface.co/) - AI 모델 제공
- [YouTube API](https://developers.google.com/youtube) - 데이터 수집
- [FastAPI](https://fastapi.tiangolo.com/) - 백엔드 프레임워크
- [Next.js](https://nextjs.org/) - 프론트엔드 프레임워크
