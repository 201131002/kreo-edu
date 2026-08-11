"use client";

import { useState } from "react";
import { updateFaqSettingsAction } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";
import type { FaqData } from "@/lib/faq-defaults";

export function FaqSettingsForm({ faq }: { faq: FaqData }) {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(faq, null, 2));
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardTitle>FAQ / Bantuan</CardTitle>
      <CardDescription>
        Edit struktur JSON FAQ untuk halaman /bantuan. Format:{" "}
        <code className="text-xs">{`{ "categories": [{ "id", "role", "title", "items": [{ "q", "a" }] }] }`}</code>
      </CardDescription>

      <form
        action={async (formData) => {
          setError(null);
          const result = await updateFaqSettingsAction(formData);
          if (result?.error) {
            setError(result.error);
          }
        }}
        className="mt-4 space-y-4"
      >
        <div>
          <Label htmlFor="faqJson">faqJson</Label>
          <Textarea
            id="faqJson"
            name="faqJson"
            rows={18}
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="mt-1 font-mono text-xs"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl bg-secondary/10 px-3 py-2 text-sm text-secondary">
            {error}
          </p>
        )}

        <Button type="submit">Simpan FAQ</Button>
      </form>
    </Card>
  );
}