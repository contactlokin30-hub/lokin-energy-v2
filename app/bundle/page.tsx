import type { Metadata } from "next";
import BundleBuilder from "@/components/BundleBuilder";

export const metadata: Metadata = {
  title: "Composer un pack",
  description:
    "Composez votre pack de sachets énergétiques : 3, 6 ou 10 boîtes, jusqu'à -30%, cumulable avec l'abonnement -15%.",
};

export default function BundlePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl font-black uppercase text-cream">
          Composez votre <span className="text-volt">pack</span>
        </h1>
        <p className="mt-2 text-cream/70">
          Mélangez les saveurs comme vous voulez. Plus le pack est grand, plus
          la remise est forte — jusqu&apos;à −30%, cumulable avec les −15% de
          l&apos;abonnement.
        </p>
      </div>
      <BundleBuilder />
    </div>
  );
}
