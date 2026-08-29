"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { PRODUCTS } from "@/lib/catalog";
import {
  BUNDLE_TIERS,
  bundleTierFor,
  formatEUR,
  SUBSCRIPTION_DISCOUNT_PCT,
} from "@/lib/pricing";
import { useCartStore, type BundleDraft } from "@/lib/store";
import ProductVisual from "./ProductVisual";

const EMPTY_SELECTIONS = (): Record<string, number> =>
  Object.fromEntries(PRODUCTS.map((p) => [p.slug, 0]));

export default function BundleBuilder() {
  const { bundleDraft, setBundleDraft, addLine } = useCartStore();

  const draft: BundleDraft = bundleDraft ?? {
    tierSize: 6,
    selections: EMPTY_SELECTIONS(),
    purchaseType: "one_time",
  };

  const tier = bundleTierFor(draft.tierSize) ?? BUNDLE_TIERS[1];
  const selectedCount = useMemo(
    () => Object.values(draft.selections).reduce((a, b) => a + b, 0),
    [draft.selections]
  );
  const remaining = tier.size - selectedCount;
  const complete = remaining === 0;

  const basePrice = PRODUCTS[0].priceCents;
  const grossCents = tier.size * basePrice;
  let totalCents = Math.round(grossCents * (1 - tier.discountPct / 100));
  if (draft.purchaseType === "subscription") {
    totalCents = Math.round(
      totalCents * (1 - SUBSCRIPTION_DISCOUNT_PCT / 100)
    );
  }
  const savingsCents = grossCents - totalCents;

  function update(partial: Partial<BundleDraft>) {
    setBundleDraft({ ...draft, ...partial });
  }

  function setFlavor(slug: string, qty: number) {
    const next = { ...draft.selections, [slug]: Math.max(0, qty) };
    const count = Object.values(next).reduce((a, b) => a + b, 0);
    if (count > tier.size) return;
    update({ selections: next });
  }

  function changeTier(size: number) {
    // Si le nouveau palier est plus petit, on tronque la sélection.
    let budget = size;
    const next: Record<string, number> = {};
    for (const [slug, qty] of Object.entries(draft.selections)) {
      const kept = Math.min(qty, budget);
      next[slug] = kept;
      budget -= kept;
    }
    update({ tierSize: size, selections: next });
  }

  function addBundleToCart() {
    if (!complete) return;
    addLine({
      productId: `bundle_${tier.size}`,
      slug: `pack-${tier.size}`,
      name: `${tier.label} — ${tier.size} boîtes`,
      unitPriceCents: grossCents,
      quantity: 1,
      purchaseType: draft.purchaseType,
      colorFrom: "#b6f43a",
      colorTo: "#3f6b12",
      bundle: {
        tierSize: tier.size,
        discountPct: tier.discountPct,
        selections: Object.fromEntries(
          Object.entries(draft.selections).filter(([, q]) => q > 0)
        ),
      },
    });
    setBundleDraft(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {/* Étape 1 — palier */}
        <section>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-volt">
            1. Choisissez votre pack
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {BUNDLE_TIERS.map((t) => {
              const active = t.size === tier.size;
              return (
                <button
                  key={t.size}
                  onClick={() => changeTier(t.size)}
                  className={clsx(
                    "relative rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-volt bg-volt/10"
                      : "border-white/10 bg-ink-card hover:border-white/30"
                  )}
                >
                  {t.badge && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-volt px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                      {t.badge}
                    </span>
                  )}
                  <p className="font-display text-2xl font-black text-cream">
                    {t.size}{" "}
                    <span className="text-sm font-semibold text-cream/60">
                      boîtes
                    </span>
                  </p>
                  <p className="text-sm text-cream/70">{t.label}</p>
                  <p className="mt-1 text-sm font-semibold text-volt">
                    −{t.discountPct}%
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Étape 2 — saveurs */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-volt">
              2. Composez vos saveurs
            </h2>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={remaining}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className={clsx(
                  "text-sm font-semibold",
                  complete ? "text-volt" : "text-cream/70"
                )}
              >
                {complete
                  ? "Pack complet ✓"
                  : `${remaining} boîte${remaining > 1 ? "s" : ""} à choisir`}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRODUCTS.map((p) => {
              const qty = draft.selections[p.slug] ?? 0;
              return (
                <div
                  key={p.slug}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl border p-3 transition",
                    qty > 0
                      ? "border-volt/60 bg-volt/5"
                      : "border-white/10 bg-ink-card"
                  )}
                >
                  <ProductVisual
                    name={p.name}
                    colorFrom={p.colorFrom}
                    colorTo={p.colorTo}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-cream">
                      {p.name}
                    </p>
                    <p className="text-xs text-cream/50">
                      {p.caffeineMg} mg / sachet
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFlavor(p.slug, qty - 1)}
                      disabled={qty === 0}
                      aria-label={`Retirer une boîte de ${p.name}`}
                      className="h-8 w-8 rounded-full border border-white/15 text-cream/80 transition hover:border-volt disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-bold text-cream">
                      {qty}
                    </span>
                    <button
                      onClick={() => setFlavor(p.slug, qty + 1)}
                      disabled={remaining === 0}
                      aria-label={`Ajouter une boîte de ${p.name}`}
                      className="h-8 w-8 rounded-full border border-white/15 text-cream/80 transition hover:border-volt disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Récapitulatif sticky */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-white/10 bg-ink-card p-5">
          <h3 className="font-display text-lg font-bold uppercase text-cream">
            Votre pack
          </h3>
          <div className="mt-3 space-y-1 text-sm text-cream/70">
            <div className="flex justify-between">
              <span>
                {tier.size} boîtes × {formatEUR(basePrice)}
              </span>
              <span>{formatEUR(grossCents)}</span>
            </div>
            <div className="flex justify-between text-volt">
              <span>Remise pack (−{tier.discountPct}%)</span>
              <span>
                −{formatEUR(Math.round((grossCents * tier.discountPct) / 100))}
              </span>
            </div>
            {draft.purchaseType === "subscription" && (
              <div className="flex justify-between text-volt">
                <span>Abonnement (−{SUBSCRIPTION_DISCOUNT_PCT}%)</span>
                <span />
              </div>
            )}
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-sm text-cream/70">Total</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={totalCents}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="font-display text-2xl font-black text-cream"
              >
                {formatEUR(totalCents)}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-1 text-right text-xs text-volt">
            Vous économisez {formatEUR(savingsCents)}
          </p>

          <div className="mt-4">
            <h4 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-volt">
              3. Type d&apos;achat
            </h4>
            <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              {(
                [
                  ["one_time", "Achat unique"],
                  ["subscription", `Abonnement −${SUBSCRIPTION_DISCOUNT_PCT}%`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => update({ purchaseType: id })}
                  className={clsx(
                    "rounded-xl px-3 py-2 text-xs font-semibold transition",
                    draft.purchaseType === id
                      ? "bg-volt text-ink"
                      : "text-cream/70 hover:text-cream"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addBundleToCart}
            disabled={!complete}
            className="mt-4 w-full rounded-full bg-volt py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-volt transition hover:bg-volt-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {complete
              ? "Ajouter le pack au panier"
              : `Encore ${remaining} boîte${remaining > 1 ? "s" : ""}`}
          </button>
        </div>
      </aside>
    </div>
  );
}
