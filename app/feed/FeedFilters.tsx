"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FeedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/feed?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
     <select
  defaultValue={searchParams.get("filter") || ""}
  onChange={(e) => updateFilter("filter", e.target.value)}
  className="rounded border px-3 py-2"
>
  <option value="">All Activity</option>
  <option value="following">Following</option>
  <option value="verified">Verified Only</option>
</select>
    </div>
  );
}