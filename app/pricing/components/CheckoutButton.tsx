"use client";

import { useState } from "react";

export default function CheckoutButton({
  tier,
  billingInterval,
  children,
}: {
  tier: "pro" | "competitive";
  billingInterval: "monthly" | "annual";
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
      body: JSON.stringify({
        tier,
        billingInterval,
      }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      console.error(data);
      alert("Could not start checkout. Please try again.");
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}