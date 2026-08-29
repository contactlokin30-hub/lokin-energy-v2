import clsx from "clsx";
import { INTENSITY_LABELS, type Intensity } from "@/lib/catalog";

export default function IntensityBadge({ intensity }: { intensity: Intensity }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-cream"
      title={`Intensité : ${INTENSITY_LABELS[intensity]}`}
    >
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={clsx(
              "h-2 w-2 rounded-full",
              i <= intensity ? "bg-volt" : "bg-white/20"
            )}
          />
        ))}
      </span>
      {INTENSITY_LABELS[intensity]}
    </span>
  );
}
