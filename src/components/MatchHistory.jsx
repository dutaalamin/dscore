import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { X, Calendar, Trophy, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function MatchHistory({ onClose, onSelectMatch }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatchHistory = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const finishedMatches = data.filter(match => match.state?.matchEnded === true);
        setMatches(finishedMatches);
      } else {
        console.error('Gagal mengambil riwayat:', error);
      }
    } catch (err) {
      console.error('Error saat fetch riwayat:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMatchClick = (matchId) => {
    playSound('click');
    onSelectMatch(matchId);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800/80 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide font-sans">Riwayat Pertandingan</h3>
            <p className="text-xs text-gray-500">Daftar semua hasil pertandingan yang tercatat di database cloud</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                playSound('click');
                fetchMatchHistory();
              }}
              className="p-2 text-gray-400 hover:text-white bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all"
              title="Refresh Riwayat"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 text-gray-400 hover:text-white bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              <span className="text-xs font-sans tracking-wider uppercase text-zinc-650">Memuat Riwayat...</span>
            </div>
          ) : !supabase ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              Supabase belum dikonfigurasi. Hubungkan database cloud untuk mencatat riwayat.
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-gray-650" />
              <div>Belum ada riwayat pertandingan yang tersimpan.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const config = match.config || {};
                const state = match.state || {};
                const isSingles = config.matchType === 'singles';
                
                const teamANames = isSingles 
                  ? [config.playerA1 || 'Pemain A1']
                  : [config.playerA1 || 'Pemain A1', config.playerA2 || 'Pemain A2'];
                const teamBNames = isSingles 
                  ? [config.playerB1 || 'Pemain B1']
                  : [config.playerB1 || 'Pemain B1', config.playerB2 || 'Pemain B2'];

                const teamAName = teamANames.join(' & ');
                const teamBName = teamBNames.join(' & ');
                
                const gamesA = state.gamesA || 0;
                const gamesB = state.gamesB || 0;
                const gameHistory = state.gameHistory || [];

                return (
                  <div 
                    key={match.id} 
                    className="bg-zinc-900/20 border border-zinc-800/60 hover:border-zinc-850 hover:bg-zinc-900/35 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Meta Info */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-550 font-bold uppercase tracking-wider">
                        <span className="bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">
                          {isSingles ? 'Tunggal' : 'Ganda'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(match.created_at)}
                        </span>
                      </div>

                      {/* Matchup names */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className={`font-bold truncate ${state.winner === 'A' ? 'text-red-400 font-extrabold' : 'text-red-400/60'}`}>
                            {teamAName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono px-2">Set: {gamesA}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className={`font-bold truncate ${state.winner === 'B' ? 'text-emerald-400 font-extrabold' : 'text-emerald-400/60'}`}>
                            {teamBName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono px-2">Set: {gamesB}</span>
                        </div>
                      </div>

                      {/* Set scores recap */}
                      {gameHistory.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {gameHistory.map((g, idx) => (
                            <span key={idx} className="text-[9px] bg-zinc-900/40 border border-zinc-850 text-gray-450 px-2 py-0.5 rounded font-mono">
                              Set {idx + 1}: <span className={g.scoreA > g.scoreB ? 'text-red-400 font-bold' : 'text-red-400/50'}>{g.scoreA}</span>-<span className={g.scoreB > g.scoreA ? 'text-emerald-400 font-bold' : 'text-emerald-400/50'}>{g.scoreB}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions / Winner display */}
                    <div className="flex sm:flex-col items-end gap-2 self-stretch sm:self-auto shrink-0 justify-between sm:justify-start pt-2 sm:pt-0 border-t border-zinc-850 sm:border-t-0">
                      {state.winner && (
                        <div className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider self-start sm:self-auto border ${
                          state.winner === 'A' 
                            ? 'text-red-400 bg-red-500/5 border-red-500/25' 
                            : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/25'
                        }`}>
                          <Trophy className="w-3.5 h-3.5 fill-current" />
                          <span>Winner: Tim {state.winner}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleMatchClick(match.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-300 bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900 hover:text-white rounded-xl transition-all self-end"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
