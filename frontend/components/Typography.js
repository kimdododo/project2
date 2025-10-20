"use client";

import { motion } from 'framer-motion';

// 강한 대비와 명확한 계층을 위한 타이포그래피 시스템
export const Heading1 = ({ children, className = "" }) => (
  <motion.h1 
    className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
  >
    {children}
  </motion.h1>
);

export const Heading2 = ({ children, className = "" }) => (
  <motion.h2 
    className={`text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight tracking-tight ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
  >
    {children}
  </motion.h2>
);

export const Heading3 = ({ children, className = "" }) => (
  <motion.h3 
    className={`text-xl md:text-2xl font-semibold text-gray-700 leading-snug ${className}`}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
  >
    {children}
  </motion.h3>
);

export const BodyLarge = ({ children, className = "" }) => (
  <motion.p 
    className={`text-lg md:text-xl text-gray-600 leading-relaxed ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
  >
    {children}
  </motion.p>
);

export const Body = ({ children, className = "" }) => (
  <motion.p 
    className={`text-base md:text-lg text-gray-600 leading-relaxed ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.4 }}
  >
    {children}
  </motion.p>
);

export const Caption = ({ children, className = "" }) => (
  <motion.p 
    className={`text-sm text-gray-500 leading-normal ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.5 }}
  >
    {children}
  </motion.p>
);

// 강조 텍스트
export const Highlight = ({ children, className = "" }) => (
  <motion.span 
    className={`font-semibold text-blue-600 ${className}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    {children}
  </motion.span>
);

// 마이크로카피용 작은 텍스트
export const MicroCopy = ({ children, className = "" }) => (
  <motion.p 
    className={`text-xs text-gray-400 leading-tight ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2, delay: 0.6 }}
  >
    {children}
  </motion.p>
);
