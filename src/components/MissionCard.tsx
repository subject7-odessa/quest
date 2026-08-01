"use client";
import { motion } from "framer-motion";

const STAT_LABELS: Record<string, string> = {
  strength: "Força",
  speed: "Velocidade",
  potential: "Potencial",
  intelligence: "Inteligência",
  endurance: "Resistência",
};

export function MissionCard({
  title,
  description,
  targetStat,
  xpReward,
  attributeBonus,
  done,
  onToggle,
}: {
  title: string;
  description?: string | null;
  targetStat: string;
  xpReward: number;
  attributeBonus: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      className={`flex items-center gap-3 border border-line bg-void/60 p-3 ${done ? "opacity-40" : ""}`}
    >
      <div className="flex-1">
        <div className="font-body text-[15px] font-bold">{title}</div>
        {description && <div className="text-xs text-slate">{description}</div>}
        <div className="mt-1 text-xs text-slate">
          <span className="mr-3">{STAT_LABELS[targetStat] ?? targetStat}</span>
          <span className="mr-3">+{xpReward} XP</span>
          <span>+{attributeBonus} pts</span>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`whitespace-nowrap border px-4 py-2 text-sm font-bold tracking-wide ${
          done ? "border-line text-slate" : "border-teal bg-teal/10 text-teal hover:bg-teal hover:text-void"
        }`}
      >
        {done ? "REFAZER" : "CONCLUIR"}
      </button>
    </motion.div>
  );
}
