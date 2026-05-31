export default function TermsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          Terms of Service
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last Updated: September 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold">
              Acceptance of Terms
            </h2>

            <p className="mt-2">
              By using Ranked Golf, you agree to these
              Terms of Service and all applicable laws
              and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Platform Purpose
            </h2>

            <p className="mt-2">
              Ranked Golf is a competitive golf
              rankings and social platform designed
              for golfers to track rounds, compare
              performance, participate in events, and
              engage with the golf community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              User Conduct
            </h2>

            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                Users are expected to submit honest
                and accurate scores
              </li>

              <li>
                Fraudulent activity, manipulation, or
                abuse of rankings may result in
                suspension or removal
              </li>

              <li>
                Harassment, abuse, or harmful conduct
                toward other users is prohibited
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Rankings & Verification
            </h2>

            <p className="mt-2">
              Ranked Golf rankings, trust levels, and
              verification systems are provided for
              entertainment and competitive purposes.
              Ranked Golf reserves the right to review,
              adjust, or remove rounds, rankings, or
              accounts where integrity concerns exist.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Memberships & Billing
            </h2>

            <p className="mt-2">
              Paid memberships are processed securely
              through Stripe. Subscription features,
              pricing, and availability may change
              over time.
            </p>

            <p className="mt-2">
              Users may manage or cancel subscriptions
              through the Stripe billing portal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Intellectual Property
            </h2>

            <p className="mt-2">
              Ranked Golf branding, platform design,
              rankings systems, and original content
              are protected intellectual property and
              may not be copied or redistributed
              without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Limitation of Liability
            </h2>

            <p className="mt-2">
              Ranked Golf is provided on an "as is"
              basis without warranties of any kind.
              Ranked Golf is not responsible for
              losses, damages, disputes, or issues
              arising from platform use, rankings,
              events, or user-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Changes to Terms
            </h2>

            <p className="mt-2">
              Ranked Golf may update these Terms of
              Service at any time as the platform
              evolves.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}