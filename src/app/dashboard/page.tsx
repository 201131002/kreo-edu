import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session) redirect("/masuk");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/dashboard/admin");
  if (role === "GURU") redirect("/dashboard/guru");
  redirect("/dashboard/siswa");
}