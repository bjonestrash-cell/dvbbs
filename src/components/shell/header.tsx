import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { getDashboard } from "@/lib/data/dashboard";
import { MobileMenuButton } from "./mobile-menu-button";
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

  const name = (member?.display_name || member?.email?.split("@")[0] || "DEMO")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-page/85"
    >
      <MobileMenuButton />
      <div className="ml-auto min-w-0">
        <PersonalizedStatus
          name={name}
          nextShow={dashboard.nextShow}
          onTheRoadDays={dashboard.onTheRoadDays}
        />
      </div>
    </header>
  );
}
