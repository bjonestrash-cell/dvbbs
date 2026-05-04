import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in. DVBBS HQ",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginScreen searchParamsPromise={searchParams} />;
}

async function LoginScreen({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ error?: string }>;
}) {
  const sp = await searchParamsPromise;
  const error = sp.error;

  return (
    <div className="grain min-h-dvh bg-bg-base">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-12 flex items-center gap-3">
          <ChevronMark className="size-7 text-accent" />
          <div className="font-display text-base tracking-tight">
            <span className="font-semibold">DVBBS</span>
            <span className="text-fg-muted"> HQ</span>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mb-8 text-sm text-fg-muted">
          Magic link only. Whitelisted emails only.
        </p>

        {error ? (
          <div className="mb-6 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-fg">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <LoginForm />

        <div className="chevron-rule mt-12" aria-hidden />
        <p className="mt-6 text-xs text-fg-dim">
          Internal tool. Do not share.
        </p>
      </div>
    </div>
  );
}

function ChevronMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path d="M3 6L12 15L21 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <path d="M3 14L12 23L21 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}
