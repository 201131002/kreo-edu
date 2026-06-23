import { getDiscussionFlash } from "@/lib/discussion-messages";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export function DiscussionFlashAlert({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  const message = getDiscussionFlash(success) ?? getDiscussionFlash(error);
  if (!message) return null;

  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
        message.type === "success"
          ? "border-tertiary/20 bg-tertiary/10 text-tertiary"
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