import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import type { GameState } from '../types/game.types';
import PartySocket from 'partysocket';

interface BroadcastMessage {
  type: 'STATE_UPDATE' | 'JOIN' | 'LEAVE' | 'REQUEST_STATE' | 'PLAYER_ACTION';
  payload: unknown;
  senderId: string;
  timestamp: number;
}

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "localhost:1999";

export const useBroadcast = (roomCode: string) => {
  const socketRef = useRef<PartySocket | null>(null);
  const currentPlayerId = useGameStore(s => s.currentPlayerId);

  // Setup channel
  useEffect(() => {
    if (!roomCode || !currentPlayerId) return;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode,
    });
    socketRef.current = socket;

    socket.addEventListener("message", (event) => {
      const { type, payload, senderId } = JSON.parse(event.data);
      if (senderId === currentPlayerId) return;

      const state = useGameStore.getState();
      const isHost = state.players.find(p => p.id === state.currentPlayerId)?.isHost ?? false;

      switch (type) {
        case 'JOIN': {
          if (isHost) {
            const { playerId, playerName } = payload as { playerId: string; playerName: string };
            const exists = state.players.some(p => p.id === playerId);
            if (!exists) {
              const newPlayer = {
                id: playerId,
                name: playerName,
                role: null,
                isAlive: true,
                isHost: false,
                hasVoted: false,
                votedFor: null,
                protectedByWitch: false,
                killedByWitch: false,
                isCouple: false,
              };
              useGameStore.setState({ players: [...state.players, newPlayer] });
            }
            setTimeout(() => {
              const freshState = useGameStore.getState();
              socket.send(JSON.stringify({
                type: 'STATE_UPDATE',
                payload: extractSyncState(freshState),
                senderId: currentPlayerId,
                timestamp: Date.now(),
              }));
            }, 100);
          }
          break;
        }

        case 'STATE_UPDATE': {
          const syncPayload = payload as Partial<GameState>;
          useGameStore.setState({ ...syncPayload });
          break;
        }

        case 'REQUEST_STATE': {
          if (isHost) {
            socket.send(JSON.stringify({
              type: 'STATE_UPDATE',
              payload: extractSyncState(state),
              senderId: currentPlayerId,
              timestamp: Date.now(),
            }));
          }
          break;
        }

        case 'LEAVE': {
          const { playerId } = payload as { playerId: string };
          if (isHost) {
            const updatedPlayers = state.players.filter(p => p.id !== playerId);
            useGameStore.setState({ players: updatedPlayers });
            setTimeout(() => {
              const freshState = useGameStore.getState();
              socket.send(JSON.stringify({
                type: 'STATE_UPDATE',
                payload: extractSyncState(freshState),
                senderId: currentPlayerId,
                timestamp: Date.now(),
              }));
            }, 100);
          }
          break;
        }
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomCode, currentPlayerId]);

  const broadcast = useCallback((type: string, payload: unknown) => {
    if (!currentPlayerId || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({
      type,
      payload,
      senderId: currentPlayerId,
      timestamp: Date.now(),
    }));
  }, [currentPlayerId]);

  const broadcastState = useCallback(() => {
    const state = useGameStore.getState();
    broadcast('STATE_UPDATE', extractSyncState(state));
  }, [broadcast]);

  return { broadcast, broadcastState };
};

function extractSyncState(state: GameState & { currentPlayerId: string | null }) {
  return {
    players: state.players,
    readyPlayers: state.readyPlayers,
    phase: state.phase,
    round: state.round,
    roomCode: state.roomCode,
    wolfVotes: state.wolfVotes,
    nightKillTarget: state.nightKillTarget,
    votes: state.votes,
    deadThisRound: state.deadThisRound,
    winner: state.winner,
    currentNightRole: state.currentNightRole,
    witchPotionUsed: state.witchPotionUsed,
    witchPoisonUsed: state.witchPoisonUsed,
    gameLog: state.gameLog,
    config: state.config,
  };
}
