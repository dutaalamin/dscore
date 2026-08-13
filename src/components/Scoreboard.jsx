import React, { useEffect, useState } from 'react';
import { useBadminton } from '../hooks/useBadminton';
import ScoreCard from './ScoreCard';
import CourtVisualizer from './CourtVisualizer';
import MatchStats from './MatchStats';
import Controls from './Controls';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Scoreboard({ matchConfig, onBackToSetup }) {
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
    setServerManually,
    swapPositionsManually,
    canUndo,
    canRedo,
  } = useBadminton(matchConfig);

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

  // Trigger confetti when match ends
  useEffect(() => {
    if (matchEnded && winner) {
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
    changeSettings({
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
        themeColor="red"
        onClick={() => handleScoreClick('A')}
        onDecrement={() => decrementScore('A')}
        disabled={gameEnded || matchEnded}
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
        themeColor="green"
        onClick={() => handleScoreClick('B')}
        onDecrement={() => decrementScore('B')}
        disabled={gameEnded || matchEnded}
      />
    );

    // Swap ordering visually if sidesSwapped is active
    return sidesSwapped ? [cardB, cardA] : [cardA, cardB];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-carbon/50 border border-carbon-border/30 rounded-2xl px-6 py-3">
        <div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">Status Pertandingan</span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
            {matchConfig.matchType === 'singles' ? 'Tunggal' : 'Ganda'} 
            <span className="text-gray-600">•</span> 
            Target {matchConfig.targetPoints} Poin
          </h2>
        </div>

        {/* Set Tracker Broadcaster */}
        <div className="flex gap-2">
          {gameHistory.map((h, i) => (
            <div key={i} className="text-xs bg-black/40 border border-carbon-border/50 rounded-lg px-2.5 py-1 text-gray-400 font-mono">
              G{i+1}: <span className="text-red-500 font-bold">{h.scoreA}</span>-<span className="text-emerald-500 font-bold">{h.scoreB}</span>
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
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
        onUndo={undo}
        onRedo={redo}
        onSwapSides={toggleSides}
        onReset={restartMatch}
        onConfigure={() => setShowHomeConfirm(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        voiceEnabled={matchConfig.voiceEnabled}
        onToggleVoice={handleToggleVoice}
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
          <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/15 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto border border-white/10">
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">GAME SELESAI!</h3>
              <p className="text-gray-400 text-sm">
                Game ke-{gameHistory.length} telah selesai dimenangkan oleh{' '}
                <span className="text-white font-black">
                  {gameHistory[gameHistory.length - 1]?.scoreA > gameHistory[gameHistory.length - 1]?.scoreB
                    ? playerANames.join(' & ')
                    : playerBNames.join(' & ')
                  }
                </span>
              </p>
            </div>

            {/* Score Summary Box */}
            <div className="bg-black/35 rounded-2xl p-4 border border-carbon-border/50">
              <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-1">Skor Akhir Game</div>
              <div className="font-digital text-3xl font-black text-white">
                {gameHistory[gameHistory.length - 1]?.scoreA} - {gameHistory[gameHistory.length - 1]?.scoreB}
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 text-white text-xs rounded-xl flex items-center justify-center gap-2">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Harap bertukar sisi lapangan untuk game selanjutnya!</span>
            </div>

            <button
              onClick={() => {
                playSound('click');
                dismissGameEnded();
              }}
              className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-extrabold rounded-xl transition-all duration-200 shadow-lg active:scale-98"
            >
              Lanjutkan Game Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* 2. Match Ended (Winner) Modal */}
      {matchEnded && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-lg w-full rounded-3xl p-8 border border-white/20 text-center space-y-6 shadow-2xl">

            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-white">PERTANDINGAN SELESAI!</h3>
              <p className="text-gray-400 text-sm">
                Pemenang Pertandingan adalah
              </p>
              <h4 className="text-2xl font-black text-white tracking-tight uppercase">
                {winner === 'A' ? playerANames.join(' & ') : playerBNames.join(' & ')}
              </h4>
            </div>

            {/* Set scores recap */}
            <div className="bg-black/35 rounded-2xl p-5 border border-carbon-border/50 divide-y divide-carbon-border/30">
              <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider mb-2">Ringkasan Skor Set</div>
              <div className="flex justify-center gap-6 pt-2">
                {gameHistory.map((game, idx) => (
                  <div key={idx} className="text-center font-mono">
                    <div className="text-[8px] text-gray-500 font-bold mb-0.5">GAME {idx + 1}</div>
                    <div className="text-base font-bold text-white">
                      <span className={game.scoreA > game.scoreB ? 'text-white font-black' : 'text-gray-400'}>{game.scoreA}</span>
                      <span className="text-gray-600 mx-1">-</span>
                      <span className={game.scoreB > game.scoreA ? 'text-white font-black' : 'text-gray-400'}>{game.scoreB}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  playSound('warning');
                  restartMatch();
                }}
                className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-carbon-border bg-black/40 text-gray-300 font-bold hover:bg-carbon-light text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Match
              </button>
              
              <button
                onClick={() => {
                  playSound('click');
                  onBackToSetup();
                }}
                className="py-3.5 px-4 bg-white hover:bg-gray-200 text-black font-extrabold rounded-xl text-sm transition-all shadow-lg active:scale-98"
              >
                Pertandingan Baru
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3. Custom Home Confirmation Modal */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card max-w-sm w-full rounded-2xl p-6 border border-white/15 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto border border-white/10">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Kembali ke Home?</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Skor dan statistik pertandingan saat ini akan hilang sepenuhnya. Apakah Anda yakin?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  playSound('click');
                  setShowHomeConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-carbon-border bg-black/40 text-gray-300 font-bold hover:bg-carbon-light text-xs transition-all"
              >
                Batal
              </button>
              
              <button
                onClick={() => {
                  playSound('click');
                  setShowHomeConfirm(false);
                  onBackToSetup();
                }}
                className="py-2.5 px-4 bg-white text-black hover:bg-gray-200 font-extrabold rounded-xl text-xs transition-all active:scale-98"
              >
                Ya, Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
