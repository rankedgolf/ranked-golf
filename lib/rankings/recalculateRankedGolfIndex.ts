import { getDivisionFromIndex } from "./divisions";

export async function recalculateRankedGolfIndex(
  supabase: any,
  userId: string
) {
  const { data: recentRounds } = await supabase
    .from("rounds")
    .select("score_differential")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(10);

  if (recentRounds && recentRounds.length >= 1) {
    const countingRounds = recentRounds
  .map((round: any) => Number(round.score_differential))
  .sort((a: number, b: number) => a - b)
  .slice(0, 3);

const rankedGolfIndex =
  countingRounds.reduce((sum: number, diff: number) => sum + diff, 0) /
  countingRounds.length;

    const finalIndex = Number(rankedGolfIndex.toFixed(2));

    const { error: updateError } = await supabase
  .from("profiles")
  .update({
    ranked_golf_index: finalIndex,
    division: getDivisionFromIndex(finalIndex),
    updated_at: new Date().toISOString(),
  })
  .eq("user_id", userId);

if (updateError) {
  console.error("Ranked Golf Index update error:", {
    userId,
    finalIndex,
    error: updateError,
  });
}

    return finalIndex;
  }

  await supabase
    .from("profiles")
    .update({
      ranked_golf_index: null,
      division: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return null;
}