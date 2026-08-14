import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function CourtVisualizer({
  matchType,
  scoreA,
  scoreB,
  servingTeam,
  positions,
  sidesSwapped,
  onSwapPositions, // handler to manually swap player positions for a team
  playerA1,
  playerB1
}) {
  const isSingles = matchType === 'singles';

  // 1. Determine active server & receiver boxes
  let serverBox = '';
  let receiverBox = '';

  if (servingTeam === 'A') {
    const isEven = scoreA % 2 === 0;
    serverBox = isEven ? 'A_bottom' : 'A_top';
    receiverBox = isEven ? 'B_top' : 'B_bottom';
  } else {
    const isEven = scoreB % 2 === 0;
    serverBox = isEven ? 'B_top' : 'B_bottom';
    receiverBox = isEven ? 'A_bottom' : 'A_top';
  }

  // 2. Resolve display names for boxes
  // For singles, the positions of both players are determined by the serving team's score
  let displayPositions = { ...positions };
  if (isSingles) {
    const servingScore = servingTeam === 'A' ? scoreA : scoreB;
    const isEven = servingScore % 2 === 0;

    displayPositions.A_bottom = isEven ? playerA1 : '';
    displayPositions.A_top = !isEven ? playerA1 : '';
    displayPositions.B_top = isEven ? playerB1 : '';
    displayPositions.B_bottom = !isEven ? playerB1 : '';
  }

  // Helper to render a player box (placed absolutely over the image coordinates)
  const renderPlayerBox = (boxId, label) => {
    const playerName = displayPositions[boxId];
    const isServer = serverBox === boxId;
    const isReceiver = receiverBox === boxId;

    const isTeamA = boxId.startsWith('A');
    let textClass = 'text-white/60';
    let dotColor = '';

    if (isServer || isReceiver) {
      textClass = isTeamA ? 'text-[#FFF9CA] font-black scale-105' : 'text-[#E3FDFD] font-black scale-105';
      dotColor = isTeamA ? 'bg-[#FFF9CA]' : 'bg-[#E3FDFD]';
    }

    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full select-none transition-all duration-300">
        {playerName && (
          <div className="flex flex-col items-center justify-center gap-1.5">
            {/* Player Name */}
            <div className={`text-xs sm:text-sm font-bold tracking-wide text-center drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] transition-all ${textClass}`}>
              {playerName}
            </div>

            {/* Active Status Badge */}
            {(isServer || isReceiver) && (
              <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/10 shadow-md">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span className="text-[7px] font-extrabold uppercase tracking-widest text-white/95">
                  {isServer ? 'Servis' : 'Penerima'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Posisi Lapangan & Servis
        </h4>

        {!isSingles && (
          <div className="flex gap-4">
            <button
              onClick={() => onSwapPositions('A')}
              className="text-[10px] flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 text-gray-300 rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#FFF9CA]" />
              Tukar Posisi A
            </button>
            <button
              onClick={() => onSwapPositions('B')}
              className="text-[10px] flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 text-gray-300 rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#E3FDFD]" />
              Tukar Posisi B
            </button>
          </div>
        )}
      </div>

      {/* Realistic Vector Court Layout Container */}
      <div className="relative w-full aspect-[2.1/1] rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 bg-[#050506]">
        {/* Background Court Image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url('https://media.istockphoto.com/id/1091319644/id/vektor/latar-belakang-lapangan-bulu-tangkis.jpg?s=612x612&w=0&k=20&c=BMlGjPMlAhj2Kzidn1RDdj3m9PXkJ6t2Iz7HRaxGHLQ=')`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Overlay Player Boxes */}
        {/* Top-Left Box */}
        <div className="absolute left-[6%] top-[10%] w-[44%] h-[40%] p-1">
          {!sidesSwapped ? renderPlayerBox('A_top', 'A2') : renderPlayerBox('B_top', 'B1')}
        </div>

        {/* Bottom-Left Box */}
        <div className="absolute left-[6%] top-[50%] w-[44%] h-[40%] p-1">
          {!sidesSwapped ? renderPlayerBox('A_bottom', 'A1') : renderPlayerBox('B_bottom', 'B2')}
        </div>

        {/* Top-Right Box */}
        <div className="absolute left-[50%] top-[10%] w-[44%] h-[40%] p-1">
          {!sidesSwapped ? renderPlayerBox('B_top', 'B1') : renderPlayerBox('A_top', 'A2')}
        </div>

        {/* Bottom-Right Box */}
        <div className="absolute left-[50%] top-[50%] w-[44%] h-[40%] p-1">
          {!sidesSwapped ? renderPlayerBox('B_bottom', 'B2') : renderPlayerBox('A_bottom', 'A1')}
        </div>
      </div>
    </div>
  );
}
