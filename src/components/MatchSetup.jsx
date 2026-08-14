import React, { useState } from 'react';
import { Play, User, Users, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';
import { playSound } from '../utils/audio';
import MatchHistory from './MatchHistory';

export default function MatchSetup({ onStart }) {
  const [showHistory, setShowHistory] = useState(false);
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

      <form onSubmit={handleSubmit} className="bg-zinc-950/85 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
        {/* Match Type Selection */}
        <div>
          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Kategori Pertandingan</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('singles')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${matchType === 'singles'
                ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                : 'bg-zinc-900/30 border-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <User className="w-4 h-4" />
              Tunggal (Singles)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('doubles')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${matchType === 'doubles'
                ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                : 'bg-zinc-900/30 border-zinc-900 text-gray-400 hover:text-white hover:bg-zinc-900'
                }`}
            >
              <Users className="w-4 h-4" />
              Ganda (Doubles)
            </button>
          </div>
        </div>

        {/* Player Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A / Left Side */}
          <div className="space-y-3">
            <div className="h-0.5 bg-red-500/20 border-b border-red-500/30 rounded mb-2"></div>
            <label className="block text-red-400 text-xs font-bold uppercase tracking-wider">Tim A (Kiri)</label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={playerA1}
                  onChange={(e) => setPlayerA1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
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
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Team B / Right Side */}
          <div className="space-y-3">
            <div className="h-0.5 bg-emerald-500/20 border-b border-emerald-500/30 rounded mb-2"></div>
            <label className="block text-emerald-400 text-xs font-bold uppercase tracking-wider">Tim B (Kanan)</label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={playerB1}
                  onChange={(e) => setPlayerB1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
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
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/80">
          {/* Target Score */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Target Poin Game</label>
            <div className="flex gap-2">
              {[11, 15, 21].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handlePointsChange(pts)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${targetPoints === pts
                    ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                    : 'bg-zinc-900/30 border-zinc-900 text-gray-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                >
                  {pts} Poin
                </button>
              ))}
            </div>
          </div>

          {/* First Server selection */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Servis Pertama</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleServerChange('A')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${firstServer === 'A'
                  ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                  : 'bg-zinc-900/30 border-zinc-900 text-gray-400 hover:bg-zinc-900 hover:text-white'
                  }`}
              >
                Tim A
              </button>
              <button
                type="button"
                onClick={() => handleServerChange('B')}
                className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${firstServer === 'B'
                  ? 'bg-zinc-800 border-zinc-700 text-white shadow-md'
                  : 'bg-zinc-900/30 border-zinc-900 text-gray-400 hover:bg-zinc-900 hover:text-white'
                  }`}
              >
                Tim B
              </button>
            </div>
          </div>
        </div>

        {/* Voice Announcer Settings */}
        <div className="p-4 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${voiceEnabled ? 'bg-white/10 text-white' : 'bg-zinc-950 text-zinc-500'}`}>
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
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${voiceEnabled ? 'bg-white' : 'bg-zinc-800'
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {voiceEnabled && (
            <div className="flex gap-2 items-center justify-end pl-12 border-t border-zinc-800/40 pt-3">
              <span className="text-xs text-gray-400">Bahasa suara:</span>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('id')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${voiceLanguage === 'id' ? 'bg-zinc-800 border border-zinc-700 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('en')}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${voiceLanguage === 'en' ? 'bg-zinc-800 border border-zinc-700 text-white font-bold' : 'text-gray-400 hover:text-white'
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
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-red-500/10"
        >
          <Play className="w-4 h-4 fill-current text-white" />
          START MATCH
        </button>
      </form>

      {showHistory && (
        <MatchHistory
          onClose={() => setShowHistory(false)}
          onSelectMatch={(matchId) => {
            setShowHistory(false);
            window.history.pushState(null, '', `?match=${matchId}`);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
