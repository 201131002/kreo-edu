---
name: audit-performance
description: >
  Performance and optimization audit for KREO Next.js app: bundle, RSC data
  fetching, Prisma N+1, caching, images, loading UX. Outputs actionable list.
  Use when asked to optimize, audit performance, "/audit-performance",
  "cek performa", "buat lebih cepat", or "optimasi".
metadata:
  short-description: "Audit performa & optimasi KREO"
---

# Audit Performa & Optimasi — KREO

Cari bottleneck nyata — database, waterfall fetch, bundle besar, missing loading.

## Langkah audit

### 1. Build & bundle

```bash
cd /Users/rick/kreo && npm run deploy:check
```

- [ ] Build sukses tanpa warning kritis
- [ ] Tidak ada import berat di client tanpa perlu (exceljs, jspdf hanya di API routes)
- [ ] `framer-motion` hanya di komponen client yang perlu

### 2. Data fetching (RSC)

- [ ] Halaman tidak waterfall `await` beruntun — gunakan `Promise.all`
- [ ] Prisma `select` minimal (jangan `include` berlebihan)
- [ ] Pagination di list panjang (admin pengguna, guru siswa, analitik)
- [ ] `export const dynamic = "force-dynamic"` hanya where needed

Grep:

```bash
rg "findMany|count\(" src/app --glob "page.tsx" | head -40
rg "force-dynamic" src/app
```

### 3. Prisma & indeks

- [ ] Query filter pakai field yang di-index (`schema.prisma` @@index)
- [ ] `quizAttempt` filter `studentId`, `quizId`, `createdAt`
- [ ] Hindari load semua attempts untuk histogram di memori jika data besar

### 4. Caching & static

- [ ] `getSiteSettings()` — pertimbangkan `unstable_cache` / tag revalidate
- [ ] Homepage sections yang jarang berubah
- [ ] Locale messages — sudah via next-intl server

### 5. Assets & images

- [ ] `next/image` untuk logo/avatar
- [ ] `remotePatterns` Vercel Blob configured
- [ ] Tidak ada gambar besar unoptimized di client

### 6. UX performa

- [ ] `loading.tsx` di route lambat
- [ ] Suspense untuk `useSearchParams` (language switcher)
- [ ] Tidak block render pada cookie read yang tidak perlu

## Output wajib

1. Tabel temuan: | Area | Masalah | Dampak | Fix singkat | Prioritas |
2. Top 5 quick wins (≤ 1 hari kerja)
3. Top 3 investasi lebih besar (caching, Redis, dll.)

## Target KREO spesifik

| Halaman | Risiko | Cek |
|---------|--------|-----|
| `/admin/pengguna` | Pagination ✅ | OK |
| `/guru/siswa` | Pagination ✅ | OK |
| `/guru/analitik` | Basic stats only | Perlu detail + chart? |
| `/laporan` | Load all attempts | Pagination jika siswa banyak |
| `/peringkat` | Top 50 | OK untuk sekarang |
| Homepage | CMS fetch tiap request | Cache candidate |

## Referensi

- `references/kreo-baseline.md`
- Next.js docs: `node_modules/next/dist/docs/` (baca sebelum ubah caching)