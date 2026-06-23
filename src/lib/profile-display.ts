import { prisma } from "@/lib/prisma";

export type ProfileDisplay = {
  nama: string;
  imageUrl: string | null;
  borderImageUrl: string | null;
};

export async function getProfileDisplay(userId: string): Promise<ProfileDisplay | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nama: true,
      imageUrl: true,
      studentProfile: {
        select: {
          activeBorder: {
            select: { borderImageUrl: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    nama: user.nama,
    imageUrl: user.imageUrl,
    borderImageUrl: user.studentProfile?.activeBorder?.borderImageUrl ?? null,
  };
}