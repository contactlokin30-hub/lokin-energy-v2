"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { computeCartTotals } from "@/lib/pricing";

export default function Header() {
  const openCart = useCartStore((s) => s.openCart);
  const lines = useCartStore((s) => s.lines);
  const { itemCount } = computeCartTotals(lines);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-black uppercase tracking-tight text-cream"
        >
          Lokin<span className="text-volt">.</span>Energy
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-cream/80 sm:flex">
          <Link href="/#saveurs" className="transition hover:text-cream">
            Saveurs
          </Link>
          <Link href="/bundle" className="transition hover:text-cream">
            Composer un pack
          </Link>
          <Link href="/#comment" className="transition hover:text-cream">
            Comment ça marche
          </Link>
        </nav>
        <button
          onClick={openCart}
          className="relative rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-cream transition hover:border-volt hover:text-volt"
          aria-label={`Ouvrir le panier, ${itemCount} article(s)`}
        >
          Panier
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-volt px-1 text-xs font-bold text-ink">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
