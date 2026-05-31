"use client";

import { useTransition } from "react";
import { toggleFollow } from "./actions";

export default function FollowButton({
  currentUserId,
  targetUserId,
  isFollowing,
}: {
  currentUserId: string;
  targetUserId: string;
  isFollowing: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleFollow() {
    await toggleFollow({
      currentUserId,
      targetUserId,
      isFollowing,
    });

    window.location.reload();
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await handleFollow();
        })
      }
      disabled={isPending}
      className="rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {isPending
        ? "Loading..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </button>
  );
}