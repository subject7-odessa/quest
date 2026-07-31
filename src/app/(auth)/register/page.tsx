"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, nickname } },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 font-display text-2xl font-black tracking-wide text-cyan">CRIAR CONTA</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="Nome de usuário (sem espaço)" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="Apelido" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="border border-line bg-void/60 p-3 outline-none focus:border-cyan" placeholder="Senha (mín. 6 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="mt-2 border border-cyan bg-cyan/10 p-3 font-bold tracking-wide text-cyan hover:bg-cyan hover:text-void disabled:opacity-50">
          {loading ? "CRIANDO..." : "CRIAR CONTA"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate">
        Já tem conta? <a href="/login" className="text-cyan underline">Entrar</a>
      </p>
    </main>
  );
}
