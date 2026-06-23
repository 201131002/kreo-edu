"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { discussionMessageSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function canAccessClassDiscussion(
  userId: string,
  role: string,
  classId: string
): Promise<boolean> {
  if (role === "ADMIN") return true;

  if (role === "GURU") {
    const cls = await prisma.class.findFirst({
      where: { id: classId, teacherId: userId },
    });
    return !!cls;
  }

  if (role === "SISWA") {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: { classId, studentId: userId },
    });
    return !!enrollment;
  }

  return false;
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) redirect("/masuk");

  const parsed = discussionMessageSchema.safeParse({
    classId: formData.get("classId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    const classId = String(formData.get("classId") ?? "");
    redirect(
      classId
        ? `/pesan?kelas=${classId}&error=pesan-tidak-valid`
        : "/pesan?error=pesan-tidak-valid"
    );
  }

  const { classId, content } = parsed.data;

  const allowed = await canAccessClassDiscussion(
    session.user.id,
    session.user.role,
    classId
  );

  if (!allowed) {
    redirect("/pesan?error=akses-ditolak");
  }

  await prisma.discussionMessage.create({
    data: {
      classId,
      senderId: session.user.id,
      content: content.trim(),
    },
  });

  revalidatePath("/pesan");
  redirect(`/pesan?kelas=${classId}&success=pesan-terkirim`);
}