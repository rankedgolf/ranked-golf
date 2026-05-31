export default function DisclaimerPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          Disclaimer
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last Updated: September 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold">
              General Information
            </h2>

            <p className="mt-2">
              Ranked Golf is an independent golf
              rankings, competition, and social
              platform intended for entertainment,
              community engagement, and competitive
              tracking purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Rankings & Statistics
            </h2>

            <p className="mt-2">
              Rankings, indexes, trends, statistics,
              and performance data are calculated
              using platform-specific systems and are
              not official handicaps or certified
              golf rankings unless explicitly stated.
            </p>

            <p className="mt-2">
              Rankings and statistics may change over
              time as rounds, verification status,
              and platform systems evolve.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              User-Submitted Content
            </h2>

            <p className="mt-2">
              Ranked Golf relies on user-submitted
              scores, verification systems, and
              community reporting. While efforts are
              made to maintain integrity and fair
              competition, Ranked Golf cannot
              guarantee the accuracy of all submitted
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Competitive Events
            </h2>

            <p className="mt-2">
              Future competitive events, tournaments,
              prize structures, or cash-based
              competitions may be subject to
              additional rules, eligibility
              requirements, geographic restrictions,
              and legal considerations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              No Professional Advice
            </h2>

            <p className="mt-2">
              Information provided through Ranked Golf
              does not constitute professional golf,
              financial, legal, or wagering advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Platform Availability
            </h2>

            <p className="mt-2">
              Ranked Golf may modify, suspend, or
              discontinue features, memberships,
              rankings systems, or events at any time
              without notice.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}