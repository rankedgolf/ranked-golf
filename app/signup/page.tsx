import { signUp } from "../auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const referralCode = params.ref || "";

  const supabase = await createClient();

const { count: foundingMemberCount } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("is_founding_member", true)
  .eq("is_test_account", false);

  const foundingSpotsLeft = Math.max(
    0,
    100 - (foundingMemberCount || 0)
  );

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Founding Member
          </p>

          <p className="mt-2 text-xl font-extrabold">
            {foundingSpotsLeft} Founding Member Spots Remaining
          </p>

          <p className="mt-2 text-sm text-gray-600">
            The first 100 golfers to join Ranked Golf receive:
          </p>

          <ul className="mt-3 space-y-1 text-sm text-gray-700">
            <li>🏛️ Exclusive Founding Member Badge</li>
            <li>⚡ 500 Bonus XP</li>
            <li>👤 Recognition on Player Profile</li>
            <li>⭐ Free Pro Membership through December 31, 2026</li>
          </ul>
        </div>

        <form action={signUp} className="w-full rounded-xl border p-6">
          <h1 className="mb-6 text-2xl font-bold">
            Create Account
          </h1>

          {referralCode && (
            <div className="mb-4 rounded-xl border bg-green-50 p-3 text-sm text-green-700">
              Referral code applied:{" "}
              <span className="font-semibold">{referralCode}</span>
            </div>
          )}

          <input type="hidden" name="referral_code" value={referralCode} />

          <div className="space-y-4">
            <input
              name="display_name"
              type="text"
              placeholder="Display name"
              required
              className="w-full rounded border px-3 py-2"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded border px-3 py-2"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded border px-3 py-2"
            />

            <button className="w-full rounded bg-black py-2 font-semibold text-white">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}