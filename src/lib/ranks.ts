// Escala de ranks do sistema. Sem teto: quem passar de 5000 pontos
// continua sendo "Infinite" para sempre, só o número por baixo sobe.
export type RankName =
  | "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS"
  | "EX" | "Master" | "Legend" | "Myth" | "Transcendent" | "Infinite";

export interface RankBand {
  name: RankName;
  min: number;
}

// Cada banda vale a partir de "min" pontos até a próxima banda começar.
export const RANK_BANDS: RankBand[] = [
  { name: "F", min: 0 },
  { name: "E", min: 100 },
  { name: "D", min: 200 },
  { name: "C", min: 300 },
  { name: "B", min: 400 },
  { name: "A", min: 500 },
  { name: "S", min: 600 },
  { name: "SS", min: 700 },
  { name: "SSS", min: 800 },
  { name: "EX", min: 900 },
  { name: "Master", min: 1000 },
  { name: "Legend", min: 1500 },
  { name: "Myth", min: 2000 },
  { name: "Transcendent", min: 3000 },
  { name: "Infinite", min: 5000 },
];

export function rankForPoints(points: number): RankBand {
  let current = RANK_BANDS[0];
  for (const band of RANK_BANDS) {
    if (points >= band.min) current = band;
    else break;
  }
  return current;
}

// Cor de UI por rank (usada nos badges e barras)
export const RANK_COLORS: Record<RankName, string> = {
  F: "#5c6a7a",
  E: "#8b98ab",
  D: "#b8834a",
  C: "#7fd4c7",
  B: "#2dd4a8",
  A: "#b088e8",
  S: "#4dd8e8",
  SS: "#5ec8ff",
  SSS: "#8f7bff",
  EX: "#ff8fd6",
  Master: "#e0b84f",
  Legend: "#ffcf4a",
  Myth: "#ff6b6b",
  Transcendent: "#ff3d7f",
  Infinite: "#ffffff",
};

// Progresso (0-1) dentro da banda atual, pra animar a barra.
export function progressWithinBand(points: number): number {
  const idx = RANK_BANDS.findIndex((b) => b.name === rankForPoints(points).name);
  const current = RANK_BANDS[idx];
  const next = RANK_BANDS[idx + 1];
  if (!next) return 1; // Infinite: barra sempre cheia
  const span = next.min - current.min;
  return Math.min(1, Math.max(0, (points - current.min) / span));
}

// Nível do jogador (separado dos atributos) a partir do XP total.
// Sem teto: level cresce pra sempre conforme o XP acumula.
export function levelForXp(totalXp: number): number {
  return Math.floor(totalXp / 500) + 1;
}

export function xpForNextLevel(totalXp: number): { current: number; needed: number } {
  const level = levelForXp(totalXp);
  const floor = (level - 1) * 500;
  return { current: totalXp - floor, needed: 500 };
}

// Título exibido no perfil, baseado no nível geral.
export function titleForLevel(level: number): string {
  if (level >= 100) return "Lenda";
  if (level >= 60) return "Elite";
  if (level >= 40) return "Monstro";
  if (level >= 25) return "Atleta";
  if (level >= 10) return "Guerreiro";
  if (level >= 3) return "Iniciante";
  return "Sedentário";
}
