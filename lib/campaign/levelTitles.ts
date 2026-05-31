export function getLevelTitle(level: number) {
  if (level >= 76) {
    return {
      title: "Ranked Veteran",
      emblem: "👑",
    };
  }

  if (level >= 51) {
    return {
      title: "Elite Golfer",
      emblem: "🏆",
    };
  }

  if (level >= 36) {
    return {
      title: "Tournament Player",
      emblem: "🥇",
    };
  }

  if (level >= 21) {
    return {
      title: "Grinder",
      emblem: "🔥",
    };
  }

  if (level >= 11) {
    return {
      title: "Competitor",
      emblem: "⚔️",
    };
  }

  if (level >= 6) {
    return {
      title: "Weekend Warrior",
      emblem: "⛳",
    };
  }

  return {
    title: "Rookie",
    emblem: "🌱",
  };
}