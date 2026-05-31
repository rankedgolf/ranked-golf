export const levelThresholds = [
  0,
  250,
  600,
  1050,
  1600,
  2300,
  3150,
  4150,
  5300,
  6600,
  8050,
  9650,
  11400,
  13300,
  15350,
  17550,
  19900,
  22400,
  25050,
  27850,
  30800,
  33900,
  37150,
  40550,
  44100,
  47800,
  51650,
  55650,
  59800,
  64100,
  68550,
];

export function calculateLevelFromXP(xp: number) {
  let level = 1;

  for (let i = 0; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i]) {
      level = i + 1;
    }
  }

  return level;
}

export async function awardXP(
  supabase: any,
  userId: string,
  amount: number
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("user_id", userId)
    .single();

  const currentXP = Number(profile?.xp || 0);
  const newXP = currentXP + amount;
  const newLevel = calculateLevelFromXP(newXP);

  await supabase
    .from("profiles")
    .update({
      xp: newXP,
      level: newLevel,
      last_activity_date: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return {
    xp: newXP,
    level: newLevel,
  };
}