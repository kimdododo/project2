"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

const messages = [
  "여행의 시작을 환영합니다! ✈️",
  "현재 127명이 새로운 여행을 계획하고 있어요 🗺️",
  "지금 238명이 여행 정보를 탐색 중입니다 🧳",
  "오늘 하루 32명이 여행을 시작했어요 🌍",
  "새로운 모험을 찾고 계신가요? 🏔️",
  "여행 일정을 세우는 중이에요 📅",
  "다음 여행지로 떠날 준비가 되었어요! 🎒",
  "여행의 설렘을 느껴보세요 🌟",
  "세계 곳곳의 이야기를 들어보세요 🌏",
  "여행의 순간들을 기록해보세요 📸",
];

export function AutoToast() {
  useEffect(() => {
    let timer;
    // 사용 가능한 메시지 인덱스 배열 (0번은 제외하고 시작)
    const availableIndices = Array.from(
      { length: messages.length - 1 },
      (_, i) => i + 1
    );

    // 첫 번째 메시지 표시 (2초 후)
    const firstTimer = setTimeout(() => {
      toast(messages[0], {
        duration: 4000,
        position: "top-right",
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          border: '2px solid #fbbf24',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#fbbf24',
          secondary: 'white',
        },
      });
    }, 2000);

    // 나머지 메시지들 순차적으로 랜덤 표시
    const showRandomMessage = () => {
      if (availableIndices.length === 0) return; // 모든 메시지를 다 보여줬다면 중단

      // 남은 메시지 중에서 랜덤하게 선택
      const randomArrayIndex = Math.floor(
        Math.random() * availableIndices.length
      );
      const messageIndex = availableIndices[randomArrayIndex];

      // 사용한 인덱스 제거
      availableIndices.splice(randomArrayIndex, 1);

      const randomDelay = Math.floor(Math.random() * (8000 - 5000) + 5000);

      timer = setTimeout(() => {
        toast(messages[messageIndex], {
          duration: 4000,
          position: "top-right",
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            border: '2px solid #fbbf24',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#fbbf24',
            secondary: 'white',
          },
        });
        showRandomMessage(); // 다음 메시지 예약
      }, randomDelay);
    };

    // 첫 메시지 후 5초 뒤에 랜덤 메시지 시작
    const initialTimer = setTimeout(() => {
      showRandomMessage();
    }, 5000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(initialTimer);
      clearTimeout(timer);
    };
  }, []);

  return null;
}
