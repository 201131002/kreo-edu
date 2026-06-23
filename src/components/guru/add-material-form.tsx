"use client";

import { createMaterialAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function AddMaterialForm({ classId }: { classId: string }) {
  return (
    <form action={createMaterialAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <div>
        <Label htmlFor="material-title">Judul Materi</Label>
        <Input
          id="material-title"
          name="title"
          placeholder="Contoh: Mengenal Planet"
          required
        />
      </div>
      <div>
        <Label htmlFor="material-content">Isi Materi</Label>
        <Textarea
          id="material-content"
          name="content"
          placeholder="Tulis penjelasan materi untuk siswa..."
          rows={5}
          required
        />
      </div>
      <SubmitButton variant="tertiary" size="sm">
        Simpan Materi
      </SubmitButton>
    </form>
  );
}