import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

import { PlayerGrid } from './PlayerGrid';
import { Button } from '../ui/Button';

interface VotePanelProps {
  broadcastState: () => void;
  broadcast: (type: string, payload: unknown) => void;
}

export const VotePanel = ({ broadcastState, broadcast }: VotePanelProps) => {
  const { 
    roomCode, currentPlayerId, players, votes,
    submitVote, resolveVote
  } = useGameStore();
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const alivePlayers = players.filter(p => p.isAlive);
  const isHost = currentPlayer?.isHost ?? false;

  const [localTarget, setLocalTarget] = useState<string | null>(null);
  const [hasVotedLocally, setHasVotedLocally] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const totalVotes = Object.keys(votes).length;
  const allVoted = totalVotes === alivePlayers.length;

  const handleVote = () => {
    if (localTarget && currentPlayerId) {
      submitVote(currentPlayerId, localTarget);
      setHasVotedLocally(true);
      if (isHost) {
        broadcastState();
      } else {
        broadcast('PLAYER_ACTION', { action: 'SUBMIT_VOTE', data: { voterId: currentPlayerId, targetId: localTarget } });
      }
    }
  };

  const handleReveal = () => {
    if (isHost) {
      setRevealing(true);
      // Wait a moment for drama, then resolve
      setTimeout(() => {
        resolveVote();
        broadcastState();
      }, 3000);
    }
  };

  if (!currentPlayer?.isAlive) {
    return (
      <div className="flex flex-col items-center p-6 text-center w-full">
        <h2 className="text-3xl text-mist font-display mb-4">Le village vote...</h2>
        <p className="text-mist/70 italic">Vous êtes mort(e). Observez en silence.</p>

        {isHost && (
          <div className="mt-12 border-t border-mist/30 pt-8 w-full">
            <p className="text-mist mb-4">Votes en cours : {totalVotes} / {alivePlayers.length}</p>
            <Button onClick={handleReveal} variant="danger" size="lg" disabled={!allVoted && !revealing}>
              {revealing ? 'Révélation en cours...' : 'Dépouiller les votes'}
            </Button>
            {!allVoted && <p className="text-xs text-red-400 mt-2">Vous pouvez forcer le dépouillement si des joueurs sont absents.</p>}
          </div>
        )}

        {revealing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-night/95 backdrop-blur-md"
          >
            <div className="text-center">
              <h2 className="text-6xl text-blood font-display mb-8 animate-pulse">Dépouillement...</h2>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 w-full">
      <h2 className="text-4xl text-blood font-display mb-2 drop-shadow-[0_0_10px_rgba(139,26,26,0.5)]">⚖️ Le Vote</h2>
      
      {!hasVotedLocally ? (
        <>
          <p className="text-mist mb-6 italic">Qui souhaitez-vous éliminer ?</p>
          <PlayerGrid 
            players={alivePlayers.filter(p => p.id !== currentPlayerId)}
            onSelect={setLocalTarget}
            selectedId={localTarget}
            theme="blood"
          />
          <Button onClick={handleVote} disabled={!localTarget} size="lg" className="mt-8">
            Voter
          </Button>
        </>
      ) : (
        <div className="text-center my-12">
          <p className="text-2xl text-gold font-display mb-4">A voté !</p>
          <p className="text-mist">En attente des autres joueurs...</p>
          <div className="mt-8 text-3xl text-mist font-bold">
            {totalVotes} / {alivePlayers.length}
          </div>
          
          {isHost && (
            <div className="mt-12 border-t border-mist/30 pt-8">
              <Button onClick={handleReveal} variant="danger" size="lg" disabled={!allVoted && !revealing}>
                {revealing ? 'Révélation en cours...' : 'Dépouiller les votes'}
              </Button>
              {!allVoted && <p className="text-xs text-red-400 mt-2">Vous pouvez forcer le dépouillement si des joueurs sont absents.</p>}
            </div>
          )}
        </div>
      )}

      {revealing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/95 backdrop-blur-md"
        >
          <div className="text-center">
            <h2 className="text-6xl text-blood font-display mb-8 animate-pulse">Dépouillement...</h2>
            {/* We could animate showing each vote here */}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
