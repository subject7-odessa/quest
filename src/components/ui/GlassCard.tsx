import clsx from "clsx";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  accent = "cyan",
}: {
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "teal" | "gold" | "violet";
}) {
  const borderColor = {
    cyan: "border-l-cyan",
    teal: "border-l-teal",
    gold: "border-l-gold",
    violet: "border-l-violet",
  }[accent];

  return (
    <div
      className={clsx(
        "relative rounded-sm border border-line bg-panel/70 backdrop-blur-md",
        "border-l-[3px] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
        borderColor,
        className
      )}
    >
      {children}
    </div>
  );
}
