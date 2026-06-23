# KREO — Platform Belajar Gamifikasi

Platform belajar gamifikasi untuk siswa SD. Belajar jadi petualangan seru dengan EXP, koin, dan reward!

## Quick Start

```bash
npm install
docker compose up -d          # PostgreSQL lokal
cp .env.example .env          # sesuaikan DATABASE_URL & AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Siswa | siswa@kreo.id | kreo123 |
| Guru | guru@kreo.id | kreo123 |
| Admin | admin@kreo.id | kreo123 |

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:seed` | Isi data demo |
| `npm run db:studio` | Prisma Studio GUI |

## Dokumentasi

- [`design.md`](./design.md) — UI/UX & design system
- [`web_summary.md`](./web_summary.md) — Arsitektur & deployment
- [`memory.md`](./memory.md) — Memori proyek
- [`changelog.md`](./changelog.md) — Riwayat perubahan

## Tech Stack

Next.js 16 · Prisma 7 · PostgreSQL · Auth.js v5 · Tailwind CSS v4 · Zod