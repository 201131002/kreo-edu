# Menjalankan KREO di Local

Panduan menjalankan proyek KREO setelah restart macOS atau setup pertama kali.

---

## Setiap Kali Restart (Sudah Pernah Setup)

Langkah ini biasanya cukup jika proyek sudah pernah di-setup sebelumnya.

### 1. Pastikan Prasyarat Hidup

- **Docker Desktop** — buka aplikasi dan tunggu sampai status *running* (PostgreSQL berjalan lewat Docker).
- **Node.js** — pastikan sudah terpasang (`node -v` dan `npm -v` di terminal).

### 2. Masuk ke Folder Proyek

```bash
cd /Users/rick/kreo
```

### 3. Nyalakan Database PostgreSQL

```bash
docker compose up -d
```

Cek container berjalan:

```bash
docker compose ps
```

### 4. Jalankan Dev Server

```bash
npm run dev
```

### 5. Buka di Browser

[http://localhost:3000](http://localhost:3000)

---

## Setup Pertama Kali

Jalankan jika belum pernah setup, atau setelah menghapus `node_modules` / database.

```bash
cd /Users/rick/kreo
npm install
docker compose up -d
cp .env.example .env   # lewati jika .env sudah ada
npm run db:migrate
npm run db:seed
npm run dev
```

### Isi `.env`

Pastikan minimal variabel berikut ada di `.env`:

```env
DATABASE_URL="postgresql://kreo:kreo123@localhost:5432/kreo_dev"
AUTH_SECRET="..."          # generate: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
```

---

## Akun Demo (Setelah Seed)

| Role  | Email           | Password |
|-------|-----------------|----------|
| Siswa | siswa@kreo.id   | kreo123  |
| Guru  | guru@kreo.id    | kreo123  |
| Admin | admin@kreo.id   | kreo123  |

Login di [http://localhost:3000/masuk](http://localhost:3000/masuk).

---

## Perintah Berguna

| Command | Fungsi |
|---------|--------|
| `npm run dev` | Dev server (port 3000) |
| `npm run db:studio` | GUI database Prisma |
| `docker compose down` | Matikan PostgreSQL |
| `docker compose logs postgres` | Lihat log database |

---

## Troubleshooting

- **Port 5432 sudah dipakai** — matikan PostgreSQL lain, atau ubah port di `docker-compose.yml`.
- **Error koneksi database** — pastikan Docker jalan dan `docker compose up -d` sudah dijalankan.
- **Error `AUTH_SECRET`** — isi `AUTH_SECRET` di `.env`.
- **Halaman kosong / error Prisma** — coba `npm run db:migrate` lalu `npm run db:seed`.

---

## Ringkas Setelah Restart

1. Buka Docker Desktop
2. `cd /Users/rick/kreo`
3. `docker compose up -d`
4. `npm run dev`
5. Buka [http://localhost:3000](http://localhost:3000)