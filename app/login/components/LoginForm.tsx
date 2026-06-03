"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginForm({
  passwordUpdated,
}: {
  passwordUpdated?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("rankedGolfEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  function handleSubmit() {
    if (rememberEmail && email) {
      window.localStorage.setItem("rankedGolfEmail", email);
    } else {
      window.localStorage.removeItem("rankedGolfEmail");
    }
  }

  return (
    <form
      action={login}
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-8 shadow-lg"
    >
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-gray-600">
          Log in to continue your Ranked Golf journey.
        </p>
      </div>

      {passwordUpdated && (
        <div className="mb-4 rounded-xl border bg-green-50 p-4 text-sm text-green-700">
          Your password has been updated. You can log in now.
        </div>
      )}

      <div className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border px-4 py-3"
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(event) => setRememberEmail(event.target.checked)}
            />
            Remember email
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button className="w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:opacity-90">
          Log In
        </button>
      </div>

      <div className="mt-6 text-center text-sm">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}