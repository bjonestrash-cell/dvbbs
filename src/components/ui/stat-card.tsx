import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  emphasis = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "angle-cut relative border border-line bg-surface p-3.5",
        emphasis && "border-line-strong",
        className,
      )}
    >
      <div className="marker">{label}</div>
      <div
        className={cn(
          "mt-1 num text-2xl font-medium tracking-tight",
          emphasis ? "text-fg" : "text-fg",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-fg-dim tabular">{hint}</div>
      ) : null}
    </div>
  );
}
