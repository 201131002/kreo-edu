export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccessibleClasses } from "@/lib/discussion";
import { PageHeader } from "@/components/layout/page-header";
import { DiscussionFlashAlert } from "@/components/discussion/flash-alert";
import { ClassChannelTabs } from "@/components/discussion/class-channel-tabs";
import { MessageList } from "@/components/discussion/message-list";
import { SendMessageForm } from "@/components/discussion/send-message-form";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle } from "lucide-react";

export default async function PesanPage({
  searchParams,
}: {
  searchParams: Promise<{
    kelas?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const role = session!.user.role;

  const classes = await getAccessibleClasses(session!.user.id, role);
  const requestClass = sp.kelas;
  const activeClassId = classes.some((c) => c.id === requestClass)
    ? requestClass
    : classes[0]?.id;

  const messages = activeClassId
    ? await prisma.discussionMessage.findMany({
        where: { classId: activeClassId },
        include: {
          sender: { select: { id: true, nama: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      })
    : [];

  const activeClass = classes.find((c) => c.id === activeClassId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="Pesan Diskusi"
        description={
          role === "GURU"
            ? "Diskusi dengan siswa di setiap kelas yang kamu ajar"
            : role === "ADMIN"
              ? "Pantau dan kirim pengumuman ke semua kelas"
              : "Ngobrol dengan guru dan teman sekelas"
        }
      />

      <DiscussionFlashAlert success={sp.success} error={sp.error} />

      {classes.length === 0 ? (
        <Card className="py-16 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted" />
          <CardDescription className="text-base">
            {role === "SISWA"
              ? "Gabung kelas dulu untuk mulai diskusi!"
              : "Buat kelas dulu untuk membuka diskusi."}
          </CardDescription>
          <Link
            href={role === "SISWA" ? "/kelas" : "/guru/kelas"}
            className="mt-4 inline-block"
          >
            <Button size="sm">
              <BookOpen className="h-4 w-4" />
              {role === "SISWA" ? "Lihat Kelas" : "Kelola Kelas"}
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <ClassChannelTabs
            classes={classes}
            activeClassId={activeClassId}
          />

          {activeClass && (
            <p className="mb-4 text-sm text-muted">
              Diskusi kelas: <strong className="text-foreground">{activeClass.title}</strong>
            </p>
          )}

          <MessageList
            messages={messages.map((m) => ({
              id: m.id,
              content: m.content,
              createdAt: m.createdAt,
              sender: m.sender,
              isOwn: m.sender.id === session!.user.id,
            }))}
          />

          {activeClassId && <SendMessageForm classId={activeClassId} />}
        </>
      )}
    </div>
  );
}