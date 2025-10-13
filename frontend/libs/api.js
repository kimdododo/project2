// API 클라이언트
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
          throw new Error('인증이 필요합니다.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // 네트워크 에러나 서버 에러 시 기본값 반환
      if (endpoint.includes('/queries')) return [];
      if (endpoint.includes('/videos')) return [];
      if (endpoint.includes('/summary')) return { videos: 0, comments: 0, sentiment: { pos: 0.5, neu: 0.3, neg: 0.2 }, topics: [] };
      throw error;
    }
  }

  // YouTube 데이터 수집 시작
  async startDataCollection(keyword) {
    return this.request('/api/run', {
      method: 'POST',
      body: JSON.stringify({ keyword }),
    });
  }

  // 데이터 요약 조회
  async getSummary(queryId) {
    return this.request(`/api/summary?query_id=${queryId}`);
  }

  // 쿼리 목록 조회
  async getQueries() {
    return this.request('/api/queries');
  }

  // 비디오 목록 조회
  async getVideos(limit = 10, offset = 0) {
    return this.request(`/api/videos?limit=${limit}&offset=${offset}`);
  }

  // 헬스 체크
  async healthCheck() {
    return this.request('/api/health');
  }
}

export default new ApiClient();
