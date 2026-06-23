#!/bin/bash
# KREO — deploy ke Vercel (semi-otomatis)
# Jalankan dari root project: bash scripts/deploy-vercel.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

manual() {
  echo -e "${YELLOW}⏸ MANUAL:${NC} $1"
}

ok() {
  echo -e "${GREEN}✅${NC} $1"
}

fail() {
  echo -e "${RED}❌${NC} $1"
  exit 1
}

echo "========================================"
echo "KREO Deploy ke Vercel"
echo "========================================"
echo ""

# --- 1. Build lokal ---
echo "--- Langkah 1: Cek build ---"
npm run deploy:check
ok "Build lokal berhasil"
echo ""

# --- 2. Vercel CLI & login ---
echo "--- Langkah 2: Vercel CLI ---"
if ! npx vercel@latest whoami &>/dev/null; then
  manual "Login Vercel (buka browser sekali):"
  echo "       npx vercel login"
  echo ""
  manual "Setelah login, jalankan ulang: bash scripts/deploy-vercel.sh"
  exit 0
fi
VERCEL_USER=$(npx vercel@latest whoami 2>/dev/null)
ok "Vercel login: $VERCEL_USER"
echo ""

# --- 3. Deploy ---
echo "--- Langkah 3: Deploy ke Vercel ---"
if [ -z "${VERCEL_TOKEN:-}" ] && [ ! -d ".vercel" ]; then
  echo "Deploy pertama (link project)..."
  npx vercel@latest --yes
  ok "Preview deploy selesai"
  echo ""
  manual "Set environment variables di Vercel Dashboard → Settings → Environment Variables:"
  echo "       DATABASE_URL     = connection string Neon/Postgres (WAJIB)"
  echo "       AUTH_SECRET      = $(openssl rand -base64 32 2>/dev/null || echo 'jalankan: openssl rand -base64 32')"
  echo "       AUTH_URL         = https://NAMA-PROJECT.vercel.app (setelah tahu URL)"
  echo "       BLOB_READ_WRITE_TOKEN = dari Vercel Storage → Blob (opsional, untuk upload)"
  echo ""
  manual "Pasang Neon: Vercel Dashboard → Storage → Neon → Connect (auto DATABASE_URL)"
  echo ""
  read -r -p "Sudah set DATABASE_URL + AUTH_SECRET + AUTH_URL di Vercel? (y/n) " READY
  if [ "$READY" != "y" ] && [ "$READY" != "Y" ]; then
    manual "Set env vars dulu, lalu jalankan ulang script ini."
    exit 0
  fi
fi

echo "Production deploy..."
npx vercel@latest --prod --yes
ok "Production deploy selesai"
echo ""

# --- 4. Database migrate (production) ---
echo "--- Langkah 4: Database production ---"
if [ -z "${DATABASE_URL:-}" ]; then
  manual "Export DATABASE_URL production di terminal ini, lalu jalankan:"
  echo '       export DATABASE_URL="postgres://..."'
  echo "       npm run db:migrate:deploy"
  echo "       npm run db:seed    # opsional — data demo"
  echo ""
  manual "Atau jalankan dari Neon SQL Editor / laptop dengan connection string Neon."
else
  if echo "$DATABASE_URL" | grep -qE 'localhost|127\.0\.0\.1'; then
    manual "DATABASE_URL masih lokal. Pakai connection string Neon untuk production:"
    echo "       export DATABASE_URL=\"postgres://...neon...\""
    echo "       npm run db:migrate:deploy"
  else
    npm run db:migrate:deploy
    ok "Migrasi production selesai"
    read -r -p "Jalankan seed demo? (y/n) " SEED
    if [ "$SEED" = "y" ] || [ "$SEED" = "Y" ]; then
      npm run db:seed
      ok "Seed selesai (admin@kreo.id / kreo123)"
    fi
  fi
fi

echo ""
echo "========================================"
ok "Deploy flow selesai!"
echo "========================================"
echo ""
echo "Cek situs di Vercel Dashboard → Deployments"
echo "Login demo: admin@kreo.id / kreo123 (ganti password di production!)"