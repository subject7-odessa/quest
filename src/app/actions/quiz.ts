"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Gabarito fica só aqui no servidor — nunca é enviado ao navegador.
const ANSWER_KEY: Record<string, number> = {
  q1: 1, q2: 0, q3: 1, q4: 2, q5: 1, q6: 2, q7: 0, q8: 2, q9: 1, q10: 3,
};

export async function submitIntelligenceQuiz(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let correct = 0;
  const total = Object.keys(ANSWER_KEY).length;
  for (const [qId, correctIdx] of Object.entries(ANSWER_KEY)) {
    const answer = formData.get(qId);
    if (answer !== null && Number(answer) === correctIdx) correct++;
  }

  const scorePoints = Math.round((correct / total) * 1000);

  const { data: prevQuiz } = await supabase.from("quiz_results").select("score_points").eq("profile_id", user.id).single();
  const prevPoints = prevQuiz?.score_points || 0;

  await supabase.from("quiz_results").upsert({
    profile_id: user.id, correct_count: correct, score_points: scorePoints, taken_at: new Date().toISOString(),
  });

  const { data: attrs } = await supabase.from("attributes").select("intelligence").eq("profile_id", user.id).single();
  const currentIntelligence = attrs?.intelligence || 0;
  // troca só a "parte do quiz" do total, preservando o que já veio de missões de estudo
  const newIntelligence = Math.max(0, currentIntelligence - prevPoints + scorePoints);

  await supabase.from("attributes").update({ intelligence: newIntelligence, updated_at: new Date().toISOString() }).eq("profile_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/quiz");
}
