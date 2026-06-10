import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedFilters from "./FeedFilters";
import { getLevelTitle } from "@/lib/campaign/levelTitles";

export const dynamic = "force-dynamic";

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

const {
  data: { session },
} = await supabase.auth.getSession();

const currentUser = user || session?.user;

if (!currentUser) redirect("/login");

   const { data: profile } = await supabase
  .from("profiles")
  .select("membership_tier")
  .eq("user_id", currentUser.id)
  .maybeSingle();

const proUser = ["pro", "competitive"].includes(
  profile?.membership_tier || ""
);

 let followingIds: string[] = [];

if (currentUser) {
  const { data: following } = await supabase
    .from("follows")
    .select("following_user_id")
    .eq("follower_user_id", currentUser.id);

  followingIds =
    following?.map((follow) => follow.following_user_id) || [];
}

  if (params.filter === "following" && !proUser) {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border p-8 text-center">
        <h1 className="text-3xl font-bold">Pro Feature</h1>

        <p className="mt-4 text-gray-600">
          Upgrade to Ranked Golf Pro to unlock the following-only activity feed
          and advanced competitive tools.
        </p>

        <Link
          href="/pricing"
          className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
        >
          View Memberships
        </Link>
      </div>
    </main>
  );
}

let query = supabase
  .from("rounds")
  .select(`
    *,
    profiles (
      display_name,
      username,
      profile_photo_url,
      membership_tier,
      level
    ),
    seasons (
      name
    ),
    round_likes (
      user_id
    ),
round_comments (
  id,
  user_id,
  comment,
  created_at,
  profiles (
    display_name,
    username
  )
)
  `)
  .eq("is_public", true)
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

  const { data: rounds, error: roundsError } = await query;

if (roundsError) {
  console.error("Feed query error:", roundsError);
}

  async function toggleRoundLike(formData: FormData) {
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

  const roundId = String(formData.get("round_id"));

  const { data: round } = await supabase
    .from("rounds")
    .select("id, is_public")
    .eq("id", roundId)
    .single();

  if (!round?.is_public) redirect("/feed");

  const { data: existingLike } = await supabase
    .from("round_likes")
    .select("id")
    .eq("round_id", roundId)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (existingLike) {
    await supabase
      .from("round_likes")
      .delete()
      .eq("id", existingLike.id);
  } else {
    await supabase.from("round_likes").insert({
      round_id: roundId,
      user_id: currentUser.id,
    });
  }

  redirect("/feed");
}

async function addRoundComment(formData: FormData) {
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

  const roundId = String(formData.get("round_id"));
  const comment = String(formData.get("comment") || "").trim();

  if (!comment) redirect("/feed");

  const { data: round } = await supabase
    .from("rounds")
    .select("id, is_public")
    .eq("id", roundId)
    .single();

  if (!round?.is_public) redirect("/feed");

  await supabase.from("round_comments").insert({
    round_id: roundId,
    user_id: currentUser.id,
    comment,
  });

  redirect("/feed");
}

async function deleteRoundComment(formData: FormData) {
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

  const commentId = String(formData.get("comment_id"));

  await supabase
    .from("round_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", currentUser.id);

  redirect("/feed");
}

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
        {rounds?.map((round) => {
  const levelInfo = getLevelTitle(
    Number(round.profiles?.level || 1)
  );

  return (

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

<span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
  {levelInfo.emblem} L{round.profiles?.level || 1}
</span>

{round.profiles?.membership_tier === "competitive" ? (
  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
    COMP
  </span>
) : round.profiles?.membership_tier === "pro" ? (
  <span className="rounded-full bg-black px-2 py-1 text-xs font-semibold text-white">
    PRO
  </span>
) : null}

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

  <div className="mt-5 border-t pt-4">
  <div className="flex items-center gap-4 text-sm">
    <form action={toggleRoundLike}>
      <input type="hidden" name="round_id" value={round.id} />

<button
  className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
    round.round_likes?.some(
      (like: any) => like.user_id === currentUser.id
    )
      ? "border-green-600 bg-green-100 text-green-700 hover:bg-green-200"
      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
  }`}
>
  {round.round_likes?.some(
    (like: any) => like.user_id === currentUser.id
  )
    ? "⛳ Props Given"
    : "👏 Give Props"}
</button>
    </form>

    <span className="text-gray-500">
    {round.round_likes?.length || 0} Prop
{(round.round_likes?.length || 0) === 1 ? "" : "s"}
    </span>

    <span className="text-gray-500">
  {round.round_comments?.length || 0} Comment
  {(round.round_comments?.length || 0) === 1 ? "" : "s"}

  {!!round.round_comments?.length && (
  <div className="mt-4 space-y-2">
    {round.round_comments.slice(0, 3).map((comment: any) => (
      <div key={comment.id} className="rounded bg-gray-50 p-3 text-sm">
        <p className="font-semibold">
          {comment.profiles?.display_name || "Golfer"}
        </p>

        <p className="mt-1 text-gray-700">{comment.comment}</p>

{comment.user_id === currentUser.id && (
  <form action={deleteRoundComment} className="mt-2">
    <input type="hidden" name="comment_id" value={comment.id} />

    <button className="text-xs font-semibold text-red-700 hover:underline">
      Delete
    </button>
  </form>
)}
      </div>
    ))}
  </div>
)}

<form action={addRoundComment} className="mt-4 flex gap-2">
  <input type="hidden" name="round_id" value={round.id} />

  <input
    name="comment"
    placeholder="Add a comment..."
    className="flex-1 rounded border px-3 py-2 text-sm"
  />

  <button className="rounded bg-black px-4 py-2 text-sm font-semibold text-white">
    Post
  </button>
</form>
</span>
  </div>
</div>

            </div>
                  </div>
        );
})}

        {!rounds?.length && (
          <div className="rounded-xl border p-5 text-gray-600">
            No recent rounds yet.
          </div>
        )}
      </div>
    </main>
  );
}