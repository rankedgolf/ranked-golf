import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const customers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  const customer = customers.data[0];

  if (!customer) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 404 }
    );
  }

  const session =
    await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

  return NextResponse.json({
    url: session.url,
  });
}