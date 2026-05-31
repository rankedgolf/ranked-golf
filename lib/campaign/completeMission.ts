// lib/campaign/completeMission.ts
import { awardXP } from "./awardXP";

export async function completeMission(
  supabase: any,
  userId: string,
  missionKey: string
) {
  const { data: mission, error: missionError } = await supabase
    .from("missions")
    .select("*")
    .eq("key", missionKey)
    .eq("is_active", true)
    .single();

  if (missionError || !mission) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("user_missions")
    .select("id")
    .eq("user_id", userId)
    .eq("mission_key", missionKey)
    .eq("completed_on", today)
    .maybeSingle();

  if (existing) return mission;

  const { error: insertError } = await supabase
    .from("user_missions")
    .insert({
      user_id: userId,
      mission_key: missionKey,
      completed_on: today,
    });

  if (insertError) {
    console.error("Mission completion error:", insertError);
    return null;
  }

  await awardXP(supabase, userId, Number(mission.xp_reward ?? 0));

  return mission;
}