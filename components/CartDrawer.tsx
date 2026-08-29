"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/lib/store";
import {
  computeCartTotals,
  formatEUR,
  lineTotalCents,
} from "@/lib/pricing";
import { startCheckout } from "@/lib/checkout";
import PurchaseToggle from "./PurchaseToggle";
import ProductVisual from "./ProductVisual";

function MilestoneBar() {
  const lines = useCartStore((s) => s.lines);
  const totals = computeCartTotals(lines);

  let message: string;
  if (totals.nextMilestone === "shipping") {
    message = `Plus que ${formatEUR(totals.remainingToNextCents)} pour la livraison offerte`;
  } else if (totals.nextMilestone === "gift") {
    message = `Plus que ${formatEUR(totals.remainingToNextCents)} pour votre boîte surprise offerte`;
  } else {
    message = "Livraison offerte + boîte surprise débloquées 🎁";
  }

  return (
    <div className="border-b border-white/10 px-5 py-4">
      <p className="mb-2 text-center text-xs font-medium text-cream/90">
        {message}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-volt"
          initial={false}
          animate={{ width: `${totals.progress * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wide text-cream/50">
        <span className={totals.freeShippingReached ? "text-volt" : ""}>
          Livraison offerte
        </span>
        <span className={totals.giftReached ? "text-volt" : ""}>
          Cadeau surprise
        </span>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    lines,
    removeLine,
    setQuantity,
    setPurchaseType,
  } = useCartStore();
  const totals = computeCartTotals(lines);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);
    try {
      await startCheckout(lines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            key="drawer"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ink-soft shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            role="dialog"
            aria-label="Panier"
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-cream">
                Votre panier{" "}
                <span className="text-volt">({totals.itemCount})</span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Fermer le panier"
                className="rounded-full p-2 text-cream/70 transition hover:bg-white/10 hover:text-cream"
              >
                ✕
              </button>
            </header>

            <MilestoneBar />

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-cream/60">Votre panier est vide.</p>
                  <button
                    onClick={closeCart}
                    className="rounded-full bg-volt px-5 py-2 text-sm font-semibold text-ink transition hover:bg-volt-dark"
                  >
                    Découvrir les saveurs
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="rounded-2xl border border-white/10 bg-ink-card p-3"
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0">
                            <ProductVisual
                              name={line.bundle ? "Pack" : line.name}
                              colorFrom={line.colorFrom}
                              colorTo={line.colorTo}
                              size="sm"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-cream">
                                  {line.name}
                                </p>
                                {line.bundle && (
                                  <p className="mt-0.5 text-xs text-cream/60">
                                    {Object.entries(line.bundle.selections)
                                      .filter(([, q]) => q > 0)
                                      .map(([slug, q]) => `${q}× ${slug}`)
                                      .join(", ")}{" "}
                                    · -{line.bundle.discountPct}%
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeLine(line.key)}
                                aria-label={`Retirer ${line.name}`}
                                className="text-xs text-cream/40 transition hover:text-cream"
                              >
                                Retirer
                              </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center rounded-full border border-white/15">
                                <button
                                  onClick={() =>
                                    setQuantity(line.key, line.quantity - 1)
                                  }
                                  aria-label="Diminuer la quantité"
                                  className="px-2.5 py-1 text-cream/70 hover:text-cream"
                                >
                                  −
                                </button>
                                <span className="min-w-6 text-center text-sm text-cream">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    setQuantity(line.key, line.quantity + 1)
                                  }
                                  aria-label="Augmenter la quantité"
                                  className="px-2.5 py-1 text-cream/70 hover:text-cream"
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-cream">
                                {formatEUR(lineTotalCents(line))}
                              </p>
                            </div>
                            <div className="mt-2">
                              <PurchaseToggle
                                compact
                                value={line.purchaseType}
                                onChange={(t) => setPurchaseType(line.key, t)}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-white/10 px-5 py-4">
                {totals.discountCents > 0 && (
                  <div className="mb-1 flex justify-between text-sm text-cream/60">
                    <span>Remises appliquées</span>
                    <span className="text-volt">
                      −{formatEUR(totals.discountCents)}
                    </span>
                  </div>
                )}
                <div className="mb-3 flex justify-between text-base font-semibold text-cream">
                  <span>Sous-total</span>
                  <span>{formatEUR(totals.subtotalCents)}</span>
                </div>
                {error && (
                  <p className="mb-2 text-xs text-red-400" role="alert">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full rounded-full bg-volt py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-volt transition hover:bg-volt-dark disabled:opacity-60"
                >
                  {checkingOut ? "Redirection…" : "Passer au paiement"}
                </button>
                <p className="mt-2 text-center text-[11px] text-cream/40">
                  Paiement sécurisé Stripe · CB, Apple Pay, Google Pay
                </p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
