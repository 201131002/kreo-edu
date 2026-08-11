#!/bin/bash
# KREO — deploy ke Vercel (otomatis)
# Jalankan dari root project: bash scripts/deploy-vercel.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERCEL="npx vercel@latest"

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

ensure_env() {
  local name="$1"
  local value="$2"
  local envs=("${@:3}")

  for env in "${envs[@]}"; do
    if $VERCEL env ls "$env" 2>/dev/null | grep -q "^ ${name} "; then
      ok "$name sudah ada ($env)"
    else
      echo "Menambahkan $name ke $env..."
      $VERCEL env add "$name" "$env" --value "$value" --yes
      ok "$name ditambahkan ($env)"
    fi
  done
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
if ! $VERCEL whoami &>/dev/null; then
  manual "Login Vercel (buka browser sekali):"
  echo "       npx vercel login"
  echo ""
  manual "Setelah login, jalankan ulang: bash scripts/deploy-vercel.sh"
  exit 0
fi
VERCEL_USER=$($VERCEL whoami 2>/dev/null)
ok "Vercel login: $VERCEL_USER"
echo ""

# --- 3. Link project (deploy pertama) ---
echo "--- Langkah 3: Link project ---"
if [ ! -d ".vercel" ]; then
  echo "Deploy pertama (link project)..."
  $VERCEL --yes
  ok "Project ter-link ke Vercel"
else
  ok "Project sudah ter-link (.vercel/)"
fi
echo ""

# --- 4. Integrasi Neon ---
echo "--- Langkah 4: Cek integrasi Neon ---"
if $VERCEL integration list 2>/dev/null | grep -qi neon; then
  ok "Neon terhubung (DATABASE_URL otomatis)"
else
  manual "Hubungkan Neon: Vercel Dashboard → Storage → Neon → Connect"
fi
echo ""

# --- 5. Blob store ---
echo "--- Langkah 5: Cek Vercel Blob ---"
if $VERCEL env ls production 2>/dev/null | grep -q "BLOB_READ_WRITE_TOKEN"; then
  ok "Vercel Blob terhubung (BLOB_READ_WRITE_TOKEN)"
else
  echo "Membuat Blob store kreo-uploads..."
  $VERCEL blob create-store kreo-uploads --access public --yes \
    --environment production --environment preview
  ok "Blob store dibuat & terhubung"
fi
echo ""

# --- 6. Environment variables ---
echo "--- Langkah 6: Environment variables ---"
PROD_URL="https://kreo-wine.vercel.app"

AUTH_SECRET_VALUE="${AUTH_SECRET:-$(openssl rand -base64 32)}"
ensure_env "AUTH_SECRET" "$AUTH_SECRET_VALUE" production preview
ensure_env "AUTH_URL" "$PROD_URL" production preview

if ! $VERCEL env ls production 2>/dev/null | grep -q "RUN_DB_SEED"; then
  echo "Menambahkan RUN_DB_SEED=1 (seed sekali saat build berikutnya)..."
  $VERCEL env add RUN_DB_SEED production --value "1" --yes
  ok "RUN_DB_SEED=1 — seed akan jalan saat deploy ini"
else
  ok "RUN_DB_SEED sudah diset (seed idempotent via upsert)"
fi
echo ""

# --- 7. Production deploy ---
echo "--- Langkah 7: Production deploy ---"
echo "Build di Vercel akan otomatis: prisma migrate deploy + seed (jika RUN_DB_SEED=1)"
DEPLOY_URL=$($VERCEL --prod --yes 2>&1 | tee /dev/stderr | grep -oE 'https://kreo-[a-z0-9]+-kreoedu\.vercel\.app' | tail -1)
ok "Production deploy selesai"

if [ -n "$DEPLOY_URL" ]; then
  echo "Mengalihkan domain utama ke deployment terbaru..."
  $VERCEL alias set "$DEPLOY_URL" kreo-wine.vercel.app
  ok "kreo-wine.vercel.app → $DEPLOY_URL"
else
  manual "Set alias manual: npx vercel alias set <deployment-url> kreo-wine.vercel.app"
fi
echo ""

# --- 8. Bersihkan flag seed ---
echo "--- Langkah 8: Bersihkan flag seed ---"
if $VERCEL env ls production 2>/dev/null | grep -q "RUN_DB_SEED"; then
  $VERCEL env remove RUN_DB_SEED production --yes 2>/dev/null || true
  ok "RUN_DB_SEED dihapus (seed tidak diulang tiap deploy)"
else
  ok "RUN_DB_SEED sudah tidak ada"
fi
echo ""

echo "========================================"
ok "Deploy flow selesai!"
echo "========================================"
echo ""
echo "Situs : $PROD_URL"
echo "Login : admin@kreo.id / kreo123"
echo "        guru@kreo.id  / kreo123"
echo "        siswa@kreo.id / kreo123"
echo ""
echo "⚠️  Ganti password demo di production!"