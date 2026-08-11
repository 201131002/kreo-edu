import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Quicksand } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { StudentOnboardingShell } from "@/components/layout/student-onboarding-shell";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/site-settings";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const metadata: Metadata = {
    title: `${settings.siteName} — ${settings.heroTitleHighlight}`,
    description: settings.siteDescription,
  };

  if (settings.logoUrl) {
    metadata.icons = {
      icon: [{ url: settings.logoUrl }],
      shortcut: settings.logoUrl,
      apple: settings.logoUrl,
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${quicksand.variable} ${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages} key={locale}>
          <Navbar />
          <StudentOnboardingShell />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}