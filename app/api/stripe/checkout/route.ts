import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
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

    const { tier, billingInterval } = await request.json();

    let priceId: string | undefined;

    if (tier === "pro" && billingInterval === "monthly") {
      priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    }

    if (tier === "pro" && billingInterval === "annual") {
      priceId = process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
    }

    if (tier === "competitive") {
      priceId = process.env.STRIPE_COMPETITIVE_PRICE_ID;
    }

    if (!priceId) {
      return NextResponse.json(
        {
          error: "Missing Stripe price ID",
          tier,
          billingInterval,
        },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        tier,
        billing_interval: billingInterval || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Stripe checkout failed" },
      { status: 500 }
    );
  }
}