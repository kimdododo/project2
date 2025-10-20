"use client";

import { motion } from 'framer-motion';

// 넉넉한 여백을 위한 스페이싱 시스템
export const Section = ({ children, className = "", spacing = "xl" }) => {
  const spacingClasses = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16", 
    lg: "py-16 md:py-20",
    xl: "py-20 md:py-24",
    xxl: "py-24 md:py-32"
  };

  return (
    <motion.section 
      className={`${spacingClasses[spacing]} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
};

export const Container = ({ children, className = "", size = "lg" }) => {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl", 
    xl: "max-w-7xl"
  };

  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

// 넉넉한 패딩을 가진 카드
export const SpacedCard = ({ children, className = "", padding = "lg" }) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10"
  };

  return (
    <motion.div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${paddingClasses[padding]} ${className}`}
      whileHover={{ 
        y: -2,
        shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// 넉넉한 간격의 그리드
export const SpacedGrid = ({ children, className = "", cols = 3, gap = "lg" }) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6", 
    lg: "gap-8",
    xl: "gap-10"
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// 넉넉한 여백의 버튼 그룹
export const ButtonGroup = ({ children, className = "", spacing = "md" }) => {
  const spacingClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6"
  };

  return (
    <div className={`flex flex-col ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};
