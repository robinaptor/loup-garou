import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayerCard } from '../game/PlayerCard';
import type { Player } from '../../types/game.types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export const PlayerList = ({ players, currentPlayerId }: PlayerListProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl text-gold mb-4 border-b border-gold/30 pb-2 font-display tracking-widest uppercase">Joueurs ({players.length})</h3>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {players.map(player => (
          <motion.div key={player.id} variants={itemVariants}>
            <PlayerCard 
              player={player} 
              isCurrentPlayer={player.id === currentPlayerId}
              size="sm"
            />
          </motion.div>
        ))}
      </motion.div>
      {players.length === 0 && (
        <p className="text-mist italic text-center py-8">En attente de joueurs...</p>
      )}
    </div>
  );
};
