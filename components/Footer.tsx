import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-soft">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg font-black uppercase text-cream">
            Lokin<span className="text-volt">.</span>Energy
          </p>
          <p className="mt-2 max-w-xs text-sm text-cream/60">
            Sachets énergétiques à la caféine, sans sucre et sans tabac.
            Fabriqués pour tenir la distance.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-cream/80">
            Boutique
          </p>
          <ul className="space-y-2 text-cream/60">
            <li>
              <Link href="/#saveurs" className="hover:text-cream">
                Toutes les saveurs
              </Link>
            </li>
            <li>
              <Link href="/bundle" className="hover:text-cream">
                Composer un pack
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-wide text-cream/80">
            Informations
          </p>
          <ul className="space-y-2 text-cream/60">
            <li>Livraison offerte dès 40 €</li>
            <li>Paiement sécurisé Stripe</li>
            <li>contact@lokin-energy.fr</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Lokin Energy — lokin-energy.fr. La caféine
        est déconseillée aux femmes enceintes et aux personnes sensibles.
      </div>
    </footer>
  );
}
