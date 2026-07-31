"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Apenas administradores.");
  return supabase;
}

export async function createMission(formData: FormData) {
  const supabase = await requireAdmin();
  await supabase.from("missions").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    type: String(formData.get("type")),
    target_stat: String(formData.get("target_stat")),
    xp_reward: Number(formData.get("xp_reward")) || 20,
    attribute_bonus: Number(formData.get("attribute_bonus")) || 10,
  });
  revalidatePath("/admin");
}

export async function toggleMissionActive(missionId: string, active: boolean) {
  const supabase = await requireAdmin();
  await supabase.from("missions").update({ active: !active }).eq("id", missionId);
  revalidatePath("/admin");
}

export async function toggleBanUser(profileId: string, banned: boolean) {
  const supabase = await requireAdmin();
  await supabase.from("profiles").update({ banned: !banned }).eq("id", profileId);
  revalidatePath("/admin");
}

export async function resetRankingXp() {
  const supabase = await requireAdmin();
  await supabase.from("profiles").update({ total_xp: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/admin");
  revalidatePath("/rankings");
}
