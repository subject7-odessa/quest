import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatBar } from "@/components/ui/StatBar";
import { XPBar } from "@/components/ui/XPBar";
import { MuscleMap } from "@/components/MuscleMap";
import { computeImc } from "@/lib/attributes";
import { EMPTY_MUSCLE_SCORES, type MuscleScores } from "@/lib/exercises";
import { titleForPhysicalAverage } from "@/lib/ranks";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", params.username).single();
  if (!profile) notFound();

  const { data: attrs } = await supabase.from("attributes").select("*").eq("profile_id", profile.id).single();
  const { data: achievements } = await supabase
    .from("user_achievements").select("unlocked_at, achievements(title, description, icon)").eq("profile_id", profile.id);
  const { data: practices } = await supabase.from("practices").select("*").eq("profile_id", profile.id);
  const { data: interview } = await supabase.from("interview_answers").select("goal, trains_since").eq("profile_id", profile.id).maybeSingle();
  const { data: quizResult } = await supabase.from("quiz_results").select("correct_count").eq("profile_id", profile.id).maybeSingle();

  const imc = computeImc(profile.height_cm, profile.weight_kg);
  const muscleScores: MuscleScores = attrs?.muscle_scores && Object.keys(attrs.muscle_scores).length > 0 ? attrs.muscle_scores : EMPTY_MUSCLE_SCORES;
  const physicalAvg = attrs ? Math.round((attrs.strength + attrs.speed + attrs.endurance) / 3) : 0;
  const title = titleForPhysicalAverage(physicalAvg);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <div className="font-display text-2xl font-black text-cyan">{profile.nickname}</div>
        <div className="text-sm text-slate">
          @{profile.username} · <span className="text-gold">{title}</span>
          {profile.city ? ` · ${profile.city}` : ""}
        </div>
        {interview?.goal && <div className="mt-1 text-xs text-slate">Objetivo: {interview.goal}</div>}
      </div>

      <div className="mb-6"><XPBar totalXp={profile.total_xp || 0} /></div>

      {attrs && (
        <GlassCard className="mb-6" accent="teal">
          {imc && (
            <div className="mb-3 flex justify-between text-sm text-slate">
              <span>Altura: {profile.height_cm} cm · Peso: {profile.weight_kg} kg</span>
              <span>IMC: <strong className="text-white">{imc.value}</strong> — {imc.classif}</span>
            </div>
          )}
          <StatBar label="Força" statKey="strength" points={attrs.strength} />
          <StatBar label="Velocidade" statKey="speed" points={attrs.speed} />
          <StatBar label="Resistência" statKey="endurance" points={attrs.endurance} />
          <StatBar label="Potencial" statKey="potential" points={attrs.potential} />
          <StatBar label="Inteligência" statKey="intelligence" points={attrs.intelligence} sourceNote={quizResult ? `teste: ${quizResult.correct_count}/10` : undefined} />
        </GlassCard>
      )}

      <GlassCard className="mb-6" accent="violet">
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">MAPA MUSCULAR</div>
        <MuscleMap scores={muscleScores} />
      </GlassCard>

      {practices && practices.length > 0 && (
        <GlassCard className="mb-6" accent="gold">
          <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">ESPORTES & ARTES MARCIAIS</div>
          <div className="flex flex-wrap gap-2">
            {practices.map((p) => (
              <span key={p.id} className="border border-gold/50 bg-gold/5 px-3 py-1 text-xs text-gold">
                {p.name}{p.level ? ` · ${p.level}` : ""}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-3 font-display text-xs tracking-[3px] text-cyan">CONQUISTAS</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(achievements || []).map((a: any, i: number) => (
            <div key={i} className="border border-line bg-void/60 p-3 text-center">
              <div className="mb-1 text-2xl">{a.achievements?.icon}</div>
              <div className="text-xs font-bold">{a.achievements?.title}</div>
            </div>
          ))}
          {(!achievements || achievements.length === 0) && (
            <p className="col-span-full text-center text-sm text-slate">Nenhuma conquista desbloqueada ainda.</p>
          )}
        </div>
      </GlassCard>
    </main>
  );
}
