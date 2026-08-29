export type Intensity = 1 | 2 | 3;

export interface NutritionRow {
  label: string;
  per100g: string;
  perPouch: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  tagline: string;
  description: string;
  caffeineMg: number;
  intensity: Intensity;
  pouchesPerCan: number;
  priceCents: number;
  stock: number;
  /** Couleurs du visuel généré en CSS (pas d'assets binaires). */
  colorFrom: string;
  colorTo: string;
  nutrition: NutritionRow[];
}

const BASE_NUTRITION: NutritionRow[] = [
  { label: "Énergie", per100g: "38 kcal", perPouch: "< 1 kcal" },
  { label: "Matières grasses", per100g: "0,2 g", perPouch: "0 g" },
  { label: "Glucides", per100g: "4,1 g", perPouch: "0,1 g" },
  { label: "dont sucres", per100g: "0 g", perPouch: "0 g" },
  { label: "Protéines", per100g: "1,8 g", perPouch: "< 0,1 g" },
  { label: "Sel", per100g: "0,3 g", perPouch: "< 0,01 g" },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod_menthe_glaciale",
    slug: "menthe-glaciale",
    sku: "LKN-MG-01",
    name: "Menthe Glaciale",
    tagline: "Le coup de froid qui réveille",
    description:
      "Une menthe poivrée intense associée à 50 mg de caféine par sachet. L'effet fraîcheur immédiat, l'énergie qui suit dans les minutes d'après. Notre best-seller au bureau comme à la salle.",
    caffeineMg: 50,
    intensity: 2,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 250,
    colorFrom: "#3ddad7",
    colorTo: "#0e6b66",
    nutrition: BASE_NUTRITION,
  },
  {
    id: "prod_cafe_original",
    slug: "cafe-original",
    sku: "LKN-CO-01",
    name: "Café Original",
    tagline: "L'espresso sans la tasse",
    description:
      "Le goût d'un café serré, torréfaction foncée, avec 60 mg de caféine par sachet. Pour celles et ceux qui veulent l'effet d'un double espresso, n'importe où, sans machine.",
    caffeineMg: 60,
    intensity: 3,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 180,
    colorFrom: "#b0793f",
    colorTo: "#4a2c14",
    nutrition: BASE_NUTRITION,
  },
  {
    id: "prod_fruits_rouges",
    slug: "fruits-rouges",
    sku: "LKN-FR-01",
    name: "Fruits Rouges",
    tagline: "L'énergie côté sucré",
    description:
      "Framboise, cassis et une pointe de fraise, 40 mg de caféine par sachet. La porte d'entrée idéale : douce en goût, franche en énergie, zéro sucre.",
    caffeineMg: 40,
    intensity: 1,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 320,
    colorFrom: "#f45b8b",
    colorTo: "#7a1436",
    nutrition: BASE_NUTRITION,
  },
  {
    id: "prod_citron_givre",
    slug: "citron-givre",
    sku: "LKN-CG-01",
    name: "Citron Givré",
    tagline: "L'acidité qui pique, l'énergie qui dure",
    description:
      "Citron jaune pressé et zeste de lime, 50 mg de caféine par sachet. Vif, net, désaltérant — le compagnon des longues sessions de travail.",
    caffeineMg: 50,
    intensity: 2,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 210,
    colorFrom: "#f4e04d",
    colorTo: "#7a6b06",
    nutrition: BASE_NUTRITION,
  },
  {
    id: "prod_cannelle_feu",
    slug: "cannelle-feu",
    sku: "LKN-CF-01",
    name: "Cannelle Feu",
    tagline: "Ça chauffe, puis ça carbure",
    description:
      "Cannelle épicée façon bonbon américain, 60 mg de caféine par sachet. Notre saveur la plus intense, réservée aux habitués qui veulent du caractère.",
    caffeineMg: 60,
    intensity: 3,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 140,
    colorFrom: "#f4703a",
    colorTo: "#7a220e",
    nutrition: BASE_NUTRITION,
  },
  {
    id: "prod_vanille_bourbon",
    slug: "vanille-bourbon",
    sku: "LKN-VB-01",
    name: "Vanille Bourbon",
    tagline: "La douceur qui tient la distance",
    description:
      "Vanille de Madagascar, ronde et crémeuse, 40 mg de caféine par sachet. Le choix des fins de journée : de l'énergie sans l'agressivité.",
    caffeineMg: 40,
    intensity: 1,
    pouchesPerCan: 20,
    priceCents: 1490,
    stock: 260,
    colorFrom: "#e8d5b5",
    colorTo: "#8a6a3f",
    nutrition: BASE_NUTRITION,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export const INTENSITY_LABELS: Record<Intensity, string> = {
  1: "Douce",
  2: "Modérée",
  3: "Intense",
};
