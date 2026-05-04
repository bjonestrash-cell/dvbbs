import * as React from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type = "text", ...rest }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-10 w-full rounded-md border border-line bg-bg-input px-3 text-sm text-fg placeholder:text-fg-dim outline-none transition-colors focus:border-line-strong",
          className,
        )}
        {...rest}
      />
    );
  },
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-line bg-bg-input px-3 pr-8 text-sm text-fg outline-none transition-colors focus:border-line-strong appearance-none",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-20 w-full rounded-md border border-line bg-bg-input px-3 py-2 text-sm text-fg placeholder:text-fg-dim outline-none transition-colors focus:border-line-strong resize-y",
          className,
        )}
        {...rest}
      />
    );
  },
);
