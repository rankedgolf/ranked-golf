"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);

    const response = await fetch(
      "/api/stripe/portal",
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Unable to open billing portal.");
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="cursor-pointer rounded-xl border px-4 py-2 font-semibold transition hover:bg-gray-50"
    >
      {loading
        ? "Loading..."
        : "Manage Subscription"}
    </button>
  );
}