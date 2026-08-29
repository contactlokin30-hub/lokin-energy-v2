"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

/** Vide le panier après un paiement réussi. */
export default function ClearCartOnMount() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
