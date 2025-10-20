"use client";

const ButtonNaverLogin = ({ isLoading, onClick }) => {
  return (
    <button
      className="btn w-full bg-green-500 text-white border-none hover:bg-green-600 font-bold h-12"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <div className="flex items-center justify-center w-full">
          <div className="w-6 h-6 mr-3 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#03C75A"/>
              <path d="M8 6h8v2H8V6zm0 4h8v2H8v-2zm0 4h8v2H8v-2z" fill="white"/>
            </svg>
          </div>
          <span className="text-left">네이버 로그인</span>
        </div>
      )}
    </button>
  );
};

export default ButtonNaverLogin;
