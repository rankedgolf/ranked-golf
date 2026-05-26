import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { count: roundCount } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true });

  const { count: courseCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });

  const { count: playerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: recentRounds } = await supabase
    .from("rounds")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-700">
          Ranked Golf
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          The competitive ranking system for real golfers.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Submit real rounds, earn ranking points, climb leaderboards, and see
          where your game stacks up against golfers everywhere.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded bg-black px-6 py-3 font-semibold text-white"
          >
            Join the Rankings
          </Link>

          <Link
            href="/leaderboard"
            className="rounded border px-6 py-3 font-semibold"
          >
            View Leaderboard
          </Link>

          <Link
            href="/feed"
            className="rounded border px-6 py-3 font-semibold"
          >
            Recent Activity
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 md:grid-cols-3">
        <div className="rounded-xl border p-5 text-center">
          <p className="text-3xl font-bold">{playerCount || 0}</p>
          <p className="text-sm text-gray-600">Players</p>
        </div>

        <div className="rounded-xl border p-5 text-center">
          <p className="text-3xl font-bold">{roundCount || 0}</p>
          <p className="text-sm text-gray-600">Rounds Submitted</p>
        </div>

        <div className="rounded-xl border p-5 text-center">
          <p className="text-3xl font-bold">{courseCount || 0}</p>
          <p className="text-sm text-gray-600">Courses</p>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-bold">Submit Rounds</h2>
          <p className="mt-2 text-gray-600">
            Log real rounds from approved courses with rating, slope, score,
            date, and optional proof.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-bold">Verify Results</h2>
          <p className="mt-2 text-gray-600">
            Use proof uploads and peer verification to increase trust and earn
            stronger ranking credit.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-bold">Climb Rankings</h2>
          <p className="mt-2 text-gray-600">
            Compete by season, division, state, trust level, and course
            leaderboards.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-6">
  <div className="rounded-xl border bg-gray-50 p-8 text-center">
    <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
      Coming Soon
    </p>

    <h2 className="mt-3 text-3xl font-bold">
      Weekly Competitive Events
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-gray-600">
      Compete in weekly tournaments, regional challenges, and verified competitions to earn
      rankings, badges, and seasonal positioning.
    </p>
  </div>
</section>

      <section className="mx-auto mt-12 max-w-4xl px-6">
        <div className="rounded-xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Link href="/feed" className="text-sm font-semibold underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentRounds?.map((round) => (
              <div key={round.id} className="rounded border p-4">
                <p>
                  <strong>{round.profiles?.display_name || "Player"}</strong>{" "}
                  shot <strong>{round.score}</strong> at{" "}
                  <strong>{round.course_name}</strong>
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Diff {Number(round.score_differential).toFixed(2)} •{" "}
                  {Number(round.points).toFixed(2)} ranking points
                </p>
              </div>
            ))}

            {!recentRounds?.length && (
              <p className="text-gray-600">No rounds submitted yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">
          Ready to see where your game ranks?
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Create your profile, submit your first three rounds, and start climbing
          the Ranked Golf Leaderboard.
        </p>

        <div className="mt-6">
          <Link
            href="/signup"
            className="rounded bg-green-700 px-6 py-3 font-semibold text-white"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </main>
  );
}
