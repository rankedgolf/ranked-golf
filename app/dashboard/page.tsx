import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../auth/actions";
import { recalculateRankedGolfIndex } from "@/lib/rankings/recalculateRankedGolfIndex";

async function deleteRound(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roundId = String(formData.get("round_id"));

  await supabase
    .from("rounds")
    .delete()
    .eq("id", roundId)
    .eq("user_id", user.id);

  await recalculateRankedGolfIndex(supabase, user.id);

  redirect("/dashboard");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
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
    .eq("user_id", user.id)
    .order("played_at", { ascending: false });

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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: pendingVerifications } = await supabase
    .from("round_peer_verifications")
    .select("*")
    .eq("verifier_email", user.email?.toLowerCase())
    .eq("verification_status", "pending");

  const totalPoints =
    rounds?.reduce(
      (sum, round) => sum + Number(round.points || 0),
      0
    ) || 0;

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Player Dashboard
          </h1>

          <p className="text-gray-600">
            Welcome, {profile?.display_name || user.email}
          </p>

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
          href={`/players/${user.id}`}
          className="inline-block rounded border px-4 py-2 font-semibold"
        >
          View My Public Profile
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
  <h2 className="font-bold">Membership</h2>

  <p className="mt-2 text-3xl font-bold capitalize">
    {profile?.membership_tier || "free"}
  </p>
</div>

        <div className="rounded-xl border p-5">
          <h2 className="font-bold">Global Rank</h2>

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
          <h2 className="font-bold">
            Season Points
          </h2>

          <p className="mt-2 text-3xl font-bold">
            {totalPoints.toFixed(1)}
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
                    {round.score_differential}
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
                    <form action={deleteRound}>
                      <input
                        type="hidden"
                        name="round_id"
                        value={round.id}
                      />

                      <button className="rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {!rounds?.length && (
                <tr>
                  <td
                    className="p-3 text-gray-500"
                    colSpan={10}
                  >
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