import Link from "next/link";

const guides = [
  {
    title: "1. Create Your Player Profile",
    description:
      "Sign up, choose your display name, add your location, and start building your Ranked Golf identity.",
    steps: [
      "Create a free account.",
      "Complete your player profile.",
      "Use your profile as your public golf résumé.",
    ],
  },
  {
    title: "2. Submit Your First Round",
    description:
      "Enter a real round from any course and immediately start earning ranking points and XP.",
    steps: [
      "Select your course.",
      "Enter tee box, par, rating, slope, score, holes, and date played.",
      "Choose whether the round appears on the public activity feed.",
      "Submit and see your stats update.",
    ],
  },
  {
    title: "3. Climb the Leaderboard",
    description:
      "Ranked Golf uses your submitted rounds to calculate ranking points and place you on the leaderboard.",
    steps: [
      "Submit at least one round.",
      "Earn ranking points based on score differential.",
      "Improve your ranking by submitting stronger rounds.",
      "Filter rankings by season, division, state, and more.",
    ],
  },
  {
    title: "4. Join Events",
    description:
      "Compete in Ranked Golf events, submit eligible rounds, and climb event leaderboards.",
    steps: [
      "Visit the Events page.",
      "Join an active or upcoming event.",
      "Submit a round during the event window.",
      "Track your position on the event leaderboard.",
    ],
  },
  {
    title: "5. Earn XP and Achievements",
    description:
      "Every round, milestone, practice session, and big golf moment helps build your Ranked Golf legacy.",
    steps: [
      "Earn XP for submitting rounds.",
      "Unlock achievements for milestones like breaking 90, making birdies, or recording an eagle.",
      "Level up your player profile.",
      "Show off badges on your public profile.",
    ],
  },
  {
    title: "6. Use the Activity Feed",
    description:
      "The activity feed lets golfers see recent rounds, give props, comment, and follow other players.",
    steps: [
      "View recent public rounds.",
      "Give Props to other golfers.",
      "Comment on rounds.",
      "Get notifications when others interact with your rounds.",
    ],
  },
  {
    title: "7. Invite Friends",
    description:
      "Use your referral link to invite golfers and earn XP when they join Ranked Golf.",
    steps: [
      "Copy your invite link from the dashboard.",
      "Send it to golf friends, leagues, groups, or playing partners.",
      "Earn referral credit when they sign up.",
      "Receive bonus XP for successful referrals.",
    ],
  },
  {
    title: "8. Track Your Golf Map",
    description:
      "Pro members can build a map of the cities, states, and courses they have played.",
    steps: [
      "Submit rounds with course location data.",
      "Ranked Golf maps your played cities automatically.",
      "View courses, cities, and states played.",
      "Request manual additions for past golf trips.",
    ],
  },
  {
    title: "9. Verify Rounds",
    description:
      "Proof and peer verification help build trust and strengthen the competitive experience.",
    steps: [
      "Upload scorecard or app proof when submitting a round.",
      "Submit playing partner emails when available.",
      "Earn stronger trust status as rounds are verified.",
      "Build a more credible player profile.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-2xl border bg-gradient-to-br from-green-50 to-white p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Ranked Golf Guide
          </p>

          <h1 className="mt-3 text-4xl font-extrabold">
            How Ranked Golf Works
          </h1>

          <p className="mt-4 max-w-3xl text-gray-600">
            Ranked Golf turns real golf rounds into rankings, XP, achievements,
            events, social activity, and a public player profile. Submit rounds,
            climb leaderboards, compete with friends, and build your golf legacy.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
            >
              Join Free
            </Link>

            <Link
              href="/submit-round"
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Submit a Round
            </Link>

            <Link
              href="/leaderboard"
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              View Leaderboard
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border p-6">
          <h2 className="text-2xl font-bold">Quick Start</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border p-4">
              <p className="text-2xl">👤</p>
              <h3 className="mt-2 font-bold">Sign Up</h3>
              <p className="mt-1 text-sm text-gray-600">
                Create your player profile.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-2xl">⛳</p>
              <h3 className="mt-2 font-bold">Submit Round</h3>
              <p className="mt-1 text-sm text-gray-600">
                Add your first real golf round.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-2xl">🏆</p>
              <h3 className="mt-2 font-bold">Get Ranked</h3>
              <p className="mt-1 text-sm text-gray-600">
                Appear on the leaderboard after one round.
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-2xl">🚀</p>
              <h3 className="mt-2 font-bold">Build Legacy</h3>
              <p className="mt-1 text-sm text-gray-600">
                Earn XP, badges, props, and event results.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5">
          {guides.map((guide) => (
            <div key={guide.title} className="rounded-2xl border p-6">
              <h2 className="text-2xl font-bold">{guide.title}</h2>

              <p className="mt-2 text-gray-600">{guide.description}</p>

              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border bg-black p-8 text-white">
          <h2 className="text-2xl font-bold">
            Ready to start your Ranked Golf journey?
          </h2>

          <p className="mt-2 text-gray-300">
            Submit one round, get ranked, and start building your golf legacy.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black"
            >
              Create Account
            </Link>

            <Link
              href="/events"
              className="rounded-xl border border-white px-5 py-3 font-semibold"
            >
              View Events
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}