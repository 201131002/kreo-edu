# Performance Checklist — KREO

## Build & runtime
- [ ] `npm run deploy:check` tanpa error
- [ ] Route yang perlu auth = dynamic (`ƒ`)
- [ ] Middleware tidak memblok HMR/assets

## Database (Prisma)
- [ ] Index pada `QuizAttempt(studentId, createdAt)`, `quizId`
- [ ] Hindari `findMany` tanpa `take` di list UI
- [ ] `groupBy` / `aggregate` untuk analitik vs load all rows
- [ ] Transaction hanya saat perlu

## Next.js App Router
- [ ] Server Components default; client hanya interaktif
- [ ] `loading.tsx` per segment
- [ ] Parallel data fetch di page.tsx
- [ ] `export const dynamic = "force-dynamic"` hanya jika perlu

## Images & assets
- [ ] `next/image` untuk logo/avatar
- [ ] `remotePatterns` Vercel Blob
- [ ] Unoptimized hanya untuk `/uploads/` lokal

## Client bundle
- [ ] framer-motion hanya di halaman yang perlu
- [ ] exceljs/jspdf hanya di API routes (bukan client)
- [ ] next-intl tree-shaking messages

## UX = perceived performance
- [ ] Skeleton match layout
- [ ] Optimistic UI hanya jika aman
- [ ] Pagination vs load all