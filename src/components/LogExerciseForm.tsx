"use client";
import { useState } from "react";
import { EXERCISE_LIBRARY, MUSCLE_LABELS, exerciseByKey } from "@/lib/exercises";
import { logExercise } from "@/app/actions/exercises";

const UNIT_LABEL = { kg: "Carga (kg)", reps: "Repetições máximas", seconds: "Tempo (segundos)" };

export function LogExerciseForm() {
  const [selected, setSelected] = useState(EXERCISE_LIBRARY[0].key);
  const def = exerciseByKey(selected)!;

  return (
    <form action={logExercise} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select name="exercise_key" value={selected} onChange={(e) => setSelected(e.target.value)} className="input sm:col-span-2">
          <optgroup label="Calistenia">
            {EXERCISE_LIBRARY.filter((e) => e.category === "calistenia").map((e) => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </optgroup>
          <optgroup label="Academia">
            {EXERCISE_LIBRARY.filter((e) => e.category === "academia").map((e) => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </optgroup>
        </select>
        <input name="value" type="number" step="0.1" min={0} max={def.cap} placeholder={UNIT_LABEL[def.unit]} required className="input" />
      </div>
      <div className="text-xs text-slate">
        Treina: {Object.entries(def.weights).map(([g, w]) => `${MUSCLE_LABELS[g as keyof typeof MUSCLE_LABELS]}${w! >= 1 ? "" : " (secundário)"}`).join(" · ")} · máximo aceito: {def.cap} {def.unit === "kg" ? "kg" : def.unit === "seconds" ? "s" : "reps"}
      </div>
      <button className="self-start border border-teal bg-teal/10 px-4 py-2 text-sm font-bold text-teal hover:bg-teal hover:text-void">
        REGISTRAR EXERCÍCIO
      </button>
    </form>
  );
}
