"use client";

import { useState } from "react";
import { updateStudentOnboardingAction } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { StudentOnboardingData } from "@/lib/student-onboarding-defaults";

const ICON_OPTIONS = [
  "BookOpen",
  "FileText",
  "ClipboardList",
  "ShoppingBag",
  "Package",
  "Medal",
  "Trophy",
  "Star",
  "Coins",
] as const;

export function StudentOnboardingSettingsForm({
  onboarding,
}: {
  onboarding: StudentOnboardingData;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardTitle>Popup Panduan Siswa (Login)</CardTitle>
      <CardDescription>
        Muncul otomatis saat siswa login. Edit judul, deskripsi, dan 7 langkah alur inti:
        gabung kelas → baca materi → kerjakan kuis → belanja di toko → inventori → peringkat
        → laporan petualangan. Siswa yang sudah menutup popup tidak melihatnya lagi sampai
        Anda menyimpan perubahan di sini.
      </CardDescription>

      <form
        action={async (formData) => {
          setError(null);
          const result = await updateStudentOnboardingAction(formData);
          if (result?.error) {
            setError(result.error);
          }
        }}
        className="mt-4 space-y-5"
      >
        <label className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/80 px-4 py-3">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={onboarding.enabled}
            className="h-4 w-4 rounded border-primary/30"
          />
          <span className="text-sm font-semibold">Aktifkan popup untuk siswa</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="onboardingTitle">Judul popup</Label>
            <Input
              id="onboardingTitle"
              name="title"
              defaultValue={onboarding.title}
              required
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="onboardingDescription">Deskripsi singkat</Label>
            <Textarea
              id="onboardingDescription"
              name="description"
              rows={2}
              defaultValue={onboarding.description}
              required
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="dismissLabel">Teks tombol tutup</Label>
            <Input
              id="dismissLabel"
              name="dismissLabel"
              defaultValue={onboarding.dismissLabel}
              required
              className="mt-1"
            />
          </div>
        </div>

        <input type="hidden" name="stepCount" value={onboarding.steps.length} />

        <div className="space-y-4">
          <p className="text-sm font-bold text-primary">Langkah-langkah ({onboarding.steps.length})</p>
          {onboarding.steps.map((step, index) => (
            <div
              key={step.order}
              className="rounded-2xl border border-primary/10 bg-primary/5 p-4"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                Langkah {index + 1}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`step_${index}_title`}>Judul</Label>
                  <Input
                    id={`step_${index}_title`}
                    name={`step_${index}_title`}
                    defaultValue={step.title}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`step_${index}_href`}>Link tujuan</Label>
                  <Input
                    id={`step_${index}_href`}
                    name={`step_${index}_href`}
                    defaultValue={step.href}
                    required
                    className="mt-1"
                    placeholder="/kelas"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`step_${index}_description`}>Penjelasan</Label>
                  <Textarea
                    id={`step_${index}_description`}
                    name={`step_${index}_description`}
                    rows={2}
                    defaultValue={step.description}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`step_${index}_icon`}>Ikon</Label>
                  <select
                    id={`step_${index}_icon`}
                    name={`step_${index}_icon`}
                    defaultValue={step.icon}
                    className="mt-1 w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-2.5 text-sm"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-xl bg-secondary/10 px-3 py-2 text-sm text-secondary">
            {error}
          </p>
        )}

        <Button type="submit">Simpan Popup Siswa</Button>
      </form>
    </Card>
  );
}