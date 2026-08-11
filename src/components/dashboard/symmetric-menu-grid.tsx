import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SymmetricMenuItem = {
  href: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
};

type SymmetricMenuGridProps = {
  items: SymmetricMenuItem[];
  columns?: 2 | 3 | 4;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost";
  compact?: boolean;
};

const columnClasses: Record<2 | 3 | 4, string> = {
  2: "sm:grid-cols-2 lg:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const tailColumnClasses: Record<2 | 3 | 4, Record<number, string>> = {
  2: {
    1: "max-w-md mx-auto grid-cols-1",
  },
  3: {
    1: "max-w-sm mx-auto grid-cols-1",
    2: "max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2",
  },
  4: {
    1: "max-w-sm mx-auto grid-cols-1",
    2: "max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2",
    3: "max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },
};

function MenuCard({
  item,
  buttonLabel,
  buttonVariant = "primary",
  compact = false,
}: {
  item: SymmetricMenuItem;
  buttonLabel?: string;
  buttonVariant?: SymmetricMenuGridProps["buttonVariant"];
  compact?: boolean;
}) {
  const Icon = item.icon;

  if (compact) {
    return (
      <Link href={item.href}>
        <Card className="flex h-full flex-col items-center gap-2 text-center transition hover:-translate-y-1 hover:shadow-soft">
          <Icon className={cn("h-8 w-8", item.iconClassName ?? "text-primary")} />
          <span className="text-sm font-bold">{item.title}</span>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-soft">
      <Icon className={cn("mb-3 h-10 w-10", item.iconClassName ?? "text-secondary")} />
      <CardTitle>{item.title}</CardTitle>
      {item.description ? <CardDescription>{item.description}</CardDescription> : null}
      <Link href={item.href} className="mt-4 inline-block">
        <Button variant={buttonVariant} size="sm">
          {buttonLabel}
        </Button>
      </Link>
    </Card>
  );
}

export function SymmetricMenuGrid({
  items,
  columns = 3,
  buttonLabel,
  buttonVariant = "primary",
  compact = false,
}: SymmetricMenuGridProps) {
  const remainder = items.length % columns;
  const completeItems = remainder === 0 ? items : items.slice(0, -remainder);
  const tailItems = remainder === 0 ? [] : items.slice(-remainder);

  return (
    <div className="space-y-6">
      {completeItems.length > 0 ? (
        <div className={cn("grid gap-4 sm:gap-6", columnClasses[columns])}>
          {completeItems.map((item) => (
            <MenuCard
              key={item.href}
              item={item}
              buttonLabel={buttonLabel}
              buttonVariant={buttonVariant}
              compact={compact}
            />
          ))}
        </div>
      ) : null}

      {tailItems.length > 0 ? (
        <div
          className={cn(
            "grid gap-4 sm:gap-6",
            tailColumnClasses[columns][tailItems.length]
          )}
        >
          {tailItems.map((item) => (
            <MenuCard
              key={item.href}
              item={item}
              buttonLabel={buttonLabel}
              buttonVariant={buttonVariant}
              compact={compact}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}