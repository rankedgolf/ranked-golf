import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function updatePassword(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (!password || password.length < 6) {
    redirect("/update-password?error=password_short");
  }

  if (password !== confirmPassword) {
    redirect("/update-password?error=password_mismatch");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Update password error:", error);
    redirect("/update-password?error=update_failed");
  }

  redirect("/login?password=updated");
}

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <form
        action={updatePassword}
        className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg"
      >
        <h1 className="mb-2 text-3xl font-bold">Update Password</h1>

        <p className="mb-6 text-gray-600">
          Enter a new password for your Ranked Golf account.
        </p>

        {params.error && (
          <div className="mb-4 rounded-xl border bg-red-50 p-4 text-sm text-red-700">
            {params.error === "password_short" &&
              "Password must be at least 6 characters."}

            {params.error === "password_mismatch" &&
              "Passwords do not match."}

            {params.error === "update_failed" &&
              "Something went wrong updating your password. Please try again."}
          </div>
        )}

        <div className="space-y-4">
          <input
            name="password"
            type="password"
            required
            placeholder="New Password"
            className="w-full rounded-lg border px-4 py-3"
          />

          <input
            name="confirm_password"
            type="password"
            required
            placeholder="Confirm New Password"
            className="w-full rounded-lg border px-4 py-3"
          />

          <button className="w-full rounded-lg bg-black py-3 font-semibold text-white">
            Update Password
          </button>
        </div>
      </form>
    </main>
  );
}