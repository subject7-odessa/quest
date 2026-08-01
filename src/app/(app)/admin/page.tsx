import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: missions } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
  const { data: users } = await supabase.from("profiles").select("id, username, nickname, banned, role").order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-black text-cyan">PAINEL ADMIN</h1>
      <GlassCard accent="gold">
        <AdminClient missions={missions || []} users={users || []} />
      </GlassCard>
    </main>
  );
}
