"use client";

import { useState, useTransition } from "react";
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
  const [following, setFollowing] = useState(isFollowing);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFollow() {
    const nextFollowing = !following;

    setFollowing(nextFollowing);
    setShowConfirmation(true);

    await toggleFollow({
      currentUserId,
      targetUserId,
      isFollowing: following,
    });

    setTimeout(() => {
      setShowConfirmation(false);
    }, 2500);
  }

  return (
    <div className="mt-3">
      <button
        onClick={() =>
          startTransition(async () => {
            await handleFollow();
          })
        }
        disabled={isPending}
        className={`rounded px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
          following
            ? "border bg-white text-black"
            : "bg-black text-white"
        }`}
      >
        {isPending ? "Updating..." : following ? "Following" : "Follow"}
      </button>

      {showConfirmation && (
        <p className="mt-2 text-sm font-medium text-green-700">
          {following ? "You are now following this golfer." : "You unfollowed this golfer."}
        </p>
      )}
    </div>
  );
}