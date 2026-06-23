import { getAdminFlashMessage } from "@/lib/admin-messages";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function AdminFlashAlert({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  const message = getAdminFlashMessage(success) ?? getAdminFlashMessage(error);
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
        isSuccess
          ? "border-secondary/20 bg-secondary/10 text-secondary"
          : "border-red-200 bg-red-50 text-red-700"
      )}
      role="alert"
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      {message.text}
    </div>
  );
}