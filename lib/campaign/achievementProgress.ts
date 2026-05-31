export function getAchievementProgress({
  achievementKey,
  totalRounds,
  totalFollows,
  totalFollowers,
  totalCourses,
  verifiedRounds,
}: {
  achievementKey: string;
  totalRounds: number;
  totalFollows: number;
  totalFollowers: number;
  totalCourses: number;
  verifiedRounds: number;
}) {
  const progressMap: Record<string, { current: number; target: number }> = {
    submit_3_rounds: {
      current: totalRounds,
      target: 3,
    },
    submit_5_rounds: {
      current: totalRounds,
      target: 5,
    },
    submit_10_rounds: {
      current: totalRounds,
      target: 10,
    },
    submit_25_rounds: {
      current: totalRounds,
      target: 25,
    },
    submit_50_rounds: {
      current: totalRounds,
      target: 50,
    },
    submit_100_rounds: {
      current: totalRounds,
      target: 100,
    },
    follow_10_golfers: {
      current: totalFollows,
      target: 10,
    },
    gain_10_followers: {
      current: totalFollowers,
      target: 10,
    },
    play_5_different_courses: {
      current: totalCourses,
      target: 5,
    },
    play_10_different_courses: {
      current: totalCourses,
      target: 10,
    },
    five_verified_rounds: {
      current: verifiedRounds,
      target: 5,
    },
    ten_verified_rounds: {
      current: verifiedRounds,
      target: 10,
    },
  };

  return progressMap[achievementKey] || null;
}