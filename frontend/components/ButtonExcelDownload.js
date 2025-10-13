import React, { useState } from "react";
import toast from "react-hot-toast";
import { convertToExcel, downloadExcel } from "@/libs/utils";

const ButtonExcelDownload = ({ getDataFunction, fileName }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExcelDownload = async () => {
    setIsLoading(true);
    try {
      const data = await getDataFunction();
      const excelBuffer = convertToExcel(data.data);
      const fullFileName = `${fileName}_${new Date().toISOString()}.xlsx`;
      downloadExcel(excelBuffer, fullFileName);
      toast.success("엑셀 다운로드가 완료되었습니다.");
    } catch (error) {
      console.log("onError", error);
      toast.error("엑셀 다운로드에 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-success"
      onClick={handleExcelDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#000"
        >
          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
        </svg>
      )}
      엑셀 다운로드
    </button>
  );
};

export default ButtonExcelDownload;
