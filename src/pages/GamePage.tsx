import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useBroadcast } from '../hooks/useBroadcast';
import { RoleReveal } from '../components/game/RoleReveal';
import { PhaseAnnouncer } from '../components/game/PhaseAnnouncer';
import { NightAction } from '../components/game/NightAction';
import { DebateTimer } from '../components/game/DebateTimer';
import { VotePanel } from '../components/game/VotePanel';
import { DeathAnnounce } from '../components/game/DeathAnnounce';
import { Button } from '../components/ui/Button';

export const GamePage = () => {
  const { 
    roomCode, currentPlayerId, players, readyPlayers, phase, config, 
    deadThisRound, advancePhase, checkWinCondition, markPlayerReady
  } = useGameStore();

  const { broadcastState } = useBroadcast(roomCode);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [showPhaseAnnouncer, setShowPhaseAnnouncer] = useState(false);
  const [showDeathAnnounce, setShowDeathAnnounce] = useState(false);

  // Trigger phase announcements and role reveals on phase changes
  useEffect(() => {
    if (phase === 'distribution-roles') {
      setShowRoleReveal(true);
    } else if (phase === 'nuit' || phase === 'jour-debat' || phase === 'jour-vote') {
      setShowPhaseAnnouncer(true);
    }

    if (phase === 'jour-debat' && deadThisRound.length > 0) {
      setShowDeathAnnounce(true);
    }
    // Ready check for host
    if (isHost && phase === 'distribution-roles' && readyPlayers.length > 0 && readyPlayers.length === players.length) {
      advancePhase();
      broadcastState();
    }

    // Quick win check for host
    if (isHost && phase !== 'distribution-roles') {
      const w = checkWinCondition();
      if (w) {
        useGameStore.setState({ winner: w, phase: 'fin' });
        broadcastState();
      }
    }
  }, [phase, deadThisRound.length, isHost, checkWinCondition, broadcastState, readyPlayers.length, players.length, advancePhase]);

  const handleRoleConfirm = () => {
    setShowRoleReveal(false);
    if (currentPlayerId) {
      markPlayerReady(currentPlayerId);
      setTimeout(() => broadcastState(), 50);
    }
  };

  const handlePhaseAnnounceComplete = () => {
    setShowPhaseAnnouncer(false);
  };

  const handleDeathAnnounceContinue = () => {
    setShowDeathAnnounce(false);
  };

  const handleDebateEnd = () => {
    if (isHost) {
      advancePhase();
      broadcastState();
    }
  };

  // Render sub-components based on state overrides
  if (showRoleReveal && currentPlayer?.role) {
    return <RoleReveal role={currentPlayer.role} onConfirm={handleRoleConfirm} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col pt-12 pb-24">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-white/5 bg-night/50 backdrop-blur-sm z-10">
        <div className="flex flex-col">
          <span className="text-xs text-mist uppercase tracking-widest">Phase Actuelle</span>
          <span className="text-lg text-gold font-display capitalize">{phase.replace('-', ' ')}</span>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-mist uppercase tracking-widest">Toi</span>
            <span className="text-lg text-white font-bold">{currentPlayer?.name}</span>
          </div>
        </div>
      </div>

      {showPhaseAnnouncer && <PhaseAnnouncer phase={phase} onComplete={handlePhaseAnnounceComplete} />}
      
      {showDeathAnnounce && phase === 'jour-debat' && (
        <DeathAnnounce 
          deadPlayers={players.filter(p => deadThisRound.includes(p.id))} 
          onContinue={handleDeathAnnounceContinue} 
        />
      )}

      {/* Main Game Content based on Phase */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {phase === 'distribution-roles' && !showRoleReveal && (
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl text-mist font-display animate-pulse mb-4">En attente des autres joueurs...</h2>
            <p className="text-mist/70">{readyPlayers.length} / {players.length} joueurs prêts</p>
          </div>
        )}

        {phase === 'nuit' && !showPhaseAnnouncer && (
          <NightAction />
        )}

        {phase === 'jour-debat' && !showPhaseAnnouncer && !showDeathAnnounce && (
          <div className="flex flex-col items-center text-center w-full max-w-2xl">
            <h2 className="text-4xl text-dawn font-display mb-6">Le Débat</h2>
            <p className="text-mist text-lg mb-8">
              Débattez pour trouver les Loups-Garous !
            </p>
            <DebateTimer duration={config.timerDebat} onEnd={handleDebateEnd} />
            {isHost && (
              <Button onClick={handleDebateEnd} variant="ghost" className="mt-8">
                Passer le débat (Hôte)
              </Button>
            )}
          </div>
        )}

        {phase === 'jour-vote' && !showPhaseAnnouncer && (
          <VotePanel />
        )}
        
        {phase === 'chasseur-action' && (
          <div className="text-center p-8">
            <h2 className="text-4xl text-orange-500 font-display mb-4">🏹 Action du Chasseur</h2>
            <p className="text-mist">Le chasseur est mort. Il doit choisir une cible à emporter avec lui.</p>
            {/* Here we would render a PlayerGrid for the hunter to choose, omitted for brevity, fallback to manual or host action. 
                For a complete implementation, we'd add it to NightAction or a specific component. */}
            {currentPlayer?.role === 'chasseur' ? (
              <Button onClick={() => {
                // Simplified: Hunter skips action for now if not fully implemented
                if (isHost) { advancePhase(); broadcastState(); }
              }}>Passer (Action non implémentée)</Button>
            ) : (
              <p className="text-gold mt-4 animate-pulse">En attente du chasseur...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
