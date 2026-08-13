import React from 'react';
import { Undo2, Redo2, ArrowLeftRight, Play, Pause, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Controls({
  timer,
  isTimerRunning,
  onToggleTimer,
  onUndo,
  onRedo,
  onSwapSides,
  onReset,
  onConfigure,
  canUndo,
  canRedo,
  voiceEnabled,
  onToggleVoice
}) {
  
  // Helper to format timer (seconds to MM:SS or HH:MM:SS)
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (num) => String(num).padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const handleTimerClick = () => {
    playSound('click');
    onToggleTimer();
  };

  const handleResetClick = () => {
    if (window.confirm('Apakah Anda yakin ingin mengulang pertandingan ini? Semua skor game saat ini akan di-reset.')) {
      onReset();
    }
  };

  const handleConfigureClick = () => {
    onConfigure();
  };

  return (
    <div className="w-full bg-carbon rounded-2xl border border-carbon-border p-3 flex flex-row flex-wrap sm:flex-nowrap gap-3 items-center justify-between shadow-lg">
      
      {/* Left controls: Settings & Audio Toggle */}
      <div className="flex gap-1.5 items-center justify-start shrink-0">
        <button
          onClick={handleConfigureClick}
          className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-400 hover:text-white bg-black/30 border border-carbon-border/50 hover:bg-carbon-light rounded-xl transition-all"
          title="Home"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1 p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition-all ${
            voiceEnabled 
              ? 'bg-zinc-800 border-zinc-500 text-white hover:bg-zinc-700' 
              : 'bg-black/30 border-carbon-border/50 text-gray-500 hover:text-gray-300'
          }`}
          title={voiceEnabled ? "Matikan suara" : "Aktifkan suara"}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">Suara</span>
        </button>
      </div>

      {/* Center controls: Timer & Play/Pause */}
      <div className="flex items-center gap-2.5 xs:gap-4 bg-black/40 border border-carbon-border/50 rounded-2xl px-3.5 py-1.5 sm:px-6 sm:py-2">
        <div className="font-digital text-base sm:text-xl text-white font-bold tracking-widest min-w-[55px] sm:min-w-[70px] text-center">
          {formatTime(timer)}
        </div>
        <div className="h-4 w-px bg-carbon-border"></div>
        <button
          onClick={handleTimerClick}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            isTimerRunning
              ? 'text-accentRed bg-accentRed/10 hover:bg-accentRed/20'
              : 'text-court bg-court/10 hover:bg-court/20'
          }`}
          title={isTimerRunning ? "Pause Timer" : "Mulai Timer"}
        >
          {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </div>

      {/* Right controls: Undo, Redo, Swap, Reset */}
      <div className="flex gap-1.5 sm:gap-2 justify-end shrink-0">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-1 p-2 sm:px-4 sm:py-2.5 text-xs font-semibold rounded-xl border transition-all ${
            canUndo
              ? 'bg-black/30 border-carbon-border text-white hover:bg-carbon-light active:scale-95'
              : 'bg-black/10 border-carbon-border/30 text-gray-600 cursor-not-allowed'
          }`}
          title="Undo (Kembali)"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex items-center justify-center gap-1 p-2 sm:px-4 sm:py-2.5 text-xs font-semibold rounded-xl border transition-all ${
            canRedo
              ? 'bg-black/30 border-carbon-border text-white hover:bg-carbon-light active:scale-95'
              : 'bg-black/10 border-carbon-border/30 text-gray-600 cursor-not-allowed'
          }`}
          title="Redo (Maju)"
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Redo</span>
        </button>

        {/* Swap court sides */}
        <button
          onClick={onSwapSides}
          className="flex items-center justify-center gap-1 p-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-white bg-black/30 border border-carbon-border hover:bg-carbon-light rounded-xl transition-all active:scale-95"
          title="Tukar Sisi Lapangan"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">Tukar Sisi</span>
        </button>

        {/* Reset match */}
        <button
          onClick={handleResetClick}
          className="p-2 sm:p-2.5 text-xs font-semibold text-accentRed bg-accentRed/10 border border-accentRed/20 hover:bg-accentRed/20 rounded-xl transition-all active:scale-95"
          title="Reset Match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
