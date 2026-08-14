import React from 'react';


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
    <div className="space-y-6 py-2">
      <div className="pb-2 border-b border-zinc-900">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Statistik Pertandingan</h3>
      </div>

      {/* Set Scores List */}
      {gameHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Skor Game Sebelumnya</h4>
          <div className="grid grid-cols-3 gap-3">
            {gameHistory.map((game, idx) => (
              <div key={idx} className="border border-zinc-900 py-2.5 px-3 text-center rounded-xl">
                <div className="text-[9px] text-gray-500 font-sans font-bold uppercase tracking-widest mb-1">GAME {idx + 1}</div>
                <div className="flex items-center justify-center gap-1.5 font-sans font-bold text-sm">
                  <span className={game.scoreA > game.scoreB ? 'text-[#FFF9CA] font-black' : 'text-gray-500'}>{game.scoreA}</span>
                  <span className="text-zinc-800">:</span>
                  <span className={game.scoreB > game.scoreA ? 'text-[#E3FDFD] font-black' : 'text-gray-500'}>{game.scoreB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Point Distribution Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#FFF9CA] font-bold truncate max-w-[120px] sm:max-w-none">{teamAName}</span>
          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Distribusi Poin</span>
          <span className="text-[#E3FDFD] font-bold truncate max-w-[120px] sm:max-w-none text-right">{teamBName}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${pctA}%` }}
            className="bg-[#FFF9CA] transition-all duration-500"
          />
          <div
            style={{ width: `${pctB}%` }}
            className="bg-[#E3FDFD] transition-all duration-500"
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-sans text-zinc-550 font-bold uppercase tracking-wider">
          <span>{pointsA} pts ({pctA}%)</span>
          <span className="text-zinc-650 font-normal">{totalPoints} total poin</span>
          <span>{pointsB} pts ({pctB}%)</span>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-900">
        {/* Streak A */}
        <div className="text-center border-r border-zinc-900">
          <div className="text-[9px] text-gray-500 font-sans uppercase tracking-widest font-bold">Streak Terpanjang A</div>
          <div className="text-2xl font-black text-[#FFF9CA] font-sans mt-1">{maxStreakA} <span className="text-xs text-gray-500 font-normal">poin</span></div>
        </div>

        {/* Streak B */}
        <div className="text-center">
          <div className="text-[9px] text-gray-500 font-sans uppercase tracking-widest font-bold">Streak Terpanjang B</div>
          <div className="text-2xl font-black text-[#E3FDFD] font-sans mt-1">{maxStreakB} <span className="text-xs text-gray-500 font-normal">poin</span></div>
        </div>
      </div>

      {/* Point Progression Timeline Dot Chart */}
      {rallyTimeline.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Alur Poin (Timeline)</h4>
          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar py-1">
            {rallyTimeline.map((team, idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-sans transition-transform hover:scale-110 shrink-0 ${
                  team === 'A'
                    ? 'bg-[#FFF9CA] text-zinc-950'
                    : 'bg-[#E3FDFD] text-zinc-950'
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
