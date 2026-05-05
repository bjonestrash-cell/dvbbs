import {
  Calendar,
  Disc3,
  Shirt,
  Users,
  Inbox,
  CircleDollarSign,
  ShieldCheck,
  Settings,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  phase: 1 | 2 | 3 | 4;
  ready: boolean;
};

export const NAV: NavItem[] = [
  { href: "/tour", label: "TOUR", icon: Calendar, phase: 1, ready: true },
  { href: "/releases", label: "RELEASES", icon: Disc3, phase: 2, ready: true },
  { href: "/merch", label: "MERCH", icon: Shirt, phase: 3, ready: true },
  { href: "/contacts", label: "CONTACTS", icon: Users, phase: 1, ready: true },
  { href: "/inbox", label: "INBOX", icon: Inbox, phase: 4, ready: false },
  { href: "/finance", label: "FINANCE", icon: CircleDollarSign, phase: 4, ready: true },
  { href: "/team", label: "TEAM", icon: ShieldCheck, phase: 1, ready: true },
  { href: "/settings", label: "SETTINGS", icon: Settings, phase: 1, ready: true },
];

/** Compatibility exports for callers that haven't migrated. */
export const DESKTOP_NAV = NAV;
export const MOBILE_NAV = NAV;
