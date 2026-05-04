import { requireMember } from "@/lib/auth/dal";
import { Sidebar } from "@/components/shell/sidebar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { Header } from "@/components/shell/header";
import { CommandPalette } from "@/components/shell/command-palette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMember();
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <BottomNav />
      <CommandPalette />
    </div>
  );
}
