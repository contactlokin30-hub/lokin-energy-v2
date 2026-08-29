"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/catalog";
import { formatEUR } from "@/lib/pricing";
import { useCartStore } from "@/lib/store";
import ProductVisual from "./ProductVisual";
import IntensityBadge from "./IntensityBadge";

export default function ProductCard({ product }: { product: Product }) {
  const addLine = useCartStore((s) => s.addLine);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col rounded-3xl border border-white/10 bg-ink-card p-5 transition hover:border-volt/50"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <ProductVisual
            name={product.name}
            colorFrom={product.colorFrom}
            colorTo={product.colorTo}
            caffeineMg={product.caffeineMg}
          />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-cream">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-cream/60">{product.tagline}</p>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <IntensityBadge intensity={product.intensity} />
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-cream">
          {product.caffeineMg} mg
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-cream">
          {formatEUR(product.priceCents)}
        </span>
        <button
          onClick={() =>
            addLine({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              unitPriceCents: product.priceCents,
              quantity: 1,
              purchaseType: "one_time",
              colorFrom: product.colorFrom,
              colorTo: product.colorTo,
            })
          }
          className="rounded-full bg-volt px-4 py-2 text-sm font-semibold text-ink transition hover:bg-volt-dark"
        >
          Ajouter
        </button>
      </div>
    </motion.article>
  );
}
