import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) {
    redirect("/courses");
  }

  const { data: rounds } = await supabase
    .from("rounds")
    .select(`
      *,
      profiles (
        display_name,
        profile_photo_url
      )
    `)
    .eq("course_id", course.id)
    .order("played_at", { ascending: false });

  const topRounds = [...(rounds || [])]
    .sort(
      (a: any, b: any) =>
        Number(a.score_differential) - Number(b.score_differential)
    )
    .slice(0, 10);

  const totalRounds = rounds?.length || 0;
  const bestRound = topRounds?.[0] || null;

  const averageScore =
    totalRounds > 0
      ? rounds!.reduce(
          (sum, round) => sum + Number(round.score || 0),
          0
        ) / totalRounds
      : null;

  const bestScore =
    totalRounds > 0
      ? Math.min(...rounds!.map((round) => Number(round.score)))
      : null;

  const bestDiff =
    totalRounds > 0
      ? Math.min(
          ...rounds!.map((round) =>
            Number(round.score_differential)
          )
        )
      : null;

  const courseLeaderboard =
    rounds
      ?.reduce((acc: any[], round: any) => {
        const existing = acc.find(
          (p) => p.user_id === round.user_id
        );

        if (existing) {
          existing.rounds += 1;
          existing.points += Number(round.points || 0);
          existing.best_score = Math.min(
            existing.best_score,
            Number(round.score)
          );
          existing.best_diff = Math.min(
            existing.best_diff,
            Number(round.score_differential)
          );
        } else {
          acc.push({
            user_id: round.user_id,
            display_name:
              round.profiles?.display_name || "Unknown Player",
            profile_photo_url:
              round.profiles?.profile_photo_url || null,
            rounds: 1,
            points: Number(round.points || 0),
            best_score: Number(round.score),
            best_diff: Number(round.score_differential),
          });
        }

        return acc;
      }, [])
      .sort((a: any, b: any) => a.best_diff - b.best_diff) || [];

  return (
    <main className="min-h-screen p-8">
      <Link href="/courses" className="underline">
        ← Back to Courses
      </Link>

      <section className="mt-6 rounded-xl border p-6">
        <h1 className="text-3xl font-bold">
          {course.name}
        </h1>

        <p className="mt-2 text-gray-600">
          {[course.city, course.state, course.country]
            .filter(Boolean)
            .join(", ")}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Par</h2>
            <p className="mt-2 text-2xl">
              {course.par || "--"}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Rating / Slope</h2>
            <p className="mt-2 text-2xl">
              {course.course_rating || "--"} /{" "}
              {course.slope_rating || "--"}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Rounds Logged</h2>
            <p className="mt-2 text-2xl">{totalRounds}</p>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-bold">Average Score</h2>
            <p className="mt-2 text-2xl">
              {averageScore !== null
                ? averageScore.toFixed(1)
                : "--"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Course Record
          </p>

          <p className="mt-2 text-3xl font-bold">
            {bestRound?.score || "--"}
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {bestRound?.profiles?.display_name ||
              "No rounds yet"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Best Differential
          </p>

          <p className="mt-2 text-3xl font-bold">
            {bestDiff !== null ? bestDiff.toFixed(2) : "--"}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Best Score
          </p>

          <p className="mt-2 text-3xl font-bold">
            {bestScore ?? "--"}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">
          Top Rounds
        </h2>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Player</th>
                <th className="p-3">Score</th>
                <th className="p-3">Diff</th>
                <th className="p-3">Points</th>
                <th className="p-3">Trust</th>
              </tr>
            </thead>

            <tbody>
              {topRounds.map((round: any, index: number) => (
                <tr key={round.id} className="border-t">
                  <td className="p-3 font-bold">
                    #{index + 1}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/players/${round.user_id}`}
                      className="font-semibold underline"
                    >
                      {round.profiles?.display_name ||
                        "Player"}
                    </Link>
                  </td>

                  <td className="p-3">{round.score}</td>

                  <td className="p-3">
                    {Number(
                      round.score_differential
                    ).toFixed(2)}
                  </td>

                  <td className="p-3">
                    {Number(round.points).toFixed(2)}
                  </td>

                  <td className="p-3">
                    {round.trust_level >= 2
                      ? "Peer Verified"
                      : round.trust_level >= 1
                      ? "Proof Submitted"
                      : "Unverified"}
                  </td>
                </tr>
              ))}

              {!topRounds.length && (
                <tr>
                  <td
                    className="p-3 text-gray-500"
                    colSpan={6}
                  >
                    No rounds logged at this course yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">
          Course Leaderboard
        </h2>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Player</th>
                <th className="p-3">Rounds</th>
                <th className="p-3">Best Score</th>
                <th className="p-3">Best Diff</th>
                <th className="p-3">Points</th>
              </tr>
            </thead>

            <tbody>
              {courseLeaderboard.map(
                (player: any, index: number) => (
                  <tr
                    key={player.user_id}
                    className="border-t"
                  >
                    <td className="p-3 font-bold">
  {index === 0
    ? "👑"
    : index === 1
    ? "🥈"
    : index === 2
    ? "🥉"
    : `#${index + 1}`}
</td>

                   <td className="p-3">
  <Link
    href={`/players/${player.user_id}`}
    className="flex items-center gap-2 font-semibold underline"
  >
    {player.profile_photo_url ? (
      <img
        src={player.profile_photo_url}
        alt={player.display_name}
        className="h-8 w-8 rounded-full object-cover"
      />
    ) : (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
        {(player.display_name || "P").charAt(0)}
      </div>
    )}

    {player.display_name}
  </Link>
</td>

                    <td className="p-3">
                      {player.rounds}
                    </td>

                    <td className="p-3">
                      {player.best_score}
                    </td>

                    <td className="p-3">
                      {player.best_diff.toFixed(2)}
                    </td>

                    <td className="p-3">
                      {player.points.toFixed(1)}
                    </td>
                  </tr>
                )
              )}

              {!courseLeaderboard.length && (
                <tr>
                  <td
                    className="p-3 text-gray-500"
                    colSpan={6}
                  >
                    No players ranked at this course yet.
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