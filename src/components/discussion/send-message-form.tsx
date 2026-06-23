"use client";

import { sendMessageAction } from "@/actions/discussion";
import { SubmitButton } from "@/components/guru/submit-button";
import { Textarea } from "@/components/ui/input";
import { Send } from "lucide-react";

export function SendMessageForm({ classId }: { classId: string }) {
  return (
    <form
      action={sendMessageAction}
      className="sticky bottom-4 mt-6 rounded-3xl border border-tertiary/20 bg-white/95 p-4 shadow-soft backdrop-blur-sm"
    >
      <input type="hidden" name="classId" value={classId} />
      <Textarea
        name="content"
        placeholder="Tulis pesan untuk diskusi kelas..."
        rows={2}
        maxLength={500}
        required
        className="mb-3 resize-none border-tertiary/10 focus:border-tertiary/40"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Maks. 500 karakter</span>
        <SubmitButton variant="tertiary" size="sm">
          <Send className="h-4 w-4" />
          Kirim
        </SubmitButton>
      </div>
    </form>
  );
}