export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last Updated: September 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold">
              Overview
            </h2>

            <p className="mt-2">
              Ranked Golf values your privacy. This
              Privacy Policy explains how we collect,
              use, and protect your information when
              using the Ranked Golf platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Information We Collect
            </h2>

            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                Account information including email,
                username, and profile details
              </li>

              <li>
                Golf-related activity including scores,
                rankings, events, and submitted rounds
              </li>

              <li>
                Verification content such as proof
                uploads or peer verification activity
              </li>

              <li>
                Billing and subscription information
                processed securely through Stripe
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              How We Use Information
            </h2>

            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                Operate rankings, profiles, and events
              </li>

              <li>
                Improve platform features and
                competitive systems
              </li>

              <li>
                Process subscriptions and membership
                access
              </li>

              <li>
                Help maintain trust, verification, and
                fair competition
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Public Information
            </h2>

            <p className="mt-2">
              Certain profile information, rankings,
              scores, and activity may be publicly
              visible within the Ranked Golf platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Third-Party Services
            </h2>

            <p className="mt-2">
              Ranked Golf uses trusted third-party
              providers including Stripe, Supabase,
              and Vercel to operate platform services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Data Security
            </h2>

            <p className="mt-2">
              We take reasonable measures to protect
              user information and platform data.
              However, no online platform can
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Contact
            </h2>

            <p className="mt-2">
              For privacy-related questions, please
              contact Ranked Golf through the platform
              contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}