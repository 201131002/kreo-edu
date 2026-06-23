"use client";

import { createClassAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function CreateClassForm() {
  return (
    <Card className="border-dashed border-tertiary/30 bg-tertiary/5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tertiary text-white">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>Buat Kelas Baru</CardTitle>
          <CardDescription>Langkah pertama sebelum menambah materi & kuis</CardDescription>
        </div>
      </div>

      <form action={createClassAction} className="space-y-4">
        <div>
          <Label htmlFor="title">Nama Kelas</Label>
          <Input
            id="title"
            name="title"
            placeholder="Contoh: IPA — Tata Surya"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Deskripsi singkat</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Apa yang akan dipelajari siswa di kelas ini?"
            rows={3}
          />
        </div>
        <SubmitButton variant="tertiary" className="w-full sm:w-auto">
          Buat Kelas
        </SubmitButton>
      </form>
    </Card>
  );
}