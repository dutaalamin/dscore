import React from 'react';
import { Minus, Volume2, User2 } from 'lucide-react';

export default function ScoreCard({
  teamName,
  players,
  score,
  gamesWon,
  isServing,
  isGamePoint,
  isMatchPoint,
  themeColor, // legacy prop, kept for compatibility if needed
  onClick,
  onDecrement,
  disabled
}) {
  
  const isRed = themeColor === 'red';
  
  // Red/Green theme style configuration
  const borderColor = isRed 
    ? 'border-red-500/25 focus-within:border-red-500/50' 
    : 'border-emerald-500/25 focus-within:border-emerald-500/50';
    
  const bgGlow = isRed 
    ? 'bg-red-950/20 hover:bg-red-950/30' 
    : 'bg-emerald-950/20 hover:bg-emerald-950/30';
    
  const textGlow = isRed 
    ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.55)]' 
    : 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.55)]';
    
  const glowDot = isRed 
    ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' 
    : 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse';

  const indicatorText = isMatchPoint 
    ? 'bg-red-600 text-white glow-red animate-pulse' 
    : isGamePoint 
      ? 'bg-white text-black font-bold animate-pulse' 
      : null;

  return (
    <div className={`relative flex flex-col justify-between h-[200px] xs:h-[240px] sm:h-[320px] md:h-[400px] w-full rounded-2xl sm:rounded-3xl border glass-card ${borderColor} ${bgGlow} transition-all duration-300 overflow-hidden`}>
      {/* Tap Overlay (Clicking this increments score) */}
      <button
        onClick={onClick}
        disabled={disabled}
        className="absolute inset-0 w-full h-full flex flex-col justify-between p-3.5 xs:p-5 sm:p-8 cursor-pointer focus:outline-none z-10 select-none group text-left"
        aria-label={`Tambah skor untuk ${teamName}`}
      >
        {/* Header: Player names & Service Indicator */}
        <div className="w-full flex items-start justify-between">
          <div className="space-y-0.5 pr-2 sm:pr-6 max-w-[70%]">
            {/* Team Label */}
            <div className={`text-[8px] sm:text-xs font-bold uppercase tracking-widest ${isRed ? 'text-red-400' : 'text-emerald-400'}`}>
              {teamName}
            </div>
            {/* Player Names */}
            <h3 className="text-xs xs:text-sm sm:text-lg md:text-xl font-bold text-white tracking-tight line-clamp-1 sm:line-clamp-2">
              {players.join(' & ') || 'Pemain'}
            </h3>
          </div>

          {/* Serve Indicator & Sets won */}
          <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
            {/* Serve Text */}
            <div className="h-5 sm:h-6 flex items-center justify-end">
              {isServing ? (
                <span className={`bg-black/40 border rounded-full px-2 py-0.5 sm:px-3 text-[9px] sm:text-[11px] font-bold tracking-wider uppercase animate-pulse ${
                  isRed 
                    ? 'border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                    : 'border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                }`}>
                  Serve
                </span>
              ) : (
                <span className="h-4" />
              )}
            </div>
            
            {/* Sets Tracker Text */}
            <div className="flex items-center mt-1 sm:mt-2">
              <div className={`bg-black/40 border rounded px-2 py-0.5 sm:px-3 sm:py-1 flex items-center gap-1.5 ${
                isRed ? 'border-red-500/20' : 'border-emerald-500/20'
              }`}>
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Set</span>
                <span className={`text-xs sm:text-sm font-black ${isRed ? 'text-red-400' : 'text-emerald-400'}`}>{gamesWon}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Big Digit Display */}
        <div className="w-full flex justify-center my-auto">
          <div className={`font-digital text-6xl xs:text-7xl sm:text-[9rem] md:text-[11rem] font-bold tracking-tighter leading-none ${textGlow} transition-transform duration-200 group-active:scale-[1.03]`}>
            {score.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Footer: Alert Badges */}
        <div className="w-full h-5 sm:h-8 flex items-center justify-between z-20">
          <div>
            {indicatorText && (
              <span className={`text-[7px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase font-black tracking-widest ${indicatorText}`}>
                {isMatchPoint ? 'Match Pt' : 'Game Pt'}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Manual Decrement Button */}
      {!disabled && score > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Avoid triggering parent score increment
            onDecrement();
          }}
          className="absolute bottom-3 right-3 xs:bottom-4 xs:right-4 sm:bottom-8 sm:right-8 z-30 p-1.5 sm:p-2.5 bg-black/60 border border-zinc-800 hover:bg-zinc-900 text-gray-400 hover:text-white rounded-lg sm:rounded-xl transition-all hover:scale-105 active:scale-95"
          title="Kurangi skor"
        >
          <Minus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
