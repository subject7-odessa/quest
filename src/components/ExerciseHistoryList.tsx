"use client";
import { useTransition } from "react";
import { exerciseByKey } from "@/lib/exercises";
import { deleteExerciseLog } from "@/app/actions/exercises";

interface Log { id: string; exercise_key: string; value: number; recorded_at: string; }

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function ExerciseHistoryList({ logs }: { logs: Log[] }) {
  const [isPending, startTransition] = useTransition();

  if (logs.length === 0) return <p className="py-6 text-center text-sm text-slate">Nenhum exercício registrado ainda.</p>;

  return (
    <div className="flex flex-col gap-1">
      {logs.map((log) => {
        const def = exerciseByKey(log.exercise_key);
        const unit = def?.unit === "kg" ? "kg" : def?.unit === "seconds" ? "s" : "reps";
        return (
          <div key={log.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-none">
            <span>{def?.label || log.exercise_key} — <strong className="text-cyan">{log.value}{unit}</strong></span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate">{fmtDate(log.recorded_at)}</span>
              <button onClick={() => startTransition(() => deleteExerciseLog(log.id))} className="text-xs text-danger hover:underline">remover</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
