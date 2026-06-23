# Changelog — KREO

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/).

---

## [0.1.0] — 2026-06-19

### Added

#### Infrastruktur
- Scaffold Next.js 16 dengan TypeScript, Tailwind CSS v4, App Router
- Prisma 7 + PostgreSQL schema lengkap (11 model)
- Docker Compose untuk PostgreSQL lokal (`docker-compose.yml`)
- Auth.js v5 dengan Credentials provider + role-based session
- Middleware RBAC untuk Siswa, Guru, dan Admin
- Server Actions: `auth`, `class`, `quiz`, `shop`
- Validasi Zod untuk semua form input
- Prisma seed dengan data demo (users, kelas, materi, kuis, toko)
- `@prisma/adapter-pg` + `pg` untuk Prisma 7 driver adapter

#### UI — Design System (`design.md`)
- Warna: Primary Teal, Secondary Amber, Tertiary Lavender
- Font: Quicksand + Plus Jakarta Sans
- Komponen UI: Button (soft 3D), Card, Input, Badge, PageHeader
- Layout: Navbar, Footer

#### Halaman
- **Landing** (`/`) — hero, mini games showcase, statistik
- **Auth** — `/masuk` (login + role selector), `/daftar` (register)
- **Dashboard** — `/dashboard/siswa`, `/dashboard/guru`, `/dashboard/admin`
- **Core Learning** — `/kelas`, `/kelas/[id]/materi`, kuis, hasil kuis
- **Gamification** — `/toko`, `/laporan`, `/jadwal`, `/pesan`
- **Guru** — `/guru/kelas`, `/guru/petualangan`, `/guru/siswa`
- **Admin** — `/admin/pengguna`, `/admin/toko`, `/admin/analitik`

#### Fitur Bisnis
- Guru: buat kelas, materi, kuis (custom reward EXP/koin), tambah soal, lihat attempt siswa
- Siswa: gabung kelas, baca materi, kerjakan kuis, dapat EXP/koin, beli item toko
- Admin: kelola pengguna, kelola item toko, analitik global
- Anti-cheat: maksimal 3 attempt kuis per hari per siswa
- Progress level & EXP otomatis setelah kuis

#### Dokumentasi
- `memory.md` — memori proyek untuk sesi berikutnya
- `changelog.md` — riwayat perubahan
- `.env.example` — template environment variables

### Changed
- `activeBorderId` di schema diubah dari `Int?` ke `String?` (konsisten dengan cuid ShopItem)
- Dihapus relasi `inventory` langsung di model `User` (hanya via `StudentProfile`)

### Security
- Password hashing bcrypt (cost factor 12)
- RBAC middleware memblokir akses lintas role
- Auth config terpisah (`auth.config.ts`) agar middleware edge-safe tanpa Prisma

### Technical Notes
- Build production (`npm run build`) berhasil
- Halaman dinamis menggunakan `force-dynamic` untuk route yang akses database
- `postinstall` hook: `prisma generate`

---

## [Unreleased]

### Planned
- Upload materi via Vercel Blob
- Daily Streak & Quest Harian
- Realtime pesan diskusi
- Vercel Analytics + Speed Insights
- Component library terpisah / export Figma