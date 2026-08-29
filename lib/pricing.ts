import type { CartLine } from "./store";

/**
 * ⚠️ Ces calculs ne servent qu'à l'affichage instantané côté client
 * (barre de progression, totaux prévisionnels). Le prix réellement
 * facturé est recalculé côté serveur dans l'Edge Function
 * `create-checkout-session` à partir de la base Supabase.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 4000; // 40 €
export const GIFT_THRESHOLD_CENTS = 8000; // 80 € → cadeau surprise
export const SUBSCRIPTION_DISCOUNT_PCT = 15;

export interface BundleTier {
  size: number;
  discountPct: number;
  label: string;
  badge?: string;
}

export const BUNDLE_TIERS: BundleTier[] = [
  { size: 3, discountPct: 10, label: "Pack Découverte" },
  { size: 6, discountPct: 20, label: "Pack Habitué", badge: "Le plus choisi" },
  { size: 10, discountPct: 30, label: "Pack Équipe", badge: "Meilleur prix" },
];

export function bundleTierFor(size: number): BundleTier | undefined {
  return BUNDLE_TIERS.find((t) => t.size === size);
}

/** Total d'une ligne après remises pack + abonnement, en centimes. */
export function lineTotalCents(line: CartLine): number {
  let total = line.unitPriceCents * line.quantity;
  if (line.bundle) {
    total = Math.round(total * (1 - line.bundle.discountPct / 100));
  }
  if (line.purchaseType === "subscription") {
    total = Math.round(total * (1 - SUBSCRIPTION_DISCOUNT_PCT / 100));
  }
  return total;
}

export interface CartTotals {
  itemCount: number;
  grossCents: number;
  discountCents: number;
  subtotalCents: number;
  freeShippingReached: boolean;
  giftReached: boolean;
  /** Progression 0..1 vers le prochain palier (livraison puis cadeau). */
  progress: number;
  remainingToNextCents: number;
  nextMilestone: "shipping" | "gift" | null;
}

export function computeCartTotals(lines: CartLine[]): CartTotals {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const grossCents = lines.reduce(
    (n, l) => n + l.unitPriceCents * l.quantity,
    0
  );
  const subtotalCents = lines.reduce((n, l) => n + lineTotalCents(l), 0);
  const discountCents = grossCents - subtotalCents;

  const freeShippingReached = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const giftReached = subtotalCents >= GIFT_THRESHOLD_CENTS;

  let nextMilestone: CartTotals["nextMilestone"] = null;
  let progress = 1;
  let remainingToNextCents = 0;

  if (!freeShippingReached) {
    nextMilestone = "shipping";
    progress = subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS;
    remainingToNextCents = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
  } else if (!giftReached) {
    nextMilestone = "gift";
    progress =
      (subtotalCents - FREE_SHIPPING_THRESHOLD_CENTS) /
      (GIFT_THRESHOLD_CENTS - FREE_SHIPPING_THRESHOLD_CENTS);
    remainingToNextCents = GIFT_THRESHOLD_CENTS - subtotalCents;
  }

  return {
    itemCount,
    grossCents,
    discountCents,
    subtotalCents,
    freeShippingReached,
    giftReached,
    progress: Math.min(1, Math.max(0, progress)),
    remainingToNextCents,
    nextMilestone,
  };
}

export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
