"use server";
import { createClient } from "@/lib/supabase/server";
import { periodKeyFor } from "@/lib/xp";
import { revalidatePath } from "next/cache";

export async function completeMission(missionId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: mission } = await supabase.from("missions").select("*").eq("id", missionId).single();
  if (!mission) return;

  const periodKey = periodKeyFor(mission.type);

  const { error: insertError } = await supabase.from("user_missions").insert({
    profile_id: user.id,
    mission_id: missionId,
    period_key: periodKey,
  });
  if (insertError) return; // já concluída nesse período (unique constraint barra duplicidade)

  await supabase.rpc("grant_xp", {
    p_profile_id: user.id,
    p_amount: mission.xp_reward,
    p_reason: `Missão: ${mission.title}`,
  });

  const { data: attrs } = await supabase.from("attributes").select("*").eq("profile_id", user.id).single();
  if (attrs) {
    const field = mission.target_stat as "strength" | "speed" | "potential" | "intelligence" | "endurance";
    await supabase
      .from("attributes")
      .update({ [field]: (attrs[field] ?? 0) + mission.attribute_bonus })
      .eq("profile_id", user.id);
  }

  revalidatePath("/dashboard");
}

export async function undoMission(missionId: string, periodKey: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: mission } = await supabase.from("missions").select("*").eq("id", missionId).single();
  if (!mission) return;

  await supabase
    .from("user_missions")
    .delete()
    .match({ profile_id: user.id, mission_id: missionId, period_key: periodKey });

  await supabase.rpc("grant_xp", {
    p_profile_id: user.id,
    p_amount: -mission.xp_reward,
    p_reason: `Desfeita: ${mission.title}`,
  });

  const { data: attrs } = await supabase.from("attributes").select("*").eq("profile_id", user.id).single();
  if (attrs) {
    const field = mission.target_stat as "strength" | "speed" | "potential" | "intelligence" | "endurance";
    await supabase
      .from("attributes")
      .update({ [field]: Math.max(0, (attrs[field] ?? 0) - mission.attribute_bonus) })
      .eq("profile_id", user.id);
  }

  revalidatePath("/dashboard");
}
