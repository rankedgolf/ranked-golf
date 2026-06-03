import Link from "next/link";
import CheckoutButton from "./components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

const features = [
  { name: "Round Submission", free: true, pro: true },
  { name: "Handicap Tracking", free: true, pro: true },
  { name: "Ranked Golf World Rankings", free: true, pro: true },
  { name: "XP System", free: true, pro: true },
  { name: "Achievements", free: true, pro: true },
  { name: "Social Features", free: true, pro: true },
  { name: "Practice Log", free: true, pro: true },
  { name: "Practice XP", free: true, pro: true },
  { name: "Full Campaign Mode", free: false, pro: true },
  { name: "Practice Achievements", free: false, pro: true },
  { name: "Advanced Achievements", free: false, pro: true },
  { name: "Seasonal Challenge Pass", free: false, pro: true },
  { name: "Advanced Stats", free: false, pro: true },
  { name: "Historical Rankings", free: false, pro: true },
  { name: "Advanced Missions", free: false, pro: true },
];

function FeatureValue({ included }: { included: boolean }) {
  return (
    <span
      className={
        included
          ? "font-bold text-green-700"
          : "font-bold text-gray-300"
      }
    >
      {included ? "✓" : "—"}
    </span>
  );
}

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("membership_tier")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const membershipTier = profile?.membership_tier || "free";

  const isPro =
    membershipTier === "pro" || membershipTier === "competitive";

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-700">
            Ranked Golf Membership
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Start free. Upgrade when you want the full campaign experience.
          </h1>

          <p className="mt-4 text-gray-600">
            Submit rounds, build your profile, climb rankings, earn XP,
            and track your golf journey for free. Pro unlocks deeper
            progression, premium achievements, advanced stats, and seasonal
            campaign features.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* FREE */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Free</h2>

            <p className="mt-2 text-gray-600">
              Everything you need to start competing and building your Ranked
              Golf profile.
            </p>

            <div className="mt-6">
              <p className="text-4xl font-extrabold">$0</p>
              <p className="text-sm text-gray-500">Forever</p>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✓ Submit ranked rounds</li>
              <li>✓ Track handicap</li>
              <li>✓ Compete in Ranked Golf World Rankings</li>
              <li>✓ Earn XP and unlock achievements</li>
              <li>✓ Follow golfers and build your profile</li>
              <li>✓ Log practice activity</li>
            </ul>

            {user ? (
              <Link
                href="/dashboard"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-center font-semibold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-center font-semibold text-white"
              >
                Join Free
              </Link>
            )}
          </div>

          {/* PRO */}
          <div className="relative rounded-2xl border-2 border-green-700 bg-white p-6 shadow-md">
            <div className="absolute right-6 top-6 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              Best Value
            </div>

            <h2 className="text-2xl font-bold">Pro</h2>

            <p className="mt-2 text-gray-600">
              For golfers who want the full Ranked Golf campaign, practice,
              stats, and progression experience.
            </p>

            <div className="mt-6">
              <div className="mt-6">
  <p className="text-5xl font-extrabold">
    $5.99
  </p>

  <p className="text-sm text-gray-500">
    per month
  </p>

  <p className="mt-2 text-sm font-medium text-green-700">
    Or save 20% with annual billing
  </p>
</div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✓ Full Campaign Mode</li>
              <li>✓ Practice achievements and Development XP progression</li>
              <li>✓ Advanced achievements and premium missions</li>
              <li>✓ Seasonal Challenge Pass access</li>
              <li>✓ Advanced stats and performance trends</li>
              <li>✓ Historical rankings and deeper player insights</li>
            </ul>

            {isPro ? (
              <div className="mt-8 w-full rounded-xl bg-gray-100 px-4 py-3 text-center font-semibold text-gray-700">
                Current Plan
              </div>
          ) : (
  <div className="mt-8 space-y-3">
  <CheckoutButton tier="pro" billingInterval="monthly">
    Upgrade to Pro • $5.99/mo
  </CheckoutButton>

  <CheckoutButton tier="pro" billingInterval="annual">
    Upgrade Annual • Save 20%
  </CheckoutButton>
</div>
)}
          </div>
        </div>

        <section className="mt-12 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-2xl font-bold">
              Feature Breakdown
            </h2>

            <p className="mt-2 text-gray-600">
              Free users get the core golf platform. Pro users unlock the full
              progression, campaign, and advanced tracking system.
            </p>
          </div>

          <div>
  <table className="w-full table-fixed text-left text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[60%] p-3 font-semibold md:p-4">Feature</th>
<th className="w-[20%] p-3 text-center font-semibold md:p-4">Free</th>
<th className="w-[20%] p-3 text-center font-semibold md:p-4">Pro</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {features.map((feature) => (
                  <tr key={feature.name}>
                    <td className="break-words p-3 font-medium md:p-4">
                      {feature.name}
                    </td>

                    <td className="p-3 text-center md:p-4">
                      <FeatureValue included={feature.free} />
                    </td>

                    <td className="p-3 text-center md:p-4">
                      <FeatureValue included={feature.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-8 rounded-2xl border bg-white p-6 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-black">Launch note:</span>{" "}
            Ranked Golf will continue expanding Pro features over time,
            including advanced missions, richer performance analytics,
            historical ranking trends, and seasonal campaign rewards.
          </p>
        </div>
      </div>
    </main>
  );
}