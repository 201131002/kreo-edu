import { FlashAlert as BaseFlashAlert } from "@/components/ui/flash-alert";

export function AdminFlashAlert({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  return <BaseFlashAlert success={success} error={error} variant="secondary" />;
}