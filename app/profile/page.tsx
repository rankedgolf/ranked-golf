import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profilePhotoUrl = String(
    formData.get("existing_profile_photo_url") || ""
  );

  const profilePhoto = formData.get("profile_photo") as File | null;

  if (profilePhoto && profilePhoto.size > 0) {
    const fileExt = profilePhoto.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, profilePhoto);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      profilePhotoUrl = publicUrlData.publicUrl;
    }
  }

  await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      region: String(formData.get("region") || ""),

      handicap: formData.get("handicap")
        ? Number(formData.get("handicap"))
        : null,

      home_course: String(formData.get("home_course") || ""),
      golfer_type: String(formData.get("golfer_type") || ""),
      favorite_course: String(formData.get("favorite_course") || ""),
      profile_photo_url: profilePhotoUrl,

      bio: String(formData.get("bio") || ""),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  redirect("/dashboard");
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">Edit Profile</h1>

        <form action={updateProfile} className="space-y-4 rounded-xl border p-6">
          {profile?.profile_photo_url && (
            <img
              src={profile.profile_photo_url}
              alt="Profile photo"
              className="h-24 w-24 rounded-full object-cover"
            />
          )}

          <input
            type="hidden"
            name="existing_profile_photo_url"
            value={profile?.profile_photo_url || ""}
          />

          <input
            name="profile_photo"
            type="file"
            accept="image/*"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="display_name"
            defaultValue={profile?.display_name || ""}
            placeholder="Display name"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="city"
            defaultValue={profile?.city || ""}
            placeholder="City"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="state"
            defaultValue={profile?.state || ""}
            placeholder="State"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="region"
            defaultValue={profile?.region || ""}
            placeholder="Region"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="handicap"
            type="number"
            step="0.1"
            defaultValue={profile?.handicap || ""}
            placeholder="Optional self-reported handicap"
            className="w-full rounded border px-3 py-2"
          />

          <input
            name="home_course"
            defaultValue={profile?.home_course || ""}
            placeholder="Home course"
            className="w-full rounded border px-3 py-2"
          />

          <select
            name="golfer_type"
            defaultValue={profile?.golfer_type || ""}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Golfer type</option>
            <option value="Weekend Warrior">Weekend Warrior</option>
            <option value="Competitive Amateur">Competitive Amateur</option>
            <option value="League Player">League Player</option>
            <option value="Tournament Player">Tournament Player</option>
            <option value="Beginner">Beginner</option>
          </select>

          <input
            name="favorite_course"
            defaultValue={profile?.favorite_course || ""}
            placeholder="Favorite course"
            className="w-full rounded border px-3 py-2"
          />

          <textarea
            name="bio"
            defaultValue={profile?.bio || ""}
            placeholder="Player bio"
            className="w-full rounded border px-3 py-2"
          />

          <button className="w-full rounded bg-black py-2 font-semibold text-white">
            Save Profile
          </button>
        </form>
      </div>
    </main>
  );
}