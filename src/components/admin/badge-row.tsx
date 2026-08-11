"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { deleteBadgeAction, updateBadgeAction } from "@/actions/badge-admin";
import { BadgeIcon } from "@/components/inventory/badge-icon";
import { badgeUnlockLabel } from "@/lib/badge-labels";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import type { BadgeCriteria } from "@/generated/prisma/client";

const CRITERIA_OPTIONS = [
  { value: "LEVEL", label: "Capai Level" },
  { value: "QUIZ_COUNT", label: "Jumlah Kuis Selesai" },
  { value: "FIRST_QUIZ", label: "Kuis Pertama" },
] as const;

export function BadgeRow({
  badge,
}: {
  badge: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    criteria: BadgeCriteria;
    criteriaValue: number;
    _count: { studentBadges: number };
  };
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!editing) {
    return (
      <Card className="flex flex-wrap items-center gap-4">
        <BadgeIcon imageUrl={badge.imageUrl} name={badge.name} size="lg" />
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{badge.name}</CardTitle>
          <CardDescription>
            {badgeUnlockLabel(badge.criteria, badge.criteriaValue)}
            {badge.description ? ` · ${badge.description}` : ""}
          </CardDescription>
          <p className="mt-1 text-xs text-muted">
            {badge._count.studentBadges} siswa memiliki lencana ini
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <ConfirmForm
            confirmMessage={`Hapus lencana "${badge.name}"? Siswa yang memakainya akan kehilangan lencana ini.`}
            action={deleteBadgeAction}
          >
            {(isPending) => (
              <>
                <input type="hidden" name="badgeId" value={badge.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={pending || isPending}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </ConfirmForm>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form
        action={(formData) => {
          startTransition(async () => {
            formData.set("badgeId", badge.id);
            const file = inputRef.current?.files?.[0];
            if (file) formData.set("badgeImage", file);
            await updateBadgeAction(formData);
            setEditing(false);
          });
        }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <BadgeIcon imageUrl={badge.imageUrl} name={badge.name} size="lg" />
          <CardTitle className="text-base">Edit {badge.name}</CardTitle>
        </div>
        <div>
          <Label htmlFor={`name-${badge.id}`}>Nama</Label>
          <Input
            id={`name-${badge.id}`}
            name="name"
            defaultValue={badge.name}
            required
          />
        </div>
        <div>
          <Label htmlFor={`desc-${badge.id}`}>Deskripsi</Label>
          <Input
            id={`desc-${badge.id}`}
            name="description"
            defaultValue={badge.description ?? ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`criteria-${badge.id}`}>Kriteria</Label>
            <select
              id={`criteria-${badge.id}`}
              name="criteria"
              defaultValue={badge.criteria}
              className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
            >
              {CRITERIA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`value-${badge.id}`}>Nilai</Label>
            <Input
              id={`value-${badge.id}`}
              name="criteriaValue"
              type="number"
              min={0}
              defaultValue={badge.criteriaValue}
              required
            />
          </div>
        </div>
        <div>
          <Label>Ganti gambar (opsional)</Label>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/webp,image/jpeg,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          {(preview || badge.imageUrl) && (
            <div className="mb-2 flex justify-center rounded-2xl bg-primary/5 p-3">
              <Image
                src={preview ?? badge.imageUrl}
                alt="Preview"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                unoptimized
              />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Pilih Gambar Baru
          </Button>
          <input type="hidden" name="imageUrl" value={badge.imageUrl} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Batal
          </Button>
        </div>
      </form>
    </Card>
  );
}