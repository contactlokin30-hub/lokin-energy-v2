"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatEUR, SUBSCRIPTION_DISCOUNT_PCT } from "@/lib/pricing";
import { useCartStore, type PurchaseType } from "@/lib/store";
import PurchaseToggle from "./PurchaseToggle";

/** Bloc d'achat de la fiche produit : type d'achat, quantité, ajout panier. */
export default function AddToCartPanel({ product }: { product: Product }) {
  const addLine = useCartStore((s) => s.addLine);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one_time");
  const [quantity, setQuantity] = useState(1);

  const unitCents =
    purchaseType === "subscription"
      ? Math.round(product.priceCents * (1 - SUBSCRIPTION_DISCOUNT_PCT / 100))
      : product.priceCents;

  return (
    <div className="space-y-4">
      <PurchaseToggle value={purchaseType} onChange={setPurchaseType} />

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-white/15">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="px-4 py-2 text-cream/70 hover:text-cream"
          >
            −
          </button>
          <span className="min-w-8 text-center font-semibold text-cream">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Augmenter la quantité"
            className="px-4 py-2 text-cream/70 hover:text-cream"
          >
            +
          </button>
        </div>
        <div className="text-sm text-cream/70">
          <span className="font-display text-xl font-bold text-cream">
            {formatEUR(unitCents * quantity)}
          </span>
          {purchaseType === "subscription" && (
            <span className="ml-2 text-volt">
              −{SUBSCRIPTION_DISCOUNT_PCT}% abonné
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() =>
          addLine({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            unitPriceCents: product.priceCents,
            quantity,
            purchaseType,
            colorFrom: product.colorFrom,
            colorTo: product.colorTo,
          })
        }
        className="w-full rounded-full bg-volt py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-volt transition hover:bg-volt-dark"
      >
        Ajouter au panier
      </button>
      <p className="text-center text-xs text-cream/50">
        {product.pouchesPerCan} sachets par boîte · Livraison offerte dès 40 €
      </p>
    </div>
  );
}
