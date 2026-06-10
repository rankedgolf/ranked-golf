import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
  data: { user },
} = await supabase.auth.getUser();

const {
  data: { session },
} = await supabase.auth.getSession();

const currentUser = user || session?.user;

if (!currentUser) {
  redirect("/login");
}

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Admin Hub</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/admin/events" className="rounded-xl border p-5 hover:bg-gray-50">
            <h2 className="text-xl font-bold">Create Events</h2>
            <p className="mt-2 text-sm text-gray-600">
              Build weekly, monthly, and prize events.
            </p>
          </Link>

          <Link href="/admin/course-requests" className="rounded-xl border p-5 hover:bg-gray-50">
            <h2 className="text-xl font-bold">Course Requests</h2>
            <p className="mt-2 text-sm text-gray-600">
              Approve or reject submitted courses.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}