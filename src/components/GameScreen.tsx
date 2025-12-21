import React, { useEffect, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { Button } from './Button';
import { Volume2, VolumeX } from 'lucide-react'; // Added VolumeX for the mute icon
import { playInstructionVoice } from '../utils/textToSpeech';

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

  // State to track if sound is muted (Defaults to false = Sound ON)
  const [isMuted, setIsMuted] = useState(false);

  // VOICE TRIGGER: Plays audio whenever a new instruction appears
  useEffect(() => {
    // Only play if the turn is active, not timed out, and NOT muted
    if (isTurnActive && !isTurnTimedOut && currentInstruction && !isMuted) {
      playInstructionVoice(currentInstruction.text);
    }
  }, [currentInstruction, isTurnActive, isTurnTimedOut, isMuted]);

  const handleQuit = () => {
    setGameStatus('setup');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Determine Background Color
  const bgClass = (isTurnActive && !isTurnTimedOut)
    ? "bg-[#335c81]" // Active Blue
    : "bg-scaffold-red"; // Ready/Timeout Red

  return (
    <div className={`h-full w-full flex flex-col relative transition-colors duration-500 ${bgClass} overflow-hidden`}>
      
      {/* Header (Shared) - Now with working Mute Toggle */}
      <div className="px-6 pt-6 flex justify-between items-center z-10 text-white/80">
         <div 
           className="hover:text-white cursor-pointer p-2 -ml-2 transition-colors"
           onClick={() => setIsMuted(!isMuted)}
           title={isMuted ? "Unmute" : "Mute"}
         >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
         </div>
         <button 
           onClick={handleQuit}
           className="font-bold text-sm uppercase tracking-wider hover:text-white transition-colors"
         >
           Quit
         </button>
      </div>

      {/* Global Game Timer */}
      <div className="w-full flex justify-center px-6 pt-2 mb-6 z-10">
         <div className="border border-[#FCEBCB] rounded-lg py-2 w-full max-w-[280px] text-center bg-black/5 backdrop-blur-sm transition-all duration-500">
           <div className="text-4xl font-light tracking-widest font-mono text-[#FCEBCB]">
             {formatTime(gameTimeRemaining)}
           </div>
         </div>
      </div>

      {/* --- SCENARIO 1: READY STATE --- */}
      {!isTurnActive && !isTurnTimedOut && (
        <div className="flex-1 flex flex-col items-center justify-between pb-12 px-6 animate-fade-in w-full">
          <div className="flex-1 flex flex-col justify-center items-center gap-6 w-full">
            <h2 className="text-6xl font-black text-white text-center drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
              {activePlayer?.name}
            </h2>
            <p className="text-3xl text-scaffold-cream font-bold opacity-90">
              Are you ready?
            </p>
          </div>
          <div className="w-full max-w-sm mt-8">
            <Button 
               variant="cream" 
               fullWidth 
               className="py-6 text-3xl shadow-xl normal-case tracking-tight"
               onClick={startTurn}
             >
               Go!
             </Button>
          </div>
        </div>
      )}

      {/* --- SCENARIO 2: ACTIVE TURN --- */}
      {isTurnActive && !isTurnTimedOut && (
        <div className="flex-1 flex flex-col items-center px-6 pb-8 animate-fade-in w-full">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-md opacity-90">
              {activePlayer?.name}
            </h2>
          </div>

          <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center min-h-0">
            {currentInstruction && (
              <button
                onClick={() => endTurn({ type: 'click' })}
                className="w-full bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-between text-center active:scale-[0.98] transition-transform duration-100 touch-manipulation group h-full max-h-[450px]"
              >
                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                  <p className="text-[#2A4A62] text-3xl md:text-4xl font-bold leading-tight">
                    {currentInstruction.text}
                  </p>
                  {currentInstruction.secondaryText && (
                    <p className="text-slate-500 text-lg md:text-xl font-medium leading-snug max-w-[90%]">
                      {currentInstruction.secondaryText}
                    </p>
                  )}
                </div>
                <div className="w-full pt-8 mt-auto">
                   <div className="w-full border-2 border-dashed border-[#2A4A62]/30 rounded-xl py-3 px-4 text-[#2A4A62]/60 font-bold text-sm uppercase tracking-[0.15em] group-hover:bg-[#2A4A62]/5 group-hover:border-[#2A4A62]/50 group-hover:text-[#2A4A62]/80 transition-all">
                     Tap to end turn
                   </div>
                </div>
              </button>
            )}
          </div>

          <div className="mt-auto pt-4 h-24 flex items-center justify-center">
             <div className={`text-7xl md:text-8xl font-bold text-white font-mono tracking-tight leading-none ${turnTimeRemaining <= 3 ? 'text-red-300 animate-pulse' : ''}`}>
               {turnTimeRemaining}
             </div>
          </div>
        </div>
      )}

      {/* --- SCENARIO 3: TIMEOUT --- */}
      {isTurnTimedOut && (
        <div className="flex-1 flex flex-col items-center justify-between pb-12 px-6 animate-shake w-full">
           <div className="flex-1 flex flex-col justify-center items-center w-full">
               <div className="w-full bg-black/20 border-2 border-white/20 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center backdrop-blur-md min-h-[300px]">
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-5xl font-bold text-white mb-6">
                      Out of time!
                    </p>
                    <p className="text-2xl text-white/90 font-medium">
                      Take one piece
                    </p>
                  </div>
               </div>
           </div>
           
           <div className="w-full max-w-sm mt-8">
             <Button 
               variant="cream" 
               fullWidth 
               className="py-6 text-3xl shadow-xl normal-case tracking-tight"
               onClick={acknowledgeTimeout}
             >
               Next Turn
             </Button>
          </div>
        </div>
      )}

    </div>
  );
};