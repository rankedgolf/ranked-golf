import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EventCountdown from "@/app/components/EventCountdown";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: activeEvents } = await supabase
  .from("events")
  .select("id, title, slug, description, start_date, end_date, event_type")
  .eq("is_active", true)
  .order("start_date", { ascending: true })
  .limit(3);

  const { count: roundCount } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true });

 const { count: playerCount } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("is_test_account", false);

  const { data: recentRounds } = await supabase
    .from("rounds")
    .select(`
      *,
      profiles (
        display_name,
        is_test_account
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

   const { count: foundingMemberCount } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("is_founding_member", true)
  .eq("is_test_account", false);

 const visibleRecentRounds =
  recentRounds
    ?.filter((round: any) => !round.profiles?.is_test_account)
    .slice(0, 3) || [];

const foundingSpotsLeft = Math.max(
  0,
  100 - (foundingMemberCount || 0)
);

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b bg-black px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-green-500">
            Ranked Golf
          </p>

         <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
  Golf Finally Has a Career Mode.
</h1>

<p className="mt-6 text-xl leading-relaxed text-green-100 md:text-2xl">
  Submit real rounds.
  <br />
  Earn ranking points.
  <br />
  Compete against golfers worldwide.
</p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
  <Link
    href="/signup"
    className="rounded-xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-600"
  >
    Join the Rankings
  </Link>

  <Link
    href="/how-it-works"
    className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white hover:text-black"
  >
    How It Works
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
    🌎 {Number(playerCount || 0).toLocaleString()}
  </p>

  <p className="mt-2 text-lg font-extrabold">
    Golfers Competing
  </p>

  <p className="mt-1 text-sm text-gray-600">
    Join golfers from around the world.
  </p>
</div>

<div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
  <p className="text-4xl font-extrabold">
    ⛳ {Number(roundCount || 0).toLocaleString()}
  </p>

  <p className="mt-2 text-lg font-extrabold">
    Rounds Submitted
  </p>

  <p className="mt-1 text-sm text-gray-600">
    Every round builds your legacy.
  </p>
</div>

<div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
  <p className="text-4xl font-extrabold">🏆</p>

  <p className="mt-2 text-lg font-extrabold">
    Live World Rankings
  </p>

  <p className="mt-1 text-sm text-gray-600">
    Every submitted round counts toward your world ranking.
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
  <div className="rounded-2xl border bg-gradient-to-r from-green-50 to-white p-10">
    <div className="text-center">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-700">
        Active Events
      </p>

      <h2 className="mt-4 text-4xl font-extrabold">
        Compete in Ranked Golf Events
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-gray-600">
        Join active events, submit qualifying rounds, earn XP, and climb the
        Ranked Golf World Rankings.
      </p>
    </div>

    {activeEvents && activeEvents.length > 0 ? (
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {activeEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">
              {event.event_type || "Event"}
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {event.title}
            </h3>

            <p className="mt-3 line-clamp-3 text-sm text-gray-600">
              {event.description || "Compete in this active Ranked Golf event."}
            </p>

<div className="mt-4 space-y-3 text-sm text-gray-600">
  <div>
    <p>
      <strong>Start:</strong> {event.start_date}
    </p>

    <p>
      <strong>End:</strong> {event.end_date}
    </p>
  </div>

  {event.end_date && (
    <EventCountdown endDate={event.end_date} />
  )}
</div>

            <Link
              href={`/events/${event.slug}`}
              className="mt-5 inline-flex w-full justify-center rounded-xl bg-black px-4 py-2 font-semibold text-white"
            >
              View Event
            </Link>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-8 rounded-xl border bg-white p-6 text-center">
        <h3 className="text-xl font-bold">Weekly Competitive Events Coming Soon</h3>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Compete in weekly tournaments, regional challenges, and verified
          competitions to earn rankings, badges, and seasonal positioning.
        </p>

        <Link
          href="/events"
          className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
        >
          View Events
        </Link>
      </div>
    )}
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
            {visibleRecentRounds?.map((round) => (
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

            {!visibleRecentRounds.length && (
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

      <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center">
  <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
    Founding Member Badge
  </p>

  <p className="mt-2 text-2xl font-extrabold text-black">
    Only {foundingSpotsLeft} Founding Member Spots Remaining
  </p>

  <p className="mt-2 text-sm text-gray-600">
The first 100 golfers to join Ranked Golf receive:

• Exclusive Founding Member badge
• 500 bonus XP
• Recognition on their player profile
• Free Pro Membership through December 31, 2026
  </p>
</div>
    </main>
  );
}
