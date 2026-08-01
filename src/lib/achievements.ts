// Verifica e desbloqueia conquistas automaticamente (chamado depois de
// registrar treino ou teste físico). Cada requirement_type sabe calcular
// seu próprio progresso a partir das tabelas existentes.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAndUnlockAchievements(supabase: SupabaseClient, profileId: string) {
  const { data: achievements } = await supabase.from("achievements").select("*");
  const { data: unlocked } = await supabase.from("user_achievements").select("achievement_id").eq("profile_id", profileId);
  const unlockedIds = new Set((unlocked || []).map((u) => u.achievement_id));

  const { data: workouts } = await supabase.from("workouts").select("id").eq("profile_id", profileId);
  const { data: exerciseLogs } = await supabase.from("exercise_logs").select("exercise_key, value").eq("profile_id", profileId);
  const { data: profile } = await supabase.from("profiles").select("weight_kg").eq("id", profileId).single();

  const workoutsCount = workouts?.length || 0;
  const pushupsTotal = (exerciseLogs || []).filter((l) => l.exercise_key === "flexao").reduce((s, l) => s + l.value, 0);
  const pullupsTotal = (exerciseLogs || []).filter((l) => l.exercise_key === "barra_fixa").reduce((s, l) => s + l.value, 0);
  const maxBench = Math.max(0, ...(exerciseLogs || []).filter((l) => l.exercise_key === "supino_reto").map((l) => l.value));
  const benchBodyweightOk = profile?.weight_kg ? maxBench >= profile.weight_kg : false;

  const progress: Record<string, number> = {
    workouts_count: workoutsCount,
    pushups_total: pushupsTotal,
    pullups_total: pullupsTotal,
    bench_bodyweight: benchBodyweightOk ? 1 : 0,
  };

  for (const a of achievements || []) {
    if (unlockedIds.has(a.id)) continue;
    const current = progress[a.requirement_type];
    if (current === undefined) continue; // tipo ainda não suportado (ex: km_run_total)
    if (current >= a.requirement_value) {
      await supabase.from("user_achievements").insert({ profile_id: profileId, achievement_id: a.id });
    }
  }
}
