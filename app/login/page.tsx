import { login } from "../auth/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form action={login} className="w-full max-w-md space-y-4 border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Log In</h1>

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
          Log In
        </button>

        <p className="text-sm text-center">
          Need an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}