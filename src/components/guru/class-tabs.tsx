"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileText, Gamepad2 } from "lucide-react";

export function ClassTabs({
  classId,
  activeTab,
}: {
  classId: string;
  activeTab: "materi" | "kuis";
}) {
  const tabs = [
    { id: "materi" as const, label: "Materi", icon: FileText },
    { id: "kuis" as const, label: "Kuis", icon: Gamepad2 },
  ];

  return (
    <div className="mb-6 flex gap-2 rounded-2xl bg-white/60 p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={`/guru/kelas/${classId}?tab=${tab.id}`}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-tertiary text-white shadow-sm"
                : "text-muted hover:bg-tertiary/10 hover:text-tertiary"
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