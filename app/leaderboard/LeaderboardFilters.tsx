"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LeaderboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/leaderboard?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <select
        defaultValue={searchParams.get("season") || ""}
        onChange={(e) =>
          updateFilter("season", e.target.value)
        }
        className="rounded border px-3 py-2"
      >
        <option value="">Current Season</option>
        <option value="all">All-Time</option>
      </select>

      <select
  defaultValue={searchParams.get("following") || ""}
  onChange={(e) =>
    updateFilter("following", e.target.value)
  }
  className="rounded border px-3 py-2"
>
  <option value="">All Players</option>
  <option value="true">Following Only — Pro</option>
</select>

      <select
        defaultValue={searchParams.get("round_type") || ""}
        onChange={(e) =>
          updateFilter("round_type", e.target.value)
        }
        className="rounded border px-3 py-2"
      >
        <option value="">
          All Round Types — Pro
        </option>

        <option value="solo">Solo</option>
        <option value="group">Group</option>
        <option value="event">Event</option>
      </select>

      <select
        defaultValue={searchParams.get("trust") || ""}
        onChange={(e) =>
          updateFilter("trust", e.target.value)
        }
        className="rounded border px-3 py-2"
      >
        <option value="">
          All Trust Levels — Pro
        </option>

        <option value="1">
          Proof Submitted+
        </option>

        <option value="2">
          Verified Rounds Only
        </option>

        <option value="3">
          Event Verified+
        </option>

        <option value="4">
          Admin Verified
        </option>
      </select>

      <select
        defaultValue={searchParams.get("division") || ""}
        onChange={(e) =>
          updateFilter("division", e.target.value)
        }
        className="rounded border px-3 py-2"
      >
        <option value="">All Divisions</option>

        <option value="Championship">
          Championship
        </option>

        <option value="A Flight">
          A Flight
        </option>

        <option value="B Flight">
          B Flight
        </option>

        <option value="C Flight">
          C Flight
        </option>

        <option value="D Flight">
          D Flight
        </option>
      </select>

      <input
        defaultValue={searchParams.get("state") || ""}
        onChange={(e) =>
          updateFilter("state", e.target.value)
        }
        placeholder="State, ex: MA"
        className="rounded border px-3 py-2"
      />
    </div>
  );
}