import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const EXEC =
  "/Users/rick/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const BASE = "http://localhost:3000";
const OUT = "/Users/rick/kreo/data/image";
mkdirSync(OUT, { recursive: true });

// Modal onboarding siswa: dismiss lewat tombol supaya localStorage tercatat.
const dismissOnboarding = async (page) => {
  const cta = page.getByRole("button", { name: /Mengerti, mulai petualangan/i });
  try {
    await cta.waitFor({ state: "visible", timeout: 3000 });
    await cta.click();
    await page.waitForTimeout(600);
    console.log("  modal onboarding ditutup");
    return true;
  } catch {
    return false;
  }
};

const shot = async (page, name, full = false) => {
  await page.waitForTimeout(1200);
  await dismissOnboarding(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log(`  saved ${name}.png`);
};

const browser = await chromium.launch({ executablePath: EXEC });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

console.log("1. beranda");
await page.goto(BASE, { waitUntil: "networkidle" });
await shot(page, "01-beranda", true);

console.log("2. masuk");
await page.goto(`${BASE}/masuk`, { waitUntil: "networkidle" });
await shot(page, "02-masuk");

console.log("3. login siswa");
await page.fill('input[type="email"], input[name="email"]', "siswa@kreo.id");
await page.fill('input[type="password"], input[name="password"]', "kreo123");
await page.click('button[type="submit"]');
await page.waitForURL(/dashboard|kelas/, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismissOnboarding(page);

const routes = [
  ["04-dashboard-siswa", "/dashboard/siswa", true],
  ["05-kelas", "/kelas", true],
  ["06-peringkat", "/peringkat", true],
  ["07-toko", "/toko", true],
  ["08-inventori", "/inventori", true],
  ["09-laporan", "/laporan", true],
];

for (const [name, path, full] of routes) {
  console.log(`   ${path}`);
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(() => {});
  await shot(page, name, full);
}

// Masuk ke kuis pertama yang ketemu
console.log("4. cari kuis");
await page.goto(`${BASE}/kelas`, { waitUntil: "networkidle" });
const kelasLink = await page.locator('a[href*="/kelas/"]').first().getAttribute("href").catch(() => null);
if (kelasLink) {
  await page.goto(`${BASE}${kelasLink}`, { waitUntil: "networkidle" });
  await shot(page, "10-detail-kelas", true);
  const kuisLink = await page.locator('a[href*="/kuis/"]').first().getAttribute("href").catch(() => null);
  if (kuisLink) {
    await page.goto(`${BASE}${kuisLink}`, { waitUntil: "networkidle" });
    await shot(page, "11-kuis", true);
  } else {
    console.log("  (tidak ada link kuis)");
  }
} else {
  console.log("  (tidak ada link kelas)");
}

console.log(`\nURL akhir: ${page.url()}`);
await browser.close();
