import React from 'react';
import { ASSETS } from '../constants';
import { Button } from './Button';
import { Settings } from 'lucide-react';
// 1. IMPORT THE HOOK HERE
import { useGameContext } from '../context/GameContext';

interface SplashScreenProps {
  onPlay: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onPlay }) => {
  // 2. CALL THE HOOK HERE (Inside the component, before return)
  const { setGameStatus } = useGameContext();

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-between bg-gradient-to-b from-orange-400 via-pink-500 to-purple-900 overflow-hidden">
      
      {/* Settings Icon - Now Functional! */}
      <div 
        className="absolute top-6 right-6 z-20 text-white/80 cursor-pointer hover:text-white"
        onClick={() => setGameStatus('settings')}
      >
        <Settings size={28} />
      </div>

      {/* Cityscape Background Layer */}
      <div className="absolute bottom-0 left-0 w-full h-[90%] pointer-events-none z-0">
        <img
          src={ASSETS.CITYSCAPE}
          alt="Cityscape"
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 z-10 pt-40">
        {/* Logo */}
        <div className="w-64 md:w-80 mb-4 animate-fade-in-down">
          <img 
            src={ASSETS.LOGO} 
            alt="Scaffold Logo" 
            className="w-full h-auto drop-shadow-lg"
          />
        </div>

        {/* Tagline */}
        <p className="text-yellow-200 text-center text-lg md:text-xl font-medium max-w-xs drop-shadow-md mb-8">
          the fast-paced game of <br/>
          <span className="text-yellow-100 font-bold">bending & balancing</span>
        </p>
      </div>

      {/* Action Area */}
      <div className="w-full px-8 pb-12 z-20">
        <Button variant="cream" fullWidth onClick={onPlay} className="text-xl">
          Play
        </Button>
      </div>
    </div>
  );
};