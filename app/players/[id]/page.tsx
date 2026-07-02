import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FollowButton from "./components/FollowButton";
import { isPro } from "@/lib/membership/isPro";
import { getLevelTitle } from "@/lib/campaign/levelTitles";
import ShareProfileButton from "./components/ShareProfileButton";

function badgeRarityClass(rarity?: string) {
  switch (rarity) {
    case "legendary":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "epic":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "rare":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_test_account", false)
    .eq("user_id", id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const proUser = isPro(profile?.membership_tier);

  let isFollowing = false;

  if (user && user.id !== id) {
    const { data: follow } = await supabase
      .from("player_follows")
      .select("id")
      .eq("follower_user_id", user.id)
      .eq("following_user_id", id)
      .single();

    isFollowing = !!follow;
  }

  const { data: rounds } = await supabase
    .from("rounds")
    .select(`
      *,
      courses (
        city,
        state
      )
    `)
    .eq("user_id", id)
    .order("played_at", { ascending: false });

    const rounds18 =
  rounds?.filter((round) => Number(round.holes) === 18) || [];

const rounds9 =
  rounds?.filter((round) => Number(round.holes) === 9) || [];

  const totalPoints =
    rounds?.reduce((sum, round) => sum + Number(round.points || 0), 0) || 0;

  const totalRounds = rounds?.length || 0;

  const totalBirdies =
  rounds?.reduce((sum, round) => sum + Number(round.birdies || 0), 0) || 0;

  const uniqueCoursesPlayed = new Set(
    rounds?.map((round: any) => round.course_id || round.course_name)
  ).size;

  const uniqueCities = new Set<string>();
  const uniqueStates = new Set<string>();

  rounds?.forEach((round: any) => {
    const course = Array.isArray(round.courses)
      ? round.courses[0]
      : round.courses;

    if (course?.city && course?.state) {
      uniqueCities.add(`${course.city}-${course.state}`);
    }

    if (course?.state) {
      uniqueStates.add(course.state);
    }
  });

  const citiesPlayed = uniqueCities.size;
  const statesPlayed = uniqueStates.size;

  const average18 =
  rounds18.length > 0
    ? rounds18.reduce(
        (sum, round) => sum + Number(round.score),
        0
      ) / rounds18.length
    : null;

const best18 =
  rounds18.length > 0
    ? Math.min(...rounds18.map((round) => Number(round.score)))
    : null;

const average9 =
  rounds9.length > 0
    ? rounds9.reduce(
        (sum, round) => sum + Number(round.score),
        0
      ) / rounds9.length
    : null;

const best9 =
  rounds9.length > 0
    ? Math.min(...rounds9.map((round) => Number(round.score)))
    : null;

    const { data: achievements } = await supabase
  .from("user_achievements")
  .select(`
    unlocked_at,
    achievements (
      title
    )
  `)
  .eq("user_id", id)
  .order("unlocked_at", { ascending: false })
  .limit(5);

  const verifiedRounds =
    rounds?.filter((round) => round.trust_level >= 2).length || 0;

  const verifiedPercentage =
    totalRounds > 0 ? (verifiedRounds / totalRounds) * 100 : 0;

  const bestDifferential =
    rounds && rounds.length
      ? Math.min(...rounds.map((round) => Number(round.score_differential)))
      : null;

  const uniqueWeeks = new Set(
    rounds?.map((round) => {
      const date = new Date(round.played_at);
      const year = date.getFullYear();
      const firstDay = new Date(year, 0, 1);

      const days = Math.floor(
        (date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000)
      );

      return `${year}-${Math.ceil((days + firstDay.getDay() + 1) / 7)}`;
    })
  );

  const activeWeeks = uniqueWeeks.size;

  const averageDifferential =
    rounds && rounds.length
      ? (
          rounds.reduce(
            (sum, round) => sum + Number(round.score_differential || 0),
            0
          ) / rounds.length
        ).toFixed(2)
      : null;

  const lastFiveRounds = rounds?.slice(0, 5) || [];

  const recentForm =
    lastFiveRounds.length
      ? (
          lastFiveRounds.reduce(
            (sum, round) => sum + Number(round.score_differential || 0),
            0
          ) / lastFiveRounds.length
        ).toFixed(2)
      : null;

  const topEightRounds =
    rounds
      ?.map((round) => Number(round.score_differential || 0))
      .sort((a, b) => a - b)
      .slice(0, 8) || [];

  const topEightAverage =
    topEightRounds.length
      ? (
          topEightRounds.reduce((sum, diff) => sum + diff, 0) /
          topEightRounds.length
        ).toFixed(2)
      : null;

  const levelInfo = getLevelTitle(Number(profile?.level || 1));

  const { data: leaderboardRounds } = await supabase
  .from("rounds")
  .select(`
    user_id,
    points,
    profiles (
      is_test_account
    )
  `);

const leaderboardPlayers = new Map();

leaderboardRounds?.forEach((round: any) => {
  if (round.profiles?.is_test_account) return;

  const current = leaderboardPlayers.get(round.user_id) || {
    user_id: round.user_id,
    round_points: [],
  };

  current.round_points.push(Number(round.points || 0));

  leaderboardPlayers.set(round.user_id, current);
});

const leaderboard = Array.from(leaderboardPlayers.values())
  .filter((player: any) => player.round_points.length >= 1)
  .map((player: any) => {
    const bestEight = player.round_points
      .sort((a: number, b: number) => b - a)
      .slice(0, 8);

    const rankingScore =
      bestEight.reduce(
        (sum: number, points: number) => sum + points,
        0
      ) / bestEight.length;

    return {
      user_id: player.user_id,
      ranking_score: rankingScore,
    };
  })
  .sort((a: any, b: any) => b.ranking_score - a.ranking_score);

const globalRank =
  leaderboard.findIndex((player: any) => player.user_id === id) + 1;

const totalRankedPlayers = leaderboard.length;

const rankingScore =
  leaderboard.find((player: any) => player.user_id === id)?.ranking_score ||
  0;

const topPercent =
  globalRank > 0 && totalRankedPlayers > 0
    ? Math.max(
        1,
        Math.ceil((globalRank / totalRankedPlayers) * 100)
      )
    : null;

  const { data: earnedBadges } = await supabase
    .from("user_achievements")
    .select(`achievement_key`)
    .eq("user_id", id);

  const achievementKeys =
    earnedBadges?.map((a) => a.achievement_key) || [];

  const { data: badges } = achievementKeys.length
    ? await supabase
        .from("profile_badges")
        .select("*")
        .in("achievement_key", achievementKeys)
        .order("rarity")
    : { data: [] };

  return (
    <main className="min-h-screen p-8">
      <Link href="/leaderboard" className="underline">
        ← Back to Leaderboard
      </Link>

      <section className="mt-6 rounded-xl border p-6">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div className="flex items-center gap-4">
      {profile?.profile_photo_url ? (
        <img
          src={profile.profile_photo_url}
          alt={profile?.display_name || "Player profile"}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-500">
          {(profile?.display_name || "P").charAt(0)}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">
          {profile?.display_name || "Player Profile"}
        </h1>

        <p className="mt-1 text-gray-600">
          {[profile?.city, profile?.state].filter(Boolean).join(", ") ||
            "Location not listed"}
        </p>

        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
            🌎 {globalRank > 0 ? `#${globalRank} Worldwide` : "Not Ranked"}
          </span>

          <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
            🏆 {profile?.division || "Unranked"}
          </span>

          <span className="rounded-full bg-black px-3 py-1 font-semibold text-white">
            {levelInfo.emblem} Level {profile?.level || 1}
          </span>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <Link
        href="/courses-played"
        className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold"
      >
        ⛳ View Golf Map
      </Link>

  <ShareProfileButton playerId={id} />

      {user && user.id !== id && (
        <FollowButton
          currentUserId={user.id}
          targetUserId={id}
          isFollowing={isFollowing}
        />
      )}
    </div>
  </div>

  <div className="mt-6 rounded-xl border bg-gradient-to-br from-white to-green-50 p-6">
    <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
      Ranked Golf Global Rank
    </p>

    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-5xl font-extrabold">
          {globalRank > 0 ? `#${globalRank}` : "--"}
        </p>

        <p className="mt-2 text-sm text-gray-600">
          {totalRankedPlayers > 0
            ? `Among ${totalRankedPlayers} ranked golfers`
            : "Ranking not available yet"}
        </p>
      </div>

      <div className="grid gap-2 text-sm md:text-right">
        <p>
          🏆{" "}
          <strong>
            {topPercent ? `Top ${topPercent}% Worldwide` : "Not ranked yet"}
          </strong>
        </p>

        <p>
          ⭐ <strong>{rankingScore.toFixed(1)}</strong> Ranking Points
        </p>

        <p>
          ⛳ <strong>{totalRounds}</strong> Submitted Rounds
        </p>

        <p>
          ✅ <strong>{verifiedRounds}</strong> Verified Rounds
        </p>
      </div>
    </div>
  </div>

  <div className="mt-6">
    <h2 className="mb-4 text-2xl font-bold">🏆 Career Highlights</h2>

    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">World Rank</p>
        <p className="mt-2 text-2xl font-bold">
          {globalRank > 0 ? `#${globalRank}` : "--"}
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Division</p>
        <p className="mt-2 text-2xl font-bold">
          {profile?.division || "--"}
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Best Differential</p>
        <p className="mt-2 text-2xl font-bold">
          {bestDifferential !== null ? bestDifferential.toFixed(2) : "--"}
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">XP Earned</p>
        <p className="mt-2 text-2xl font-bold">
          {Number(profile?.xp || 0).toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Rounds Submitted</p>
        <p className="mt-2 text-2xl font-bold">{totalRounds}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Courses Played</p>
        <p className="mt-2 text-2xl font-bold">{uniqueCoursesPlayed}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Birdies Recorded</p>
        <p className="mt-2 text-2xl font-bold">{totalBirdies}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Active Weeks</p>
        <p className="mt-2 text-2xl font-bold">{activeWeeks}</p>
      </div>
    </div>
  </div>

  {badges && badges.length > 0 && (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Featured Badges
      </h2>

      <div className="flex flex-wrap gap-2">
        {badges.slice(0, 5).map((badge) => (
          <span
            key={badge.id}
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${badgeRarityClass(
              badge.rarity
            )}`}
          >
            {badge.badge_icon} {badge.badge_name}
          </span>
        ))}
      </div>
    </div>
  )}
</section>

<section className="mt-8">
  <h2 className="mb-4 text-2xl font-bold">
    📈 Career Timeline
  </h2>

  <div className="rounded-xl border divide-y">

    {achievements?.map((achievement: any) => (
      <div
        key={achievement.unlocked_at}
        className="p-4"
      >
        🏆 Unlocked{" "}
        <strong>{achievement.achievements?.title}</strong>

        <p className="text-sm text-gray-500">
          {achievement.unlocked_at}
        </p>
      </div>
    ))}

    {rounds?.slice(0,5).map((round:any)=>(
      <div
        key={round.id}
        className="p-4"
      >
        ⛳ Shot <strong>{round.score}</strong> at{" "}
        <strong>{round.course_name}</strong>

        <p className="text-sm text-gray-500">
          {round.played_at}
        </p>
      </div>
    ))}

  </div>
</section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Recent Rounds</h2>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Course</th>
                <th className="p-3">Score</th>
                <th className="p-3">Diff</th>
                <th className="p-3">Points</th>
                <th className="p-3">Type</th>
                <th className="p-3">Trust</th>
              </tr>
            </thead>

            <tbody>
              {rounds?.map((round) => (
                <tr key={round.id} className="border-t">
                  <td className="p-3">{round.played_at}</td>

                  <td className="p-3">
                    {round.course_id ? (
                      <Link
                        href={`/courses/${round.course_id}`}
                        className="font-semibold underline"
                      >
                        {round.course_name}
                      </Link>
                    ) : (
                      round.course_name
                    )}
                  </td>

                  <td className="p-3">{round.score}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>
                        {Number(round.score_differential).toFixed(2)}
                      </span>

                      {bestDifferential !== null &&
                        Number(round.score_differential) ===
                          bestDifferential && (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            PB
                          </span>
                        )}
                    </div>
                  </td>

                  <td className="p-3">
                    {Number(round.points).toFixed(1)}
                  </td>

                  <td className="p-3 capitalize">{round.round_type}</td>

                  <td className="p-3">
                    {round.trust_level >= 2 ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Peer Verified
                      </span>
                    ) : round.trust_level >= 1 ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                        Proof Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {!rounds?.length && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={7}>
                    No rounds submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}