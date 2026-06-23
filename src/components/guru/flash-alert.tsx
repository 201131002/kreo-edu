import { getFlashMessage } from "@/lib/guru-messages";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function FlashAlert({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  const message = getFlashMessage(success) ?? getFlashMessage(error);
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
        isSuccess
          ? "border-primary/20 bg-primary/10 text-primary"
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