"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  classSchema,
  classIdSchema,
  materialSchema,
  materialIdSchema,
  quizSchema,
  quizIdSchema,
  questionSchema,
  questionIdSchema,
  updateClassSchema,
  updateMaterialSchema,
  updateQuizSchema,
  updateQuestionSchema,
} from "@/lib/validations";
import { validateMediaFile, validateEmbedUrl, type FileMediaType } from "@/lib/media-validation";
import { saveMediaFile, deleteMediaFile } from "@/lib/media-storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  if (!classItem) redirect("/guru/kelas?error=kelas-tidak-ditemukan");
  return classItem;
}

async function requireOwnedQuiz(quizId: string, teacherId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, class: { teacherId } },
    include: { class: true },
  });
  if (!quiz) redirect("/guru/kelas?error=kuis-tidak-ditemukan");
  return quiz;
}

async function requireOwnedMaterial(materialId: string, teacherId: string) {
  const material = await prisma.material.findFirst({
    where: { id: materialId, class: { teacherId } },
    include: { class: true },
  });
  if (!material) redirect("/guru/kelas?error=materi-tidak-ditemukan");
  return material;
}

async function requireOwnedQuestion(questionId: string, teacherId: string) {
  const question = await prisma.question.findFirst({
    where: { id: questionId, quiz: { class: { teacherId } } },
    include: { quiz: { include: { class: true } } },
  });
  if (!question) redirect("/guru/kelas?error=soal-tidak-ditemukan");
  return question;
}

function classRedirect(classId: string, query: string, tab?: string): never {
  const tabParam = tab ? `&tab=${tab}` : "";
  redirect(`/guru/kelas/${classId}?${query}${tabParam}`);
}

function quizRedirect(classId: string, quizId: string, query: string): never {
  redirect(`/guru/kelas/${classId}/kuis/${quizId}?${query}`);
}

export async function createClassAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = classSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  const newClass = await prisma.class.create({
    data: {
      ...parsed.data,
      teacherId: session.user.id,
    },
  });

  revalidatePath("/guru/kelas");
  revalidatePath("/kelas");
  redirect(`/guru/kelas/${newClass.id}?success=kelas-dibuat`);
}

export async function enrollClassAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") return;

  const classId = String(formData.get("classId") ?? "");
  if (!classId) return;

  await prisma.classEnrollment.upsert({
    where: {
      classId_studentId: { classId, studentId: session.user.id },
    },
    create: { classId, studentId: session.user.id },
    update: {},
  });

  revalidatePath("/kelas");
  revalidatePath("/dashboard/siswa");
}

export async function createMaterialAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const classId = String(formData.get("classId") ?? "");
  const parsed = materialSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    classId,
  });

  if (!parsed.success || !classId) {
    redirect(
      classId
        ? `/guru/kelas/${classId}?error=data-tidak-valid&tab=materi`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedClass(parsed.data.classId, session.user.id);

  // Extract media files and embed URLs
  const mediaFiles = formData.getAll("mediaFiles") as File[];
  const embedUrls = formData.getAll("embedUrls") as string[];

  // Validate media files
  const validatedFiles: { file: File; type: FileMediaType }[] = [];
  for (const file of mediaFiles) {
    if (!(file instanceof File) || file.size === 0) continue;
    const result = validateMediaFile(file);
    if (!result.ok) {
      redirect(`/guru/kelas/${classId}?error=media-invalid:${result.error}&tab=materi`);
    }
    validatedFiles.push({ file: result.data, type: result.type });
  }

  // Validate embed URLs
  const validatedEmbeds: { url: string }[] = [];
  for (const url of embedUrls) {
    if (!url || url.trim() === "") continue;
    const result = validateEmbedUrl(url);
    if (!result.ok) {
      redirect(`/guru/kelas/${classId}?error=embed-invalid:${result.error}&tab=materi`);
    }
    validatedEmbeds.push({ url: url.trim() });
  }

  // Create material
  const material = await prisma.material.create({ data: parsed.data });

  // Save media files
  let order = 0;
  const savedUrls: string[] = [];
  try {
    for (const { file, type } of validatedFiles) {
      const folder =
        type === "IMAGE"
          ? "images"
          : type === "VIDEO"
            ? "videos"
            : type === "AUDIO"
              ? "audios"
              : type === "EBOOK"
                ? "ebooks"
                : "pdfs";
      const url = await saveMediaFile(material.id, file, folder);
      savedUrls.push(url);
      await prisma.media.create({
        data: {
          materialId: material.id,
          type,
          url,
          title: file.name,
          order: order++,
        },
      });
    }

    // Save embed URLs
    for (const { url } of validatedEmbeds) {
      await prisma.media.create({
        data: {
          materialId: material.id,
          type: "EMBED",
          url,
          title: "Embed",
          order: order++,
        },
      });
    }
  } catch (err) {
    // Gagal di tengah penyimpanan: hapus file yang sudah tersimpan lalu hapus material
    await Promise.all(savedUrls.map((url) => deleteMediaFile(url)));
    await prisma.material.delete({ where: { id: material.id } });
    throw err;
  }

  revalidatePath(`/guru/kelas/${classId}`);
  revalidatePath(`/kelas/${classId}/materi`);
  redirect(`/guru/kelas/${classId}?success=materi-ditambah&tab=materi`);
}

export async function createQuizAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const classId = String(formData.get("classId") ?? "");
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    classId,
    rewardCoins: formData.get("rewardCoins"),
    rewardExp: formData.get("rewardExp"),
  });

  if (!parsed.success || !classId) {
    redirect(
      classId
        ? `/guru/kelas/${classId}?error=data-tidak-valid&tab=kuis`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedClass(parsed.data.classId, session.user.id);
  const quiz = await prisma.quiz.create({ data: parsed.data });

  revalidatePath(`/guru/kelas/${classId}`);
  redirect(`/guru/kelas/${classId}/kuis/${quiz.id}?success=kuis-dibuat`);
}

export async function createQuestionAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const quizId = String(formData.get("quizId") ?? "");
  const classId = String(formData.get("classId") ?? "");

  const parsed = questionSchema.safeParse({
    questionText: formData.get("questionText"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    optionD: formData.get("optionD"),
    correctOption: formData.get("correctOption"),
    quizId,
  });

  if (!parsed.success || !quizId || !classId) {
    redirect(
      classId && quizId
        ? `/guru/kelas/${classId}/kuis/${quizId}?error=data-tidak-valid`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedQuiz(quizId, session.user.id);
  await prisma.question.create({ data: parsed.data });

  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  quizRedirect(classId, quizId, "success=soal-ditambah");
}

export async function updateClassAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = updateClassSchema.safeParse({
    classId: formData.get("classId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedClass(parsed.data.classId, session.user.id);
  const { classId, ...data } = parsed.data;

  await prisma.class.update({
    where: { id: classId },
    data,
  });

  revalidatePath("/guru/kelas");
  revalidatePath(`/guru/kelas/${classId}`);
  revalidatePath("/kelas");
  revalidatePath(`/kelas/${classId}/materi`);
  classRedirect(classId, "success=kelas-diubah");
}

export async function deleteClassAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = classIdSchema.safeParse({
    classId: formData.get("classId"),
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedClass(parsed.data.classId, session.user.id);

  // Hapus file fisik media semua materi sebelum row ter-cascade delete
  const mediaFiles = await prisma.media.findMany({
    where: { material: { classId: parsed.data.classId } },
    select: { url: true },
  });
  await Promise.all(mediaFiles.map((m) => deleteMediaFile(m.url)));

  await prisma.class.delete({ where: { id: parsed.data.classId } });

  revalidatePath("/guru/kelas");
  revalidatePath("/kelas");
  redirect("/guru/kelas?success=kelas-dihapus");
}

export async function updateMaterialAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const classId = String(formData.get("classId") ?? "");
  const parsed = updateMaterialSchema.safeParse({
    materialId: formData.get("materialId"),
    title: formData.get("title"),
    content: formData.get("content") || undefined,
    classId,
  });

  if (!parsed.success || !classId) {
    redirect(
      classId
        ? `/guru/kelas/${classId}?error=data-tidak-valid&tab=materi`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedMaterial(parsed.data.materialId, session.user.id);
  const { materialId, classId: _, ...data } = parsed.data;

  // Validasi media baru (file & embed) sebelum update
  const mediaFiles = formData.getAll("mediaFiles") as File[];
  const embedUrls = formData.getAll("embedUrls") as string[];

  const newFiles: { file: File; type: FileMediaType }[] = [];
  for (const file of mediaFiles) {
    if (!(file instanceof File) || file.size === 0) continue;
    const result = validateMediaFile(file);
    if (!result.ok) {
      redirect(`/guru/kelas/${classId}?error=media-invalid:${result.error}&tab=materi`);
    }
    newFiles.push({ file: result.data, type: result.type });
  }

  const newEmbeds: { url: string }[] = [];
  for (const url of embedUrls) {
    if (!url || url.trim() === "") continue;
    const result = validateEmbedUrl(url);
    if (!result.ok) {
      redirect(`/guru/kelas/${classId}?error=embed-invalid:${result.error}&tab=materi`);
    }
    newEmbeds.push({ url: url.trim() });
  }

  await prisma.material.update({
    where: { id: materialId },
    data,
  });

  let order = await prisma.media.count({ where: { materialId } });
  const savedUrls: string[] = [];
  const createdMediaIds: string[] = [];
  try {
    for (const { file, type } of newFiles) {
      const folder =
        type === "IMAGE"
          ? "images"
          : type === "VIDEO"
            ? "videos"
            : type === "AUDIO"
              ? "audios"
              : type === "EBOOK"
                ? "ebooks"
                : "pdfs";
      const url = await saveMediaFile(materialId, file, folder);
      savedUrls.push(url);
      const media = await prisma.media.create({
        data: {
          materialId,
          type,
          url,
          title: file.name,
          order: order++,
        },
        select: { id: true },
      });
      createdMediaIds.push(media.id);
    }
    for (const { url } of newEmbeds) {
      const media = await prisma.media.create({
        data: {
          materialId,
          type: "EMBED",
          url,
          title: "Embed",
          order: order++,
        },
        select: { id: true },
      });
      createdMediaIds.push(media.id);
    }
  } catch (err) {
    // Gagal di tengah penambahan media: hapus media & file baru yang sudah tersimpan
    await Promise.all(savedUrls.map((url) => deleteMediaFile(url)));
    if (createdMediaIds.length > 0) {
      await prisma.media.deleteMany({ where: { id: { in: createdMediaIds } } });
    }
    throw err;
  }

  // Hapus media yang ditandai guru (removeMediaIds)
  const removeIds = formData.getAll("removeMediaIds").map(String).filter(Boolean);
  if (removeIds.length > 0) {
    const toRemove = await prisma.media.findMany({
      where: { id: { in: removeIds }, materialId },
      select: { id: true, url: true },
    });
    for (const m of toRemove) {
      await deleteMediaFile(m.url);
      await prisma.media.delete({ where: { id: m.id } });
    }
  }

  revalidatePath(`/guru/kelas/${classId}`);
  revalidatePath(`/kelas/${classId}/materi`);
  classRedirect(classId, "success=materi-diubah", "materi");
}

export async function deleteMaterialAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = materialIdSchema.safeParse({
    materialId: formData.get("materialId"),
    classId: formData.get("classId"),
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedMaterial(parsed.data.materialId, session.user.id);

  // Hapus file fisik media sebelum row ter-cascade delete
  const mediaFiles = await prisma.media.findMany({
    where: { materialId: parsed.data.materialId },
    select: { url: true },
  });
  await Promise.all(mediaFiles.map((m) => deleteMediaFile(m.url)));

  await prisma.material.delete({ where: { id: parsed.data.materialId } });

  revalidatePath(`/guru/kelas/${parsed.data.classId}`);
  revalidatePath(`/kelas/${parsed.data.classId}/materi`);
  classRedirect(parsed.data.classId, "success=materi-dihapus", "materi");
}

export async function updateQuizAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const classId = String(formData.get("classId") ?? "");
  const parsed = updateQuizSchema.safeParse({
    quizId: formData.get("quizId"),
    title: formData.get("title"),
    classId,
    rewardCoins: formData.get("rewardCoins"),
    rewardExp: formData.get("rewardExp"),
  });

  if (!parsed.success || !classId) {
    redirect(
      classId
        ? `/guru/kelas/${classId}?error=data-tidak-valid&tab=kuis`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedQuiz(parsed.data.quizId, session.user.id);
  const { quizId, classId: _, ...data } = parsed.data;

  await prisma.quiz.update({
    where: { id: quizId },
    data,
  });

  revalidatePath(`/guru/kelas/${classId}`);
  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  classRedirect(classId, "success=kuis-diubah", "kuis");
}

export async function deleteQuizAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = quizIdSchema.safeParse({
    quizId: formData.get("quizId"),
    classId: formData.get("classId"),
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedQuiz(parsed.data.quizId, session.user.id);
  await prisma.quiz.delete({ where: { id: parsed.data.quizId } });

  revalidatePath(`/guru/kelas/${parsed.data.classId}`);
  revalidatePath(`/kelas/${parsed.data.classId}/materi`);
  classRedirect(parsed.data.classId, "success=kuis-dihapus", "kuis");
}

export async function updateQuestionAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const quizId = String(formData.get("quizId") ?? "");
  const classId = String(formData.get("classId") ?? "");

  const parsed = updateQuestionSchema.safeParse({
    questionId: formData.get("questionId"),
    questionText: formData.get("questionText"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    optionD: formData.get("optionD"),
    correctOption: formData.get("correctOption"),
    quizId,
    classId,
  });

  if (!parsed.success || !quizId || !classId) {
    redirect(
      classId && quizId
        ? `/guru/kelas/${classId}/kuis/${quizId}?error=data-tidak-valid`
        : "/guru/kelas?error=data-tidak-valid"
    );
  }

  await requireOwnedQuestion(parsed.data.questionId, session.user.id);
  const { questionId, classId: _c, quizId: _q, ...data } = parsed.data;

  await prisma.question.update({
    where: { id: questionId },
    data,
  });

  revalidatePath(`/guru/kelas/${classId}/kuis/${quizId}`);
  revalidatePath(`/kelas/${classId}/kuis/${quizId}`);
  quizRedirect(classId, quizId, "success=soal-diubah");
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const session = await requireGuru();

  const parsed = questionIdSchema.safeParse({
    questionId: formData.get("questionId"),
    quizId: formData.get("quizId"),
    classId: formData.get("classId"),
  });

  if (!parsed.success) {
    redirect("/guru/kelas?error=data-tidak-valid");
  }

  await requireOwnedQuestion(parsed.data.questionId, session.user.id);
  await prisma.question.delete({ where: { id: parsed.data.questionId } });

  revalidatePath(`/guru/kelas/${parsed.data.classId}/kuis/${parsed.data.quizId}`);
  revalidatePath(`/kelas/${parsed.data.classId}/kuis/${parsed.data.quizId}`);
  quizRedirect(
    parsed.data.classId,
    parsed.data.quizId,
    "success=soal-dihapus"
  );
}
async function requireSiswa() {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") {
    redirect("/dashboard/siswa?error=unauthorized");
  }
  return session;
}

export async function markMaterialCompleteAction(formData: FormData): Promise<void> {
  const session = await requireSiswa();

  const materialId = String(formData.get("materialId") ?? "");
  const classId = String(formData.get("classId") ?? "");
  if (!materialId || !classId) {
    redirect(`/kelas/${classId}/materi?error=data-tidak-valid`);
  }

  // Pastikan siswa ter-enroll di kelas materi ini
  const material = await prisma.material.findFirst({
    where: {
      id: materialId,
      class: { enrollments: { some: { studentId: session.user.id } } },
    },
  });
  if (!material) redirect(`/kelas/${classId}/materi?error=materi-tidak-ditemukan`);

  await prisma.materialProgress.upsert({
    where: {
      materialId_studentId: { materialId, studentId: session.user.id },
    },
    create: {
      materialId,
      studentId: session.user.id,
      status: "COMPLETED",
    },
    update: {
      status: "COMPLETED",
    },
  });

  revalidatePath(`/kelas/${classId}/materi`);
  revalidatePath(`/kelas/${classId}/materi/${materialId}`);
  redirect(`/kelas/${classId}/materi/${materialId}?success=materi-selesai`);
}
