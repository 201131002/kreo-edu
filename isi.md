# KREO — Isi Seminar Demo

**Platform Belajar Gamifikasi untuk Siswa SD**  
Belajar jadi petualangan seru dengan EXP, koin virtual, kuis, dan reward!

---

## 1. Ringkasan Proyek

KREO (*Knowledge & Reward Educational Odyssey*) adalah aplikasi web edukasi yang menggabungkan pembelajaran dengan elemen game. Siswa membaca materi, mengerjakan kuis, mengumpulkan EXP & koin, membeli item di toko, dan bersaing di papan peringkat. Guru mengelola kelas, materi, dan kuis. Admin mengawasi seluruh platform.

**Target pengguna:** Siswa SD, Guru, Administrator sekolah/platform.

---

## 2. Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js** | 16.2.9 | Framework React full-stack (App Router) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling utility-first |
| **Lucide React** | 1.21 | Icon set |
| **TanStack React Query** | 5.x | Data fetching (siap untuk fitur realtime) |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Next.js Server Actions** | — | Mutasi data tanpa REST API terpisah |
| **Auth.js (NextAuth v5)** | 5.0 beta | Autentikasi & session JWT |
| **Zod** | 4.x | Validasi input form & server |
| **bcryptjs** | 3.x | Hash password (cost factor 12) |

### Database
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **PostgreSQL** | 16 | Database relasional |
| **Prisma ORM** | 7.8 | Schema, migrasi, query type-safe |
| **@prisma/adapter-pg** + **pg** | — | Driver adapter wajib Prisma 7 |

### Infrastruktur & Tools
| Teknologi | Fungsi |
|-----------|--------|
| **Docker Compose** | PostgreSQL lokal (`docker-compose.yml`) |
| **Prisma Postgres / Neon** | Database cloud (production) |
| **Vercel** | Target deployment |
| **Vercel Blob** | Upload file materi (tersedia, belum diaktifkan penuh) |
| **ESLint** | Linting kode |
| **tsx** | Menjalankan seed & script test |

### Design System
- **Gaya:** Soft 3D Modernism
- **Warna utama:** Teal `#0EA5E9`, Amber `#F59E0B`, Lavender `#8B5CF6`
- **Font:** Quicksand (judul) + Plus Jakarta Sans (isi)
- **Komponen UI:** Button, Card, Input, Badge, PageHeader (custom)

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│   React Components + Server Actions (form submit)        │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Next.js 16 App Router                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Middleware  │  │ Server       │  │ API Route      │  │
│  │ (RBAC)      │  │ Components   │  │ /api/auth/*    │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Server Actions: auth, class, quiz, shop, admin,     │ │
│  │                 discussion                          │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│         Auth.js (JWT Session) + Prisma Client           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              PostgreSQL Database                         │
└─────────────────────────────────────────────────────────┘
```

### Pola Arsitektur
- **Monolith full-stack** dalam satu repo Next.js
- **Server Actions** menggantikan REST API untuk CRUD
- **Middleware RBAC** memfilter akses per role sebelum halaman dimuat
- **Auth config terpisah** (`auth.config.ts` edge-safe + `auth.ts` dengan Prisma)

### Struktur Folder Utama
```
kreo/
├── prisma/
│   ├── schema.prisma      # Definisi database
│   ├── seed.ts            # Data demo
│   └── mini-games-data.ts # 4 mini game × 10 soal
├── src/
│   ├── actions/           # Server Actions
│   ├── app/               # Halaman (App Router)
│   ├── components/        # UI & fitur
│   ├── lib/               # Auth, Prisma, validasi, utils
│   └── middleware.ts      # Proteksi route per role
└── scripts/               # Test otomatis
```

---

## 4. Database — Tabel & Relasi

Total **12 model** di PostgreSQL, dikelola via Prisma Migrate.

### Diagram Relasi (ERD Sederhana)

```
User ──┬── StudentProfile ── StudentInventory ── ShopItem
       ├── Class (sebagai guru/teacher)
       ├── ClassEnrollment ── Class
       ├── QuizAttempt ── Quiz ── Question
       └── DiscussionMessage ── Class

Class ──┬── Material
        ├── Quiz
        ├── ClassEnrollment
        └── DiscussionMessage

Badge (standalone, milestone level)
```

### Tabel Detail

| No | Tabel | Keterangan | Kolom Utama |
|----|-------|------------|-------------|
| 1 | **User** | Akun pengguna (semua role) | `id`, `nama`, `email`, `password`, `role`, `createdAt` |
| 2 | **StudentProfile** | Progress gamifikasi siswa | `currentLevel`, `currentExp`, `virtualCurrency`, `activeBorderId` |
| 3 | **Class** | Kelas/petualangan belajar | `title`, `description`, `teacherId` |
| 4 | **ClassEnrollment** | Siswa yang gabung kelas | `classId`, `studentId`, `joinedAt` |
| 5 | **Material** | Materi pembelajaran per kelas | `title`, `content`, `fileUrl` |
| 6 | **Quiz** | Kuis per kelas | `title`, `rewardCoins`, `rewardExp` |
| 7 | **Question** | Soal pilihan ganda (A–D) | `questionText`, `optionA–D`, `correctOption` |
| 8 | **QuizAttempt** | Riwayat pengerjaan kuis | `score`, `correctAnswers`, `coinsEarned`, `expEarned` |
| 9 | **Badge** | Lencana milestone level | `name`, `levelMilestone` |
| 10 | **ShopItem** | Item di toko reward | `name`, `priceCoins`, `borderCssClass` |
| 11 | **StudentInventory** | Item yang sudah dibeli siswa | `studentId`, `itemId`, `purchasedAt` |
| 12 | **DiscussionMessage** | Pesan diskusi per kelas | `classId`, `senderId`, `content`, `createdAt` |

### Enum
- **UserRole:** `ADMIN` | `GURU` | `SISWA`

### Index Penting
- `User.role` — filter per role
- `StudentProfile.currentExp DESC` — leaderboard cepat
- `QuizAttempt(studentId, createdAt)` — laporan & batas harian
- `DiscussionMessage(classId, createdAt)` — chat per kelas

### Migrasi
| Migrasi | Isi |
|---------|-----|
| `20260619143136_init` | Schema awal (11 model) |
| `20260619145207_add_discussion_and_leaderboard` | DiscussionMessage + index leaderboard |

---

## 5. Fitur per Role

### 👨‍🎓 Siswa (SISWA)
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Dashboard | `/dashboard/siswa` | Ringkasan EXP, level, koin, shortcut |
| Pilih Kelas | `/kelas` | Lihat & gabung kelas |
| Materi | `/kelas/[id]/materi` | Baca materi + daftar kuis |
| Kuis | `/kelas/[id]/kuis/[quizId]` | Kerjakan soal pilihan ganda |
| Hasil Kuis | `/kelas/[id]/kuis/[quizId]/hasil` | Skor, reward, coba lagi |
| Toko Reward | `/toko` | Beli border avatar dengan koin |
| Laporan | `/laporan` | Riwayat kuis & total reward |
| Jadwal | `/jadwal` | Jadwal belajar mingguan |
| Peringkat | `/peringkat` | Top 50 siswa berdasarkan EXP |
| Pesan | `/pesan` | Diskusi per channel kelas |

### 👩‍🏫 Guru (GURU)
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Dashboard | `/dashboard/guru` | Ringkasan kelas |
| Kelola Kelas | `/guru/kelas` | Buat kelas baru |
| Detail Kelas | `/guru/kelas/[id]` | Tab Materi & Kuis |
| Builder Kuis | `/guru/kelas/[id]/kuis/[quizId]` | Tambah soal, set reward |
| Manajemen Siswa | `/guru/siswa` | Lihat siswa & attempt terbaru |
| Pesan | `/pesan` | Diskusi dengan siswa per kelas |
| Peringkat | `/peringkat` | Lihat leaderboard |

### 🛡️ Admin (ADMIN)
| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Dashboard | `/dashboard/admin` | Statistik platform |
| Pengguna | `/admin/pengguna` | CRUD user, ubah role, reset progress |
| Toko | `/admin/toko` | Kelola item toko |
| Analitik | `/admin/analitik` | Total user, kuis, rata-rata skor |
| Pesan | `/pesan` | Pantau semua diskusi kelas |
| Peringkat | `/peringkat` | Pantau leaderboard |

### 🌐 Publik
| Halaman | Route |
|---------|-------|
| Landing / Beranda | `/` |
| Login | `/masuk` |
| Register | `/daftar` |

---

## 6. Mini Games (Konten Demo)

Platform di-seed dengan **4 Mini Games**, masing-masing berisi **1 materi + 1 kuis (10 soal)**:

| No | Nama | Tema | Reward (EXP / Koin) |
|----|------|------|---------------------|
| 1 | **History Heroes** | Sejarah & pahlawan Indonesia | 120 / 25 |
| 2 | **Language War** | Bahasa Indonesia & kosakata | 120 / 25 |
| 3 | **Questopia** | Petualangan & eksplorasi ilmu | 150 / 30 |
| 4 | **Math Master** | Matematika dasar | 100 / 20 |

---

## 7. Aturan Bisnis & Keamanan

### Gamifikasi
- **EXP & Koin** hanya diberikan pada **percobaan pertama** per kuis
- Skor ≥ 60% → reward penuh; di bawah 60% → 30% reward (hanya attempt pertama)
- Level naik otomatis berdasarkan total EXP (`calculateLevel`)
- Leaderboard: ranking Top 50 berdasarkan `currentExp`

### Anti-Cheat & Validasi
- Maksimal **3 attempt kuis per hari** per siswa per kuis
- Password di-hash **bcrypt** (cost 12)
- Semua input divalidasi **Zod** di server
- **RBAC middleware** — siswa tidak bisa akses halaman admin/guru

### Autentikasi
- Login dengan **email + password + role** (role harus cocok dengan data di DB)
- Session **JWT** via Auth.js v5
- Credentials provider (tanpa OAuth pihak ketiga)

---

## 8. Server Actions (Backend Logic)

| File | Fungsi |
|------|--------|
| `auth.ts` | Login, register |
| `class.ts` | Buat kelas, materi, kuis, enrollment |
| `quiz.ts` | Submit jawaban kuis, hitung skor & reward |
| `shop.ts` | Beli item toko |
| `admin.ts` | CRUD pengguna, reset progress |
| `discussion.ts` | Kirim pesan diskusi per kelas |

---

## 9. Akun Demo (untuk Presentasi)

| Role | Email | Password | Nama |
|------|-------|----------|------|
| Siswa | `siswa@kreo.id` | `kreo123` | Budi Santoso |
| Guru | `guru@kreo.id` | `kreo123` | Bu Sari |
| Admin | `admin@kreo.id` | `kreo123` | Admin KREO |

**Siswa tambahan (leaderboard):**
- `ani@kreo.id` / `kreo123` — Ani Wijaya (EXP tertinggi)
- `doni@kreo.id` / `kreo123` — Doni Pratama

---

## 10. Alur Demo Seminar (Saran Presentasi)

### Bagian 1 — Perkenalan (2 menit)
1. Buka landing page `/` — jelaskan konsep gamifikasi
2. Tunjukkan 4 Mini Games di beranda

### Bagian 2 — Alur Siswa (5 menit)
1. Login sebagai **siswa@kreo.id** (role: Siswa)
2. Dashboard → lihat EXP, level, koin
3. Masuk kelas **History Heroes** → baca materi
4. Kerjakan kuis → tunjukkan halaman hasil (+EXP, +Koin)
5. Ulangi kuis → tunjukkan **tidak ada reward** di attempt kedua
6. Buka **Peringkat** → lihat ranking
7. Buka **Pesan** → kirim pesan diskusi
8. Buka **Toko** → beli border (jika koin cukup)

### Bagian 3 — Alur Guru (3 menit)
1. Logout → login **guru@kreo.id**
2. `/guru/kelas` → tunjukkan daftar kelas
3. Buka detail kelas → tab Materi & Kuis
4. Buka builder kuis → tunjukkan tambah soal
5. `/guru/siswa` → lihat progress siswa

### Bagian 4 — Alur Admin (2 menit)
1. Login **admin@kreo.id**
2. `/admin/pengguna` → kelola user, ubah role
3. `/admin/analitik` → statistik global

### Bagian 5 — Teknis (3 menit)
1. Tunjukkan `prisma/schema.prisma` — 12 tabel
2. Jelaskan tech stack (Next.js + Prisma + PostgreSQL)
3. Jelaskan middleware RBAC & Server Actions
4. (Opsional) `npm run db:studio` — GUI database

---

## 11. Environment Variables

| Variable | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `AUTH_SECRET` | ✅ | Secret JWT (`openssl rand -base64 32`) |
| `AUTH_URL` | ✅ | URL app (`http://localhost:3000`) |
| `BLOB_READ_WRITE_TOKEN` | ❌ | Vercel Blob untuk upload materi |

---

## 12. Cara Menjalankan (Live Demo)

```bash
# 1. Install dependensi
npm install

# 2. Setup environment
cp .env.example .env
# Edit DATABASE_URL dan AUTH_SECRET

# 3. Database (pilih salah satu)
docker compose up -d                    # PostgreSQL lokal
# atau: npx create-db create            # Prisma Postgres cloud

# 4. Migrasi & seed
npm run db:migrate
npm run db:seed

# 5. Jalankan
npm run dev
# Buka http://localhost:3000
```

### Script Berguna
| Command | Fungsi |
|---------|--------|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run db:studio` | GUI database Prisma |
| `bash scripts/test-features.sh` | Test HTTP 58 skenario |
| `npx tsx scripts/test-actions.ts` | Test logika DB |

---

## 13. Statistik Proyek

| Metrik | Nilai |
|--------|-------|
| Halaman (routes) | 24+ |
| Model database | 12 |
| Server Actions | 6 file |
| Mini Games | 4 |
| Total soal seed | 40 (4 × 10) |
| Role pengguna | 3 (Admin, Guru, Siswa) |
| Migrasi database | 2 |

---

## 14. Roadmap (Fitur Mendatang)

- Upload materi via Vercel Blob
- Daily Streak & Quest Harian
- Pesan diskusi realtime (WebSocket/polling)
- Vercel Analytics & Speed Insights
- Export komponen ke Figma

---

## 15. Dokumentasi Terkait

| File | Isi |
|------|-----|
| `design.md` | UI/UX & design system lengkap |
| `web_summary.md` | Arsitektur & panduan deployment |
| `memory.md` | Memori teknis proyek |
| `changelog.md` | Riwayat perubahan versi |
| `README.md` | Quick start |

---

*Dokumen ini disusun untuk keperluan seminar hasil demo program KREO — Juni 2026.*