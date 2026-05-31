"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkSocialAchievements } from "@/lib/campaign/checkSocialAchievements";

export async function toggleFollow({
  currentUserId,
  targetUserId,
  isFollowing,
}: {
  currentUserId: string;
  targetUserId: string;
  isFollowing: boolean;
}) {
  const supabase = await createClient();

  if (isFollowing) {
    await supabase
      .from("player_follows")
      .delete()
      .eq("follower_user_id", currentUserId)
      .eq("following_user_id", targetUserId);
  } else {
    await supabase.from("player_follows").insert({
      follower_user_id: currentUserId,
      following_user_id: targetUserId,
    });

    await checkSocialAchievements(
      supabase,
      currentUserId
    );

    await checkSocialAchievements(
      supabase,
      targetUserId
    );
  }

  revalidatePath(`/players/${targetUserId}`);
}