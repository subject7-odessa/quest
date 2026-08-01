"use client";
import { motion } from "framer-motion";
import { rankForPoints, progressWithinBand, RANK_COLORS } from "@/lib/ranks";
import { LEGENDARY_REFERENCE } from "@/lib/legendary";
import { RankBadge } from "./RankBadge";

export function StatBar({ label, statKey, points, sourceNote }: { label: string; statKey?: string; points: number; sourceNote?: string }) {
  const rank = rankForPoints(points);
  const progress = progressWithinBand(points);
  const color = RANK_COLORS[rank.name];
  const legend = statKey ? LEGENDARY_REFERENCE[statKey] : null;

  return (
    <div className="mb-2 grid grid-cols-[130px_44px_1fr] items-center gap-4 border border-line bg-void/60 p-3">
      <div>
        <div className="font-body text-[15px] font-bold tracking-wide">{label}</div>
        {sourceNote && <div className="text-[10px] tracking-wide text-slate">{sourceNote}</div>}
        {legend && <div className="text-[10px] tracking-wide text-gold/70">Infinite = nível {legend}</div>}
      </div>
      <RankBadge rank={rank.name} />
      <div className="flex items-center gap-2">
        <div className="h-5 flex-1 overflow-hidden rounded-sm bg-[#132638]">
          <motion.div
            className="h-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}66` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <span className="min-w-[46px] text-right text-xs text-slate">{points} pts</span>
      </div>
    </div>
  );
}
