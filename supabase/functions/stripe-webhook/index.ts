// Edge Function `stripe-webhook`
// Valide la signature Stripe (stripe-signature), enregistre les commandes
// payées, décrémente les stocks et déclenche les emails transactionnels
// via Resend.
//
// Secrets requis (supabase secrets set …) :
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
// Optionnels : EMAIL_FROM (ex. "Lokin Energy <commandes@lokin-energy.fr>")
//
// Déployer avec : supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripe ne fournit pas de JWT Supabase ; la sécurité repose sur la
// signature du webhook.)

import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import {
  orderConfirmationEmail,
  paymentFailedEmail,
} from "../_shared/emails/templates.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const EMAIL_FROM =
  Deno.env.get("EMAIL_FROM") ?? "Lokin Energy <commandes@lokin-energy.fr>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY absent — email non envoyé :", subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error("Échec Resend", res.status, await res.text());
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("checkout.session.completed sans order_id", session.id);
    return;
  }

  const email =
    session.customer_details?.email ?? session.customer_email ?? null;

  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      email,
      amount_total_cents: session.amount_total,
      currency: session.currency ?? "eur",
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      stripe_subscription_id:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
      shipping_address: session.customer_details?.address ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending") // idempotence : ne traite qu'une fois
    .select("id, amount_total_cents")
    .single();

  if (error || !order) {
    // Déjà traité (relivraison du webhook) ou commande introuvable.
    console.warn("Commande non mise à jour", orderId, error?.message);
    return;
  }

  // Décrément des stocks
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, unit_price_cents, discount_pct")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    const { error: stockErr } = await supabase.rpc("decrement_stock", {
      p_product_id: item.product_id,
      p_qty: item.quantity,
    });
    if (stockErr) console.error("Stock", item.product_id, stockErr.message);
  }

  // Email de confirmation
  if (email) {
    const { data: detailed } = await supabase
      .from("order_items")
      .select("quantity, unit_price_cents, discount_pct, products(name)")
      .eq("order_id", orderId);

    const emailItems = (detailed ?? []).map((it) => ({
      name:
        (it.products as unknown as { name: string } | null)?.name ??
        "Article",
      quantity: it.quantity,
      unitPriceCents: it.unit_price_cents,
    }));

    await sendEmail(
      email,
      "Votre commande Lokin Energy est confirmée ⚡",
      orderConfirmationEmail({
        orderId: order.id,
        items: emailItems,
        totalCents: order.amount_total_cents ?? 0,
      }),
    );
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const email = invoice.customer_email;
  if (email) {
    await sendEmail(
      email,
      "Échec de paiement — Lokin Energy",
      paymentFailedEmail({ amountCents: invoice.amount_due ?? 0 }),
    );
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Méthode non autorisée", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!signature || !webhookSecret) {
    return new Response("Signature manquante", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );
  } catch (e) {
    console.error("Signature webhook invalide", e);
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "payment_intent.succeeded":
        // Déjà couvert par checkout.session.completed ; loggé pour audit.
        console.log("payment_intent.succeeded", event.data.object.id);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log("Événement ignoré :", event.type);
    }
  } catch (e) {
    console.error("Erreur de traitement", event.type, e);
    return new Response("Erreur interne", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
