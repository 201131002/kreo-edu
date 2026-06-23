import { getSettingsFlash } from "@/lib/settings-messages";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function SettingsFlashAlert({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  const message = getSettingsFlash(success) ?? getSettingsFlash(error);
  if (!message) return null;

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
        message.type === "success"
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-red-200 bg-red-50 text-red-700"
      )}
      role="alert"
    >
      {message.type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      {message.text}
    </div>
  );
}