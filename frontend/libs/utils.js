import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * ISO 날짜 문자열을 한국 날짜 형식으로 변환합니다
 * @param {string} isoString - ISO 형식의 날짜 문자열 (예: "2024-03-15T10:00:00Z")
 * @returns {string} 한국 날짜 형식의 문자열 (예: "2024.03.15 19:00")
 */
export function getFormattedDate(isoString) {
  if (!isoString) return "-";

  try {
    const date = new Date(isoString);

    // UTC를 한국 시간으로 변환 (UTC+9)
    const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = koreanDate.getUTCFullYear();
    const month = String(koreanDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(koreanDate.getUTCDate()).padStart(2, "0");
    const hours = String(koreanDate.getUTCHours()).padStart(2, "0");
    const minutes = String(koreanDate.getUTCMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error("날짜 변환 중 오류 발생:", error);
    return "-";
  }
}

// 데이터를 엑셀 형식으로 변환하는 함수
export const convertToExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
};

// 엑셀 파일을 다운로드하는 함수
export const downloadExcel = (excelBuffer, fileName) => {
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};
