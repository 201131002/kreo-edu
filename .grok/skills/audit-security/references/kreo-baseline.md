# Baseline Security KREO (Juli 2026)

## Sudah diperbaiki

- Login generic error message
- Rate limit 5x / 15 menit (in-memory)
- Security headers di next.config
- Quiz result IDOR fix (attempt from DB)
- Guru analytics scoped teacherId
- Middleware role routes

## Rekomendasi kritis production

1. Rate limit → Redis/Upstash (serverless multi-instance)
2. `AUTH_SECRET` kuat di Vercel
3. CSP header bertahap

## Rekomendasi sedang

1. Audit log admin (hapus user, ubah role)
2. Review semua FormData ID handlers tahunan
3. Session policy dokumentasi