import { signUp } from "../auth/actions";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      🏛️ Founding Member

The first 100 golfers to join Ranked Golf receive:

• Exclusive Founding Member badge
• 500 bonus XP
• Recognition on their player profile
• Free Pro Membership through December 31, 2026
      <form action={signUp} className="w-full max-w-md space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          name="display_name"
          type="text"
          placeholder="Display name"
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border rounded px-3 py-2"
        />

        <button className="w-full rounded bg-black text-white py-2 font-semibold">
          Sign Up
        </button>
      </form>
    </main>
  );
}