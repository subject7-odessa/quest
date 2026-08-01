import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RankingList } from "@/components/RankingList";

const TABS = [
  { key: "power_total", label: "TOP GERAL" },
  { key: "strength", label: "TOP FORÇA" },
  { key: "speed", label: "TOP VELOCIDADE" },
  { key: "endurance", label: "TOP RESISTÊNCIA" },
  { key: "total_xp", label: "TOP DISCIPLINA (XP)" },
] as const;

export default async function RankingsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = createClient();
  const tab = (searchParams.tab || "power_total") as (typeof TABS)[number]["key"];

  const { data: rows } = await supabase
    .from("leaderboard")
    .select("*")
    .order(tab, { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 font-display text-2xl font-black text-cyan">RANKING DO SISTEMA</h1>
      <p className="mb-6 text-sm text-slate">Todos os jogadores públicos, ordenados por evolução real.</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/rankings?tab=${t.key}`}
            className={`border px-4 py-2 text-xs font-bold tracking-wide ${
              tab === t.key ? "border-cyan bg-cyan/10 text-cyan" : "border-line text-slate hover:border-cyan"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <RankingList rows={rows || []} tab={tab} />
    </main>
  );
}
