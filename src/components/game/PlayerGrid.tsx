import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../../types/game.types';

interface PlayerGridProps {
  players: Player[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
  theme?: 'blood' | 'mystic' | 'poison' | 'default';
  disabled?: boolean;
}

export const PlayerGrid = ({ players, onSelect, selectedId, theme = 'default', disabled = false }: PlayerGridProps) => {
  const getThemeClass = () => {
    if (theme === 'blood') return 'border-blood shadow-[0_0_15px_rgba(139,26,26,0.5)]';
    if (theme === 'mystic') return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
    if (theme === 'poison') return 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]';
    return '';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto my-6">
      {players.map(player => (
        <div 
          key={player.id} 
          className={`transition-all duration-300 rounded-xl ${selectedId === player.id ? getThemeClass() : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <PlayerCard
            player={player}
            isSelected={selectedId === player.id}
            onClick={() => onSelect(player.id)}
            size="md"
          />
        </div>
      ))}
    </div>
  );
};
