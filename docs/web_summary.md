# Panduan Lengkap Arsitektur, Development Lokal & Deployment KREO ke Vercel

**Next.js 16 + Prisma + PostgreSQL (Neon/Prisma Postgres) | Target: Siswa SD**

**Dibuat oleh:** Senior Fullstack Developer (10+ tahun pengalaman)  
**Target Deployment:** Vercel (Production)  
**Local Environment:** macOS

---

## 1. Rekomendasi Tech Stack 2026 (Production Ready)

| Komponen            | Rekomendasi                                      | Alasan |
|---------------------|--------------------------------------------------|--------|
| Framework           | **Next.js 16** (App Router)                      | Server Actions, streaming, caching terbaik |
| ORM                 | **Prisma**                                       | Type-safe, migration mudah, integrasi Vercel sangat baik |
| Database            | **Neon** atau **Prisma Postgres** (via Vercel Marketplace) | Serverless, branching, scale-to-zero, auto-inject env |
| Auth                | **Auth.js v5** atau **Clerk**                    | Aman, mudah, support role-based |
| File Upload         | **Vercel Blob**                                  | Native Vercel, sangat mudah |
| Styling             | Tailwind CSS + shadcn/ui                         | Cepat & konsisten |
| State Management    | TanStack Query + Server Components               | Data fetching modern |
| Validation          | Zod                                              | Type-safe validation |
| Deployment          | Vercel                                           | Zero-config + Preview Deployments |

**Rekomendasi Utama saya:** **Next.js 16 + Prisma + Neon** (paling ringan & powerful untuk Vercel)

---

## 2. Setup Lokal macOS (Step by Step)

### 2.1 Install Dependencies

```bash
# Buat project Next.js
npx create-next-app@latest kreo --yes
cd kreo

# Install dependencies
npm install prisma @prisma/client zod lucide-react
npm install -D prisma

# Untuk file upload (Vercel Blob)
npm install @vercel/blob

# Optional: Auth.js
npm install next-auth@beta @auth/prisma-adapter
```

### 2.2 Setup Database Lokal (Docker - Highly Recommended)

Buat file `docker-compose.yml` di root project:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: kreo
      POSTGRES_PASSWORD: kreo123
      POSTGRES_DB: kreo_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Jalankan perintah berikut:

```bash
docker compose up -d
```

### 2.3 Prisma Setup

```bash
npx prisma init
```

Update file `prisma/schema.prisma` sesuai schema di bagian **3. Database Schema** di bawah ini.

Kemudian jalankan:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 3. Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  GURU
  SISWA
}

model User {
  id             String    @id @default(cuid())
  nama           String
  email          String    @unique
  password       String
  role           UserRole  @default(SISWA)
  createdAt      DateTime  @default(now())
  
  studentProfile StudentProfile?
  classes        Class[]           @relation("TeacherClasses")
  enrollments    ClassEnrollment[]
  quizAttempts   QuizAttempt[]
  inventory      StudentInventory[]
}

model StudentProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  currentLevel    Int      @default(1)
  currentExp      Int      @default(0)
  virtualCurrency Int      @default(0)
  activeBorderId  Int?
  updatedAt       DateTime @updatedAt
  
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  inventory StudentInventory[]
}

model Class {
  id          String   @id @default(cuid())
  title       String
  description String?
  teacherId   String
  createdAt   DateTime @default(now())
  
  teacher     User              @relation("TeacherClasses", fields: [teacherId], references: [id])
  materials   Material[]
  quizzes     Quiz[]
  enrollments ClassEnrollment[]
}

model ClassEnrollment {
  id        String   @id @default(cuid())
  classId   String
  studentId String
  joinedAt  DateTime @default(now())
  
  class   Class @relation(fields: [classId], references: [id], onDelete: Cascade)
  student User  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([classId, studentId])
}

model Material {
  id        String   @id @default(cuid())
  classId   String
  title     String
  content   String?
  fileUrl   String?
  createdAt DateTime @default(now())
  
  class Class @relation(fields: [classId], references: [id], onDelete: Cascade)
}

model Quiz {
  id          String   @id @default(cuid())
  classId     String
  title       String
  rewardCoins Int      @default(10)
  rewardExp   Int      @default(50)
  createdAt   DateTime @default(now())
  
  class        Class         @relation(fields: [classId], references: [id], onDelete: Cascade)
  questions    Question[]
  quizAttempts QuizAttempt[]
}

model Question {
  id            String @id @default(cuid())
  quizId        String
  questionText  String
  optionA       String
  optionB       String
  optionC       String
  optionD       String
  correctOption String // "A", "B", "C", atau "D"
  
  quiz Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

model QuizAttempt {
  id             String   @id @default(cuid())
  quizId         String
  studentId      String
  score          Int
  correctAnswers Int
  totalQuestions Int
  coinsEarned    Int
  expEarned      Int
  createdAt      DateTime @default(now())
  
  quiz    Quiz @relation(fields: [quizId], references: [id], onDelete: Cascade)
  student User @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

model Badge {
  id             String  @id @default(cuid())
  name           String
  description    String?
  levelMilestone Int     @unique
}

model ShopItem {
  id             String @id @default(cuid())
  name           String
  priceCoins     Int
  borderCssClass String
  
  studentInventory StudentInventory[]
}

model StudentInventory {
  id          String   @id @default(cuid())
  studentId   String
  itemId      String
  purchasedAt DateTime @default(now())
  
  student StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  item    ShopItem       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, itemId])
}
```

---

## 4. Fitur Guru yang Diperkuat

Guru bisa:

- Membuat Kelas baru
- Menambahkan Materi (dengan file upload via Vercel Blob)
- Membuat Kuis + mengatur `rewardExp` dan `rewardCoins` secara bebas per kuis
- Melihat riwayat attempt siswa

---

## 5. Deployment ke Vercel (Panduan Lengkap)

### Langkah 1: Push ke GitHub

```bash
git init
git add .
git commit -m "Initial KREO project"
git remote add origin https://github.com/username/kreo.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel

1. Masuk ke [vercel.com](https://vercel.com)
2. Klik **Import Git Repository** dan pilih repository GitHub kamu
3. **Paling Penting:** Tambahkan integrasi database:
   - Pergi ke tab **Storage**
   - Pilih **Neon** atau **Prisma Postgres**
   - Vercel akan otomatis menambahkan environment variable `DATABASE_URL`

### Langkah 3: Environment Variables

Pastikan environment variables berikut tersedia di Vercel Dashboard:

| Variable                | Keterangan                                   | Sumber |
|-------------------------|----------------------------------------------|--------|
| `DATABASE_URL`          | Otomatis dari Neon / Prisma Postgres         | Marketplace |
| `BLOB_READ_WRITE_TOKEN` | Untuk upload file (Vercel Blob)              | Vercel Blob integration |
| `NEXTAUTH_SECRET`       | Secret key untuk Auth.js                     | Generate sendiri (gunakan `openssl rand -base64 32`) |
| `NEXTAUTH_URL`          | URL production (`https://kreo.vercel.app`)   | Vercel |

### Langkah 4: Deploy

Setelah semua environment variable dan database siap, klik **Deploy**.

---

## 6. Checklist Keamanan & Best Practice (Anak SD)

- Gunakan **Server Actions** + **Zod** validation
- Implementasikan **middleware** untuk role-based access control (RBAC)
- Hash password dengan **bcrypt**
- Batasi jumlah attempt kuis per hari (anti-cheat untuk anak SD)
- Moderasi konten yang diupload guru
- Gunakan `revalidatePath()` setelah mutasi data
- Buat **index** database pada kolom yang sering di-query (`leaderboard`, `quizAttempts`)
- Aktifkan **Vercel Analytics** + **Speed Insights**

---

## 7. Rekomendasi Lanjutan

- Gunakan **Prisma Studio** untuk melihat dan mengelola data:
  ```bash
  npx prisma studio
  ```
- Manfaatkan **Preview Deployments** Vercel untuk testing bersama guru
- Rencanakan fitur **Daily Streak** dan **Quest Harian** di masa depan
- Pertimbangkan **Supabase** jika suatu saat butuh Realtime + Storage dalam satu paket

---

**Selamat membangun KREO!** 🚀

