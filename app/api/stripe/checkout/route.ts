import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { tier } = await request.json();

  const priceId =
    tier === "competitive"
      ? process.env.STRIPE_COMPETITIVE_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      tier,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({
    url: checkoutSession.url,
  });
}