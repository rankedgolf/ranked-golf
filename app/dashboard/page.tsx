import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../auth/actions";
import { recalculateRankedGolfIndex } from "@/lib/rankings/recalculateRankedGolfIndex";
import ManageSubscriptionButton from "@/app/components/ManageSubscriptionButton";
import InviteFriendsButton from "@/app/components/InviteFriendsButton";
import { getLevelTitle } from "@/lib/campaign/levelTitles";
import { levelThresholds } from "@/lib/campaign/awardXP";

export const dynamic = "force-dynamic";

async function deleteRound(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser = user || session?.user;

  if (!currentUser) redirect("/login");

  const currentUserId = currentUser.id;

  const roundId = String(formData.get("round_id"));

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", roundId)
    .eq("user_id", currentUserId)
    .single();

  if (!round) redirect("/dashboard");

  if (round.trust_level >= 2) {
    redirect("/dashboard?error=round_locked");
  }

  await supabase
    .from("rounds")
    .delete()
    .eq("id", roundId)
    .eq("user_id", currentUserId);

  redirect("/dashboard");
}

export default async function DashboardPage({
  searchParams,
}: {
searchParams: Promise<{
  error?: string;
  checkout?: string;
  achievements?: string;
}>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser = user || session?.user;

  if (!currentUser) redirect("/login");

  const currentUserId = currentUser.id;
  const currentUserEmail = currentUser.email || "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", currentUserId)
    .single();

  const { data: leaderboardProfiles } = await supabase
    .from("profiles")
    .select("id, ranked_golf_index")
    .not("ranked_golf_index", "is", null)
    .order("ranked_golf_index", { ascending: true });

  const playerRank =
    (leaderboardProfiles?.findIndex(
      (p) => p.id === profile?.id
    ) ?? -1) + 1;

  const { data: rounds } = await supabase
    .from("rounds")
    .select(`
      *,
      seasons (
        name
      ),
      events (
        title,
        slug
      )
    `)
    .eq("user_id", currentUserId)
    .order("played_at", { ascending: false });

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
            sum + Number(round.score_differential || 0),
          0
        ) / lastFiveRounds.length
      ).toFixed(2)
    : null;

    const recentFormNumber = Number(recentForm || 0);

const overallAverageNumber = Number(
  averageDifferential || 0
);

const trendDifference =
  overallAverageNumber - recentFormNumber;

  let trendLabel = "Stable";
let trendColor = "text-gray-600";
let trendIcon = "→";

if (trendDifference >= 1) {
  trendLabel = "Trending Up";
  trendColor = "text-green-700";
  trendIcon = "↓";
} else if (trendDifference <= -1) {
  trendLabel = "Cooling Off";
  trendColor = "text-red-700";
  trendIcon = "↑";
}

const recentDiffs =
  rounds
    ?.slice(0, 3)
    .map((round) =>
      Number(round.score_differential || 0)
    ) || [];

const isHotStreak =
  recentDiffs.length === 3 &&
  recentDiffs[0] < recentDiffs[1] &&
  recentDiffs[1] < recentDiffs[2];

    const bestDifferential =
  rounds && rounds.length
    ? Math.min(
        ...rounds.map((round) =>
          Number(round.score_differential)
        )
      )
    : null;

    const latestRound = rounds?.[0];

const isRecentPB =
  latestRound &&
  bestDifferential !== null &&
  Number(latestRound.score_differential) ===
    bestDifferential;

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

const { data: following } = await supabase
  .from("player_follows")
  .select("following_user_id")
  .eq("follower_user_id", currentUserId);

const followingIds =
  following?.map(
    (follow) => follow.following_user_id
  ) || [];

const networkUserIds = [
  ...followingIds,
  currentUserId,
];

const { data: networkProfiles } = networkUserIds.length
  ? await supabase
      .from("profiles")
      .select("user_id, display_name, ranked_golf_index")
      .in("user_id", networkUserIds)
      .not("ranked_golf_index", "is", null)
  : { data: [] };

const followingRankings =
  networkProfiles
    ?.sort(
      (a, b) =>
        Number(a.ranked_golf_index) -
        Number(b.ranked_golf_index)
    ) || [];

const followingRank =
  followingRankings.findIndex(
    (player) => player.user_id === currentUserId
  ) + 1;

  const currentPlayer =
  followingRankings.find(
    (player) => player.user_id === currentUserId
  );

const closestRival =
  followingRankings.find(
    (player) =>
      player.user_id !== currentUserId &&
      Math.abs(
        Number(player.ranked_golf_index) -
          Number(currentPlayer?.ranked_golf_index || 0)
      ) <= 3
  );

  const { data: suggestedGolfers } = await supabase
  .from("profiles")
  .select(`
    user_id,
    username,
    display_name,
    state,
    division,
    ranked_golf_index
  `)
  .neq("user_id", currentUserId)
  .limit(6);

const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?ref=${profile?.username || currentUserId}`;

  const { data: myEvents } = await supabase
    .from("event_registrations")
    .select(`
      *,
      events (
        title,
        slug,
        start_date,
        end_date
      )
    `)
    .eq("user_id", currentUserId)
    .order("created_at", { ascending: false });

  const { data: pendingVerifications } = await supabase
    .from("round_peer_verifications")
    .select("*")
    .eq("verifier_email", currentUserEmail.toLowerCase())
    .eq("verification_status", "pending");

  const totalPoints =
    rounds?.reduce(
      (sum, round) => sum + Number(round.points || 0),
      0
    ) || 0;

    const hasProfile =
  !!profile?.display_name;

const hasRounds =
  (rounds?.length || 0) > 0;

const hasRanking =
  rounds && rounds.length >= 3;

const followingCount =
  followingIds.length;

const hasFollows =
  followingCount >= 3;

const hasEvents =
  (myEvents?.length || 0) > 0;

const onboardingSteps = [
  hasProfile,
  hasRounds,
  hasFollows,
  hasEvents,
  hasRanking,
];

const completedSteps =
  onboardingSteps.filter(Boolean).length;

const onboardingProgress = Math.round(
  (completedSteps / onboardingSteps.length) * 100
);

const levelInfo = getLevelTitle(Number(profile?.level || 1));

const currentXP = Number(profile?.xp || 0);
const currentLevel = Number(profile?.level || 1);

const currentLevelXP =
  levelThresholds[currentLevel - 1] || 0;

const nextLevelXP =
  levelThresholds[currentLevel] || currentLevelXP + 1000;

const xpIntoLevel = currentXP - currentLevelXP;
const xpNeededForLevel = nextLevelXP - currentLevelXP;

const xpProgress = Math.min(
  100,
  Math.round((xpIntoLevel / xpNeededForLevel) * 100)
);

const { data: recentUnlocks } = await supabase
  .from("user_achievements")
  .select("achievement_key, unlocked_at")
  .eq("user_id", currentUserId)
  .order("unlocked_at", { ascending: false })
  .limit(5);

const achievementKeys =
  recentUnlocks?.map((item) => item.achievement_key) || [];

const { data: recentAchievementDetails } =
  achievementKeys.length
    ? await supabase
        .from("achievements")
        .select("key, name, xp_reward, category, icon")
        .in("key", achievementKeys)
    : { data: [] };

const unlockedAchievements =
  recentUnlocks?.map((unlock) => ({
    ...unlock,
    achievement: recentAchievementDetails?.find(
      (achievement) =>
        achievement.key === unlock.achievement_key
    ),
  })) || [];

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Player Dashboard
          </h1>

          <p className="text-gray-600">
            Welcome, {profile?.display_name || currentUserEmail}
          </p>

          {isRecentPB && (
  <div className="mt-6 rounded-xl border bg-green-50 p-4">
    <p className="text-sm font-semibold text-green-700">
      New Personal Best 🔥
    </p>

    <p className="mt-1 text-sm text-green-800">
      Your latest round is now your best Ranked Golf differential.
    </p>
  </div>
)}

          <p className="mt-1 text-sm font-semibold text-green-700">
            {activeSeason?.name || "Current Season"}
          </p>
        </div>

       <form action={logout} className="w-full md:w-auto">
  <button className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-black px-6 py-3 text-center font-semibold text-white md:w-auto">
    Log Out
  </button>
</form>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/submit-round"
          className="inline-block rounded bg-green-700 px-4 py-2 font-semibold text-white"
        >
          Submit Round
        </Link>

        <Link
          href="/profile"
          className="inline-block rounded border px-4 py-2 font-semibold"
        >
          Edit Profile
        </Link>

        <Link
          href="/leaderboard"
          className="inline-block rounded border px-4 py-2 font-semibold"
        >
          View Leaderboard
        </Link>

        <Link
          href="/feed"
          className="inline-block rounded border px-4 py-2 font-semibold"
        >
          Recent Activity
        </Link>

        <Link
  href="/achievements"
  className="inline-block rounded border px-4 py-2 font-semibold"
>
  Achievements
</Link>

<Link
  href="/xp-leaderboard"
  className="inline-block rounded border px-4 py-2 font-semibold"
>
  XP Rankings
</Link>

        <Link
          href={`/players/${currentUserId}`}
          className="inline-block rounded border px-4 py-2 font-semibold"
        >
          View My Public Profile
        </Link>

           {profile?.membership_tier !== "free" && (
  <ManageSubscriptionButton />
)}
      </div>

{completedSteps < 4 && (
  <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
<div className="rounded-xl bg-white p-4">
  {hasProfile ? "✅" : "⬜"}{" "}
  <Link href="/profile" className="font-semibold underline">
    Complete your player profile
  </Link>
</div>

<div className="rounded-xl bg-white p-4">
  {hasRounds ? "✅" : "⬜"}{" "}
  <Link href="/submit-round" className="font-semibold underline">
    Submit your first ranked round
  </Link>
</div>

<div className="rounded-xl bg-white p-4">
  {hasFollows ? "✅" : "⬜"}{" "}
  <Link href="/players" className="font-semibold underline">
    Follow 3 golfers
  </Link>
</div>

<div className="rounded-xl bg-white p-4">
  {hasEvents ? "✅" : "⬜"}{" "}
  <Link href="/events" className="font-semibold underline">
    Join your first event
  </Link>
</div>

<div className="rounded-xl bg-white p-4 md:col-span-2">
  {hasRanking ? "✅" : "⬜"}{" "}
  <Link href="/submit-round" className="font-semibold underline">
    Submit 3 rounds to unlock your Ranked Golf Index & World Ranking
  </Link>
</div>
  </section>
)}

<section className="mt-8 rounded-2xl border bg-gradient-to-br from-green-50 to-white p-6">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-2xl font-bold">
        Invite Golf Friends ⛳
      </h2>

      <p className="mt-2 max-w-2xl text-sm text-gray-600">
        Ranked Golf is better with competition.
        Invite friends to build rivalries,
        compare stats, and climb the rankings together.
      </p>
    </div>

    <InviteFriendsButton inviteLink={inviteLink} />
  </div>
</section>

      {params.error === "round_locked" && (
  <div className="mt-6 rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
    This round is locked because it has already been peer verified.
  </div>
)}

{params.checkout === "success" && (
  <div className="mt-6 rounded-xl border bg-green-50 p-4 text-sm text-green-800">
    <p className="font-semibold">
      Membership activated 🔥
    </p>

    <p className="mt-1">
      Your Ranked Golf premium features are now unlocked.
    </p>
  </div>
)}

{params.achievements && (
  <Link
    href="/achievements"
    className="mt-6 block rounded-xl border bg-green-50 p-4 text-sm text-green-800 transition hover:bg-green-100"
  >
    <p className="font-semibold">
      Achievement Unlocked 🏆
    </p>

    <p className="mt-1">
      You unlocked {params.achievements} new achievement
      {Number(params.achievements) > 1 ? "s" : ""}. View your achievements →
    </p>
  </Link>
)}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
  <h2 className="font-bold">Membership</h2>

  <p className="mt-2 text-3xl font-bold capitalize">
    {profile?.membership_tier || "free"}
  </p>
</div>

        <div className="rounded-xl border p-5">
          <h2 className="font-bold">Ranked Golf Global Rank</h2>

          <p className="mt-2 text-3xl font-bold">
            {playerRank > 0 ? `#${playerRank}` : "--"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-bold">
            Ranked Golf Index
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {profile?.ranked_golf_index
              ? Number(
                  profile.ranked_golf_index
                ).toFixed(2)
              : "--"}
          </p>
        </div>

  <div className="rounded-xl border p-5">
  <h2 className="font-bold">Campaign Level</h2>

  <p className="mt-2 text-3xl font-bold">
    {levelInfo.emblem} Level {currentLevel}
  </p>

  <p className="mt-1 text-sm text-gray-600">
    {levelInfo.title} · {currentXP} XP
  </p>

  <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
    <div
      className="h-full rounded-full bg-green-700"
      style={{ width: `${xpProgress}%` }}
    />
  </div>

  <p className="mt-2 text-xs text-gray-500">
    {xpIntoLevel} / {xpNeededForLevel} XP to Level {currentLevel + 1}
  </p>
</div>

        {profile?.membership_tier === "pro" || profile?.membership_tier === "competitive" ? (
  <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
    <h2 className="font-bold">Recent Form</h2>
    <p className="mt-2 text-3xl font-bold">{recentForm || "--"}</p>
    <p className="mt-1 text-sm text-gray-600">Last 5 rounds</p>
    <p className={`mt-2 text-sm font-semibold ${trendColor}`}>
  {trendIcon} {trendLabel}
</p>
<p className="mt-1 text-sm text-gray-500">
  {Math.abs(trendDifference).toFixed(1)} strokes vs overall average
</p>
{isHotStreak && (
  <div className="mt-3 rounded-lg bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-700">
    🔥 Hot Streak
  </div>
)}
  </div>
) : null}

  {profile?.membership_tier === "pro" || profile?.membership_tier === "competitive" ? (
  <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
    <h2 className="font-bold">Following Rank</h2>

    <p className="mt-2 text-3xl font-bold">
      {followingRank > 0 ? `#${followingRank}` : "--"}
    </p>

    <p className="mt-1 text-sm text-gray-600">
      {followingRankings.length
        ? `Among ${followingRankings.length} golfers`
        : "Follow players to compare"}
    </p>
  </div>
) : (
  <div className="rounded-xl border border-dashed bg-gray-50 p-5">
    <h2 className="font-bold">Following Rank</h2>

    <p className="mt-2 text-sm text-gray-600">
      Upgrade to Pro to see how you rank against the golfers you follow.
    </p>

    <Link
      href="/pricing"
      className="mt-3 inline-flex text-sm font-semibold underline"
    >
      View Memberships
    </Link>
  </div>
)}

<div className="rounded-xl border p-5">
          <h2 className="font-bold">
            Season Points
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {totalPoints.toFixed(1)}
          </p>
        </div>

{profile?.membership_tier === "pro" ||
profile?.membership_tier === "competitive" ? (
  <div className="rounded-xl border border-black bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
    <h2 className="font-bold">Closest Rival</h2>

    {closestRival ? (
      <>
        <p className="mt-2 text-2xl font-bold">
          {closestRival.display_name}
        </p>

        <p className="mt-1 text-sm text-gray-600">
          Rival battle forming 👀
        </p>
      </>
    ) : (
      <p className="mt-2 text-sm text-gray-600">
        Follow more golfers to build rivalries.
      </p>
    )}
  </div>
) : null}

        <div className="rounded-xl border p-4">
  <h2 className="font-bold">Active Weeks</h2>

  <p className="mt-2 text-2xl">
    {activeWeeks}
  </p>
</div>

        <div className="rounded-xl border p-5">
          <h2 className="font-bold">
            Pending Verifications
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {pendingVerifications?.length || 0}
          </p>

          <Link
            href="/verify-rounds"
            className="mt-2 inline-block text-sm underline"
          >
            Review
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">
          Recent Activity
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">
              Latest Round
            </p>

            <p className="mt-2 text-xl font-bold">
              {rounds?.[0]?.score || "--"}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {rounds?.[0]?.course_name ||
                "No rounds yet"}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">
              Best Differential
            </p>

            <p className="mt-2 text-xl font-bold">
              {rounds?.length
                ? Math.min(
                    ...rounds.map((r) =>
                      Number(r.score_differential)
                    )
                  ).toFixed(2)
                : "--"}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">
              Total Ranking Points
            </p>

            <p className="mt-2 text-xl font-bold">
              {rounds?.length
                ? rounds
                    .reduce(
                      (sum, r) =>
                        sum + Number(r.points),
                      0
                    )
                    .toFixed(1)
                : "--"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-2xl font-bold">Recent Achievements</h2>

    <Link href="/achievements" className="text-sm font-semibold underline">
      View All
    </Link>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    {unlockedAchievements?.map((item: any) => (
      <div key={item.unlocked_at} className="rounded-xl border p-5">
        <p className="text-2xl">
          {item.achievement?.icon || "🏅"}
        </p>

        <h3 className="mt-2 font-bold">
          {item.achievement?.name}
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          +{item.achievement?.xp_reward || 0} XP
        </p>
      </div>
    ))}

    {!unlockedAchievements?.length && (
      <div className="rounded-xl border p-5 text-gray-600">
        Submit rounds, verify scores, and complete milestones to unlock achievements.
      </div>
    )}
  </div>

  <Link
  href="/campaign"
  className="block rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
>
  <div className="flex items-center justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold">
        Summer 2026 Challenge Pass
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Complete daily missions, earn XP, unlock challenges, and climb the season grind.
      </p>
    </div>

    <div className="text-sm font-semibold text-green-600">
      View Campaign →
    </div>
  </div>
</Link>
</section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">
          My Rounds
        </h2>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Season</th>
                <th className="p-3">Course</th>
                <th className="p-3">Score</th>
                <th className="p-3">Diff</th>
                <th className="p-3">Points</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Event</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rounds?.map((round) => (
                <tr key={round.id} className="border-t">
                  <td className="p-3">
                    {round.played_at}
                  </td>

                  <td className="p-3">
                    {round.seasons?.name ||
                      "All-Time"}
                  </td>

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

                  <td className="p-3">
                    {round.score}
                  </td>

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

                  <td className="p-3">
                    {Number(round.points).toFixed(1)}
                  </td>

                  <td className="p-3 capitalize">
                    {round.round_type}
                  </td>

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

                  <td className="p-3">
                    {round.events ? (
                      <Link
                        href={`/events/${round.events.slug}`}
                        className="font-semibold underline"
                      >
                        {round.events.title}
                      </Link>
                    ) : (
                      "--"
                    )}
                  </td>

                  <td className="p-3">
<div className="flex items-center gap-2">
  {round.trust_level < 2 ? (
    <Link
      href={`/rounds/${round.id}/edit`}
      className="rounded bg-black px-3 py-1 text-xs font-semibold text-white"
    >
      Edit
    </Link>
  ) : (
    <span className="rounded bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
      Locked
    </span>
  )}

  {round.trust_level < 2 && (
    <form action={deleteRound}>
      <input type="hidden" name="round_id" value={round.id} />

   <button
  type="submit"
  className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white"
>
  Delete
</button>
    </form>
  )}
</div>
</td>
                </tr>
              ))}

              {!rounds?.length && (
                <tr>
                  <td
                    className="p-3 text-gray-500"
                    colSpan={10}
                  >
                    No rounds submitted yet. Submit your first round to unlock your Ranked Golf Index, trends, and leaderboard placement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

        <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">
          My Events
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {myEvents?.map((registration) => (
            <Link
              key={registration.id}
              href={`/events/${registration.events?.slug}`}
              className="rounded-xl border p-5 transition hover:bg-gray-50"
            >
              <h3 className="text-xl font-bold">
                {registration.events?.title}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {registration.events?.start_date} —{" "}
                {registration.events?.end_date}
              </p>
            </Link>
          ))}

          {!myEvents?.length && (
            <div className="rounded-xl border p-5 text-gray-600">
              You are not registered for any events yet.
            </div>
          )}
        </div>
      </section>

          <section className="mt-8 rounded-2xl border bg-white p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold">
        Suggested Golfers
      </h2>

      <p className="mt-1 text-sm text-gray-600">
        Build rivalries and compare rankings.
      </p>
    </div>

    <Link
      href="/players"
      className="text-sm font-semibold underline"
    >
      View All
    </Link>
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-2">
    {suggestedGolfers?.map((golfer) => (
      <div
        key={golfer.user_id}
        className="rounded-xl border p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/players/${golfer.username || golfer.user_id}`}
              className="font-bold underline"
            >
              {golfer.display_name || "Player"}
            </Link>

            <p className="mt-1 text-sm text-gray-600">
              {[golfer.state, golfer.division]
                .filter(Boolean)
                .join(" • ")}
            </p>

            <p className="mt-2 text-sm">
              Ranked Golf Index:{" "}
              <span className="font-semibold">
                {golfer.ranked_golf_index || "--"}
              </span>
            </p>
          </div>

          <Link
            href={`/players/${golfer.username || golfer.user_id}`}
            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-gray-50"
          >
            View
          </Link>
        </div>
      </div>
    ))}
  </div>
</section>
    </main>
  );
}