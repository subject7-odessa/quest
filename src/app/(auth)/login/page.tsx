"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 font-display text-2xl font-black tracking-wide text-cyan">ENTRAR</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="mt-2 border border-cyan bg-cyan/10 p-3 font-bold tracking-wide text-cyan hover:bg-cyan hover:text-void disabled:opacity-50">
          {loading ? "ENTRANDO..." : "ENTRAR"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate">
        Não tem conta? <a href="/register" className="text-cyan underline">Criar conta</a>
      </p>
    </main>
  );
}
