export const dynamic = "force-dynamic";

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFlashAlert } from "@/components/admin/flash-alert";
import { FaqSettingsForm } from "@/components/admin/faq-settings-form";
import { StudentOnboardingSettingsForm } from "@/components/admin/student-onboarding-settings-form";
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
  const t = await getTranslations("admin.homepage");
  const tc = await getTranslations("common");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")}>
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            {tc("preview")}
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

      <div className="mb-8">
        <StudentOnboardingSettingsForm onboarding={settings.studentOnboarding} />
      </div>

      <div className="mb-8">
        <FaqSettingsForm faq={settings.faq} />
      </div>

      <HomepageSettingsForm settings={settings} />
    </div>
  );
}