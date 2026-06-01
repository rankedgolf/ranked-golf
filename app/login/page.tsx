import { login } from "../auth/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <form
          action={login}
          className="rounded-2xl border bg-white p-8 shadow-lg"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-gray-600">
              Log in to continue your Ranked Golf journey.
            </p>
          </div>

          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-lg border px-4 py-3"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-lg border px-4 py-3"
            />

            <button className="w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:opacity-90">
              Log In
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            Need an account?{" "}
            <Link
              href="/signup"
              className="font-semibold underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}