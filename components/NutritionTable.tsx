import type { NutritionRow } from "@/lib/catalog";

export default function NutritionTable({ rows }: { rows: NutritionRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-left text-cream/70">
            <th className="px-4 py-3 font-medium">Valeurs nutritionnelles</th>
            <th className="px-4 py-3 font-medium">Pour 100 g</th>
            <th className="px-4 py-3 font-medium">Par sachet</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-2.5 text-cream">{row.label}</td>
              <td className="px-4 py-2.5 text-cream/70">{row.per100g}</td>
              <td className="px-4 py-2.5 text-cream/70">{row.perPouch}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
