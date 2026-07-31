import { submitOnboarding } from "@/app/actions/onboarding";

export default function OnboardingPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-1 font-display text-xs tracking-[4px] text-cyan">ENTREVISTA INICIAL</div>
      <h1 className="mb-2 font-display text-3xl font-black text-cyan">Vamos gerar sua ficha real</h1>
      <p className="mb-8 text-sm text-slate">
        Responda com sinceridade. Seus atributos vão nascer exatamente do que você já é hoje —
        sem inflar nem subestimar nada.
      </p>

      <form action={submitOnboarding} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="IDADE"><input name="age" type="number" required className="input" /></Field>
          <Field label="SEXO">
            <select name="sex" required className="input">
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </Field>
          <Field label="ALTURA (cm)"><input name="height_cm" type="number" required className="input" /></Field>
          <Field label="PESO (kg)"><input name="weight_kg" type="number" required className="input" /></Field>
        </div>

        <Field label="HÁ QUANTO TEMPO TREINA?">
          <select name="trains_since" required className="input">
            <option value="nunca">Nunca treinei</option>
            <option value="menos_6_meses">Menos de 6 meses</option>
            <option value="6_meses_mais">6 meses ou mais</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="FLEXÕES MÁX. SEGUIDAS"><input name="pushups_max" type="number" defaultValue={0} className="input" /></Field>
          <Field label="BARRAS MÁX. SEGUIDAS"><input name="pullups_max" type="number" defaultValue={0} className="input" /></Field>
          <Field label="TEMPO NO 1km (min, opcional)"><input name="run_time_1km" type="number" step="0.1" className="input" /></Field>
          <Field label="TEMPO NO 3km (min, opcional)"><input name="run_time_3km" type="number" step="0.1" className="input" /></Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="DIAS DE TREINO / SEMANA"><input name="weekly_frequency" type="number" defaultValue={0} className="input" /></Field>
          <Field label="HORAS DE SONO / NOITE"><input name="sleep_hours" type="number" step="0.5" defaultValue={7} className="input" /></Field>
        </div>

        <Field label="COMO VOCÊ AVALIA SUA ALIMENTAÇÃO?">
          <select name="diet_quality" required className="input">
            <option value="ruim">Ruim / desregrada</option>
            <option value="media">Mediana</option>
            <option value="boa">Boa / estruturada</option>
          </select>
        </Field>

        <Field label="NÍVEL DE EXPERIÊNCIA">
          <select name="experience_level" required className="input">
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </Field>

        <Field label="OBJETIVO"><input name="goal" placeholder="ex: hipertrofia, emagrecimento, força..." className="input" /></Field>
        <Field label="LESÕES (opcional)"><input name="injuries" placeholder="ex: dor no joelho direito" className="input" /></Field>

        <button className="mt-4 border border-cyan bg-cyan/10 p-3 font-bold tracking-wide text-cyan hover:bg-cyan hover:text-void">
          GERAR MINHA FICHA
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] tracking-wide text-slate">{label}</span>
      {children}
    </label>
  );
}
