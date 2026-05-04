import { redirect } from "next/navigation";

export default function RootPage() {
  // In demo mode, send everyone to /tour. Auth-aware redirect (logged-in vs
  // /login) lives in src/app/page.auth.tsx.bak when re-enabled.
  redirect("/tour");
}
