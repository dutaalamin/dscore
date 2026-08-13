import React, { useState } from 'react';
import { Play, User, Users, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function MatchSetup({ onStart }) {
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          DSCORE
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Papan skor badminton
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Match Type Selection */}
        <div>
          <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Kategori Pertandingan</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('singles')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${matchType === 'singles'
                ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                : 'bg-carbon-light text-gray-300 border-carbon-border hover:bg-carbon-border'
                }`}
            >
              <User className="w-4 h-4" />
              Tunggal (Singles)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('doubles')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 ${matchType === 'doubles'
                ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                : 'bg-carbon-light text-gray-300 border-carbon-border hover:bg-carbon-border'
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
            <div className="h-0.5 bg-gradient-to-r from-gray-400 to-transparent mb-2 rounded"></div>
            <label className="block text-white text-xs font-bold uppercase tracking-wider">Tim A (Kiri Layar)</label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={playerA1}
                  onChange={(e) => setPlayerA1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-black/40 border border-carbon-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
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
                    className="w-full bg-black/40 border border-carbon-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Team B / Right Side */}
          <div className="space-y-3">
            <div className="h-0.5 bg-gradient-to-r from-gray-400 to-transparent mb-2 rounded"></div>
            <label className="block text-white text-xs font-bold uppercase tracking-wider">Tim B (Kanan Layar)</label>
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  value={playerB1}
                  onChange={(e) => setPlayerB1(e.target.value)}
                  placeholder="Nama Pemain 1"
                  className="w-full bg-black/40 border border-carbon-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
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
                    className="w-full bg-black/40 border border-carbon-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Rules Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-carbon-border/50">
          {/* Target Score */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Target Poin Game</label>
            <div className="flex gap-2">
              {[11, 15, 21].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handlePointsChange(pts)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${targetPoints === pts
                    ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                    : 'bg-black/30 text-gray-400 border-carbon-border hover:bg-carbon-light'
                    }`}
                >
                  {pts} Poin
                </button>
              ))}
            </div>
          </div>

          {/* First Server selection */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Servis Pertama</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleServerChange('A')}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${firstServer === 'A'
                  ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                  : 'bg-black/30 text-gray-400 border-carbon-border hover:bg-carbon-light'
                  }`}
              >
                Tim A
              </button>
              <button
                type="button"
                onClick={() => handleServerChange('B')}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${firstServer === 'B'
                  ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                  : 'bg-black/30 text-gray-400 border-carbon-border hover:bg-carbon-light'
                  }`}
              >
                Tim B
              </button>
            </div>
          </div>
        </div>

        {/* Voice Announcer Settings */}
        <div className="p-4 bg-black/30 border border-carbon-border/50 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${voiceEnabled ? 'bg-white/20 text-white' : 'bg-carbon text-gray-500'}`}>
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Suara Komentator (Ref)</h4>
                <p className="text-xs text-gray-400">Bacakan skor saat poin bertambah.</p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${voiceEnabled ? 'bg-white' : 'bg-carbon-border'
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {voiceEnabled && (
            <div className="flex gap-2 items-center justify-end pl-12 border-t border-carbon-border/30 pt-3">
              <span className="text-xs text-gray-400">Bahasa suara:</span>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('id')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${voiceLanguage === 'id' ? 'bg-zinc-800 border border-zinc-700 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Indonesia
              </button>
              <button
                type="button"
                onClick={() => handleVoiceLangChange('en')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${voiceLanguage === 'en' ? 'bg-zinc-800 border border-zinc-700 text-white font-bold' : 'text-gray-400 hover:text-white'
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
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base transition-all duration-300 border border-zinc-700 active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current text-white" />
          Mulai Pertandingan
        </button>
      </form>
    </div>
  );
}
