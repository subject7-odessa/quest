// Tabela de XP de referência (usada nas server actions ao registrar
// treinos e concluir missões). Mantida num único lugar pra ficar
// fácil de rebalancear o jogo inteiro no futuro.
export const XP_TABLE = {
  treino_completo: 100,
  dormiu_8h: 15,
  alimentacao_boa: 20,
  recorde_pessoal: 80,
  combo_7_dias: 150,
} as const;

export function periodKeyFor(type: "diaria" | "semanal" | "mensal" | "especial", date = new Date()): string {
  if (type === "especial") return "unica";
  if (type === "diaria") return date.toISOString().slice(0, 10); // 2026-07-30
  if (type === "mensal") return date.toISOString().slice(0, 7); // 2026-07
  // semanal: ano + número da semana ISO
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
