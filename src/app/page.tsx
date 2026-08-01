import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-2 font-display text-xs tracking-[6px] text-cyan opacity-75">
        PROTOCOLO DE EVOLUÇÃO PESSOAL
      </div>
      <h1 className="mb-4 font-display text-5xl font-black tracking-wide text-cyan [text-shadow:0_0_30px_rgba(77,216,232,0.45)]">
        QUESTFIT
      </h1>
      <p className="mb-8 max-w-lg text-slate">
        Seus atributos não são inventados. Força, velocidade, resistência,
        potencial e inteligência calculados a partir dos seus treinos e
        testes reais — nível separado dos atributos, do jeito que evolução de verdade funciona.
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="border border-cyan bg-cyan/10 px-6 py-3 font-bold tracking-wide text-cyan hover:bg-cyan hover:text-void">
          CRIAR CONTA
        </Link>
        <Link href="/login" className="border border-line px-6 py-3 font-bold tracking-wide text-slate hover:border-cyan hover:text-cyan">
          ENTRAR
        </Link>
      </div>
      <Link href="/rankings" className="mt-10 text-sm text-slate underline decoration-line hover:text-cyan">
        Ver ranking público →
      </Link>
    </main>
  );
}
