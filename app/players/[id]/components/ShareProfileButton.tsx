"use client";

export default function ShareProfileButton({
  playerId,
}: {
  playerId: string;
}) {
  async function shareProfile() {
    const url = `${window.location.origin}/players/${playerId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Ranked Golf Profile",
        text: "Check out my Ranked Golf profile!",
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  }

  return (
    <button
      type="button"
      onClick={shareProfile}
      className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold"
    >
      🔗 Share Profile
    </button>
  );
}