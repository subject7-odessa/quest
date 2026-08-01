"use client";
import { motion } from "framer-motion";
import { RANK_COLORS, RankName } from "@/lib/ranks";

export function RankBadge({ rank, size = "md" }: { rank: RankName; size?: "sm" | "md" | "lg" }) {
  const color = RANK_COLORS[rank];
  const dims = { sm: "w-8 h-8 text-sm", md: "w-11 h-11 text-lg", lg: "w-16 h-16 text-2xl" }[size];

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`flex items-center justify-center rounded-md font-display font-black ${dims}`}
      style={{
        color,
        border: `1px solid ${color}`,
        boxShadow: `0 0 16px ${color}55`,
      }}
    >
      {rank}
    </motion.div>
  );
}
