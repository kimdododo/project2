"use client";

import { useState } from "react";
import apiClient from "@/libs/api";
import config from "@/config";
import { Zap } from "lucide-react";
import * as PortOne from "@portone/browser-sdk/v2";

// 포트원 V2 모듈 적용
// 결제 처리 버튼과 결제 클라이언트 요청 로직이 있음
// 개발 참고 문서 : https://developers.portone.io/opi/ko/integration/ready/readme?v=v2
const ButtonCheckout = ({ item }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 포트원 관련 결제 처리
      const response = await PortOne.requestPayment({
        // Store ID 설정
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
        // 채널 키 설정
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: item.name,
        totalAmount: item.amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
      });

      console.log("response", response);

      // 결제 상태에 따른 리다이렉트
      if (response.transactionType !== "PAYMENT") {
        alert("결제가 실패했습니다. 다시 시도해주세요.");
      } else {
        // 결제 성공시 다시 서버를 통해 결제 확인 및 완료 처리를 진행합니다.
        apiClient.post("/payment/complete", {
          paymentId: response.paymentId,
          order: item,
        });
      }
    } catch (error) {
      console.error("결제 처리 중 오류가 발생했습니다:", error);
      alert("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="btn btn-primary btn-block text-xs group"
      onClick={() => handlePayment()}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <Zap className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-200" />
      )}
      {config?.appName} 구매하기
    </button>
  );
};

export default ButtonCheckout;
