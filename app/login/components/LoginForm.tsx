"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { login } from "@/app/auth/actions";

export default function LoginForm({
  passwordUpdated,
  next,
}: {
  passwordUpdated?: boolean;
  next?: string;
}) {

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);

  useEffect(() => {
    const savedLogin = window.localStorage.getItem("rankedGolfLogin");

    if (savedLogin) {
      setLoginIdentifier(savedLogin);
      setRememberLogin(true);
    }
  }, []);

  function handleSubmit() {
    if (rememberLogin && loginIdentifier) {
      window.localStorage.setItem("rankedGolfLogin", loginIdentifier);
    } else {
      window.localStorage.removeItem("rankedGolfLogin");
    }
  }

  return (
    <form
      action={login}
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-8 shadow-lg"
    >
      <input
  type="hidden"
  name="next"
  value={next || "/dashboard"}
/>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-gray-600">
          Log in with your email or display name.
        </p>
      </div>

      {passwordUpdated && (
        <div className="mb-4 rounded-xl border bg-green-50 p-4 text-sm text-green-700">
          Your password has been updated. You can log in now.
        </div>
      )}

      <div className="space-y-4">
        <input
          name="login_identifier"
type="text"
placeholder="Email or display name"
autoComplete="username"
          value={loginIdentifier}
          onChange={(event) => setLoginIdentifier(event.target.value)}
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
              checked={rememberLogin}
              onChange={(event) => setRememberLogin(event.target.checked)}
            />
            Remember me
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