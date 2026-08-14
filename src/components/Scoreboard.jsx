import React, { useEffect, useState } from 'react';
import { useBadminton } from '../hooks/useBadminton';
import ScoreCard from './ScoreCard';
import CourtVisualizer from './CourtVisualizer';
import MatchStats from './MatchStats';
import Controls from './Controls';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound, stopSpeech } from '../utils/audio';

export default function Scoreboard({ matchConfig: initialMatchConfig, onBackToSetup, matchId = null, isViewer = false, savedMatchState = null, savedTimer = null }) {
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const {
    state,
    timer,
    isTimerRunning,
    setIsTimerRunning,
    addPoint,
    decrementScore,
    undo,
    redo,
    toggleSides,
    dismissGameEnded,
    restartMatch,
    changeSettings,
    updateConfig,
    setServerManually,
    swapPositionsManually,
    canUndo,
    canRedo,
    matchConfig,
  } = useBadminton(initialMatchConfig, matchId, isViewer, savedMatchState, savedTimer);

  const {
    scoreA,
    scoreB,
    gamesA,
    gamesB,
    gameHistory,
    servingTeam,
    positions,
    matchEnded,
    gameEnded,
    winner,
    sidesSwapped,
    rallyTimeline,
  } = state;

  // Track if the match was already ended when we loaded it (e.g. viewing history)
  const prevMatchEnded = React.useRef(savedMatchState?.matchEnded || false);

  // Trigger confetti when match ends
  useEffect(() => {
    if (matchEnded && winner && !prevMatchEnded.current) {
      const duration = 4 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#CCFF00', '#00D180', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#CCFF00', '#00D180', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
    
    // Update the ref so we don't trigger it again if component re-renders
    prevMatchEnded.current = matchEnded;
  }, [matchEnded, winner]);

  // Handle score increments
  const handleScoreClick = (team) => {
    if (gameEnded || matchEnded) return;
    addPoint(team);
  };

  const playerANames = matchConfig.matchType === 'singles' 
    ? [matchConfig.playerA1] 
    : [matchConfig.playerA1, matchConfig.playerA2];

  const playerBNames = matchConfig.matchType === 'singles' 
    ? [matchConfig.playerB1] 
    : [matchConfig.playerB1, matchConfig.playerB2];

  // Logic to determine if Team A or Team B is at match/game point
  const checkPointStatus = (team) => {
    const target = matchConfig.targetPoints;
    const currentScore = team === 'A' ? scoreA : scoreB;
    const opponentScore = team === 'A' ? scoreB : scoreA;
    const currentGames = team === 'A' ? gamesA : gamesB;

    if (currentScore < target - 1) return { isGamePoint: false, isMatchPoint: false };
    
    // Check if team is leading by at least 1 and within reach of target
    const isLeading = currentScore >= target - 1 && currentScore > opponentScore;
    const isDeuceCap = currentScore === 29; // At 29-29, the next point (30) wins game

    if (isLeading || isDeuceCap) {
      if (currentGames === 1) {
        return { isGamePoint: false, isMatchPoint: true };
      }
      return { isGamePoint: true, isMatchPoint: false };
    }

    return { isGamePoint: false, isMatchPoint: false };
  };

  const statusA = checkPointStatus('A');
  const statusB = checkPointStatus('B');

  // Toggle voice announcer state
  const handleToggleVoice = () => {
    const nextVoiceState = !matchConfig.voiceEnabled;
    if (!nextVoiceState) {
      stopSpeech();
    }
    updateConfig({
      ...matchConfig,
      voiceEnabled: nextVoiceState
    });
  };

  // Build the two scorecard components based on visual side placement
  const renderScorecards = () => {
    const cardA = (
      <ScoreCard
        key="team-A"
        teamName="Tim A"
        players={playerANames}
        score={scoreA}
        gamesWon={gamesA}
        isServing={servingTeam === 'A'}
        isGamePoint={statusA.isGamePoint}
        isMatchPoint={statusA.isMatchPoint}
        themeColor="lemon"
        onClick={() => handleScoreClick('A')}
        onDecrement={() => decrementScore('A')}
        disabled={gameEnded || matchEnded || isViewer}
      />
    );

    const cardB = (
      <ScoreCard
        key="team-B"
        teamName="Tim B"
        players={playerBNames}
        score={scoreB}
        gamesWon={gamesB}
        isServing={servingTeam === 'B'}
        isGamePoint={statusB.isGamePoint}
        isMatchPoint={statusB.isMatchPoint}
        themeColor="ice"
        onClick={() => handleScoreClick('B')}
        onDecrement={() => decrementScore('B')}
        disabled={gameEnded || matchEnded || isViewer}
      />
    );

    // Swap ordering visually if sidesSwapped is active
    return sidesSwapped ? [cardB, cardA] : [cardA, cardB];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col h-full justify-between py-1 space-y-3 overflow-y-auto no-scrollbar">
      
      {/* Back Button — Aligned left on mobile, absolute top-left on desktop */}
      {!isViewer && (
        <div className="flex justify-start sm:block">
          <button
            onClick={() => {
              playSound('click');
              setShowHomeConfirm(true);
            }}
            className="sm:absolute sm:top-6 sm:left-6 z-40 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl transition-all"
            title="Kembali ke halaman utama"
          >
            Back
          </button>
        </div>
      )}

      {/* Header Info — Clean and Borderless */}
      <div className="flex justify-between items-center py-1">
        <div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest font-sans">Status Pertandingan</span>
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mt-0.5 font-sans">
            {matchConfig.matchType === 'singles' ? 'Tunggal' : 'Ganda'} 
            <span className="text-zinc-850">•</span> 
            Target {matchConfig.targetPoints} Poin
          </h2>
        </div>

        {/* Set Tracker Broadcaster */}
        <div className="flex gap-2">
          {gameHistory.map((h, i) => (
            <div key={i} className="text-xs bg-zinc-900/20 border border-zinc-850 rounded-lg px-2.5 py-1 text-zinc-500 font-sans font-bold">
              G{i+1}: <span className="text-[#FFF9CA]">{h.scoreA}</span>-<span className="text-[#E3FDFD]">{h.scoreB}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Scoreboards Grid (Side-by-side even on mobile) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {renderScorecards()}
      </div>

      {/* Controls Bar */}
      <Controls
        timer={timer}
        isTimerRunning={isTimerRunning}
        onToggleTimer={isViewer ? () => {} : () => setIsTimerRunning(!isTimerRunning)}
        onUndo={isViewer ? () => {} : undo}
        onRedo={isViewer ? () => {} : redo}
        onSwapSides={isViewer ? () => {} : toggleSides}
        onReset={isViewer ? () => {} : restartMatch}
        canUndo={isViewer ? false : canUndo}
        canRedo={isViewer ? false : canRedo}
        voiceEnabled={isViewer ? false : matchConfig.voiceEnabled}
        onToggleVoice={isViewer ? () => {} : handleToggleVoice}
      />

      {/* Court Layout & Statistics row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CourtVisualizer
            matchType={matchConfig.matchType}
            scoreA={scoreA}
            scoreB={scoreB}
            servingTeam={servingTeam}
            positions={positions}
            sidesSwapped={sidesSwapped}
            onSwapPositions={swapPositionsManually}
            playerA1={matchConfig.playerA1}
            playerB1={matchConfig.playerB1}
          />
        </div>
        <div className="lg:col-span-5">
          <MatchStats
            rallyTimeline={rallyTimeline}
            gameHistory={gameHistory}
            playerANames={playerANames}
            playerBNames={playerBNames}
            scoreA={scoreA}
            scoreB={scoreB}
          />
        </div>
      </div>

      {/* --- OVERLAYS --- */}

      {/* 1. Game Ended Modal */}
      {gameEnded && !matchEnded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">GAME SELESAI!</h3>
              <p className="text-gray-400 text-sm">
                Game ke-{gameHistory.length} telah selesai dimenangkan oleh{' '}
                <span className={`font-black ${
                  gameHistory[gameHistory.length - 1]?.scoreA > gameHistory[gameHistory.length - 1]?.scoreB
                    ? 'text-[#FFF9CA]'
                    : 'text-[#E3FDFD]'
                }`}>
                  {gameHistory[gameHistory.length - 1]?.scoreA > gameHistory[gameHistory.length - 1]?.scoreB
                    ? playerANames.join(' & ')
                    : playerBNames.join(' & ')
                  }
                </span>
              </p>
            </div>

            {/* Score Summary Box */}
            <div className="bg-zinc-900/40 rounded-2xl p-4">
              <div className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider mb-1">Skor Akhir Game</div>
              <div className="font-digital text-3xl font-black">
                <span className="text-[#FFF9CA]">{gameHistory[gameHistory.length - 1]?.scoreA}</span>
                <span className="text-gray-500 mx-2">-</span>
                <span className="text-[#E3FDFD]">{gameHistory[gameHistory.length - 1]?.scoreB}</span>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                dismissGameEnded();
              }}
              className="w-full py-3.5 bg-zinc-900 text-white font-bold hover:bg-zinc-800 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              Lanjutkan Game Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* 2. Match Ended (Winner) Screen */}
      {matchEnded && (
        <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto flex flex-col animate-fade-in">
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-6 sm:space-y-12 my-auto">
            
            <div className="text-center space-y-2 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest mb-2 sm:mb-4">
                Detail Pertandingan
              </h2>
              <h3 className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mt-2">Pemenang</h3>
              <h1 className={`text-3xl sm:text-6xl font-black tracking-tight uppercase ${winner === 'A' ? 'text-[#FFF9CA]' : 'text-[#E3FDFD]'}`}>
                {winner === 'A' ? playerANames.join(' & ') : playerBNames.join(' & ')}
              </h1>
            </div>

            <div className="w-full max-w-lg space-y-2">
              <div className="space-y-0 border-t border-b border-zinc-900/50 py-2">
                {gameHistory.map((game, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center py-3 sm:py-5 border-b border-zinc-900/50 last:border-0 gap-2 sm:gap-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full">
                      Set {idx + 1}
                    </span>
                    <div className="flex w-full items-center justify-between gap-3 sm:gap-6 mt-1">
                      {/* Team A */}
                      <div className="flex-1 text-right truncate">
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${game.scoreA > game.scoreB ? 'text-[#FFF9CA]' : 'text-zinc-500'}`}>
                          {playerANames.join(' & ')}
                        </span>
                      </div>
                      
                      {/* Scores */}
                      <div className="flex items-center justify-center gap-4 shrink-0 px-2">
                        <span className={`text-2xl sm:text-3xl font-black ${game.scoreA > game.scoreB ? 'text-[#FFF9CA]' : 'text-zinc-600'}`}>
                          {game.scoreA}
                        </span>
                        <span className="text-zinc-800 font-light text-xl">-</span>
                        <span className={`text-2xl sm:text-3xl font-black ${game.scoreB > game.scoreA ? 'text-[#E3FDFD]' : 'text-zinc-600'}`}>
                          {game.scoreB}
                        </span>
                      </div>

                      {/* Team B */}
                      <div className="flex-1 text-left truncate">
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${game.scoreB > game.scoreA ? 'text-[#E3FDFD]' : 'text-zinc-500'}`}>
                          {playerBNames.join(' & ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 sm:pt-8">
              <button
                onClick={() => { 
                  playSound('click'); 
                  if (savedMatchState) {
                    window.location.href = '/?history=true';
                  } else {
                    onBackToSetup(); 
                  }
                }}
                className="px-8 py-3.5 bg-[#FFF9CA] text-zinc-950 hover:bg-[#FFF5B2] font-black rounded-xl transition-all shadow-md active:scale-[0.98] uppercase tracking-wider text-xs"
              >
                {savedMatchState ? 'Kembali' : 'Kembali ke Beranda'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Home Confirmation Modal — Redesigned (No AI Slop) */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 max-w-sm w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Kembali ke Home?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Skor dan statistik pertandingan saat ini akan hilang sepenuhnya. Apakah Anda yakin?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  playSound('click');
                  setShowHomeConfirm(false);
                  onBackToSetup();
                }}
                className="py-3 px-4 bg-[#FFF9CA] text-zinc-950 hover:bg-[#FFF5B2] font-black rounded-xl text-xs transition-all shadow-md active:scale-[0.98]"
              >
                Ya, Kembali
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setShowHomeConfirm(false);
                }}
                className="py-3 px-4 rounded-xl border border-zinc-800 bg-transparent text-zinc-400 font-bold hover:bg-zinc-900 hover:text-white text-xs transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
