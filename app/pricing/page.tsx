import Link from "next/link";
import CheckoutButton from "./components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

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

const membershipTier =
  profile?.membership_tier || "free";

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">
          Ranked Golf Membership
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Ranked Golf is free to start. Submit rounds, build your
          profile, join events, and compete on the rankings. As the
          platform grows, premium memberships will unlock deeper
          statistics, advanced competitive features, and higher-trust
          events.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* FREE */}
          <div className="rounded-2xl border p-6">
            <h2 className="text-2xl font-bold">Free</h2>

            <p className="mt-2 text-gray-600">
              Start competing and build your Ranked Golf profile.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
             <li>✓ Submit competitive ranked rounds</li>
<li>✓ Build your public golfer profile</li>
<li>✓ Climb the Ranked Golf leaderboards</li>
<li>✓ Join community events and challenges</li>
<li>✓ Track your scores and golf journey</li>
<li>✓ Compare stats across courses and seasons</li>
            </ul>

            <Link
              href="/signup"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-center font-semibold text-white"
            >
              Join Free
            </Link>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border-2 border-black p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Pro</h2>
            </div>

            <p className="mt-2 text-gray-600">
              For golfers who want deeper stats and better tracking.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✓ Unlock advanced player analytics</li>
<li>✓ Track recent form and performance trends</li>
<li>✓ Access following-only feeds and leaderboards</li>
<li>✓ Build rivalries and compare against friends</li>
<li>✓ Enhanced player profile and premium insights</li>
<li>✓ Deep historical and season-by-season tracking</li>
            </ul>

           {membershipTier === "pro" || membershipTier === "competitive" ? (
  <div className="mt-8 w-full rounded-xl bg-gray-100 px-4 py-3 text-center font-semibold text-gray-700">
    {membershipTier === "pro" ? "Current Plan" : "Included in Competitive"}
  </div>
) : (
  <CheckoutButton tier="pro">
    Upgrade to Pro
  </CheckoutButton>
)}
          </div>

          {/* COMPETITIVE */}
          <div className="rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Competitive
              </h2>
            </div>

            <p className="mt-2 text-gray-600">
              Built for higher-trust competition as the community grows.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li>✓ Access elite verified competitions</li>
<li>✓ Enter higher-trust and partner events</li>
<li>✓ Qualify for future prize and cash tournaments</li>
<li>✓ Compete for season championships and rankings</li>
<li>✓ Advanced competitive verification ecosystem</li>
<li>✓ Priority access to premium tournament features</li>
            </ul>

            {membershipTier === "competitive" ? (
  <div className="mt-8 w-full rounded-xl bg-gray-100 px-4 py-3 text-center font-semibold text-gray-700">
    Current Plan
  </div>
) : (
  <CheckoutButton tier="competitive">
    Upgrade to Competitive
  </CheckoutButton>
)}
          </div>
        </div>
      </div>
    </main>
  );
}