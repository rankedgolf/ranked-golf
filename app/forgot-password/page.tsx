import { createClient } from "@/lib/supabase/server";

export default function ForgotPasswordPage() {
  async function resetPassword(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const email = String(formData.get("email"));

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        action={resetPassword}
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg"
      >
        <h1 className="mb-2 text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mb-6 text-gray-600">
          Enter your email and we'll send you a password reset link.
        </p>

        <input
          name="email"
          type="email"
          required
          placeholder="Email Address"
          className="mb-4 w-full rounded-lg border px-4 py-3"
        />

        <button className="w-full rounded-lg bg-black py-3 font-semibold text-white">
          Send Reset Link
        </button>
      </form>
    </main>
  );
}