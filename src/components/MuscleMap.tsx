"use client";
import { rankForPoints, RANK_COLORS } from "@/lib/ranks";
import { MUSCLE_LABELS, type MuscleScores, type MuscleGroup } from "@/lib/exercises";

function colorFor(points: number) {
  return RANK_COLORS[rankForPoints(points).name];
}

export function MuscleMap({ scores }: { scores: MuscleScores }) {
  const c = (key: MuscleGroup) => colorFor(scores[key]);
  const glow = (key: MuscleGroup) => `drop-shadow(0 0 7px ${colorFor(scores[key])}99)`;
  const fill = (key: MuscleGroup) => ({ fill: c(key), filter: glow(key) });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-start justify-center gap-8">
        {/* FRENTE */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 200 430" className="w-40 sm:w-48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="26" r="20" fill="#132638" stroke="#1c3a52" strokeWidth="1.5" />
            <path d="M60 55 Q100 45 140 55 L148 78 Q100 70 52 78 Z" style={fill("ombros")} />
            <path d="M74 70 Q100 65 126 70 L130 130 Q100 140 70 130 Z" style={fill("peito")} />
            <path d="M72 128 Q100 135 128 128 L124 178 Q100 186 76 178 Z" style={fill("abdomen")} />
            <path d="M40 78 Q56 76 52 82 L48 145 Q40 160 34 150 Z" style={fill("ombros")} />
            <path d="M160 78 Q144 76 148 82 L152 145 Q160 160 166 150 Z" style={fill("ombros")} />
            <rect x="30" y="145" width="20" height="55" rx="8" style={fill("biceps")} />
            <rect x="150" y="145" width="20" height="55" rx="8" style={fill("biceps")} />
            <rect x="72" y="178" width="24" height="105" rx="10" style={fill("pernas")} />
            <rect x="104" y="178" width="24" height="105" rx="10" style={fill("pernas")} />
            <rect x="72" y="288" width="24" height="58" rx="8" style={fill("panturrilhas")} />
            <rect x="104" y="288" width="24" height="58" rx="8" style={fill("panturrilhas")} />
            <text x="100" y="415" textAnchor="middle" fill="#7c93a8" fontSize="11" letterSpacing="1">FRENTE</text>
          </svg>
        </div>

        {/* COSTAS */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 200 430" className="w-40 sm:w-48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="26" r="20" fill="#132638" stroke="#1c3a52" strokeWidth="1.5" />
            <path d="M60 55 Q100 45 140 55 L148 78 Q100 70 52 78 Z" style={fill("ombros")} />
            <path d="M68 70 Q100 62 132 70 L128 150 Q100 160 72 150 Z" style={fill("costas")} />
            <path d="M40 78 Q56 76 52 82 L48 145 Q40 160 34 150 Z" style={fill("ombros")} />
            <path d="M160 78 Q144 76 148 82 L152 145 Q160 160 166 150 Z" style={fill("ombros")} />
            <rect x="30" y="145" width="20" height="55" rx="8" style={fill("triceps")} />
            <rect x="150" y="145" width="20" height="55" rx="8" style={fill("triceps")} />
            <path d="M72 150 Q100 158 128 150 L124 195 Q100 202 76 195 Z" style={fill("posterior")} />
            <rect x="72" y="195" width="24" height="88" rx="10" style={fill("pernas")} />
            <rect x="104" y="195" width="24" height="88" rx="10" style={fill("pernas")} />
            <rect x="72" y="288" width="24" height="58" rx="8" style={fill("panturrilhas")} />
            <rect x="104" y="288" width="24" height="58" rx="8" style={fill("panturrilhas")} />
            <text x="100" y="415" textAnchor="middle" fill="#7c93a8" fontSize="11" letterSpacing="1">COSTAS</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((key) => {
          const pts = scores[key];
          const rank = rankForPoints(pts);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: RANK_COLORS[rank.name], boxShadow: `0 0 6px ${RANK_COLORS[rank.name]}88` }} />
              <span className="w-24 text-slate">{MUSCLE_LABELS[key]}</span>
              <span className="font-display font-bold" style={{ color: RANK_COLORS[rank.name] }}>{rank.name}</span>
              <span className="text-xs text-slate">({pts})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
