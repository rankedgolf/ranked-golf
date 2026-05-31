export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          Refund & Subscription Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last Updated: June 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold">
              Subscription Billing
            </h2>

            <p className="mt-2">
              Ranked Golf memberships are billed on a
              recurring monthly basis through Stripe.
            </p>

            <p className="mt-2">
              By subscribing, users authorize recurring
              billing until cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Cancellation Policy
            </h2>

            <p className="mt-2">
              Users may cancel subscriptions at any
              time through the Stripe billing portal.
            </p>

            <p className="mt-2">
              After cancellation, premium access may
              remain active through the end of the
              current billing period unless otherwise
              stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Refund Policy
            </h2>

            <p className="mt-2">
              Subscription payments are generally
              non-refundable except where required by
              applicable law.
            </p>

            <p className="mt-2">
              Ranked Golf may review refund requests
              on a case-by-case basis for billing
              errors or exceptional circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Future Competitive Events
            </h2>

            <p className="mt-2">
              Future tournament entry fees, prize
              events, or special competitions may be
              subject to separate rules, refund terms,
              and eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">
              Contact
            </h2>

            <p className="mt-2">
              For billing or subscription questions,
              please contact Ranked Golf through the
              platform contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}