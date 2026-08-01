import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { username: string; role: string } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("username, role").eq("id", user.id).single();
    profile = data;
  }

  const linkClass = "px-3 py-2 text-sm font-bold tracking-wide text-slate hover:text-cyan transition-colors";

  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-void/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-display text-lg font-black tracking-wide text-cyan [text-shadow:0_0_16px_rgba(77,216,232,0.4)]">
          QUESTFIT
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {profile && <Link href="/dashboard" className={linkClass}>FICHA</Link>}
          <Link href="/rankings" className={linkClass}>RANKING</Link>
          {profile && <Link href={`/perfil/${profile.username}`} className={linkClass}>PERFIL</Link>}
          {profile?.role === "admin" && <Link href="/admin" className={linkClass}>ADMIN</Link>}
          {profile ? (
            <SignOutButton />
          ) : (
            <>
              <Link href="/login" className={linkClass}>ENTRAR</Link>
              <Link href="/register" className="ml-1 border border-cyan bg-cyan/10 px-3 py-1.5 text-sm font-bold text-cyan hover:bg-cyan hover:text-void">
                CRIAR CONTA
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
