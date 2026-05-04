import { requireMember } from "@/lib/auth/dal";
import { UserMenu } from "./user-menu";

export async function Header() {
  const member = await requireMember();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg-base/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-bg-base/70">
      <div className="md:hidden flex items-center gap-2">
        <ChevronMark className="size-5 text-accent" />
        <div className="font-display text-sm tracking-tight">
          <span className="font-semibold">DVBBS</span>
          <span className="text-fg-muted"> HQ</span>
        </div>
      </div>
      <div className="hidden md:block" />
      <div className="ml-auto">
        <UserMenu
          email={member.email}
          displayName={member.display_name}
          role={member.role}
        />
      </div>
    </header>
  );
}

function ChevronMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M3 6L12 15L21 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <path d="M3 14L12 23L21 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}
