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
    const tier = session.metadata?.tier || "pro";

    if (userId) {
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

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    let userId = subscription.metadata?.user_id;

    if (!userId && subscription.customer) {
      const customer = await stripe.customers.retrieve(
        String(subscription.customer)
      );

      if (!("deleted" in customer) && customer.email) {
        const { data: authUsers, error: authError } =
          await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
          console.error("List users error:", authError);
        }

        const matchedUser = authUsers?.users.find(
          (user) =>
            user.email?.toLowerCase() ===
            customer.email?.toLowerCase()
        );

        if (matchedUser?.id) {
  userId = matchedUser.id;
}
      }
    }

    if (userId) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          membership_tier: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Subscription downgrade error:", error);
      }
    } else {
      console.error(
        "Subscription downgrade failed: no matching user found"
      );
    }
  }

  return NextResponse.json({ received: true });
}