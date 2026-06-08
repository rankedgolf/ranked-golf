import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/events/getEventStatus";
import { processEventChallenges } from "@/lib/campaign/processEventChallenges";
import EventCountdown from "@/app/components/EventCountdown";

async function joinEvent(formData: FormData) {
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

  const eventId = String(formData.get("event_id"));
  const slug = String(formData.get("slug"));

  const { data: profile } = await supabase
  .from("profiles")
  .select("id, membership_tier")
  .eq("user_id", currentUser.id)
  .single();

const { data: event } = await supabase
  .from("events")
  .select("*")
  .eq("id", eventId)
  .single();

if (event?.is_cash_event && profile?.membership_tier === "free") {
  console.error("Free user tried to join prize event");
  redirect(`/events/${slug}?error=membership_required`);
}

  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    user_id: currentUser.id,
    profile_id: profile?.id,
  });

  if (error) {
    console.error("Event registration error:", error);
    redirect(`/events/${slug}`);
  }

  await processEventChallenges(supabase, currentUser.id);

  redirect(`/events/${slug}`);
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const pageParams = await searchParams;

  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) redirect("/events");

  const eventStatus = getEventStatus(
  event.start_date,
  event.end_date
);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existingRegistration = null;

  if (user) {
    const { data } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();

    existingRegistration = data;
  }

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      *,
      profiles (
        display_name
      )
    `)
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  const { data: eventRounds } = await supabase
  .from("rounds")
  .select(`
    *,
    profiles (
      display_name,
      profile_photo_url
    )
  `)
  .eq("event_id", event.id)
  .order("score_differential", { ascending: true })
  .order("points", { ascending: false })
  .order("trust_level", { ascending: false });
  const winningRound = eventRounds?.[0] || null;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
       <div className="flex items-start justify-between gap-4">
  <div>
    <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
      {event.event_type}
    </p>

    <h1 className="mt-3 text-4xl font-bold">
      {event.title}
    </h1>
  </div>

  {event?.end_date && (
  <div className="mt-6 max-w-sm">
    <EventCountdown endDate={event.end_date} />
  </div>
)}

  <div>
    {(() => {
      const status = getEventStatus(
        event.start_date,
        event.end_date
      );

      const statusClass =
        status === "active"
          ? "bg-green-100 text-green-700"
          : status === "upcoming"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700";

      return (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}
        >
          {status}
        </span>
      );
    })()}
  </div>
</div>

        <p className="mt-4 text-gray-600">
          {event.description || "Event details coming soon."}
        </p>

        {pageParams.error === "membership_required" && (
  <div className="mt-4 rounded-xl border bg-yellow-50 p-4 text-sm text-yellow-800">
    Prize events require a paid membership tier. Upgrade options are coming soon.
  </div>
)}

        <div className="mt-6 rounded-xl border p-5">
          <p>
            <strong>Start:</strong> {event.start_date}
          </p>
          <p>
            <strong>End:</strong> {event.end_date}
          </p>
          <p>
            <strong>Max Players:</strong> {event.max_players || "Unlimited"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
  {event.requires_proof && (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Proof Required
    </span>
  )}

  {event.requires_partner && (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Partner Verification Required
    </span>
  )}

  {event.is_cash_event && (
    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
      Prize Event
    </span>
  )}
</div>

        <div className="mt-6 flex flex-wrap gap-3">
  <a
    href="/events"
    className="rounded border px-4 py-2 text-sm font-semibold"
  >
    Back to Events
  </a>

  <a
    href="/leaderboard"
    className="rounded border px-4 py-2 text-sm font-semibold"
  >
    View Overall Rankings
  </a>

  <a
    href="/ranking-system"
    className="rounded border px-4 py-2 text-sm font-semibold"
  >
    How Rankings Work
  </a>
</div>

        <div className="mt-6">
          {existingRegistration ? (
  <div className="rounded-xl border bg-green-50 p-5 text-green-800">
    <p className="text-lg font-semibold">
      You're officially in the field.
    </p>

    <p className="mt-2 text-sm">
      Submit a verified round during the event window to compete on the
      leaderboard, earn seasonal ranking points, and see how your game stacks
      up against the field.
    </p>
    <div className="mt-4">
  <a
    href="/submit-round"
    className="inline-block rounded bg-black px-4 py-2 text-sm font-semibold text-white"
  >
    Submit Event Round
  </a>
</div>
  </div>
) : eventStatus === "completed" ? (
  <div className="rounded-xl border bg-gray-50 p-5 text-gray-700">
    <p className="font-semibold">Registration closed.</p>
    <p className="mt-1 text-sm">
      This event has ended. Check the leaderboard below for final results.
    </p>
  </div>
) : (
  <form action={joinEvent}>
    <input type="hidden" name="event_id" value={event.id} />
    <input type="hidden" name="slug" value={event.slug} />

    <button className="rounded bg-black px-5 py-3 font-semibold text-white">
      Join Event
    </button>
  </form>
)}
        </div>

        <section className="mt-8 rounded-xl border p-5">
          <h2 className="text-xl font-bold">Registered Players</h2>

          <div className="mt-4 space-y-2">
            {registrations?.map((registration) => (
              <div key={registration.id} className="rounded border p-3">
                {registration.profiles?.display_name || "Player"}
              </div>
            ))}

            {!registrations?.length && (
              <p className="text-gray-600">No players registered yet.</p>
            )}
          </div>
        </section>
      </div>

      {eventStatus === "completed" && winningRound && (
  <section className="mt-8 rounded-xl border bg-yellow-50 p-6">
    <p className="text-sm font-semibold uppercase tracking-widest text-yellow-700">
      Event Winner
    </p>

    <h2 className="mt-2 text-3xl font-bold">
      {winningRound.profiles?.display_name || "Player"}
    </h2>

    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <div>
        <p className="text-sm text-gray-500">
          Score
        </p>

        <p className="text-xl font-semibold">
          {winningRound.score}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Differential
        </p>

        <p className="text-xl font-semibold">
          {winningRound.score_differential}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Ranking Points
        </p>

        <p className="text-xl font-semibold">
          {Number(winningRound.points).toFixed(2)}
        </p>
      </div>
    </div>
  </section>
)}

      <section className="mt-8 rounded-xl border p-5">
  <h2 className="text-xl font-bold">Event Leaderboard</h2>

  <div className="mb-6 grid gap-4 md:grid-cols-3">
  <div className="rounded-xl border p-4">
    <p className="text-sm text-gray-500">
      Players
    </p>

    <p className="mt-2 text-2xl font-bold">
      {registrations?.length || 0}
    </p>
  </div>

  <div className="rounded-xl border p-4">
    <p className="text-sm text-gray-500">
      Rounds Submitted
    </p>

    <p className="mt-2 text-2xl font-bold">
      {eventRounds?.length || 0}
    </p>
  </div>

  <div className="rounded-xl border p-4">
    <p className="text-sm text-gray-500">
      Current Leader
    </p>

    <p className="mt-2 text-lg font-bold">
      {winningRound?.profiles?.display_name || "--"}
    </p>
  </div>
</div>

  <div className="mt-4 overflow-x-auto">
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
        {eventRounds?.map((round, index) => (
          <tr key={round.id} className="border-t">
            <td className="p-3 font-bold">
  {index === 0
    ? "🥇"
    : index === 1
    ? "🥈"
    : index === 2
    ? "🥉"
    : `#${index + 1}`}
</td>
            <td className="p-3">
  <div className="flex items-center gap-2">
    {round.profiles?.profile_photo_url ? (
      <img
        src={round.profiles.profile_photo_url}
        alt={round.profiles?.display_name || "Player"}
        className="h-8 w-8 rounded-full object-cover"
      />
    ) : (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
        {(round.profiles?.display_name || "P").charAt(0)}
      </div>
    )}

    <span className="font-semibold">
      {round.profiles?.display_name || "Player"}
    </span>
  </div>
</td>
            <td className="p-3">{round.score}</td>
            <td className="p-3">{round.score_differential}</td>
            <td className="p-3">{Number(round.points).toFixed(2)}</td>
            <td className="p-3">
              {round.trust_level >= 2 ? "Peer Verified" : round.trust_level >= 1 ? "Proof Submitted" : "Unverified"}
            </td>
          </tr>
        ))}

        {!eventRounds?.length && (
          <tr>
            <td className="p-3 text-gray-600" colSpan={6}>
              No event rounds submitted yet.
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