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
    await supabase.from("profiles").insert({
      user_id: data.user.id,
      display_name: displayName,
    });
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