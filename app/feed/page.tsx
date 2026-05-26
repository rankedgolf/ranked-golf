import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedFilters from "./FeedFilters";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let followingIds: string[] = [];

  if (params.filter === "following") {
    if (!user) {
      redirect("/login");
    }

    const { data: follows } = await supabase
      .from("player_follows")
      .select("following_user_id")
      .eq("follower_user_id", user.id);

    followingIds = follows?.map((f) => f.following_user_id) || [];
  }

  let query = supabase
    .from("rounds")
    .select(`
      *,
      profiles (
        display_name,
        username,
        profile_photo_url
      ),
      seasons (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.filter === "verified") {
    query = query.gte("trust_level", 2);
  }

  if (params.filter === "following") {
    if (!followingIds.length) {
      return (
        <main className="min-h-screen p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Recent Activity</h1>
              <p className="text-gray-600">
                Latest submitted rounds from Ranked Golf players
              </p>
            </div>

            <Link href="/leaderboard" className="underline">
              Leaderboard
            </Link>
          </div>

          <FeedFilters />

          <div className="rounded-xl border p-5 text-gray-600">
            Follow players to build your personalized activity feed.
          </div>
        </main>
      );
    }

    query = query.in("user_id", followingIds);
  }

  const { data: rounds } = await query;

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Activity</h1>
          <p className="text-gray-600">
            Latest submitted rounds from Ranked Golf players
          </p>
        </div>

        <Link href="/leaderboard" className="underline">
          Leaderboard
        </Link>
      </div>

      <FeedFilters />

      <div className="space-y-4">
        {rounds?.map((round) => (
          <div
            key={round.id}
            className="rounded-xl border p-5 transition hover:bg-gray-50"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/players/${round.profiles?.username || round.user_id}`}
                    className="flex items-center gap-2 font-bold underline"
                  >
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

                    {round.profiles?.display_name || "Player"}
                  </Link>

                  <span className="text-gray-500">played</span>

                  {round.course_id ? (
                    <Link
                      href={`/courses/${round.course_id}`}
                      className="font-semibold underline"
                    >
                      {round.course_name}
                    </Link>
                  ) : (
                    <span className="font-semibold">{round.course_name}</span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  <p className="text-lg font-bold">Score: {round.score}</p>

                  <p
                    className={`font-semibold ${
                      Number(round.score_differential) <= 5
                        ? "text-green-700"
                        : Number(round.score_differential) <= 10
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                  >
                    Diff: {Number(round.score_differential).toFixed(2)}
                  </p>

                  <p>
                    <strong>Points:</strong>{" "}
                    {Number(round.points).toFixed(1)}
                  </p>

                  <p className="capitalize">
                    <strong>Type:</strong> {round.round_type}
                  </p>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      round.trust_level >= 3
                        ? "bg-green-100 text-green-700"
                        : round.trust_level >= 1
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {round.trust_level >= 3
                      ? "Highly Verified"
                      : round.trust_level >= 1
                      ? "Proof Submitted"
                      : "Unverified"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                  <p>
                    <strong>Season:</strong>{" "}
                    {round.seasons?.name || "All-Time"}
                  </p>

                  <p>
                    <strong>Date Played:</strong> {round.played_at}
                  </p>
                </div>

                {round.notes && (
                  <p className="mt-4 rounded bg-gray-100 p-3 text-sm text-gray-700">
                    {round.notes}
                  </p>
                )}

                {round.proof_url && (
                  <div className="mt-4">
                    <a
                      href={round.proof_url}
                      target="_blank"
                      className="text-sm font-semibold underline"
                    >
                      View Proof
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-start">
                {round.trust_level >= 2 ? (
                  <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    Peer Verified
                  </div>
                ) : round.trust_level >= 1 ? (
                  <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                    Proof Submitted
                  </div>
                ) : (
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    Unverified
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!rounds?.length && (
          <div className="rounded-xl border p-5 text-gray-600">
            No recent rounds yet.
          </div>
        )}
      </div>
    </main>
  );
}