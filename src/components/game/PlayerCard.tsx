import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../types/game.types';

interface PlayerCardProps {
  player: Player;
  showRole?: boolean;
  isSelected?: boolean;
  isCurrentPlayer?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerCard = ({
  player,
  showRole = false,
  isSelected = false,
  isCurrentPlayer = false,
  onClick,
  size = 'md',
}: PlayerCardProps) => {
  return (
    <motion.div
      className={`
        player-card
        player-card--${size}
        ${!player.isAlive ? 'player-card--dead' : ''}
        ${isSelected ? 'player-card--selected' : ''}
        ${isCurrentPlayer ? 'player-card--self' : ''}
      `}
      whileHover={player.isAlive && onClick ? { scale: 1.05, y: -4 } : {}}
      whileTap={player.isAlive && onClick ? { scale: 0.97 } : {}}
      onClick={player.isAlive ? onClick : undefined}
      layout
    >
      <div className="player-card__avatar">
        <span>{player.name.slice(0, 2).toUpperCase()}</span>
        {isCurrentPlayer && (
          <span className="absolute -top-2 -right-2 bg-gold text-night text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_5px_var(--gold)]">Toi</span>
        )}
        {player.isCouple && (
          <span className="absolute -bottom-2 -right-2 text-xl drop-shadow-[0_0_5px_#ff69b4]">💕</span>
        )}
        {player.isHost && (
          <span className="absolute -top-2 -left-2 text-xl drop-shadow-[0_0_5px_var(--gold)]">👑</span>
        )}
      </div>

      <p className="player-card__name font-display tracking-wider mt-2">{player.name}</p>

      {showRole && player.role && (
        <motion.div
          className="player-card__role flex flex-col items-center mt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* We assume RoleIcon isn't rendered directly here to avoid circular dependencies if not needed, or we just render an emoji */}
          <span className="text-xs uppercase text-gold/70">{player.role}</span>
        </motion.div>
      )}

      {!player.isAlive && (
        <motion.div
          className="player-card__dead-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-4xl drop-shadow-[0_0_10px_red]">💀</span>
        </motion.div>
      )}

      {isSelected && (
        <motion.div
          className="player-card__selection-ring"
          layoutId="selection-ring"
          transition={{ type: 'spring', stiffness: 300 }}
        />
      )}
    </motion.div>
  );
};
