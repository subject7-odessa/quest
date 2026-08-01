import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatBar } from "@/components/ui/StatBar";
import { XPBar } from "@/components/ui/XPBar";
import { MissionsClient } from "@/components/MissionsClient";
import { MuscleMap } from "@/components/MuscleMap";
import { DashboardTabs } from "@/components/DashboardTabs";
import { LogExerciseForm } from "@/components/LogExerciseForm";
import { ExerciseHistoryList } from "@/components/ExerciseHistoryList";
import { PracticesManager } from "@/components/PracticesManager";
import { computeImc } from "@/lib/attributes";
import { EMPTY_MUSCLE_SCORES, type MuscleScores } from "@/lib/exercises";
import { titleForPhysicalAverage } from "@/lib/ranks";
import { periodKeyFor } from "@/lib/xp";
import { pickDailyMissions } from "@/lib/dailyMissions";
import { logWorkout, logMeasurement } from "@/app/actions/workouts";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function fmtDietQuality(v?: string) {
  return { ruim: "Ruim / desregrada", media: "Mediana", boa: "Boa / estruturada" }[v || ""] || "—";
}
function fmtTrainsSince(v?: string) {
  return { nunca: "Nunca treinou", menos_6_meses: "Menos de 6 meses", "6_meses_mais": "6 meses ou mais" }[v || ""] || "—";
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: attrs } = await supabase.from("attributes").select("*").eq("profile_id", user.id).single();
  if (!attrs) redirect("/onboarding");

  const { data: interview } = await supabase.from("interview_answers").select("*").eq("profile_id", user.id).maybeSingle();
  const { data: missions } = await supabase.from("missions").select("*").eq("active", true);
  const { data: userMissions } = await supabase.from("user_missions").select("*").eq("profile_id", user.id);
  const { data: workouts } = await supabase.from("workouts").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(30);
  const { data: measurements } = await supabase.from("measurements").select("*").eq("profile_id", user.id).order("recorded_at", { ascending: false }).limit(30);
  const { data: exerciseLogs } = await supabase.from("exercise_logs").select("*").eq("profile_id", user.id).order("recorded_at", { ascending: false }).limit(50);
  const { data: xpLog } = await supabase.from("xp_log").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }).limit(30);
  const { data: allAchievements } = await supabase.from("achievements").select("*");
  const { data: myAchievements } = await supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("profile_id", user.id);
  const { data: quizResult } = await supabase.from("quiz_results").select("*").eq("profile_id", user.id).maybeSingle();
  const { data: practices } = await supabase.from("practices").select("*").eq("profile_id", user.id).order("created_at", { ascending: false });
  const unlockedMap = new Map((myAchievements || []).map((a) => [a.achievement_id, a.unlocked_at]));

  const now = new Date();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const workoutDoneToday = (workouts || []).some((w) => new Date(w.created_at) >= todayStart);

  const allDaily = (missions || []).filter((m) => m.type === "diaria");
  const todaysDaily = pickDailyMissions(user.id, todayStart.toISOString().slice(0, 10), allDaily, 5);
  const todaysDailyIds = new Set(todaysDaily.map((m) => m.id));
  const nonDailyMissions = (missions || []).filter((m) => m.type !== "diaria");
  const visibleMissions = [...todaysDaily, ...nonDailyMissions];

  const doneIds = new Set(
    (userMissions || [])
      .filter((um) => um.period_key === periodKeyFor((missions || []).find((m) => m.id === um.mission_id)?.type || "diaria", now))
      .map((um) => um.mission_id)
  );
  const periodKeyByMission: Record<string, string> = {};
  (missions || []).forEach((m) => { periodKeyByMission[m.id] = periodKeyFor(m.type, now); });

  const imc = computeImc(profile?.height_cm, profile?.weight_kg);
  const muscleScores: MuscleScores = attrs.muscle_scores && Object.keys(attrs.muscle_scores).length > 0 ? attrs.muscle_scores : EMPTY_MUSCLE_SCORES;
  const physicalAvg = Math.round((attrs.strength + attrs.speed + attrs.endurance) / 3);
  const title = titleForPhysicalAverage(physicalAvg);
  const groups = ["diaria", "semanal", "mensal", "especial"] as const;

  const fichaTab = (
    <>
      <GlassCard className="mb-6" accent="teal">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-xs tracking-[3px] text-cyan">FICHA DE STATUS</div>
          <div className="font-display text-sm font-bold text-gold">{title}</div>
        </div>
        {imc && (
          <div className="mb-3 flex justify-between text-sm text-slate">
            <span>Altura: {profile?.height_cm} cm · Peso: {profile?.weight_kg} kg</span>
            <span>IMC: <strong className="text-white">{imc.value}</strong> — {imc.classif}</span>
          </div>
        )}
        <StatBar label="Força" statKey="strength" points={attrs.strength} sourceNote="média dos 9 grupos musculares" />
        <StatBar label="Velocidade" statKey="speed" points={attrs.speed} sourceNote="baseado em teste real" />
        <StatBar label="Resistência" statKey="endurance" points={attrs.endurance} sourceNote="baseado em teste real" />
        <StatBar label="Potencial" statKey="potential" points={attrs.potential} sourceNote="evolução recente" />
        <StatBar label="Inteligência" statKey="intelligence" points={attrs.intelligence} sourceNote={quizResult ? `teste: ${quizResult.correct_count}/10` : "faça o teste de inteligência →"} />
      </GlassCard>
      <GlassCard accent="violet">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">MAPA MUSCULAR</div>
        <MuscleMap scores={muscleScores} />
      </GlassCard>
    </>
  );

  const testesTab = (
    <>
      <GlassCard className="mb-6" accent="violet">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">REGISTRAR EXERCÍCIO (define Força e o mapa muscular)</div>
        <p className="mb-4 text-xs text-slate">
          Cada exercício rankeia só os músculos que ele realmente trabalha — supino rankeia peito/tríceps/ombro,
          francesa rankeia só tríceps. O sistema sempre usa seu melhor resultado já registrado por grupo.
        </p>
        <LogExerciseForm />
      </GlassCard>

      <GlassCard className="mb-6" accent="gold">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">TESTE DE VELOCIDADE / RESISTÊNCIA</div>
        <form action={logMeasurement} className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <input name="run_time_1km" type="number" step="0.1" min={2} max={30} placeholder="Tempo 1km (min)" className="input" />
          <input name="continuous_run_min" type="number" step="0.5" min={0} max={180} placeholder="Corrida contínua (min)" className="input" />
          <input name="cooper_12min_m" type="number" min={0} max={4000} placeholder="Cooper 12min (m)" className="input" />
          <input name="plank_seconds" type="number" min={0} max={1800} placeholder="Prancha (segundos)" className="input" />
          <input name="run_time_3km" type="number" step="0.1" min={6} max={90} placeholder="Tempo 3km (min)" className="input" />
          <button className="border border-teal bg-teal/10 px-3 py-2 text-sm font-bold text-teal hover:bg-teal hover:text-void">ATUALIZAR</button>
        </form>
      </GlassCard>

      <GlassCard className="mb-6">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">HISTÓRICO DE EXERCÍCIOS</div>
        <ExerciseHistoryList logs={exerciseLogs || []} />
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">TESTE DE INTELIGÊNCIA</div>
        <p className="mb-3 text-sm text-slate">
          {quizResult ? `Seu último resultado: ${quizResult.correct_count}/10 acertos.` : "Você ainda não fez o teste real de inteligência."}
        </p>
        <Link href="/quiz" className="inline-block border border-cyan bg-cyan/10 px-4 py-2 text-sm font-bold text-cyan hover:bg-cyan hover:text-void">
          {quizResult ? "REFAZER TESTE" : "FAZER TESTE AGORA"}
        </Link>
      </GlassCard>
    </>
  );

  const missoesTab = (
    <>
      <p className="mb-4 text-xs text-slate">
        As missões diárias são sorteadas — um conjunto diferente pra você, todo dia, entre as {allDaily.length} disponíveis no sistema.
      </p>
      {groups.map((g) => {
        const list = g === "diaria" ? todaysDaily : (missions || []).filter((m) => m.type === g);
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

      <GlassCard className="mb-6">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">HISTÓRICO DE TESTES DE RESISTÊNCIA</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead><tr className="text-slate"><th className="pb-2 pr-3">Data</th><th className="pb-2 pr-3">1km</th><th className="pb-2 pr-3">3km</th><th className="pb-2 pr-3">Cooper</th><th className="pb-2">Prancha</th></tr></thead>
            <tbody>
              {(measurements || []).map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="py-2 pr-3 text-slate">{fmtDate(m.recorded_at)}</td>
                  <td className="py-2 pr-3">{m.run_time_1km ?? "—"}</td>
                  <td className="py-2 pr-3">{m.run_time_3km ?? "—"}</td>
                  <td className="py-2 pr-3">{m.cooper_12min_m ?? "—"}</td>
                  <td className="py-2">{m.plank_seconds ?? "—"}</td>
                </tr>
              ))}
              {(!measurements || measurements.length === 0) && <tr><td colSpan={5} className="py-6 text-center text-slate">Nenhum teste registrado ainda.</td></tr>}
            </tbody>
          </table>
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

  const perfilTab = (
    <>
      <GlassCard className="mb-6" accent="teal">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">SOBRE VOCÊ</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
          <div><span className="text-slate">Idade:</span> {profile?.age ?? "—"}</div>
          <div><span className="text-slate">Sexo:</span> {profile?.sex ?? "—"}</div>
          <div><span className="text-slate">Treina há:</span> {fmtTrainsSince(interview?.trains_since)}</div>
          <div><span className="text-slate">Freq. semanal:</span> {interview?.weekly_frequency ?? "—"}x</div>
          <div><span className="text-slate">Sono:</span> {interview?.sleep_hours ?? "—"}h</div>
          <div><span className="text-slate">Alimentação:</span> {fmtDietQuality(interview?.diet_quality)}</div>
          <div className="col-span-2 md:col-span-3"><span className="text-slate">Objetivo:</span> {interview?.goal || "—"}</div>
          {interview?.injuries && <div className="col-span-2 md:col-span-3"><span className="text-slate">Lesões/observações:</span> {interview.injuries}</div>}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">ESPORTES & ARTES MARCIAIS</div>
        <PracticesManager practices={practices || []} />
      </GlassCard>
    </>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-black text-cyan">{profile?.nickname}</div>
          <div className="text-xs text-slate">@{profile?.username} · {title}</div>
        </div>
        {workoutDoneToday ? (
          <div className="border border-line px-4 py-2 text-xs text-slate">treino já registrado hoje ✓</div>
        ) : (
          <form action={logWorkout}>
            <input type="hidden" name="type" value="Treino registrado pelo dashboard" />
            <label className="mr-3 text-xs text-slate"><input type="checkbox" name="personal_record" className="mr-1" /> foi recorde pessoal</label>
            <button className="border border-gold bg-gold/10 px-4 py-2 text-sm font-bold text-gold hover:bg-gold hover:text-void">+ REGISTRAR TREINO</button>
          </form>
        )}
      </div>

      <div className="mb-6"><XPBar totalXp={profile?.total_xp || 0} /></div>

      <DashboardTabs
        tabs={[
          { key: "ficha", label: "FICHA", content: fichaTab },
          { key: "testes", label: "TESTES", content: testesTab },
          { key: "missoes", label: "MISSÕES", content: missoesTab },
          { key: "historico", label: "HISTÓRICO", content: historicoTab },
          { key: "conquistas", label: "CONQUISTAS", content: conquistasTab },
          { key: "perfil", label: "PERFIL & ESPORTES", content: perfilTab },
        ]}
      />
    </main>
  );
}
