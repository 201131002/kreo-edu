"use client";

import {
  deleteUserAction,
  resetStudentProgressAction,
  updateUserRoleAction,
} from "@/actions/admin";
import { SubmitButton } from "@/components/guru/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  RotateCcw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

type UserRowProps = {
  id: string;
  nama: string;
  email: string;
  role: "SISWA" | "GURU" | "ADMIN";
  createdAt: string;
  isSelf: boolean;
  studentProfile?: {
    currentLevel: number;
    virtualCurrency: number;
    currentExp: number;
  } | null;
  stats?: {
    classes: number;
    enrollments: number;
    quizAttempts: number;
  };
};

const roleConfig = {
  SISWA: { variant: "primary" as const, icon: User, label: "Siswa" },
  GURU: { variant: "tertiary" as const, icon: GraduationCap, label: "Guru" },
  ADMIN: { variant: "secondary" as const, icon: Shield, label: "Admin" },
};

export function UserRow({
  id,
  nama,
  email,
  role,
  createdAt,
  isSelf,
  studentProfile,
  stats,
}: UserRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-3xl border bg-white/90 p-5 shadow-soft backdrop-blur-sm",
        isSelf && "border-secondary/30 ring-1 ring-secondary/20"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              role === "SISWA" && "bg-primary/10 text-primary",
              role === "GURU" && "bg-tertiary/10 text-tertiary",
              role === "ADMIN" && "bg-secondary/10 text-secondary"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-foreground">{nama}</h3>
              <Badge variant={config.variant}>{config.label}</Badge>
              {isSelf && (
                <Badge variant="secondary" className="text-xs">
                  Kamu
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted">{email}</p>
            <p className="mt-1 text-xs text-muted">
              Bergabung {createdAt}
              {stats && (
                <>
                  {" · "}
                  {role === "GURU" && `${stats.classes} kelas`}
                  {role === "SISWA" &&
                    `${stats.enrollments} kelas · ${stats.quizAttempts} kuis`}
                </>
              )}
            </p>
            {studentProfile && (
              <p className="mt-1 text-xs font-medium text-primary">
                Level {studentProfile.currentLevel} · {studentProfile.currentExp} EXP ·{" "}
                {studentProfile.virtualCurrency} koin
              </p>
            )}
          </div>
        </div>

        {!isSelf && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <form action={updateUserRoleAction} className="flex items-center gap-2">
              <input type="hidden" name="userId" value={id} />
              <Select
                name="role"
                defaultValue={role}
                className="h-9 w-28 text-sm"
                aria-label="Ubah role"
              >
                <option value="SISWA">Siswa</option>
                <option value="GURU">Guru</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <SubmitButton variant="outline" size="sm">
                Ubah Role
              </SubmitButton>
            </form>

            {role === "SISWA" && (
              <form action={resetStudentProgressAction}>
                <input type="hidden" name="userId" value={id} />
                <SubmitButton variant="ghost" size="sm" title="Reset EXP, koin, & kuis">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </SubmitButton>
              </form>
            )}

            {!confirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            ) : (
              <form action={deleteUserAction} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={id} />
                <span className="text-xs text-red-600">Yakin?</span>
                <SubmitButton
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  Ya, Hapus
                </SubmitButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Batal
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}