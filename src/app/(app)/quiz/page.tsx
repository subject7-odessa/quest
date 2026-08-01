import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { QUIZ_QUESTIONS } from "@/lib/quiz";
import { submitIntelligenceQuiz } from "@/app/actions/quiz";

export default async function QuizPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prevResult } = await supabase.from("quiz_results").select("*").eq("profile_id", user.id).maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-black text-cyan">TESTE DE INTELIGÊNCIA</h1>
      <p className="mb-6 text-sm text-slate">
        10 perguntas de raciocínio lógico. Isso define de verdade sua Inteligência — nada é
        autodeclarado. Pode refazer quando quiser; o resultado mais recente substitui o anterior.
      </p>

      {prevResult && (
        <GlassCard className="mb-6" accent="gold">
          <div className="text-sm">
            Último resultado: <strong className="text-gold">{prevResult.correct_count}/10 acertos</strong> — {prevResult.score_points} pontos base de Inteligência.
          </div>
        </GlassCard>
      )}

      <form action={submitIntelligenceQuiz} className="flex flex-col gap-4">
        {QUIZ_QUESTIONS.map((q, i) => (
          <GlassCard key={q.id} accent="teal">
            <div className="mb-3 text-sm font-bold">{i + 1}. {q.text}</div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, idx) => (
                <label key={idx} className="flex cursor-pointer items-center gap-2 border border-line bg-void/60 p-2 text-sm hover:border-cyan">
                  <input type="radio" name={q.id} value={idx} required className="accent-cyan" />
                  {opt}
                </label>
              ))}
            </div>
          </GlassCard>
        ))}
        <button className="border border-cyan bg-cyan/10 p-3 font-bold tracking-wide text-cyan hover:bg-cyan hover:text-void">
          ENVIAR RESPOSTAS
        </button>
      </form>
    </main>
  );
}
