import React, { useEffect, useState } from 'react';
import { useBadminton } from '../hooks/useBadminton';
import ScoreCard from './ScoreCard';
import CourtVisualizer from './CourtVisualizer';
import MatchStats from './MatchStats';
import Controls from './Controls';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Scoreboard({ matchConfig, onBackToSetup, matchId = null, isViewer = false }) {
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
  } = useBadminton(matchConfig, matchId, isViewer);

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
        themeColor="green"
        onClick={() => handleScoreClick('B')}
        onDecrement={() => decrementScore('B')}
        disabled={gameEnded || matchEnded || isViewer}
      />
    );

    // Swap ordering visually if sidesSwapped is active
    return sidesSwapped ? [cardB, cardA] : [cardA, cardB];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Back Button Row */}
      {!isViewer && (
        <div className="flex justify-start">
          <button
            onClick={() => {
              playSound('click');
              setShowHomeConfirm(true);
            }}
            className="text-zinc-500 hover:text-white text-xs font-bold transition-all"
            title="Kembali ke halaman utama"
          >
            Back
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center bg-zinc-950/80 border border-zinc-800/80 rounded-2xl px-5 sm:px-6 py-3 shadow-md">
        <div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest font-sans">Status Pertandingan</span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mt-0.5 font-sans">
            {matchConfig.matchType === 'singles' ? 'Tunggal' : 'Ganda'} 
            <span className="text-gray-600">•</span> 
            Target {matchConfig.targetPoints} Poin
          </h2>
        </div>

        {/* Set Tracker Broadcaster */}
        <div className="flex gap-2">
          {gameHistory.map((h, i) => (
            <div key={i} className="text-xs bg-zinc-900/40 border border-zinc-800/50 rounded-lg px-2.5 py-1 text-gray-400 font-sans font-bold">
              G{i+1}: <span className="text-red-500">{h.scoreA}</span>-<span className="text-emerald-500">{h.scoreB}</span>
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
          <div className="bg-zinc-950 border border-zinc-800/80 max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">GAME SELESAI!</h3>
              <p className="text-gray-400 text-sm">
                Game ke-{gameHistory.length} telah selesai dimenangkan oleh{' '}
                <span className={`font-black ${
                  gameHistory[gameHistory.length - 1]?.scoreA > gameHistory[gameHistory.length - 1]?.scoreB
                    ? 'text-red-500'
                    : 'text-emerald-500'
                }`}>
                  {gameHistory[gameHistory.length - 1]?.scoreA > gameHistory[gameHistory.length - 1]?.scoreB
                    ? playerANames.join(' & ')
                    : playerBNames.join(' & ')
                  }
                </span>
              </p>
            </div>

            {/* Score Summary Box */}
            <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/80">
              <div className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider mb-1">Skor Akhir Game</div>
              <div className="font-digital text-3xl font-black">
                <span className="text-red-500">{gameHistory[gameHistory.length - 1]?.scoreA}</span>
                <span className="text-gray-500 mx-2">-</span>
                <span className="text-emerald-500">{gameHistory[gameHistory.length - 1]?.scoreB}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/10 border border-zinc-850 text-zinc-400 text-xs rounded-xl flex items-center justify-center gap-2 font-sans font-bold">
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              <span>Harap bertukar sisi lapangan untuk game selanjutnya!</span>
            </div>

            <button
              onClick={() => {
                playSound('click');
                dismissGameEnded();
              }}
              className="w-full py-3.5 bg-zinc-800 border border-zinc-700 text-white font-bold hover:bg-zinc-750 hover:border-zinc-650 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              Lanjutkan Game Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* 2. Match Ended (Winner) Modal */}
      {matchEnded && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800/80 max-w-lg w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">

            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-white">PERTANDINGAN SELESAI!</h3>
              <p className="text-gray-400 text-sm">
                Pemenang Pertandingan adalah
              </p>
              <h4 className={`text-2xl font-black tracking-tight uppercase ${winner === 'A' ? 'text-red-500' : 'text-emerald-500'}`}>
                {winner === 'A' ? playerANames.join(' & ') : playerBNames.join(' & ')}
              </h4>
            </div>

            {/* Set scores recap */}
            <div className="bg-zinc-900/30 rounded-2xl p-5 border border-zinc-800/80 divide-y divide-zinc-850">
              <div className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-wider mb-2">Ringkasan Skor Set</div>
              <div className="flex justify-center gap-6 pt-2">
                {gameHistory.map((game, idx) => (
                  <div key={idx} className="text-center font-sans">
                    <div className="text-[8px] text-gray-500 font-bold mb-0.5">GAME {idx + 1}</div>
                    <div className="text-base font-bold text-white">
                      <span className={game.scoreA > game.scoreB ? 'text-red-500 font-black text-lg' : 'text-red-500/55'}>{game.scoreA}</span>
                      <span className="text-gray-600 mx-1.5">-</span>
                      <span className={game.scoreB > game.scoreA ? 'text-emerald-500 font-black text-lg' : 'text-emerald-500/55'}>{game.scoreB}</span>
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
                className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-gray-400 font-bold hover:bg-zinc-900 hover:text-white text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Match
              </button>
              
              <button
                onClick={() => {
                  playSound('click');
                  onBackToSetup();
                }}
                className="py-3.5 px-4 bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-98 shadow-lg shadow-red-500/10"
              >
                Pertandingan Baru
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3. Custom Home Confirmation Modal */}
      {showHomeConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800/80 max-w-sm w-full rounded-2xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
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
                  onBackToSetup();
                }}
                className="py-2.5 px-4 bg-red-600 text-white hover:bg-red-500 font-bold rounded-xl text-xs transition-all active:scale-98 shadow-lg shadow-red-500/10"
              >
                Ya, Kembali
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setShowHomeConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-gray-400 font-bold hover:bg-zinc-900 hover:text-white text-xs transition-all"
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
