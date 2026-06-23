import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GraduationCap, Shield, User } from "lucide-react";

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    nama: string;
    role: "SISWA" | "GURU" | "ADMIN";
  };
  isOwn: boolean;
};

const roleIcon = {
  SISWA: User,
  GURU: GraduationCap,
  ADMIN: Shield,
};

const roleBadge = {
  SISWA: "primary" as const,
  GURU: "tertiary" as const,
  ADMIN: "secondary" as const,
};

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageList({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-tertiary/30 bg-tertiary/5 py-16 text-center">
        <p className="text-muted">Belum ada pesan. Jadilah yang pertama menyapa! 👋</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const Icon = roleIcon[msg.sender.role];
        return (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.isOwn ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 shadow-soft",
                msg.isOwn
                  ? "rounded-br-lg bg-primary text-white"
                  : "rounded-bl-lg border border-white/60 bg-white/90"
              )}
            >
              {!msg.isOwn && (
                <div className="mb-1.5 flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      msg.sender.role === "GURU" && "text-tertiary",
                      msg.sender.role === "ADMIN" && "text-secondary",
                      msg.sender.role === "SISWA" && "text-primary"
                    )}
                  />
                  <span className="text-sm font-bold text-foreground">
                    {msg.sender.nama}
                  </span>
                  <Badge variant={roleBadge[msg.sender.role]} className="text-[10px]">
                    {msg.sender.role}
                  </Badge>
                </div>
              )}
              <p
                className={cn(
                  "whitespace-pre-wrap text-sm leading-relaxed",
                  msg.isOwn ? "text-white" : "text-foreground"
                )}
              >
                {msg.content}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-right text-[10px]",
                  msg.isOwn ? "text-white/70" : "text-muted"
                )}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}