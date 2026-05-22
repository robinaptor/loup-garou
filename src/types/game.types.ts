export type Role = 
  | 'villageois' 
  | 'loup-garou' 
  | 'voyante' 
  | 'sorciere' 
  | 'chasseur' 
  | 'cupidon' 
  | 'petite-fille';

export type Phase = 
  | 'lobby' 
  | 'distribution-roles' 
  | 'nuit' 
  | 'jour-debat' 
  | 'jour-vote'
  | 'chasseur-action'
  | 'fin';

export type Team = 'village' | 'loups' | 'amoureux';

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  isAlive: boolean;
  isHost: boolean;
  hasVoted: boolean;
  votedFor: string | null;
  protectedByWitch: boolean;
  killedByWitch: boolean;
  isCouple: boolean; // Cupidon
}

export interface GameConfig {
  roles: Record<Role, number>;
  timerDebat: number; // secondes
  timerVote: number;
}

export interface GameState {
  roomCode: string;
  phase: Phase;
  round: number;
  players: Player[];
  readyPlayers: string[];
  config: GameConfig;
  nightKillTarget: string | null;      // cible des loups
  witchPotionUsed: boolean;
  witchPoisonUsed: boolean;
  votes: Record<string, string>;       // voterId -> targetId
  deadThisRound: string[];
  winner: Team | null;
  currentNightRole: Role | null;       // qui agit cette nuit
  gameLog: GameLogEntry[];
}

export interface GameLogEntry {
  round: number;
  phase: Phase;
  event: string;
  timestamp: number;
}

export interface RoomMessage {
  type: 'JOIN' | 'LEAVE' | 'STATE_UPDATE' | 'PLAYER_ACTION' | 'CHAT';
  payload: unknown;
  senderId: string;
  timestamp: number;
}
