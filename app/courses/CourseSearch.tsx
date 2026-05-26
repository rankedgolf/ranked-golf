"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CourseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/courses?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <input
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        placeholder="Search courses"
        className="rounded border px-3 py-2"
      />

      <input
        defaultValue={searchParams.get("state") || ""}
        onChange={(e) => updateFilter("state", e.target.value)}
        placeholder="State, ex: MA"
        className="rounded border px-3 py-2"
      />
    </div>
  );
}