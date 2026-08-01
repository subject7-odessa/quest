// Biblioteca de exercícios: cada um sabe quais músculos treina e o quanto
// (peso 1.0 = músculo principal, 0.3-0.6 = músculo secundário). Isso é o
// que permite que "300kg no supino" rankeie peito/tríceps/ombro, e
// "rosca francesa" rankeie só tríceps — igual pedido.

export type MuscleGroup = "peito" | "costas" | "ombros" | "biceps" | "triceps" | "abdomen" | "pernas" | "posterior" | "panturrilhas";

export type ExerciseUnit = "kg" | "reps" | "seconds";

export interface ExerciseDef {
  key: string;
  label: string;
  category: "calistenia" | "academia";
  unit: ExerciseUnit;
  cap: number; // valor máximo aceito (trava contra "300000kg")
  weights: Partial<Record<MuscleGroup, number>>;
}

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  peito: "Peito", costas: "Costas", ombros: "Ombros", biceps: "Bíceps", triceps: "Tríceps",
  abdomen: "Abdômen", pernas: "Pernas", posterior: "Posterior", panturrilhas: "Panturrilhas",
};

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // ACADEMIA
  { key: "supino_reto", label: "Supino reto (carga)", category: "academia", unit: "kg", cap: 400, weights: { peito: 1.0, triceps: 0.6, ombros: 0.3 } },
  { key: "agachamento_livre", label: "Agachamento livre (carga)", category: "academia", unit: "kg", cap: 400, weights: { pernas: 1.0, posterior: 0.3, panturrilhas: 0.1 } },
  { key: "levantamento_terra", label: "Levantamento terra (carga)", category: "academia", unit: "kg", cap: 400, weights: { posterior: 1.0, costas: 0.6, pernas: 0.4 } },
  { key: "desenvolvimento_militar", label: "Desenvolvimento militar (carga)", category: "academia", unit: "kg", cap: 250, weights: { ombros: 1.0, triceps: 0.3 } },
  { key: "rosca_direta", label: "Rosca direta (carga)", category: "academia", unit: "kg", cap: 150, weights: { biceps: 1.0 } },
  { key: "rosca_francesa", label: "Rosca francesa / tríceps testa (carga)", category: "academia", unit: "kg", cap: 150, weights: { triceps: 1.0 } },
  { key: "remada_curvada", label: "Remada curvada (carga)", category: "academia", unit: "kg", cap: 300, weights: { costas: 1.0, biceps: 0.3 } },
  { key: "elevacao_lateral", label: "Elevação lateral (carga)", category: "academia", unit: "kg", cap: 100, weights: { ombros: 1.0 } },
  { key: "leg_press", label: "Leg press (carga)", category: "academia", unit: "kg", cap: 500, weights: { pernas: 1.0, posterior: 0.2 } },
  { key: "panturrilha_maquina", label: "Panturrilha na máquina (carga)", category: "academia", unit: "kg", cap: 300, weights: { panturrilhas: 1.0 } },
  // CALISTENIA
  { key: "flexao", label: "Flexão de braço (reps máximas)", category: "calistenia", unit: "reps", cap: 150, weights: { peito: 1.0, triceps: 0.6, ombros: 0.3 } },
  { key: "flexao_diamante", label: "Flexão diamante (reps máximas)", category: "calistenia", unit: "reps", cap: 150, weights: { triceps: 1.0, peito: 0.4 } },
  { key: "barra_fixa", label: "Barra fixa / pull-up (reps máximas)", category: "calistenia", unit: "reps", cap: 100, weights: { costas: 1.0, biceps: 0.5 } },
  { key: "paralelas", label: "Paralelas / dips (reps máximas)", category: "calistenia", unit: "reps", cap: 100, weights: { peito: 0.6, triceps: 1.0, ombros: 0.2 } },
  { key: "agachamento_corporal", label: "Agachamento livre corporal (reps máximas)", category: "calistenia", unit: "reps", cap: 150, weights: { pernas: 1.0 } },
  { key: "muscle_up", label: "Muscle up (reps máximas)", category: "calistenia", unit: "reps", cap: 50, weights: { costas: 0.6, peito: 0.5, triceps: 0.6, biceps: 0.4 } },
  { key: "panturrilha_unipodal", label: "Panturrilha unipodal (reps máximas)", category: "calistenia", unit: "reps", cap: 150, weights: { panturrilhas: 1.0 } },
  // TEMPO
  { key: "prancha", label: "Prancha (segundos)", category: "calistenia", unit: "seconds", cap: 1800, weights: { abdomen: 1.0 } },
  { key: "prancha_lateral", label: "Prancha lateral (segundos)", category: "calistenia", unit: "seconds", cap: 1800, weights: { abdomen: 0.7, ombros: 0.2 } },
];

export function exerciseByKey(key: string) {
  return EXERCISE_LIBRARY.find((e) => e.key === key);
}

const K_KG = 180;
const K_REPS = 6;
const K_SEC = 1.3;

export function scoreExerciseLog(exerciseKey: string, value: number, weightKg: number): number {
  const def = exerciseByKey(exerciseKey);
  if (!def) return 0;
  const clamped = Math.max(0, Math.min(value, def.cap));
  if (def.unit === "kg") {
    if (weightKg <= 0) return 0;
    return Math.round((clamped / weightKg) * K_KG);
  }
  if (def.unit === "reps") return Math.round(clamped * K_REPS);
  return Math.round(clamped * K_SEC); // seconds
}

export interface MuscleScores {
  peito: number; costas: number; ombros: number; biceps: number; triceps: number;
  abdomen: number; pernas: number; posterior: number; panturrilhas: number;
}
export const EMPTY_MUSCLE_SCORES: MuscleScores = { peito: 0, costas: 0, ombros: 0, biceps: 0, triceps: 0, abdomen: 0, pernas: 0, posterior: 0, panturrilhas: 0 };

// Pra cada grupo muscular, pega o MELHOR exercício já registrado que
// treina aquele grupo (valor do exercício × peso daquele grupo nele).
export function computeMuscleScoresFromLogs(weightKg: number, logs: { exercise_key: string; value: number }[]): MuscleScores {
  const scores: MuscleScores = { ...EMPTY_MUSCLE_SCORES };
  for (const log of logs) {
    const def = exerciseByKey(log.exercise_key);
    if (!def) continue;
    const base = scoreExerciseLog(log.exercise_key, log.value, weightKg);
    for (const [group, weight] of Object.entries(def.weights) as [MuscleGroup, number][]) {
      const contribution = Math.round(base * weight);
      if (contribution > scores[group]) scores[group] = contribution;
    }
  }
  return scores;
}

// Força geral = média dos grupos musculares. Usar média (em vez de pegar
// só o maior) é o que evita o bug de "ou é tudo F ou é Infinite": um
// exercício isolado muito forte não estoura o atributo inteiro sozinho.
export function computeOverallStrength(scores: MuscleScores): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
