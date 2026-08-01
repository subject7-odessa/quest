"use server";
import { createClient } from "@/lib/supabase/server";
import { XP_TABLE } from "@/lib/xp";
import { revalidatePath } from "next/cache";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import { computeSpeed, computeEndurance, computePotential, generalFitnessFloor, clampField, type MeasurementPoint } from "@/lib/attributes";

// Treino só pode ser registrado 1x por dia — evita farmar XP repetindo
// o botão. Retorna { blocked: true } se já foi feito hoje (o form no
// dashboard também já esconde o botão nesse caso, isso é a trava real).
export async function logWorkout(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: todaysWorkouts } = await supabase
    .from("workouts").select("id").eq("profile_id", user.id).gte("created_at", todayStart.toISOString());
  if (todaysWorkouts && todaysWorkouts.length > 0) return; // já registrou hoje

  const type = String(formData.get("type") || "Treino geral");
  const isRecord = formData.get("personal_record") === "on";

  await supabase.from("workouts").insert({ profile_id: user.id, type, personal_record: isRecord });

  await supabase.rpc("grant_xp", {
    p_profile_id: user.id,
    p_amount: XP_TABLE.treino_completo + (isRecord ? XP_TABLE.recorde_pessoal : 0),
    p_reason: isRecord ? "Treino completo + recorde pessoal" : "Treino completo",
  });

  await checkAndUnlockAchievements(supabase, user.id);
  revalidatePath("/dashboard");
}

const MEASUREMENT_FIELDS = ["run_time_1km", "run_time_3km", "cooper_12min_m", "plank_seconds", "continuous_run_min"] as const;

export async function logMeasurement(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const payload: Record<string, number | null> = {};
  MEASUREMENT_FIELDS.forEach((k) => {
    const v = formData.get(k);
    payload[k] = v && v !== "" ? clampField(k, Number(v)) : null;
  });

  await supabase.from("measurements").insert({ profile_id: user.id, ...payload });

  const { data: interview } = await supabase.from("interview_answers").select("weekly_frequency, trains_since, pushups_max").eq("profile_id", user.id).single();
  const { data: history } = await supabase.from("measurements").select("*").eq("profile_id", user.id);

  const latest: MeasurementPoint = { recorded_at: new Date().toISOString(), ...payload };
  const floor = generalFitnessFloor({
    weekly_frequency: interview?.weekly_frequency,
    trains_since: interview?.trains_since as any,
    pushups_max: interview?.pushups_max,
  });

  await supabase.from("attributes").update({
    speed: computeSpeed(latest, null, floor),
    endurance: computeEndurance(latest, null, floor),
    potential: computePotential((history || []) as any),
    updated_at: new Date().toISOString(),
  }).eq("profile_id", user.id);

  await checkAndUnlockAchievements(supabase, user.id);
  revalidatePath("/dashboard");
}
