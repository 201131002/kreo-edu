export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { syncEarnedBadges } from "@/lib/badge-service";
import { prisma } from "@/lib/prisma";
import { equipBorderAction, unequipBorderAction } from "@/actions/shop";
import { equipBadgeAction, unequipBadgeAction } from "@/actions/badge";
import { PageHeader } from "@/components/layout/page-header";
import { InventoryFlashAlert } from "@/components/inventory/inventory-flash-alert";
import { InventoryTabs } from "@/components/inventory/inventory-tabs";
import { BadgeIcon } from "@/components/inventory/badge-icon";
import { UserAvatar } from "@/components/user/user-avatar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { badgeUnlockLabel } from "@/lib/badge-labels";
import { Lock, Medal, Package, ShoppingBag, Sparkles } from "lucide-react";

export default async function InventoriPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string; error?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const tab = sp.tab === "lencana" ? "lencana" : "border";

  const profileMeta = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
    select: { id: true, currentLevel: true },
  });

  if (profileMeta) {
    await syncEarnedBadges(
      profileMeta.id,
      session!.user.id,
      profileMeta.currentLevel
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      nama: true,
      imageUrl: true,
      studentProfile: {
        select: {
          id: true,
          currentLevel: true,
          activeBorderId: true,
          activeBadgeId: true,
          activeBorder: {
            select: { id: true, name: true, borderImageUrl: true },
          },
          activeBadge: {
            select: { id: true, name: true, imageUrl: true },
          },
          inventory: {
            orderBy: { purchasedAt: "desc" },
            include: {
              item: {
                select: { id: true, name: true, borderImageUrl: true },
              },
            },
          },
          badges: {
            orderBy: { earnedAt: "desc" },
            include: {
              badge: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  imageUrl: true,
                  criteria: true,
                  criteriaValue: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const profile = user?.studentProfile;

  const allBadges = await prisma.badge.findMany({
    orderBy: [{ criteria: "asc" }, { criteriaValue: "asc" }],
  });

  const earnedIds = new Set(profile?.badges.map((b) => b.badgeId) ?? []);
  const lockedBadges = allBadges.filter((b) => !earnedIds.has(b.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Inventori"
        description="Kelola border profil dan lencana peringkatmu"
      >
        <Link href="/toko">
          <Button variant="outline" size="sm">
            <ShoppingBag className="h-4 w-4" />
            Ke Toko
          </Button>
        </Link>
      </PageHeader>

      <InventoryTabs active={tab} />
      <InventoryFlashAlert success={sp.success} error={sp.error} />

      {tab === "border" ? (
        <>
          <Card className="mb-8">
            <CardTitle className="mb-2">Preview Profil</CardTitle>
            <CardDescription className="mb-4">
              Border mengelilingi foto profil di navbar
            </CardDescription>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <UserAvatar
                nama={user?.nama ?? "Siswa"}
                imageUrl={user?.imageUrl}
                borderImageUrl={profile?.activeBorder?.borderImageUrl ?? null}
                size="xl"
              />
              <div className="space-y-3 text-sm text-muted">
                <p>
                  {profile?.activeBorder
                    ? `Border aktif: ${profile.activeBorder.name}`
                    : "Belum ada border yang dipakai."}
                </p>
                {profile?.activeBorderId && (
                  <form action={unequipBorderAction}>
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                      Lepas Border
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </Card>

          {(profile?.inventory.length ?? 0) === 0 ? (
            <Card className="text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-muted" />
              <CardTitle>Belum Ada Border</CardTitle>
              <CardDescription className="mt-2">
                Beli border di toko dengan koin dari kuis!
              </CardDescription>
              <Link href="/toko" className="mt-4 inline-block">
                <Button variant="secondary">
                  <ShoppingBag className="h-4 w-4" />
                  Buka Toko Reward
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {profile!.inventory.map((entry) => {
                const equipped = entry.item.id === profile!.activeBorderId;
                return (
                  <Card
                    key={entry.id}
                    className={equipped ? "border-primary/40 ring-2 ring-primary/20" : undefined}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <CardTitle className="text-base">{entry.item.name}</CardTitle>
                      {equipped && (
                        <Badge variant="primary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          Dipakai
                        </Badge>
                      )}
                    </div>
                    <div className="mb-4 flex justify-center rounded-2xl bg-gradient-to-br from-primary/5 to-tertiary/5 py-6">
                      <UserAvatar
                        nama={user?.nama ?? "Siswa"}
                        imageUrl={user?.imageUrl}
                        borderImageUrl={entry.item.borderImageUrl}
                        size="lg"
                      />
                    </div>
                    <CardDescription className="mb-4 text-center text-xs">
                      Dibeli {entry.purchasedAt.toLocaleDateString("id-ID")}
                    </CardDescription>
                    {!equipped && (
                      <form action={equipBorderAction}>
                        <input type="hidden" name="itemId" value={entry.item.id} />
                        <Button type="submit" size="sm" className="w-full">
                          Pakai Border
                        </Button>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <Card className="mb-8">
            <CardTitle className="mb-2">Preview Peringkat</CardTitle>
            <CardDescription className="mb-4">
              Lencana tampil di samping namamu di papan peringkat
            </CardDescription>
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-soft">
              {profile?.activeBadge ? (
                <BadgeIcon
                  imageUrl={profile.activeBadge.imageUrl}
                  name={profile.activeBadge.name}
                  size="lg"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
                  <Medal className="h-8 w-8 text-muted" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold">{user?.nama}</p>
                <p className="text-sm text-muted">
                  {profile?.activeBadge
                    ? `Lencana aktif: ${profile.activeBadge.name}`
                    : "Belum ada lencana yang dipakai."}
                </p>
                {profile?.activeBadgeId && (
                  <form action={unequipBadgeAction} className="mt-2">
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                      Lepas Lencana
                    </Button>
                  </form>
                )}
              </div>
              <Link href="/peringkat">
                <Button variant="outline" size="sm">
                  Lihat Peringkat
                </Button>
              </Link>
            </div>
          </Card>

          {(profile?.badges.length ?? 0) === 0 ? (
            <Card className="mb-8 text-center">
              <Medal className="mx-auto mb-3 h-12 w-12 text-muted" />
              <CardTitle>Belum Ada Lencana</CardTitle>
              <CardDescription className="mt-2">
                Selesaikan kuis dan naik level untuk mendapatkan lencana!
              </CardDescription>
            </Card>
          ) : (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {profile!.badges.map((entry) => {
                const equipped = entry.badge.id === profile!.activeBadgeId;
                return (
                  <Card
                    key={entry.id}
                    className={equipped ? "border-secondary/40 ring-2 ring-secondary/20" : undefined}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <CardTitle className="text-base">{entry.badge.name}</CardTitle>
                      {equipped && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          Dipakai
                        </Badge>
                      )}
                    </div>
                    <div className="mb-3 flex justify-center py-4">
                      <BadgeIcon
                        imageUrl={entry.badge.imageUrl}
                        name={entry.badge.name}
                        size="lg"
                      />
                    </div>
                    <CardDescription className="mb-2 text-center">
                      {entry.badge.description ??
                        badgeUnlockLabel(entry.badge.criteria, entry.badge.criteriaValue)}
                    </CardDescription>
                    <CardDescription className="mb-4 text-center text-xs">
                      Diraih {entry.earnedAt.toLocaleDateString("id-ID")}
                    </CardDescription>
                    {!equipped && (
                      <form action={equipBadgeAction}>
                        <input type="hidden" name="badgeId" value={entry.badge.id} />
                        <Button type="submit" size="sm" variant="secondary" className="w-full">
                          Pakai di Peringkat
                        </Button>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {lockedBadges.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-bold text-muted">
                Lencana Berikutnya
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {lockedBadges.map((badge) => (
                  <Card key={badge.id} className="opacity-60">
                    <div className="flex flex-col items-center py-4 text-center">
                      <BadgeIcon imageUrl={badge.imageUrl} name={badge.name} size="md" className="grayscale" />
                      <p className="mt-2 text-sm font-bold">{badge.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Lock className="h-3 w-3" />
                        {badgeUnlockLabel(badge.criteria, badge.criteriaValue)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}