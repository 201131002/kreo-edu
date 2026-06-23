"use client";

import { useState, useTransition } from "react";
import {
  deleteClassAction,
  updateClassAction,
} from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";

export function EditClassPanel({
  classId,
  title,
  description,
}: {
  classId: string;
  title: string;
  description: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit Kelas
        </Button>
        <form
          action={(formData) => {
            if (
              !confirm(
                `Hapus kelas "${title}"? Semua materi, kuis, dan jadwal terkait ikut terhapus.`
              )
            ) {
              return;
            }
            startTransition(() => deleteClassAction(formData));
          }}
        >
          <input type="hidden" name="classId" value={classId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={pending}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Kelas
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-tertiary/20">
      <CardTitle className="text-base">Edit Kelas</CardTitle>
      <CardDescription className="mb-4">
        Ubah nama atau deskripsi kelas
      </CardDescription>
      <form action={updateClassAction} className="space-y-4">
        <input type="hidden" name="classId" value={classId} />
        <div>
          <Label htmlFor="edit-class-title">Nama Kelas</Label>
          <Input
            id="edit-class-title"
            name="title"
            defaultValue={title}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-class-desc">Deskripsi</Label>
          <Textarea
            id="edit-class-desc"
            name="description"
            defaultValue={description ?? ""}
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <SubmitButton variant="tertiary" size="sm">
            Simpan Perubahan
          </SubmitButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Batal
          </Button>
        </div>
      </form>
    </Card>
  );
}