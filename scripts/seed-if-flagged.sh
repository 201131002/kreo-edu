#!/bin/bash
# Jalankan seed hanya saat RUN_DB_SEED=1 (untuk setup production sekali via Vercel build).
set -euo pipefail

if [ "${RUN_DB_SEED:-}" = "1" ]; then
  echo "RUN_DB_SEED=1 — menjalankan prisma db seed..."
  npm run db:seed
else
  echo "RUN_DB_SEED tidak diset — lewati seed."
fi