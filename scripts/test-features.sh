#!/bin/bash
set -euo pipefail

BASE="http://localhost:3000"
PASS=0
FAIL=0
COOKIE_JAR=$(mktemp)

log() { echo "  $1"; }
ok()  { PASS=$((PASS+1)); log "✅ $1"; }
err() { FAIL=$((FAIL+1)); log "❌ $1"; }

check_status() {
  local url="$1" expected="$2" label="$3"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$url")
  if [ "$code" = "$expected" ]; then ok "$label ($code)"; else err "$label (expected $expected, got $code)"; fi
}

check_redirect() {
  local url="$1" expected_loc="$2" label="$3"
  local loc code
  loc=$(curl -s -o /dev/null -w "%{redirect_url}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$url")
  code=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$url")
  if echo "$loc" | grep -q "$expected_loc"; then ok "$label → $expected_loc"; else err "$label (redirect: $loc, code: $code)"; fi
}

login() {
  local email="$1" password="$2" role="$3"
  rm -f "$COOKIE_JAR"
  local csrf
  csrf=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "csrfToken=$csrf&email=$email&password=$password&role=$role&redirect=false")
  if [ "$code" = "302" ] || [ "$code" = "200" ]; then
    if grep -q "authjs.session-token" "$COOKIE_JAR" 2>/dev/null; then
      ok "Login $role ($email)"
      return 0
    fi
  fi
  err "Login $role failed (code: $code)"
  return 1
}

logout() {
  local csrf
  csrf=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
  curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/signout" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "csrfToken=$csrf" -o /dev/null
  rm -f "$COOKIE_JAR"
}

check_body() {
  local url="$1" pattern="$2" label="$3"
  local body
  body=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$url")
  if echo "$body" | grep -q "$pattern"; then ok "$label"; else err "$label (pattern '$pattern' not found)"; fi
}

echo "========================================"
echo "KREO Feature Test Suite"
echo "========================================"

echo ""
echo "--- Public Pages ---"
check_status "$BASE/" 200 "Landing page"
check_status "$BASE/masuk" 200 "Login page"
check_status "$BASE/daftar" 200 "Register page"

echo ""
echo "--- Protected Routes (unauthenticated) ---"
check_redirect "$BASE/dashboard/siswa" "/masuk" "Dashboard siswa requires auth"
check_redirect "$BASE/kelas" "/masuk" "Kelas requires auth"
check_redirect "$BASE/toko" "/masuk" "Toko requires auth"
check_redirect "$BASE/admin/pengguna" "/masuk" "Admin requires auth"

echo ""
echo "--- Siswa Role ---"
login "siswa@kreo.id" "kreo123" "SISWA"
check_status "$BASE/dashboard/siswa" 200 "Dashboard siswa"
check_body "$BASE/dashboard/siswa" "Budi Santoso" "Dashboard shows student name"
check_status "$BASE/kelas" 200 "Pilih kelas"
check_body "$BASE/kelas" "History Heroes" "Kelas list shows mini game"
check_status "$BASE/kelas/seed-kelas-history-heroes/materi" 200 "Materi page"
check_body "$BASE/kelas/seed-kelas-history-heroes/materi" "History Heroes" "Materi content"
check_body "$BASE/kelas/seed-kelas-history-heroes/materi" "Kuis" "Quiz listed"
check_status "$BASE/kelas/seed-kelas-history-heroes/kuis/seed-kuis-history-heroes" 200 "Kuis page"
check_body "$BASE/kelas/seed-kelas-history-heroes/kuis/seed-kuis-history-heroes" "History Heroes" "Quiz questions"
check_status "$BASE/toko" 200 "Toko reward"
check_body "$BASE/toko" "Border Biru" "Shop items"
check_status "$BASE/laporan" 200 "Laporan petualangan"
check_status "$BASE/jadwal" 200 "Jadwal belajar"
check_body "$BASE/jadwal" "Senin" "Schedule content"
check_status "$BASE/pesan" 200 "Pesan diskusi"
check_body "$BASE/pesan" "Pesan Diskusi" "Pesan page title"
check_body "$BASE/pesan?kelas=seed-kelas-history-heroes" "Bu Sari" "Discussion messages"
check_body "$BASE/pesan?kelas=seed-kelas-history-heroes" "Kirim" "Send message form"
check_status "$BASE/peringkat" 200 "Peringkat juara"
check_body "$BASE/peringkat" "Peringkat Juara" "Leaderboard title"
check_body "$BASE/peringkat" "Ani Wijaya" "Leaderboard top student"
check_redirect "$BASE/dashboard/guru" "/dashboard/siswa" "Siswa blocked from guru dashboard"
check_redirect "$BASE/admin/pengguna" "/dashboard/siswa" "Siswa blocked from admin"
logout

echo ""
echo "--- Guru Role ---"
login "guru@kreo.id" "kreo123" "GURU"
check_status "$BASE/dashboard/guru" 200 "Dashboard guru"
check_body "$BASE/dashboard/guru" "Bu Sari" "Guru name shown"
check_status "$BASE/guru/kelas" 200 "Daftar kelas guru"
check_body "$BASE/guru/kelas" "History Heroes" "Guru sees mini game class"
check_status "$BASE/pesan" 200 "Guru pesan diskusi"
check_status "$BASE/peringkat" 200 "Guru peringkat"
check_redirect "$BASE/guru/petualangan" "/guru/kelas" "Buat petualangan redirects to kelas"
check_status "$BASE/guru/siswa" 200 "Manajemen siswa"
check_body "$BASE/guru/siswa" "Budi Santoso" "Guru sees enrolled student"
check_status "$BASE/kelas" 200 "Guru can view kelas"
check_redirect "$BASE/toko" "/dashboard/guru" "Guru blocked from toko"
check_redirect "$BASE/dashboard/siswa" "/dashboard/guru" "Guru blocked from siswa dashboard"
logout

echo ""
echo "--- Admin Role ---"
login "admin@kreo.id" "kreo123" "ADMIN"
check_status "$BASE/dashboard/admin" 200 "Dashboard admin"
check_status "$BASE/admin/pengguna" 200 "Manajemen pengguna"
check_body "$BASE/admin/pengguna" "admin@kreo.id" "Admin sees users"
check_body "$BASE/admin/pengguna" "siswa@kreo.id" "Admin sees all roles"
check_status "$BASE/admin/toko" 200 "Kelola toko"
check_body "$BASE/admin/toko" "Border Emas" "Admin toko items"
check_status "$BASE/admin/analitik" 200 "Analitik global"
check_body "$BASE/admin/analitik" "Total Pengguna" "Analytics stats"
check_status "$BASE/pesan" 200 "Admin pesan diskusi"
check_status "$BASE/peringkat" 200 "Admin peringkat"
check_redirect "$BASE/kelas" "/dashboard/admin" "Admin blocked from kelas"
check_redirect "$BASE/dashboard/siswa" "/dashboard/admin" "Admin blocked from siswa dashboard"
logout

echo ""
echo "--- Invalid Login ---"
rm -f "$COOKIE_JAR"
csrf=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])")
code=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$csrf&email=siswa@kreo.id&password=wrongpass&role=SISWA&redirect=false")
if ! grep -q "authjs.session-token" "$COOKIE_JAR" 2>/dev/null; then ok "Invalid login rejected"; else err "Invalid login should not set session (code: $code)"; fi

echo ""
echo "========================================"
echo "Results: $PASS passed, $FAIL failed"
echo "========================================"

rm -f "$COOKIE_JAR"
[ "$FAIL" -eq 0 ]