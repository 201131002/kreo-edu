import { Card, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GraduationCap, Shield, User, Users } from "lucide-react";

export function UserStats({
  total,
  siswa,
  guru,
  admin,
}: {
  total: number;
  siswa: number;
  guru: number;
  admin: number;
}) {
  const items = [
    { label: "Total", value: total, icon: Users, color: "text-foreground" },
    { label: "Siswa", value: siswa, icon: User, color: "text-primary" },
    { label: "Guru", value: guru, icon: GraduationCap, color: "text-tertiary" },
    { label: "Admin", value: admin, icon: Shield, color: "text-secondary" },
  ];

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="text-center">
            <Icon className={cn("mx-auto mb-2 h-7 w-7", item.color)} />
            <p className={`font-display text-2xl font-bold ${item.color}`}>
              {item.value}
            </p>
            <CardDescription>{item.label}</CardDescription>
          </Card>
        );
      })}
    </div>
  );
}