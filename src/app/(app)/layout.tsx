import { AUTH_DISABLED } from "@/lib/auth/mode";
import { requireMember } from "@/lib/auth/dal";
import { Sidebar } from "@/components/shell/sidebar";
import { SidebarProvider } from "@/components/shell/sidebar-state";
import { Header } from "@/components/shell/header";
import { BottomNav } from "@/components/shell/bottom-nav";
import { CommandPalette } from "@/components/shell/command-palette";
import { CatalogFooter } from "@/components/shell/catalog-footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!AUTH_DISABLED) {
    await requireMember();
  }
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "local";

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh bg-page">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          {/* Bottom-nav reserves ~56px on mobile, plus the iOS safe-area inset.
              Calculated as h-14 (56px) + pb-safe so content never sits under it. */}
          <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom,0px))] md:pb-0">
            {children}
          </main>
          <CatalogFooter commitSha={commitSha} />
        </div>
        <BottomNav />
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}
