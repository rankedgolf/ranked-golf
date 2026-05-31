import { updateChallengeProgress } from "./updateChallengeProgress";

export async function processEventChallenges(
  supabase: any,
  userId: string
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

  if (!hasChallengePass) {
    return false;
  }

  await updateChallengeProgress(
    supabase,
    userId,
    "summer_event_rookie",
    1
  );

  await updateChallengeProgress(
    supabase,
    userId,
    "summer_event_grinder",
    1
  );

  return true;
}
