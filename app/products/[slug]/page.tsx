import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, PRODUCTS } from "@/lib/catalog";
import ProductVisual from "@/components/ProductVisual";
import IntensityBadge from "@/components/IntensityBadge";
import NutritionTable from "@/components/NutritionTable";
import AddToCartPanel from "@/components/AddToCartPanel";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline}. ${product.caffeineMg} mg de caféine par sachet, ${product.pouchesPerCan} sachets par boîte, zéro sucre.`,
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-ink-card p-10">
          <ProductVisual
            name={product.name}
            colorFrom={product.colorFrom}
            colorTo={product.colorTo}
            caffeineMg={product.caffeineMg}
            size="lg"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-volt">
            {product.sku}
          </p>
          <h1 className="mt-1 font-display text-4xl font-black uppercase text-cream">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-cream/70">{product.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <IntensityBadge intensity={product.intensity} />
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-cream">
              ⚡ {product.caffeineMg} mg de caféine / sachet
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-cream">
              {product.pouchesPerCan} sachets / boîte
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-cream">
              0 g de sucre
            </span>
          </div>

          <p className="mt-5 leading-relaxed text-cream/80">
            {product.description}
          </p>

          <div className="mt-7">
            <AddToCartPanel product={product} />
          </div>
        </div>
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-xl font-bold uppercase text-cream">
            Tableau nutritionnel
          </h2>
          <NutritionTable rows={product.nutrition} />
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold uppercase text-cream">
            Bon à savoir
          </h2>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="rounded-2xl border border-white/10 bg-ink-card p-4">
              <strong className="text-cream">Effet ressenti :</strong> 5 à 10
              minutes après la pose, pour une diffusion de 20 à 30 minutes.
            </li>
            <li className="rounded-2xl border border-white/10 bg-ink-card p-4">
              <strong className="text-cream">Dosage conseillé :</strong> ne pas
              dépasser 5 sachets par jour (max. 300 mg de caféine).
            </li>
            <li className="rounded-2xl border border-white/10 bg-ink-card p-4">
              <strong className="text-cream">Précautions :</strong> déconseillé
              aux mineurs, aux femmes enceintes et aux personnes sensibles à la
              caféine.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
