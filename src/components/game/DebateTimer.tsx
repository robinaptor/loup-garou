import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

export const DebateTimer = ({
  duration,
  onEnd,
}: {
  duration: number;
  onEnd: () => void;
}) => {
  const [remaining, setRemaining] = useState(duration);
  const progress = remaining / duration;
  const isUrgent = remaining <= 30;

  useEffect(() => {
    if (remaining <= 0) { 
      onEnd(); 
      return; 
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onEnd]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="flex flex-col items-center justify-center my-8">
      <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a2e" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke={isUrgent ? '#8b1a1a' : '#c9a84c'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
          transform="rotate(-90 50 50)"
          animate={{ stroke: isUrgent ? ['#8b1a1a', '#ff4444', '#8b1a1a'] : '#c9a84c' }}
          transition={{ repeat: isUrgent ? Infinity : 0, duration: 0.5 }}
        />
        <text
          x="50" y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isUrgent ? '#ff4444' : '#c9a84c'}
          fontSize="20"
          fontFamily="Cinzel, serif"
          fontWeight="bold"
        >
          {minutes}:{seconds.toString().padStart(2, '0')}
        </text>
      </svg>
      <p className={`mt-4 font-display tracking-widest uppercase ${isUrgent ? 'text-red-500 animate-pulse' : 'text-gold'}`}>
        {isUrgent ? '⚠️ Temps presque écoulé !' : 'Temps de débat'}
      </p>
    </div>
  );
};
