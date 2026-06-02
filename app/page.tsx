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
      <section className="border-b bg-black px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-green-500">
            Ranked Golf
          </p>

          <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight md:text-7xl">
            Compete. Climb. Build Your Golf Ranking.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Submit verified rounds, build rivalries, track performance trends,
            and see how your game stacks up against golfers everywhere.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-600"
            >
              Join the Rankings
            </Link>

            <Link
              href="/leaderboard"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-black"
            >
              View Leaderboard
            </Link>

            <Link
              href="/feed"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-black"
            >
              Recent Activity
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-5xl gap-4 px-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
          <p className="text-4xl font-extrabold">
            {Number(playerCount || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Players
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
          <p className="text-4xl font-extrabold">
            {Number(roundCount || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Rounds Submitted
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
          <p className="text-4xl font-extrabold">
            {Number(courseCount || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Courses
          </p>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">
            Submit Rounds
          </h2>

          <p className="mt-3 text-gray-600">
            Log real rounds from approved courses with
            rating, slope, score, date, and optional
            proof.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">
            Verify Results
          </h2>

          <p className="mt-3 text-gray-600">
            Use proof uploads and peer verification
            to increase trust and earn stronger
            ranking credit.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">
            Climb Rankings
          </h2>

          <p className="mt-3 text-gray-600">
            Compete by season, division, state,
            trust level, and course leaderboards.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-6">
        <div className="rounded-2xl border bg-gray-50 p-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
            Coming Soon
          </p>

          <h2 className="mt-4 text-4xl font-extrabold">
            Weekly Competitive Events
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Compete in weekly tournaments,
            regional challenges, and verified
            competitions to earn rankings,
            badges, and seasonal positioning.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

            <Link
              href="/feed"
              className="text-sm font-semibold underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentRounds?.map((round) => (
              <div
                key={round.id}
                className="rounded-xl border p-4"
              >
                <p>
                  <strong>
                    {round.profiles?.display_name ||
                      "Player"}
                  </strong>{" "}
                  shot <strong>{round.score}</strong>{" "}
                  at{" "}
                  <strong>{round.course_name}</strong>
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Diff{" "}
                  {Number(
                    round.score_differential
                  ).toFixed(2)}{" "}
                  •{" "}
                  {Number(round.points).toFixed(2)}{" "}
                  ranking points
                </p>
              </div>
            ))}

            {!recentRounds?.length && (
              <p className="text-gray-600">
                No rounds submitted yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="rounded-2xl border bg-black p-10 text-white">
          <h2 className="text-4xl font-extrabold">
            Ready to see where your game ranks?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Create your profile, submit your first
            three rounds, and start climbing the
            Ranked Golf leaderboard.
          </p>

          <div className="mt-8">
            <Link
              href="/signup"
              className="rounded-xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-600"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
