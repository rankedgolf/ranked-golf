import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLevelTitle } from "@/lib/campaign/levelTitles";

export default async function XPLeaderboardPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("profiles")
    .select("user_id, username, display_name, xp, level")
    .eq("is_test_account", false)
    .order("xp", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            XP Leaderboard
          </h1>

          <p className="text-gray-600">
            Ranked by lifetime campaign XP.
          </p>
        </div>

        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </div>

    <div className="w-full overflow-x-auto rounded-xl border">
  <table className="min-w-[600px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-right">XP</th>
            </tr>
          </thead>

          <tbody>
            {players?.map((player, index) => {
              const levelInfo = getLevelTitle(
                Number(player.level || 1)
              );

              return (
                <tr
                  key={`${player.display_name}-${index}`}
                  className="border-t"
                >
                  <td className="p-3">
                    #{index + 1}
                  </td>

                  <td className="p-3">
  <Link
    href={`/players/${player.username || player.user_id}`}
    className="font-semibold underline"
  >
    {player.display_name || "Player"}
  </Link>
</td>

                  <td className="p-3">
                    {levelInfo.emblem} {levelInfo.title}
                  </td>

                  <td className="p-3 text-right font-bold">
                    {Number(player.xp || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}