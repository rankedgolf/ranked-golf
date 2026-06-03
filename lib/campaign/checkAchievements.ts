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

  const { error } = await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_key: achievementKey,
  });

  if (error) return null;

  await awardXP(supabase, userId, Number(achievement.xp_reward || 0));

  return achievement;
}

export async function checkRoundAchievements(
  supabase: any,
  userId: string
) {
  const { data: rounds } = await supabase
    .from("rounds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!rounds?.length) return [];

  const unlocked: any[] = [];
  const latestRound = rounds[0];

  const totalRounds = rounds.length;
  const score = Number(latestRound.score);
  const diff = Number(latestRound.score_differential);
  const par = Number(latestRound.par || 72);

  const birdies = Number(latestRound.birdies || 0);
  const holeInOnes = Number(latestRound.hole_in_ones || 0);
  const putts = Number(latestRound.putts || 0);
  const gir = Number(latestRound.gir || 0);
  const tripleBogeys = Number(latestRound.triple_bogeys || 0);

  const roundDate = new Date(latestRound.played_at);

  if (roundDate.getDay() === 2) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "taco_tuesday"
    );

    if (achievement) unlocked.push(achievement);
  }

  if (roundDate.getDay() === 5 && Number(latestRound.holes) === 18) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "nineteenth_hole_hero"
    );

    if (achievement) unlocked.push(achievement);
  }

  const roundsOver100 = rounds.filter(
    (round: any) => Number(round.score) > 100
  ).length;

  if (roundsOver100 >= 5) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "turtle_pace"
    );

    if (achievement) unlocked.push(achievement);
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentRounds = rounds.filter(
    (round: any) => new Date(round.played_at) >= sevenDaysAgo
  );

  if (recentRounds.length >= 3) {
    const rabbit = await unlockAchievement(
      supabase,
      userId,
      "rabbit_run"
    );

    if (rabbit) unlocked.push(rabbit);

    const iceCream = await unlockAchievement(
      supabase,
      userId,
      "ice_cream_run"
    );

    if (iceCream) unlocked.push(iceCream);
  }

  const roundsSameDay = rounds.filter(
    (round: any) => round.played_at === latestRound.played_at
  ).length;

  if (roundsSameDay >= 2) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "lightning_round"
    );

    if (achievement) unlocked.push(achievement);
  }

  const verifiedRounds = rounds.filter(
    (round: any) => Number(round.trust_level || 0) >= 2
  ).length;

  const uniqueCourses = new Set(
    rounds.map((round: any) => round.course_id || round.course_name)
  );

  const courseIds = rounds
    .map((round: any) => round.course_id)
    .filter(Boolean);

  let playedInAnotherState = false;

  if (courseIds.length > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("state")
      .eq("user_id", userId)
      .maybeSingle();

    const homeState = String(profile?.state || "").toLowerCase();

    const { data: courses } = await supabase
      .from("courses")
      .select("id, state")
      .in("id", courseIds);

    playedInAnotherState =
      !!homeState &&
      !!courses?.some(
        (course: any) =>
          String(course.state || "").toLowerCase() !== homeState
      );
  }

  const achievementChecks = [
    { condition: totalRounds >= 3, key: "submit_3_rounds" },
    { condition: totalRounds >= 5, key: "submit_5_rounds" },
    { condition: totalRounds >= 10, key: "submit_10_rounds" },
    { condition: totalRounds >= 25, key: "submit_25_rounds" },
    { condition: totalRounds >= 50, key: "submit_50_rounds" },
    { condition: totalRounds >= 100, key: "submit_100_rounds" },

    { condition: score < 110, key: "break_110" },
    { condition: score < 100, key: "break_100" },
    { condition: score < 95, key: "break_95" },
    { condition: score < 90, key: "break_90" },
    { condition: score < 85, key: "break_85" },
    { condition: score < 80, key: "break_80" },
    { condition: score < 75, key: "break_75" },
    { condition: score <= par, key: "shoot_even_par" },
    { condition: score < par, key: "shoot_under_par" },

    { condition: verifiedRounds >= 1, key: "first_verified_round" },
    { condition: verifiedRounds >= 5, key: "five_verified_rounds" },
    { condition: verifiedRounds >= 10, key: "ten_verified_rounds" },
    {
      condition: totalRounds >= 10 && verifiedRounds / totalRounds >= 0.7,
      key: "trusted_golfer_status",
    },

    { condition: uniqueCourses.size >= 5, key: "play_5_different_courses" },
    { condition: uniqueCourses.size >= 10, key: "play_10_different_courses" },

    { condition: birdies >= 3, key: "three_birdies_one_round" },
    { condition: gir >= 10, key: "double_digit_gir_round" },
    { condition: putts > 0 && putts < 30, key: "under_30_putts" },
    { condition: tripleBogeys === 0, key: "no_triple_bogeys_round" },
    { condition: holeInOnes >= 1, key: "hole_in_one" },

    { condition: !!latestRound.event_id, key: "first_event_entered" },
    { condition: playedInAnotherState, key: "play_course_another_state" },

    { condition: score === 70, key: "hot_dog_70_18_holes" },
    { condition: score === 77, key: "lucky_seven_77" },
    { condition: score === 80, key: "pizza_party_80_18_holes" },
    { condition: score === 88, key: "crazy_eights_88" },
    { condition: score === 99, key: "cloud_nine_99" },
    { condition: score === 100, key: "perfect_hundred" },
    { condition: score === 111, key: "jackpot_111" },
    { condition: score === 123, key: "club_123" },

    { condition: verifiedRounds >= 25, key: "golf_crew_25_verified" },
    { condition: verifiedRounds >= 50, key: "verified_veteran_50_verified" },
    { condition: uniqueCourses.size >= 25, key: "pathfinder_25_courses" },
    { condition: uniqueCourses.size >= 50, key: "road_warrior_50_courses" },
    { condition: totalRounds >= 25, key: "cookie_monster_25_rounds" },
  ];

  for (const check of achievementChecks) {
    if (check.condition) {
      const achievement = await unlockAchievement(
        supabase,
        userId,
        check.key
      );

      if (achievement) unlocked.push(achievement);
    }
  }

  const bestPreviousDiff =
    rounds.length > 1
      ? Math.min(
          ...rounds
            .slice(1)
            .map((round: any) => Number(round.score_differential))
        )
      : null;

  if (bestPreviousDiff !== null && diff < bestPreviousDiff) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "personal_best_differential"
    );

    if (achievement) unlocked.push(achievement);
  }

  const bestPreviousScore =
    rounds.length > 1
      ? Math.min(
          ...rounds.slice(1).map((round: any) => Number(round.score))
        )
      : null;

  if (bestPreviousScore !== null && score < bestPreviousScore) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "lowest_round_ever"
    );

    if (achievement) unlocked.push(achievement);
  }

  const recentDiffs = rounds
    .slice(0, 3)
    .map((round: any) => Number(round.score_differential));

  if (
    recentDiffs.length === 3 &&
    recentDiffs[0] < recentDiffs[1] &&
    recentDiffs[1] < recentDiffs[2]
  ) {
    const achievement = await unlockAchievement(
      supabase,
      userId,
      "improve_differential_3_rounds_straight"
    );

    if (achievement) unlocked.push(achievement);
  }

  return unlocked;
}