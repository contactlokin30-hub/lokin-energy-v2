import clsx from "clsx";

interface Props {
  name: string;
  colorFrom: string;
  colorTo: string;
  caffeineMg?: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Visuel de boîte généré en CSS (aucun asset binaire dans le repo).
 * À remplacer par de vraies photos produit une fois le shooting fait.
 */
export default function ProductVisual({
  name,
  colorFrom,
  colorTo,
  caffeineMg,
  size = "md",
}: Props) {
  return (
    <div
      className={clsx(
        "relative mx-auto aspect-square rounded-full",
        size === "sm" && "w-14",
        size === "md" && "w-40",
        size === "lg" && "w-64"
      )}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${colorFrom}, ${colorTo} 75%)`,
        boxShadow: `0 18px 40px -18px ${colorTo}`,
      }}
      aria-hidden
    >
      <div className="absolute inset-[12%] rounded-full border border-white/25" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[15%] text-center">
        <span
          className={clsx(
            "font-display uppercase tracking-widest text-white drop-shadow",
            size === "sm" && "text-[6px]",
            size === "md" && "text-xs",
            size === "lg" && "text-lg"
          )}
        >
          Lokin
        </span>
        <span
          className={clsx(
            "font-display font-bold uppercase leading-tight text-white drop-shadow",
            size === "sm" && "text-[7px]",
            size === "md" && "text-sm",
            size === "lg" && "text-2xl"
          )}
        >
          {name}
        </span>
        {caffeineMg !== undefined && size !== "sm" && (
          <span
            className={clsx(
              "mt-1 rounded-full bg-black/35 px-2 py-0.5 text-white/90",
              size === "md" && "text-[10px]",
              size === "lg" && "text-xs"
            )}
          >
            {caffeineMg} mg caféine / sachet
          </span>
        )}
      </div>
    </div>
  );
}
