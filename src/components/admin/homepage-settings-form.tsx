import { updateSiteSettingsAction } from "@/actions/site-settings";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { SiteSettingsData } from "@/lib/site-settings-types";

const GAME_ICON_OPTIONS = ["History", "Globe", "Rocket", "Zap", "BookOpen", "Gamepad2"] as const;
const STAT_ICON_OPTIONS = ["Users", "BookOpen", "Coins", "Trophy"] as const;

export function HomepageSettingsForm({ settings }: { settings: SiteSettingsData }) {
  return (
    <form action={updateSiteSettingsAction} className="space-y-8">
      <Card>
        <CardTitle>Branding</CardTitle>
        <CardDescription>Nama situs dan deskripsi untuk SEO</CardDescription>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="siteName">Nama Situs</Label>
            <Input id="siteName" name="siteName" defaultValue={settings.siteName} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="siteDescription">Deskripsi Situs</Label>
            <Textarea
              id="siteDescription"
              name="siteDescription"
              defaultValue={settings.siteDescription}
              rows={2}
              required
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Bagian utama di halaman depan</CardDescription>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="heroBadge">Badge</Label>
            <Input id="heroBadge" name="heroBadge" defaultValue={settings.heroBadge} required />
          </div>
          <div>
            <Label htmlFor="heroTitle">Judul (baris 1)</Label>
            <Input id="heroTitle" name="heroTitle" defaultValue={settings.heroTitle} required />
          </div>
          <div>
            <Label htmlFor="heroTitleHighlight">Judul sorotan (gradient)</Label>
            <Input
              id="heroTitleHighlight"
              name="heroTitleHighlight"
              defaultValue={settings.heroTitleHighlight}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="heroDescription">Deskripsi</Label>
            <Textarea
              id="heroDescription"
              name="heroDescription"
              defaultValue={settings.heroDescription}
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="heroCtaPrimary">Tombol utama</Label>
            <Input
              id="heroCtaPrimary"
              name="heroCtaPrimary"
              defaultValue={settings.heroCtaPrimary}
              required
            />
          </div>
          <div>
            <Label htmlFor="heroCtaSecondary">Tombol sekunder</Label>
            <Input
              id="heroCtaSecondary"
              name="heroCtaSecondary"
              defaultValue={settings.heroCtaSecondary}
              required
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Mini Games</CardTitle>
        <CardDescription>Kartu game di homepage (4 item)</CardDescription>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="gamesTitle">Judul section</Label>
              <Input id="gamesTitle" name="gamesTitle" defaultValue={settings.gamesTitle} required />
            </div>
            <div>
              <Label htmlFor="gamesSubtitle">Subjudul</Label>
              <Input
                id="gamesSubtitle"
                name="gamesSubtitle"
                defaultValue={settings.gamesSubtitle}
                required
              />
            </div>
          </div>

          {settings.miniGames.map((game, index) => (
            <div
              key={index}
              className="rounded-2xl border border-primary/10 bg-surface/50 p-4"
            >
              <p className="mb-3 text-sm font-bold text-primary">Game #{index + 1}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nama</Label>
                  <Input name={`game_${index}_name`} defaultValue={game.name} required />
                </div>
                <div>
                  <Label>Link (href)</Label>
                  <Input name={`game_${index}_href`} defaultValue={game.href} required />
                </div>
                <div className="sm:col-span-2">
                  <Label>Deskripsi</Label>
                  <Input
                    name={`game_${index}_description`}
                    defaultValue={game.description}
                    required
                  />
                </div>
                <div>
                  <Label>Gradient Tailwind</Label>
                  <Input
                    name={`game_${index}_color`}
                    defaultValue={game.color}
                    placeholder="from-sky-400 to-blue-500"
                    required
                  />
                </div>
                <div>
                  <Label>Ikon</Label>
                  <select
                    name={`game_${index}_icon`}
                    defaultValue={game.icon}
                    className="w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-2.5 text-sm"
                  >
                    {GAME_ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Statistik</CardTitle>
        <CardDescription>Angka sorotan di homepage (4 item)</CardDescription>
        <div className="mt-4 space-y-4">
          {settings.stats.map((stat, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-primary/10 bg-surface/50 p-4 sm:grid-cols-3"
            >
              <div>
                <Label>Label</Label>
                <Input name={`stat_${index}_label`} defaultValue={stat.label} required />
              </div>
              <div>
                <Label>Nilai</Label>
                <Input name={`stat_${index}_value`} defaultValue={stat.value} required />
              </div>
              <div>
                <Label>Ikon</Label>
                <select
                  name={`stat_${index}_icon`}
                  defaultValue={stat.icon}
                  className="w-full rounded-2xl border-2 border-primary/10 bg-white px-4 py-2.5 text-sm"
                >
                  {STAT_ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>CTA Bawah</CardTitle>
        <CardDescription>Ajak daftar di bagian paling bawah</CardDescription>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="ctaTitle">Judul</Label>
            <Input id="ctaTitle" name="ctaTitle" defaultValue={settings.ctaTitle} required />
          </div>
          <div>
            <Label htmlFor="ctaDescription">Deskripsi</Label>
            <Textarea
              id="ctaDescription"
              name="ctaDescription"
              defaultValue={settings.ctaDescription}
              rows={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="ctaButtonText">Teks tombol</Label>
            <Input
              id="ctaButtonText"
              name="ctaButtonText"
              defaultValue={settings.ctaButtonText}
              required
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Footer</CardTitle>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="footerTagline">Tagline</Label>
            <Input
              id="footerTagline"
              name="footerTagline"
              defaultValue={settings.footerTagline}
              required
            />
          </div>
          <div>
            <Label htmlFor="footerCopyright">Copyright</Label>
            <Input
              id="footerCopyright"
              name="footerCopyright"
              defaultValue={settings.footerCopyright}
              required
            />
          </div>
        </div>
      </Card>

      <Button type="submit" size="lg">
        Simpan Perubahan Homepage
      </Button>
    </form>
  );
}