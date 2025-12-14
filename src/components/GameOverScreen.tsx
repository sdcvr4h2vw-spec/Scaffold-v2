import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Button } from './Button';
import { Player } from '../../types';

export const GameOverScreen: React.FC = () => {
  const { players, setWinningPlayer, setGameStatus } = useGameContext();

  const handleWinnerSelect = (player: Player) => {
    setWinningPlayer(player);
    setGameStatus('winner');
  };

  return (
    <div className="h-full w-full flex flex-col bg-scaffold-red text-white animate-fade-in">
      <div className="flex-1 px-6 pt-12 flex flex-col items-center justify-center">
        
        {/* Timer 00:00 Display (Optional but nice for context) */}
        <div className="mb-8 w-full max-w-xs opacity-50">
           <div className="border border-white/30 rounded-lg p-2 text-center bg-black/10">
             <div className="text-4xl font-light tracking-widest font-mono text-white">
               0:00
             </div>
           </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-10 drop-shadow-md">
          Game over!
        </h2>

        <p className="text-xl font-medium text-white/90 mb-6">
          Who's got the <br/> fewest pieces? 🏆
        </p>

        <div className="w-full max-w-sm space-y-4">
          {players.map((player) => (
            <Button 
              key={player.id}
              variant="cream" 
              fullWidth
              onClick={() => handleWinnerSelect(player)}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};