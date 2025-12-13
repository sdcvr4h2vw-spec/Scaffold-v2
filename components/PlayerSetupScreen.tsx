import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Player } from '../types';
import { MAX_PLAYERS } from '../constants';
import { Plus, X } from 'lucide-react';

interface PlayerSetupScreenProps {
  initialPlayers: Player[];
  onBack: () => void;
  onContinue: (players: Player[]) => void;
}

export const PlayerSetupScreen: React.FC<PlayerSetupScreenProps> = ({
  initialPlayers,
  onBack,
  onContinue,
}) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  
  // Refs to access input elements for auto-focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Track if we just added a player to trigger focus
  const isAddingRef = useRef(false);

  useEffect(() => {
    if (isAddingRef.current) {
      const lastIndex = players.length - 1;
      const el = inputRefs.current[lastIndex];
      if (el) {
        el.focus();
        // The focus event will handle selection via handleFocus, 
        // but we can ensure it here too just in case.
        el.select(); 
      }
      isAddingRef.current = false;
    }
  }, [players]);

  // Focus effect for inputs - Select all text to allow "overtyping"
  // Using setTimeout prevents the browser's default click behavior (placing cursor)
  // from immediately deselecting the text.
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.target;
    setTimeout(() => {
      target.select();
    }, 10);
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleBlur = (id: string, name: string) => {
    // If empty, reset to default name "Player X"
    if (name.trim() === '') {
      setPlayers(prev => {
        const index = prev.findIndex(p => p.id === id);
        // Fallback name based on index position
        const defaultName = `Player ${index + 1}`;
        return prev.map(p => p.id === id ? { ...p, name: defaultName } : p);
      });
    }
  };

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      isAddingRef.current = true;
      // Generate a unique ID. 
      const newId = Date.now().toString(); 
      const newName = `Player ${players.length + 1}`;
      setPlayers([...players, { id: newId, name: newName }]);
    }
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="h-full w-full flex flex-col bg-scaffold-yellow text-scaffold-red">
      <div className="flex-1 px-6 pt-12 overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-sm">
          Who's playing?
        </h2>

        <div className="space-y-4 max-w-md mx-auto">
          {players.map((player, index) => (
            <div key={player.id} className="relative">
              <input
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                value={player.name}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(player.id, e.target.value)}
                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                className={`w-full bg-white/30 border-2 border-scaffold-red/30 focus:border-scaffold-red rounded-lg py-3 text-center font-bold text-lg text-scaffold-red/90 placeholder-scaffold-red/50 outline-none transition-all
                  ${index >= 2 ? 'pl-4 pr-12' : 'px-4'}
                `}
              />
              {index >= 2 && (
                <button
                  onClick={() => removePlayer(player.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-scaffold-red/50 hover:text-scaffold-red p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Remove player"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}

          {players.length < MAX_PLAYERS && (
            <button
              onClick={addPlayer}
              className="w-full py-3 border-2 border-dashed border-scaffold-red/40 text-scaffold-red/60 font-bold rounded-lg hover:bg-white/10 hover:border-scaffold-red hover:text-scaffold-red transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Player
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex gap-4 max-w-md mx-auto w-full">
        <div className="w-1/3">
          <Button variant="ghost" fullWidth onClick={onBack} className="border-2 border-scaffold-red/20">
            Back
          </Button>
        </div>
        <div className="w-2/3">
          <Button variant="primary" fullWidth onClick={() => onContinue(players)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};