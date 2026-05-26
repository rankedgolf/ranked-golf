import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function approveVerification(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const verificationId = String(formData.get("verification_id"));

  const { data: verification } = await supabase
    .from("round_peer_verifications")
    .select("*")
    .eq("id", verificationId)
    .single();

  if (!verification) {
    redirect("/verify-rounds");
  }

  await supabase
    .from("round_peer_verifications")
    .update({
      verification_status: "approved",
      verified_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  const { data: round } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", verification.round_id)
    .single();

  if (round) {
    const basePoints =
      Math.max(0, 50 - Number(round.score_differential)) / 10;

    const peerVerifiedPoints = Number((basePoints * 1.0).toFixed(2));

    await supabase
      .from("rounds")
      .update({
        verification_status: "peer_verified",
        trust_level: 2,
        verification_method: "peer",
        points: peerVerifiedPoints,
      })
      .eq("id", round.id);
  }

  redirect("/verify-rounds");
}

async function rejectVerification(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const verificationId = String(
    formData.get("verification_id")
  );

  await supabase
    .from("round_peer_verifications")
    .update({
      verification_status: "rejected",
      verified_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  redirect("/verify-rounds");
}

export default async function VerifyRoundsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: verifications } = await supabase
    .from("round_peer_verifications")
    .select(`
      *,
      rounds (
        course_name,
        score,
        played_at,
        round_type,
        profiles (
          display_name
        )
      )
    `)
    .eq("verifier_email", user.email.toLowerCase())
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Verify Rounds
      </h1>

      <p className="mt-2 text-gray-600">
        Confirm rounds submitted by your playing partners.
      </p>

      <div className="mt-8 space-y-4">
        {verifications?.map((verification) => (
          <div
            key={verification.id}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-bold">
              {verification.rounds?.profiles?.display_name ||
                "Player"}
            </h2>

            <div className="mt-3 space-y-1 text-sm">
              <p>
                <strong>Course:</strong>{" "}
                {verification.rounds?.course_name}
              </p>

              <p>
                <strong>Score:</strong>{" "}
                {verification.rounds?.score}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {verification.rounds?.played_at}
              </p>

              <p className="capitalize">
                <strong>Type:</strong>{" "}
                {verification.rounds?.round_type}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <form action={approveVerification}>
                <input
                  type="hidden"
                  name="verification_id"
                  value={verification.id}
                />

                <button className="rounded bg-green-700 px-4 py-2 font-semibold text-white">
                  Approve
                </button>
              </form>

              <form action={rejectVerification}>
                <input
                  type="hidden"
                  name="verification_id"
                  value={verification.id}
                />

                <button className="rounded bg-red-700 px-4 py-2 font-semibold text-white">
                  Reject
                </button>
              </form>
            </div>
          </div>
        ))}

        {!verifications?.length && (
          <div className="rounded-xl border p-5 text-gray-600">
            No pending verification requests.
          </div>
        )}
      </div>
    </main>
  );
}