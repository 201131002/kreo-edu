import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "@/components/layout/site-logo";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-auto border-t border-primary/10 bg-white/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <SiteLogo siteName={settings.siteName} logoUrl={settings.logoUrl} size="sm" />
          {settings.siteName}
        </div>
        <p>{settings.footerTagline}</p>
        <p className="text-xs">{settings.footerCopyright}</p>
      </div>
    </footer>
  );
}