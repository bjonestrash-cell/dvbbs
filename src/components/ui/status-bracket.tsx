import { cn } from "@/lib/utils/cn";

/**
 * Status indicator. Pivoted from bracketed text to a small colored dot
 * followed by a mono label. Export name is kept so existing call sites
 * (StatusBracket / FilterBracket) continue to compile.
 *
 *   <StatusBracket tone="confirmed">Confirmed</StatusBracket>  =>  ● Confirmed
 *
 * Geist Mono, 10px, uppercase, tracking 0.12em. The dot uses the tone color,
 * the label uses --text-secondary.
 */
export type Tone =
  | "confirmed"
  | "contracted"
  | "holding"
  | "offered"
  | "lead"
  | "completed"
  | "cancelled"
  | "not_started"
  | "in_progress"
  | "review"
  | "approved"
  | "final"
  | "todo"
  | "done"
  | "draft"
  | "active"
  | "sold_out"
  | "archived"
  | "default"
  | "accent";

const DOT: Record<Tone, string> = {
  confirmed: "bg-confirmed",
  contracted: "bg-contracted",
  holding: "bg-holding",
  offered: "bg-offered",
  lead: "bg-lead",
  completed: "bg-completed",
  cancelled: "bg-cancelled",
  not_started: "bg-not-started",
  in_progress: "bg-in-progress",
  review: "bg-review",
  approved: "bg-approved",
  final: "bg-final",
  todo: "bg-todo",
  done: "bg-done",
  draft: "bg-lead",
  active: "bg-confirmed",
  sold_out: "bg-cancelled",
  archived: "bg-completed",
  default: "bg-fg-faint",
  accent: "bg-accent",
};

export function StatusBracket({
  children,
  tone = "default",
  strikethrough,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  /** legacy prop, kept for backward compat */
  spaced?: boolean;
  strikethrough?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono tracking-[0.06em] text-[11px] text-fg-dim leading-none",
        strikethrough && "line-through",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full shrink-0 translate-y-[0.5px]",
          DOT[tone],
        )}
      />
      <span>{children}</span>
    </span>
  );
}

/** Filter pill, quiet-luxury rounded full with hairline border. */
export function FilterBracket({
  active,
  count,
  onClick,
  children,
  className,
  type = "button",
}: {
  active?: boolean;
  count?: number | null;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border h-10 md:h-8 px-4 font-mono tracking-[0.06em] text-[11px] [transition-duration:80ms]",
        active
          ? "bg-inverted text-fg-inverted border-inverted"
          : "bg-transparent border-line text-fg-dim hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      <span>{children}</span>
      {typeof count === "number" && count > 0 ? (
        <>
          <span aria-hidden className="opacity-50">·</span>
          <span className="num text-[10px]">
            {count.toString().padStart(2, "0")}
          </span>
        </>
      ) : null}
    </button>
  );
}

/** Map status names to tone for quick adoption from existing strings. */
export const STATUS_TONE: Record<string, Tone> = {
  lead: "lead",
  offered: "offered",
  holding: "holding",
  confirmed: "confirmed",
  contracted: "contracted",
  completed: "completed",
  cancelled: "cancelled",
  paid: "confirmed",
  unpaid: "holding",
  not_started: "not_started",
  in_progress: "in_progress",
  review: "review",
  approved: "approved",
  final: "final",
  todo: "todo",
  done: "done",
  idea: "lead",
  mixing: "offered",
  mastered: "holding",
  delivered: "approved",
  scheduled: "approved",
  released: "done",
  // Merch statuses
  draft: "draft",
  active: "active",
  sold_out: "sold_out",
  archived: "archived",
};
