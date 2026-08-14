import React, { useState, useEffect } from 'react';
import MatchSetup from './components/MatchSetup';
import Scoreboard from './components/Scoreboard';
import { stopSpeech } from './utils/audio';
import { supabase } from './utils/supabase';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchConfig, setMatchConfig] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [isViewer, setIsViewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [savedMatchState, setSavedMatchState] = useState(null);
  const [savedTimer, setSavedTimer] = useState(null);

  // Cek parameter URL saat aplikasi dibuka
  useEffect(() => {
    const checkUrlParams = async () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('match');

      if (id && supabase) {
        try {
          const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('id', id)
            .single();

          if (data) {
            setMatchId(id);
            setMatchConfig(data.config);
            setIsPlaying(true);
            
            // Simpan state dan timer yang sudah ada dari database
            if (data.state) setSavedMatchState(data.state);
            if (data.timer !== undefined) setSavedTimer(data.timer);
            
            // Cek apakah pengguna saat ini adalah Wasit (Referee) yang sah
            const isReferee = localStorage.getItem(`referee_${id}`) === 'true';
            setIsViewer(!isReferee);
          } else {
            console.error('Match tidak ditemukan di Supabase:', error);
            if (error) setDbError(`Gagal memuat pertandingan: ${error.message}`);
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch (err) {
          console.error('Gagal mengambil status pertandingan:', err);
          setDbError(`Koneksi database error: ${err.message}`);
        }
      }
      setLoading(false);
    };

    checkUrlParams();
  }, []);

  const handleStartMatch = async (config) => {
    setMatchConfig(config);
    setSavedMatchState(null);
    setSavedTimer(null);
    setIsPlaying(true);
    setDbError(null);

    if (supabase) {
      try {
        const generateUUID = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
          }
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        const newId = generateUUID();
        
        // Simpan token status referee lokal
        localStorage.setItem(`referee_${newId}`, 'true');

        // Buat state awal untuk disimpan ke database
        const initialState = {
          scoreA: 0,
          scoreB: 0,
          gamesA: 0,
          gamesB: 0,
          gameHistory: [],
          servingTeam: config.firstServer === 'A' ? 'A' : 'B',
          positions: {
            A_top: config.matchType === 'singles' ? '' : config.playerA2 || 'Pemain A2',
            A_bottom: config.playerA1 || 'Pemain A1',
            B_top: config.playerB1 || 'Pemain B1',
            B_bottom: config.matchType === 'singles' ? '' : config.playerB2 || 'Pemain B2',
          },
          lastServer: null,
          matchEnded: false,
          gameEnded: false,
          winner: null,
          sidesSwapped: false,
          rallyTimeline: [],
        };

        const { error } = await supabase
          .from('matches')
          .insert({
            id: newId,
            config: config,
            state: initialState,
            timer: 0,
            is_timer_running: true
          });

        if (!error) {
          setMatchId(newId);
          setIsViewer(false);
          // Perbarui parameter URL browser tanpa refresh
          window.history.pushState(null, '', `?match=${newId}`);
        } else {
          console.error('Gagal menginisiasi pertandingan di database Supabase:', error);
          setDbError(`Gagal menyimpan ke database: ${error.message} (Skor tidak tersinkronisasi online)`);
        }
      } catch (err) {
        console.error('Gagal terhubung ke server Supabase:', err);
        setDbError(`Gagal terhubung ke server database: ${err.message} (Berjalan offline)`);
      }
    } else {
      setDbError('Supabase tidak terkonfigurasi. Berjalan dalam mode offline lokal.');
    }
  };

  const handleBackToSetup = () => {
    stopSpeech();
    setIsPlaying(false);
    setMatchConfig(null);
    setMatchId(null);
    setSavedMatchState(null);
    setSavedTimer(null);
    setIsViewer(false);
    setDbError(null);
    // Bersihkan parameter query URL
    window.history.pushState(null, '', window.location.pathname);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
        <div className="text-sm font-sans tracking-widest uppercase text-zinc-500">Loading Match...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-between w-full ${isPlaying ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-center justify-center w-full px-4 ${isPlaying ? 'h-full py-2 overflow-hidden' : 'py-2 sm:py-4'}`}>
        {dbError && (
          <div className="w-full max-w-2xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl mb-4 flex items-center justify-between gap-2 shadow-lg backdrop-blur-sm">
            <span><strong>Database Alert:</strong> {dbError}</span>
            <button onClick={() => setDbError(null)} className="text-red-400 hover:text-white font-bold px-1">✕</button>
          </div>
        )}

        {isPlaying && matchConfig ? (
          <Scoreboard 
            matchConfig={matchConfig} 
            onBackToSetup={handleBackToSetup} 
            matchId={matchId} 
            isViewer={isViewer}
            savedMatchState={savedMatchState}
            savedTimer={savedTimer}
          />
        ) : (
          <MatchSetup onStart={handleStartMatch} />
        )}
      </main>
    </div>
  );
}

export default App;
