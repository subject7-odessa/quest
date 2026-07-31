"use client";
import { rankForPoints, RANK_COLORS } from "@/lib/ranks";
import type { MuscleScores } from "@/lib/attributes";

const GROUP_LABELS: Record<keyof MuscleScores, string> = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  bracos: "Braços",
  abdomen: "Abdômen",
  pernas: "Pernas",
  posterior: "Posterior",
  panturrilhas: "Panturrilhas",
};

function colorFor(points: number) {
  return RANK_COLORS[rankForPoints(points).name];
}

export function MuscleMap({ scores }: { scores: MuscleScores }) {
  const c = (key: keyof MuscleScores) => colorFor(scores[key]);
  const glow = (key: keyof MuscleScores) => `drop-shadow(0 0 6px ${colorFor(scores[key])}88)`;

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
      <svg viewBox="0 0 200 420" className="w-48" xmlns="http://www.w3.org/2000/svg">
        {/* cabeça */}
        <circle cx="100" cy="30" r="22" fill="#132638" stroke="#1c3a52" />
        {/* ombros */}
        <rect x="55" y="55" width="90" height="20" rx="10" fill={c("ombros")} style={{ filter: glow("ombros") }} />
        {/* peito */}
        <rect x="70" y="75" width="60" height="45" rx="6" fill={c("peito")} style={{ filter: glow("peito") }} />
        {/* braços */}
        <rect x="35" y="75" width="22" height="90" rx="10" fill={c("bracos")} style={{ filter: glow("bracos") }} />
        <rect x="143" y="75" width="22" height="90" rx="10" fill={c("bracos")} style={{ filter: glow("bracos") }} />
        {/* abdomen */}
        <rect x="72" y="122" width="56" height="55" rx="6" fill={c("abdomen")} style={{ filter: glow("abdomen") }} />
        {/* pernas */}
        <rect x="70" y="180" width="26" height="110" rx="10" fill={c("pernas")} style={{ filter: glow("pernas") }} />
        <rect x="104" y="180" width="26" height="110" rx="10" fill={c("pernas")} style={{ filter: glow("pernas") }} />
        {/* panturrilhas */}
        <rect x="70" y="292" width="26" height="60" rx="8" fill={c("panturrilhas")} style={{ filter: glow("panturrilhas") }} />
        <rect x="104" y="292" width="26" height="60" rx="8" fill={c("panturrilhas")} style={{ filter: glow("panturrilhas") }} />
        <text x="100" y="410" textAnchor="middle" fill="#7c93a8" fontSize="10" letterSpacing="1">FRENTE (COSTAS calculada por baixo)</text>
      </svg>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {(Object.keys(GROUP_LABELS) as (keyof MuscleScores)[]).map((key) => {
          const pts = scores[key];
          const rank = rankForPoints(pts);
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: RANK_COLORS[rank.name], boxShadow: `0 0 6px ${RANK_COLORS[rank.name]}88` }}
              />
              <span className="w-24 text-slate">{GROUP_LABELS[key]}</span>
              <span className="font-display font-bold" style={{ color: RANK_COLORS[rank.name] }}>{rank.name}</span>
              <span className="text-xs text-slate">({pts})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
