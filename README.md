# Lokin Energy — Boutique e-commerce

Boutique de sachets énergétiques à la caféine (lokin-energy.fr), inspirée
dans ses **fonctionnalités** des meilleures boutiques DTC du secteur :
slide-cart avec paliers de récompense, bundle builder par paliers,
achat unique / abonnement. **Tout le code, le design et les contenus de ce
dépôt sont originaux.**

## Stack

| Couche | Choix |
|---|---|
| Front-end | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand + middleware `persist` (localStorage) |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions Deno/TS) |
| Paiement | Stripe Checkout (CB, Apple Pay, Google Pay) + Stripe Billing |
| Emails | Resend (templates HTML responsive) |
| Hébergement | Vercel (CI/CD Git, SSL automatique) |

## Fonctionnalités clés

- **Slide-Cart (`components/CartDrawer.tsx`)** — panier coulissant animé,
  barre de progression à double palier : livraison offerte à 40 €, boîte
  surprise à 80 €. Quantités, suppression et switch achat/abonnement ligne
  par ligne.
- **Bundle Builder (`components/BundleBuilder.tsx`)** — packs de 3/6/10
  boîtes (−10/−20/−30 %), sélection de saveurs par compteur, prix et
  économies recalculés en temps réel, brouillon persisté dans localStorage.
- **Switch achat unique / abonnement (`components/PurchaseToggle.tsx`)** —
  −15 % abonné, cumulable avec les remises pack, animé via `layoutId`.
- **Fiche produit** — badge d'intensité (1–3), caféine par sachet, tableau
  nutritionnel, précautions d'usage.
- **Sécurité prix** — les calculs client (`lib/pricing.ts`) ne servent qu'à
  l'affichage ; l'Edge Function `create-checkout-session` recharge le
  catalogue et les règles de pack depuis PostgreSQL, vérifie les stocks et
  recalcule tout côté serveur avant de créer la session Stripe.

## Démarrage local

```bash
npm install
cp .env.example .env.local   # renseigner les valeurs Supabase
npm run dev
```

Sans variables Supabase, le site fonctionne en mode démo (catalogue local,
paiement désactivé avec message explicite).

## Mise en place du backend

1. **Supabase** — créer un projet puis appliquer la migration :
   ```bash
   supabase link --project-ref <ref>
   supabase db push          # applique supabase/migrations/0001_init.sql
   ```
   La migration crée `products`, `bundle_rules`, `orders`, `order_items`,
   `profiles`, la RLS (lecture publique du catalogue, écriture des commandes
   réservée au service role) et seed le catalogue.

2. **Secrets des Edge Functions** :
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_... \
     RESEND_API_KEY=re_... SITE_URL=https://lokin-energy.fr \
     ALLOWED_ORIGIN=https://lokin-energy.fr
   ```

3. **Déployer les fonctions** :
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
   (`--no-verify-jwt` : Stripe s'authentifie par la signature
   `stripe-signature`, validée dans la fonction.)

4. **Stripe** — créer un endpoint webhook pointant vers
   `https://<ref>.functions.supabase.co/stripe-webhook` avec les événements
   `checkout.session.completed`, `payment_intent.succeeded`,
   `invoice.payment_failed`. Activer Apple Pay / Google Pay dans les
   réglages de paiement.

5. **Resend** — vérifier le domaine d'envoi (`lokin-energy.fr`) et publier
   les enregistrements **DKIM, SPF et DMARC** fournis par Resend dans la
   zone DNS.

## Déploiement Vercel

- Connecter le dépôt Git (l'application est à la racine du dépôt).
- Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production + preview).
- Branches de preview → staging automatique ; merge sur `main` → production.
- Domaine : `lokin-energy.fr` + redirection `www` ; SSL géré par Vercel.

## Structure

```
lokin-energy/
├── app/                      # App Router (accueil, produit, bundle, checkout)
├── components/               # CartDrawer, BundleBuilder, PurchaseToggle…
├── lib/                      # store Zustand, pricing, catalogue, checkout
└── supabase/
    ├── migrations/0001_init.sql
    └── functions/
        ├── create-checkout-session/
        ├── stripe-webhook/
        └── _shared/          # CORS + templates emails
```

## À faire avant la prod

- Remplacer les visuels CSS (`components/ProductVisual.tsx`) par de vraies
  photos produit.
- Brancher la grille produits sur la table `products` (le catalogue statique
  `lib/catalog.ts` sert de fallback/démo).
- Ajouter l'email d'expédition (template `shippingNotificationEmail` déjà
  prêt) au moment du passage en statut `shipped`.
- Pages légales : CGV, mentions légales, politique de confidentialité.
