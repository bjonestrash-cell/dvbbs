import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "bracket" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-fg text-page hover:bg-accent hover:text-fg",
  bracket:
    "bg-transparent text-fg border border-line hover:bg-fg hover:text-page hover:border-fg",
  // "secondary" is the legacy alias for the bracket variant.
  secondary:
    "bg-transparent text-fg border border-line hover:bg-fg hover:text-page hover:border-fg",
  ghost: "text-fg hover:bg-surface-2",
  danger:
    "bg-transparent text-cancelled border border-line hover:bg-cancelled hover:text-page hover:border-cancelled",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-10 px-4 text-[12px]",
  lg: "h-12 px-5 text-[13px]",
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
    "inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.08em] font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "[transition-duration:80ms]",
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
        {variant === "bracket" ? (
          <>
            <span className="opacity-60">[</span>
            <span>{children}</span>
            <span className="opacity-60">]</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

/** Wrap any element (e.g., <Link>) with bracket-button styling and the [..] decorations. */
export function BracketShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="opacity-60">[</span>
      <span>{children}</span>
      <span className="opacity-60">]</span>
    </>
  );
}
