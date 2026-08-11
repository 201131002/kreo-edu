---
name: audit-security
description: >
  Security audit for KREO: Auth.js JWT, middleware RBAC, Prisma IDOR, server
  actions, rate limiting, headers, uploads. Outputs findings to docs/audit-security.md.
  Use when asked to audit security, RBAC, IDOR, auth, "/audit-security",
  "cek keamanan", or "security review".
metadata:
  short-description: "Audit keamanan KREO"
---

# Audit Keamanan — KREO

Audit keamanan aplikasi e-learning gamifikasi. **Verifikasi di kode**, jangan
hanya mengandalkan dokumentasi lama.

## Stack konteks

- Auth.js v5, JWT session, credentials (email + password + role)
- Middleware RBAC: `src/middleware.ts`
- Server actions: `src/actions/`
- Prisma PostgreSQL
- Rate limit login: `src/lib/auth-rate-limit.ts` (in-memory)

## Langkah audit

### 1. RBAC & middleware

- [ ] Setiap route protected ada di `middleware` matcher
- [ ] Role SISWA/GURU/ADMIN tidak bisa akses silang
- [ ] `/bantuan` publik; `/api/*` tidak terblokir salah
- [ ] Perubahan route sinkron: middleware + dokumentasi

### 2. IDOR di server actions

Untuk setiap action yang menerima `id` / `classId` / `quizId` / `userId`:

- [ ] Join ke `session.user.id` atau `requireAdmin()`
- [ ] Guru: `requireOwnedClass/Quiz/Material`
- [ ] Siswa: enrollment check untuk kelas/diskusi
- [ ] Hasil kuis: attempt by ID + `studentId` match

Grep cepat:

```bash
rg "formData.get\(\"(id|classId|quizId|userId)" src/actions/
rg "requireOwned|requireAdmin|session\.user" src/actions/
```

### 3. Auth & session

- [ ] Pesan login generik (tidak bocorkan role)
- [ ] Rate limit aktif di production (`DISABLE_LOGIN_RATE_LIMIT` hanya test)
- [ ] `AUTH_SECRET` wajib di deploy docs
- [ ] Password bcrypt cost adequate

### 4. Input & upload

- [ ] Zod validation di semua actions
- [ ] Upload gambar: MIME + size (`image-validation.ts`)
- [ ] FAQ/onboarding JSON: schema validation sebelum save
- [ ] SQL injection: hanya Prisma parameterized queries

### 5. Headers & deploy

- [ ] `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` di `next.config.ts`
- [ ] CSP — rencana bertahap
- [ ] Rate limit Redis/Upstash untuk multi-instance serverless

### 6. Data exposure

- [ ] API export guru scoped `teacherId`
- [ ] `answersJson` tidak bocor ke user lain
- [ ] Admin actions logged (rekomendasi jika belum ada)

## Output wajib

1. Update `docs/audit-security.md` — tabel temuan + status
2. Checklist deploy production
3. Max 5 rekomendasi kritis/sedang untuk user

## Perintah verifikasi

```bash
cd /Users/rick/kreo && npm run deploy:check
npm test
bash scripts/test-features.sh
```

## Referensi

- Baseline: `references/kreo-baseline.md`
- Middleware: `src/middleware.ts`
- Auth: `src/lib/auth.config.ts`