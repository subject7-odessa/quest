"use server";
import { createClient } from "@/lib/supabase/server";
import { computeInitialAttributes, computeMuscleScores, type InterviewAnswers } from "@/lib/attributes";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  await supabase.from("interview_answers").upsert({
    profile_id: user.id,
    ...answers,
    goal,
    injuries,
  });

  const initial = computeInitialAttributes(answers, { height_cm, weight_kg });
  const muscleScores = computeMuscleScores(weight_kg, {
    recorded_at: new Date().toISOString(),
    pushups_max: answers.pushups_max,
    pullups_max: answers.pullups_max,
  });

  await supabase.from("attributes").upsert({
    profile_id: user.id,
    ...initial,
    muscle_scores: muscleScores,
  });

  await supabase.from("measurements").insert({
    profile_id: user.id,
    pushups_max: answers.pushups_max,
    pullups_max: answers.pullups_max,
    run_time_1km: answers.run_time_1km,
    run_time_3km: answers.run_time_3km,
  });

  redirect("/dashboard");
}
