"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          테스트 페이지
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          로그인 없이 접근 가능한 테스트 페이지입니다.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">현재 시간</h2>
          <p className="text-gray-600">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
