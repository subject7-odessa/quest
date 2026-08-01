"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPractice(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") || "").trim();
  const kind = String(formData.get("kind"));
  const level = String(formData.get("level") || "").trim();
  const years = Number(formData.get("years")) || null;
  if (!name) return;

  await supabase.from("practices").insert({ profile_id: user.id, name, kind, level, years });
  revalidatePath("/dashboard");
}

export async function removePractice(practiceId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("practices").delete().match({ id: practiceId, profile_id: user.id });
  revalidatePath("/dashboard");
}
