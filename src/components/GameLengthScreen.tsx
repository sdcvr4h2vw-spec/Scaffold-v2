import React, { useState } from 'react';
import { Button } from './Button';
import { GameDuration, Player } from '../../types';

interface GameLengthScreenProps {
  players: Player[];
  onBack: () => void;
  onPlay: (duration: GameDuration) => void;
}

const DURATIONS: GameDuration[] = [5, 10, 15];

export const GameLengthScreen: React.FC<GameLengthScreenProps> = ({
  players,
  onBack,
  onPlay,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<GameDuration>(10);

  return (
    <div className="h-full w-full flex flex-col bg-scaffold-red text-white">
      <div className="flex-1 px-6 pt-12 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-2">
          Length of play?
        </h2>
        
        {/* Duration Selectors */}
        <div className="flex gap-4 w-full justify-center max-w-md mb-6 mt-8">
          {DURATIONS.map((dur) => (
            <button
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              className={`
                flex-1 aspect-square rounded-xl flex flex-col items-center justify-center transition-all
                ${selectedDuration === dur 
                  ? 'bg-scaffold-cream text-scaffold-red shadow-[0_4px_0_0_#D4B886] transform -translate-y-1' 
                  : 'bg-black/20 text-white/70 hover:bg-black/30'}
              `}
            >
              <span className="text-4xl font-bold leading-none">{dur}</span>
              <span className="text-xs font-medium uppercase mt-1">mins</span>
            </button>
          ))}
        </div>

        {/* Info Text */}
        <p className="text-white/60 text-xs text-center max-w-xs italic mb-10">
          As the timer pauses in between turns, the game will last longer than the selected time
        </p>

        {/* Player Summary */}
        <div className="w-full max-w-md">
           <h3 className="text-scaffold-cream text-sm font-bold uppercase tracking-widest mb-4 text-center border-b border-white/10 pb-2">
            Players
           </h3>
           <div className="flex flex-wrap justify-center gap-2">
             {players.map(p => (
               <span key={p.id} className="bg-black/20 px-3 py-1 rounded-full text-sm font-medium">
                 {p.name}
               </span>
             ))}
           </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 flex gap-4 max-w-md mx-auto w-full">
        <div className="w-1/3">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={onBack} 
            className="text-white hover:bg-white/10 border-2 border-white/20"
          >
            Back
          </Button>
        </div>
        <div className="w-2/3">
          <Button variant="cream" fullWidth onClick={() => onPlay(selectedDuration)}>
            Play
          </Button>
        </div>
      </div>
    </div>
  );
};
