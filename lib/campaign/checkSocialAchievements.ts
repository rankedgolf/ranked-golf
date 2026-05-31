import { awardXP } from "./awardXP";

async function unlockAchievement(
  supabase: any,
  userId: string,
  achievementKey: string
) {
  const { data: achievement } = await supabase
    .from("achievements")
    .select("*")
    .eq("key", achievementKey)
    .single();

  if (!achievement) return null;

  const { error } = await supabase
    .from("user_achievements")
    .insert({
      user_id: userId,
      achievement_key: achievementKey,
    });

  if (error) return null;

  await awardXP(
    supabase,
    userId,
    Number(achievement.xp_reward || 0)
  );

  return achievement;
}

export async function checkSocialAchievements(
  supabase: any,
  userId: string
) {
  const unlocked = [];

  const { count: followingCount } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_user_id", userId);

  const { count: followerCount } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_user_id", userId);

  if ((followingCount || 0) >= 1) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "first_golfer_followed"
    );

    if (achievement) unlocked.push(achievement);
  }

  if ((followingCount || 0) >= 10) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "follow_10_golfers"
    );

    if (achievement) unlocked.push(achievement);
  }

  if ((followerCount || 0) >= 1) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "gain_first_follower"
    );

    if (achievement) unlocked.push(achievement);
  }

  if ((followerCount || 0) >= 10) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "gain_10_followers"
    );

    if (achievement) unlocked.push(achievement);
  }

  return unlocked;
}