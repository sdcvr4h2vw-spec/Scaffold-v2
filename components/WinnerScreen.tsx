import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Button } from './Button';
import { ASSETS } from '../constants';
import { Volume2, Power } from 'lucide-react';

interface WinnerScreenProps {
  onNewGame: () => void;
  onRematch: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({ onNewGame, onRematch }) => {
  const { winningPlayer } = useGameContext();

  return (
    <div className="h-full w-full flex flex-col bg-scaffold-yellow text-scaffold-red animate-fade-in">
      
      {/* Minimal Header */}
      <div className="px-6 pt-6 flex justify-between items-center z-10">
         <div className="text-scaffold-red/60 hover:text-scaffold-red">
            <Volume2 size={24} />
         </div>
         <button 
           onClick={onNewGame}
           className="text-scaffold-red/60 hover:text-scaffold-red font-bold text-sm uppercase flex items-center gap-1"
         >
           Quit
         </button>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center -mt-10">
        
        <div className="w-32 mb-6 animate-bounce-slow">
           <img 
             src={ASSETS.TROPHY} 
             alt="Trophy" 
             className="w-full h-auto drop-shadow-xl"
           />
        </div>

        <h2 className="text-5xl font-black text-center mb-2 leading-tight drop-shadow-sm">
          {winningPlayer?.name}
        </h2>
        
        <p className="text-3xl font-bold text-center mb-8">
          Congratulations!
        </p>
      </div>

      {/* Footer Actions */}
      <div className="p-6 flex flex-col gap-3 max-w-sm mx-auto w-full mb-4">
        <Button variant="primary" fullWidth onClick={onRematch} className="py-5 text-xl">
          Rematch!
        </Button>
        <button 
          onClick={onNewGame}
          className="text-scaffold-red/60 font-bold hover:text-scaffold-red hover:bg-black/5 py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
        >
          New Game
        </button>
      </div>
    </div>
  );
};