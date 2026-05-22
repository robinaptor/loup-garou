import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Role } from '../../types/game.types';

const ROLE_ICONS: Record<Role, { emoji: string; color: string; label: string; description: string }> = {
  'loup-garou': {
    emoji: '🐺',
    color: '#8b1a1a',
    label: 'Loup-Garou',
    description: 'Chaque nuit, éliminez un villageois avec vos congénères.',
  },
  'villageois': {
    emoji: '🏡',
    color: '#4a7c59',
    label: 'Villageois',
    description: 'Débusquez et éliminez les loups durant les votes du jour.',
  },
  'voyante': {
    emoji: '🔮',
    color: '#7b68ee',
    label: 'Voyante',
    description: 'Chaque nuit, découvrez la véritable identité d\'un joueur.',
  },
  'sorciere': {
    emoji: '🧪',
    color: '#2e8b57',
    label: 'Sorcière',
    description: 'Utilisez vos potions de vie et de mort une seule fois chacune.',
  },
  'chasseur': {
    emoji: '🏹',
    color: '#cd853f',
    label: 'Chasseur',
    description: 'À votre mort, emportez un joueur de votre choix avec vous.',
  },
  'cupidon': {
    emoji: '💘',
    color: '#ff69b4',
    label: 'Cupidon',
    description: 'La première nuit, désignez deux amoureux. S\'ils se séparent, ils meurent ensemble.',
  },
  'petite-fille': {
    emoji: '👁️',
    color: '#daa520',
    label: 'Petite Fille',
    description: 'Vous pouvez espionner les loups la nuit, mais risquez d\'être prise.',
  },
};

export const RoleIcon = ({
  role,
  size = 'md',
  showDescription = false,
}: {
  role: Role;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDescription?: boolean;
}) => {
  const info = ROLE_ICONS[role];
  const sizeMap = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-6xl', xl: 'text-8xl' };

  return (
    <div className="role-icon flex flex-col items-center text-center" style={{ '--role-color': info.color } as React.CSSProperties}>
      <span className={`${sizeMap[size]} drop-shadow-[0_0_8px_var(--role-color)]`}>{info.emoji}</span>
      {size !== 'sm' && (
        <p className="role-icon__label font-display font-bold tracking-wider mt-2" style={{ color: info.color }}>
          {info.label}
        </p>
      )}
      {showDescription && (
        <p className="role-icon__description text-sm opacity-80 mt-1 max-w-[200px] leading-snug">{info.description}</p>
      )}
    </div>
  );
};
