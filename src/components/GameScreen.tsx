import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Button } from './Button';
import { Volume2 } from 'lucide-react';

export const GameScreen: React.FC = () => {
  const {
    activePlayer,
    gameTimeRemaining,
    turnTimeRemaining,
    currentInstruction,
    isTurnActive,
    isTurnTimedOut,
    startTurn,
    endTurn,
    acknowledgeTimeout,
    setGameStatus,
  } = useGameContext();

  const handleQuit = () => {
    // Reset to splash
    setGameStatus('setup');
  };

  // Format Seconds to MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Dynamic Styles based on Turn State ---
  
  // Container logic: 
  // Active -> White
  // Inactive (Ready) -> Teal (via overlay opacity)
  // Timed Out -> Red (hide Teal overlay)
  const containerClass = isTurnActive 
    ? "bg-white text-scaffold-red" 
    : "bg-scaffold-red/[0.95] text-white";

  const headerIconClass = isTurnActive
    ? "text-scaffold-red/60 hover:text-scaffold-red"
    : "text-white/60 hover:text-white";

  const quitButtonClass = isTurnActive
    ? "text-scaffold-red hover:text-scaffold-red/80"
    : "text-white hover:text-white/80";

  const timerContainerClass = isTurnActive
    ? "border-scaffold-red/20 bg-scaffold-red/5"
    : "border-scaffold-cream/30 bg-black/10";
  
  const timerTextClass = isTurnActive
    ? "text-scaffold-red"
    : "text-scaffold-cream";

  const playerNameClass = isTurnActive
    ? "text-scaffold-red"
    : "text-white";

  // Flash the turn timer when 3 seconds or less remain
  const turnTimerClass = isTurnActive && turnTimeRemaining <= 3
    ? "text-red-600 animate-pulse scale-110 duration-75"
    : "text-scaffold-red/90";

  return (
    <div className={`h-full w-full flex flex-col relative transition-colors duration-500 ${containerClass}`}>
      
      {/* Background Gradient - Only visible when turn is NOT active AND NOT timed out (Teal background) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-teal-700 to-teal-900 -z-10 transition-opacity duration-500 ${(isTurnActive || isTurnTimedOut) ? 'opacity-0' : 'opacity-100'}`} 
      />

      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center z-10">
         <div className={headerIconClass}>
            <Volume2 size={24} />
         </div>
         <button 
           onClick={handleQuit}
           className={`font-bold text-sm uppercase tracking-wider ${quitButtonClass}`}
         >
           Quit
         </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-8">
        
        {/* Global Game Timer */}
        <div className="mb-8 w-full max-w-xs transition-colors duration-300">
           <div className={`border rounded-lg p-2 text-center backdrop-blur-sm ${timerContainerClass}`}>
             <div className={`text-4xl font-light tracking-widest font-mono ${timerTextClass}`}>
               {formatTime(gameTimeRemaining)}
             </div>
           </div>
        </div>

        {/* Player Name */}
        <div className="mb-2 text-center">
          <h2 className={`text-4xl font-bold drop-shadow-md transition-colors duration-300 ${playerNameClass}`}>
            {activePlayer?.name || "Ready?"}
          </h2>
        </div>

        {/* Content Area: Instruction / Ready / Timeout */}
        <div className="flex-1 w-full max-w-sm flex items-center justify-center my-6">
          
          {isTurnActive && currentInstruction && !isTurnTimedOut && (
            // ACTIVE TURN CARD
            <div className="bg-scaffold-cream text-scaffold-red w-full aspect-square rounded-xl shadow-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
              <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">
                {currentInstruction.type === 'NEW' ? 'New Stack' : 
                 currentInstruction.type === 'ADD' ? 'Add Piece' : 
                 currentInstruction.type === 'KNOCK' ? 'Challenge' : 
                 currentInstruction.type === 'REMOVE' ? 'Remove' : 'Action'}
              </p>
              
              {/* Primary Main Text */}
              <p className="text-3xl font-bold leading-tight">
                {currentInstruction.text}
              </p>

              {/* Secondary Sub-Text (Rendered only if it exists) */}
              {currentInstruction.secondaryText && (
                <p className="mt-4 text-xl font-medium opacity-80 leading-snug">
                  {currentInstruction.secondaryText}
                </p>
              )}
              
              {/* Turn Timer Display */}
              <div className={`mt-8 text-6xl font-mono font-bold transition-all ${turnTimerClass}`}>
                 {turnTimeRemaining}
              </div>
            </div>
          )}
          
          {isTurnTimedOut && (
             // TIMEOUT CARD
             <div className="bg-white/10 border-2 border-white/20 w-full aspect-square rounded-xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm animate-shake">
                <p className="text-4xl font-bold text-white mb-4">
                  Out of time!
                </p>
                <p className="text-2xl text-white/80 font-medium">
                  Take one piece
                </p>
             </div>
          )}

          {!isTurnActive && !isTurnTimedOut && (
            // READY CARD
            <div className="bg-white/5 border-2 border-white/10 w-full aspect-square rounded-xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
               <p className="text-2xl font-medium text-white/80">
                 {activePlayer?.name}, are you ready?
               </p>
               <p className="mt-4 text-white/50 text-xl">
                 Don't touch any pieces until you hit <strong>GO!</strong>
               </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full max-w-sm mt-auto">
          {isTurnActive && !isTurnTimedOut && (
             <button
               onClick={endTurn}
               className="w-full py-6 bg-scaffold-red text-white font-bold text-2xl uppercase tracking-widest rounded-lg shadow-lg hover:bg-red-700 active:scale-[0.98] transition-all"
             >
               End Turn
             </button>
          )}

          {isTurnTimedOut && (
             <Button 
               variant="cream" 
               fullWidth 
               className="py-6 text-2xl"
               onClick={acknowledgeTimeout}
             >
               Next Turn
             </Button>
          )}

          {!isTurnActive && !isTurnTimedOut && (
             <Button 
               variant="cream" 
               fullWidth 
               className="py-6 text-2xl"
               onClick={startTurn}
             >
               GO!
             </Button>
          )}
        </div>

      </div>
    </div>
  );
};