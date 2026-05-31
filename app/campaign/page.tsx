import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, membership_tier")
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  const membershipTier = profile?.membership_tier?.toLowerCase();

  const hasChallengePass =
    membershipTier === "pro" || membershipTier === "competitive";

  const { data: missions } = await supabase
    .from("missions")
    .select("*")
    .eq("is_active", true)
    .order("xp_reward");

  const today = new Date().toISOString().slice(0, 10);

  const { data: completedMissions } = await supabase
    .from("user_missions")
    .select("mission_key")
    .eq("user_id", user.id)
    .eq("completed_on", today);

  const completedMissionKeys = new Set(
    completedMissions?.map((m) => m.mission_key) ?? []
  );

  const { data: challenges } = await supabase
    .from("challenge_definitions")
    .select("*")
    .eq("is_active", true)
    .eq("season", "summer_2026")
    .order("xp_reward");

  const { data: progress } = await supabase
    .from("user_challenge_progress")
    .select("*")
    .eq("user_id", user.id);

  const progressMap = new Map(
    progress?.map((p) => [p.challenge_key, p]) ?? []
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-4xl font-bold">
        🏆 Summer 2026 Challenge Pass
      </h1>

      <p className="mb-8 mt-2 text-zinc-500">
        Complete challenges, earn XP, unlock rewards, and prove you're one of
        the most active golfers this season.
      </p>

      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Total XP</h2>
        <p className="mt-2 text-4xl font-bold text-emerald-600">
          {profile?.xp?.toLocaleString() ?? 0}
        </p>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Daily Missions</h2>

      <div className="mb-10 grid gap-4">
        {missions?.map((mission) => {
          const completed = completedMissionKeys.has(mission.key);

          return (
            <div
              key={mission.key}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{mission.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {mission.description}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-semibold">{mission.xp_reward} XP</div>
                  <div
                    className={
                      completed
                        ? "text-sm font-semibold text-emerald-600"
                        : "text-sm font-semibold text-amber-600"
                    }
                  >
                    {completed ? "Complete" : "Active"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 text-2xl font-bold">Summer Challenges</h2>

      {hasChallengePass ? (
        <div className="grid gap-4">
          {challenges?.map((challenge) => {
            const userProgress = progressMap.get(challenge.key);
            const progressValue = userProgress?.progress ?? 0;
            const target = challenge.target_value ?? 1;
            const percent = Math.min((progressValue / target) * 100, 100);
            const completed = progressValue >= target;

            return (
              <div
                key={challenge.key}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{challenge.name}</h3>
                    <p className="text-sm text-zinc-500">
                      {challenge.description}
                    </p>
                  </div>

                  <div
  className={
    completed
      ? "rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
      : "rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700"
  }
>
  {completed ? "🏆 Completed" : `${challenge.xp_reward} XP`}
</div>
                </div>

                <div className="h-3 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-2 text-sm text-zinc-500">
  {completed ? "Challenge complete" : `${progressValue} / ${target}`}
</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
          <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Premium Challenge Pass
          </p>

          <h3 className="mt-3 text-3xl font-bold text-zinc-950">
            🔒 Summer 2026 Challenge Pass Locked
          </h3>

          <p className="mb-5 mt-2 text-zinc-600">
            Upgrade to Pro or Competitive to unlock season-long challenges, XP
            rewards, badges, and premium progression.
          </p>

          <div className="mb-5 grid gap-3">
            {challenges?.slice(0, 5).map((challenge) => (
              <div
                key={challenge.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
              >
                <div>
                  <h4 className="font-semibold text-zinc-900">
                    🔒 {challenge.name}
                  </h4>
                  <p className="text-sm text-zinc-500">
                    {challenge.description}
                  </p>
                </div>

                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                  {challenge.xp_reward} XP
                </div>
              </div>
            ))}
          </div>

          <a
            href="/pricing"
            className="inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
          >
            Upgrade to Unlock
          </a>
        </div>
      )}
    </div>
  );
}