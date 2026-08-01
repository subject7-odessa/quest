"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { exerciseByKey, computeMuscleScoresFromLogs, computeOverallStrength } from "@/lib/exercises";
import { checkAndUnlockAchievements } from "@/lib/achievements";

export async function logExercise(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const exerciseKey = String(formData.get("exercise_key"));
  const def = exerciseByKey(exerciseKey);
  if (!def) return;

  let value = Number(formData.get("value")) || 0;
  value = Math.max(0, Math.min(value, def.cap)); // trava o valor absurdo no servidor, não só no front

  await supabase.from("exercise_logs").insert({ profile_id: user.id, exercise_key: exerciseKey, value });

  const { data: profile } = await supabase.from("profiles").select("weight_kg").eq("id", user.id).single();
  const { data: logs } = await supabase.from("exercise_logs").select("exercise_key, value").eq("profile_id", user.id);

  const muscleScores = computeMuscleScoresFromLogs(profile?.weight_kg || 0, logs || []);
  const strength = computeOverallStrength(muscleScores);

  await supabase.from("attributes").update({
    strength,
    muscle_scores: muscleScores,
    updated_at: new Date().toISOString(),
  }).eq("profile_id", user.id);

  await checkAndUnlockAchievements(supabase, user.id);
  revalidatePath("/dashboard");
}

export async function deleteExerciseLog(logId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("exercise_logs").delete().match({ id: logId, profile_id: user.id });

  const { data: profile } = await supabase.from("profiles").select("weight_kg").eq("id", user.id).single();
  const { data: logs } = await supabase.from("exercise_logs").select("exercise_key, value").eq("profile_id", user.id);
  const muscleScores = computeMuscleScoresFromLogs(profile?.weight_kg || 0, logs || []);
  const strength = computeOverallStrength(muscleScores);

  await supabase.from("attributes").update({ strength, muscle_scores: muscleScores, updated_at: new Date().toISOString() }).eq("profile_id", user.id);
  revalidatePath("/dashboard");
}
