"use client";
import { useTransition } from "react";
import { createMission, toggleMissionActive, toggleBanUser, resetRankingXp } from "@/app/actions/admin";

interface Mission { id: string; title: string; type: string; active: boolean; target_stat: string; xp_reward: number; }
interface Profile { id: string; username: string; nickname: string; banned: boolean; role: string; }

export function AdminClient({ missions, users }: { missions: Mission[]; users: Profile[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">CRIAR MISSÃO</div>
        <form
          action={(fd) => startTransition(() => createMission(fd))}
          className="grid grid-cols-2 gap-3 md:grid-cols-3"
        >
          <input name="title" placeholder="Título" required className="input col-span-2 md:col-span-1" />
          <input name="description" placeholder="Descrição (opcional)" className="input" />
          <select name="type" className="input">
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="especial">Especial</option>
          </select>
          <select name="target_stat" className="input">
            <option value="strength">Força</option>
            <option value="speed">Velocidade</option>
            <option value="endurance">Resistência</option>
            <option value="intelligence">Inteligência</option>
            <option value="potential">Potencial</option>
          </select>
          <input name="xp_reward" type="number" placeholder="XP" defaultValue={20} className="input" />
          <input name="attribute_bonus" type="number" placeholder="Pts atributo" defaultValue={10} className="input" />
          <button className="border border-teal bg-teal/10 px-3 py-2 text-sm font-bold text-teal hover:bg-teal hover:text-void">
            CRIAR
          </button>
        </form>
      </div>

      <div>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">MISSÕES ATIVAS</div>
        <div className="border border-line">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-line p-3 last:border-none">
              <span className="text-sm">{m.title} <span className="text-xs text-slate">({m.type})</span></span>
              <button
                onClick={() => startTransition(() => toggleMissionActive(m.id, m.active))}
                className={`border px-3 py-1 text-xs font-bold ${m.active ? "border-teal text-teal" : "border-line text-slate"}`}
              >
                {m.active ? "ATIVA" : "INATIVA"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">USUÁRIOS</div>
        <div className="border border-line">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-line p-3 last:border-none">
              <span className="text-sm">{u.nickname} <span className="text-xs text-slate">@{u.username} · {u.role}</span></span>
              <button
                onClick={() => startTransition(() => toggleBanUser(u.id, u.banned))}
                className={`border px-3 py-1 text-xs font-bold ${u.banned ? "border-danger text-danger" : "border-line text-slate"}`}
              >
                {u.banned ? "BANIDO" : "ATIVO"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { if (confirm("Zerar o XP de todos os usuários?")) startTransition(() => resetRankingXp()); }}
        className="self-start border border-danger px-4 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-void"
      >
        RESETAR RANKING (XP)
      </button>
    </div>
  );
}
