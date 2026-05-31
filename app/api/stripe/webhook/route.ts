import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.user_id;
    const tier = session.metadata?.tier;

    if (userId && tier) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          membership_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Membership update error:", error);
      }
    }
  }

  if (
  event.type === "customer.subscription.deleted"
) {
  const subscription = event.data.object as Stripe.Subscription;

  const customerId = subscription.customer as string;

  const customers = await stripe.customers.retrieve(
    customerId
  );

  if (
    !("deleted" in customers) &&
    customers.email
  ) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        membership_tier: "free",
      })
      .eq("email", customers.email);

    if (error) {
      console.error(
        "Subscription downgrade error:",
        error
      );
    }
  }
}

  return NextResponse.json({ received: true });
}