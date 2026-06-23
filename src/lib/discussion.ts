import { prisma } from "@/lib/prisma";

export async function getAccessibleClasses(
  userId: string,
  role: string
): Promise<{ id: string; title: string }[]> {
  if (role === "ADMIN") {
    return prisma.class.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }

  if (role === "GURU") {
    return prisma.class.findMany({
      where: { teacherId: userId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
  }

  if (role === "SISWA") {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { studentId: userId },
      include: { class: { select: { id: true, title: true } } },
      orderBy: { joinedAt: "desc" },
    });
    return enrollments.map((e) => e.class);
  }

  return [];
}