import Link from "next/link";
import { Gamepad2, Star } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { getMiniGameIcon, getStatIcon } from "@/lib/site-icons";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function LandingPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <section className="relative overflow-hidden px-4 py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-tertiary/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4">
              {settings.heroBadge}
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              {settings.heroTitle}{" "}
              <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                {settings.heroTitleHighlight}
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted">{settings.heroDescription}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/daftar">
                <Button size="lg">{settings.heroCtaPrimary}</Button>
              </Link>
              <Link href="/masuk">
                <Button variant="outline" size="lg">
                  {settings.heroCtaSecondary}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="animate-float rounded-[2rem] border-4 border-white bg-gradient-to-br from-primary to-tertiary p-8 shadow-soft">
              <div className="flex flex-col items-center gap-4 text-white">
                <Gamepad2 className="h-20 w-20" />
                <p className="font-display text-2xl font-bold">Level Up!</p>
                <div className="flex gap-3">
                  <div className="rounded-2xl bg-white/20 px-4 py-2 text-center">
                    <p className="text-xs opacity-80">EXP</p>
                    <p className="font-bold">+250</p>
                  </div>
                  <div className="rounded-2xl bg-white/20 px-4 py-2 text-center">
                    <p className="text-xs opacity-80">Koin</p>
                    <p className="font-bold">+50</p>
                  </div>
                </div>
              </div>
            </div>
            <Star className="absolute -right-2 top-4 h-8 w-8 animate-bounce-soft text-secondary" />
          </div>
        </div>
      </section>

      <section id="games" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              {settings.gamesTitle}
            </h2>
            <p className="mt-2 text-muted">{settings.gamesSubtitle}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {settings.miniGames.map((game) => {
              const Icon = getMiniGameIcon(game.icon);
              return (
                <Link key={game.name} href={game.href}>
                  <Card className="group h-full transition hover:-translate-y-1 hover:shadow-soft">
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-md`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                    <p className="mt-3 text-xs font-semibold text-primary">
                      10 soal · Mulai petualangan →
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="stats" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {settings.stats.map((stat) => {
              const Icon = getStatIcon(stat.icon);
              return (
                <Card key={stat.label} className="text-center">
                  <Icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <p className="font-display text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold">{settings.ctaTitle}</h2>
          <p className="mt-4 text-muted">{settings.ctaDescription}</p>
          <Link href="/daftar" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">
              {settings.ctaButtonText}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}