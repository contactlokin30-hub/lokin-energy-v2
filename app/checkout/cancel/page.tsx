import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Paiement annulé" };

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-black uppercase text-cream">
        Paiement annulé
      </h1>
      <p className="mt-3 text-cream/70">
        Aucun montant n&apos;a été débité. Votre panier est toujours là si vous
        souhaitez réessayer.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-white/20 px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-cream transition hover:border-volt hover:text-volt"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
