"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PurchaseType = "one_time" | "subscription";

export interface BundleMeta {
  tierSize: number;
  discountPct: number;
  /** slug produit -> nombre de boîtes dans le pack */
  selections: Record<string, number>;
}

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  /** Prix unitaire catalogue en centimes, avant toute remise. */
  unitPriceCents: number;
  quantity: number;
  purchaseType: PurchaseType;
  colorFrom: string;
  colorTo: string;
  bundle?: BundleMeta;
}

export interface BundleDraft {
  tierSize: number;
  selections: Record<string, number>;
  purchaseType: PurchaseType;
}

interface CartState {
  /** État du tiroir — non persisté. */
  isOpen: boolean;
  lines: CartLine[];
  /** Configuration en cours dans le Bundle Builder — persistée. */
  bundleDraft: BundleDraft | null;

  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "key">) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  setPurchaseType: (key: string, purchaseType: PurchaseType) => void;
  setBundleDraft: (draft: BundleDraft | null) => void;
  clearCart: () => void;
}

function lineKey(line: Omit<CartLine, "key">): string {
  if (line.bundle) {
    const sig = Object.entries(line.bundle.selections)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slug, qty]) => `${slug}x${qty}`)
      .join("+");
    return `bundle-${line.bundle.tierSize}-${line.purchaseType}-${sig}`;
  }
  return `${line.slug}-${line.purchaseType}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isOpen: false,
      lines: [],
      bundleDraft: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addLine: (line) =>
        set((state) => {
          const key = lineKey(line);
          const existing = state.lines.find((l) => l.key === key);
          const lines = existing
            ? state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: l.quantity + line.quantity }
                  : l
              )
            : [...state.lines, { ...line, key }];
          return { lines, isOpen: true };
        }),

      removeLine: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) =>
                  l.key === key ? { ...l, quantity } : l
                ),
        })),

      setPurchaseType: (key, purchaseType) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, purchaseType } : l
          ),
        })),

      setBundleDraft: (bundleDraft) => set({ bundleDraft }),

      clearCart: () => set({ lines: [] }),
    }),
    {
      name: "lokin-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        bundleDraft: state.bundleDraft,
      }),
    }
  )
);
