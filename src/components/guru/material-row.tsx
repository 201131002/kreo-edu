"use client";

import { useState, useTransition } from "react";
import {
  deleteMaterialAction,
  updateMaterialAction,
} from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FileText, Pencil, Trash2 } from "lucide-react";

export function MaterialRow({
  material,
  classId,
}: {
  material: { id: string; title: string; content: string | null };
  classId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <Card className="border-primary/20">
        <form action={updateMaterialAction} className="space-y-3">
          <input type="hidden" name="materialId" value={material.id} />
          <input type="hidden" name="classId" value={classId} />
          <div>
            <Label htmlFor={`mt-${material.id}`}>Judul</Label>
            <Input
              id={`mt-${material.id}`}
              name="title"
              defaultValue={material.title}
              required
            />
          </div>
          <div>
            <Label htmlFor={`mc-${material.id}`}>Isi</Label>
            <Textarea
              id={`mc-${material.id}`}
              name="content"
              defaultValue={material.content ?? ""}
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2">
            <SubmitButton variant="primary" size="sm">
              Simpan
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

  return (
    <Card className="flex items-start gap-3">
      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <CardTitle className="text-base">{material.title}</CardTitle>
        <CardDescription className="mt-1 line-clamp-3">
          {material.content}
        </CardDescription>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <ConfirmForm
          confirmMessage={`Hapus materi "${material.title}"?`}
          action={deleteMaterialAction}
        >
          {(isPending) => (
            <>
              <input type="hidden" name="materialId" value={material.id} />
              <input type="hidden" name="classId" value={classId} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={pending || isPending}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </ConfirmForm>
      </div>
    </Card>
  );
}