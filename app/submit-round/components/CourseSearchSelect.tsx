"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

export default function CourseSearchSelect() {
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [results, setResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function searchCourses() {
      const q = query.trim();

      if (q.length < 2 || selectedCourseId) {
        setResults([]);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("id, name, city, state")
        .or(`name.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`)
        .order("name", { ascending: true })
        .limit(25);

      if (!error) {
        setResults(data || []);
      }

      setLoading(false);
    }

    const timeout = setTimeout(searchCourses, 250);

    return () => clearTimeout(timeout);
  }, [query, selectedCourseId, supabase]);

  return (
    <div>
      <input
        type="hidden"
        name="course_id"
        value={selectedCourseId}
        required
      />

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedCourseId("");
        }}
        placeholder="Search course name, city, or state"
        className="w-full rounded border px-3 py-2"
        required
      />

      {loading && (
        <p className="mt-2 text-sm text-gray-500">
          Searching courses...
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded border bg-white">
          {results.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => {
                setSelectedCourseId(course.id);
                setQuery(
                  `${course.name} — ${course.city || ""}, ${course.state || ""}`
                );
                setResults([]);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            >
              <span className="font-semibold">{course.name}</span>
              <span className="text-gray-500">
                {" "}
                — {course.city}, {course.state}
              </span>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && !selectedCourseId && (
        <p className="mt-2 text-sm text-gray-500">
          No courses found. Try a different spelling or request the course.
        </p>
      )}
    </div>
  );
}