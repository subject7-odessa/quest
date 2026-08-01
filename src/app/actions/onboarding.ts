"use server";
import { createClient } from "@/lib/supabase/server";
import { generalFitnessFloor, computeSpeed, computeEndurance, type InterviewAnswers } from "@/lib/attributes";
import { computeMuscleScoresFromLogs, computeOverallStrength } from "@/lib/exercises";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // TRAVA: se a pessoa já tem ficha, não deixa fazer de novo (evita
  // sobrescrever progresso e duplicar a entrevista).
  const { data: existing } = await supabase.from("attributes").select("profile_id").eq("profile_id", user.id).maybeSingle();
  if (existing) redirect("/dashboard");

  const age = Number(formData.get("age"));
  const sex = String(formData.get("sex"));
  const height_cm = Number(formData.get("height_cm"));
  const weight_kg = Number(formData.get("weight_kg"));

  const answers: InterviewAnswers = {
    trains_since: formData.get("trains_since") as InterviewAnswers["trains_since"],
    pushups_max: Number(formData.get("pushups_max")) || 0,
    pullups_max: Number(formData.get("pullups_max")) || 0,
    run_time_1km: formData.get("run_time_1km") ? Number(formData.get("run_time_1km")) : null,
    run_time_3km: formData.get("run_time_3km") ? Number(formData.get("run_time_3km")) : null,
    weekly_frequency: Number(formData.get("weekly_frequency")) || 0,
    sleep_hours: Number(formData.get("sleep_hours")) || 7,
    diet_quality: formData.get("diet_quality") as InterviewAnswers["diet_quality"],
    experience_level: formData.get("experience_level") as InterviewAnswers["experience_level"],
  };
  const goal = String(formData.get("goal") || "");
  const injuries = String(formData.get("injuries") || "");

  await supabase.from("profiles").update({ age, sex, height_cm, weight_kg }).eq("id", user.id);

  await supabase.from("interview_answers").upsert({ profile_id: user.id, ...answers, goal, injuries });

  // As flexões/barras que a pessoa já disse que faz viram o PRIMEIRO
  // registro de exercício dela — assim quem já treina começa com Força
  // real desde o dia 1, não do zero.
  const seedLogs: { exercise_key: string; value: number }[] = [];
  if (answers.pushups_max > 0) seedLogs.push({ exercise_key: "flexao", value: answers.pushups_max });
  if (answers.pullups_max > 0) seedLogs.push({ exercise_key: "barra_fixa", value: answers.pullups_max });
  if (seedLogs.length > 0) {
    await supabase.from("exercise_logs").insert(seedLogs.map((l) => ({ profile_id: user.id, ...l })));
  }

  const muscleScores = computeMuscleScoresFromLogs(weight_kg, seedLogs);
  const strength = computeOverallStrength(muscleScores);
  const floor = generalFitnessFloor(answers);

  const fakeMeasurement = { recorded_at: new Date().toISOString(), run_time_1km: answers.run_time_1km, run_time_3km: answers.run_time_3km };

  await supabase.from("attributes").upsert({
    profile_id: user.id,
    strength,
    speed: computeSpeed(fakeMeasurement, answers.run_time_1km, floor),
    endurance: computeEndurance(fakeMeasurement, answers.run_time_3km, floor),
    intelligence: 0, // sobe de verdade só depois do teste de inteligência (/quiz)
    potential: 400,
    muscle_scores: muscleScores,
  });

  if (answers.run_time_1km || answers.run_time_3km) {
    await supabase.from("measurements").insert({
      profile_id: user.id, run_time_1km: answers.run_time_1km, run_time_3km: answers.run_time_3km,
    });
  }

  redirect("/dashboard");
}
