import React, { useState } from 'react';
import MatchSetup from './components/MatchSetup';
import Scoreboard from './components/Scoreboard';
import { stopSpeech } from './utils/audio';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchConfig, setMatchConfig] = useState(null);

  const handleStartMatch = (config) => {
    setMatchConfig(config);
    setIsPlaying(true);
  };

  const handleBackToSetup = () => {
    stopSpeech(); // Stop any pending voice notifications
    setIsPlaying(false);
    setMatchConfig(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen">
      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center py-4">
        {isPlaying && matchConfig ? (
          <Scoreboard matchConfig={matchConfig} onBackToSetup={handleBackToSetup} />
        ) : (
          <MatchSetup onStart={handleStartMatch} />
        )}
      </main>

      {/* Premium Dark Theme Footer */}
      <footer className="w-full py-4 text-center border-t border-carbon-border/20 text-gray-600 text-xs font-mono">
        <div>DSCORE &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}

export default App;
