"use client";

import { useEffect, useRef } from 'react';

export default function WordCloud({ words, width = 400, height = 300 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !words || words.length === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    // 단어 데이터 정규화 (크기 0-1로)
    const maxCount = Math.max(...words.map(w => w.value));
    const minCount = Math.min(...words.map(w => w.value));
    const range = maxCount - minCount;

    // 색상 팔레트
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];

    // 단어 배치를 위한 격자
    const gridSize = 20;
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);
    const grid = Array(rows).fill().map(() => Array(cols).fill(false));

    // 단어를 크기순으로 정렬
    const sortedWords = [...words].sort((a, b) => b.value - a.value);

    sortedWords.forEach((word, index) => {
      // 크기 계산 (최소 12px, 최대 48px)
      const normalizedValue = range > 0 ? (word.value - minCount) / range : 0.5;
      const fontSize = Math.max(12, 12 + normalizedValue * 36);
      
      ctx.font = `${fontSize}px Arial, sans-serif`;
      const textWidth = ctx.measureText(word.text).width;
      const textHeight = fontSize;

      // 랜덤 위치에서 충돌 검사
      let attempts = 0;
      let x, y;
      
      do {
        x = Math.random() * (width - textWidth);
        y = Math.random() * (height - textHeight) + textHeight;
        attempts++;
      } while (
        attempts < 100 && 
        checkCollision(x, y, textWidth, textHeight, grid, gridSize)
      );

      if (attempts < 100) {
        // 격자에 표시
        markGrid(x, y, textWidth, textHeight, grid, gridSize);
        
        // 색상 선택
        const color = colors[index % colors.length];
        
        // 텍스트 그리기
        ctx.fillStyle = color;
        ctx.fillText(word.text, x, y);
      }
    });
  }, [words, width, height]);

  // 충돌 검사 함수
  const checkCollision = (x, y, width, height, grid, gridSize) => {
    const startCol = Math.floor(x / gridSize);
    const endCol = Math.floor((x + width) / gridSize);
    const startRow = Math.floor((y - height) / gridSize);
    const endRow = Math.floor(y / gridSize);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          if (grid[row][col]) return true;
        }
      }
    }
    return false;
  };

  // 격자에 표시 함수
  const markGrid = (x, y, width, height, grid, gridSize) => {
    const startCol = Math.floor(x / gridSize);
    const endCol = Math.floor((x + width) / gridSize);
    const startRow = Math.floor((y - height) / gridSize);
    const endRow = Math.floor(y / gridSize);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          grid[row][col] = true;
        }
      }
    }
  };

  return (
    <div className="word-cloud-container">
      <canvas 
        ref={canvasRef}
        className="border rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
