import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { RoomCode } from '../components/room/RoomCode';
import { PlayerList } from '../components/room/PlayerList';
import { RoleConfig } from '../components/room/RoleConfig';
import { Button } from '../components/ui/Button';

interface LobbyPageProps {
  broadcastState: () => void;
  broadcast: (type: string, payload: unknown) => void;
}

export const LobbyPage = ({ broadcastState, broadcast }: LobbyPageProps) => {
  const { 
    roomCode, 
    players, 
    currentPlayerId, 
    config, 
    updateConfig, 
    startGame,
    leaveRoom
  } = useGameStore();

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  const handleUpdateConfig = (newConfig: Partial<typeof config>) => {
    updateConfig(newConfig);
    setTimeout(() => broadcastState(), 50);
  };

  const handleStartGame = () => {
    startGame();
    setTimeout(() => broadcastState(), 50);
  };

  const handleLeave = () => {
    broadcast('LEAVE', { playerId: currentPlayerId });
    useGameStore.getState().leaveRoom();
  };

  // On mount: if not host, send a JOIN request so the host adds us
  useEffect(() => {
    if (!roomCode || !currentPlayerId || !currentPlayer) return;
    
    if (!isHost) {
      // Send JOIN request to the host
      broadcast('JOIN', { playerId: currentPlayerId, playerName: currentPlayer.name });
      // Also request full state in case we missed anything
      broadcast('REQUEST_STATE', {});
    }
  }, [roomCode, currentPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalRoles = Object.values(config.roles).reduce((a, b) => a + b, 0);
  const canStart = isHost && players.length >= 4 && totalRoles === players.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-8"
    >
      <div className="flex justify-between items-start">
        <Button variant="ghost" size="sm" onClick={handleLeave}>← Quitter</Button>
        <RoomCode code={roomCode} />
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PlayerList players={players} currentPlayerId={currentPlayerId} />
        </div>
        
        <div className="flex flex-col gap-6">
          <RoleConfig 
            config={config} 
            updateConfig={handleUpdateConfig} 
            isHost={isHost}
            totalPlayers={players.length}
          />

          {isHost ? (
            <Button 
              size="lg" 
              onClick={handleStartGame}
              disabled={!canStart}
              className="w-full"
            >
              Lancer la partie
            </Button>
          ) : (
            <div className="text-center p-6 glass-panel rounded-xl">
              <p className="text-gold font-display animate-pulse uppercase tracking-widest text-sm">En attente de l'hôte...</p>
            </div>
          )}
          
          {isHost && players.length < 4 && (
            <p className="text-red-400 text-sm text-center">4 joueurs minimum requis.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
