import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requestCourse(formData: FormData) {
  "use server";

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

  await supabase.from("course_requests").insert({
    user_id: currentUser.id,
    course_name: String(formData.get("course_name")),
    city: String(formData.get("city")),
    state: String(formData.get("state")),
    country: String(formData.get("country") || "USA"),
    website_url: String(formData.get("website_url") || ""),
    tee_box: String(formData.get("tee_box") || ""),
    par: Number(formData.get("par")),
    course_rating: Number(formData.get("course_rating")),
    slope_rating: Number(formData.get("slope_rating")),
    notes: String(formData.get("notes") || ""),
  });

  redirect("/submit-round");
}

export default function RequestCoursePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-2 text-3xl font-bold">Request New Course</h1>
        <p className="mb-6 text-gray-600">
          Submit a course for review. Once approved, it will appear in the round submission dropdown.
        </p>

        <form action={requestCourse} className="space-y-4 rounded-xl border p-6">
          <input name="course_name" placeholder="Course name" required className="w-full rounded border px-3 py-2" />
          <input name="city" placeholder="City" className="w-full rounded border px-3 py-2" />
          <input name="state" placeholder="State, ex: MA" className="w-full rounded border px-3 py-2" />
          <input name="country" placeholder="Country" defaultValue="USA" className="w-full rounded border px-3 py-2" />
          <input name="website_url" placeholder="Course website optional" className="w-full rounded border px-3 py-2" />
          <input name="tee_box" placeholder="Tee box played" className="w-full rounded border px-3 py-2" />

          <input name="par" type="number" placeholder="Par" required className="w-full rounded border px-3 py-2" />
          <input name="course_rating" type="number" step="0.1" placeholder="Course rating" required className="w-full rounded border px-3 py-2" />
          <input name="slope_rating" type="number" placeholder="Slope rating" required className="w-full rounded border px-3 py-2" />

          <textarea name="notes" placeholder="Notes optional" className="w-full rounded border px-3 py-2" />

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Submit Course Request
          </button>
        </form>
      </div>
    </main>
  );
}