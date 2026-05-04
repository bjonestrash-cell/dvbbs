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

  const rawName =
    member?.display_name || member?.email?.split("@")[0] || "DEMO";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-page/90 px-6 md:px-10 py-4 backdrop-blur supports-[backdrop-filter]:bg-page/75">
      <MobileMenuButton />
      <div className="ml-auto min-w-0">
        <PersonalizedStatus
          name={rawName}
          nextShow={dashboard.nextShow}
          onTheRoadDays={dashboard.onTheRoadDays}
        />
      </div>
    </header>
  );
}
