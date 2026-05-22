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
  const baseStyles = 'inline-flex items-center justify-center font-display tracking-widest uppercase transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blood/90 text-[#e8e0d0] border border-blood hover:bg-blood hover:shadow-[0_0_15px_rgba(139,26,26,0.6)]',
    secondary: 'bg-mist/50 text-[#c9a84c] border border-gold/30 hover:bg-mist/80 hover:border-gold/60',
    danger: 'bg-transparent text-red-500 border border-red-900/50 hover:bg-red-900/20 hover:border-red-500',
    ghost: 'bg-transparent text-gray-400 hover:text-[#e8e0d0]',
    green: 'bg-green-900/80 text-green-100 border border-green-700 hover:bg-green-800 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]',
    purple: 'bg-purple-900/80 text-purple-100 border border-purple-700 hover:bg-purple-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]',
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
      {children}
    </motion.button>
  );
};
