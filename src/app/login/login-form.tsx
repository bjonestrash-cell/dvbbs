"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { sendMagicLink, type LoginState } from "./actions";
import { buttonClasses } from "@/components/ui/button";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-3 text-fg">
        <div className="inline-flex items-center gap-2 text-fg-dim">
          <Mail className="size-4" strokeWidth={1.5} aria-hidden />
          <span className="marker">Link sent</span>
        </div>
        <p className="font-sans text-[15px] leading-[1.55] text-fg">
          Check <span className="text-fg">{state.email}</span> for a sign-in
          link. It expires in 60 minutes.
        </p>
        <p className="font-sans text-[13px] text-fg-dim leading-[1.55]">
          You can close this tab. The link will sign you in.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="label">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        placeholder="alex@dvbbs.com"
        className="h-11 border border-line bg-surface px-3 font-sans text-[16px] text-fg placeholder:text-fg-faint outline-none [transition-duration:80ms] focus:border-line-strong"
      />
      {state.status === "error" && state.message ? (
        <p className="font-sans text-[13px] text-cancelled">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ variant: "primary", size: "lg" }) + " mt-1"}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending
          </>
        ) : (
          <>
            Send link
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
