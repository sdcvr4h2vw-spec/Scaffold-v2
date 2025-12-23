import React from 'react';
import { useGameContext } from '../context/GameContext';
import { Button } from './Button';
import { ArrowLeft, Check } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setGameStatus } = useGameContext();

  // Helper for the Toggle Switches (Top Section)
  const ToggleRow = ({ label, value, onChange }: { label: string, value: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm">
      <span className="text-[#2A4A62] text-lg font-bold">{label}</span>
      <button 
        onClick={() => onChange(!value)}
        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${value ? 'bg-[#335c81]' : 'bg-gray-300'}`}
      >
        <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  // Helper for the Game Mode Cards (Bottom Section)
  const GameModeCard = ({ 
    mode, 
    title, 
    desc, 
    disabled = false 
  }: { 
    mode: 'A' | 'B' | 'C' | 'D', 
    title: string, 
    desc: string,
    disabled?: boolean
  }) => {
    const isSelected = settings.gameMode === mode;
    
    return (
      <div 
        onClick={() => !disabled && updateSettings({ gameMode: mode })}
        className={`bg-white rounded-xl p-5 mb-3 shadow-sm flex items-start gap-4 transition-all border-2
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}
          ${isSelected ? 'border-[#335c81]' : 'border-transparent'}
        `}
      >
        <div className="flex-1">
          <h3 className="text-[#2A4A62] font-black text-xl mb-1">{title}</h3>
          <p className="text-slate-500 text-sm font-medium leading-tight">{desc}</p>
        </div>

        {/* Custom Radio Button / Checkbox UI */}
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
          ${isSelected ? 'bg-[#335c81] border-[#335c81]' : 'border-slate-300'}
        `}>
          {isSelected && <Check size={18} className="text-white" strokeWidth={4} />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-[#335c81] flex flex-col p-6 animate-fade-in overflow-y-auto">
      
      {/* Header */}
      <h1 className="text-center text-4xl font-bold text-[#FCEBCB] mb-8 mt-2">
        Settings
      </h1>

      {/* Section 1: Toggles */}
      <div className="bg-[#335c81]/50 rounded-2xl p-2 mb-6 border border-white/10">
        <ToggleRow 
          label="Voice instructions" 
          value={settings.voiceEnabled} 
          onChange={(v) => updateSettings({ voiceEnabled: v })} 
        />
        <ToggleRow 
          label="Sound" 
          value={settings.soundEnabled} 
          onChange={(v) => updateSettings({ soundEnabled: v })} 
        />
      </div>

      {/* Section 2: Game Modes */}
      <div className="bg-[#335c81]/50 rounded-2xl p-2 border border-white/10 mb-6">
        
        <GameModeCard 
          mode="A" 
          title="Game A" 
          desc="Follow instructions quickly against the clock" 
        />

        <GameModeCard 
          mode="B" 
          title="Game B" 
          desc="Game A but with experimental instruction cards" 
        />

        <GameModeCard 
          mode="C" 
          title="Game C" 
          desc="No time limit - each game lasts a set number of turns" 
          disabled // Placeholder
        />

        <GameModeCard 
          mode="D" 
          title="Game D" 
          desc="Whose animal will be highest when the game ends" 
          disabled // Placeholder
        />
      </div>

      {/* Done Button */}
      <div className="mt-auto pt-4">
        <Button 
          variant="cream" 
          fullWidth 
          onClick={() => setGameStatus('setup')}
        >
          Done
        </Button>
      </div>
    </div>
  );
};