import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "bracket" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  // Primary CTA, inverted block. Warm near-black surface, cream text.
  primary:
    "bg-inverted text-fg-inverted hover:bg-fg",
  // Refined hairline outline button. The default visual.
  bracket:
    "bg-surface text-fg border border-line hover:border-line-strong hover:bg-surface-2",
  // Legacy alias for outline button.
  secondary:
    "bg-surface text-fg border border-line hover:border-line-strong hover:bg-surface-2",
  // Quiet text-only button.
  ghost: "text-fg-dim hover:text-fg hover:bg-surface-2",
  // Destructive outline.
  danger:
    "bg-surface text-cancelled border border-line hover:border-cancelled",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px] tracking-[0.06em]",
  md: "h-10 px-4 text-[12px] tracking-[0.06em]",
  lg: "h-12 px-5 text-[13px] tracking-[0.06em]",
};

export function buttonClasses({
  variant = "bracket",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-mono uppercase font-medium",
    "[transition-duration:80ms]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "bracket", size = "md", type = "button", children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses({ variant, size, className })}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

/** Backward-compat shell, now a no-op pass-through. The bracket [] decorations
 *  belonged to the prior brutalist pass and have been removed. */
export function BracketShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
