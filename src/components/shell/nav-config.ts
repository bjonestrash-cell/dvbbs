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
  desktop: boolean;
  mobile: boolean;
};

export const NAV: NavItem[] = [
  { href: "/tour", label: "Tour", icon: Calendar, phase: 1, ready: true, desktop: true, mobile: true },
  { href: "/releases", label: "Releases", icon: Disc3, phase: 2, ready: true, desktop: true, mobile: true },
  { href: "/merch", label: "Merch", icon: Shirt, phase: 3, ready: false, desktop: true, mobile: true },
  { href: "/contacts", label: "Contacts", icon: Users, phase: 1, ready: true, desktop: true, mobile: false },
  { href: "/inbox", label: "Inbox", icon: Inbox, phase: 4, ready: false, desktop: true, mobile: true },
  { href: "/finance", label: "Finance", icon: CircleDollarSign, phase: 4, ready: false, desktop: true, mobile: false },
  { href: "/team", label: "Team", icon: ShieldCheck, phase: 1, ready: true, desktop: true, mobile: false },
  { href: "/settings", label: "Settings", icon: Settings, phase: 1, ready: true, desktop: true, mobile: false },
];

export const DESKTOP_NAV = NAV.filter((n) => n.desktop);
export const MOBILE_NAV = NAV.filter((n) => n.mobile);
