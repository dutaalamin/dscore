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

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm("Hapus pertandingan ini secara permanen dari riwayat?")) return;
    
    playSound('click');
    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);
        
      if (error) {
        console.error('Gagal menghapus riwayat:', error);
        alert('Gagal menghapus pertandingan.');
      } else {
        fetchMatchHistory();
      }
    } catch (err) {
      console.error('Error saat hapus riwayat:', err);
    }
    setLoading(false);
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
                    className="border-b border-zinc-900/50 py-4 last:border-0 hover:bg-zinc-900/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Meta Info */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>{isSingles ? 'Tunggal' : 'Ganda'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {formatDate(match.created_at)}
                        </span>
                      </div>

                      {/* Matchup names & scores */}
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className={`font-bold truncate ${state.winner === 'A' ? 'text-[#FFF9CA] font-extrabold' : 'text-[#FFF9CA] opacity-60'}`}>
                            {teamAName} {state.winner === 'A' && <span className="ml-1 text-[10px]">🏆</span>}
                          </span>
                          <span className="text-xs text-gray-400 font-mono px-2">{gamesA}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className={`font-bold truncate ${state.winner === 'B' ? 'text-[#E3FDFD] font-extrabold' : 'text-[#E3FDFD] opacity-60'}`}>
                            {teamBName} {state.winner === 'B' && <span className="ml-1 text-[10px]">🏆</span>}
                          </span>
                          <span className="text-xs text-gray-400 font-mono px-2">{gamesB}</span>
                        </div>
                      </div>

                      {/* Set scores recap */}
                      {gameHistory.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {gameHistory.map((g, idx) => `Set ${idx + 1}: ${g.scoreA}-${g.scoreB}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-center self-stretch sm:self-auto shrink-0 pt-2 sm:pt-0 gap-3">
                      <button
                        onClick={() => handleMatchClick(match.id)}
                        className="text-xs font-bold text-[#FFF9CA] hover:text-[#FFF5B2] transition-colors"
                      >
                        Lihat Detail
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="text-[10px] font-bold text-red-500/80 hover:text-red-400 transition-colors uppercase tracking-wider"
                      >
                        Hapus
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
