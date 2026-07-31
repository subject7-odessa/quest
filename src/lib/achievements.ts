// Verifica e desbloqueia conquistas automaticamente (chamado depois de
// registrar treino ou teste físico). Cada requirement_type sabe calcular
// seu próprio progresso a partir das tabelas existentes.
import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAndUnlockAchievements(supabase: SupabaseClient, profileId: string) {
  const { data: achievements } = await supabase.from("achievements").select("*");
  const { data: unlocked } = await supabase.from("user_achievements").select("achievement_id").eq("profile_id", profileId);
  const unlockedIds = new Set((unlocked || []).map((u) => u.achievement_id));

  const { data: workouts } = await supabase.from("workouts").select("id").eq("profile_id", profileId);
  const { data: measurements } = await supabase.from("measurements").select("pushups_max, pullups_max, bench_1rm").eq("profile_id", profileId);
  const { data: profile } = await supabase.from("profiles").select("weight_kg").eq("id", profileId).single();

  const workoutsCount = workouts?.length || 0;
  const pushupsTotal = (measurements || []).reduce((s, m) => s + (m.pushups_max || 0), 0);
  const pullupsTotal = (measurements || []).reduce((s, m) => s + (m.pullups_max || 0), 0);
  const maxBench = Math.max(0, ...(measurements || []).map((m) => m.bench_1rm || 0));
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
