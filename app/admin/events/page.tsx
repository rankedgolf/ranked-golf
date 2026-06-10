import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
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

  return { supabase, currentUser };
}

async function createEvent(formData: FormData) {
  "use server";

  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") || "");

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("events").insert({
    title,
    slug,
    description: String(formData.get("description") || ""),
    event_type: String(formData.get("event_type") || "weekly"),
    start_date: String(formData.get("start_date")),
    end_date: String(formData.get("end_date")),
    course_id: String(formData.get("course_id") || "") || null,
    is_active: true,
    is_verified: false,
    max_players: Number(formData.get("max_players") || 0) || null,
    requires_proof: formData.get("requires_proof") === "on",
    requires_partner: formData.get("requires_partner") === "on",
    is_cash_event: formData.get("is_cash_event") === "on",
  });

  if (error) {
    console.error("Create event error:", error);
    redirect("/admin?error=create_failed");
  }

  redirect("/events");
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, city, state")
    .order("name", { ascending: true });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Create Event</h1>

        {params.error === "create_failed" && (
          <div className="mt-4 rounded-xl border bg-red-50 p-4 text-sm text-red-700">
            Something went wrong creating the event. Check the server console.
          </div>
        )}

        <form
          action={createEvent}
          className="mt-6 space-y-4 rounded-xl border p-6"
        >
          <input
            name="title"
            placeholder="Event title"
            required
            className="w-full rounded border px-3 py-2"
          />

          <textarea
            name="description"
            placeholder="Event description"
            className="w-full rounded border px-3 py-2"
          />

          <select
            name="event_type"
            defaultValue="weekly"
            className="w-full rounded border px-3 py-2"
          >
            <option value="weekly">Weekly Event</option>
            <option value="monthly">Monthly Event</option>
            <option value="regional">Regional Event</option>
          </select>

          <select
            name="course_id"
            className="w-full rounded border px-3 py-2"
          >
            <option value="">No specific course</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} — {course.city}, {course.state}
              </option>
            ))}
          </select>

          <input
            name="start_date"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="end_date"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="max_players"
            type="number"
            placeholder="Max players optional"
            className="w-full rounded border px-3 py-2"
          />

          <label className="flex items-center gap-2 rounded border p-3">
            <input type="checkbox" name="requires_proof" />
            <span>Requires proof upload</span>
          </label>

          <label className="flex items-center gap-2 rounded border p-3">
            <input type="checkbox" name="requires_partner" />
            <span>Requires playing partner verification</span>
          </label>

          <label className="flex items-center gap-2 rounded border p-3">
            <input type="checkbox" name="is_cash_event" />
            <span>Cash / prize event</span>
          </label>

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Create Event
          </button>
        </form>
      </div>
    </main>
  );
}