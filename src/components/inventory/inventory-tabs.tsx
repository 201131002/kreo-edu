import Link from "next/link";
import { cn } from "@/lib/utils";
import { Frame, Medal } from "lucide-react";

export function InventoryTabs({ active }: { active: "border" | "lencana" }) {
  const tabs = [
    { id: "border" as const, label: "Border", icon: Frame, href: "/inventori?tab=border" },
    { id: "lencana" as const, label: "Lencana", icon: Medal, href: "/inventori?tab=lencana" },
  ];

  return (
    <div className="mb-8 flex gap-2 rounded-2xl bg-surface p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              selected
                ? "bg-white text-primary shadow-soft"
                : "text-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}