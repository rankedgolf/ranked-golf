export function getAchievementProgress({
  achievementKey,
  totalRounds,
  totalFollows,
  totalFollowers,
  totalCourses,
  verifiedRounds,
  totalPracticeSessions = 0,
  totalPracticeHours = 0,
  totalBirdies = 0,
  soloRounds = 0,
}: {
  achievementKey: string;
  totalRounds: number;
  totalFollows: number;
  totalFollowers: number;
  totalCourses: number;
  verifiedRounds: number;
  totalPracticeSessions?: number;
  totalPracticeHours?: number;
  totalBirdies?: number;
  soloRounds?: number;
}) {
  const progressMap: Record<
    string,
    { current: number; target: number }
  > = {
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

    practice_5_sessions: {
      current: totalPracticeSessions,
      target: 5,
    },

    practice_10_sessions: {
      current: totalPracticeSessions,
      target: 10,
    },

    practice_25_sessions: {
      current: totalPracticeSessions,
      target: 25,
    },

    practice_5_hours: {
      current: totalPracticeHours,
      target: 5,
    },

    practice_10_hours: {
      current: totalPracticeHours,
      target: 10,
    },

    practice_25_hours: {
      current: totalPracticeHours,
      target: 25,
    },

    bird_watcher_50_birdies: {
  current: totalBirdies,
  target: 50,
},

lone_wolf_25_solo: {
  current: soloRounds,
  target: 25,
},
  };

  return progressMap[achievementKey] || null;
}