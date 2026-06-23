export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { purchaseItemAction } from "@/actions/shop";
import { PageHeader } from "@/components/layout/page-header";
import { BorderCardPreview } from "@/components/shop/border-preview";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Package, ShoppingBag } from "lucide-react";

export default async function TokoPage() {
  const session = await auth();
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
    include: { inventory: { select: { itemId: true } } },
  });

  const items = await prisma.shopItem.findMany({ orderBy: { priceCoins: "asc" } });
  const ownedIds = new Set(profile?.inventory.map((i) => i.itemId) ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Toko Reward"
        description="Beli border keren, lalu pakai dari inventori!"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/inventori">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Inventori
            </Button>
          </Link>
          <div className="flex items-center gap-2 rounded-2xl bg-secondary/10 px-4 py-2">
            <Coins className="h-5 w-5 text-secondary" />
            <span className="font-bold text-secondary">
              {profile?.virtualCurrency ?? 0} Koin
            </span>
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const owned = ownedIds.has(item.id);
          const canBuy = (profile?.virtualCurrency ?? 0) >= item.priceCoins;
          return (
            <Card key={item.id}>
              <BorderCardPreview borderImageUrl={item.borderImageUrl} className="mb-4" />
              <CardTitle>{item.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-secondary" />
                {item.priceCoins} Koin
              </CardDescription>
              <div className="mt-4">
                {owned ? (
                  <div className="space-y-2">
                    <Badge variant="primary" className="w-full justify-center py-2">
                      Sudah Dimiliki
                    </Badge>
                    <Link href="/inventori">
                      <Button variant="outline" size="sm" className="w-full">
                        <Package className="h-4 w-4" />
                        Pakai di Inventori
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form action={purchaseItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={!canBuy}
                      className="w-full"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Beli
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}