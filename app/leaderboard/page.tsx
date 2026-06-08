import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LeaderboardFilters from "./LeaderboardFilters";
import { isPro } from "@/lib/membership/isPro";
import { getDivisionFromIndex } from "@/lib/rankings/divisions";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    season?: string;
    round_type?: string;
    trust?: string;
    division?: string;
    state?: string;
    following?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership_tier")
    .eq("user_id", user?.id)
    .single();

  const proUser = isPro(profile?.membership_tier);

  let followingIds: string[] = [];

  if (user && params.following === "true") {
    const { data: follows } = await supabase
      .from("player_follows")
      .select("following_user_id")
      .eq("follower_user_id", user.id);

    followingIds =
      follows?.map((follow) => follow.following_user_id) || [];
  }

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  let query = supabase.from("rounds").select(`
    user_id,
    points,
    score_differential,
    round_type,
    verification_status,
    trust_level,
    season_id,
    profiles (
  display_name,
  city,
  state,
  ranked_golf_index,
  is_test_account
)
  `);

  if (params.season !== "all" && activeSeason?.id) {
    query = query.eq("season_id", activeSeason.id);
  }

  if (params.round_type && proUser) {
    query = query.eq("round_type", params.round_type);
  }

  if (params.trust && proUser) {
    query = query.gte("trust_level", Number(params.trust));
  }

  if (params.following === "true" && proUser && followingIds.length > 0) {
    query = query.in("user_id", followingIds);
  }

  if (params.following === "true" && proUser && followingIds.length === 0) {
    query = query.eq("user_id", "__no_following__");
  }

  const { data: rounds } = await query;

  const players = new Map();

  rounds?.forEach((round: any) => {
    const current = players.get(round.user_id) || {
      user_id: round.user_id,
      display_name:
        round.profiles?.display_name || "Unknown Player",
      city: round.profiles?.city,
      state: round.profiles?.state,
        is_test_account: round.profiles?.is_test_account,
      division: getDivisionFromIndex(
  Number(round.profiles?.ranked_golf_index)
),
      total_points: 0,
      ranking_score: 0,
      rounds_count: 0,
      best_differential: null,
      average_trust_level: 0,
      trust_total: 0,
      round_points: [],
    };

    current.total_points += Number(round.points || 0);
    current.round_points.push(Number(round.points || 0));
    current.rounds_count += 1;
    current.trust_total += Number(round.trust_level || 0);

    current.average_trust_level =
      current.trust_total / current.rounds_count;

    const diff = Number(round.score_differential);

    if (
      current.best_differential === null ||
      diff < current.best_differential
    ) {
      current.best_differential = diff;
    }

    players.set(round.user_id, current);
  });

  const leaderboard = Array.from(players.values())
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
        ...player,
        ranking_score: rankingScore,
        counting_rounds: bestEight.length,
      };
    })
    .filter((player: any) => player.rounds_count >= 3)
    .filter((player: any) => !player.is_test_account)
    .filter((player: any) =>
      params.division
        ? player.division === params.division
        : true
    )
    .filter((player: any) =>
      params.state
        ? String(player.state || "").toLowerCase() ===
          params.state.toLowerCase()
        : true
    )
    .sort(
      (a: any, b: any) => b.ranking_score - a.ranking_score
    );

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Ranked Golf World Leaderboard
          </h1>

          <p className="text-gray-600">
            {activeSeason?.name || "Current Season"} Rankings
          </p>

          <div className="mt-4 flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-4">
            <Link href="/dashboard" className="underline">
              Dashboard
            </Link>

            <Link href="/feed" className="underline">
              Activity Feed
            </Link>
          </div>
        </div>
      </div>

      {(params.round_type || params.trust || params.following === "true") &&
        !proUser && (
          <div className="mb-4 rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
            Advanced leaderboard filters are a Pro feature.{" "}
            <Link href="/pricing" className="font-semibold underline">
              View memberships
            </Link>
          </div>
        )}

      <LeaderboardFilters />

      {params.following === "true" && proUser && !followingIds.length && (
        <div className="mb-4 rounded-xl border p-4 text-sm text-gray-600">
          Follow players to build your personalized leaderboard.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Player</th>
              <th className="p-3">Location</th>
              <th className="p-3">Division</th>
              <th className="p-3">Rounds</th>
              <th className="p-3">Best Diff</th>
              <th className="p-3">Avg Trust</th>
              <th className="p-3">Ranking</th>
              <th className="p-3">Counting</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.map((player: any, index: number) => (
              <tr key={player.user_id} className="border-t">
                <td className="p-3 font-bold">#{index + 1}</td>

                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/players/${player.user_id}`}
                      className="font-semibold underline"
                    >
                      {player.display_name}
                    </Link>

                    {player.average_trust_level >= 2 ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Verified
                      </span>
                    ) : player.average_trust_level >= 1 ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                        Proof
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        Unverified
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3">
                  {[player.city, player.state]
                    .filter(Boolean)
                    .join(", ") || "--"}
                </td>

                <td className="p-3">{player.division || "--"}</td>

                <td className="p-3">{player.rounds_count}</td>

                <td className="p-3">
                  {player.best_differential !== null
                    ? player.best_differential.toFixed(2)
                    : "--"}
                </td>

                <td className="p-3">
                  {player.average_trust_level.toFixed(1)}
                </td>

                <td className="p-3 font-semibold">
                  {player.ranking_score.toFixed(2)}
                </td>

                <td className="p-3">{player.counting_rounds}/8</td>
              </tr>
            ))}

            {!leaderboard.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={9}>
                  No players match these filters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}