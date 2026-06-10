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
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return { supabase, currentUser };
}

async function approveCourseRequest(formData: FormData) {
  "use server";

  const { supabase } = await requireAdmin();

  const requestId = String(formData.get("request_id"));

  const { data: request, error: requestError } = await supabase
    .from("course_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    console.error("Course request lookup error:", requestError);
    redirect("/admin/course-requests");
  }

  const { error: courseInsertError } = await supabase.from("courses").insert({
    name: request.course_name,
    city: request.city,
    state: request.state,
    country: request.country,
    par: request.par,
    course_rating: request.course_rating,
    slope_rating: request.slope_rating,
    is_verified: true,
  });

  if (courseInsertError) {
    console.error("Course insert error:", courseInsertError);
    redirect("/admin/course-requests");
  }

  const { error: requestUpdateError } = await supabase
    .from("course_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (requestUpdateError) {
    console.error("Course request update error:", requestUpdateError);
    redirect("/admin/course-requests");
  }

  redirect("/admin/course-requests");
}

async function rejectCourseRequest(formData: FormData) {
  "use server";

  const { supabase } = await requireAdmin();

  const requestId = String(formData.get("request_id"));

  await supabase
    .from("course_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  redirect("/admin/course-requests");
}

export default async function CourseRequestsAdminPage() {
  const { supabase } = await requireAdmin();

  const { data: requests } = await supabase
    .from("course_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Course Requests</h1>

      <p className="mt-2 text-gray-600">
        Review requested courses and approve them into the official course database.
      </p>

      <div className="mt-8 space-y-4">
        {requests?.map((request) => (
          <div key={request.id} className="rounded-xl border p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h2 className="text-xl font-bold">{request.course_name}</h2>

                <p className="text-gray-600">
                  {[request.city, request.state, request.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                  <p>
                    <strong>Tee:</strong> {request.tee_box || "--"}
                  </p>

                  <p>
                    <strong>Par:</strong> {request.par || "--"}
                  </p>

                  <p>
                    <strong>Rating:</strong> {request.course_rating || "--"}
                  </p>

                  <p>
                    <strong>Slope:</strong> {request.slope_rating || "--"}
                  </p>

                  <p>
                    <strong>Status:</strong> {request.status}
                  </p>
                </div>

                {request.website_url && (
                  <p className="mt-2 text-sm">
                    <strong>Website:</strong>{" "}
                    <a
                      href={request.website_url}
                      target="_blank"
                      className="underline"
                    >
                      {request.website_url}
                    </a>
                  </p>
                )}

                {request.notes && (
                  <p className="mt-3 text-sm text-gray-700">
                    <strong>Notes:</strong> {request.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <form action={approveCourseRequest}>
                  <input type="hidden" name="request_id" value={request.id} />

                  <button className="rounded bg-green-700 px-4 py-2 font-semibold text-white">
                    Approve
                  </button>
                </form>

                <form action={rejectCourseRequest}>
                  <input type="hidden" name="request_id" value={request.id} />

                  <button className="rounded bg-red-700 px-4 py-2 font-semibold text-white">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {!requests?.length && (
          <div className="rounded-xl border p-5 text-gray-600">
            No pending course requests.
          </div>
        )}
      </div>
    </main>
  );
}