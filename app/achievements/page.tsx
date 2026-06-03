import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAchievementProgress } from "@/lib/campaign/achievementProgress";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentUser = user || session?.user;

  if (!currentUser) redirect("/login");

  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("category", { ascending: true })
    .order("xp_reward", { ascending: true });

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_key, unlocked_at")
    .eq("user_id", currentUser.id);

  const unlockedKeys = new Set(
    unlocked?.map((item) => item.achievement_key) || []
  );

  const totalAchievements = achievements?.length || 0;
  const unlockedCount = unlockedKeys.size;

  const completionPercent =
    totalAchievements > 0
      ? Math.round((unlockedCount / totalAchievements) * 100)
      : 0;

  const { count: totalRounds } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true })
    .eq("user_id", currentUser.id);

  const { count: verifiedRounds } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true })
    .eq("user_id", currentUser.id)
    .gte("trust_level", 2);

  const { count: totalFollows } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_user_id", currentUser.id);

  const { count: totalFollowers } = await supabase
    .from("player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_user_id", currentUser.id);

  const { data: courseRows } = await supabase
    .from("rounds")
    .select("course_id, course_name")
    .eq("user_id", currentUser.id);

  const totalCourses = new Set(
    courseRows?.map((round: any) => round.course_id || round.course_name)
  ).size;

  const { data: practiceLogs } = await supabase
    .from("user_practice_logs")
    .select("practice_task_key")
    .eq("user_id", currentUser.id);

  const totalPracticeSessions = practiceLogs?.length || 0;

  const totalPracticeHours =
    practiceLogs?.reduce((sum: number, log: any) => {
      if (log.practice_task_key === "practice_30_min") return sum + 0.5;
      if (log.practice_task_key === "practice_60_min") return sum + 1;

      return sum;
    }, 0) || 0;

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-gray-600">
            Unlock milestones, earn XP, and build your Ranked Golf legacy.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/xp-rules" className="underline">
            How XP Works
          </Link>

          <Link href="/dashboard" className="underline">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Achievements Earned</p>
          <p className="mt-2 text-3xl font-bold">
            {unlockedCount} / {totalAchievements}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Completion</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {completionPercent}%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Achievement Status</p>
          <p className="mt-2 text-3xl font-bold">
            {completionPercent >= 75
              ? "Legend"
              : completionPercent >= 50
              ? "Elite"
              : completionPercent >= 25
              ? "Rising"
              : "Starter"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {achievements?.map((achievement) => {
          const isUnlocked = unlockedKeys.has(achievement.key);

          const progress = getAchievementProgress({
            achievementKey: achievement.key,
            totalRounds: totalRounds || 0,
            totalFollows: totalFollows || 0,
            totalFollowers: totalFollowers || 0,
            totalCourses,
            verifiedRounds: verifiedRounds || 0,
            totalPracticeSessions,
            totalPracticeHours,
          });

          const rarity = achievement.rarity || "common";

          const rarityClasses =
            rarity === "legendary"
              ? "bg-yellow-100 text-yellow-700"
              : rarity === "epic"
              ? "bg-purple-100 text-purple-700"
              : rarity === "rare"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700";

          const progressPercent = progress
            ? Math.min(
                100,
                Math.round((progress.current / progress.target) * 100)
              )
            : null;

          return (
            <div
              key={achievement.key}
              className={`rounded-xl border p-5 ${
                isUnlocked ? "bg-green-50" : "bg-white"
              }`}
            >
              <p className="text-3xl">{achievement.icon || "🏅"}</p>

              <div
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${rarityClasses}`}
              >
                {rarity}
              </div>

              <h2 className="mt-3 font-bold">{achievement.name}</h2>

              <p className="mt-1 text-sm capitalize text-gray-500">
                {achievement.category || "achievement"}
              </p>

              <p className="mt-3 text-sm font-semibold">
                +{achievement.xp_reward || 0} XP
              </p>

              {progress && !isUnlocked && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {Math.min(progress.current, progress.target)} /{" "}
                    {progress.target}
                  </p>
                </div>
              )}

              <p className="mt-3 text-sm">
                {isUnlocked ? "✅ Unlocked" : "🔒 Locked"}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}