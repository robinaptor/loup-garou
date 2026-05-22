import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

export const RoomCode = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm uppercase tracking-widest text-gold/80 font-display">Code de la Room</p>
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center justify-center gap-3 bg-mist/30 border-2 border-gold/40 rounded-lg px-6 py-3 cursor-pointer overflow-hidden transition-colors hover:border-gold/80 hover:bg-mist/50"
      >
        <span className="font-display text-3xl font-bold tracking-[0.2em] text-[#e8e0d0]">{code}</span>
        <span className="text-xl">{copied ? '✅' : '📋'}</span>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>
      {copied && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-sm"
        >
          Copié dans le presse-papier !
        </motion.p>
      )}
    </div>
  );
};
