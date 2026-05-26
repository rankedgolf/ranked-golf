import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("display_name", { ascending: true });

  if (params.q) {
    query = query.or(
      `display_name.ilike.%${params.q}%,username.ilike.%${params.q}%`
    );
  }

  if (params.state) {
    query = query.ilike("state", params.state);
  }

  const { data: players } = await query;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Players</h1>

        <p className="mt-3 text-gray-600">
          Find friends, rivals, and other golfers competing in Ranked Golf.
        </p>

        <form className="mt-6 flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search name or username"
            className="rounded border px-3 py-2"
          />

          <input
            name="state"
            defaultValue={params.state || ""}
            placeholder="State, ex: MA"
            className="rounded border px-3 py-2"
          />

          <button className="rounded bg-black px-4 py-2 font-semibold text-white">
            Search
          </button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {players?.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.username || player.user_id}`}
              className="rounded-xl border p-5 transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {player.profile_photo_url ? (
                  <img
                    src={player.profile_photo_url}
                    alt={player.display_name || "Player"}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-500">
                    {(player.display_name || "P").charAt(0)}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold">
                    {player.display_name || "Player"}
                  </h2>

                  <p className="text-sm text-gray-600">
                    @{player.username || "username-needed"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {[player.city, player.state].filter(Boolean).join(", ") ||
                      "Location not listed"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1">
                  {player.division || "No Division"}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1">
                  Index:{" "}
                  {player.ranked_golf_index
                    ? Number(player.ranked_golf_index).toFixed(2)
                    : "--"}
                </span>
              </div>
            </Link>
          ))}

          {!players?.length && (
            <div className="rounded-xl border p-5 text-gray-600">
              No players found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}