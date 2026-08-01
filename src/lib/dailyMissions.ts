// Sorteio determinístico das missões diárias — cada pessoa recebe um
// subconjunto diferente do banco de missões, e ele muda todo dia
// automaticamente (sem precisar de nenhuma IA/serviço externo: é só
// matemática, então funciona de graça, para sempre, sem manutenção).
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDailyMissions<T extends { id: string }>(profileId: string, dateStr: string, pool: T[], count = 5): T[] {
  if (pool.length <= count) return pool;
  const rand = mulberry32(hashSeed(profileId + dateStr));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
