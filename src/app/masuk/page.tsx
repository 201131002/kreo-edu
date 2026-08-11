"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/auth-forms";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const t = useTranslations("auth");
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardTitle className="text-center text-2xl">{t("loginTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("loginDescription")}
          </CardDescription>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            {t("noAccount")}{" "}
            <Link href="/daftar" className="font-semibold text-primary hover:underline">
              {t("registerLink")}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}