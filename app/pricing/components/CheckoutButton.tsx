"use client";

import { useState } from "react";

export default function CheckoutButton({
  tier,
  children,
}: {
  tier: "pro" | "competitive";
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert("Could not start checkout. Please try again.");
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-8 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}