import { cn } from "@/lib/utils/cn";

export function InventoryHealth({
  total,
  active,
  lowStock,
  soldOut,
}: {
  total: number;
  active: number;
  lowStock: number;
  soldOut: number;
}) {
  const stats: { label: string; value: number; tone?: "warn" | "alert" }[] = [
    { label: "Total products", value: total },
    { label: "Active", value: active },
    { label: "Low stock", value: lowStock, tone: lowStock > 0 ? "warn" : undefined },
    { label: "Sold out", value: soldOut, tone: soldOut > 0 ? "alert" : undefined },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border-y border-line md:border md:mx-10">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface p-5">
          <div className="marker">{s.label}</div>
          <div
            className={cn(
              "mt-2 display-stat tabular text-fg",
              s.tone === "warn" && "text-holding",
              s.tone === "alert" && "text-cancelled",
            )}
            style={{ fontSize: "clamp(28px, 4vw, 36px)" }}
          >
            {s.value.toString().padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  );
}
