export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DAY_LABELS,
  daySortIndex,
  formatScheduleTime,
} from "@/lib/schedule-constants";
import { Calendar } from "lucide-react";

export default async function JadwalPage() {
  const session = await auth();

  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId: session!.user.id },
    select: {
      class: {
        select: {
          title: true,
          scheduleEntries: {
            select: {
              day: true,
              subject: true,
              startTime: true,
              endTime: true,
              color: true,
            },
          },
        },
      },
    },
  });

  const items = enrollments
    .flatMap((enrollment) =>
      enrollment.class.scheduleEntries.map((entry) => ({
        ...entry,
        classTitle: enrollment.class.title,
      }))
    )
    .sort((a, b) => daySortIndex(a.day) - daySortIndex(b.day));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Jadwal Belajar"
        description="Rencanakan petualangan belajarmu minggu ini"
      />

      {items.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-muted" />
          <CardDescription className="text-base">
            Belum ada jadwal. Gabung kelas dulu — gurumu akan mengatur jadwal
            belajar di sini.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card
              key={`${item.classTitle}-${item.day}`}
              className="flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">
                    {DAY_LABELS[item.day]}
                  </CardTitle>
                  <Badge variant={item.color}>{item.subject}</Badge>
                  <span className="text-xs text-muted">{item.classTitle}</span>
                </div>
                <CardDescription>
                  {formatScheduleTime(item.startTime, item.endTime)}
                </CardDescription>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}