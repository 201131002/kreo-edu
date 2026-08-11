"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqCategory, FaqRole } from "@/lib/faq-defaults";

const ROLE_TABS: { id: FaqRole | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "all" },
  { id: "public", labelKey: "general" },
  { id: "siswa", labelKey: "student" },
  { id: "guru", labelKey: "teacher" },
  { id: "admin", labelKey: "admin" },
];

export function FaqAccordion({
  categories,
  labels,
  defaultRole,
}: {
  categories: FaqCategory[];
  labels: Record<string, string>;
  defaultRole?: FaqRole | "all";
}) {
  const [activeTab, setActiveTab] = useState<FaqRole | "all">(defaultRole ?? "all");
  const [openId, setOpenId] = useState<string | null>(null);

  const visibleCategories =
    activeTab === "all"
      ? categories
      : categories.filter((c) => c.role === activeTab || c.role === "public");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white/60 p-1.5">
        {ROLE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setOpenId(null);
              }}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-primary/10 hover:text-primary"
              )}
            >
              {labels[tab.labelKey]}
            </button>
          );
        })}
      </div>

      {visibleCategories.length === 0 ? (
        <p className="rounded-2xl bg-white/60 p-6 text-center text-sm text-muted">
          {labels.noContent}
        </p>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 font-display text-lg font-bold text-primary">
                {category.title}
              </h2>
              <div className="space-y-2">
                {category.items.map((item, index) => {
                  const itemId = `${category.id}-${index}`;
                  const isOpen = openId === itemId;
                  return (
                    <div
                      key={itemId}
                      className="overflow-hidden rounded-2xl border border-primary/10 bg-white/80"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : itemId)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="font-semibold text-foreground">{item.q}</span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 shrink-0 text-muted transition",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-primary/10 px-4 py-3 text-sm text-muted">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}