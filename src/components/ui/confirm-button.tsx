"use client";

import { useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmFormProps = {
  confirmMessage: string;
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode | ((pending: boolean) => React.ReactNode);
  className?: string;
};

export function ConfirmForm({
  confirmMessage,
  action,
  children,
  className,
}: ConfirmFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(formData) => {
        if (!confirm(confirmMessage)) return;
        startTransition(() => action(formData));
      }}
    >
      {typeof children === "function"
        ? (children as (pending: boolean) => React.ReactNode)(pending)
        : children}
    </form>
  );
}

type ConfirmButtonProps = ButtonProps & {
  confirmMessage: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
};

export function ConfirmButton({
  confirmMessage,
  action,
  hiddenFields,
  children,
  disabled,
  ...props
}: ConfirmButtonProps) {
  return (
    <ConfirmForm confirmMessage={confirmMessage} action={action}>
      {(pending) => (
        <>
          {hiddenFields &&
            Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          <Button type="submit" disabled={disabled || pending} {...props}>
            {children}
          </Button>
        </>
      )}
    </ConfirmForm>
  );
}