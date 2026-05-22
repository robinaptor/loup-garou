import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { RoleIcon } from '../components/game/RoleIcon';
import { Button } from '../components/ui/Button';

export const ResultPage = () => {
  const { winner, players, gameLog, leaveRoom } = useGameStore();

  const handleRestart = () => {
    leaveRoom(); // Actually returning to home page or reset room state could be implemented, but leaving room is safest to restart clean.
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center p-6 pt-12 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className={`w-full text-center p-12 rounded-2xl mb-12 border-2 ${
          winner === 'loups' 
            ? 'bg-blood/20 border-blood shadow-[0_0_50px_rgba(139,26,26,0.4)]' 
            : winner === 'amoureux' 
            ? 'bg-pink-900/30 border-pink-500 shadow-[0_0_50px_rgba(255,105,180,0.4)]'
            : 'bg-green-900/30 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)]'
        }`}
        initial={{ scale: 0, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {winner === 'loups' ? (
          <>
            <span className="text-8xl drop-shadow-[0_0_15px_red]">🐺</span>
            <h1 className="text-5xl md:text-7xl font-display text-blood mt-6 mb-4">LES LOUPS ONT GAGNÉ</h1>
            <p className="text-xl text-mist">Le village a été dévoré...</p>
          </>
        ) : winner === 'amoureux' ? (
          <>
            <span className="text-8xl drop-shadow-[0_0_15px_pink]">💕</span>
            <h1 className="text-5xl md:text-7xl font-display text-pink-400 mt-6 mb-4">LES AMOUREUX ONT GAGNÉ</h1>
            <p className="text-xl text-mist">L'amour triomphe de tout.</p>
          </>
        ) : (
          <>
            <span className="text-8xl drop-shadow-[0_0_15px_green]">🏡</span>
            <h1 className="text-5xl md:text-7xl font-display text-green-400 mt-6 mb-4">LE VILLAGE A GAGNÉ</h1>
            <p className="text-xl text-mist">Les loups sont éliminés !</p>
          </>
        )}
      </motion.div>

      <h2 className="text-3xl text-gold font-display mb-8">Révélation des rôles</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full mb-12">
        {players.map((player, i) => (
          <motion.div
            key={player.id}
            className={`relative flex flex-col items-center bg-night/80 border border-gold/30 rounded-xl p-6 overflow-hidden ${!player.isAlive ? 'opacity-70 grayscale' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <RoleIcon role={player.role!} />
            <p className="font-display font-bold text-lg mt-4">{player.name}</p>
            <p className="text-sm text-gold/80 uppercase tracking-widest">{player.role}</p>
            
            {!player.isAlive && (
              <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center pointer-events-none">
                <span className="text-6xl opacity-50 rotate-[-15deg]">💀</span>
              </div>
            )}
            {player.isCouple && (
              <div className="absolute top-2 right-2">
                <span className="text-2xl drop-shadow-[0_0_5px_pink]">💕</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Button onClick={handleRestart} size="lg" className="mb-12">
        🔄 Quitter et Menu Principal
      </Button>
    </motion.div>
  );
};
