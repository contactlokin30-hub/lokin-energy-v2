"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { PurchaseType } from "@/lib/store";
import { SUBSCRIPTION_DISCOUNT_PCT } from "@/lib/pricing";

interface Props {
  value: PurchaseType;
  onChange: (value: PurchaseType) => void;
  compact?: boolean;
}

/** Switch Achat unique / Abonnement, avec surlignage animé. */
export default function PurchaseToggle({ value, onChange, compact }: Props) {
  const options: { id: PurchaseType; title: string; subtitle: string }[] = [
    { id: "one_time", title: "Achat unique", subtitle: "Sans engagement" },
    {
      id: "subscription",
      title: "Abonnement",
      subtitle: `-${SUBSCRIPTION_DISCOUNT_PCT}% • livré tous les 30 j`,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Type d'achat"
      className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={clsx(
              "relative rounded-xl text-left transition-colors",
              compact ? "px-3 py-1.5" : "px-4 py-3",
              active ? "text-ink" : "text-cream/80 hover:text-cream"
            )}
          >
            {active && (
              <motion.span
                layoutId={compact ? undefined : "purchase-toggle-pill"}
                className="absolute inset-0 rounded-xl bg-volt"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative block text-sm font-semibold">
              {opt.title}
            </span>
            {!compact && (
              <span className="relative block text-xs opacity-80">
                {opt.subtitle}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
