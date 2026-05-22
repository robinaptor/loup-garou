import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Phase } from '../../types/game.types';

export const PhaseAnnouncer = ({ phase, onComplete }: { phase: Phase; onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  let config = { text: '', icon: '', bg: '' };
  
  if (phase === 'nuit') {
    config = { text: "LA NUIT TOMBE...", icon: "🌙", bg: "from-night to-blue-900/50" };
  } else if (phase === 'jour-debat') {
    config = { text: "L'AUBE SE LÈVE...", icon: "☀️", bg: "from-night to-orange-900/50" };
  } else if (phase === 'jour-vote') {
    config = { text: "L'HEURE DU VOTE...", icon: "⚖️", bg: "from-night to-red-900/50" };
  } else {
    return null; // Don't announce other phases right now
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-t ${config.bg} backdrop-blur-md`}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-8xl mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            {config.icon}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-4xl md:text-6xl font-display text-gold tracking-[0.2em] text-center"
          >
            {config.text.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.05 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
