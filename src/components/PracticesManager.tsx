"use client";
import { useTransition } from "react";
import { addPractice, removePractice } from "@/app/actions/practices";

interface Practice { id: string; name: string; kind: string; level: string | null; years: number | null; }

export function PracticesManager({ practices }: { practices: Practice[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {practices.map((p) => (
          <div key={p.id} className="flex items-center justify-between border border-line bg-void/60 p-3 text-sm">
            <span>
              <strong>{p.name}</strong>
              <span className="ml-2 text-xs text-slate">{p.kind === "arte_marcial" ? "Arte marcial" : "Esporte"}{p.level ? ` · ${p.level}` : ""}{p.years ? ` · ${p.years} anos` : ""}</span>
            </span>
            <button onClick={() => startTransition(() => removePractice(p.id))} className="text-xs text-danger hover:underline">remover</button>
          </div>
        ))}
        {practices.length === 0 && <p className="py-2 text-center text-sm text-slate">Nenhum esporte ou arte marcial cadastrado.</p>}
      </div>

      <form action={addPractice} className="grid grid-cols-2 gap-3 border-t border-line pt-4 md:grid-cols-4">
        <input name="name" placeholder="Nome (ex: Jiu-Jitsu)" required className="input col-span-2 md:col-span-1" />
        <select name="kind" className="input">
          <option value="esporte">Esporte</option>
          <option value="arte_marcial">Arte marcial</option>
        </select>
        <input name="level" placeholder="Nível (ex: faixa roxa)" className="input" />
        <input name="years" type="number" step="0.5" placeholder="Anos de prática" className="input" />
        <button className="col-span-2 border border-teal bg-teal/10 px-3 py-2 text-sm font-bold text-teal hover:bg-teal hover:text-void md:col-span-4">
          + ADICIONAR
        </button>
      </form>
    </div>
  );
}
