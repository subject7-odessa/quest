// Velocidade, Resistência, Potencial e o piso geral. Força e o mapa
// muscular agora vêm de src/lib/exercises.ts (sistema de exercícios
// específicos por grupo muscular).

export interface InterviewAnswers {
  trains_since: "nunca" | "menos_6_meses" | "6_meses_mais";
  pushups_max: number;
  pullups_max: number;
  run_time_1km?: number | null;
  run_time_3km?: number | null;
  weekly_frequency: number;
  sleep_hours: number;
  diet_quality: "ruim" | "media" | "boa";
  experience_level: "iniciante" | "intermediario" | "avancado";
}

export interface BodyStats {
  weight_kg: number;
  height_cm: number;
}

export interface MeasurementPoint {
  recorded_at: string;
  run_time_1km?: number | null;
  run_time_3km?: number | null;
  cooper_12min_m?: number | null;
  plank_seconds?: number | null;
  continuous_run_min?: number | null;
}

// Limites contra valores absurdos ("supino 200000kg"). Usados tanto no
// front (atributo `max` do input) quanto validados de novo no servidor.
export const INPUT_CAPS = {
  run_time_1km: { min: 2, max: 30 },
  run_time_3km: { min: 6, max: 90 },
  cooper_12min_m: { min: 0, max: 4000 },
  plank_seconds: { min: 0, max: 1800 },
  continuous_run_min: { min: 0, max: 180 },
};

function clampMin0(n: number) {
  return Math.max(0, Math.round(n));
}
function clampField(key: keyof typeof INPUT_CAPS, value: number): number {
  const c = INPUT_CAPS[key];
  return Math.max(c.min, Math.min(value, c.max));
}
export { clampField };

// ---------- PISO GERAL DE CONDICIONAMENTO ----------
export function generalFitnessFloor(opts: {
  weekly_frequency?: number | null;
  trains_since?: InterviewAnswers["trains_since"] | null;
  pushups_max?: number | null;
}): number {
  const byTrainsSince = { nunca: 0, menos_6_meses: 70, "6_meses_mais": 150 };
  const trainsSincePts = opts.trains_since ? byTrainsSince[opts.trains_since] : 0;
  const freqPts = (opts.weekly_frequency || 0) * 18;
  const pushupsPts = (opts.pushups_max || 0) * 1.5;
  return clampMin0(trainsSincePts + freqPts + pushupsPts);
}

// ---------- VELOCIDADE ----------
export function computeSpeed(m: MeasurementPoint | null | undefined, run1kmFallback: number | null | undefined, floor = 0): number {
  const run1km = m?.run_time_1km ?? run1kmFallback;
  let points = 0;
  if (run1km && run1km > 0) points = (9 - clampField("run_time_1km", run1km)) * 110;
  return clampMin0(Math.max(points, floor * 0.55));
}

// ---------- RESISTÊNCIA ----------
export function computeEndurance(m: MeasurementPoint | null | undefined, run3kmFallback: number | null | undefined, floor = 0): number {
  let points = 0;
  if (m?.cooper_12min_m) points = Math.max(points, (clampField("cooper_12min_m", m.cooper_12min_m) - 1000) * 0.55);
  if (m?.continuous_run_min) points = Math.max(points, clampField("continuous_run_min", m.continuous_run_min) * 22);
  const run3km = m?.run_time_3km ?? run3kmFallback;
  if (run3km && run3km > 0) points = Math.max(points, (26 - clampField("run_time_3km", run3km)) * 35);
  if (m?.plank_seconds) points = Math.max(points, clampField("plank_seconds", m.plank_seconds) * 0.9);
  return clampMin0(Math.max(points, floor * 0.7));
}

// ---------- POTENCIAL ----------
// Automático: compara a medida de resistência/velocidade mais antiga
// com a mais recente. Quem evolui rápido sobe; quem estagna cai.
export function computePotential(history: MeasurementPoint[]): number {
  if (history.length < 2) return 350;
  const sorted = [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const scoreOf = (m: MeasurementPoint) =>
    (m.cooper_12min_m || 0) / 20 + (m.continuous_run_min || 0) * 3 + (m.plank_seconds || 0) / 5 + (m.run_time_1km ? Math.max(0, 15 - m.run_time_1km) * 10 : 0);

  const oldScore = scoreOf(oldest);
  const newScore = scoreOf(newest);
  if (oldScore <= 0) return 400;

  const percentChange = ((newScore - oldScore) / oldScore) * 100;
  return clampMin0(400 + percentChange * 15);
}

// ---------- IMC ----------
export function computeImc(heightCm: number, weightKg: number) {
  if (!heightCm || !weightKg) return null;
  const h = heightCm / 100;
  const imc = weightKg / (h * h);
  let classif = "Peso normal";
  if (imc < 18.5) classif = "Abaixo do peso";
  else if (imc < 25) classif = "Peso normal";
  else if (imc < 30) classif = "Sobrepeso";
  else if (imc < 35) classif = "Obesidade grau I";
  else if (imc < 40) classif = "Obesidade grau II";
  else classif = "Obesidade grau III";
  return { value: Number(imc.toFixed(1)), classif };
}
