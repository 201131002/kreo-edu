import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="py-12 text-center">
      {Icon ? <Icon className="mx-auto mb-3 h-12 w-12 text-muted" aria-hidden /> : null}
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mt-2 text-base">{description}</CardDescription>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}