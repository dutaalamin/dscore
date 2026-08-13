import React from 'react';
import { TrendingUp, Award, Zap, BarChart2 } from 'lucide-react';

export default function MatchStats({
  rallyTimeline,
  gameHistory,
  playerANames,
  playerBNames,
  scoreA,
  scoreB
}) {
  // 1. Calculate stats from rally timeline
  const totalPoints = rallyTimeline.length;
  const pointsA = rallyTimeline.filter(x => x === 'A').length;
  const pointsB = rallyTimeline.filter(x => x === 'B').length;

  const pctA = totalPoints > 0 ? Math.round((pointsA / totalPoints) * 100) : 50;
  const pctB = totalPoints > 0 ? Math.round((pointsB / totalPoints) * 100) : 50;

  // Calculate streaks
  let maxStreakA = 0;
  let maxStreakB = 0;
  let currentStreak = 0;
  let currentTeam = null;

  rallyTimeline.forEach(point => {
    if (point === currentTeam) {
      currentStreak++;
    } else {
      if (currentTeam === 'A') {
        maxStreakA = Math.max(maxStreakA, currentStreak);
      } else if (currentTeam === 'B') {
        maxStreakB = Math.max(maxStreakB, currentStreak);
      }
      currentTeam = point;
      currentStreak = 1;
    }
  });
  // Clean up last item
  if (currentTeam === 'A') {
    maxStreakA = Math.max(maxStreakA, currentStreak);
  } else if (currentTeam === 'B') {
    maxStreakB = Math.max(maxStreakB, currentStreak);
  }

  const teamAName = playerANames.join(' & ');
  const teamBName = playerBNames.join(' & ');

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-carbon-border pb-3">
        <BarChart2 className="w-5 h-5 text-white" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Statistik Pertandingan</h3>
      </div>

      {/* Set Scores List */}
      {gameHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Skor Game Sebelumnya</h4>
          <div className="grid grid-cols-3 gap-2">
            {gameHistory.map((game, idx) => (
              <div key={idx} className="bg-black/30 border border-carbon-border/50 rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500 font-mono font-bold mb-1">GAME {idx + 1}</div>
                <div className="flex items-center justify-center gap-1.5 font-digital font-bold text-sm">
                  <span className={game.scoreA > game.scoreB ? 'text-red-500 font-black' : 'text-gray-400'}>{game.scoreA}</span>
                  <span className="text-gray-600">:</span>
                  <span className={game.scoreB > game.scoreA ? 'text-emerald-500 font-black' : 'text-gray-400'}>{game.scoreB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Point Distribution Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-red-500 font-bold truncate max-w-[120px] sm:max-w-none">{teamAName}</span>
          <span className="text-gray-400 font-mono">Distribusi Poin (Game Ini)</span>
          <span className="text-emerald-500 font-bold truncate max-w-[120px] sm:max-w-none text-right">{teamBName}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex border border-carbon-border/50">
          <div
            style={{ width: `${pctA}%` }}
            className="bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] transition-all duration-500"
          />
          <div
            style={{ width: `${pctB}%` }}
            className="bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
          />
        </div>
        
        <div className="flex justify-between text-[11px] font-mono text-gray-500">
          <span>{pointsA} pts ({pctA}%)</span>
          <span>{totalPoints} total poin</span>
          <span>{pointsB} pts ({pctB}%)</span>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak A */}
        <div className="bg-black/20 border border-carbon-border/30 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 font-mono uppercase">Streak Terpanjang A</div>
          <div className="text-lg font-bold text-red-500 font-mono">{maxStreakA} <span className="text-[10px] text-gray-500">poin</span></div>
        </div>

        {/* Streak B */}
        <div className="bg-black/20 border border-carbon-border/30 rounded-xl p-4">
          <div className="text-[10px] text-gray-500 font-mono uppercase">Streak Terpanjang B</div>
          <div className="text-lg font-bold text-emerald-500 font-mono">{maxStreakB} <span className="text-[10px] text-gray-500">poin</span></div>
        </div>
      </div>

      {/* Point Progression Timeline Dot Chart */}
      {rallyTimeline.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Alur Poin (Timeline)</h4>
          <div className="flex flex-wrap gap-1.5 p-3 bg-black/40 border border-carbon-border/50 rounded-xl max-h-[100px] overflow-y-auto no-scrollbar">
            {rallyTimeline.map((team, idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono transition-transform hover:scale-110 shrink-0 ${
                  team === 'A'
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.2)]'
                    : 'bg-emerald-500 text-black shadow-[0_0_6px_rgba(16,185,129,0.3)]'
                }`}
                title={`Poin ke-${idx + 1} diperoleh oleh Tim ${team}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
