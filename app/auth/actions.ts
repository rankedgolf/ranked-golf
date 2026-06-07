"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const displayName = String(formData.get("display_name"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

if (data.user) {
  const { count: foundingMemberCount } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .eq("achievement_key", "founding_member");

  const isFoundingMember = (foundingMemberCount || 0) < 100;

  await supabase.from("profiles").insert({
    user_id: data.user.id,
    display_name: displayName,
    membership_tier: isFoundingMember ? "pro" : "free",
    xp: isFoundingMember ? 500 : 0,
    level: 1,
  });

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

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}