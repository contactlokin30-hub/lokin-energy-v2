// Edge Function `create-checkout-session`
// Reçoit les IDs produits + quantités du panier, vérifie les stocks,
// recalcule prix et remises côté serveur (jamais confiance au client),
// puis crée une session Stripe Checkout et une commande `pending`.
//
// Secrets requis (supabase secrets set …) :
//   STRIPE_SECRET_KEY, SITE_URL
// Variables injectées automatiquement : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from "npm:stripe@16.12.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const SUBSCRIPTION_DISCOUNT_PCT = 15;

interface CheckoutLine {
  productId: string;
  quantity: number;
  purchaseType: "one_time" | "subscription";
  bundle: { tierSize: number; selections: Record<string, number> } | null;
}

interface CheckoutPayload {
  lines: CheckoutLine[];
  successUrl?: string;
  cancelUrl?: string;
}

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée" }, 405);
  }

  let payload: CheckoutPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Corps JSON invalide" }, 400);
  }

  if (!Array.isArray(payload.lines) || payload.lines.length === 0) {
    return jsonResponse({ error: "Panier vide" }, 400);
  }

  // -------------------------------------------------------------------------
  // 1. Charger catalogue + règles de pack depuis la base (source de vérité)
  // -------------------------------------------------------------------------
  const [{ data: products, error: prodErr }, { data: rules, error: ruleErr }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, slug, name, price_cents, stock, active"),
      supabase
        .from("bundle_rules")
        .select("tier_size, discount_pct, label, active"),
    ]);

  if (prodErr || ruleErr || !products || !rules) {
    console.error("Erreur catalogue", prodErr, ruleErr);
    return jsonResponse({ error: "Catalogue indisponible" }, 500);
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const ruleByTier = new Map(
    rules.filter((r) => r.active).map((r) => [r.tier_size, r]),
  );

  const hasSubscription = payload.lines.some(
    (l) => l.purchaseType === "subscription",
  );
  const hasOneTime = payload.lines.some((l) => l.purchaseType === "one_time");
  if (hasSubscription && hasOneTime) {
    // Stripe Checkout ne mélange pas payment et subscription dans une session.
    return jsonResponse(
      {
        error:
          "Achat unique et abonnement doivent être réglés séparément. Passez deux commandes.",
      },
      400,
    );
  }

  // -------------------------------------------------------------------------
  // 2. Recalculer chaque ligne + vérifier les stocks
  // -------------------------------------------------------------------------
  type PricedLine = {
    name: string;
    totalCents: number;
    quantity: number;
    items: { productId: string; qty: number; unitPriceCents: number }[];
    discountPct: number;
    bundleTier: number | null;
  };

  const pricedLines: PricedLine[] = [];

  for (const line of payload.lines) {
    const quantity = Math.floor(line.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
      return jsonResponse({ error: "Quantité invalide" }, 400);
    }

    if (line.bundle) {
      const rule = ruleByTier.get(line.bundle.tierSize);
      if (!rule) {
        return jsonResponse({ error: "Palier de pack inconnu" }, 400);
      }
      const entries = Object.entries(line.bundle.selections).filter(
        ([, q]) => q > 0,
      );
      const totalCans = entries.reduce((n, [, q]) => n + q, 0);
      if (totalCans !== rule.tier_size) {
        return jsonResponse(
          { error: `Un ${rule.label} doit contenir ${rule.tier_size} boîtes` },
          400,
        );
      }

      let gross = 0;
      const items: PricedLine["items"] = [];
      for (const [slug, qty] of entries) {
        const product = productBySlug.get(slug);
        if (!product || !product.active) {
          return jsonResponse({ error: `Produit inconnu : ${slug}` }, 400);
        }
        if (product.stock < qty * quantity) {
          return jsonResponse(
            { error: `Stock insuffisant pour ${product.name}` },
            409,
          );
        }
        gross += product.price_cents * qty;
        items.push({
          productId: product.id,
          qty: qty * quantity,
          unitPriceCents: product.price_cents,
        });
      }

      let total = Math.round(gross * (1 - Number(rule.discount_pct) / 100));
      if (line.purchaseType === "subscription") {
        total = Math.round(total * (1 - SUBSCRIPTION_DISCOUNT_PCT / 100));
      }
      pricedLines.push({
        name: `${rule.label} — ${rule.tier_size} boîtes`,
        totalCents: total,
        quantity,
        items,
        discountPct: Number(rule.discount_pct),
        bundleTier: rule.tier_size,
      });
    } else {
      const product = productById.get(line.productId);
      if (!product || !product.active) {
        return jsonResponse(
          { error: `Produit inconnu : ${line.productId}` },
          400,
        );
      }
      if (product.stock < quantity) {
        return jsonResponse(
          { error: `Stock insuffisant pour ${product.name}` },
          409,
        );
      }
      let total = product.price_cents;
      if (line.purchaseType === "subscription") {
        total = Math.round(total * (1 - SUBSCRIPTION_DISCOUNT_PCT / 100));
      }
      pricedLines.push({
        name: product.name,
        totalCents: total * quantity,
        quantity,
        items: [
          {
            productId: product.id,
            qty: quantity,
            unitPriceCents: product.price_cents,
          },
        ],
        discountPct:
          line.purchaseType === "subscription" ? SUBSCRIPTION_DISCOUNT_PCT : 0,
        bundleTier: null,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Créer la commande `pending` puis la session Stripe Checkout
  // -------------------------------------------------------------------------
  const purchaseType = hasSubscription ? "subscription" : "one_time";
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ status: "pending", purchase_type: purchaseType })
    .select("id")
    .single();

  if (orderErr || !order) {
    console.error("Erreur création commande", orderErr);
    return jsonResponse({ error: "Impossible de créer la commande" }, 500);
  }

  const orderItems = pricedLines.flatMap((pl) =>
    pl.items.map((it) => ({
      order_id: order.id,
      product_id: it.productId,
      quantity: it.qty,
      unit_price_cents: it.unitPriceCents,
      discount_pct: pl.discountPct,
      bundle_tier: pl.bundleTier,
      purchase_type: purchaseType,
    })),
  );
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItems);
  if (itemsErr) {
    console.error("Erreur lignes commande", itemsErr);
    return jsonResponse({ error: "Impossible de créer la commande" }, 500);
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://lokin-energy.fr";
  const mode = hasSubscription ? "subscription" : "payment";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    pricedLines.map((pl) => ({
      quantity: pl.quantity,
      price_data: {
        currency: "eur",
        unit_amount: Math.round(pl.totalCents / pl.quantity),
        product_data: { name: pl.name },
        ...(mode === "subscription"
          ? { recurring: { interval: "month" as const } }
          : {}),
      },
    }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      payment_method_types: ["card"], // Apple Pay / Google Pay via 'card'
      shipping_address_collection: { allowed_countries: ["FR", "BE", "LU", "CH"] },
      success_url:
        (payload.successUrl ?? `${siteUrl}/checkout/success`) +
        "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: payload.cancelUrl ?? `${siteUrl}/checkout/cancel`,
      metadata: { order_id: order.id },
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { order_id: order.id } } }
        : {}),
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return jsonResponse({ url: session.url });
  } catch (e) {
    console.error("Erreur Stripe", e);
    return jsonResponse({ error: "Échec de création de la session Stripe" }, 502);
  }
});
