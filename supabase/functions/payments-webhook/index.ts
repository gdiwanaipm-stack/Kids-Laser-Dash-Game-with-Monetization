import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const env = (url.searchParams.get("env") || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = env === 'sandbox'
      ? Deno.env.get("PAYMENTS_SANDBOX_WEBHOOK_SECRET")
      : Deno.env.get("PAYMENTS_LIVE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Missing signature or secret" }), { status: 400 });
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed" || event.type === "transaction.completed") {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const product = session.metadata?.product || 'level_3_unlock';

      // Record order
      await supabase.from("orders").upsert({
        user_id: userId || null,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer || null,
        product_id: product,
        amount: session.amount_total,
        currency: session.currency,
        status: 'paid',
        environment: env,
      }, { onConflict: 'stripe_session_id' });

      // Grant unlock
      if (userId) {
        await supabase.from("game_unlocks").upsert({
          user_id: userId,
          product,
          environment: env,
          stripe_session_id: session.id,
        }, { onConflict: 'user_id,product,environment' });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
});
