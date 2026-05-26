import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">Membership</h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Ranked Golf is free to start. Submit rounds, build your profile,
          join standard events, and climb the rankings. Premium tools and
          advanced competitive features will be added as the platform grows.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <h2 className="text-2xl font-bold">Free</h2>
            <p className="mt-2 text-gray-600">Start competing.</p>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>Submit ranked rounds</li>
              <li>Public player profile</li>
              <li>Course leaderboards</li>
              <li>Standard event registration</li>
              <li>Activity feed access</li>
            </ul>

            <Link
              href="/signup"
              className="mt-6 inline-block rounded bg-black px-4 py-2 font-semibold text-white"
            >
              Join Free
            </Link>
          </div>

          <div className="rounded-xl border p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Coming Soon
            </p>

            <h2 className="mt-2 text-2xl font-bold">Pro</h2>
            <p className="mt-2 text-gray-600">More tools for serious players.</p>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>Advanced player stats</li>
              <li>Expanded leaderboard filters</li>
              <li>Historical season tracking</li>
              <li>Performance trends</li>
              <li>Premium profile features</li>
            </ul>
          </div>

          <div className="rounded-xl border p-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Future
            </p>

            <h2 className="mt-2 text-2xl font-bold">Competitive</h2>
            <p className="mt-2 text-gray-600">
              Built for higher-trust competitions as the community grows.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>Verified competition eligibility</li>
              <li>Partner-required events</li>
              <li>Prize-event access where available</li>
              <li>Season championship features</li>
              <li>Enhanced trust and verification tools</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}