"use client";
import { useTransition } from "react";
import { MissionCard } from "./MissionCard";
import { completeMission, undoMission } from "@/app/actions/missions";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  target_stat: string;
  xp_reward: number;
  attribute_bonus: number;
}

export function MissionsClient({
  missions,
  doneIds,
  periodKeyByMission,
}: {
  missions: Mission[];
  doneIds: Set<string>;
  periodKeyByMission: Record<string, string>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {missions.map((m) => {
        const done = doneIds.has(m.id);
        return (
          <MissionCard
            key={m.id}
            title={m.title}
            description={m.description}
            targetStat={m.target_stat}
            xpReward={m.xp_reward}
            attributeBonus={m.attribute_bonus}
            done={done}
            onToggle={() =>
              startTransition(() => {
                if (done) undoMission(m.id, periodKeyByMission[m.id]);
                else completeMission(m.id);
              })
            }
          />
        );
      })}
      {missions.length === 0 && <p className="py-6 text-center text-sm text-slate">Nenhuma missão nessa categoria.</p>}
    </div>
  );
}
