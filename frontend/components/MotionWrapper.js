"use client";

import { motion } from 'framer-motion';

// 페이지 전환 애니메이션
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ 
      duration: 0.3, 
      ease: [0.4, 0.0, 0.2, 1] // Material Design easing
    }}
  >
    {children}
  </motion.div>
);

// 카드 호버 애니메이션
export const CardHover = ({ children, className = "" }) => (
  <motion.div
    className={className}
    whileHover={{ 
      y: -4,
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// 버튼 클릭 애니메이션
export const ButtonPress = ({ children, onClick, className = "" }) => (
  <motion.button
    className={className}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.1 }}
  >
    {children}
  </motion.button>
);

// 스크롤 애니메이션 (개선된 버전)
export const ScrollReveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6, 
      delay,
      ease: [0.4, 0.0, 0.2, 1]
    }}
  >
    {children}
  </motion.div>
);

// 로딩 스피너 애니메이션
export const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// 페이드 인 애니메이션
export const FadeIn = ({ children, delay = 0, duration = 0.5 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, delay }}
  >
    {children}
  </motion.div>
);
