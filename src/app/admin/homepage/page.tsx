export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFlashAlert } from "@/components/admin/flash-alert";
import { HomepageSettingsForm } from "@/components/admin/homepage-settings-form";
import { SiteLogoForm } from "@/components/admin/site-logo-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader
        title="Kelola Homepage"
        description="Edit konten halaman depan, logo, dan branding KREO"
      >
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            Lihat Homepage
          </Button>
        </Link>
      </PageHeader>

      <AdminFlashAlert success={sp.success} error={sp.error} />

      <Card className="mb-8">
        <CardTitle>Logo Situs</CardTitle>
        <CardDescription>Upload logo kustom untuk navbar & footer</CardDescription>
        <div className="mt-4">
          <SiteLogoForm siteName={settings.siteName} logoUrl={settings.logoUrl} />
        </div>
      </Card>

      <HomepageSettingsForm settings={settings} />
    </div>
  );
}