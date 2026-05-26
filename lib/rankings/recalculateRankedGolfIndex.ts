function getDivisionFromIndex(index: number | null) {
  if (index === null) return null;

  if (index <= 5) return "Championship";
  if (index <= 10) return "A Flight";
  if (index <= 15) return "B Flight";
  if (index <= 20) return "C Flight";

  return "D Flight";
}

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

  if (recentRounds && recentRounds.length >= 3) {
    const bestThree = recentRounds
      .map((round: any) => Number(round.score_differential))
      .sort((a: number, b: number) => a - b)
      .slice(0, 3);

    const rankedGolfIndex =
      bestThree.reduce((sum: number, diff: number) => sum + diff, 0) /
      bestThree.length;

    const finalIndex = Number(rankedGolfIndex.toFixed(2));

    await supabase
      .from("profiles")
      .update({
        ranked_golf_index: finalIndex,
        division: getDivisionFromIndex(finalIndex),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

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