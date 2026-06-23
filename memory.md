# KREO — Project Memory

**Terakhir diperbarui:** 19 Juni 2026

## Ringkasan Proyek

KREO adalah platform belajar gamifikasi untuk siswa SD. UI mengikuti design system **Soft 3D Modernism** dari `design.md`. Backend mengikuti arsitektur di `web_summary.md`.

## Tech Stack

| Komponen | Pilihan |
|----------|---------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma 7 |
| ORM | Prisma + `@prisma/adapter-pg` |
| Auth | Auth.js v5 (next-auth beta) |
| Styling | Tailwind CSS v4 |
| Validasi | Zod |
| Icons | Lucide React |

## Design System

- **Primary:** `#0EA5E9` (Teal)
- **Secondary:** `#F59E0B` (Amber)
- **Tertiary:** `#8B5CF6` (Lavender)
- **Font:** Quicksand (display) + Plus Jakarta Sans (body)
- **Gaya:** Soft 3D — shadow bawah pada tombol, rounded-2xl/3xl, gradient background

## Struktur Halaman

| Route | Screen | Role |
|-------|--------|------|
| `/` | Landing (`kreo_beranda`) | Public |
| `/masuk` | Login (`kreo_masuk_akun`) | Public |
| `/daftar` | Register (`kreo_daftar_akun`) | Public |
| `/dashboard/siswa` | Dashboard Siswa | SISWA |
| `/dashboard/guru` | Dashboard Guru | GURU |
| `/dashboard/admin` | Dashboard Admin | ADMIN |
| `/kelas` | Pilih Kelas Baru | SISWA, GURU |
| `/kelas/[id]/materi` | Halaman Materi | All authenticated |
| `/kelas/[id]/kuis/[quizId]` | Kuis Seru | SISWA |
| `/kelas/[id]/kuis/[quizId]/hasil` | Hasil Kuis | SISWA |
| `/toko` | Toko Reward | SISWA |
| `/laporan` | Laporan Petualangan | SISWA |
| `/jadwal` | Jadwal Belajar | SISWA |
| `/pesan` | Pesan Diskusi | SISWA, GURU |
| `/guru/kelas` | Daftar Kelas | GURU |
| `/guru/petualangan` | Buat Petualangan | GURU |
| `/guru/siswa` | Manajemen Siswa | GURU |
| `/admin/pengguna` | Manajemen Pengguna | ADMIN |
| `/admin/toko` | Kelola Toko | ADMIN |
| `/admin/analitik` | Analitik Global | ADMIN |

## Arsitektur Kode

```
src/
├── actions/          # Server Actions (auth, class, quiz, shop)
├── app/              # Next.js App Router pages
├── components/
│   ├── auth/         # Login/Register forms, role selector
│   ├── layout/       # Navbar, Footer, PageHeader
│   ├── quiz/         # QuizForm (client)
│   └── ui/           # Button, Card, Input, Badge
├── generated/prisma/ # Prisma Client (auto-generated)
└── lib/
    ├── auth.ts       # Auth.js full config (dengan Prisma)
    ├── auth.config.ts# Auth config edge-safe (untuk middleware)
    ├── prisma.ts     # Prisma singleton + pg adapter
    ├── utils.ts      # cn(), exp/level helpers
    └── validations.ts# Zod schemas
```

## Database Schema

Model utama: `User`, `StudentProfile`, `Class`, `ClassEnrollment`, `Material`, `Quiz`, `Question`, `QuizAttempt`, `Badge`, `ShopItem`, `StudentInventory`.

Role enum: `ADMIN`, `GURU`, `SISWA`.

## Keamanan

- Password di-hash dengan bcrypt (cost 12)
- RBAC via middleware (`src/middleware.ts`)
- Validasi input dengan Zod di semua Server Actions
- Batas attempt kuis: **3x per hari** per kuis per siswa
- Auth config terpisah untuk edge middleware (tanpa Prisma)

## Akun Demo (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kreo.id | kreo123 |
| Guru | guru@kreo.id | kreo123 |
| Siswa | siswa@kreo.id | kreo123 |

Seed juga membuat kelas **IPA — Tata Surya** dengan materi, kuis 3 soal, dan item toko.

## Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan PostgreSQL (pilih salah satu)
docker compose up -d
# DATABASE_URL=postgresql://kreo:kreo123@localhost:5432/kreo_dev

# 3. Migrate & seed
npm run db:migrate
npm run db:seed

# 4. Dev server
npm run dev
```

Copy `.env.example` ke `.env` dan sesuaikan `DATABASE_URL` serta `AUTH_SECRET`.

## Deployment Vercel

1. Push ke GitHub
2. Import di Vercel
3. Tambahkan integrasi Neon / Prisma Postgres (auto-inject `DATABASE_URL`)
4. Set env: `AUTH_SECRET`, `AUTH_URL`, `BLOB_READ_WRITE_TOKEN`
5. Deploy — `postinstall` menjalankan `prisma generate` otomatis

## Catatan Penting

- Prisma 7 **wajib** menggunakan driver adapter (`@prisma/adapter-pg` + `pg`)
- `prisma dev` membutuhkan Node 22+ (tidak tersedia di environment saat setup)
- Docker tidak terdeteksi saat setup awal — gunakan `docker compose` manual
- File dokumentasi asli: `design.md`, `web_summary.md` (juga tersedia di `docs/`)