"use client";

import { useTransition } from "react";
import { saveClassScheduleAction } from "@/actions/schedule";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  COLOR_LABELS,
  DAY_LABELS,
  WEEKDAY_DAYS,
} from "@/lib/schedule-constants";
import type { ScheduleColor, ScheduleDay } from "@/generated/prisma/client";

type ScheduleRow = {
  day: ScheduleDay;
  subject: string;
  startTime: string;
  endTime: string;
  color: ScheduleColor;
};

export function ScheduleForm({
  classId,
  entries,
}: {
  classId: string;
  entries: ScheduleRow[];
}) {
  const [pending, startTransition] = useTransition();

  const byDay = new Map(entries.map((e) => [e.day, e]));

  return (
    <form
      action={(formData) => {
        startTransition(() => saveClassScheduleAction(formData));
      }}
      className="space-y-4"
    >
      <input type="hidden" name="classId" value={classId} />

      {WEEKDAY_DAYS.map((day) => {
        const existing = byDay.get(day);
        return (
          <div
            key={day}
            className="grid gap-3 rounded-2xl border border-primary/10 bg-white p-4 sm:grid-cols-[100px_1fr_120px_120px_120px]"
          >
            <div className="flex items-center">
              <span className="font-display font-bold text-foreground">
                {DAY_LABELS[day]}
              </span>
            </div>
            <div>
              <Label htmlFor={`subject_${day}`} className="sr-only">
                Mata pelajaran {DAY_LABELS[day]}
              </Label>
              <Input
                id={`subject_${day}`}
                name={`subject_${day}`}
                placeholder="Mata pelajaran / petualangan"
                defaultValue={existing?.subject ?? ""}
              />
            </div>
            <div>
              <Label htmlFor={`startTime_${day}`} className="text-xs text-muted">
                Mulai
              </Label>
              <Input
                id={`startTime_${day}`}
                name={`startTime_${day}`}
                type="time"
                defaultValue={existing?.startTime ?? "08:00"}
              />
            </div>
            <div>
              <Label htmlFor={`endTime_${day}`} className="text-xs text-muted">
                Selesai
              </Label>
              <Input
                id={`endTime_${day}`}
                name={`endTime_${day}`}
                type="time"
                defaultValue={existing?.endTime ?? "09:30"}
              />
            </div>
            <div>
              <Label htmlFor={`color_${day}`} className="text-xs text-muted">
                Warna
              </Label>
              <select
                id={`color_${day}`}
                name={`color_${day}`}
                defaultValue={existing?.color ?? "primary"}
                className="w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
              >
                {(Object.keys(COLOR_LABELS) as ScheduleColor[]).map((color) => (
                  <option key={color} value={color}>
                    {COLOR_LABELS[color]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}

      <p className="text-sm text-muted">
        Kosongkan kolom mata pelajaran untuk menghapus jadwal hari tersebut.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan Jadwal"}
      </Button>
    </form>
  );
}