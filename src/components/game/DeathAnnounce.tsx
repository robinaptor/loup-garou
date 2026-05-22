import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { RoleIcon } from './RoleIcon';
import type { Player } from '../../types/game.types';

export const DeathAnnounce = ({ 
  deadPlayers, 
  onContinue 
}: { 
  deadPlayers: Player[], 
  onContinue: () => void 
}) => {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night/95 backdrop-blur-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {deadPlayers.length === 0 ? (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center flex flex-col items-center"
          >
            <span className="text-8xl mb-6">😴</span>
            <h2 className="text-5xl text-gold font-display mb-4">Nuit paisible...</h2>
            <p className="text-xl text-mist">Personne n'est mort cette nuit.</p>
          </motion.div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {deadPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                className="bg-gradient-to-b from-[#2a0808] to-[#1a0505] border-2 border-blood rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(139,26,26,0.5)] max-w-sm"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.8, type: 'spring' }}
              >
                <motion.div
                  className="text-6xl mb-6 drop-shadow-[0_0_10px_red]"
                  animate={{ 
                    textShadow: ['0 0 0px #ff0000', '0 0 40px #ff0000', '0 0 0px #ff0000'],
                  }}
                  transition={{ repeat: 3, duration: 0.5 }}
                >
                  💀
                </motion.div>
                <h2 className="text-3xl font-display text-white mb-6">
                  <span className="text-blood">{player.name}</span> est mort(e).
                </h2>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.8 + 1.5 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-mist mb-4">Il/Elle était :</p>
                  <div className="bg-night/50 border border-gold/30 rounded-xl p-4 w-full flex justify-center">
                    <RoleIcon role={player.role!} size="lg" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: deadPlayers.length === 0 ? 2 : deadPlayers.length * 0.8 + 2.5 }}
          className="mt-12"
        >
          <Button onClick={onContinue} size="lg" variant="secondary">
            Continuer →
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
