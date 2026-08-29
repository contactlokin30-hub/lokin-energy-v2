"use client";

import type { CartLine } from "./store";

/**
 * Démarre un paiement Stripe Checkout via l'Edge Function Supabase
 * `create-checkout-session`. Seuls les identifiants et quantités sont
 * envoyés : les prix sont recalculés côté serveur.
 */
export async function startCheckout(lines: CartLine[]): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    alert(
      "Mode démo : configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY pour activer le paiement Stripe."
    );
    return;
  }

  const payload = {
    lines: lines.map((l) => ({
      productId: l.productId,
      quantity: l.quantity,
      purchaseType: l.purchaseType,
      bundle: l.bundle
        ? { tierSize: l.bundle.tierSize, selections: l.bundle.selections }
        : null,
    })),
    successUrl: `${window.location.origin}/checkout/success`,
    cancelUrl: `${window.location.origin}/checkout/cancel`,
  };

  const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Échec de création de session (${res.status})`);
  }

  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}
