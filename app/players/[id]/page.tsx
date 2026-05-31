import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FollowButton from "./components/FollowButton";
import { isPro } from "@/lib/membership/isPro";
import { getLevelTitle } from "@/lib/campaign/levelTitles";

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
    .select("*")
    .eq("user_id", id)
    .order("played_at", { ascending: false });

  const totalPoints =
    rounds?.reduce((sum, round) => sum + Number(round.points || 0), 0) || 0;

    const totalRounds = rounds?.length || 0;

const averageScore =
  totalRounds > 0
    ? rounds!.reduce(
        (sum, round) => sum + Number(round.score || 0),
        0
      ) / totalRounds
    : null;

const bestScore =
  totalRounds > 0
    ? Math.min(
        ...rounds!.map((round) => Number(round.score))
      )
    : null;

const verifiedRounds =
  rounds?.filter((round) => round.trust_level >= 2)
    .length || 0;

    const verifiedPercentage =
  totalRounds > 0
    ? (verifiedRounds / totalRounds) * 100
    : 0;

    const bestDifferential =
  rounds && rounds.length
    ? Math.min(
        ...rounds.map((round) =>
          Number(round.score_differential)
        )
      )
    : null;

    const uniqueWeeks = new Set(
  rounds?.map((round) => {
    const date = new Date(round.played_at);
    const year = date.getFullYear();
    const firstDay = new Date(year, 0, 1);

    const days = Math.floor(
      (date.getTime() - firstDay.getTime()) /
        (24 * 60 * 60 * 1000)
    );

    return `${year}-${Math.ceil((days + firstDay.getDay() + 1) / 7)}`;
  })
);

const activeWeeks = uniqueWeeks.size;

const averageDifferential =
  rounds && rounds.length
    ? (
        rounds.reduce(
          (sum, round) =>
            sum +
            Number(round.score_differential || 0),
          0
        ) / rounds.length
      ).toFixed(2)
    : null;

    const lastFiveRounds = rounds?.slice(0, 5) || [];

const recentForm =
  lastFiveRounds.length
    ? (
        lastFiveRounds.reduce(
          (sum, round) =>
            sum +
            Number(round.score_differential || 0),
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

const { data: earnedBadges } = await supabase
  .from("user_achievements")
  .select(`
    achievement_key
  `)
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

    {badges && badges.length > 0 && (
  <div className="mt-4">
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

    {user && user.id !== id && (
  <FollowButton
    currentUserId={user.id}
    targetUserId={id}
    isFollowing={isFollowing}
  />
)}

    <p className="text-gray-600">
      {[profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not listed"}
    </p>

    {badges && badges.length > 0 && (
  <div className="mt-4">
    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
      Featured Badges
    </h2>

    <div className="flex flex-wrap gap-2">
      {badges.slice(0, 5).map((badge) => (
        <span
          key={badge.id}
          className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800"
        >
          {badge.badge_icon} {badge.badge_name}
        </span>
      ))}
    </div>
  </div>
)}
  </div>
</div>

<div className="rounded border p-3">
  <p className="text-gray-500">Membership</p>

  <div className="mt-2">
    {profile?.membership_tier === "competitive" ? (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        COMPETITIVE
      </span>
    ) : profile?.membership_tier === "pro" ? (
      <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
        PRO
      </span>
    ) : (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        FREE
      </span>
    )}
  </div>
</div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
  <div className="rounded border p-3">
    <p className="text-gray-500">Home Course</p>
    <p className="font-semibold">{profile?.home_course || "--"}</p>
  </div>

  <div className="rounded border p-3">
    <p className="text-gray-500">Golfer Type</p>
    <p className="font-semibold">{profile?.golfer_type || "--"}</p>
  </div>

  <div className="rounded border p-3">
    <p className="text-gray-500">Favorite Course</p>
    <p className="font-semibold">{profile?.favorite_course || "--"}</p>
  </div>
</div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
  <div className="rounded-xl border p-4">
    <h2 className="font-bold">Rounds</h2>
    <p className="mt-2 text-2xl">
      {totalRounds}
    </p>
  </div>

  <div className="rounded-xl border p-4">
    <h2 className="font-bold">Average Score</h2>
    <p className="mt-2 text-2xl">
      {averageScore
        ? averageScore.toFixed(1)
        : "--"}
    </p>
  </div>

  <div className="rounded-xl border p-4">
    <h2 className="font-bold">Best Score</h2>
    <p className="mt-2 text-2xl">
      {bestScore ?? "--"}
    </p>
  </div>

  <div className="rounded-xl border p-4">
    <h2 className="font-bold">
      Verified %
    </h2>
    <p className="mt-2 text-2xl">
      {verifiedPercentage.toFixed(0)}%
    </p>
  </div>
</div>

   <div className="mt-6 rounded-xl border p-5">
  <h2 className="text-xl font-bold">
    Player Credentials
  </h2>

  <div className="mt-4 grid gap-4 md:grid-cols-4">
    <div>
      <p className="text-sm text-gray-500">
        Division
      </p>

      <p className="mt-1 font-semibold">
        {profile?.division || "--"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Ranked Golf Index
      </p>

      <p className="mt-1 font-semibold">
        {profile?.ranked_golf_index?.toFixed(2) ||
          "--"}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Verification Tier
      </p>

      <p className="mt-1">
        {verifiedPercentage >= 75 ? (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
            Highly Verified
          </span>
        ) : verifiedPercentage >= 30 ? (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
            Partially Verified
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
            Low Verification
          </span>
        )}
      </p>
    </div>

    <div>
      <p className="text-sm text-gray-500">
        Verified Rounds
      </p>

      <p className="mt-1 font-semibold">
        {verifiedRounds} / {totalRounds}
      </p>
    </div>
  </div>
</div>

<div className="mt-6 grid gap-4 md:grid-cols-3">
  {proUser ? (
    <>
      <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
        <h2 className="font-bold">
          Avg Differential
        </h2>

        <p className="mt-2 text-2xl">
          {averageDifferential || "--"}
        </p>
      </div>

      <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
        <h2 className="font-bold">
          Recent Form
        </h2>

        <p className="mt-2 text-2xl">
          {recentForm || "--"}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Last 5 rounds
        </p>
      </div>

      <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
        <h2 className="font-bold">
          Top 8 Average
        </h2>

        <p className="mt-2 text-2xl">
          {topEightAverage || "--"}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Best differentials used for ranking strength
        </p>
      </div>
    </>
  ) : (
    <div className="rounded-xl border border-dashed bg-gray-50 p-4 md:col-span-3">
      <h2 className="font-bold">
        Pro Stats
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Unlock average differential, recent form,
        top 8 averages, and historical performance
        trends with Ranked Golf Pro.
      </p>

      <Link
        href="/pricing"
        className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        View Memberships
      </Link>
    </div>
  )}
</div>

        <p className="mt-2 text-gray-600">
          {[profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not listed"}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Total Points</h2>
            <p className="mt-2 text-2xl">{totalPoints.toFixed(1)}</p>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Rounds</h2>
            <p className="mt-2 text-2xl">{rounds?.length || 0}</p>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Ranked Golf Index</h2>
            <p className="mt-2 text-2xl">
              {profile?.ranked_golf_index ?? "--"}
            </p>
          </div>

          <div className="rounded-xl border p-4">
  <h2 className="font-bold">Campaign Level</h2>

  <p className="mt-2 text-2xl">
    {levelInfo.emblem} Level {profile?.level || 1}
  </p>

  <p className="mt-1 text-sm text-gray-600">
    {levelInfo.title} · {profile?.xp || 0} XP
  </p>
</div>

          <div className="rounded-xl border p-4">
  <h2 className="font-bold">Active Weeks</h2>
  <p className="mt-2 text-2xl">{activeWeeks}</p>
</div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Division</h2>
            <p className="mt-2 text-2xl">{profile?.division || "--"}</p>
          </div>
        </div>

        {profile?.bio && (
          <div className="mt-6">
            <h2 className="font-bold">Bio</h2>
            <p className="mt-2 text-gray-700">{profile.bio}</p>
          </div>
        )}
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
    <Link href={`/courses/${round.course_id}`} className="font-semibold underline">
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
      Number(round.score_differential) === bestDifferential && (
        <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          PB
        </span>
      )}
  </div>
</td>
                  <td className="p-3">{Number(round.points).toFixed(1)}</td>
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