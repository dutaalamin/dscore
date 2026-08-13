// Sound effects and Speech Synthesis for premium UX

// Helper to play synthesized sounds using Web Audio API (no external file dependencies)
export const playSound = (type = 'click') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      // Short crisp click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'point') {
      // Nice ascending chime for scoring a point
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'undo') {
      // Descending warning tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'warning') {
      // Double beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'gameover') {
      // Celebratory fan-fare chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (error) {
    console.error("Web Audio API is not supported or blocked: ", error);
  }
};

// Text-to-Speech scorer
let currentUtterance = null;

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const announceScore = (serverName, serverScore, receiverName, receiverScore, isGamePoint, isMatchPoint, isDeuce, isGameOver, winnerName, language = 'en') => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing announcements to avoid lag
  window.speechSynthesis.cancel();

  let text = '';

  if (language === 'id') {
    // Indonesian Announcements
    if (isGameOver) {
      text = `Game selesai. Pemenangnya adalah ${winnerName}.`;
    } else if (isDeuce) {
      text = `Jus, ${serverScore} sama.`;
    } else {
      const scoreAnn = serverScore === 0 && receiverScore === 0 ? 'Kosong sama' : `${serverScore}, ${receiverScore}`;
      const alert = isMatchPoint ? 'Match point!' : isGamePoint ? 'Game point!' : '';
      text = `${scoreAnn}. ${alert}`;
    }
  } else {
    // English Announcements (default standard)
    if (isGameOver) {
      text = `Game, match won by ${winnerName}.`;
    } else if (isDeuce) {
      text = `Deuce, ${serverScore} all.`;
    } else {
      let scoreText = '';
      if (serverScore === 0 && receiverScore === 0) {
        scoreText = 'Love all, play.';
      } else if (serverScore === receiverScore) {
        scoreText = `${serverScore} all.`;
      } else {
        scoreText = `${serverScore}, ${receiverScore}.`;
      }

      const alert = isMatchPoint ? 'Match point.' : isGamePoint ? 'Game point.' : '';
      text = `${scoreText} ${alert}`;
    }
  }

  currentUtterance = new SpeechSynthesisUtterance(text);

  // Set voice locale
  if (language === 'id') {
    currentUtterance.lang = 'id-ID';
  } else {
    currentUtterance.lang = 'en-US';
  }

  currentUtterance.rate = 0.95; // Slightly slower for clear referee announcement
  currentUtterance.pitch = 1.0;

  window.speechSynthesis.speak(currentUtterance);
};
