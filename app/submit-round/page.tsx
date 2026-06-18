import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { recalculateRankedGolfIndex } from "@/lib/rankings/recalculateRankedGolfIndex";
import { awardXP } from "@/lib/campaign/awardXP";
import { checkRoundAchievements } from "@/lib/campaign/checkAchievements";
import { completeMission } from "@/lib/campaign/completeMission";
import { processRoundChallenges } from "@/lib/campaign/processRoundChallenges";
import CourseSearchSelect from "./components/CourseSearchSelect";

function getRoundRankingPoints(scoreDifferential: number) {
  if (scoreDifferential < 0) return 75;
  if (scoreDifferential < 5) return 65;
  if (scoreDifferential < 10) return 55;
  if (scoreDifferential < 15) return 45;
  if (scoreDifferential < 20) return 35;
  return 25;
}

async function submitRound(formData: FormData) {
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

  const courseId = String(formData.get("course_id"));
  const eventId = String(formData.get("event_id") || "");
  const proofFile = formData.get("proof_file") as File | null;

  if (!courseId) {
  redirect("/submit-round?error=missing_course");
}

if (
  !formData.get("score") ||
  !formData.get("holes") ||
  !formData.get("played_at")
) {
  redirect("/submit-round?error=missing_round_details");
}

  const pars = Number(formData.get("pars") || 0);
  const birdies = Number(formData.get("birdies") || 0);
  const eagles = Number(formData.get("eagles") || 0);
  const holeInOnes = Number(formData.get("hole_in_ones") || 0);
  const putts = formData.get("putts")
    ? Number(formData.get("putts"))
    : null;
  const gir = formData.get("gir")
    ? Number(formData.get("gir"))
    : null;
  const tripleBogeys = Number(formData.get("triple_bogeys") || 0);

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
      .eq("user_id", currentUser.id)
      .single();

    const today = new Date().toISOString().split("T")[0];

    if (today < event.start_date) {
      redirect("/submit-round?error=event_not_started");
    }

    if (today > event.end_date) {
      redirect("/submit-round?error=event_ended");
    }

    if (!registration) {
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
      redirect("/submit-round?error=outside_event_window");
    }
  }

  if (eventId) {
    const { data: existingEventRound } = await supabase
      .from("rounds")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", currentUser.id)
      .single();

    if (existingEventRound) {
      redirect("/submit-round?error=event_round_exists");
    }
  }

  const score = Number(formData.get("score"));

  const partnerEmails = String(
    formData.get("playing_partner_emails") || ""
  )
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const { data: selectedCourse } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

const teeBox = String(formData.get("tee_box") || "");
const courseRating = Number(formData.get("course_rating"));
const slopeRating = Number(formData.get("slope_rating"));
const par = Number(formData.get("par"));

if (!teeBox || !courseRating || !slopeRating || !par) {
  redirect("/submit-round?error=missing_course_details");
}

  const scoreDifferential =
    ((score - courseRating) * 113) / slopeRating;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", currentUser.id)
    .single();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  let proofUrl: string | null = null;

  if (proofFile && proofFile.size > 0) {
    const fileExt = proofFile.name.split(".").pop();
    const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

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
      user_id: currentUser.id,
      profile_id: profile?.id,
      season_id: activeSeason?.id,
      event_id: eventId || null,

      course_id: courseId,
      course_name: selectedCourse.name,
      tee_box: teeBox,

      course_rating: courseRating,
      slope_rating: slopeRating,
      par,
      score,
      holes: Number(formData.get("holes")),

      pars,
      birdies,
      eagles,
      hole_in_ones: holeInOnes,
      putts,
      gir,
      triple_bogeys: tripleBogeys,

      played_at: String(formData.get("played_at")),
      round_type: String(formData.get("round_type")),
      is_public: formData.get("is_public") === "on",

      verification_status: proofUrl
        ? "proof_submitted"
        : "unverified",

      trust_level: proofUrl ? 1 : 0,
      verification_method: proofUrl ? "proof_upload" : "none",

      is_prize_eligible: false,
      is_flagged: false,

      score_differential: Number(scoreDifferential.toFixed(2)),

      points: Number(
  (
    getRoundRankingPoints(scoreDifferential) *
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

  await awardXP(supabase, currentUser.id, 100);

  await completeMission(
  supabase,
  currentUser.id,
  "submit_round_daily"
);

await processRoundChallenges(supabase, currentUser.id, {
  score: Number(score),
  course_id: courseId,
});

  const scoringXP =
    pars * 10 +
    birdies * 25 +
    eagles * 100 +
    holeInOnes * 10000;

  if (scoringXP > 0) {
    await awardXP(supabase, currentUser.id, scoringXP);
  }

  const unlockedAchievements = await checkRoundAchievements(
    supabase,
    currentUser.id
  );

  const achievementCount = unlockedAchievements.length;

  if (insertedRound && partnerEmails.length > 0) {
    const verificationRows = partnerEmails.map((email) => ({
      round_id: insertedRound.id,
      verifier_email: email,
    }));

    await supabase
      .from("round_peer_verifications")
      .insert(verificationRows);
  }

  await recalculateRankedGolfIndex(supabase, currentUser.id);

 redirect(
  achievementCount > 0
    ? `/submit-round?success=true&achievements=${achievementCount}`
    : "/submit-round?success=true"
);
}

export default async function SubmitRoundPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; achievements?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const requiredInputClass =
  "w-full rounded border px-3 py-2 invalid:border-red-500 invalid:ring-2 invalid:ring-red-200";

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
          end_date,
          max_players
        )
      `)
      .eq("user_id", user.id);

    registeredEvents = data || [];
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">
          Submit Round
        </h1>

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

              {params.error === "missing_course_details" &&
  "Please enter tee box, par, course rating, and slope rating for this round."}

  {params.error === "missing_round_details" &&
  "Please enter score, holes played, and date played."}

{params.error === "missing_course" &&
  "Please select a course before submitting your round."}
          </div>
        )}

        {params.success === "true" && (
  <div className="mb-4 rounded-xl border bg-green-50 p-4 text-sm text-green-700">
    <p className="font-semibold">Round submitted successfully.</p>

    <p className="mt-1">
      Your leaderboard, XP, achievements, and profile stats have been updated.
    </p>

    {Number(params.achievements || 0) > 0 && (
      <p className="mt-2 font-semibold">
        🏆 {params.achievements} achievement
        {Number(params.achievements || 0) === 1 ? "" : "s"} unlocked!
      </p>
    )}

    <div className="mt-3 flex flex-wrap gap-3">
      <Link href="/dashboard" className="font-semibold underline">
        View Dashboard
      </Link>

      <Link href="/leaderboard" className="font-semibold underline">
        View Leaderboard
      </Link>

      <Link href="/feed" className="font-semibold underline">
        View Activity Feed
      </Link>
    </div>
  </div>
)}

        <form
          action={submitRound}
          className="space-y-4 rounded-xl border p-6"
        >
         <div>
  <label className="mb-1 block text-sm font-semibold">
    Course
  </label>

  <CourseSearchSelect />
</div>

          <p className="text-sm text-gray-600">
            Don&apos;t see your course?{" "}
            <Link
              href="/request-course"
              className="font-semibold underline"
            >
              Request it here
            </Link>
          </p>

       <div className="rounded-xl border bg-gray-50 p-4">
  <h2 className="font-bold">Tee & Course Rating Details</h2>

  <p className="mt-1 text-sm text-gray-600">
    Enter the tee box, par, course rating, and slope from the scorecard or course listing.
  </p>

  <div className="mt-4 grid gap-3 md:grid-cols-2">
    <div className="md:col-span-2">
      <label className="mb-1 block text-sm font-semibold">
        Tee Box Played
      </label>

      <input
        name="tee_box"
        type="text"
        placeholder="Blue, White, Gold, etc."
        required
        className={requiredInputClass}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Par
      </label>

      <input
        name="par"
        type="number"
        required
        min="27"
        max="80"
        placeholder="72"
        className={requiredInputClass}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Course Rating
      </label>

      <input
        name="course_rating"
        type="number"
        step="0.1"
        required
        min="20"
        max="85"
        placeholder="69.4"
        className={requiredInputClass}
      />
    </div>

    <div className="md:col-span-2">
      <label className="mb-1 block text-sm font-semibold">
        Slope Rating
      </label>

      <input
        name="slope_rating"
        type="number"
        required
        min="55"
        max="155"
        placeholder="125"
        className={requiredInputClass}
      />
    </div>
  </div>
</div>

<div className="rounded-xl border bg-gray-50 p-4">
  <h2 className="font-bold">Round Information</h2>

  <p className="mt-1 text-sm text-gray-600">
    Tell us about the round you are submitting.
  </p>

  <div className="mt-4 space-y-4">

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Event (Optional)
      </label>

      <select
        name="event_id"
        className="w-full rounded border px-3 py-2"
        defaultValue=""
      >
        <option value="">
          Regular Ranked Golf Round
        </option>

        {registeredEvents.map((registration: any) => (
          <option
            key={registration.events?.id}
            value={registration.events?.id}
          >
            {registration.events?.title} (
            {registration.events?.start_date})
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Score
      </label>

      <input
        name="score"
        type="number"
        placeholder="Enter your total score"
        required
        className={requiredInputClass}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Number of Holes
      </label>

      <input
        name="holes"
        type="number"
        placeholder="9 or 18"
        defaultValue={18}
        required
        className={requiredInputClass}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Date Played
      </label>

      <input
        name="played_at"
        type="date"
        required
        defaultValue={new Date().toISOString().split("T")[0]}
        className={requiredInputClass}
      />
    </div>

    <div>
      <label className="mb-1 block text-sm font-semibold">
        Round Type
      </label>

      <select
        name="round_type"
        className="w-full rounded border px-3 py-2"
        defaultValue="solo"
      >
        <option value="solo">
          Solo Round
        </option>

        <option value="group">
          Group Round
        </option>

        <option value="event">
          Tournament / Event Round
        </option>
      </select>
    </div>

  </div>
</div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <h2 className="font-bold">
              Optional Advanced Stats
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Add these if you track them. They can earn extra
              Campaign XP and achievements.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                name="pars"
                type="number"
                min="0"
                placeholder="Pars"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="birdies"
                type="number"
                min="0"
                placeholder="Birdies"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="eagles"
                type="number"
                min="0"
                placeholder="Eagles"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="hole_in_ones"
                type="number"
                min="0"
                placeholder="Hole in Ones"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="putts"
                type="number"
                min="0"
                placeholder="Total Putts"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="gir"
                type="number"
                min="0"
                placeholder="Greens in Regulation"
                className="w-full rounded border px-3 py-2"
              />

              <input
                name="triple_bogeys"
                type="number"
                min="0"
                placeholder="Triple Bogeys"
                className="w-full rounded border px-3 py-2 md:col-span-2"
              />
            </div>
          </div>

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

          <label className="flex items-start gap-2 rounded border p-3 text-sm">
  <input
    type="checkbox"
    name="is_public"
    defaultChecked
    className="mt-1"
  />

  <span>
    Publish this round to the public activity feed
    <span className="block text-gray-500">
      If unchecked, your round still counts toward your rankings, XP, achievements, and profile stats, but it will not appear on the public feed.
    </span>
  </span>
</label>

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Submit Round
          </button>
        </form>
      </div>
    </main>
  );
}