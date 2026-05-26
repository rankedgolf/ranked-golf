import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseSearch from "./CourseSearch";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    state?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*")
    .order("state", { ascending: true })
    .order("name", { ascending: true });

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  if (params.state) {
    query = query.ilike("state", params.state);
  }

  const { data: courses } = await query;

  return (
    <main className="min-h-screen p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-gray-600">
          Browse approved courses in the Ranked Golf database.
        </p>
      </div>

      <CourseSearch />

      <div className="grid gap-4 md:grid-cols-2">
        {courses?.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="rounded-xl border p-5 transition hover:bg-gray-50"
          >
            <h2 className="text-xl font-bold">{course.name}</h2>

            <p className="mt-1 text-gray-600">
              {[course.city, course.state, course.country]
                .filter(Boolean)
                .join(", ")}
            </p>

            <p className="mt-3 text-sm text-gray-700">
              Par {course.par || "--"} • Rating {course.course_rating || "--"} •
              Slope {course.slope_rating || "--"}
            </p>
          </Link>
        ))}

        {!courses?.length && (
          <div className="rounded-xl border p-5 text-gray-600">
            No courses match your search.
          </div>
        )}
      </div>
    </main>
  );
}