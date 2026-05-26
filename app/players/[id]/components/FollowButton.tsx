"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

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
    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from("player_follows")
        .delete()
        .eq("follower_user_id", currentUserId)
        .eq("following_user_id", targetUserId);

      window.location.reload();
    } else {
      await supabase.from("player_follows").insert({
        follower_user_id: currentUserId,
        following_user_id: targetUserId,
      });

      window.location.reload();
    }
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await handleFollow();
        })
      }
      disabled={isPending}
      className="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}