---
name: audit-uiux
description: >
  Audit UI/UX for KREO (Next.js App Router, Tailwind, mobile-first). Systematic
  checklist: navigation, tap targets, loading states, empty states, i18n, a11y,
  forms, feedback. Outputs prioritized findings to docs/audit-uiux.md. Use when
  asked to audit UI, UX, accessibility, mobile experience, "/audit-uiux",
  "cek ui", "cek ux", or "review tampilan".
metadata:
  short-description: "Audit UI/UX KREO"
---

# Audit UI/UX — KREO

Jalankan audit UI/UX terstruktur. **Jangan hanya membaca** — buka halaman/komponen
yang relevan, catat temuan dengan bukti file:baris.

## Stack konteks

- Next.js 16 App Router, RSC + client components
- Tailwind, kartu rounded-3xl, palet primary/secondary/tertiary
- Role: SISWA / GURU / ADMIN
- i18n: `next-intl` (`messages/id.json`, `messages/en.json`)
- Mobile: `MobileSidebar`, tap target min 44px

## Langkah audit

### 1. Navigasi & informasi

- [ ] Navbar desktop vs mobile konsisten (public: Petualangan, Statistik, Bantuan)
- [ ] Siswa/guru menemukan fitur inti tanpa hafal URL
- [ ] Breadcrumb / back link di halaman dalam (kuis, kelas, admin)
- [ ] Footer punya link penting (Bantuan, dll.)

### 2. Loading & feedback

- [ ] Setiap route data-heavy punya `loading.tsx` + skeleton
- [ ] Form submit: spinner/disabled + pesan error jelas
- [ ] Flash success/error (`?success=`) konsisten per halaman
- [ ] Empty state informatif (bukan hanya teks abu-abu)

### 3. Aksesibilitas

- [ ] Tap target ≥ 44px di mobile
- [ ] `aria-label`, `aria-pressed`, `role="alert"` di form interaktif
- [ ] `prefers-reduced-motion` untuk animasi (framer-motion)
- [ ] Kontras teks `text-muted` pada `bg-white/80` (target WCAG AA)
- [ ] Password toggle punya label show/hide

### 4. Konsistensi bahasa & copy

- [ ] Istilah baku: **kuis** (bukan quis), **percobaan** (bukan attempt di UI ID)
- [ ] Halaman guru/admin pakai i18n atau sengaja ID-only — dokumentasikan gap
- [ ] EN/ID switcher tidak merusak layout navbar

### 5. Pola interaksi

- [ ] Konfirmasi hapus seragam (`ConfirmButton` / `ConfirmForm`)
- [ ] Kuis: hint saat submit disabled
- [ ] Popup onboarding siswa tidak mengganggu setelah dismiss
- [ ] Pagination punya indikator "menampilkan X–Y dari Z"

## Output wajib

1. Update atau buat `docs/audit-uiux.md` dengan tabel:

   | # | Temuan | Prioritas (Kritis/Sedang/Rendah) | File | Status |

2. Bagian **Rekomendasi Terapkan Sekarang** (max 5 item, urut prioritas)

3. Bagikan ringkasan ke user dalam bahasa Indonesia

## Perintah verifikasi

```bash
cd /Users/rick/kreo && npm run deploy:check
bash scripts/test-features.sh
```

## Referensi

- Baseline audit: `references/kreo-baseline.md`
- Komponen layout: `src/components/layout/`
- Skeleton: `src/components/skeletons/`