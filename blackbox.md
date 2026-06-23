# Laporan Black Box Testing — KREO

**Tanggal:** 23 Juni 2026  
**Pendekatan:** Pengujian dari perspektif pengguna akhir — tanpa melihat implementasi internal. Verifikasi via HTTP (status, redirect, konten HTML) dan aset statis.  
**Base URL:** `http://localhost:3000`

---

## 1. Tujuan

Memvalidasi bahwa aplikasi KREO berperilaku benar untuk:

- Pengunjung anonim
- Siswa, Guru, dan Admin (akun demo seed)
- Route baru yang belum ada di test suite lama (`/inventori`, `/pengaturan`, `/admin/homepage`)

---

## 2. Prasyarat

| Item | Status |
|------|--------|
| PostgreSQL `kreo_dev` berjalan | ✅ |
| `npm run db:seed` sudah dijalankan | ✅ |
| `npm run dev` di port 3000 | ✅ |

---

## 3. Matriks Peran

| Route / Skenario | Anonim | Siswa | Guru | Admin |
|------------------|--------|-------|------|-------|
| `/` landing | 200 | — | — | — |
| `/masuk`, `/daftar` | 200 | — | — | — |
| `/dashboard/*` | → `/masuk` | siswa ✅ | guru ✅ | admin ✅ |
| `/kelas`, `/toko`, `/inventori` | → `/masuk` | ✅ | toko ❌ | ❌ |
| `/pengaturan` | → `/masuk` | ✅ | ✅* | ✅* |
| `/peringkat` | → `/masuk` | ✅ | ✅ | ✅ |
| `/admin/*` | → `/masuk` | ❌ | ❌ | ✅ |
| `/guru/*` | → `/masuk` | ❌ | ✅ | ❌ |

\* `/pengaturan` sengaja diizinkan middleware untuk semua role terautentikasi; hanya siswa yang melihat link inventori border.

---

## 4. Kasus Uji

### BB-01 — Aset publik & landing

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-01a | GET `/borders/border-gold.svg` | 200 | 200 | ✅ PASS |
| BB-01b | GET `/badges/lencana-pemula.svg` | 200 | 200 | ✅ PASS |
| BB-01c | GET `/` | Halaman berisi konten KREO | Konten hero/brand ditemukan | ✅ PASS |
| BB-01d | GET `/` | CTA Masuk/Daftar ada | Ditemukan | ✅ PASS |

---

### BB-02 — Halaman daftar (pembatasan role)

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-02a | GET `/daftar` | Opsi Siswa tampil | Ya | ✅ PASS |
| BB-02b | GET `/daftar` | Opsi Guru tampil | Ya | ✅ PASS |
| BB-02c | GET `/daftar` | Tidak ada `value="ADMIN"` di form | Tidak ada | ✅ PASS |

---

### BB-03 — Login dengan role salah

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-03a | POST credentials: `siswa@kreo.id` + role `GURU` | Session tidak dibuat | Cookie session tidak ada | ✅ PASS |

---

### BB-04 — Siswa: inventori & peringkat

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-04a | Login SISWA | Session OK | OK | ✅ PASS |
| BB-04b | GET `/inventori` | 200 | 200 | ✅ PASS |
| BB-04c | GET `/inventori` | Tab/konten Border & Lencana | Ditemukan | ✅ PASS |
| BB-04d | GET `/inventori` | Item border milik siswa (seed) | "Border Biru" / border | ✅ PASS |
| BB-04e | GET `/peringkat` | Leaderboard siswa | Nama siswa seed tampil | ✅ PASS |

---

### BB-05 — Siswa: pengaturan profil

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-05a | GET `/pengaturan` | 200 | 200 | ✅ PASS |
| BB-05b | GET `/pengaturan` | Section profil/avatar | Ditemukan | ✅ PASS |

---

### BB-06 — Guru: pembatasan route siswa

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-06a | Login GURU | Session OK | OK | ✅ PASS |
| BB-06b | GET `/inventori` | Redirect ke dashboard guru | → `/dashboard/guru` | ✅ PASS |
| BB-06c | GET `/toko` | Redirect ke dashboard guru | → `/dashboard/guru` | ✅ PASS |
| BB-06d | GET `/pengaturan` | 200 (multi-role) | 200 | ✅ PASS |

---

### BB-07 — Admin: homepage CMS & pembatasan siswa

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-07a | Login ADMIN | Session OK | OK | ✅ PASS |
| BB-07b | GET `/admin/homepage` | 200 | 200 | ✅ PASS |
| BB-07c | GET `/admin/homepage` | Form beranda/logo/hero | Field CMS ditemukan | ✅ PASS |
| BB-07d | GET `/inventori` | Redirect admin dashboard | → `/dashboard/admin` | ✅ PASS |
| BB-07e | GET `/toko` | Redirect admin dashboard | → `/dashboard/admin` | ✅ PASS |

---

### BB-08 — Route baru tanpa autentikasi

| ID | Langkah | Ekspektasi | Aktual | Hasil |
|----|---------|------------|--------|-------|
| BB-08a | GET `/inventori` (anonim) | → `/masuk` | Redirect login | ✅ PASS |
| BB-08b | GET `/pengaturan` (anonim) | → `/masuk` | Redirect login | ✅ PASS |
| BB-08c | GET `/admin/homepage` (anonim) | → `/masuk` | Redirect login | ✅ PASS |

---

### BB-09 — Suite otomatis standar (`test-features.sh`)

| ID | Cakupan | Hasil |
|----|---------|-------|
| BB-09 | 58 skenario (public, siswa, guru, admin, invalid login) | **58/58 PASS** |

Ringkasan skenario standar:

- Halaman publik: `/`, `/masuk`, `/daftar`
- Protected redirect: dashboard, kelas, toko, admin
- Siswa: kelas → materi → kuis, toko, laporan, jadwal, pesan, peringkat, RBAC
- Guru: dashboard, kelas, siswa, pesan, peringkat, blokir toko
- Admin: pengguna, toko, analitik, pesan, peringkat, blokir kelas siswa
- Login password salah ditolak

---

### BB-10 — Logika bisnis (black box via skrip DB)

| ID | Skenario | Ekspektasi | Hasil |
|----|----------|------------|-------|
| BB-10a | Attempt kuis pertama | EXP & koin naik | ✅ PASS |
| BB-10b | Attempt kuis kedua (hari sama) | Reward 0 | ✅ PASS |
| BB-10c | Guru buat kelas + materi | Record tersimpan | ✅ PASS |
| BB-10d | Pembelian border duplikat | Ditolak / skip | ✅ PASS |

*Dieksekusi via `scripts/test-actions.ts` — 11/11 lulus.*

---

## 5. Skenario Eksploratori (manual observation)

| Skenario | Observasi | Severity |
|----------|-----------|----------|
| Buka `/jadwal` sebagai siswa | Jadwal statis Senin–Jumat; materi "IPA — Tata Surya" tidak match kelas seed | P1 — lihat BUG-001 di `report.md` |
| Buka `/masuk` | Opsi Admin masih ada (benar untuk login admin) | Info |
| Buka `/daftar` | Hanya Siswa & Guru | Sesuai requirement |
| Equip border di inventori | Border tampil di avatar (perlu verifikasi visual UI) | Tidak diuji HTTP — disarankan uji manual browser |

---

## 6. Ringkasan Hasil

| Kategori | Total | Lulus | Gagal |
|----------|-------|-------|-------|
| Extended black box (BB-01 – BB-08) | 21 | 21 | 0 |
| Standard feature suite (BB-09) | 58 | 58 | 0 |
| Action/DB logic (BB-10) | 11 | 11 | 0 |
| **Total** | **90** | **90** | **0** |

**Tingkat keberhasilan:** 100% (semua skenario terotomasi)

---

## 7. Catatan Metodologi

1. **Black box murni:** Tester tidak mengubah kode selama eksekusi; verifikasi lewat HTTP response saja.
2. **Batasan:** Tidak ada uji browser visual (equip border, upload avatar, form CMS submit) — disarankan sebagai **BB-11 manual** berikutnya.
3. **False negative awal:** Uji awal memakai path `/badges/level-5.svg` (tidak ada); file benar adalah `/badges/lencana-pemula.svg`. Sudah dikoreksi di BB-01b.
4. **Asumsi awal salah:** Guru "diblokir" dari `/pengaturan` — middleware memang mengizinkan semua role; diperbarui di BB-06d.

---

## 8. Rekomendasi Black Box Berikutnya

| Prioritas | Kasus baru |
|-----------|------------|
| Tinggi | Submit form homepage CMS → verifikasi landing berubah |
| Tinggi | Beli border baru → equip → cek avatar di `/peringkat` |
| Sedang | Selesaikan kuis → lencana perdana muncul di inventori |
| Sedang | Register user baru (Siswa) end-to-end |
| Rendah | Upload avatar + ganti password di `/pengaturan` |

---

**Laporan terkait:** [`report.md`](./report.md) — bug find, dokumentasi, dan rekomendasi lengkap.