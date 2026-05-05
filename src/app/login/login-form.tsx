"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-3 text-fg">
        <div className="flex items-center gap-2 text-fg-dim">
          <Mail className="size-4" aria-hidden />
          <span className="marker">link sent</span>
        </div>
        <p className="text-base leading-relaxed">
          Check <span className="text-fg">{state.email}</span> for a sign in link. It expires in 60 minutes.
        </p>
        <p className="text-sm text-fg-dim">
          You can close this tab. The link will sign you in.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="marker">
        email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        placeholder="alex@dvbbs.com"
        className="h-11 border border-line bg-surface px-3 text-fg placeholder:text-fg-dim outline-none [transition-duration:80ms] focus:border-line-strong"
      />
      {state.status === "error" && state.message ? (
        <p className="text-sm text-accent">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 bg-accent text-accent-fg font-medium [transition-duration:80ms] hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending
          </>
        ) : (
          <>
            Send link
            <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
