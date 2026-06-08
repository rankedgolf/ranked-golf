import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/campaign/awardXP";
import { checkPracticeAchievements } from "@/lib/campaign/checkPracticeAchievements";

async function submitPractice(formData: FormData) {
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

  const practiceTaskKey = String(formData.get("practice_task_key") || "");
  const practicedAt = String(formData.get("practiced_at") || "");
  const notes = String(formData.get("notes") || "");

  if (!practiceTaskKey || !practicedAt) {
    redirect("/submit-practice?error=missing_fields");
  }

  const { data: task } = await supabase
    .from("practice_tasks")
    .select("*")
    .eq("key", practiceTaskKey)
    .eq("is_active", true)
    .single();

  if (!task) {
    redirect("/submit-practice?error=invalid_task");
  }

  const xpReward = Number(task.xp_reward || 0);

  const { error } = await supabase.from("user_practice_logs").insert({
    user_id: currentUser.id,
    practice_task_key: practiceTaskKey,
    xp_awarded: xpReward,
    notes,
    practiced_at: practicedAt,
  });

  if (error) {
    console.error("Practice log insert error:", error);
    redirect("/submit-practice?error=submit_failed");
  }

  if (xpReward > 0) {
    await awardXP(supabase, currentUser.id, xpReward);
  }

  const unlockedAchievements = await checkPracticeAchievements(
    supabase,
    currentUser.id
  );

  const achievementCount = unlockedAchievements.length;

  redirect(
    `/submit-practice?success=true&xp=${xpReward}&achievements=${achievementCount}`
  );
}

export default async function SubmitPracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    xp?: string;
    achievements?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("xp_reward", { ascending: true });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-3xl font-bold">Submit Practice</h1>

        <p className="mb-6 text-gray-600">
          Log focused practice sessions, drills, and development work to earn
          Developmental XP.
        </p>

        {params.error && (
          <div className="mb-4 rounded-xl border bg-red-50 p-4 text-sm text-red-700">
            {params.error === "missing_fields" &&
              "Please select a practice task and date."}

            {params.error === "invalid_task" &&
              "That practice task is no longer available."}

            {params.error === "submit_failed" &&
              "Something went wrong submitting your practice log."}
          </div>
        )}

        {params.success === "true" && (
          <div className="mb-4 rounded-xl border bg-green-50 p-4 text-sm text-green-700">
            <p>
              Practice logged successfully. +{params.xp || 0} XP has been added
              to your campaign progress.
            </p>

            {Number(params.achievements || 0) > 0 && (
              <p className="mt-1 font-semibold">
                🏆 {params.achievements} achievement unlocked!
              </p>
            )}
          </div>
        )}

        <form
          action={submitPractice}
          className="space-y-4 rounded-xl border p-6"
        >
          <select
            name="practice_task_key"
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select Practice Task</option>

            {tasks?.map((task) => (
              <option key={task.key} value={task.key}>
                {task.name} — {task.xp_reward} XP
              </option>
            ))}
          </select>

          <input
            name="practiced_at"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />

          <textarea
            name="notes"
            placeholder="Notes optional: What did you work on?"
            className="w-full rounded border px-3 py-2"
          />

          <button className="w-full rounded bg-green-700 py-2 font-semibold text-white">
            Submit Practice
          </button>
        </form>
      </div>
    </main>
  );
}