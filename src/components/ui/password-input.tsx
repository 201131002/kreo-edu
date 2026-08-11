"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    toggleLabels?: { show: string; hide: string };
  }
>(({ className, toggleLabels, disabled, ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const showLabel = toggleLabels?.show ?? "Tampilkan kata sandi";
  const hideLabel = toggleLabels?.hide ?? "Sembunyikan kata sandi";

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        disabled={disabled}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="h-5 w-5" aria-hidden />
        ) : (
          <Eye className="h-5 w-5" aria-hidden />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";