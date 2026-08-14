import { useState, useEffect } from 'react';
import { announceScore, playSound } from '../utils/audio';
import { supabase } from '../utils/supabase';

// Initial state creator
const createInitialState = (config) => {
  const { playerA1, playerA2, playerB1, playerB2, matchType, targetPoints, firstServer, voiceEnabled, voiceLanguage } = config;
  
  // Default positions:
  // Singles: A1 on left, B1 on right
  // Doubles: A1 at bottom-left (Right Court), A2 at top-left (Left Court)
  //          B1 at top-right (Right Court), B2 at bottom-right (Left Court)
  return {
    scoreA: 0,
    scoreB: 0,
    gamesA: 0,
    gamesB: 0,
    gameHistory: [], // array of {scoreA, scoreB}
    servingTeam: firstServer === 'A' ? 'A' : 'B',
    // Positions: map of court box -> player name
    // Left side: A_top (Left court, odd), A_bottom (Right court, even)
    // Right side: B_top (Right court, even), B_bottom (Left court, odd)
    positions: {
      A_top: matchType === 'singles' ? '' : playerA2 || 'Pemain A2',
      A_bottom: playerA1 || 'Pemain A1',
      B_top: playerB1 || 'Pemain B1',
      B_bottom: matchType === 'singles' ? '' : playerB2 || 'Pemain B2',
    },
    lastServer: null,
    matchEnded: false,
    gameEnded: false,
    winner: null,
    sidesSwapped: false,
    rallyTimeline: [], // array of 'A' or 'B' representing who won each point in the current game
  };
};

export const useBadminton = (config, matchId = null, isViewer = false) => {
  const [matchConfig, setMatchConfig] = useState(config);
  const [state, setState] = useState(() => createInitialState(config));
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Setup match timer (hanya untuk wasit)
  useEffect(() => {
    if (isViewer) return;
    let interval = null;
    if (isTimerRunning && !state.matchEnded) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, state.matchEnded, isViewer]);

  // 1. Sinkronisasi status wasit ke database Supabase (debounce 400ms)
  useEffect(() => {
    if (!matchId || isViewer || !supabase) return;

    const syncToDatabase = async () => {
      try {
        await supabase
          .from('matches')
          .update({
            state: state,
            timer: timer,
            is_timer_running: isTimerRunning,
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId);
      } catch (err) {
        console.error('Gagal melakukan sinkronisasi status ke Supabase:', err);
      }
    };

    const timeout = setTimeout(syncToDatabase, 400);
    return () => clearTimeout(timeout);
  }, [state, timer, isTimerRunning, matchId, isViewer]);

  // 2. Berlangganan (subscribe) real-time skor untuk mode penonton (Viewer)
  useEffect(() => {
    if (!matchId || !isViewer || !supabase) return;

    const fetchInitialState = async () => {
      try {
        const { data } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (data) {
          if (data.state) setState(data.state);
          if (data.timer !== undefined) setTimer(data.timer);
          if (data.is_timer_running !== undefined) setIsTimerRunning(data.is_timer_running);
          if (data.config) setMatchConfig(data.config);
        }
      } catch (err) {
        console.error('Gagal mengambil data awal pertandingan dari Supabase:', err);
      }
    };

    fetchInitialState();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => {
          const { state: newState, timer: newTimer, is_timer_running: newIsTimerRunning, config: newConfig } = payload.new;
          if (newState) setState(newState);
          if (newTimer !== undefined) setTimer(newTimer);
          if (newIsTimerRunning !== undefined) setIsTimerRunning(newIsTimerRunning);
          if (newConfig) setMatchConfig(newConfig);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, isViewer]);

  // Trigger voice announcement when score changes
  const triggerVoiceAnnouncement = (newState, isGameOverLocal) => {
    if (!matchConfig.voiceEnabled) return;

    const { scoreA, scoreB, servingTeam, positions, gamesA, gamesB } = newState;
    const isSingles = matchConfig.matchType === 'singles';
    
    // Find server and receiver names
    let serverName = '';
    let receiverName = '';
    
    if (servingTeam === 'A') {
      if (isSingles) {
        serverName = positions.A_bottom || positions.A_top;
        receiverName = positions.B_top || positions.B_bottom;
      } else {
        const isEven = scoreA % 2 === 0;
        serverName = isEven ? positions.A_bottom : positions.A_top;
        receiverName = isEven ? positions.B_top : positions.B_bottom;
      }
    } else {
      if (isSingles) {
        serverName = positions.B_top || positions.B_bottom;
        receiverName = positions.A_bottom || positions.A_top;
      } else {
        const isEven = scoreB % 2 === 0;
        serverName = isEven ? positions.B_top : positions.B_bottom;
        receiverName = isEven ? positions.A_bottom : positions.A_top;
      }
    }

    const serverScore = servingTeam === 'A' ? scoreA : scoreB;
    const receiverScore = servingTeam === 'A' ? scoreB : scoreA;

    // Check if game point or match point
    const target = matchConfig.targetPoints;
    const maxScore = Math.max(scoreA, scoreB);
    const minScore = Math.min(scoreA, scoreB);
    
    const isDeuce = scoreA >= target - 1 && scoreB >= target - 1 && scoreA === scoreB;
    
    let isGamePoint = false;
    let isMatchPoint = false;

    // Game point condition: leading player has at least target - 1 points and leads by at least 1, OR deuce situations
    const leadingScore = maxScore;
    const laggingScore = minScore;
    const leadingTeam = scoreA > scoreB ? 'A' : 'B';
    
    const isLeadingCloseToWin = (leadingScore >= target && leadingScore - laggingScore >= 1) || (leadingScore === target - 1 && laggingScore < target - 1);
    
    if (isLeadingCloseToWin) {
      const leadingGames = leadingTeam === 'A' ? gamesA : gamesB;
      // Match point if the leading team needs this game to win the match (best of 3: having 1 game already)
      if (leadingGames === 1) {
        isMatchPoint = true;
      } else {
        isGamePoint = true;
      }
    }

    announceScore(
      serverName,
      serverScore,
      receiverName,
      receiverScore,
      isGamePoint,
      isMatchPoint,
      isDeuce,
      isGameOverLocal,
      isGameOverLocal ? (newState.winner === 'A' ? 'Team A' : 'Team B') : '',
      matchConfig.voiceLanguage
    );
  };

  // Sound and voice announcer for first serve on mount / setup
  useEffect(() => {
    if (matchConfig.voiceEnabled && window.speechSynthesis) {
      // Cancel any ongoing/queued announcements to prevent double trigger in React StrictMode
      window.speechSynthesis.cancel();

      const text = matchConfig.voiceLanguage === 'id' ? 'Pertandingan dimulai. Kosong sama, mulai.' : 'Match starts. Love all, play.';
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = matchConfig.voiceLanguage === 'id' ? 'id-ID' : 'en-US';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }
    setIsTimerRunning(true);
  }, [matchConfig]);

  // Process score increment
  const addPoint = (team) => {
    if (isViewer || state.matchEnded) return;

    // Play crisp point chime
    playSound('point');

    // Save history
    setHistory((prev) => [...prev, { ...state, positions: { ...state.positions }, gameHistory: [...state.gameHistory], rallyTimeline: [...state.rallyTimeline] }]);
    setRedoStack([]); // Clear redo stack on new action

    setState((prev) => {
      let nextScoreA = prev.scoreA;
      let nextScoreB = prev.scoreB;
      let nextServingTeam = prev.servingTeam;
      let nextPositions = { ...prev.positions };
      let nextRallyTimeline = [...prev.rallyTimeline, team];

      // 1. Update score
      if (team === 'A') {
        nextScoreA += 1;
      } else {
        nextScoreB += 1;
      }

      // 2. Adjust serving team and swap positions if server team won the point
      const isSingles = matchConfig.matchType === 'singles';
      if (team === 'A') {
        if (prev.servingTeam === 'A') {
          // Serving team wins rally: they swap positions (doubles only)
          if (!isSingles) {
            const temp = nextPositions.A_top;
            nextPositions.A_top = nextPositions.A_bottom;
            nextPositions.A_bottom = temp;
          }
        } else {
          // Receiving team wins rally: they become server, no position swap
          nextServingTeam = 'A';
        }
      } else {
        if (prev.servingTeam === 'B') {
          // Serving team wins rally: they swap positions (doubles only)
          if (!isSingles) {
            const temp = nextPositions.B_top;
            nextPositions.B_top = nextPositions.B_bottom;
            nextPositions.B_bottom = temp;
          }
        } else {
          // Receiving team wins rally: they become server, no position swap
          nextServingTeam = 'B';
        }
      }

      // 3. Rule Engine: Check if Game is Won
      const target = matchConfig.targetPoints;
      let isGameWon = false;

      const diff = Math.abs(nextScoreA - nextScoreB);
      const maxScore = Math.max(nextScoreA, nextScoreB);

      if (maxScore >= target) {
        if (diff >= 2) {
          isGameWon = true;
        } else if (maxScore === 30) {
          // Golden point rule: capped at 30
          isGameWon = true;
        }
      }

      let nextGamesA = prev.gamesA;
      let nextGamesB = prev.gamesB;
      let nextGameHistory = [...prev.gameHistory];
      let nextMatchEnded = prev.matchEnded;
      let nextWinner = prev.winner;
      let nextGameEnded = prev.gameEnded;

      if (isGameWon) {
        const gameWinner = nextScoreA > nextScoreB ? 'A' : 'B';
        if (gameWinner === 'A') {
          nextGamesA += 1;
        } else {
          nextGamesB += 1;
        }

        nextGameHistory.push({ scoreA: nextScoreA, scoreB: nextScoreB });
        nextGameEnded = true;

        // Check if Match is Won (best of 3)
        const gamesToWin = 2; // Best of 3
        if (nextGamesA === gamesToWin || nextGamesB === gamesToWin) {
          nextMatchEnded = true;
          nextWinner = nextGamesA === gamesToWin ? 'A' : 'B';
          setIsTimerRunning(false);
          playSound('gameover');
        } else {
          // Game ended, but match goes on
          // Prepare for next game: reset score
          nextScoreA = 0;
          nextScoreB = 0;
          nextRallyTimeline = [];
          
          // Badminton rules: winner of the previous game serves first in the next game
          nextServingTeam = gameWinner;

          // Swap sides automatically at end of game
          const nextSidesSwapped = !prev.sidesSwapped;
          
          // Voice alert for Game Point / End of Game
          triggerVoiceAnnouncement({
            ...prev,
            scoreA: team === 'A' ? prev.scoreA + 1 : prev.scoreA,
            scoreB: team === 'B' ? prev.scoreB + 1 : prev.scoreB,
            servingTeam: nextServingTeam,
            gamesA: nextGamesA,
            gamesB: nextGamesB,
            winner: gameWinner,
          }, true);

          return {
            ...prev,
            scoreA: 0,
            scoreB: 0,
            gamesA: nextGamesA,
            gamesB: nextGamesB,
            gameHistory: nextGameHistory,
            servingTeam: nextServingTeam,
            positions: nextPositions,
            sidesSwapped: nextSidesSwapped,
            rallyTimeline: [],
            gameEnded: true,
          };
        }
      }

      const updatedState = {
        ...prev,
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        gamesA: nextGamesA,
        gamesB: nextGamesB,
        gameHistory: nextGameHistory,
        servingTeam: nextServingTeam,
        positions: nextPositions,
        matchEnded: nextMatchEnded,
        winner: nextWinner,
        gameEnded: nextGameEnded,
        rallyTimeline: nextRallyTimeline,
      };

      // Speak score
      if (!isGameWon) {
        triggerVoiceAnnouncement(updatedState, false);
      } else if (nextMatchEnded) {
        triggerVoiceAnnouncement(updatedState, true);
      }

      return updatedState;
    });
  };

  const undo = () => {
    if (isViewer || history.length === 0) return;
    playSound('undo');
    
    // Save current to redo
    const current = { ...state, positions: { ...state.positions }, gameHistory: [...state.gameHistory], rallyTimeline: [...state.rallyTimeline] };
    setRedoStack((prev) => [...prev, current]);

    // Apply last history
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setState(previous);
  };

  const redo = () => {
    if (isViewer || redoStack.length === 0) return;
    playSound('click');

    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    // Save current to history
    setHistory((prev) => [...prev, { ...state, positions: { ...state.positions }, gameHistory: [...state.gameHistory], rallyTimeline: [...state.rallyTimeline] }]);
    setState(next);
  };

  // Manual point correction (decrease score)
  const decrementScore = (team) => {
    if (isViewer || state.matchEnded) return;

    if (team === 'A' && state.scoreA === 0) return;
    if (team === 'B' && state.scoreB === 0) return;

    playSound('undo');
    setHistory((prev) => [...prev, { ...state, positions: { ...state.positions }, gameHistory: [...state.gameHistory], rallyTimeline: [...state.rallyTimeline] }]);
    setRedoStack([]);

    setState((prev) => {
      return {
        ...prev,
        scoreA: team === 'A' ? prev.scoreA - 1 : prev.scoreA,
        scoreB: team === 'B' ? prev.scoreB - 1 : prev.scoreB,
        rallyTimeline: prev.rallyTimeline.slice(0, -1),
      };
    });
  };

  // Swap sides manually
  const toggleSides = () => {
    if (isViewer) return;
    playSound('click');
    setState((prev) => ({
      ...prev,
      sidesSwapped: !prev.sidesSwapped,
    }));
  };

  // Reset current game ended flag to resume play
  const dismissGameEnded = () => {
    if (isViewer) return;
    setState((prev) => ({
      ...prev,
      gameEnded: false,
    }));
  };

  // Restart match from scratch
  const restartMatch = () => {
    if (isViewer) return;
    playSound('warning');
    setState(createInitialState(matchConfig));
    setHistory([]);
    setRedoStack([]);
    setTimer(0);
    setIsTimerRunning(true);
  };

  // Re-configure match (back to setup - resets game!)
  const changeSettings = (newConfig) => {
    if (isViewer) return;
    playSound('click');
    setMatchConfig(newConfig);
    setState(createInitialState(newConfig));
    setHistory([]);
    setRedoStack([]);
    setTimer(0);
    setIsTimerRunning(false);
  };

  // Safely update config (like voice toggle) without resetting game state
  const updateConfig = (newConfig) => {
    if (isViewer) return;
    setMatchConfig(newConfig);
  };

  // Switch server (e.g. manual serve correction before point begins)
  const setServerManually = (team) => {
    if (isViewer) return;
    playSound('click');
    setState((prev) => ({
      ...prev,
      servingTeam: team,
    }));
  };

  // Manual swap player positions (doubles correction)
  const swapPositionsManually = (team) => {
    if (isViewer) return;
    playSound('click');
    setState((prev) => {
      const nextPositions = { ...prev.positions };
      if (team === 'A') {
        const temp = nextPositions.A_top;
        nextPositions.A_top = nextPositions.A_bottom;
        nextPositions.A_bottom = temp;
      } else {
        const temp = nextPositions.B_top;
        nextPositions.B_top = nextPositions.B_bottom;
        nextPositions.B_bottom = temp;
      }
      return {
        ...prev,
        positions: nextPositions,
      };
    });
  };

  return {
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
    updateConfig,
    setServerManually,
    swapPositionsManually,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    matchConfig,
  };
};
