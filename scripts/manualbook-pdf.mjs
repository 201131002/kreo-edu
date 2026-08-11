// Renders the KREO manualbook as a PDF via chrome-headless-shell.
// Builds a single self-contained HTML from the markdown + storyboard screenshots,
// then prints to PDF A4 with a running footer matching the original manualbook look.
import { readFileSync, writeFileSync, readFileSync as _r } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const ROOT = "/Users/rick/kreo";
const MD = join(ROOT, "data/products-manualbook/manual-book-kreo.md");
const SHOTS = "/tmp/kreo-manualbook/shots";
const OUT = join(ROOT, "data/products-manualbook/Manual-Book-KREO.pdf");
const CHROME = process.env.CHROME_BIN;

if (!CHROME) { console.error("Set CHROME_BIN"); process.exit(1); }

const md = readFileSync(MD, "utf8");

// --- naive markdown -> html (enough for the manualbook) -------------------
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(code) {
  return esc(code)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")            // strip markdown links -> label
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
function mdToHtml(src) {
  const lines = src.split(/\r?\n/);
  const out = [];
  let list = null;
  let inCode = false;
  let codeBuf = [];
  let tableMode = false;
  let tableHtml = [];

  const closeList = () => {
    if (list) { out.push(`</${list}>`); list = null; }
  };
  const closeTable = () => {
    if (tableMode) {
      out.push(`<table>${tableHtml.join("")}</table>`);
      tableHtml = [];
      tableMode = false;
    }
  };

  for (const line of lines) {
    // code fence
    if (/^```/.test(line)) {
      if (!inCode) { closeList(); closeTable(); inCode = true; codeBuf = []; }
      else {
        inCode = false;
        out.push(`<pre>${codeBuf.map(esc).join("\n")}</pre>`);
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    // headings
    let m = line.match(/^(#{1,4})\s+(.*)$/);
    if (m) {
      closeList(); closeTable();
      const lvl = m[1].length;
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
      continue;
    }
    // horizontal rule
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) { closeList(); closeTable(); continue; }

    // table detection
    if (/^\|/.test(line.trim())) {
      if (!tableMode) { closeList(); tableMode = true; tableHtml = []; }
      const cells = line.trim().split("|").slice(1, -1).map((c) => c.trim());
      // skip header separator rows like |----|----|
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      const tag = tableHtml.length === 0 ? "thead" : "tbody";
      if (tag === "thead") {
        tableHtml.push(`<thead><tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`);
      } else {
        tableHtml.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      }
      continue;
    } else {
      closeTable();
    }

    // lists
    const li = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (li) {
      if (list !== "ul") { closeList(); list = "ul"; out.push("<ul>"); }
      out.push(`<li>${inline(li[2])}</li>`);
      continue;
    }
    const oli = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (oli) {
      if (list !== "ol") { closeList(); list = "ol"; out.push("<ol>"); }
      out.push(`<li>${inline(oli[2])}</li>`);
      continue;
    }
    closeList();

    // blank
    if (!line.trim()) continue;

    // paragraphs
    if (line.trim() === ">") { continue; }
    if (line.trim().startsWith("> ")) {
      out.push(`<blockquote>${inline(line.trim().slice(2))}</blockquote>`);
      continue;
    }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inCode) out.push(`<pre>${codeBuf.map(esc).join("\n")}</pre>`);
  closeList(); closeTable();
  return out.join("\n");
}

// --- storyboard images -----------------------------------------------------
function storyboardSection() {
  const names = [
    ["landing.jpg", "Halaman Beranda (Splashscreen)", "Tampilan publik utama KREO — hero 'Belajar Jadi Petualangan Seru!', statistik, dan showcase 4 mini game."],
    ["login.jpg", "Halaman Masuk Akun", "Login dengan pilihan role: Siswa, Guru, atau Admin."],
    ["register.jpg", "Halaman Daftar Akun", "Pendaftaran publik — role Siswa & Guru."],
    ["dash-siswa.jpg", "Dashboard Siswa", "Level, EXP, progress bar, koin, dan quick links."],
    ["kelas-siswa.jpg", "Pilih Kelas Baru", "Siswa memilih petualangan & tekan 'Gabung Kelas'."],
    ["kelas-materi.jpg", "Halaman Materi", "Materi pembelajaran + daftar kuis per kelas."],
    ["kuis.jpg", "Halaman Kuis", "10 soal pilihan ganda (A/B/C/D)."],
    ["toko.jpg", "Toko Reward", "Beli border avatar dengan koin hasil kuis."],
    ["inventori.jpg", "Inventori", "Pasang/lepas border & lencana."],
    ["peringkat.jpg", "Peringkat Juara", "Top 50 pahlawan berdasarkan EXP."],
    ["laporan.jpg", "Laporan Petualangan", "Riwayat kuis: skor, EXP, koin, rata-rata."],
    ["pesan.jpg", "Pesan Diskusi", "Forum diskusi per kelas."],
    ["pengaturan.jpg", "Pengaturan Akun", "Nama, avatar, dan kata sandi."],
    ["dash-guru.jpg", "Dashboard Guru", "Ringkasan kelas, kuis, dan siswa."],
    ["guru-kelas.jpg", "Kelas Saya (Guru)", "Buat & kelola kelas."],
    ["guru-kelas-detail.jpg", "Detail Kelas (Guru)", "Tab materi & kuis."],
    ["guru-kuis.jpg", "Builder Kuis (Guru)", "Tambahkan soal, impor bank soal & Aiken."],
    ["guru-banksoal.jpg", "Bank Soal", "120 soal kelas 1–6, filter & pencarian."],
    ["guru-siswa.jpg", "Perkembangan Siswa", "Tabel siswa: level, EXP, kelas."],
    ["guru-analitik.jpg", "Analitik Kuis (Guru)", "Skor rata-rata & statistik."],
    ["dash-admin.jpg", "Dashboard Admin", "Menu pengelolaan platform."],
    ["admin-pengguna.jpg", "Manajemen Pengguna", "Kelola user & role."],
    ["admin-toko.jpg", "Kelola Toko", "Tambah border baru."],
    ["admin-lencana.jpg", "Kelola Lencana", "CRUD lencana & kriteria."],
    ["admin-analitik.jpg", "Analitik Global", "Statistik platform."],
    ["admin-homepage.jpg", "CMS Halaman Beranda", "Edit hero, FAQ, mini games, footer."],
  ];
  let html = `<h1 class="page-break-anchor">Storyboard Aplikasi KREO</h1><p class="lead">Berikut tangkapan layar seluruh alur utama platform KREO sesuai urutan penggunaannya.</p>`;
  for (const [file, title, desc] of names) {
    const tag = `<figure class="shot"><img src="file://${join(SHOTS, file)}" alt="${esc(title)}"/><figcaption><strong>${esc(title)}</strong> — ${esc(desc)}</figcaption></figure>`;
    html += tag;
  }
  return html;
}

// --- assemble full html ----------------------------------------------------
const mdHtml = mdToHtml(md);
const cover = `
<section class="cover">
  <div class="cover-inner">
    <p class="cover-sub">Universitas Bhinneka Nusantara</p>
    <p class="cover-sub2">Sistem Informasi</p>
    <h1 class="cover-title">MANUAL BOOK</h1>
    <p class="cover-app">KREO</p>
    <p class="cover-tagline">Platform Belajar Gamifikasi untuk Siswa Sekolah Dasar</p>
    <div class="cover-rect">
      <p>SOFTWARE USER MANUAL</p>
      <p class="cover-ver">Versi 1.0</p>
    </div>
    <p class="cover-author">Pencipta:<br/>Fariki Ramadhan — 2026</p>
    <p class="cover-footer">© 2026 KREO · Universitas Bhinneka Nusantara</p>
  </div>
</section>`;

const body = `
<body>
  <div class="doc">
    ${cover}
    ${mdHtml}
    ${storyboardSection()}
  </div>
</body>`;

const css = `
  @page { size: A4; margin: 2.2cm 1.8cm 2.2cm 1.8cm;
    @bottom-center { content: "© 2026 KREO · Universitas Bhinneka Nusantara"; font-size: 8pt; color: #888; }
    @bottom-right { content: "Page " counter(page) " dari " counter(pages); font-size: 8pt; color: #888; }
  }
  @page :first { margin: 0; @bottom-center { content: none; } @bottom-right { content: none; } }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 10.5pt; color: #222; line-height: 1.55; margin: 0; }
  .doc { max-width: 100%; }
  /* --- cover --- */
  .cover { page-break-after: always; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, #0ea5e9 0%, #0ea5e9 35%, #8b5cf6 100%); color: #fff; }
  .cover-inner { text-align: center; max-width: 80%; margin: auto; }
  .cover-sub { font-size: 12pt; letter-spacing: 2px; opacity: .9; margin: 0 0 4px; }
  .cover-sub2 { font-size: 10pt; letter-spacing: 4px; opacity: .75; margin: 0 0 26px; }
  .cover-title { font-size: 26pt; font-weight: 800; letter-spacing: 6px; margin: 0 0 10px; text-transform: uppercase; }
  .cover-app { font-size: 56pt; font-weight: 900; line-height: 1.05; margin: 18px 0 8px; text-shadow: 0 4px 24px rgba(0,0,0,.25); }
  .cover-tagline { font-size: 13pt; opacity: .95; margin: 0 0 30px; max-width: 460px; margin-left:auto; margin-right:auto; }
  .cover-rect { display: inline-block; border: 2px solid rgba(255,255,255,.85); border-radius: 14px; padding: 14px 34px; margin-bottom: 28px; }
  .cover-rect p { margin: 0; font-size: 14pt; font-weight: 700; letter-spacing: 3px; }
  .cover-rect .cover-ver { font-size: 11pt; font-weight: 400; letter-spacing: 2px; opacity: .85; margin-top: 2px; }
  .cover-author { font-size: 11pt; line-height: 1.8; margin: 0 0 26px; }
  .cover-footer { font-size: 9.5pt; opacity: .75; margin: 0; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 9pt; }
  pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; overflow-x: auto; font-size: 9pt; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
  th { background: #0ea5e9; color: #fff; }
  tr:nth-child(even) td { background: #f8fafc; }
  h1 { font-size: 20pt; color: #0ea5e9; border-bottom: 3px solid #0ea5e9; padding-bottom: 6px; margin: 24px 0 12px; }
  h2 { font-size: 15pt; color: #0ea5e9; margin: 22px 0 10px; border-left: 5px solid #f59e0b; padding-left: 10px; }
  h3 { font-size: 12.5pt; color: #334155; margin: 16px 0 8px; }
  h4 { font-size: 11pt; color: #475569; margin: 12px 0 6px; }
  p { margin: 6px 0; }
  blockquote { border-left: 4px solid #8b5cf6; background: #f5f3ff; padding: 6px 12px; margin: 8px 0; color: #3730a3; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 2px 0; }
  .shot { page-break-inside: avoid; margin: 18px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff; }
  .shot img { width: 100%; display: block; border-bottom: 1px solid #e2e8f0; }
  .shot figcaption { padding: 8px 12px; font-size: 9.5pt; color: #475569; background: #f8fafc; }
  .shot figcaption strong { color: #0ea5e9; display: block; margin-bottom: 2px; }
  .lead { font-size: 11pt; color: #475569; }
  .page-break-anchor { page-break-before: always; border-top: 0; }
`;

const html = `<!doctype html><html><head><meta charset="utf-8"/><style>${css}</style></head>${body}</html>`;
const htmlPath = "/tmp/kreo-manualbook/manual-book-kreo.html";
writeFileSync(htmlPath, html);
console.log("HTML written:", htmlPath, (Math.round(html.length / 1024)) + "KB");

// --- print to PDF -----------------------------------------------------------
const port = 9550;
const chrome = spawn(CHROME, [
  "--headless=new", "--no-sandbox", "--disable-gpu",
  "--no-pdf-header-footer", "--print-to-pdf=" + OUT,
  "--print-to-pdf-no-header",
  htmlPath,
], { stdio: ["ignore", "pipe", "pipe"] });

chrome.stdout.on("data", (d) => process.stdout.write(d));
chrome.stderr.on("data", (d) => { const s = String(d); if (!s.includes("Fontations") && !s.includes("dbus")) process.stderr.write(d); });
chrome.on("exit", (code) => {
  if (code === 0) {
    const size = Math.round(readFileSync(OUT).length / 1024);
    console.log("PDF written:", OUT, size + "KB");
  } else {
    console.error("chrome exit", code);
  }
});
