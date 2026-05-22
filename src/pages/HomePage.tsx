import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/ui/Button';

export const HomePage = () => {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const { createRoom, joinRoom } = useGameStore();

  const handleCreate = () => {
    if (!name.trim()) return;
    const playerId = Math.random().toString(36).substring(2, 9);
    createRoom(name.trim(), playerId);
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCodeInput.trim()) return;
    const playerId = Math.random().toString(36).substring(2, 9);
    joinRoom(roomCodeInput.trim().toUpperCase(), name.trim(), playerId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-12"
      >
        <span className="text-6xl drop-shadow-[0_0_15px_var(--blood)] mb-4 block">🐺</span>
        <h1 className="text-5xl md:text-7xl text-blood drop-shadow-[0_0_10px_rgba(139,26,26,0.8)] tracking-widest mb-2">
          LOUP-GAROU
        </h1>
        <p className="text-gold/80 font-display text-xl tracking-[0.3em]">Le village s'éveille</p>
      </motion.div>

      <motion.div
        className="bg-night/80 border border-gold/30 p-8 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-md w-full backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-8 text-left">
          <label className="block text-gold/80 font-display mb-2 text-sm tracking-wider uppercase">Ton nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-mist/20 border-b-2 border-mist focus:border-gold outline-none px-4 py-3 text-xl transition-colors"
            placeholder="Ex: Villageois123"
            maxLength={15}
          />
        </div>

        <Button 
          onClick={handleCreate} 
          disabled={!name.trim()}
          className="w-full mb-8"
          size="lg"
        >
          Créer une partie
        </Button>

        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-mist/50"></div>
          </div>
          <span className="relative bg-night px-4 text-mist text-sm uppercase tracking-widest font-display">ou</span>
        </div>

        <div className="text-left mb-6">
          <label className="block text-gold/80 font-display mb-2 text-sm tracking-wider uppercase">Code room</label>
          <input
            type="text"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            className="w-full bg-mist/20 border-b-2 border-mist focus:border-gold outline-none px-4 py-3 text-xl tracking-widest text-center transition-colors uppercase"
            placeholder="XXX-XXX"
            maxLength={7}
          />
        </div>

        <Button 
          onClick={handleJoin} 
          disabled={!name.trim() || roomCodeInput.length < 6}
          variant="secondary"
          className="w-full"
        >
          Rejoindre
        </Button>
      </motion.div>
    </div>
  );
};
