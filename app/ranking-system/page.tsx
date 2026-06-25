import Link from "next/link";

export default function RankingSystemPage() {
  const pointTiers = [
    { differential: "Negative Differential", points: "75 pts" },
    { differential: "0.0 - 4.9", points: "65 pts" },
    { differential: "5.0 - 9.9", points: "55 pts" },
    { differential: "10.0 - 14.9", points: "45 pts" },
    { differential: "15.0 - 19.9", points: "35 pts" },
    { differential: "20.0+", points: "25 pts" },
  ];

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">How Rankings Work</h1>

        <p className="mt-4 text-gray-600">
          Ranked Golf World Rankings are based on score differential, course
          difficulty, verification level, and a player&apos;s best submitted
          rounds.
        </p>

        <section className="mt-8 space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Score Differential</h2>

            <p className="mt-2 text-gray-700">
              Every round is adjusted for course difficulty using course rating
              and slope rating.
            </p>

            <p className="mt-3 rounded bg-gray-100 p-3 font-mono text-sm">
              Score Differential = ((Score - Course Rating) × 113) / Slope
              Rating
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Round Points</h2>

            <p className="mt-2 text-gray-700">
              Each round receives base points based on the score differential.
              Lower differentials earn more ranking points.
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Score Differential</th>
                    <th className="p-3 text-right">Base Points</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pointTiers.map((tier) => (
                    <tr key={tier.differential}>
                      <td className="p-3">{tier.differential}</td>
                      <td className="p-3 text-right font-semibold">
                        {tier.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 className="text-2xl font-bold">Verification Weighting</h2>

<p className="mt-3 text-gray-600">
  Verification helps build trust, but rankings are primarily based on golf performance.
  Rounds with proof receive full ranking credit, while unverified rounds receive a small
  reduction until proof or verification is provided.
</p>

<div className="mt-4 rounded-xl border bg-white p-5">
  <ul className="space-y-2 text-gray-700">
    <li>
      <strong>Unverified rounds:</strong> 95% ranking weight
    </li>

    <li>
      <strong>Proof submitted rounds:</strong> 100% ranking weight
    </li>

    <li>
      <strong>Peer verified rounds:</strong> 100% ranking weight
    </li>

    <li>
      <strong>Event verified rounds:</strong> 100% ranking weight
    </li>
  </ul>
</div>

          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Leaderboard Ranking</h2>

            <p className="mt-2 text-gray-700">
              Players must submit at least 1 round to appear on the
              leaderboard. Rankings are based on the average of a player&apos;s
              best 8 round point scores in the current season.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Why Best 8 Rounds?</h2>

            <p className="mt-2 text-gray-700">
              This rewards strong performance without letting players dominate
              only by submitting more rounds than everyone else.
            </p>
          </div>
        </section>

        <div className="mt-8">
          <Link href="/leaderboard" className="underline">
            View Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}