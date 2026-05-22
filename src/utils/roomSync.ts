import type { GameState } from '../types/game.types';

const ROOM_PREFIX = 'ww_room_';

export const saveRoomState = (code: string, state: Partial<GameState>) => {
  localStorage.setItem(`${ROOM_PREFIX}${code}`, JSON.stringify({
    ...state,
    updatedAt: Date.now(),
  }));
};

export const loadRoomState = (code: string): GameState | null => {
  const raw = localStorage.getItem(`${ROOM_PREFIX}${code}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearRoomState = (code: string) => {
  localStorage.removeItem(`${ROOM_PREFIX}${code}`);
};

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 3 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const part2 = Array.from({ length: 3 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${part1}-${part2}`;
};
