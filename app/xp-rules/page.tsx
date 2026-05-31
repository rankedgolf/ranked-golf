import Link from "next/link";

export default function XPRulesPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">How XP Works</h1>
            <p className="mt-2 text-gray-600">
              Earn Campaign XP by playing, improving, competing, and unlocking achievements.
            </p>
          </div>

          <Link href="/dashboard" className="underline">
            Dashboard
          </Link>
        </div>

        <section className="rounded-xl border p-6">
          <h2 className="text-2xl font-bold">Recurring XP</h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Submit a round</span>
              <strong>+100 XP</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Birdie</span>
              <strong>+25 XP</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Eagle</span>
              <strong>+100 XP</strong>
            </div>

            <div className="flex justify-between">
              <span>Hole in One</span>
              <strong>+10,000 XP</strong>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border p-6">
          <h2 className="text-2xl font-bold">Achievement XP</h2>

          <p className="mt-3 text-gray-600">
            Achievements are one-time milestones like breaking 90, submitting 10 rounds,
            earning verified rounds, or playing different courses. 
          </p>

          <Link
            href="/achievements"
            className="mt-4 inline-block rounded bg-black px-4 py-2 font-semibold text-white"
          >
            View Achievements
          </Link>
        </section>

        <section className="mt-6 rounded-xl border p-6">
          <h2 className="text-2xl font-bold">XP Rankings</h2>

          <p className="mt-3 text-gray-600">
            XP Rankings are separate from the Ranked Golf World Rankings. World Rankings
            measure competitive performance. XP Rankings measure activity, progress,
            milestones, and campaign progression.
          </p>

          <Link
            href="/xp-leaderboard"
            className="mt-4 inline-block rounded bg-black px-4 py-2 font-semibold text-white"
          >
            View XP Rankings
          </Link>
        </section>
      </div>
    </main>
  );
}