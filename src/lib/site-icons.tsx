import {
  BookOpen,
  Coins,
  Gamepad2,
  Globe,
  History,
  Rocket,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { MiniGameSetting, StatSetting } from "@/lib/site-settings-types";

const MINI_GAME_ICONS: Record<MiniGameSetting["icon"], LucideIcon> = {
  History,
  Globe,
  Rocket,
  Zap,
  BookOpen,
  Gamepad2,
};

const STAT_ICONS: Record<StatSetting["icon"], LucideIcon> = {
  Users,
  BookOpen,
  Coins,
  Trophy,
};

export function getMiniGameIcon(name: MiniGameSetting["icon"]): LucideIcon {
  return MINI_GAME_ICONS[name] ?? Gamepad2;
}

export function getStatIcon(name: StatSetting["icon"]): LucideIcon {
  return STAT_ICONS[name] ?? Users;
}