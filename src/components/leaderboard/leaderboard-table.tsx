import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/inventory/badge-icon";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";
import { Coins, Crown, Star, Trophy } from "lucide-react";

type Leader = {
  rank: number;
  userId: string;
  nama: string;
  imageUrl: string | null;
  borderImageUrl: string | null;
  badgeName: string | null;
  badgeImageUrl: string | null;
  level: number;
  exp: number;
  coins: number;
  quizCount: number;
  isCurrentUser: boolean;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <Crown className="absolute -top-3.5 left-1/2 h-5 w-5 -translate-x-1/2 text-amber-500 drop-shadow-sm" />
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 ring-4 ring-amber-200/70 shadow-lg shadow-amber-400/40">
          <span className="font-display text-xl font-black text-white drop-shadow-sm">1</span>
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-slate-100 to-slate-300 ring-4 ring-slate-200/80 shadow-md">
          <span className="font-display text-lg font-black text-slate-600">2</span>
        </div>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-orange-300 to-amber-700 ring-4 ring-orange-200/70 shadow-md shadow-amber-700/30">
          <span className="font-display text-lg font-black text-white drop-shadow-sm">3</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
      {rank}
    </div>
  );
}

export function LeaderboardTable({ leaders }: { leaders: Leader[] }) {
  if (leaders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 py-16 text-center text-muted">
        Belum ada data peringkat. Selesaikan kuis untuk naik peringkat!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leaders.map((leader) => (
        <div
          key={leader.userId}
          className={cn(
            "flex items-center gap-4 rounded-3xl border bg-white/90 p-4 shadow-soft backdrop-blur-sm transition",
            leader.isCurrentUser && "border-primary/40 ring-2 ring-primary/20",
            leader.rank <= 3 && !leader.isCurrentUser && "border-amber-200/60"
          )}
        >
          <RankBadge rank={leader.rank} />

          <UserAvatar
            nama={leader.nama}
            imageUrl={leader.imageUrl}
            borderImageUrl={leader.borderImageUrl}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-bold text-foreground">
                {leader.nama}
              </span>
              {leader.isCurrentUser && (
                <Badge variant="primary" className="text-xs">
                  Kamu
                </Badge>
              )}
              <Badge variant="primary">Lv. {leader.level}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
              {leader.badgeImageUrl && (
                <span
                  className="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-secondary/10 px-1.5 py-0.5 font-semibold text-secondary"
                  title={leader.badgeName ?? undefined}
                >
                  <BadgeIcon
                    imageUrl={leader.badgeImageUrl}
                    name={leader.badgeName ?? "Lencana"}
                    size="sm"
                  />
                  <span className="truncate">{leader.badgeName ?? "Lencana"}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-tertiary" />
                {leader.exp} EXP
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-secondary" />
                {leader.coins} Koin
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                {leader.quizCount} kuis
              </span>
            </div>
          </div>

          {leader.rank === 1 && (
            <Trophy className="hidden h-8 w-8 shrink-0 text-amber-400 sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}