// lib/campaign/processRoundChallenges.ts
import { updateChallengeProgress } from "./updateChallengeProgress";

type RoundForChallenges = {
  score?: number | null;
  course_id?: string | null;
};

export async function processRoundChallenges(
  supabase: any,
  userId: string,
  round: RoundForChallenges
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .or(`user_id.eq.${userId},id.eq.${userId}`)
    .limit(1)
    .maybeSingle();

  const membershipTier = profile?.membership_tier?.toLowerCase();

  const hasChallengePass =
    membershipTier === "pro" || membershipTier === "competitive";

  if (!hasChallengePass) return false;

  await updateChallengeProgress(supabase, userId, "summer_first_tee", 1);
  await updateChallengeProgress(supabase, userId, "summer_consistency", 1);

  if (round.score && round.score < 90) {
    await updateChallengeProgress(supabase, userId, "summer_break_90", 1);
  }

  if (round.score && round.score < 80) {
    await updateChallengeProgress(supabase, userId, "summer_break_80", 1);
  }

  // Double Dip: submit 2 rounds in one day
  const today = new Date().toISOString().slice(0, 10);

  const { count: roundsToday } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`);

  if ((roundsToday ?? 0) >= 2) {
    await updateChallengeProgress(supabase, userId, "summer_double_dip", 2);
  }

  // Weekly Warrior: submit rounds in 3 different weeks
  await updateChallengeProgress(supabase, userId, "summer_weekly_warrior", 1);

  return true;
}