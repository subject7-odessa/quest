// Cálculo dos atributos a partir de dados REAIS (entrevista e medidas).
// Nada aqui é editável manualmente pelo usuário — só recalculado
// automaticamente quando ele registra novos testes/medidas.
//
// IMPORTANTE: todo teste tem duas vias — calistenia (peso do corpo) e
// academia (cargas livres). O sistema sempre usa o MELHOR resultado
// entre as duas, então funciona igual bem pra quem só treina peso
// corporal, só treina com peso livre, ou os dois.

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
  // calistenia
  pushups_max?: number | null;
  pullups_max?: number | null;
  dips_max?: number | null;
  squat_reps_bodyweight?: number | null;
  plank_seconds?: number | null;
  continuous_run_min?: number | null;
  run_time_1km?: number | null;
  run_time_3km?: number | null;
  cooper_12min_m?: number | null;
  // academia / peso livre
  bench_1rm?: number | null;
  squat_1rm?: number | null;
  deadlift_1rm?: number | null;
}

function clampMin0(n: number) {
  return Math.max(0, Math.round(n));
}

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

// ---------- FORÇA (geral) ----------
// Pega o MELHOR entre a via calistenia (flexões + barras + paralelas) e a
// via academia (soma dos 1RMs ÷ peso corporal). Ninguém fica em
// desvantagem por treinar só de um jeito.
export function computeStrength(weightKg: number, m?: MeasurementPoint | null, pushupsFallback = 0): number {
  const pushups = m?.pushups_max ?? pushupsFallback;
  const pullups = m?.pullups_max || 0;
  const dips = m?.dips_max || 0;
  const calisthenicsPts = clampMin0(pushups * 6 + pullups * 9 + dips * 5);

  let gymPts = 0;
  if (weightKg > 0 && (m?.bench_1rm || m?.squat_1rm || m?.deadlift_1rm)) {
    const total = (m?.bench_1rm || 0) + (m?.squat_1rm || 0) + (m?.deadlift_1rm || 0);
    gymPts = clampMin0((total / weightKg) * 150);
  }

  return Math.max(calisthenicsPts, gymPts);
}

// ---------- VELOCIDADE ----------
export function computeSpeed(m: MeasurementPoint | null | undefined, run1kmFallback: number | null | undefined, floor = 0): number {
  const run1km = m?.run_time_1km ?? run1kmFallback;
  let points = 0;
  if (run1km && run1km > 0) {
    points = (9 - run1km) * 110; // 3min/km elite, 9min/km ritmo bem devagar
  }
  return clampMin0(Math.max(points, floor * 0.55));
}

// ---------- RESISTÊNCIA ----------
export function computeEndurance(m: MeasurementPoint | null | undefined, run3kmFallback: number | null | undefined, floor = 0): number {
  let points = 0;
  if (m?.cooper_12min_m) points = Math.max(points, (m.cooper_12min_m - 1000) * 0.55);
  if (m?.continuous_run_min) points = Math.max(points, m.continuous_run_min * 22);
  const run3km = m?.run_time_3km ?? run3kmFallback;
  if (run3km && run3km > 0) points = Math.max(points, (26 - run3km) * 35);
  if (m?.plank_seconds) points = Math.max(points, m.plank_seconds * 0.9);
  return clampMin0(Math.max(points, floor * 0.7));
}

// ---------- POTENCIAL ----------
export function computePotential(history: MeasurementPoint[]): number {
  if (history.length < 2) return 350;
  const sorted = [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const scoreOf = (m: MeasurementPoint) =>
    (m.pushups_max || 0) +
    (m.pullups_max || 0) * 2 +
    (m.dips_max || 0) * 1.5 +
    (m.squat_reps_bodyweight || 0) * 1.5 +
    (m.cooper_12min_m || 0) / 20 +
    (m.continuous_run_min || 0) * 3 +
    (m.plank_seconds || 0) / 5 +
    ((m.bench_1rm || 0) + (m.squat_1rm || 0) + (m.deadlift_1rm || 0)) / 10;

  const oldScore = scoreOf(oldest);
  const newScore = scoreOf(newest);
  if (oldScore <= 0) return 400;

  const percentChange = ((newScore - oldScore) / oldScore) * 100;
  return clampMin0(400 + percentChange * 15);
}

// ---------- INTELIGÊNCIA ----------
export function computeBaseIntelligence(answers: InterviewAnswers): number {
  const byExperience = { iniciante: 50, intermediario: 150, avancado: 280 };
  return byExperience[answers.experience_level];
}

// ---------- ATRIBUTOS INICIAIS (rodado uma vez, na entrevista) ----------
export function computeInitialAttributes(answers: InterviewAnswers, body: BodyStats) {
  const fakeMeasurement: MeasurementPoint = {
    recorded_at: new Date().toISOString(),
    pushups_max: answers.pushups_max,
    pullups_max: answers.pullups_max,
    run_time_1km: answers.run_time_1km ?? undefined,
    run_time_3km: answers.run_time_3km ?? undefined,
  };
  const floor = generalFitnessFloor(answers);

  return {
    strength: computeStrength(body.weight_kg, fakeMeasurement, answers.pushups_max),
    speed: computeSpeed(fakeMeasurement, answers.run_time_1km, floor),
    endurance: computeEndurance(fakeMeasurement, answers.run_time_3km, floor),
    intelligence: computeBaseIntelligence(answers),
    potential: 400,
  };
}

// ---------- MÚSCULOS (mapa corporal) ----------
// Cada grupo pega o MELHOR resultado entre a via calistenia e a via
// academia — igual a Força geral.
export interface MuscleScores {
  peito: number;
  costas: number;
  ombros: number;
  bracos: number;
  abdomen: number;
  pernas: number;
  posterior: number;
  panturrilhas: number;
}

export function computeMuscleScores(weightKg: number, m?: MeasurementPoint | null): MuscleScores {
  const pushups = m?.pushups_max || 0;
  const pullups = m?.pullups_max || 0;
  const dips = m?.dips_max || 0;
  const squatReps = m?.squat_reps_bodyweight || 0;
  const plank = m?.plank_seconds || 0;

  const peitoGym = m?.bench_1rm && weightKg > 0 ? clampMin0((m.bench_1rm / weightKg) * 220) : 0;
  const peitoCalistenia = clampMin0(pushups * 7 + dips * 6);
  const peito = Math.max(peitoGym, peitoCalistenia);

  const costasGym = m?.deadlift_1rm && weightKg > 0 ? clampMin0((m.deadlift_1rm / weightKg) * 160) : 0;
  const costasCalistenia = clampMin0(pullups * 22);
  const costas = Math.max(costasGym, costasCalistenia);

  const pernasGym = m?.squat_1rm && weightKg > 0 ? clampMin0((m.squat_1rm / weightKg) * 170) : 0;
  const pernasCalistenia = squatReps > 0 ? clampMin0(squatReps * 5) : clampMin0(300 + pushups * 2);
  const pernas = Math.max(pernasGym, pernasCalistenia);

  const posteriorGym = m?.deadlift_1rm && weightKg > 0 ? clampMin0((m.deadlift_1rm / weightKg) * 140) : 0;
  const posteriorCalistenia = clampMin0(pullups * 15 + squatReps * 3);
  const posterior = Math.max(posteriorGym, posteriorCalistenia);

  const ombros = clampMin0(((peito + costas) / 2) * 0.75);
  const bracos = clampMin0(pushups * 5 + pullups * 10 + dips * 4);
  const abdomen = plank > 0 ? clampMin0(plank * 1.1) : clampMin0(pushups * 3);
  const panturrilhas = clampMin0(pernas * 0.65);

  return { peito, costas, ombros, bracos, abdomen, pernas, posterior, panturrilhas };
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
