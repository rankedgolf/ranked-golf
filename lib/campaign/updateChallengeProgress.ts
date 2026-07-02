import { awardXP } from "./awardXP";

export async function updateChallengeProgress(
  supabase: any,
  userId: string,
  challengeKey: string,
  amount: number = 1
) {
  const { data: challenge } = await supabase
    .from("challenge_definitions")
    .select("*")
    .eq("key", challengeKey)
    .eq("is_active", true)
    .single();

  if (!challenge) return null;

  const targetValue = Number(challenge.target_value ?? 1);

  const { data: existing } = await supabase
    .from("user_challenge_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_key", challengeKey)
    .maybeSingle();

  if (existing?.completed) return existing;

  const currentProgress = Number(existing?.progress ?? 0);
  const newProgress = Math.min(currentProgress + amount, targetValue);
  const isCompleted = newProgress >= targetValue;

  const { data: saved, error } = await supabase
    .from("user_challenge_progress")
    .upsert(
      {
        user_id: userId,
        challenge_key: challengeKey,
        progress: newProgress,
        completed: isCompleted,
        completed_at: isCompleted
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,challenge_key",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Challenge progress error:", error);
    return null;
  }

  if (isCompleted) {
    await awardXP(
      supabase,
      userId,
      Number(challenge.xp_reward ?? 0)
    );
  }

  return saved;
}

export async function setChallengeProgress(
  supabase: any,
  userId: string,
  challengeKey: string,
  progressValue: number
) {
  const { data: challenge } = await supabase
    .from("challenge_definitions")
    .select("*")
    .eq("key", challengeKey)
    .eq("is_active", true)
    .single();

  if (!challenge) return null;

  const targetValue = Number(challenge.target_value ?? 1);

  const { data: existing } = await supabase
    .from("user_challenge_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_key", challengeKey)
    .maybeSingle();

  if (existing?.completed) return existing;

  const newProgress = Math.min(progressValue, targetValue);
  const isCompleted = newProgress >= targetValue;

  const { data: saved, error } = await supabase
    .from("user_challenge_progress")
    .upsert(
      {
        user_id: userId,
        challenge_key: challengeKey,
        progress: newProgress,
        completed: isCompleted,
        completed_at: isCompleted
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,challenge_key",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Set challenge progress error:", error);
    return null;
  }

  if (isCompleted) {
    await awardXP(
      supabase,
      userId,
      Number(challenge.xp_reward ?? 0)
    );
  }

  return saved;
}