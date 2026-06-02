import { awardXP } from "./awardXP";

const PRACTICE_ACHIEVEMENTS = [
  {
    key: "practice_5_sessions",
    target: 5,
    type: "sessions",
  },
  {
    key: "practice_10_sessions",
    target: 10,
    type: "sessions",
  },
  {
    key: "practice_25_sessions",
    target: 25,
    type: "sessions",
  },
  {
    key: "practice_5_hours",
    target: 5,
    type: "hours",
  },
  {
    key: "practice_10_hours",
    target: 10,
    type: "hours",
  },
  {
    key: "practice_25_hours",
    target: 25,
    type: "hours",
  },
];

export async function checkPracticeAchievements(
  supabase: any,
  userId: string
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("user_id", userId)
    .single();

  const isPro =
    profile?.membership_tier === "pro" ||
    profile?.membership_tier === "competitive";

  if (!isPro) {
    return [];
  }

  const { data: logs } = await supabase
    .from("user_practice_logs")
    .select("*")
    .eq("user_id", userId);

  const totalSessions = logs?.length || 0;

  const totalHours =
    logs?.reduce((sum: number, log: any) => {
      if (log.practice_task_key === "practice_30_min") {
        return sum + 0.5;
      }

      if (log.practice_task_key === "practice_60_min") {
        return sum + 1;
      }

      return sum;
    }, 0) || 0;

  const unlocked: any[] = [];

  for (const achievement of PRACTICE_ACHIEVEMENTS) {
    const currentValue =
      achievement.type === "sessions" ? totalSessions : totalHours;

    if (currentValue < achievement.target) continue;

    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_key", achievement.key)
      .maybeSingle();

    if (existing) continue;

    const { data: achievementData } = await supabase
      .from("achievements")
      .select("*")
      .eq("key", achievement.key)
      .single();

    if (!achievementData) continue;

    const { error } = await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_key: achievement.key,
    });

    if (error) continue;

    await awardXP(
      supabase,
      userId,
      Number(achievementData.xp_reward || 0)
    );

    unlocked.push(achievementData);
  }

  return unlocked;
}