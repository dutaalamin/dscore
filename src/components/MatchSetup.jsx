import React, { useState } from 'react';
import { Volume2, VolumeX, Clock } from 'lucide-react';
import { playSound } from '../utils/audio';
import MatchHistory from './MatchHistory';

export default function MatchSetup({ onStart }) {
  const [showHistory, setShowHistory] = useState(() => {
    return new URLSearchParams(window.location.search).get('history') === 'true';
  });
  const [matchType, setMatchType] = useState('singles'); // singles | doubles
  const [playerA1, setPlayerA1] = useState('Pemain A1');
  const [playerA2, setPlayerA2] = useState('Pemain A2');
  const [playerB1, setPlayerB1] = useState('Pemain B1');
  const [playerB2, setPlayerB2] = useState('Pemain B2');

  const [targetPoints, setTargetPoints] = useState(21);
  const [firstServer, setFirstServer] = useState('A');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState('id'); // id | en

  const handleSubmit = (e) => {
    e.preventDefault();
    playSound('gameover'); // Play a nice start chime!

    onStart({
      matchType,
      playerA1: playerA1.trim() || 'Pemain A1',
      playerA2: matchType === 'doubles' ? (playerA2.trim() || 'Pemain A2') : '',
      playerB1: playerB1.trim() || 'Pemain B1',
      playerB2: matchType === 'doubles' ? (playerB2.trim() || 'Pemain B2') : '',
      targetPoints: Number(targetPoints),
      firstServer,
      voiceEnabled,
      voiceLanguage,
    });
  };

  const handleTypeChange = (type) => {
    playSound('click');
    setMatchType(type);
  };

  const handlePointsChange = (pts) => {
    playSound('click');
    setTargetPoints(pts);
  };

  const handleServerChange = (srv) => {
    playSound('click');
    setFirstServer(srv);
  };

  const handleVoiceToggle = () => {
    playSound('click');
    setVoiceEnabled(!voiceEnabled);
  };

  const handleVoiceLangChange = (lang) => {
    playSound('click');
    setVoiceLanguage(lang);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 relative">
      {/* Floating History Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setShowHistory(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900 rounded-xl transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat</span>
        </button>
      </div>

      {/* Title Header */}
      <div className="text-center mb-10 select-none">
        <h1 className="text-3xl sm:text-4xl font-black tracking-[0.08em] text-white flex items-center justify-center">
          <span className="bg-white text-zinc-950 px-2.5 py-0.5 rounded-md mr-1.5 font-black inline-block transform -skew-x-6">D</span>
          <span>SCORE</span>
        </h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-6 bg-zinc-800"></span>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            Badminton Scoreboard
          </p>
          <span className="h-px w-6 bg-zinc-800"></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        {/* Match Type Selection */}
        <div className="space-y-2">
          <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest font-sans">Kategori Pertandingan</label>
          <div className="flex gap-4 items-center py-1">
            <button
              type="button"
              onClick={() => handleTypeChange('singles')}
              className={`text-xs font-black uppercase tracking-widest transition-all ${
                matchType === 'singles'
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              Tunggal
            </button>
            <span className="text-zinc-850">/</span>
            <button
              type="button"
              onClick={() => handleTypeChange('doubles')}
              className={`text-xs font-black uppercase tracking-widest transition-all ${
                matchType === 'doubles'
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              Ganda
            </button>
          </div>
        </div>

        {/* Player Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Team A / Left Side */}
          <div className="space-y-4">
            <div className="h-px bg-zinc-900 w-full mb-1"></div>
            <label className="block text-[#FFF9CA] text-[10px] font-bold uppercase tracking-widest">Tim A (Kiri)</label>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={playerA1}
                  onChange={(e) => setPlayerA1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#FFF9CA] transition-all font-semibold"
                  required
                />
              </div>
              {matchType === 'doubles' && (
                <div>
                  <input
                    type="text"
                    value={playerA2}
                    onChange={(e) => setPlayerA2(e.target.value)}
                    placeholder="Nama Pemain 2"
                    className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#FFF9CA] transition-all font-semibold"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Team B / Right Side */}
          <div className="space-y-4">
            <div className="h-px bg-zinc-900 w-full mb-1"></div>
            <label className="block text-[#E3FDFD] text-[10px] font-bold uppercase tracking-widest">Tim B (Kanan)</label>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={playerB1}
                  onChange={(e) => setPlayerB1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#E3FDFD] transition-all font-semibold"
                  required
                />
              </div>
              {matchType === 'doubles' && (
                <div>
                  <input
                    type="text"
                    value={playerB2}
                    onChange={(e) => setPlayerB2(e.target.value)}
                    placeholder="Nama Pemain 2"
                    className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#E3FDFD] transition-all font-semibold"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-900">
          {/* Target Score */}
          <div className="space-y-2">
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest">Target Poin Game</label>
            <div className="flex gap-4 items-center py-1">
              {[11, 15, 21].map((pts, i) => (
                <React.Fragment key={pts}>
                  {i > 0 && <span className="text-zinc-850">•</span>}
                  <button
                    key={pts}
                    type="button"
                    onClick={() => handlePointsChange(pts)}
                    className={`text-xs font-black uppercase tracking-widest transition-all ${
                      targetPoints === pts
                        ? 'text-white'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {pts} Poin
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* First Server selection */}
          <div className="space-y-2">
            <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest">Servis Pertama</label>
            <div className="flex gap-4 items-center py-1">
              <button
                type="button"
                onClick={() => handleServerChange('A')}
                className={`text-xs font-black uppercase tracking-widest transition-all ${
                  firstServer === 'A'
                    ? 'text-[#FFF9CA]'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Tim A
              </button>
              <span className="text-zinc-850">/</span>
              <button
                type="button"
                onClick={() => handleServerChange('B')}
                className={`text-xs font-black uppercase tracking-widest transition-all ${
                  firstServer === 'B'
                    ? 'text-[#E3FDFD]'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Tim B
              </button>
            </div>
          </div>
        </div>

        {/* Voice Announcer Settings */}
        <div className="pt-6 border-t border-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={voiceEnabled ? 'text-[#FFF9CA]' : 'text-zinc-500'}>
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Suara Komentator (Ref)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Bacakan skor saat poin bertambah.</p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${voiceEnabled ? 'bg-[#FFF9CA]' : 'bg-zinc-800'
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-200 ${voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {voiceEnabled && (
            <div className="flex gap-2 items-center justify-end pl-8 border-t border-zinc-900 pt-3">
              <span className="text-xs text-gray-500">Bahasa suara:</span>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('id')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${voiceLanguage === 'id' ? 'bg-zinc-800 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('en')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${voiceLanguage === 'en' ? 'bg-zinc-800 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-xl bg-[#FFF9CA] hover:bg-[#FFF5B2] text-zinc-950 font-black text-base tracking-widest uppercase transition-all duration-200 active:scale-[0.98] shadow-md shadow-[#FFF9CA]/5"
        >
          START MATCH
        </button>
      </form>

      {showHistory && (
        <MatchHistory
          onClose={() => {
            setShowHistory(false);
            if (window.location.search.includes('history=true')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onSelectMatch={(matchId) => {
            // Langsung navigasi ke URL match tanpa menutup modal terlebih dahulu
            // agar tidak terjadi efek berkedip/flash halaman home
            window.location.href = `?match=${matchId}`;
          }}
        />
      )}
    </div>
  );
}
