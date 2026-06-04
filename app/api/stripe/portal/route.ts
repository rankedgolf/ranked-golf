import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const currentUser = user || session?.user;

    if (!currentUser?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const customers = await stripe.customers.list({
      email: currentUser.email,
      limit: 1,
    });

    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);

    return NextResponse.json(
      { error: "Stripe portal failed" },
      { status: 500 }
    );
  }
}