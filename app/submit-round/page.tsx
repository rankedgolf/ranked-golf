import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { recalculateRankedGolfIndex } from "@/lib/rankings/recalculateRankedGolfIndex";

async function submitRound(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const courseId = String(formData.get("course_id"));
  const eventId = String(formData.get("event_id") || "");
  const proofFile = formData.get("proof_file") as File | null;
  let event = null;

if (eventId) {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  event = data;

  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

    const today = new Date().toISOString().split("T")[0];

if (today < event.start_date) {
  console.error("Event has not started yet");
  redirect("/submit-round?error=event_not_started");
}

if (today > event.end_date) {
  console.error("Event has already ended");
  redirect("/submit-round?error=event_ended");
}

  if (!registration) {
    console.error("User not registered for event");
    redirect("/submit-round?error=not_registered");
  }
  if (event.requires_partner && !formData.get("playing_partner")) {
  redirect("/submit-round?error=partner_required");
}

if (event.requires_proof && !proofFile) {
  redirect("/submit-round?error=proof_required");
}
}
if (event) {
  const playedAt = String(formData.get("played_at"));

  if (
    playedAt < event.start_date ||
    playedAt > event.end_date
  ) {
    console.error("Round outside event window");
    redirect("/submit-round?error=outside_event_window");
  }
}
if (eventId) {
  const { data: existingEventRound } = await supabase
    .from("rounds")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existingEventRound) {
    console.error("User already submitted event round");
    redirect("/submit-round?error=event_round_exists");
  }
}
  const score = Number(formData.get("score"));

  const partnerEmails = String(formData.get("playing_partner_emails") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const { data: selectedCourse } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (
    !selectedCourse?.course_rating ||
    !selectedCourse?.slope_rating ||
    !selectedCourse?.par
  ) {
    console.error("Selected course missing rating/slope/par:", selectedCourse);
    redirect("/submit-round");
  }

  const courseRating = Number(selectedCourse.course_rating);
  const slopeRating = Number(selectedCourse.slope_rating);
  const par = Number(selectedCourse.par);

  const scoreDifferential = ((score - courseRating) * 113) / slopeRating;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  let proofUrl: string | null = null;

  if (proofFile && proofFile.size > 0) {
    const fileExt = proofFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("round-proofs")
      .upload(filePath, proofFile);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("round-proofs")
        .getPublicUrl(filePath);

      proofUrl = publicUrlData.publicUrl;
    }
  }

  const { data: insertedRound, error: insertError } = await supabase
    .from("rounds")
    .insert({
      user_id: user.id,
      profile_id: profile?.id,
      season_id: activeSeason?.id,
      event_id: eventId || null,

      course_id: courseId,
      course_name: selectedCourse.name,

      tee_box: String(formData.get("tee_box") || ""),

      course_rating: courseRating,
      slope_rating: slopeRating,
      par,
      score,

      holes: Number(formData.get("holes")),

      played_at: String(formData.get("played_at")),

      round_type: String(formData.get("round_type")),

      verification_status: proofUrl ? "proof_submitted" : "unverified",

      trust_level: proofUrl ? 1 : 0,

      verification_method: proofUrl ? "proof_upload" : "none",

      is_prize_eligible: false,
      is_flagged: false,

      score_differential: Number(scoreDifferential.toFixed(2)),

      points: Number(
        (
          (Math.max(0, 50 - scoreDifferential) / 10) *
          (proofUrl ? 0.9 : 0.7)
        ).toFixed(2)
      ),

      proof_url: proofUrl,

      proof_type: String(formData.get("proof_type") || ""),

      playing_partner_emails: partnerEmails,

      notes: String(formData.get("notes") || ""),
    })
    .select()
    .single();

  if (insertError) {
    console.error("Round insert error:", insertError);
    redirect("/submit-round");
  }

  if (insertedRound && partnerEmails.length > 0) {
    const verificationRows = partnerEmails.map((email) => ({
      round_id: insertedRound.id,
      verifier_email: email,
    }));

    await supabase.from("round_peer_verifications").insert(verificationRows);
  }

  await recalculateRankedGolfIndex(supabase, user.id);

  redirect("/dashboard");
}

export default async function SubmitRoundPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let registeredEvents: any[] = [];

  if (user) {
    const { data } = await supabase
      .from("event_registrations")
      .select(`
        event_id,
        events (
          id,
          title,
          start_date,
          end_date
          max_players
        )
      `)
      .eq("user_id", user.id);

    registeredEvents = data || [];
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">Submit Round</h1>

{params.error && (
  <div className="mb-4 rounded-xl border bg-red-50 p-4 text-sm text-red-700">
    {params.error === "not_registered" &&
      "You must register for this event before submitting an event round."}

    {params.error === "outside_event_window" &&
      "This round is outside the event date window."}

    {params.error === "event_round_exists" &&
      "You have already submitted a round for this event."}

      {params.error === "event_not_started" &&
  "This event has not started yet. You can submit once the event window opens."}

{params.error === "event_ended" &&
  "This event has ended and is no longer accepting round submissions."}

  {params.error === "partner_required" &&
  "This event requires a playing partner for verification."}

{params.error === "proof_required" &&
  "This event requires proof submission."}
  </div>
)}

        <form action={submitRound} className="space-y-4 rounded-xl border p-6">
          <select
            name="course_id"
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select Course</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} — {course.city}, {course.state}
              </option>
            ))}
          </select>

          <p className="text-sm text-gray-600">
            Don&apos;t see your course?{" "}
            <Link href="/request-course" className="font-semibold underline">
              Request it here
            </Link>
          </p>

          <select
            name="event_id"
            className="w-full rounded border px-3 py-2"
            defaultValue=""
          >
            <option value="">No event — regular ranked round</option>

            {registeredEvents.map((registration: any) => (
              <option
                key={registration.events?.id}
                value={registration.events?.id}
              >
                {registration.events?.title} ({registration.events?.start_date})
              </option>
            ))}
          </select>

          <input
            name="score"
            type="number"
            placeholder="Score"
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="holes"
            type="number"
            placeholder="Holes"
            defaultValue={18}
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="played_at"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />

          <select
            name="round_type"
            className="w-full rounded border px-3 py-2"
            defaultValue="solo"
          >
            <option value="solo">Solo</option>
            <option value="group">Group</option>
            <option value="event">Event</option>
          </select>

          <textarea
            name="playing_partner_emails"
            placeholder="Playing partner emails, separated by commas"
            className="w-full rounded border px-3 py-2"
          />

          <select
            name="proof_type"
            className="w-full rounded border px-3 py-2"
            defaultValue=""
          >
            <option value="">Proof type optional</option>
            <option value="scorecard">Scorecard Photo</option>
            <option value="app">Golf App Screenshot</option>
            <option value="tournament">Tournament Result</option>
          </select>

          <input
            name="proof_file"
            type="file"
            accept="image/*"
            className="w-full rounded border px-3 py-2"
          />

          <textarea
            name="notes"
            placeholder="Notes optional"
            className="w-full rounded border px-3 py-2"
          />

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Submit Round
          </button>
        </form>
      </div>
    </main>
  );
}