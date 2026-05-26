import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/events/getEventStatus";

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: true });

  console.log("Events:", events);
  console.log("Events error:", error);

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Events</h1>

        <p className="mt-3 text-gray-600">
          Join weekly and monthly real-round golf events.
        </p>

        <div className="mt-8 grid gap-4">
          {events?.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="rounded-xl border p-5 transition hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {event.title}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    {event.description}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    {event.start_date} — {event.end_date}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
  {event.requires_proof && (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Proof Required
    </span>
  )}

  {event.requires_partner && (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Partner Required
    </span>
  )}

  {event.is_cash_event && (
    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
      Prize Event
    </span>
  )}
</div>

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
            </Link>
          ))}

          {!events?.length && (
            <div className="rounded-xl border p-5 text-gray-600">
              No active events yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}