# Laporan QA — KREO Platform

**Tanggal audit:** 23 Juni 2026  
**Peran:** QA Engineer (black box + automated + code review)  
**Versi aplikasi:** 0.1.0+ (post-fitur inventori, lencana, homepage CMS)  
**Status keseluruhan:** ✅ **Lulus** — tidak ada bug kritis yang menghalangi penggunaan inti

---

## 1. Ringkasan Eksekutif

Audit QA dilakukan setelah membaca `changelog.md`, `memory.md`, dan `web_summary.md`, lalu menjalankan pengujian otomatis, black box HTTP, dan tinjauan kode untuk mencari regresi serta ketidakkonsistenan dokumentasi.

| Metrik | Hasil |
|--------|-------|
| `scripts/test-features.sh` | **58/58 lulus** |
| `scripts/test-actions.ts` | **11/11 lulus** |
| Black box extended (21 skenario) | **21/21 lulus** |
| `npm run build` | **Berhasil** |
| Bug kritis (P0) | **0** |
| Bug sedang (P1) | **2** |
| Bug ringan / gap produk (P2) | **8** |
| Temuan dokumentasi | **3 file usang** |

**Kesimpulan:** Fitur inti (auth, RBAC, kelas, kuis, toko, inventori, lencana, peringkat, admin CMS beranda) berfungsi sesuai ekspektasi di lingkungan lokal. Mayoritas temuan bersifat **gap produk** atau **dokumentasi tertinggal**, bukan kegagalan fungsional.

---

## 2. Lingkup & Metodologi

### 2.1 Dokumen yang dibaca

| Dokumen | Tanggal terakhir | Temuan utama |
|---------|------------------|--------------|
| `changelog.md` | 19 Jun 2026 | `[Unreleased]` kosong; fitur baru tidak tercatat |
| `memory.md` | 19 Jun 2026 | Tidak menyebut `/inventori`, `/pengaturan`, `/peringkat`, `/admin/homepage`, sistem lencana/border |
| `web_summary.md` | — | Schema lama (11 model, `borderCssClass`, `NEXTAUTH_SECRET`) |

### 2.2 Jenis pengujian

1. **Automated HTTP** — `scripts/test-features.sh` (auth, RBAC, halaman per role)
2. **Automated DB/Actions** — `scripts/test-actions.ts` (kuis reward, anti-cheat EXP, toko, CRUD kelas guru)
3. **Black box extended** — skenario tambahan tanpa membaca implementasi (lihat `blackbox.md`)
4. **Build verification** — `npm run build`
5. **Static code review** — middleware, badge service, jadwal, validasi register

### 2.3 Lingkungan uji

| Komponen | Nilai |
|----------|-------|
| OS | macOS (darwin 24.6.0) |
| Node.js | v20.20.2 |
| Database | PostgreSQL Homebrew `localhost:5432`, user `kreo`, DB `kreo_dev` |
| Dev server | `http://localhost:3000` |
| Prisma client version cache | `PRISMA_CLIENT_VERSION=7` |

### 2.4 Akun uji

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kreo.id | kreo123 |
| Guru | guru@kreo.id | kreo123 |
| Siswa | siswa@kreo.id | kreo123 |

---

## 3. Hasil Pengujian Otomatis

### 3.1 Feature test suite (`scripts/test-features.sh`)

```
58 passed, 0 failed
```

Cakupan: halaman publik, redirect tanpa auth, dashboard per role, kelas/materi/kuis, toko, laporan, jadwal, pesan, peringkat, RBAC lintas role, login invalid.

**Keterbatasan:** skrip ini **belum** menguji route baru:

- `/inventori`
- `/pengaturan`
- `/admin/homepage`

### 3.2 Server action tests (`scripts/test-actions.ts`)

```
11 passed, 0 failed
```

Memverifikasi:

- Seed data siswa & soal kuis
- Attempt pertama: EXP/koin bertambah
- Attempt kedua: reward nol (anti-farming EXP/koin)
- Pembelian toko (skip jika sudah punya item)
- Guru membuat kelas + materi + cleanup

### 3.3 Production build

`npm run build` selesai tanpa error. Peringatan: Next.js menandai `middleware` sebagai deprecated (disarankan migrasi ke `proxy`).

---

## 4. Bug & Temuan (Bug Find)

### P0 — Kritis (blokir produksi)

*Tidak ada bug P0 aktif pada build saat ini.*

### P1 — Sedang (perlu perbaikan)

#### BUG-001: Jadwal belajar statis & tidak sinkron dengan data kelas

| Field | Detail |
|-------|--------|
| Lokasi | `src/app/jadwal/page.tsx` |
| Severity | P1 |
| Status | Terbuka |

Halaman `/jadwal` memakai array hardcoded, bukan data dari database. Konten masih menampilkan **"IPA — Tata Surya"** padahal seed saat ini memakai mini game **History Heroes**. Siswa melihat jadwal yang tidak mencerminkan kelas aktual mereka.

**Reproduksi:** Login sebagai siswa → buka `/jadwal` → bandingkan dengan `/kelas`.

**Rekomendasi:** Tarik jadwal dari enrollment + jadwal kelas di DB, atau sembunyikan halaman sampai data tersedia.

---

#### BUG-002: Dokumentasi proyek tidak mencerminkan codebase

| Field | Detail |
|-------|--------|
| Lokasi | `memory.md`, `changelog.md`, `web_summary.md` |
| Severity | P1 (risiko onboarding & regresi) |
| Status | Terbuka |

Contoh ketidaksesuaian:

| Dokumen | Klaim | Realita codebase |
|---------|-------|------------------|
| `memory.md` | Seed kelas "IPA — Tata Surya", 3 soal | Mini game History Heroes, 10 soal |
| `memory.md` | 11 model, tanpa `SiteSettings` | 14 model termasuk `SiteSettings`, `StudentBadge`, `DiscussionMessage` |
| `changelog.md` | `[Unreleased]` hanya planned | Sudah ada inventori, border PNG, lencana, homepage CMS, favicon dinamis |
| `web_summary.md` | `borderCssClass`, `NEXTAUTH_SECRET` | `borderImageUrl`, `AUTH_SECRET` |

**Dampak:** Developer/QA baru bisa salah setup, menulis test, atau menganggap fitur belum ada.

---

### P2 — Ringan / Gap produk

#### BUG-003: Tidak ada UI admin untuk kelola lencana

Lencana hanya di-seed via `prisma/seed.ts`. Admin tidak bisa menambah, mengedit, atau menonaktifkan badge tanpa migrasi/seed manual.

#### BUG-004: Guru tidak bisa edit/hapus kelas, materi, atau kuis

Actions hanya menyediakan **create** (dan admin delete user). Guru tidak bisa memperbaiki typo judul materi atau menghapus kuis yang salah dibuat.

#### BUG-005: Kriteria lencana `QUIZ_COUNT` menghitung semua attempt

`syncEarnedBadges` memakai `quizAttempt.count({ studentId })` — termasuk attempt ulang tanpa reward. Siswa bisa mempercepat lencana kuis dengan mengulang kuis yang sama (maks 3x/hari).

**Catatan:** Ini bisa jadi desain yang disengaja; perlu keputusan produk apakah yang dihitung attempt unik per kuis.

#### BUG-006: Inkonsistensi UX login vs daftar untuk role Admin

- `/daftar`: hanya Siswa & Guru (`allowedRoles={["SISWA", "GURU"]}`) ✅
- `/masuk`: masih menampilkan opsi Admin ✅ (benar untuk admin existing)
- Server menolak login dengan role salah ✅

Bukan celah keamanan, tetapi bisa membingungkan pengguna yang mencoba "daftar sebagai admin".

#### BUG-007: Test suite tidak mencakup fitur terbaru

`scripts/test-features.sh` perlu diperluas untuk `/inventori`, `/pengaturan`, `/admin/homepage`, dan aset `/badges/*`.

#### BUG-008: TanStack Query terpasang tetapi tidak digunakan

Dependency ada di `package.json` tanpa implementasi — dead weight bundle audit.

#### BUG-009: `/pengaturan` terbuka untuk semua role

Middleware secara eksplisit mengizinkan `/pengaturan` untuk Guru dan Admin (bukan bug crash — halaman render HTTP 200). Link "Kelola Border di Inventori" hanya untuk SISWA. Perilaku ini perlu dikonfirmasi apakah disengaja.

#### BUG-010: Peringatan deprecasi Next.js middleware

Build menampilkan `ƒ Proxy (Middleware)` — perlu rencana migrasi ke konvensi `proxy` Next.js 16.

---

### Regresi yang sudah diperbaiki (catatan historis)

| ID | Masalah | Status |
|----|---------|--------|
| REG-001 | Prisma stale client → `siteSettings` / `activeBadge` undefined | ✅ Diperbaiki (`PRISMA_CLIENT_VERSION`) |
| REG-002 | P1010 migrate — role PostgreSQL `kreo` tidak ada | ✅ Diperbaiki (grant role) |
| REG-003 | Register bisa pilih Admin | ✅ Diperbaiki (validasi Zod + UI) |
| REG-004 | `/peringkat` crash Guru/Admin | ✅ Diperbaiki (schema + client sync) |

---

## 5. Matriks Fitur vs Dokumentasi

| Fitur | Di kode | Di memory/changelog | Hasil QA |
|-------|---------|---------------------|----------|
| Auth + RBAC | ✅ | ✅ | ✅ Lulus |
| Kelas / materi / kuis | ✅ | ✅ (data seed usang) | ✅ Lulus |
| Toko + border | ✅ | ❌ tidak terdokumentasi | ✅ Lulus |
| Inventori border/lencana | ✅ | ❌ | ✅ Lulus |
| Peringkat + badge equip | ✅ | ❌ | ✅ Lulus |
| Admin homepage CMS | ✅ | ❌ | ✅ Lulus |
| Favicon dari logo admin | ✅ | ❌ | ✅ (via metadata) |
| Jadwal DB-driven | ❌ | ✅ (disebut ada halaman) | ⚠️ Halaman ada, data palsu |
| Admin kelola lencana | ❌ | — | ❌ Belum ada |
| Guru edit/hapus konten | ❌ | — | ❌ Belum ada |

---

## 6. Rekomendasi Prioritas

### Segera (Sprint berikutnya)

1. **Perbarui** `memory.md`, `changelog.md`, dan `web_summary.md` agar selaras dengan 14 model dan fitur baru.
2. **Perbaiki `/jadwal`** — integrasi DB atau tandai sebagai placeholder.
3. **Perluas** `scripts/test-features.sh` dengan route inventori, pengaturan, admin/homepage.

### Menengah

4. UI admin untuk CRUD lencana.
5. Guru: edit/hapus kelas, materi, kuis.
6. Klarifikasi aturan `QUIZ_COUNT` (attempt total vs kuis unik selesai).

### Rendah

7. Migrasi middleware → proxy (Next.js 16).
8. Hapus atau implementasikan TanStack Query.
9. Dokumentasikan bahwa `/pengaturan` multi-role atau batasi ke SISWA saja.

---

## 7. Lampiran

- Detail skenario black box: [`blackbox.md`](./blackbox.md)
- Skrip otomatis: `scripts/test-features.sh`, `scripts/test-actions.ts`
- Design system: `design.md`

---

**Disusun oleh:** QA Audit (otomatis + manual)  
**Sign-off:** Siap untuk demo internal; perlu update dokumentasi sebelum onboarding tim baru atau deploy production.