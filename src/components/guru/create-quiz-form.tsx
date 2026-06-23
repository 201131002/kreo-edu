"use client";

import { createQuizAction } from "@/actions/class";
import { SubmitButton } from "@/components/guru/submit-button";
import { Input, Label } from "@/components/ui/input";
import { Coins, Star } from "lucide-react";

export function CreateQuizForm({ classId }: { classId: string }) {
  return (
    <form action={createQuizAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <div>
        <Label htmlFor="quiz-title">Nama Kuis</Label>
        <Input
          id="quiz-title"
          name="title"
          placeholder="Contoh: Kuis Tata Surya"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rewardExp" className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-tertiary" />
            Hadiah EXP
          </Label>
          <Input
            id="rewardExp"
            name="rewardExp"
            type="number"
            min={0}
            max={5000}
            defaultValue={50}
            required
          />
        </div>
        <div>
          <Label htmlFor="rewardCoins" className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-secondary" />
            Hadiah Koin
          </Label>
          <Input
            id="rewardCoins"
            name="rewardCoins"
            type="number"
            min={0}
            max={1000}
            defaultValue={10}
            required
          />
        </div>
      </div>
      <SubmitButton variant="secondary" size="sm">
        Buat Kuis & Tambah Soal
      </SubmitButton>
    </form>
  );
}