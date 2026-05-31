"use client";

export default function InviteFriendsButton({
  inviteLink,
}: {
  inviteLink: string;
}) {
  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);

    alert("Invite link copied!");
  }

  return (
    <button
      onClick={copyInviteLink}
      className="cursor-pointer rounded-xl bg-black px-4 py-2 font-semibold text-white transition hover:opacity-90"
    >
      Copy Invite Link
    </button>
  );
}