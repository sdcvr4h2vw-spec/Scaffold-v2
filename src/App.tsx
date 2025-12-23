import React, { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { PlayerSetupScreen } from './components/PlayerSetupScreen';
import { GameLengthScreen } from './components/GameLengthScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { SettingsScreen } from './components/SettingsScreen'; // <--- IMPORT ADDED
import { Player, GameDuration, ScreenState } from './types';
import { GameProvider, useGameContext } from './context/GameContext';

// Inner component to consume the Context
const AppContent: React.FC = () => {
  const { 
    players, 
    setPlayers, 
    setDuration, 
    gameStatus, 
    setGameStatus,
    setWinningPlayer
  } = useGameContext();

  // Local view state for Setup Flow navigation
  const [currentSetupScreen, setCurrentSetupScreen] = useState<ScreenState>('splash');

  const handlePlayerSetupContinue = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    setCurrentSetupScreen('length');
  };

  const handleStartGame = (selectedDuration: GameDuration) => {
    setDuration(selectedDuration);
    setGameStatus('playing');
  };

  const handleNewGame = () => {
    // Reset necessary game state
    setGameStatus('setup');
    setWinningPlayer(null);
    setCurrentSetupScreen('players'); // Return to Player Setup
  };

  const handleRematch = () => {
    // Keep players, reset game state
    setGameStatus('setup');
    setWinningPlayer(null);
    setCurrentSetupScreen('length'); // Skip setup, go to length
  };

  // --- Render Logic ---

  // 1. Check for Settings Screen
  if (gameStatus === 'settings') {
    return <SettingsScreen />;
  }

  // 2. Check for Active Game States
  if (gameStatus === 'playing') {
    return <GameScreen />;
  }
  
  if (gameStatus === 'finished') {
     return <GameOverScreen />;
  }

  if (gameStatus === 'winner') {
    return <WinnerScreen onNewGame={handleNewGame} onRematch={handleRematch} />;
  }

  // 3. Default: Setup Flow (Splash -> Players -> Length)
  return (
    <>
      {currentSetupScreen === 'splash' && (
        <SplashScreen onPlay={() => setCurrentSetupScreen('players')} />
      )}

      {currentSetupScreen === 'players' && (
        <PlayerSetupScreen
          initialPlayers={players}
          onBack={() => setCurrentSetupScreen('splash')}
          onContinue={handlePlayerSetupContinue}
        />
      )}

      {currentSetupScreen === 'length' && (
        <GameLengthScreen
          players={players}
          onBack={() => setCurrentSetupScreen('players')}
          onPlay={handleStartGame}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <div className="w-full h-full font-sans antialiased">
        <AppContent />
      </div>
    </GameProvider>
  );
};

export default App;