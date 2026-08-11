"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { RoleSelector } from "@/components/auth/role-selector";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginAction, registerAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

function AnimatedInput({
  id,
  reducedMotion,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { reducedMotion: boolean }) {
  return (
    <motion.div
      whileFocus={reducedMotion ? undefined : { scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Input
        id={id}
        className={cn(
          "transition-shadow duration-200 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)]",
          className
        )}
        {...props}
      />
    </motion.div>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const reducedMotion = useReducedMotion() ?? false;
  const [role, setRole] = useState("SISWA");
  const [error, setError] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <motion.form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          formData.set("role", role);
          const result = await loginAction(formData);
          if (result?.error) {
            setError(result.error);
            if (!reducedMotion) {
              setShouldShake(true);
              window.setTimeout(() => setShouldShake(false), 500);
            }
          }
        });
      }}
      className="space-y-5"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={
        shouldShake && !reducedMotion
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0 }
          : reducedMotion
            ? undefined
            : { opacity: 1, y: 0, x: 0 }
      }
      transition={{ duration: shouldShake ? 0.45 : 0.35, ease: "easeOut" }}
    >
      <div>
        <Label>{t("selectRole")}</Label>
        <RoleSelector value={role} onChange={setRole} />
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <AnimatedInput
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          required
          reducedMotion={reducedMotion}
          disabled={pending}
        />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <motion.div
          whileFocus={reducedMotion ? undefined : { scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <PasswordInput
            id="password"
            name="password"
            placeholder={t("passwordPlaceholder")}
            required
            disabled={pending}
            toggleLabels={{
              show: t("showPassword"),
              hide: t("hidePassword"),
            }}
            className="transition-shadow duration-200 focus:shadow-[0_0_0_3px_rgba(14,165,233,0.15)]"
          />
        </motion.div>
      </div>
      {error && (
        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      <motion.div whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2
                className={cn("h-5 w-5", !reducedMotion && "animate-spin")}
                aria-hidden
              />
              {tCommon("processing")}
            </>
          ) : (
            t("loginButton")
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [role, setRole] = useState("SISWA");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          formData.set("role", role);
          const result = await registerAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="space-y-5"
    >
      <div>
        <Label>{t("selectRole")}</Label>
        <RoleSelector
          value={role}
          onChange={setRole}
          allowedRoles={["SISWA", "GURU"]}
        />
      </div>
      <div>
        <Label htmlFor="nama">{t("fullName")}</Label>
        <Input id="nama" name="nama" placeholder={t("namePlaceholder")} required />
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder={t("passwordMinPlaceholder")}
          required
          disabled={pending}
          toggleLabels={{
            show: t("showPassword"),
            hide: t("hidePassword"),
          }}
        />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? tCommon("processing") : t("registerButton")}
      </Button>
    </form>
  );
}