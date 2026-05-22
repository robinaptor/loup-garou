import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'green' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-display tracking-widest uppercase transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group';
  
  const variants = {
    primary: 'bg-gradient-to-b from-[#8b1a1a] to-[#4a0a0a] text-gold border border-gold/40 shadow-[0_0_15px_rgba(139,26,26,0.5),inset_0_2px_0_rgba(255,255,255,0.1)] hover:from-[#a52121] hover:to-[#5a0c0c] hover:border-gold hover:shadow-[0_0_25px_rgba(201,168,76,0.6),inset_0_2px_0_rgba(255,255,255,0.2)]',
    secondary: 'bg-gradient-to-b from-[#2a2a3a] to-[#1a1a25] text-gold border border-gold/20 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-gold/60 hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]',
    danger: 'bg-gradient-to-b from-transparent to-[#2a0808] text-red-500 border border-red-900/50 hover:bg-[#3a0b0b] hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]',
    ghost: 'bg-transparent text-mist hover:text-gold hover:bg-white/5',
    green: 'bg-gradient-to-b from-green-900/80 to-green-950/90 text-green-300 border border-green-700/50 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    purple: 'bg-gradient-to-b from-purple-900/80 to-purple-950/90 text-purple-300 border border-purple-700/50 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base min-h-[48px]', // Minimum 48px height for accessibility
    lg: 'px-8 py-4 text-xl min-h-[64px]',
  };

  return (
    <motion.button
      whileHover={props.disabled ? {} : { scale: 1.02 }}
      whileTap={props.disabled ? {} : { scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 text-xl">{icon}</span>}
      {children as React.ReactNode}
    </motion.button>
  );
};
