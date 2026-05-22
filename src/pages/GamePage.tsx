import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useBroadcast } from '../hooks/useBroadcast';
import { RoleReveal } from '../components/game/RoleReveal';
import { PhaseAnnouncer } from '../components/game/PhaseAnnouncer';
import { NightAction } from '../components/game/NightAction';
import { DebateTimer } from '../components/game/DebateTimer';
import { VotePanel } from '../components/game/VotePanel';
import { DeathAnnounce } from '../components/game/DeathAnnounce';
import { PlayerGrid } from '../components/game/PlayerGrid';
import { Button } from '../components/ui/Button';

export const GamePage = () => {
  const { 
    roomCode, currentPlayerId, players, readyPlayers, phase, config, 
    deadThisRound, advancePhase, checkWinCondition, markPlayerReady,
    eliminateAndContinue
  } = useGameStore();

  const { broadcastState } = useBroadcast(roomCode);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [showPhaseAnnouncer, setShowPhaseAnnouncer] = useState(false);
  const [showDeathAnnounce, setShowDeathAnnounce] = useState(false);
  const [prevPhase, setPrevPhase] = useState(phase);
  const [hunterTarget, setHunterTarget] = useState<string | null>(null);

  // Trigger phase announcements and role reveals on phase changes
  useEffect(() => {
    if (phase === prevPhase) return;
    setPrevPhase(phase);

    if (phase === 'distribution-roles') {
      setShowRoleReveal(true);
    } else if (phase === 'nuit' || phase === 'jour-debat' || phase === 'jour-vote') {
      setShowPhaseAnnouncer(true);
    }

    // Always show death announce when entering jour-debat (even for peaceful nights)
    if (phase === 'jour-debat') {
      setShowDeathAnnounce(true);
    }
  }, [phase, prevPhase]);

  // Ready check for host (separate effect to avoid mixing concerns)
  useEffect(() => {
    if (isHost && phase === 'distribution-roles' && readyPlayers.length > 0 && readyPlayers.length === players.length) {
      advancePhase();
      setTimeout(() => broadcastState(), 50);
    }
  }, [isHost, phase, readyPlayers.length, players.length, advancePhase, broadcastState]);

  // Win check for host
  useEffect(() => {
    if (isHost && phase !== 'distribution-roles' && phase !== 'lobby') {
      const w = checkWinCondition();
      if (w) {
        useGameStore.setState({ winner: w, phase: 'fin' });
        setTimeout(() => broadcastState(), 50);
      }
    }
  }, [isHost, phase, players, checkWinCondition, broadcastState]);

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
      setTimeout(() => broadcastState(), 50);
    }
  };

  const handleHunterShoot = () => {
    if (hunterTarget) {
      // Kill the hunter + the target
      const hunterIds = deadThisRound.includes(currentPlayerId!) 
        ? [...deadThisRound, hunterTarget] 
        : [hunterTarget];
      eliminateAndContinue(hunterIds);
      setTimeout(() => broadcastState(), 50);
    }
  };

  // Render sub-components based on state overrides
  if (showRoleReveal && currentPlayer?.role) {
    return <RoleReveal role={currentPlayer.role} onConfirm={handleRoleConfirm} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col pt-14 pb-24">
      {/* Game Header */}
      <div className="fixed top-0 left-0 right-0 p-3 px-5 flex justify-between items-center border-b border-white/5 bg-night/80 backdrop-blur-md z-20">
        <div className="flex flex-col">
          <span className="text-[10px] text-mist uppercase tracking-widest">Phase</span>
          <span className="text-sm text-gold font-display capitalize">{phase.replace(/-/g, ' ')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-mist uppercase tracking-widest">Toi</span>
            <span className="text-sm text-white font-bold">{currentPlayer?.name}</span>
          </div>
          {currentPlayer?.role && (
            <span className="text-lg" title={currentPlayer.role}>
              {currentPlayer.role === 'loup-garou' ? '🐺' : 
               currentPlayer.role === 'voyante' ? '🔮' :
               currentPlayer.role === 'sorciere' ? '🧪' :
               currentPlayer.role === 'chasseur' ? '🏹' :
               currentPlayer.role === 'cupidon' ? '💘' :
               currentPlayer.role === 'petite-fille' ? '👁️' : '🏘️'}
            </span>
          )}
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
            <span className="text-6xl mb-6">⏳</span>
            <h2 className="text-3xl text-mist font-display animate-pulse mb-4">En attente des autres joueurs...</h2>
            <div className="bg-night/50 border border-mist/20 rounded-xl px-6 py-3 mt-2">
              <p className="text-gold font-display text-xl">{readyPlayers.length} / {players.length}</p>
              <p className="text-mist/60 text-sm">joueurs prêts</p>
            </div>
          </div>
        )}

        {phase === 'nuit' && !showPhaseAnnouncer && (
          <NightAction />
        )}

        {phase === 'jour-debat' && !showPhaseAnnouncer && !showDeathAnnounce && (
          <div className="flex flex-col items-center text-center w-full max-w-2xl">
            <span className="text-5xl mb-4">☀️</span>
            <h2 className="text-4xl text-dawn font-display mb-6">Le Débat</h2>
            <p className="text-mist text-lg mb-8">
              Débattez pour trouver les Loups-Garous !
            </p>
            <DebateTimer duration={config.timerDebat} onEnd={handleDebateEnd} />
            {isHost && (
              <Button onClick={handleDebateEnd} variant="ghost" className="mt-8">
                Passer au vote (Hôte)
              </Button>
            )}
          </div>
        )}

        {phase === 'jour-vote' && !showPhaseAnnouncer && (
          <VotePanel />
        )}
        
        {phase === 'chasseur-action' && (
          <div className="flex flex-col items-center text-center p-6 w-full max-w-2xl">
            <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">🏹</span>
            <h2 className="text-4xl text-orange-500 font-display mb-4">Action du Chasseur</h2>
            <p className="text-mist mb-6">Le chasseur est mort. Il emporte quelqu'un avec lui !</p>
            
            {currentPlayer?.role === 'chasseur' ? (
              <>
                <PlayerGrid 
                  players={players.filter(p => p.isAlive && p.id !== currentPlayerId)}
                  onSelect={setHunterTarget}
                  selectedId={hunterTarget}
                  theme="blood"
                />
                <Button onClick={handleHunterShoot} disabled={!hunterTarget} size="lg" className="mt-6">
                  Tirer ! 🏹
                </Button>
              </>
            ) : (
              <p className="text-gold mt-4 animate-pulse text-lg">En attente du chasseur...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
