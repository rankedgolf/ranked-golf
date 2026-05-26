import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LeaderboardFilters from "./LeaderboardFilters";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{
  season?: string;
  round_type?: string;
  trust?: string;
  division?: string;
  state?: string;
}>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

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
      division
    )
  `);

  if (params.season !== "all" && activeSeason?.id) {
  query = query.eq("season_id", activeSeason.id);
}

  if (params.round_type) {
    query = query.eq("round_type", params.round_type);
  }

  if (params.trust) {
    query = query.gte("trust_level", Number(params.trust));
  }

  const { data: rounds } = await query;

  const players = new Map();

  rounds?.forEach((round: any) => {
    const current = players.get(round.user_id) || {
      user_id: round.user_id,
      display_name: round.profiles?.display_name || "Unknown Player",
      city: round.profiles?.city,
      state: round.profiles?.state,
      division: round.profiles?.division,
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
    current.average_trust_level = current.trust_total / current.rounds_count;

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
      bestEight.reduce((sum: number, points: number) => sum + points, 0) /
      bestEight.length;

    return {
      ...player,
      ranking_score: rankingScore,
      counting_rounds: bestEight.length,
    };
  })
  .filter((player: any) => player.rounds_count >= 3)
  .filter((player: any) =>
    params.division ? player.division === params.division : true
  )
  .filter((player: any) =>
    params.state
      ? String(player.state || "").toLowerCase() === params.state.toLowerCase()
      : true
  )
  .sort((a: any, b: any) => b.ranking_score - a.ranking_score);

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ranked Golf World Rankings</h1>
          <p className="text-gray-600">
  {activeSeason?.name || "Current Season"} Rankings
</p>
        </div>

        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>

        <Link href="/feed" className="underline">
  Activity Feed
</Link>
      </div>

      <LeaderboardFilters />

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
            {leaderboard.map((player, index) => (
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
                  {[player.city, player.state].filter(Boolean).join(", ") ||
                    "--"}
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

<td className="p-3">
  {player.counting_rounds}/8
</td>
              </tr>
            ))}

            {!leaderboard.length && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={8}>
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