import Link from "next/link";

export default function RankingSystemPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">How Rankings Work</h1>

        <p className="mt-4 text-gray-600">
          Ranked Golf World Rankings are based on your best submitted rounds,
          course difficulty, and round verification level.
        </p>

        <section className="mt-8 space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Round Points</h2>
            <p className="mt-2 text-gray-700">
              Each round receives a score based on your score differential.
            </p>
            <p className="mt-3 font-mono">
              Base Points = (50 - Score Differential) / 10
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Verification Weighting</h2>
            <p className="mt-2 text-gray-700">
              Rounds with proof or verification are weighted higher than
              unverified rounds.
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
              <li>Unverified rounds: 70%</li>
              <li>Proof submitted rounds: 90%</li>
              <li>Peer verified rounds: 100%</li>
              <li>Event verified rounds: 115%</li>
            </ul>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">Leaderboard Ranking</h2>
            <p className="mt-2 text-gray-700">
              Players must submit at least 3 rounds to appear on the leaderboard.
              Rankings are based on the average of a player&apos;s best 8 rounds
              in the current season.
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