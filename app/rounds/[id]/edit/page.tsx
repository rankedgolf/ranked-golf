import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { recalculateRankedGolfIndex } from "@/lib/rankings/recalculateRankedGolfIndex";

async function updateRound(formData: FormData) {
  "use server";

  const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

const {
  data: { session },
} = await supabase.auth.getSession();

const currentUser = user || session?.user;

if (!currentUser) {
  redirect("/login");
}

  const roundId = String(formData.get("round_id"));
  const score = Number(formData.get("score"));

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", roundId)
    .eq("user_id", currentUser.id)
    .single();

  if (!round) redirect("/dashboard");

if (round.trust_level >= 2) {
  redirect("/dashboard?error=round_locked");
}

  const scoreDifferential =
    ((score - Number(round.course_rating)) * 113) / Number(round.slope_rating);

  const points = Number(
    (
      (Math.max(0, 50 - scoreDifferential) / 10) *
      (round.proof_url ? 0.9 : 0.7)
    ).toFixed(2)
  );

  await supabase
    .from("rounds")
    .update({
      score,
      played_at: String(formData.get("played_at")),
      round_type: String(formData.get("round_type")),
      notes: String(formData.get("notes") || ""),
      score_differential: Number(scoreDifferential.toFixed(2)),
      points,
    })
    .eq("id", roundId)
    .eq("user_id", currentUser.id);

  await recalculateRankedGolfIndex(supabase, currentUser.id);

  redirect("/dashboard");
}

export default async function EditRoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

const {
  data: { session },
} = await supabase.auth.getSession();

const currentUser = user || session?.user;

if (!currentUser) redirect("/login");

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", id)
    .eq("user_id", currentUser.id)
    .single();

  if (!round) redirect("/dashboard");

 if (round.trust_level >= 2) {
  redirect("/dashboard?error=round_locked");
}

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="underline">
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 mb-6 text-3xl font-bold">
          Edit Round
        </h1>

        <form action={updateRound} className="space-y-4 rounded-xl border p-6">
          <input type="hidden" name="round_id" value={round.id} />

          <div className="rounded bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <strong>Course:</strong> {round.course_name}
            </p>
            <p>
              <strong>Rating/Slope:</strong> {round.course_rating} /{" "}
              {round.slope_rating}
            </p>
          </div>

          <input
            name="score"
            type="number"
            defaultValue={round.score}
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="played_at"
            type="date"
            defaultValue={round.played_at}
            required
            className="w-full rounded border px-3 py-2"
          />

          <select
            name="round_type"
            defaultValue={round.round_type}
            className="w-full rounded border px-3 py-2"
          >
            <option value="solo">Solo</option>
            <option value="group">Group</option>
            <option value="event">Event</option>
          </select>

          <textarea
            name="notes"
            defaultValue={round.notes || ""}
            placeholder="Notes optional"
            className="w-full rounded border px-3 py-2"
          />

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Save Round
          </button>
        </form>
      </div>
    </main>
  );
}