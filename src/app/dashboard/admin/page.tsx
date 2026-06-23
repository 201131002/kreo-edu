import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BarChart3, LayoutTemplate, ShoppingBag, Users } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  const [userCount, shopCount, badgeCount, attemptCount] = await Promise.all([
    prisma.user.count(),
    prisma.shopItem.count(),
    prisma.badge.count(),
    prisma.quizAttempt.count(),
  ]);

  const links = [
    {
      href: "/admin/pengguna",
      title: "Manajemen Pengguna",
      desc: `${userCount} pengguna terdaftar`,
      icon: Users,
    },
    {
      href: "/admin/toko",
      title: "Kelola Toko",
      desc: `${shopCount} item di toko`,
      icon: ShoppingBag,
    },
    {
      href: "/admin/lencana",
      title: "Kelola Lencana",
      desc: `${badgeCount} lencana aktif`,
      icon: Award,
    },
    {
      href: "/admin/analitik",
      title: "Analitik Global",
      desc: `${attemptCount} kuis diselesaikan`,
      icon: BarChart3,
    },
    {
      href: "/admin/homepage",
      title: "Kelola Homepage",
      desc: "Edit logo, hero, mini games & footer",
      icon: LayoutTemplate,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={`Dashboard Admin — ${session!.user.nama}`}
        description="Pantau dan kelola seluruh platform KREO."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.href} className="transition hover:-translate-y-1 hover:shadow-soft">
              <Icon className="mb-3 h-10 w-10 text-secondary" />
              <CardTitle>{link.title}</CardTitle>
              <CardDescription>{link.desc}</CardDescription>
              <Link href={link.href} className="mt-4 inline-block">
                <Button variant="secondary" size="sm">
                  Buka
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}