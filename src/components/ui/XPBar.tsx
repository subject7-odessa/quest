"use client";
import { motion } from "framer-motion";
import { levelForXp, xpForNextLevel } from "@/lib/ranks";

export function XPBar({ totalXp }: { totalXp: number }) {
  const level = levelForXp(totalXp);
  const { current, needed } = xpForNextLevel(totalXp);
  const pct = Math.min(1, current / needed);

  return (
    <div className="border border-line bg-void/60 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <span className="font-display text-2xl font-black text-cyan">Nv. {level}</span>
          <span className="ml-2 text-xs tracking-wide text-slate">(disciplina/engajamento)</span>
        </div>
        <span className="text-xs text-slate">{current}/{needed} XP</span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm bg-[#132638]">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan to-teal"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
