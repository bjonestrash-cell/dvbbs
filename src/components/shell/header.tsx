import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { getDashboard } from "@/lib/data/dashboard";
import { PersonalizedStatus } from "./personalized-status";

export async function Header() {
  const [member, dashboard] = await Promise.all([
    AUTH_DISABLED ? Promise.resolve(null) : getCurrentMember(),
    getDashboard().catch(() => ({
      nextShow: null,
      onTheRoadDays: 0,
      attentionCount: 0,
    })),
  ]);

  const rawName =
    member?.display_name || member?.email?.split("@")[0] || "Alex";

  // Hamburger removed: phones + tablets use the bottom nav's "More" tab
  // to open the drawer; desktops have the always-visible sidebar.
  // The header is now status-only on the right; px adjusted so the status
  // block sits with proper edge inset at every breakpoint.
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-page/85 px-6 md:px-10 py-3 md:py-4 backdrop-blur supports-[backdrop-filter]:bg-page/70">
      <div className="ml-auto min-w-0 max-w-full">
        <PersonalizedStatus
          name={rawName}
          nextShow={dashboard.nextShow}
          onTheRoadDays={dashboard.onTheRoadDays}
        />
      </div>
    </header>
  );
}
