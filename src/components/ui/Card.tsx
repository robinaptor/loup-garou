import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'default' | 'parchment';
}

export const Card = ({ children, variant = 'default', className = '', ...props }: CardProps) => {
  const baseStyle = 'rounded-xl overflow-hidden';
  const variants = {
    default: 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-gold/30 shadow-lg',
    parchment: 'bg-[#e8e0d0] text-night border-4 border-double border-gold/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]',
  };

  return (
    <motion.div
      className={`${baseStyle} ${variants[variant]} p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
