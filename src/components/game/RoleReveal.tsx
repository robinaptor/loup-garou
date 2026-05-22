import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleIcon } from './RoleIcon';
import { Button } from '../ui/Button';
import type { Role } from '../../types/game.types';

export const RoleReveal = ({ role, onConfirm }: { role: Role; onConfirm: () => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/90 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center max-w-md w-full gap-8">
        <h2 className="text-3xl text-gold font-display text-center">Découvrez votre rôle</h2>
        
        <div 
          className="relative w-64 h-96 cursor-pointer"
          style={{ perspective: 1000 }}
          onClick={() => setIsFlipped(true)}
        >
          <motion.div
            className="w-full h-full relative"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front (Hidden) */}
            <div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-gold/40 flex items-center justify-center backface-hidden shadow-[0_0_30px_rgba(201,168,76,0.2)]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-6xl text-gold/60 font-display animate-pulse">?</div>
            </div>

            {/* Back (Revealed) */}
            <div 
              className="absolute inset-0 rounded-2xl bg-[#e8e0d0] border-4 border-double border-gold/80 flex flex-col items-center justify-center p-6 text-night backface-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.2)]"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <RoleIcon role={role} size="lg" showDescription />
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {!isFlipped ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-mist text-lg animate-bounce"
            >
              Cliquez pour révéler
            </motion.p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button onClick={onConfirm} size="lg">
                J'ai mémorisé
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
