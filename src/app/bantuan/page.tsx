import Link from "next/link";
import { HelpCircle, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import type { FaqRole } from "@/lib/faq-defaults";
import { PageHeader } from "@/components/layout/page-header";
import { FaqAccordion } from "@/components/bantuan/faq-accordion";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function roleToFaqTab(role: string | undefined): FaqRole | "all" {
  if (role === "SISWA") return "siswa";
  if (role === "GURU") return "guru";
  if (role === "ADMIN") return "admin";
  return "all";
}

export default async function BantuanPage() {
  const [session, settings, t] = await Promise.all([
    auth(),
    getSiteSettings(),
    getTranslations("bantuan"),
  ]);

  const defaultRole = roleToFaqTab(session?.user.role);
  const roleLabel =
    session?.user.role === "SISWA"
      ? t("categories.student")
      : session?.user.role === "GURU"
        ? t("categories.teacher")
        : session?.user.role === "ADMIN"
          ? t("categories.admin")
          : null;

  const labels: Record<string, string> = {
    all: t("categories.all"),
    general: t("categories.general"),
    student: t("categories.student"),
    teacher: t("categories.teacher"),
    admin: t("categories.admin"),
    noContent: t("noContent"),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader title={t("title")} description={t("description")} />

      <Card className="mb-8 border-primary/15 bg-gradient-to-br from-primary/5 to-white">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("howToTitle")}</CardTitle>
            <CardDescription className="mt-2 text-foreground/80">
              {roleLabel ? t("howToLoggedIn", { role: roleLabel }) : t("howToGuest")}
            </CardDescription>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li>• {t("howToStep1")}</li>
              <li>• {t("howToStep2")}</li>
              <li>• {t("howToStep3")}</li>
            </ul>
          </div>
        </div>
      </Card>

      <FaqAccordion
        categories={settings.faq.categories}
        labels={labels}
        defaultRole={defaultRole}
      />

      <Card className="mt-10 border-tertiary/20 bg-tertiary/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">{t("needMoreTitle")}</CardTitle>
            <CardDescription className="mt-1 text-foreground/80">
              {session ? t("needMoreLoggedIn") : t("needMoreGuest")}
            </CardDescription>
          </div>
          {session ? (
            <Link href="/pesan">
              <Button variant="outline" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("openMessages")}
              </Button>
            </Link>
          ) : (
            <Link href="/masuk">
              <Button size="sm">{t("loginToAsk")}</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}