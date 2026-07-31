"use server";
import { createClient } from "@/lib/supabase/server";
import { XP_TABLE } from "@/lib/xp";
import { revalidatePath } from "next/cache";
import { checkAndUnlockAchievements } from "@/lib/achievements";
import {
  computeStrength,
  computeSpeed,
  computeEndurance,
  computePotential,
  computeMuscleScores,
  generalFitnessFloor,
  type MeasurementPoint,
} from "@/lib/attributes";

export async function logWorkout(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

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

const MEASUREMENT_FIELDS = [
  "pushups_max", "pullups_max", "dips_max", "squat_reps_bodyweight",
  "plank_seconds", "continuous_run_min", "run_time_1km", "run_time_3km", "cooper_12min_m",
  "bench_1rm", "squat_1rm", "deadlift_1rm",
] as const;

export async function logMeasurement(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const payload: Record<string, number | null> = {};
  MEASUREMENT_FIELDS.forEach((k) => {
    const v = formData.get(k);
    payload[k] = v && v !== "" ? Number(v) : null;
  });

  await supabase.from("measurements").insert({ profile_id: user.id, ...payload });

  const { data: profile } = await supabase.from("profiles").select("weight_kg").eq("id", user.id).single();
  const { data: interview } = await supabase.from("interview_answers").select("weekly_frequency, trains_since").eq("profile_id", user.id).single();
  const { data: history } = await supabase.from("measurements").select("*").eq("profile_id", user.id);

  const latest: MeasurementPoint = { recorded_at: new Date().toISOString(), ...payload };
  const floor = generalFitnessFloor({
    weekly_frequency: interview?.weekly_frequency,
    trains_since: interview?.trains_since as any,
    pushups_max: payload.pushups_max,
  });

  await supabase.from("attributes").update({
    strength: computeStrength(profile?.weight_kg || 0, latest, payload.pushups_max || 0),
    speed: computeSpeed(latest, null, floor),
    endurance: computeEndurance(latest, null, floor),
    potential: computePotential((history || []) as any),
    muscle_scores: computeMuscleScores(profile?.weight_kg || 0, latest),
    updated_at: new Date().toISOString(),
  }).eq("profile_id", user.id);

  await checkAndUnlockAchievements(supabase, user.id);
  revalidatePath("/dashboard");
}
