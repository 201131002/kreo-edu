import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { StudentOnboardingModal } from "@/components/dashboard/student-onboarding-modal";

export async function StudentOnboardingShell() {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") {
    return null;
  }

  const [siteSettings, siteMeta] = await Promise.all([
    getSiteSettings(),
    prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { studentOnboardingJson: true },
    }),
  ]);

  const version = siteMeta?.studentOnboardingJson ?? "{}";

  return (
    <Suspense fallback={null}>
      <StudentOnboardingModal
        userId={session.user.id}
        onboarding={siteSettings.studentOnboarding}
        version={version}
      />
    </Suspense>
  );
}