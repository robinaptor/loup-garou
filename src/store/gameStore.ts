import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, Player, Role, GameConfig, Team } from '../types/game.types';
import { generateRoomCode } from '../utils/roomSync';

export interface GameStore extends GameState {
  currentPlayerId: string | null;
  
  // Actions room
  createRoom: (hostName: string, id: string) => string;
  joinRoom: (code: string, playerName: string, id: string) => boolean;
  leaveRoom: () => void;

  // Actions lobby
  updateConfig: (config: Partial<GameConfig>) => void;
  startGame: () => void;

  // Actions nuit
  setNightKillTarget: (targetId: string) => void;
  useSeerPower: (targetId: string) => Role | null;
  setWitchTarget: (targetId: string) => void;
  useWitchSave: () => void;
  useWitchKill: () => void;
  setCupidCouple: (player1Id: string, player2Id: string) => void;
  advanceNightRole: () => void;
  resolveNight: () => void;

  // Actions jour
  submitVote: (voterId: string, targetId: string) => void;
  resolveVote: () => void;
  eliminateAndContinue: (eliminatedIds: string[]) => void;

  // Phases
  advancePhase: () => void;
  checkWinCondition: () => Team | null;

  // Utilitaires
  getAlivePlayers: () => Player[];
  getAliveWolves: () => Player[];
  getAliveVillagers: () => Player[];
  syncFromBroadcast: (state: Partial<GameState>) => void;
}

const initialConfig: GameConfig = {
  roles: {
    'villageois': 0,
    'loup-garou': 0,
    'voyante': 0,
    'sorciere': 0,
    'chasseur': 0,
    'cupidon': 0,
    'petite-fille': 0,
  },
  timerDebat: 180,
  timerVote: 30,
};

const NIGHT_ORDER: Role[] = [
  'cupidon',      // Round 1 seulement
  'petite-fille', // Passive — peut espionner
  'loup-garou',   // Vote collectif
  'voyante',      // Voit un rôle
  'sorciere',     // Sauve ou tue
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentPlayerId: null,
      roomCode: '',
      phase: 'lobby',
      round: 0,
      players: [],
      config: initialConfig,
      nightKillTarget: null,
      witchPotionUsed: false,
      witchPoisonUsed: false,
      votes: {},
      deadThisRound: [],
      winner: null,
      currentNightRole: null,
      gameLog: [],

      syncFromBroadcast: (state) => set({ ...state }),

      createRoom: (hostName, id) => {
        // Implementation will generate a code and initialize the room
        const code = generateRoomCode();
        set({
          roomCode: code,
          currentPlayerId: id,
          players: [{
            id,
            name: hostName,
            role: null,
            isAlive: true,
            isHost: true,
            hasVoted: false,
            votedFor: null,
            protectedByWitch: false,
            killedByWitch: false,
            isCouple: false,
          }],
          phase: 'lobby',
          round: 0,
        });
        return code;
      },

      joinRoom: (code, playerName, id) => {
        // Set local identity. The actual player list will be synced from the host
        // after the JOIN broadcast is received and processed.
        set({
          roomCode: code,
          currentPlayerId: id,
          phase: 'lobby',
          players: [
            {
              id,
              name: playerName,
              role: null,
              isAlive: true,
              isHost: false,
              hasVoted: false,
              votedFor: null,
              protectedByWitch: false,
              killedByWitch: false,
              isCouple: false,
            }
          ]
        });
        return true;
      },

      leaveRoom: () => {
        set({ currentPlayerId: null, roomCode: '', players: [], phase: 'lobby' });
      },

      updateConfig: (config) => {
        set((state) => ({ config: { ...state.config, ...config } }));
      },

      startGame: () => {
        // Distribution of roles based on config and Fisher-Yates shuffle
        // Set phase to 'distribution-roles'
        const state = get();
        
        let rolesPool: Role[] = [];
        Object.entries(state.config.roles).forEach(([role, count]) => {
          for(let i=0; i<count; i++) rolesPool.push(role as Role);
        });
        
        // Shuffle roles
        for (let i = rolesPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
        }

        const newPlayers = state.players.map((p, i) => ({
          ...p,
          role: rolesPool[i] || 'villageois',
          isAlive: true,
          hasVoted: false,
          votedFor: null,
          protectedByWitch: false,
          killedByWitch: false,
          isCouple: false,
        }));

        set({
          players: newPlayers,
          phase: 'distribution-roles',
          round: 1,
          votes: {},
          deadThisRound: [],
          winner: null,
          currentNightRole: null,
          nightKillTarget: null,
          gameLog: [],
        });
      },

      setNightKillTarget: (targetId) => set({ nightKillTarget: targetId }),
      
      useSeerPower: (targetId) => {
        const target = get().players.find(p => p.id === targetId);
        return target ? target.role : null;
      },
      
      setWitchTarget: (targetId) => {
         const newPlayers = get().players.map(p => 
           p.id === targetId ? { ...p, killedByWitch: true } : p
         );
         set({ players: newPlayers });
      },

      useWitchSave: () => {
        const targetId = get().nightKillTarget;
        if (targetId) {
          const newPlayers = get().players.map(p => 
            p.id === targetId ? { ...p, protectedByWitch: true } : p
          );
          set({ players: newPlayers, witchPotionUsed: true });
        }
      },

      useWitchKill: () => {
        set({ witchPoisonUsed: true });
      },

      setCupidCouple: (player1Id, player2Id) => {
        const newPlayers = get().players.map(p => 
          (p.id === player1Id || p.id === player2Id) ? { ...p, isCouple: true } : p
        );
        set({ players: newPlayers });
      },

      advanceNightRole: () => {
        const { currentNightRole, round, players } = get();
        const presentRoles = NIGHT_ORDER.filter(role => {
          if (role === 'cupidon' && round > 1) return false;
          return players.some(p => p.role === role && p.isAlive);
        });
        
        const currentIndex = currentNightRole ? presentRoles.indexOf(currentNightRole) : -1;
        const nextRole = presentRoles[currentIndex + 1] ?? null;
        
        if (nextRole === null) {
          get().resolveNight();
        } else {
          set({ currentNightRole: nextRole });
        }
      },

      resolveNight: () => {
        const { nightKillTarget, players } = get();
        const deadThisRound: string[] = [];

        // 1. Victime des loups
        if (nightKillTarget) {
          const target = players.find(p => p.id === nightKillTarget);
          if (target && !target.protectedByWitch) {
            deadThisRound.push(nightKillTarget);
          }
        }

        // 2. Victime de la sorciere
        const witchVictim = players.find(p => p.killedByWitch);
        if (witchVictim && !deadThisRound.includes(witchVictim.id)) {
           deadThisRound.push(witchVictim.id);
        }

        // 3. Amoureux
        let finalDead = [...deadThisRound];
        deadThisRound.forEach(deadId => {
          const dead = players.find(p => p.id === deadId);
          if (dead?.isCouple) {
            const lover = players.find(p => p.isCouple && p.id !== deadId && p.isAlive);
            if (lover && !finalDead.includes(lover.id)) finalDead.push(lover.id);
          }
        });

        const updatedPlayers = players.map(p => ({
          ...p,
          isAlive: finalDead.includes(p.id) ? false : p.isAlive,
          protectedByWitch: false, // reset
          killedByWitch: false, // reset
        }));

        set({ 
          players: updatedPlayers, 
          deadThisRound: finalDead,
          phase: 'jour-debat',
          nightKillTarget: null,
          currentNightRole: null,
        });
      },

      submitVote: (voterId, targetId) => {
        set(state => ({
           votes: { ...state.votes, [voterId]: targetId }
        }));
      },

      resolveVote: () => {
        const { votes, players } = get();
        
        const voteCount: Record<string, number> = {};
        Object.values(votes).forEach(targetId => {
          voteCount[targetId] = (voteCount[targetId] ?? 0) + 1;
        });

        const maxVotes = Math.max(0, ...Object.values(voteCount));
        if (maxVotes === 0) {
           // nobody voted
           set({ deadThisRound: [], phase: 'nuit', round: get().round + 1, votes: {} });
           return;
        }

        const topCandidates = Object.entries(voteCount)
          .filter(([_, count]) => count === maxVotes)
          .map(([id]) => id);

        if (topCandidates.length > 1) {
          // Égalité
          set({ deadThisRound: [], phase: 'nuit', round: get().round + 1, votes: {} });
          return;
        }

        const eliminatedId = topCandidates[0];
        const eliminated = players.find(p => p.id === eliminatedId);
        
        if (eliminated?.role === 'chasseur') {
          set({ 
            deadThisRound: [eliminatedId],
            phase: 'chasseur-action',
          });
        } else {
          get().eliminateAndContinue([eliminatedId]);
        }
      },

      eliminateAndContinue: (eliminatedIds) => {
        const { players } = get();
        
        // Handle lovers
        let finalDead = [...eliminatedIds];
        eliminatedIds.forEach(deadId => {
          const dead = players.find(p => p.id === deadId);
          if (dead?.isCouple) {
            const lover = players.find(p => p.isCouple && p.id !== deadId && p.isAlive);
            if (lover && !finalDead.includes(lover.id)) finalDead.push(lover.id);
          }
        });

        const updatedPlayers = players.map(p => ({
          ...p,
          isAlive: finalDead.includes(p.id) ? false : p.isAlive,
        }));

        set({ 
          players: updatedPlayers, 
          deadThisRound: finalDead,
          phase: 'nuit',
          round: get().round + 1,
          votes: {}
        });
      },

      advancePhase: () => {
        const phase = get().phase;
        if (phase === 'distribution-roles') {
           set({ phase: 'nuit' });
        } else if (phase === 'jour-debat') {
           set({ phase: 'jour-vote' });
        }
      },

      checkWinCondition: () => {
        const alive = get().getAlivePlayers();
        const wolves = get().getAliveWolves();
        const villagers = get().getAliveVillagers();
        const lovers = alive.filter(p => p.isCouple);

        if (wolves.length === 0 && villagers.length > 0) return 'village';
        if (wolves.length >= villagers.length) return 'loups';
        if (alive.length === 2 && lovers.length === 2 && wolves.length === 1 && villagers.length === 1) return 'amoureux';
        
        return null;
      },

      getAlivePlayers: () => get().players.filter(p => p.isAlive),
      getAliveWolves: () => get().players.filter(p => p.isAlive && p.role === 'loup-garou'),
      getAliveVillagers: () => get().players.filter(p => p.isAlive && p.role !== 'loup-garou'),
    }),
    {
      name: 'werewolf-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ currentPlayerId: state.currentPlayerId }), // Just save the player's own identity locally here, the rest is synced by roomSync and broadcast
    }
  )
);
