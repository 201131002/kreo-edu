import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/inventory/badge-icon";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";
import { Coins, Crown, Medal, Star, Trophy } from "lucide-react";

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
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-white shadow-md">
        <Crown className="h-5 w-5" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-white shadow-md">
        <Medal className="h-5 w-5" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-md">
        <Medal className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
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
              {leader.badgeImageUrl && (
                <BadgeIcon
                  imageUrl={leader.badgeImageUrl}
                  name={leader.badgeName ?? "Lencana"}
                  size="sm"
                />
              )}
              <span className="truncate font-bold text-foreground">
                {leader.nama}
              </span>
              {leader.isCurrentUser && (
                <Badge variant="primary" className="text-[10px]">
                  Kamu
                </Badge>
              )}
              <Badge variant="primary">Lv. {leader.level}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
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