import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  Gamepad2,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  LineChart,
  LogIn,
  Medal,
  MessageCircle,
  Package,
  Settings,
  ShoppingBag,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

export type UserRole = "SISWA" | "GURU" | "ADMIN";

export type NavLabelKey =
  | "classes"
  | "shop"
  | "inventory"
  | "ranking"
  | "report"
  | "messages"
  | "help"
  | "myClasses"
  | "questionBank"
  | "students"
  | "users"
  | "badges"
  | "homepage"
  | "analytics"
  | "dashboard"
  | "settings"
  | "adventures"
  | "statistics"
  | "login"
  | "register";

export type NavItem = {
  href: string;
  labelKey: NavLabelKey;
  icon: LucideIcon;
};

export const PRIMARY_NAV_LINKS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/pengaturan", labelKey: "settings", icon: Settings },
];

export const PUBLIC_NAV_LINKS: NavItem[] = [
  { href: "/#games", labelKey: "adventures", icon: Gamepad2 },
  { href: "/#stats", labelKey: "statistics", icon: LineChart },
  { href: "/bantuan", labelKey: "help", icon: HelpCircle },
  { href: "/masuk", labelKey: "login", icon: LogIn },
  { href: "/daftar", labelKey: "register", icon: UserPlus },
];

export const FEATURE_NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  SISWA: [
    { href: "/kelas", labelKey: "classes", icon: BookOpen },
    { href: "/toko", labelKey: "shop", icon: ShoppingBag },
    { href: "/inventori", labelKey: "inventory", icon: Package },
    { href: "/peringkat", labelKey: "ranking", icon: Medal },
    { href: "/laporan", labelKey: "report", icon: Trophy },
    { href: "/pesan", labelKey: "messages", icon: MessageCircle },
    { href: "/bantuan", labelKey: "help", icon: HelpCircle },
  ],
  GURU: [
    { href: "/guru/kelas", labelKey: "myClasses", icon: BookOpen },
    { href: "/guru/bank-soal", labelKey: "questionBank", icon: Library },
    { href: "/guru/siswa", labelKey: "students", icon: Users },
    { href: "/guru/analitik", labelKey: "analytics", icon: BarChart3 },
    { href: "/pesan", labelKey: "messages", icon: MessageCircle },
    { href: "/peringkat", labelKey: "ranking", icon: Medal },
    { href: "/bantuan", labelKey: "help", icon: HelpCircle },
  ],
  ADMIN: [
    { href: "/admin/pengguna", labelKey: "users", icon: Users },
    { href: "/admin/toko", labelKey: "shop", icon: ShoppingBag },
    { href: "/admin/lencana", labelKey: "badges", icon: Award },
    { href: "/admin/homepage", labelKey: "homepage", icon: LayoutTemplate },
    { href: "/admin/analitik", labelKey: "analytics", icon: BarChart3 },
    { href: "/pesan", labelKey: "messages", icon: MessageCircle },
    { href: "/peringkat", labelKey: "ranking", icon: Medal },
    { href: "/bantuan", labelKey: "help", icon: HelpCircle },
  ],
};

/** Navbar desktop — hanya Dashboard; fitur lain di sidebar mobile. */
export function getDesktopNavbarLinks(_role: UserRole): NavItem[] {
  return [{ href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard }];
}

export function isAppRole(role: string | undefined): role is UserRole {
  return role === "SISWA" || role === "GURU" || role === "ADMIN";
}