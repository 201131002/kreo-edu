import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFlashAlert } from "@/components/admin/flash-alert";
import { CreateShopItemForm } from "@/components/admin/create-shop-item-form";
import { BorderCardPreview } from "@/components/shop/border-preview";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function AdminTokoPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const items = await prisma.shopItem.findMany({ orderBy: { priceCoins: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Kelola Toko Border"
        description="Upload border PNG dan atur harga koin"
      />

      <Suspense>
        <AdminFlashAlert success={sp.success} error={sp.error} />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardTitle>Tambah Border Baru</CardTitle>
          <CardDescription className="mt-1">
            Upload frame PNG (tengah transparan) seperti avatar border
          </CardDescription>
          <div className="mt-4">
            <CreateShopItemForm />
          </div>
        </Card>

        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center gap-4">
              <BorderCardPreview borderImageUrl={item.borderImageUrl} className="!h-20 !w-20 shrink-0" />
              <div>
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription>{item.priceCoins} koin</CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}