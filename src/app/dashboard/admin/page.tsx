import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { SymmetricMenuGrid } from "@/components/dashboard/symmetric-menu-grid";
import { Award, BarChart3, HelpCircle, LayoutTemplate, ShoppingBag, Users } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  const t = await getTranslations("dashboard.admin");
  const tc = await getTranslations("common");

  const [userCount, shopCount, badgeCount, attemptCount] = await Promise.all([
    prisma.user.count(),
    prisma.shopItem.count(),
    prisma.badge.count(),
    prisma.quizAttempt.count(),
  ]);

  const links = [
    {
      href: "/admin/pengguna",
      title: t("userManagement"),
      description: t("userManagementDesc", { count: userCount }),
      icon: Users,
    },
    {
      href: "/admin/toko",
      title: t("shopManagement"),
      description: t("shopManagementDesc", { count: shopCount }),
      icon: ShoppingBag,
    },
    {
      href: "/admin/lencana",
      title: t("badgeManagement"),
      description: t("badgeManagementDesc", { count: badgeCount }),
      icon: Award,
    },
    {
      href: "/admin/analitik",
      title: t("globalAnalytics"),
      description: t("globalAnalyticsDesc", { count: attemptCount }),
      icon: BarChart3,
    },
    {
      href: "/admin/homepage",
      title: t("homepageManagement"),
      description: t("homepageManagementDesc"),
      icon: LayoutTemplate,
    },
    {
      href: "/bantuan",
      title: t("help"),
      description: t("helpDesc"),
      icon: HelpCircle,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={t("title", { name: session!.user.nama })}
        description={t("description")}
      />

      <SymmetricMenuGrid
        items={links}
        columns={3}
        buttonLabel={tc("open")}
        buttonVariant="secondary"
      />
    </div>
  );
}