import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Role, GameConfig } from '../../types/game.types';
import { RoleIcon } from '../game/RoleIcon';
import { Button } from '../ui/Button';

interface RoleConfigProps {
  config: GameConfig;
  updateConfig: (config: Partial<GameConfig>) => void;
  isHost: boolean;
  totalPlayers: number;
}

export const RoleConfig = ({ config, updateConfig, isHost, totalPlayers }: RoleConfigProps) => {
  const handleRoleChange = (role: Role, increment: number) => {
    if (!isHost) return;
    const current = config.roles[role] || 0;
    const next = Math.max(0, current + increment);
    updateConfig({
      roles: { ...config.roles, [role]: next }
    });
  };

  const totalRoles = Object.values(config.roles).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full glass-panel rounded-xl p-6">
      <h3 className="text-xl text-gold mb-4 border-b border-gold/30 pb-2 flex justify-between font-display tracking-widest uppercase">
        <span>Configuration des rôles</span>
        <span className={`${totalRoles === totalPlayers ? 'text-green-400' : 'text-red-400'}`}>
          {totalRoles} / {totalPlayers}
        </span>
      </h3>
      
      <div className="flex flex-col gap-3">
        {(Object.keys(config.roles) as Role[]).map(role => {
          const count = config.roles[role];
          return (
            <div key={role} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 shadow-inner">
              <div className="flex items-center gap-3">
                <RoleIcon role={role} size="sm" />
                <span className="capitalize text-[#e8e0d0]">{role.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                {isHost ? (
                  <>
                    <button 
                      onClick={() => handleRoleChange(role, -1)}
                      className="w-8 h-8 flex-shrink-0 rounded-full bg-mist/20 hover:bg-mist/40 text-gold flex items-center justify-center transition-colors disabled:opacity-30"
                      disabled={count === 0}
                    >
                      -
                    </button>
                    <span className="w-6 flex-shrink-0 text-center font-bold text-lg">{count}</span>
                    <button 
                      onClick={() => handleRoleChange(role, 1)}
                      className="w-8 h-8 flex-shrink-0 rounded-full bg-mist/20 hover:bg-mist/40 text-gold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <span className="font-bold text-lg text-gold mr-2">{count}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isHost && totalRoles !== totalPlayers && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 mt-4 text-center text-sm"
        >
          Le nombre de rôles ({totalRoles}) doit correspondre au nombre de joueurs ({totalPlayers}).
        </motion.p>
      )}
    </div>
  );
};
