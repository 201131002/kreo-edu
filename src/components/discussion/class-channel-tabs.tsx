import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export function ClassChannelTabs({
  classes,
  activeClassId,
}: {
  classes: { id: string; title: string; unread?: number }[];
  activeClassId?: string;
}) {
  if (classes.length === 0) return null;

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl bg-white/60 p-1.5">
      {classes.map((cls) => {
        const isActive = cls.id === activeClassId;
        return (
          <Link
            key={cls.id}
            href={`/pesan?kelas=${cls.id}`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-tertiary text-white shadow-sm"
                : "text-muted hover:bg-tertiary/10 hover:text-tertiary"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            {cls.title}
          </Link>
        );
      })}
    </div>
  );
}