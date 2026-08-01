"use client";
import { useState } from "react";
import Link from "next/link";
import { RankBadge } from "./ui/RankBadge";
import { rankForPoints } from "@/lib/ranks";

interface Row {
  profile_id: string;
  username: string;
  nickname: string;
  title: string;
  city: string | null;
  [key: string]: any;
}

export function RankingList({ rows, tab }: { rows: Row[]; tab: string }) {
  const [search, setSearch] = useState("");

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.nickname?.toLowerCase().includes(q) || r.username?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q);
  });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, @usuário ou cidade..."
        className="input mb-4 w-full"
      />
      <div className="border border-line">
        {filtered.map((r, i) => (
          <Link
            key={r.profile_id}
            href={`/perfil/${r.username}`}
            className="flex items-center gap-4 border-b border-line p-3 last:border-none hover:bg-panel/50"
          >
            <span className="w-6 text-center font-display text-sm text-slate">{i + 1}</span>
            <div className="flex-1">
              <div className="font-bold">{r.nickname}</div>
              <div className="text-xs text-slate">@{r.username} {r.city ? `· ${r.city}` : ""} · {r.title}</div>
            </div>
            <RankBadge rank={rankForPoints(r[tab] || 0).name} size="sm" />
            <span className="w-16 text-right text-sm text-slate">{r[tab] ?? 0}</span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-slate">Nenhum jogador encontrado.</p>
        )}
      </div>
    </div>
  );
}
