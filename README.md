# KREO — Platform Belajar Gamifikasi

Platform belajar berbasis gamifikasi untuk siswa Sekolah Dasar. Mengubah proses belajar menjadi petualangan interaktif dengan sistem EXP, koin, lencana, dan reward.

## Fitur Utama

### Siswa
- Dashboard personal dengan progress belajar, level, dan koin
- Mengerjakan kuis interaktif dengan umpan balik langsung
- Sistem inventori & toko untuk menukar koin dengan reward virtual
- Lencana pencapaian berdasarkan aktivitas belajar
- Laporan perkembangan belajar

### Guru
- Manajemen kelas & siswa
- Bank soal dengan berbagai tipe pertanyaan
- Pembuatan & penjadwalan kuis per kelas
- Analitik performa siswa & kelas
- Kelola materi pembelajaran

### Admin
- Manajemen pengguna (siswa, guru, admin)
- Konfigurasi lencana & toko reward
- Analitik platform keseluruhan
- Pengaturan homepage & konten situs

## Tech Stack

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 16 | Framework full-stack React |
| Prisma | 7 | ORM & migrasi database |
| PostgreSQL | 16 | Database relasional |
| Auth.js | v5 | Autentikasi & otorisasi |
| Tailwind CSS | v4 | Styling utility-first |
| Zod | v4 | Validasi schema |
| Framer Motion | 12 | Animasi UI |
| next-intl | 4 | Internasionalisasi (ID/EN) |

## Struktur Proyek

```
kreo/
├── prisma/              # Schema DB, migrasi, seed data
├── public/              # Aset statis
├── scripts/             # Script deploy & utilitas
├── src/
│   ├── actions/         # Server actions (business logic)
│   ├── app/             # App router pages & layouts
│   │   ├── admin/       # Halaman admin
│   │   ├── guru/        # Halaman guru
│   │   ├── dashboard/   # Dashboard per role
│   │   ├── kelas/       # Halaman kuis siswa
│   │   └── ...          # Auth, pengaturan, laporan, toko
│   ├── components/      # Komponen UI reusable
│   ├── i18n/            # Konfigurasi internasionalisasi
│   ├── lib/             # Utility, auth config, services
│   └── middleware.ts    # Auth & intl middleware
├── messages/            # File terjemahan (id.json, en.json)
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Orkestrasi app + PostgreSQL
└── .env.example         # Template variabel lingkungan
```

## Panduan Penggunaan

### Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Siswa | siswa@kreo.id | kreo123 |
| Guru | guru@kreo.id | kreo123 |
| Admin | admin@kreo.id | kreo123 |

### Alur Penggunaan

1. **Login** di `/masuk` menggunakan akun demo atau daftar akun baru via `/daftar`
2. **Siswa**: buka dashboard → pilih kelas → kerjakan kuis → kumpulkan EXP & koin → tukar reward di toko
3. **Guru**: buat kelas → tambah siswa → buat bank soal → assign kuis ke kelas → pantau analitik
4. **Admin**: kelola pengguna → konfigurasi lencana & toko → monitor analitik platform

## Menjalankan Aplikasi dengan Docker

### Prasyarat

- [Docker](https://docs.docker.com/get-docker/) ≥ 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.0

### Langkah-langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/<username>/kreo-edu.git
   cd kreo-edu
   ```

2. **Jalankan aplikasi**
   ```bash
   docker compose up -d --build
   ```
   Perintah ini akan:
   - Membangun image Docker dari `Dockerfile` (multi-stage: deps → build → production)
   - Menjalankan container PostgreSQL 16 dengan health check
   - Menjalankan container aplikasi Next.js pada port 3000
   - Aplikasi menunggu database siap sebelum start

3. **Jalankan migrasi & seed database**
   ```bash
   docker compose exec app npx prisma migrate deploy
   docker compose exec app npx prisma db seed
   ```

4. **Akses aplikasi**
   Buka [http://localhost:3000](http://localhost:3000) di browser.

### Perintah Docker Tambahan

| Perintah | Keterangan |
|----------|------------|
| `docker compose logs -f app` | Lihat log aplikasi secara real-time |
| `docker compose logs -f postgres` | Lihat log database |
| `docker compose down` | Hentikan semua container |
| `docker compose down -v` | Hentikan & hapus volume database |
| `docker compose restart app` | Restart container aplikasi saja |
| `docker compose exec app sh` | Masuk shell container aplikasi |

### Variabel Lingkungan

Salin `.env.example` ke `.env` dan sesuaikan nilai berikut:

| Variabel | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_SECRET` | Secret key untuk Auth.js (generate: `openssl rand -base64 32`) |
| `AUTH_URL` | URL publik aplikasi |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob untuk upload materi (opsional) |

## Development Lokal (Tanpa Docker)

```bash
npm install
docker compose up -d postgres     # Hanya jalankan PostgreSQL
cp .env.example .env              # Sesuaikan DATABASE_URL & AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan production server |
| `npm run lint` | ESLint check |
| `npm test` | Jalankan test suite (Vitest) |
| `npm run db:migrate` | Jalankan migrasi database (dev) |
| `npm run db:migrate:deploy` | Jalankan migrasi database (production) |
| `npm run db:seed` | Isi data demo |
| `npm run db:studio` | Prisma Studio GUI |

## Lisensi

Hak cipta © 2026.

</content>