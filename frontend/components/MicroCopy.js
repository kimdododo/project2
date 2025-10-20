"use client";

import { motion } from 'framer-motion';

// 명확한 사용자 가이드를 위한 마이크로카피 시스템
export const HelpText = ({ children, className = "" }) => (
  <motion.p 
    className={`text-sm text-gray-500 leading-relaxed ${className}`}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    {children}
  </motion.p>
);

export const ErrorText = ({ children, className = "" }) => (
  <motion.p 
    className={`text-sm text-red-500 font-medium ${className}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.p>
);

export const SuccessText = ({ children, className = "" }) => (
  <motion.p 
    className={`text-sm text-green-500 font-medium ${className}`}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.p>
);

export const LoadingText = ({ children, className = "" }) => (
  <motion.p 
    className={`text-sm text-blue-500 font-medium ${className}`}
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    {children}
  </motion.p>
);

// 단계별 가이드
export const StepGuide = ({ step, total, title, description }) => (
  <motion.div 
    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="flex items-center mb-2">
      <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
        {step}
      </span>
      <span className="text-sm text-blue-600 font-medium">{title}</span>
    </div>
    <p className="text-sm text-blue-700 ml-9">{description}</p>
  </motion.div>
);

// 툴팁 스타일 가이드
export const TooltipGuide = ({ children, tooltip, position = "top" }) => (
  <motion.div 
    className="relative group"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    {children}
    <motion.div 
      className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
      } left-1/2 transform -translate-x-1/2`}
      initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
      whileHover={{ opacity: 1, y: 0 }}
    >
      {tooltip}
      <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
        position === "top" ? "top-full -mt-1" : "bottom-full -mb-1"
      } left-1/2 -translate-x-1/2`} />
    </motion.div>
  </motion.div>
);

// 진행 상태 표시
export const ProgressGuide = ({ current, total, label }) => (
  <motion.div 
    className="flex items-center space-x-2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex-1 bg-gray-200 rounded-full h-2">
      <motion.div 
        className="bg-blue-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </div>
    <span className="text-sm text-gray-600 font-medium">
      {current}/{total} {label}
    </span>
  </motion.div>
);
