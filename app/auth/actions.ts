"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/campaign/awardXP";

export async function signUp(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const displayName = String(formData.get("display_name"));

  const referralCode = String(formData.get("referral_code") || "")
    .trim()
    .toUpperCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  if (data.user) {
   const { count: foundingMemberCount } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("is_founding_member", true)
  .eq("is_test_account", false);

    const isFoundingMember = (foundingMemberCount || 0) < 100;

    let referredBy: string | null = null;

    if (referralCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", referralCode)
        .maybeSingle();

      referredBy = referrer?.user_id || null;
    }

    if (referralCode) {
  const { data: referrer } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("referral_code", referralCode)
    .maybeSingle();

  console.log("Referral code:", referralCode);
  console.log("Referrer found:", referrer);

  referredBy = referrer?.user_id || null;
}

    await supabase.from("profiles").insert({
      user_id: data.user.id,
      display_name: displayName,
      email,
      membership_tier: isFoundingMember ? "pro" : "free",
      is_founding_member: isFoundingMember,
      referred_by: referredBy,
      xp: isFoundingMember ? 500 : 0,
      level: 1,
    });

   if (referredBy) {
  const { error: referralInsertError } = await supabase
    .from("referrals")
    .insert({
      referrer_user_id: referredBy,
      referred_user_id: data.user.id,
      referral_code: referralCode,
    });

  if (!referralInsertError) {
    await awardXP(supabase, referredBy, 500);
  }
}

    if (isFoundingMember) {
      await supabase.from("user_achievements").insert({
        user_id: data.user.id,
        achievement_key: "founding_member",
      });
    }
  }

  redirect("/dashboard");
}

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const loginIdentifier = String(
    formData.get("login_identifier") || ""
  ).trim();

  const password = String(formData.get("password"));

  const requestedNextPath = String(
    formData.get("next") || "/dashboard"
  );

  const safeNextPath =
    requestedNextPath.startsWith("/") &&
    !requestedNextPath.startsWith("//")
      ? requestedNextPath
      : "/dashboard";

  let email = loginIdentifier;

  if (!loginIdentifier.includes("@")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .ilike("display_name", loginIdentifier)
      .maybeSingle();

    if (!profile?.email) {
      redirect(
        `/login?error=${encodeURIComponent(
          "No account found with that email or display name."
        )}&next=${encodeURIComponent(safeNextPath)}`
      );
    }

    email = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(
        error.message
      )}&next=${encodeURIComponent(safeNextPath)}`
    );
  }

  redirect(safeNextPath);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}