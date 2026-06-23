"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SCHEDULE_DAYS } from "@/lib/schedule-constants";
import { saveScheduleSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ScheduleDay } from "@/generated/prisma/client";

async function requireGuru() {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    redirect("/dashboard/guru?error=unauthorized");
  }
  return session;
}

async function requireOwnedClass(classId: string, teacherId: string) {
  const classItem = await prisma.class.findFirst({
    where: { id: classId, teacherId },
  });
  if (!classItem) redirect("/guru/jadwal?error=kelas-tidak-ditemukan");
  return classItem;
}

function jadwalRedirect(classId: string, query: string): never {
  redirect(`/guru/jadwal?classId=${classId}&${query}`);
}

export async function saveClassScheduleAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const classId = String(formData.get("classId") ?? "");
  if (!classId) redirect("/guru/jadwal?error=data-tidak-valid");

  await requireOwnedClass(classId, session.user.id);

  const entries = SCHEDULE_DAYS.map((day) => ({
    day,
    subject: String(formData.get(`subject_${day}`) ?? "").trim(),
    startTime: String(formData.get(`startTime_${day}`) ?? "").trim(),
    endTime: String(formData.get(`endTime_${day}`) ?? "").trim(),
    color: String(formData.get(`color_${day}`) ?? "primary"),
  })).filter((entry) => entry.subject.length > 0);

  const parsed = saveScheduleSchema.safeParse({ classId, entries });
  if (!parsed.success) {
    jadwalRedirect(classId, "error=data-tidak-valid");
  }

  for (const entry of parsed.data.entries) {
    if (entry.startTime >= entry.endTime) {
      jadwalRedirect(classId, "error=waktu-tidak-valid");
    }
  }

  await prisma.$transaction(async (tx) => {
    const activeDays = new Set(parsed.data.entries.map((e) => e.day));

    for (const day of SCHEDULE_DAYS) {
      if (!activeDays.has(day)) {
        await tx.scheduleEntry.deleteMany({
          where: { classId, day: day as ScheduleDay },
        });
      }
    }

    for (const entry of parsed.data.entries) {
      await tx.scheduleEntry.upsert({
        where: {
          classId_day: { classId, day: entry.day },
        },
        create: {
          classId,
          day: entry.day,
          subject: entry.subject,
          startTime: entry.startTime,
          endTime: entry.endTime,
          color: entry.color,
        },
        update: {
          subject: entry.subject,
          startTime: entry.startTime,
          endTime: entry.endTime,
          color: entry.color,
        },
      });
    }
  });

  revalidatePath("/guru/jadwal");
  revalidatePath("/jadwal");
  jadwalRedirect(classId, "success=jadwal-disimpan");
}