"use client";

import { cn } from "@/lib/utils";
import { GraduationCap, Shield, User } from "lucide-react";

const roles = [
  { value: "SISWA", label: "Siswa", icon: User, color: "border-primary bg-primary/10 text-primary" },
  { value: "GURU", label: "Guru", icon: GraduationCap, color: "border-tertiary bg-tertiary/10 text-tertiary" },
  { value: "ADMIN", label: "Admin", icon: Shield, color: "border-secondary bg-secondary/10 text-secondary" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

export function RoleSelector({
  value,
  onChange,
  allowedRoles = ["SISWA", "GURU", "ADMIN"],
}: {
  value: string;
  onChange: (role: string) => void;
  allowedRoles?: readonly RoleValue[];
}) {
  const visibleRoles = roles.filter((role) =>
    allowedRoles.includes(role.value)
  );

  return (
    <div
      className={cn(
        "grid gap-3",
        visibleRoles.length === 2 ? "grid-cols-2" : "grid-cols-3"
      )}
    >
      {visibleRoles.map((role) => {
        const Icon = role.icon;
        const selected = value === role.value;
        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
              selected
                ? `${role.color} shadow-soft scale-[1.02]`
                : "border-transparent bg-surface text-muted hover:border-primary/20"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-bold">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
}