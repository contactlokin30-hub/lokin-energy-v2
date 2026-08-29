import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lokin-energy.fr"),
  title: {
    default: "Lokin Energy — Sachets énergétiques à la caféine",
    template: "%s | Lokin Energy",
  },
  description:
    "Sachets énergétiques à la caféine, sans sucre et sans tabac. 6 saveurs, packs jusqu'à -30%, abonnement -15%. Livraison offerte dès 40 €.",
  openGraph: {
    siteName: "Lokin Energy",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${archivo.variable}`}>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
