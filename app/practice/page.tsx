import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PracticePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("user_practice_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("practiced_at", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: tasks } = await supabase
    .from("practice_tasks")
    .select("*");

  const taskMap = new Map(
    tasks?.map((task: any) => [task.key, task]) || []
  );

  const totalLogs = logs?.length || 0;

  const totalXp =
    logs?.reduce(
      (sum: number, log: any) => sum + Number(log.xp_awarded || 0),
      0
    ) || 0;

  const uniquePracticeDays = new Set(
    logs?.map((log: any) => log.practiced_at)
  ).size;

  const categoryCounts =
    logs?.reduce((acc: Record<string, number>, log: any) => {
      const category =
        taskMap.get(log.practice_task_key)?.category || "Other";

      acc[category] = (acc[category] || 0) + 1;

      return acc;
    }, {}) || {};

  const topCategory =
    Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "None yet";

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Practice Log</h1>

            <p className="text-gray-600">
              Track your development work and earn Developmental XP.
            </p>
          </div>

          <Link
            href="/submit-practice"
            className="rounded-xl bg-green-700 px-4 py-2 font-semibold text-white"
          >
            Submit Practice
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Practice Logs</p>

            <p className="mt-2 text-3xl font-bold">
              {totalLogs}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Practice Days</p>

            <p className="mt-2 text-3xl font-bold">
              {uniquePracticeDays}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Development XP</p>

            <p className="mt-2 text-3xl font-bold text-green-700">
              {totalXp}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Top Category</p>

            <p className="mt-2 text-2xl font-bold capitalize">
              {topCategory}
            </p>
          </div>
        </div>

        <section className="rounded-xl border bg-white">
          <div className="border-b p-5">
            <h2 className="text-xl font-bold">Recent Practice</h2>
          </div>

          <div className="divide-y">
            {logs?.map((log: any) => {
              const task = taskMap.get(log.practice_task_key);

              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-semibold">
                      {task?.name || log.practice_task_key}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {log.practiced_at} ·{" "}
                      <span className="capitalize">
                        {task?.category || "practice"}
                      </span>
                    </p>

                    {log.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    +{log.xp_awarded || 0} XP
                  </div>
                </div>
              );
            })}

            {!logs?.length && (
              <div className="p-5 text-gray-600">
                No practice logged yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}