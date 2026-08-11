"use client";

import { useState, useTransition } from "react";
import { updateNameAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { UserRound } from "lucide-react";

export function NameForm({ nama }: { nama: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await updateNameAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="mb-6 space-y-4 border-b border-primary/10 pb-6"
    >
      <div>
        <Label htmlFor="nama">Nama Lengkap</Label>
        <Input
          id="nama"
          name="nama"
          defaultValue={nama}
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
        />
        <p className="mt-1.5 text-xs text-muted">
          Nama ini tampil di navbar, dashboard, dan papan peringkat.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        <UserRound className="h-4 w-4" />
        {pending ? "Menyimpan..." : "Simpan Nama"}
      </Button>
    </form>
  );
}