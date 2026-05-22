import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

import { PlayerGrid } from './PlayerGrid';
import { Button } from '../ui/Button';
import { RoleIcon } from './RoleIcon';
import type { Role } from '../../types/game.types';

const ROLE_NARRATION: Record<string, { icon: string; title: string; color: string }> = {
  'cupidon': { icon: '💘', title: 'Cupidon se réveille...', color: 'text-pink-400' },
  'petite-fille': { icon: '👁️', title: 'La Petite Fille entrouvre les yeux...', color: 'text-yellow-400' },
  'loup-garou': { icon: '🐺', title: 'Les Loups-Garous se réveillent...', color: 'text-blood' },
  'voyante': { icon: '🔮', title: 'La Voyante se réveille...', color: 'text-purple-400' },
  'sorciere': { icon: '🧪', title: 'La Sorcière se réveille...', color: 'text-green-400' },
};

interface NightActionProps {
  broadcastState: () => void;
}

export const NightAction = ({ broadcastState }: NightActionProps) => {
  const { 
    roomCode, currentPlayerId, players, currentNightRole, 
    nightKillTarget, witchPotionUsed, witchPoisonUsed, wolfVotes,
    setNightKillTarget, setWitchTarget, useWitchSave, useWitchKill, submitWolfVote,
    setCupidCouple, advanceNightRole 
  } = useGameStore();
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const alivePlayers = players.filter(p => p.isAlive);
  const isMyTurn = currentPlayer?.role === currentNightRole && currentPlayer?.isAlive;

  const [revealedRole, setRevealedRole] = useState<Role | null>(null);
  const [revealedPlayerName, setRevealedPlayerName] = useState<string>('');
  const [lovers, setLovers] = useState<string[]>([]);
  const [localTarget, setLocalTarget] = useState<string | null>(null);

  const handleNext = () => {
    advanceNightRole();
    setTimeout(() => broadcastState(), 50);
  };

  // === SLEEPING VIEW ===
  if (!isMyTurn) {
    const narration = currentNightRole ? ROLE_NARRATION[currentNightRole] : null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <span className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(100,100,200,0.3)]">🌙</span>
          <h2 className="text-4xl text-mist font-display mb-6">Le village dort...</h2>
          
          {narration && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-3 bg-night/80 border border-mist/20 rounded-xl px-6 py-4">
                <span className="text-3xl">{narration.icon}</span>
                <p className={`text-xl font-display ${narration.color}`}>
                  {narration.title}
                </p>
              </div>
              <p className="text-mist/50 text-sm italic mt-2">Gardez les yeux fermés...</p>
            </motion.div>
          )}

          {!currentNightRole && (
            <p className="text-mist/70 animate-pulse text-lg">Préparation de la nuit...</p>
          )}
        </motion.div>
      </div>
    );
  }

  // === LOUPS-GAROUS ===
  if (currentNightRole === 'loup-garou') {
    const handleWolfVote = () => {
      if (localTarget && currentPlayerId) {
        submitWolfVote(currentPlayerId, localTarget);
        setTimeout(() => broadcastState(), 50);
      }
    };

    const aliveWolves = alivePlayers.filter(p => p.role === 'loup-garou');
    const majorityThreshold = Math.floor(aliveWolves.length / 2) + 1;
    
    const voteCount: Record<string, number> = {};
    Object.values(wolfVotes).forEach(target => {
      voteCount[target] = (voteCount[target] ?? 0) + 1;
    });

    const myCurrentVote = currentPlayerId ? wolfVotes[currentPlayerId] : null;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 text-center">
        <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(139,26,26,0.6)]">🐺</span>
        <h2 className="text-4xl text-blood font-display mb-2">Choisissez votre victime</h2>
        <p className="text-mist mb-6 italic">Il faut {majorityThreshold} vote(s) pour dévorer une proie.</p>
        <PlayerGrid 
          players={alivePlayers.filter(p => p.role !== 'loup-garou')}
          onSelect={setLocalTarget}
          selectedId={localTarget || myCurrentVote}
          theme="blood"
        />
        
        <div className="mt-6 flex flex-col items-center">
          <Button 
            onClick={handleWolfVote} 
            disabled={!localTarget || localTarget === myCurrentVote} 
            size="lg" 
            className="mb-4"
          >
            {myCurrentVote ? 'Changer mon vote' : 'Voter pour dévorer 🐺'}
          </Button>
          
          {myCurrentVote && (
             <p className="text-blood font-bold text-lg animate-pulse">
               En attente des autres loups... ({voteCount[myCurrentVote]} / {majorityThreshold} votes)
             </p>
          )}
        </div>
      </motion.div>
    );
  }

  // === VOYANTE ===
  if (currentNightRole === 'voyante') {
    const handleSeerReveal = (id: string) => {
      const p = players.find(x => x.id === id);
      if (p) {
        setRevealedRole(p.role);
        setRevealedPlayerName(p.name);
      }
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 text-center">
        <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">🔮</span>
        <h2 className="text-4xl text-purple-400 font-display mb-6">Qui voulez-vous observer ?</h2>
        {!revealedRole ? (
          <PlayerGrid 
            players={alivePlayers.filter(p => p.id !== currentPlayerId)}
            onSelect={handleSeerReveal}
            theme="mystic"
          />
        ) : (
          <motion.div 
            className="bg-night border border-purple-500/50 rounded-xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <RoleIcon role={revealedRole} size="lg" />
            <p className="text-2xl mt-4 mb-8">{revealedPlayerName} est <strong className="text-gold capitalize">{revealedRole.replace('-', ' ')}</strong></p>
            <Button onClick={handleNext} variant="purple" size="lg">Terminer mon tour</Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // === SORCIERE ===
  if (currentNightRole === 'sorciere') {
    const victim = players.find(p => p.id === nightKillTarget);

    const doSave = () => {
      useWitchSave();
      handleNext();
    };

    const doKill = () => {
      if (localTarget) {
        setWitchTarget(localTarget);
        useWitchKill();
        handleNext();
      }
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 text-center w-full max-w-4xl">
        <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">🧪</span>
        <h2 className="text-4xl text-green-500 font-display mb-8">Vos potions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Potion de vie */}
          <div className="bg-night/50 border border-green-900/50 p-6 rounded-xl">
            <h3 className="text-2xl text-green-400 mb-4">💚 Potion de Vie</h3>
            {victim ? (
              <div className="mb-4">
                <p className="text-lg mb-4">Cette nuit, <strong className="text-blood text-xl">{victim.name}</strong> a été ciblé(e).</p>
                {!witchPotionUsed ? (
                  <Button variant="green" onClick={doSave}>Sauver ce joueur</Button>
                ) : (
                  <p className="text-mist">Potion de vie déjà utilisée.</p>
                )}
              </div>
            ) : (
              <p className="text-mist">Personne n'a été ciblé par les loups.</p>
            )}
          </div>

          {/* Potion de mort */}
          <div className="bg-night/50 border border-purple-900/50 p-6 rounded-xl">
            <h3 className="text-2xl text-purple-400 mb-4">💀 Potion de Mort</h3>
            {!witchPoisonUsed ? (
              <>
                <p className="mb-4 text-mist">Voulez-vous empoisonner quelqu'un ?</p>
                <div className="h-64 overflow-y-auto mb-4 custom-scrollbar">
                  <PlayerGrid 
                    players={alivePlayers.filter(p => p.id !== currentPlayerId)}
                    onSelect={setLocalTarget}
                    selectedId={localTarget}
                    theme="poison"
                  />
                </div>
                <Button variant="purple" onClick={doKill} disabled={!localTarget}>Empoisonner</Button>
              </>
            ) : (
              <p className="text-mist">Potion de mort déjà utilisée.</p>
            )}
          </div>
        </div>

        <Button variant="ghost" onClick={handleNext} className="mt-8">
          Ne rien faire et passer mon tour
        </Button>
      </motion.div>
    );
  }

  // === CUPIDON ===
  if (currentNightRole === 'cupidon') {
    const toggleLover = (id: string) => {
      if (lovers.includes(id)) {
        setLovers(lovers.filter(l => l !== id));
      } else if (lovers.length < 2) {
        setLovers([...lovers, id]);
      }
    };

    const confirmLovers = () => {
      if (lovers.length === 2) {
        setCupidCouple(lovers[0], lovers[1]);
        handleNext();
      }
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 text-center">
        <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(255,105,180,0.5)]">💘</span>
        <h2 className="text-4xl text-pink-500 font-display mb-6">Choisissez les Amoureux</h2>
        <p className="text-mist mb-6">Sélectionnez 2 joueurs qui seront liés pour la vie.</p>
        <PlayerGrid 
          players={alivePlayers}
          onSelect={toggleLover}
          selectedId={null}
        />
        {/* Custom highlighting for selected lovers */}
        <style>{`
          ${lovers.map(id => `
            .player-card[data-id="${id}"] {
              border-color: #ff69b4;
              box-shadow: 0 0 15px rgba(255,105,180,0.5);
            }
          `).join('')}
        `}</style>
        
        <p className="text-pink-300 my-4">{lovers.length}/2 sélectionnés</p>
        <Button onClick={confirmLovers} disabled={lovers.length !== 2} variant="primary" className="mt-2 bg-pink-600 hover:bg-pink-500 border-pink-400">
          Lier ces deux joueurs 💕
        </Button>
      </motion.div>
    );
  }

  // === PETITE FILLE ===
  if (currentNightRole === 'petite-fille') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center p-6 text-center">
        <span className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">👁️</span>
        <h2 className="text-4xl text-yellow-500 font-display mb-6">Petite Fille</h2>
        <p className="text-mist mb-6">Vous pouvez espionner les loups, mais attention à ne pas vous faire prendre !</p>
        <p className="text-yellow-300/70 italic mb-6">(Action passive — observez en silence)</p>
        <Button onClick={handleNext} size="lg">Terminer mon tour</Button>
      </motion.div>
    );
  }

  return null;
};
