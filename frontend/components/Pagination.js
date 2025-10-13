import React from "react";

const Pagination = ({ totalPages, page, setPage }) => {
  // 페이지네이션을 위한 페이지 범위 계산
  const startPage = Math.floor((page - 1) / 10) * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);

  return (
    <div className="join">
      <button
        onClick={() => setPage(1)}
        disabled={page === 1 || totalPages === 0}
        className="join-item btn"
      >
        첫 페이지
      </button>
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1 || totalPages === 0}
        className="join-item btn"
      >
        이전
      </button>
      {Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      ).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`join-item btn ${pageNum === page ? "btn-active" : ""}`}
        >
          {pageNum}
        </button>
      ))}
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages || totalPages === 0}
        className="join-item btn"
      >
        다음
      </button>
      <button
        onClick={() => setPage(totalPages)}
        disabled={page === totalPages || totalPages === 0}
        className="join-item btn"
      >
        마지막 페이지
      </button>
    </div>
  );
};

export default Pagination;
