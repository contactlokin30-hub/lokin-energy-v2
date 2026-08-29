import type { Metadata } from "next";
import Link from "next/link";
import ClearCartOnMount from "@/components/ClearCartOnMount";

export const metadata: Metadata = { title: "Commande confirmée" };

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <ClearCartOnMount />
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-volt text-3xl text-ink">
        ✓
      </span>
      <h1 className="mt-6 font-display text-3xl font-black uppercase text-cream">
        Merci pour votre commande !
      </h1>
      <p className="mt-3 text-cream/70">
        Votre paiement a bien été reçu. Un email de confirmation avec le
        récapitulatif détaillé vous a été envoyé. Vous recevrez le lien de
        suivi dès l&apos;expédition du colis.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-volt px-7 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-ink transition hover:bg-volt-dark"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
