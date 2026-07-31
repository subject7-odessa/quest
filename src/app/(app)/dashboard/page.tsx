import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatBar } from "@/components/ui/StatBar";
import { XPBar } from "@/components/ui/XPBar";
import { MissionsClient } from "@/components/MissionsClient";
import { MuscleMap } from "@/components/MuscleMap";
import { DashboardTabs } from "@/components/DashboardTabs";
import { computeImc, type MuscleScores } from "@/lib/attributes";
import { periodKeyFor } from "@/lib/xp";
import { logWorkout, logMeasurement } from "@/app/actions/workouts";

const EMPTY_MUSCLES: MuscleScores = { peito: 0, costas: 0, ombros: 0, bracos: 0, abdomen: 0, pernas: 0, posterior: 0, panturrilhas: 0 };

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: attrs } = await supabase.from("attributes").select("*").eq("profile_id", user.id).single();
  if (!attrs) redirect("/onboarding");

  const { data: missions } = await supabase.from("missions").select("*").eq("active", true);
  const { data: userMissions } = await supabase.from("user_missions").select("*").eq("profile_id", user.id);
  const { data: workouts } = await supabase.from("workouts").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(30);
  const { data: measurements } = await supabase.from("measurements").select("*").eq("profile_id", user.id).order("recorded_at", { ascending: false }).limit(30);
  const { data: xpLog } = await supabase.from("xp_log").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(30);
  const { data: allAchievements } = await supabase.from("achievements").select("*");
  const { data: myAchievements } = await supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("profile_id", user.id);
  const unlockedMap = new Map((myAchievements || []).map((a) => [a.achievement_id, a.unlocked_at]));

  const now = new Date();
  const doneIds = new Set(
    (userMissions || [])
      .filter((um) => um.period_key === periodKeyFor((missions || []).find((m) => m.id === um.mission_id)?.type || "diaria", now))
      .map((um) => um.mission_id)
  );
  const periodKeyByMission: Record<string, string> = {};
  (missions || []).forEach((m) => { periodKeyByMission[m.id] = periodKeyFor(m.type, now); });

  const imc = computeImc(profile?.height_cm, profile?.weight_kg);
  const muscleScores: MuscleScores = attrs.muscle_scores && Object.keys(attrs.muscle_scores).length > 0 ? attrs.muscle_scores : EMPTY_MUSCLES;
  const groups = ["diaria", "semanal", "mensal", "especial"] as const;

  const fichaTab = (
    <>
      <GlassCard className="mb-6" accent="teal">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">FICHA DE STATUS</div>
        {imc && (
          <div className="mb-3 flex justify-between text-sm text-slate">
            <span>Altura: {profile?.height_cm} cm · Peso: {profile?.weight_kg} kg</span>
            <span>IMC: <strong className="text-white">{imc.value}</strong> — {imc.classif}</span>
          </div>
        )}
        <StatBar label="Força" statKey="strength" points={attrs.strength} sourceNote="melhor entre calistenia e academia" />
        <StatBar label="Velocidade" statKey="speed" points={attrs.speed} sourceNote="baseado em teste real" />
        <StatBar label="Resistência" statKey="endurance" points={attrs.endurance} sourceNote="baseado em teste real" />
        <StatBar label="Potencial" statKey="potential" points={attrs.potential} sourceNote="evolução recente" />
        <StatBar label="Inteligência" statKey="intelligence" points={attrs.intelligence} sourceNote="entrevista + estudo" />
      </GlassCard>
      <GlassCard accent="violet">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">MAPA MUSCULAR</div>
        <MuscleMap scores={muscleScores} />
      </GlassCard>
    </>
  );

  const testesTab = (
    <>
      <GlassCard className="mb-6" accent="gold">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">REGISTRAR NOVO TESTE FÍSICO</div>
        <p className="mb-4 text-xs text-slate">
          Preencha os testes que fizer — de calistenia, de academia, ou os dois. O sistema sempre usa
          o seu melhor resultado. Isso recalcula Força, Velocidade, Resistência, Potencial e o mapa muscular.
        </p>
        <form action={logMeasurement} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-[11px] tracking-wide text-teal">CALISTENIA</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <input name="pushups_max" type="number" placeholder="Flexões máx." className="input" />
              <input name="pullups_max" type="number" placeholder="Barras máx." className="input" />
              <input name="dips_max" type="number" placeholder="Paralelas máx." className="input" />
              <input name="squat_reps_bodyweight" type="number" placeholder="Agachamento livre (reps)" className="input" />
              <input name="plank_seconds" type="number" placeholder="Prancha (segundos)" className="input" />
              <input name="continuous_run_min" type="number" step="0.5" placeholder="Corrida contínua (min)" className="input" />
              <input name="run_time_1km" type="number" step="0.1" placeholder="Tempo 1km" className="input" />
              <input name="cooper_12min_m" type="number" placeholder="Cooper 12min (m)" className="input" />
            </div>
          </div>
          <div>
            <div className="mb-2 text-[11px] tracking-wide text-gold">ACADEMIA / PESO LIVRE</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <input name="bench_1rm" type="number" placeholder="Supino 1RM (kg)" className="input" />
              <input name="squat_1rm" type="number" placeholder="Agachamento 1RM (kg)" className="input" />
              <input name="deadlift_1rm" type="number" placeholder="Terra 1RM (kg)" className="input" />
            </div>
          </div>
          <button className="self-start border border-teal bg-teal/10 px-4 py-2 text-sm font-bold text-teal hover:bg-teal hover:text-void">
            ATUALIZAR TESTES
          </button>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">HISTÓRICO DE TESTES</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead>
              <tr className="text-slate">
                <th className="pb-2 pr-3">Data</th>
                <th className="pb-2 pr-3">Flexões</th>
                <th className="pb-2 pr-3">Barras</th>
                <th className="pb-2 pr-3">Prancha (s)</th>
                <th className="pb-2 pr-3">1km (min)</th>
                <th className="pb-2 pr-3">Supino</th>
                <th className="pb-2 pr-3">Agach.</th>
                <th className="pb-2">Terra</th>
              </tr>
            </thead>
            <tbody>
              {(measurements || []).map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="py-2 pr-3 text-slate">{fmtDate(m.recorded_at)}</td>
                  <td className="py-2 pr-3">{m.pushups_max ?? "—"}</td>
                  <td className="py-2 pr-3">{m.pullups_max ?? "—"}</td>
                  <td className="py-2 pr-3">{m.plank_seconds ?? "—"}</td>
                  <td className="py-2 pr-3">{m.run_time_1km ?? "—"}</td>
                  <td className="py-2 pr-3">{m.bench_1rm ?? "—"}</td>
                  <td className="py-2 pr-3">{m.squat_1rm ?? "—"}</td>
                  <td className="py-2">{m.deadlift_1rm ?? "—"}</td>
                </tr>
              ))}
              {(!measurements || measurements.length === 0) && (
                <tr><td colSpan={8} className="py-6 text-center text-slate">Nenhum teste registrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );

  const missoesTab = (
    <>
      {groups.map((g) => {
        const list = (missions || []).filter((m) => m.type === g);
        if (list.length === 0) return null;
        return (
          <GlassCard key={g} className="mb-4">
            <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">MISSÕES {g.toUpperCase()}</div>
            <MissionsClient missions={list} doneIds={doneIds} periodKeyByMission={periodKeyByMission} />
          </GlassCard>
        );
      })}
    </>
  );

  const historicoTab = (
    <>
      <GlassCard className="mb-6" accent="gold">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">TREINOS REGISTRADOS</div>
        <div className="flex flex-col gap-2">
          {(workouts || []).map((w) => (
            <div key={w.id} className="flex items-center justify-between border border-line bg-void/60 p-3 text-sm">
              <span>{w.type}{w.personal_record && <span className="ml-2 text-gold">★ recorde pessoal</span>}</span>
              <span className="text-xs text-slate">{fmtDate(w.created_at)}</span>
            </div>
          ))}
          {(!workouts || workouts.length === 0) && <p className="py-6 text-center text-sm text-slate">Nenhum treino registrado ainda.</p>}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">EXTRATO DE XP</div>
        <div className="flex flex-col gap-1">
          {(xpLog || []).map((x) => (
            <div key={x.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-none">
              <span className="text-slate">{x.reason}</span>
              <span className={x.amount >= 0 ? "text-teal" : "text-danger"}>{x.amount >= 0 ? "+" : ""}{x.amount} XP</span>
            </div>
          ))}
          {(!xpLog || xpLog.length === 0) && <p className="py-6 text-center text-sm text-slate">Nenhum XP registrado ainda.</p>}
        </div>
      </GlassCard>
    </>
  );

  const conquistasTab = (
    <GlassCard>
      <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">CONQUISTAS ({(myAchievements || []).length}/{(allAchievements || []).length})</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {(allAchievements || []).map((a) => {
          const unlocked = unlockedMap.has(a.id);
          return (
            <div key={a.id} className={`border p-3 text-center ${unlocked ? "border-gold bg-gold/5" : "border-line opacity-40"}`}>
              <div className="mb-1 text-2xl">{a.icon}</div>
              <div className="text-xs font-bold">{a.title}</div>
              <div className="mt-1 text-[10px] text-slate">{a.description}</div>
              {unlocked && <div className="mt-1 text-[10px] text-gold">desbloqueada</div>}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-black text-cyan">{profile?.nickname}</div>
          <div className="text-xs text-slate">@{profile?.username} · {profile?.class}</div>
        </div>
        <form action={logWorkout}>
          <input type="hidden" name="type" value="Treino registrado pelo dashboard" />
          <label className="mr-3 text-xs text-slate">
            <input type="checkbox" name="personal_record" className="mr-1" /> foi recorde pessoal
          </label>
          <button className="border border-gold bg-gold/10 px-4 py-2 text-sm font-bold text-gold hover:bg-gold hover:text-void">
            + REGISTRAR TREINO
          </button>
        </form>
      </div>

      <div className="mb-6"><XPBar totalXp={profile?.total_xp || 0} /></div>

      <DashboardTabs
        tabs={[
          { key: "ficha", label: "FICHA", content: fichaTab },
          { key: "testes", label: "TESTES", content: testesTab },
          { key: "missoes", label: "MISSÕES", content: missoesTab },
          { key: "historico", label: "HISTÓRICO", content: historicoTab },
          { key: "conquistas", label: "CONQUISTAS", content: conquistasTab },
        ]}
      />
    </main>
  );
}
