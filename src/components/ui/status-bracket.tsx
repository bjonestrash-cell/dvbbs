import { cn } from "@/lib/utils/cn";

/**
 * Bracketed status text. Replaces all status pill chips across the app.
 *
 *   <StatusBracket tone="confirmed">CONFIRMED</StatusBracket>  =>  [CONFIRMED]
 *
 * Geist Mono, 10px, uppercase, tracking 0.08em. No padding, no border, no
 * background. Color comes from the tone token.
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
  | "default"
  | "accent";

const TONE: Record<Tone, string> = {
  confirmed: "text-confirmed",
  contracted: "text-contracted",
  holding: "text-holding",
  offered: "text-offered",
  lead: "text-lead",
  completed: "text-completed",
  cancelled: "text-cancelled",
  not_started: "text-not-started",
  in_progress: "text-in-progress",
  review: "text-review",
  approved: "text-approved",
  final: "text-final",
  todo: "text-todo",
  done: "text-done",
  default: "text-fg",
  accent: "text-accent",
};

export function StatusBracket({
  children,
  tone = "default",
  spaced = false,
  strikethrough,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  spaced?: boolean;
  strikethrough?: boolean;
  className?: string;
}) {
  const open = spaced ? "[ " : "[";
  const close = spaced ? " ]" : "]";
  return (
    <span
      className={cn(
        "bracket-text font-mono",
        TONE[tone],
        strikethrough && "line-through",
        className,
      )}
    >
      <span className="opacity-60">{open}</span>
      {children}
      <span className="opacity-60">{close}</span>
    </span>
  );
}

/** Bracketed filter pill, supports active state and optional count. */
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
  const label = (
    <>
      <span className="opacity-60">{"[ "}</span>
      <span>{children}</span>
      {typeof count === "number" && count > 0 ? (
        <>
          <span className="opacity-60"> · </span>
          <span className="num">{count.toString().padStart(2, "0")}</span>
        </>
      ) : null}
      <span className="opacity-60">{" ]"}</span>
    </>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "bracket-text font-mono h-7 inline-flex items-center px-2 border [transition-duration:80ms]",
        active
          ? "bg-fg text-page border-fg"
          : "border-line text-fg hover:border-line-strong hover:bg-surface-2",
        className,
      )}
    >
      {label}
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
  // Asset statuses
  not_started: "not_started",
  in_progress: "in_progress",
  review: "review",
  approved: "approved",
  final: "final",
  // Marketing statuses
  todo: "todo",
  done: "done",
  // Release statuses
  idea: "lead",
  mixing: "offered",
  mastered: "holding",
  delivered: "approved",
  scheduled: "approved",
  released: "done",
  archived: "completed",
};
