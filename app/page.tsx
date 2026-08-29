import Link from "next/link";
import { PRODUCTS } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

const USP_ITEMS = [
  "Zéro sucre",
  "Sans tabac",
  "Jusqu'à 60 mg de caféine",
  "Livraison offerte dès 40 €",
  "Fabriqué en Europe",
  "Abonnement −15%",
];

const STEPS = [
  {
    title: "Glissez un sachet",
    text: "Placez le sachet entre la gencive et la lèvre. Aucun goût amer, aucune préparation.",
  },
  {
    title: "L'énergie diffuse",
    text: "La caféine est libérée progressivement pendant 20 à 30 minutes, sans pic ni crash.",
  },
  {
    title: "Retirez, c'est fini",
    text: "Chaque boîte contient 20 sachets. De quoi tenir vos semaines les plus chargées.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 50% at 70% 20%, rgba(182,244,58,0.25), transparent 70%)",
          }}
        />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <span className="rounded-full border border-volt/40 bg-volt/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-volt">
            Énergie de poche — nouvelle génération
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-black uppercase leading-tight text-cream sm:text-6xl">
            La caféine, <span className="text-volt">sans la tasse</span>, sans
            le sucre, sans le crash.
          </h1>
          <p className="max-w-xl text-lg text-cream/70">
            Des sachets énergétiques discrets, jusqu&apos;à 60 mg de caféine,
            à glisser sous la lèvre. Six saveurs, des packs jusqu&apos;à −30%
            et un abonnement qui pense à votre place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bundle"
              className="rounded-full bg-volt px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-volt transition hover:bg-volt-dark"
            >
              Composer mon pack −30%
            </Link>
            <Link
              href="/#saveurs"
              className="rounded-full border border-white/20 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-cream transition hover:border-volt hover:text-volt"
            >
              Voir les saveurs
            </Link>
          </div>
        </div>
      </section>

      {/* Bandeau USP défilant */}
      <div className="overflow-hidden border-y border-white/10 bg-ink-soft py-3">
        <div className="flex w-max animate-marquee gap-8">
          {[...USP_ITEMS, ...USP_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-cream/70"
            >
              <span className="text-volt">⚡</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <section id="saveurs" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-black uppercase text-cream">
              Les saveurs
            </h2>
            <p className="mt-1 text-cream/60">
              20 sachets par boîte · 40 à 60 mg de caféine par sachet
            </p>
          </div>
          <Link
            href="/bundle"
            className="hidden text-sm font-semibold text-volt hover:underline sm:block"
          >
            Composer un pack →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="border-t border-white/10 bg-ink-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="mb-10 font-display text-3xl font-black uppercase text-cream">
            Comment ça marche
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-3xl border border-white/10 bg-ink-card p-6"
              >
                <span className="font-display text-4xl font-black text-volt">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-cream">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-cream/60">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA abonnement */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-volt/30 bg-gradient-to-br from-volt/15 to-transparent p-8 sm:p-12">
          <h2 className="max-w-2xl font-display text-3xl font-black uppercase text-cream">
            Ne tombez plus jamais en panne d&apos;énergie
          </h2>
          <p className="mt-3 max-w-xl text-cream/70">
            Avec l&apos;abonnement, vos boîtes arrivent tous les 30 jours avec
            −15% permanent, cumulable avec les remises pack. Pause ou
            annulation en un clic.
          </p>
          <Link
            href="/bundle"
            className="mt-6 inline-block rounded-full bg-volt px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-volt transition hover:bg-volt-dark"
          >
            Démarrer mon abonnement
          </Link>
        </div>
      </section>
    </>
  );
}
