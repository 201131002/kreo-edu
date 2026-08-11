// Generates storyboard screenshots for the KREO manualbook.
// Usage: node shots.mjs [port] [outdir]
import { spawn, execSync } from "node:child_process";
import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PORT = process.argv[2] ?? "20128";
const OUT = process.argv[3] ?? "/tmp/kreo-manualbook/shots";
const BASE = `http://localhost:${PORT}`;
const CHROME = process.env.CHROME_BIN;

mkdirSync(OUT, { recursive: true });

if (!CHROME) {
  console.error("Set CHROME_BIN to chrome-headless-shell path.");
  process.exit(1);
}

// ---- CDP helpers ---------------------------------------------------------
async function waitForPort(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(1500) });
      if (r.status < 500) return;
    } catch {}
    await new Promise((res) => setTimeout(res, 400));
  }
  throw new Error("Server not reachable");
}

async function cdp(port, fn) {
  return new Promise((resolve, reject) => {
    const chrome = spawn(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--window-size=1440,1000",
      `--remote-debugging-port=${port}`,
      "about:blank",
    ]);
    const killed = () => !existsSync(`/proc/${chrome.pid}`) && chrome.exitCode !== null;
    const pages = [];
    let pending = [];
    let started = false;
    let wsUrl = null;

    chrome.stderr.on("data", (d) => {});
    chrome.on("error", reject);

    function onMessage(page, data) {
      let msg;
      try { msg = JSON.parse(data); } catch { return; }
      if (msg.id && pending.length) {
        const p = pending.find((x) => x.id === msg.id);
        if (p) {
          pending = pending.filter((x) => x !== p);
          p.resolve(msg);
        }
      } else if (msg.method === "Page.frameStoppedLoading") {
        // noop
      }
    }

    function connect() {
      return new Promise((res, rej) => {
        const timer = setTimeout(() => rej(new Error("CDP timeout")), 20000);
        (async () => {
          let tries = 0;
          while (tries < 40) {
            try {
              const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
              const page = list.find((p) => p.type === "page");
              if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
            } catch {}
            tries += 1;
            await new Promise((r) => setTimeout(r, 250));
          }
          if (!wsUrl) { clearTimeout(timer); rej(new Error("No CDP page target")); return; }

          const ws = new WebSocket(wsUrl);
          ws.onopen = () => {
            clearTimeout(timer);
            res(ws);
          };
          ws.onerror = (e) => { clearTimeout(timer); rej(e); };
          ws.onmessage = (ev) => {
            let msg;
            try { msg = JSON.parse(ev.data); } catch { return; }
            if (msg.id && pending.length) {
              const p = pending.find((x) => x.id === msg.id);
              if (p) {
                pending = pending.filter((x) => x !== p);
                p.resolve(msg);
              }
            }
          };
        })();
      });
    }

    connect().then((ws) => {
      let msgId = 0;
      const send = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const id = ++msgId;
          pending.push({ id, resolve, reject });
          ws.send(JSON.stringify({ id, method, params }));
        });

      const run = async () => {
        try {
          await send("Page.enable");
          await send("Runtime.enable");
          await fn(send);
          ws.close();
          chrome.kill("SIGKILL");
          resolve();
        } catch (e) {
          try { chrome.kill("SIGKILL"); } catch {}
          reject(e);
        }
      };
      run();
    }).catch(reject);
  });
}

// ---- Viewport / full-page capture ---------------------------------------
async function shoot(url, file, opts = {}) {
  const port = 9333 + Math.floor(Math.random() * 200);
  await cdp(port, async (send) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width: opts.width ?? 1440,
      height: opts.height ?? 1000,
      deviceScaleFactor: opts.dpr ?? 1.5,
      mobile: false,
    });
    // auth cookies so role pages render
    if (opts.cookies) {
      const c = opts.cookies;
      for (const cookie of c) {
        await send("Network.enable").catch(() => {});
        await send("Network.setCookie", {
          name: cookie.name,
          value: cookie.value,
          url: BASE,
          path: cookie.path ?? "/",
          httpOnly: cookie.httpOnly ?? false,
          secure: false,
          sameSite: "Lax",
        }).catch(() => {});
      }
    }
    const nav = new Promise((resolve) => {
      const h = setTimeout(resolve, 8000);
      // resolve on load too
    });
    const started = Date.now();
    try {
      await send("Page.navigate", { url });
    } catch (e) {
      console.error("navigate err", url, e.message);
    }
    await new Promise((r) => setTimeout(r, opts.wait ?? 1800));
    // extra settle for client components
    await new Promise((r) => setTimeout(r, opts.extra ?? 400));

    const shot = await send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 70,
      captureBeyondViewport: opts.fullPage ? true : false,
      ...(opts.fullPage ? { clip: undefined } : {}),
    });
    if (shot?.result?.data) {
      writeFileSync(join(OUT, file), Buffer.from(shot.result.data, "base64"));
      console.log(`  ✓ ${file}`);
    } else {
      console.error("  ✗ no data for", url);
    }
  });
}

// ---- Login helper: drive the real UI form (proven reliable) --------------
async function loginAndGetCookies(email, password, role) {
  const port = 9777;
  let result = [];
  await cdp(port, async (send) => {
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Page.navigate", { url: `${BASE}/masuk` });
    await new Promise((r) => setTimeout(r, 2200));

    // click role button (Siswa/Guru/Admin)
    await send("Runtime.evaluate", {
      expression: `(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase() === ${JSON.stringify(role.toLowerCase())});
        if (btn) btn.click();
        return !!btn;
      })()`,
    });
    await new Promise((r) => setTimeout(r, 250));

    // fill email & password using native setters
    const fill = async (selector, val) => {
      await send("Runtime.evaluate", {
        expression: `(() => {
          const el = document.querySelector('${selector}');
          if (!el) return false;
          const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          s.call(el, ${JSON.stringify(val)});
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        })()`,
      });
    };
    await fill('input[name="email"]', email);
    await fill('input[name="password"]', password);
    await new Promise((r) => setTimeout(r, 250));

    // submit
    await send("Runtime.evaluate", {
      expression: `(() => { const f = document.querySelector('form'); if (f) f.requestSubmit(); return true; })()`,
    });
    // wait for the async server action + redirect
    await new Promise((r) => setTimeout(r, 3500));

    // read cookies (session-token should now exist)
    const cookieResp = await send("Network.getAllCookies").catch(() => null);
    const cookies = cookieResp?.result?.cookies ?? [];
    result = cookies.map((c) => ({
      name: c.name,
      value: c.value,
      path: c.path,
      httpOnly: c.httpOnly,
      domain: c.domain,
    }));
    const ok = cookies.some((c) => /session/.test(c.name));
    console.log(`login ${role} (${email}):`, ok ? "OK" : "FAIL", "cookies:", cookies.map((c) => c.name).join(","));
  });
  return result;
}

async function main() {
  await waitForPort(5000);
  const t0 = Date.now();

  // public + login pages ------------------------------------------------
  const publicShots = [
    ["/", "landing.jpg", { fullPage: true }],
    ["/masuk", "login.jpg", {}],
    ["/daftar", "register.jpg", {}],
    ["/bantuan", "help.jpg", { fullPage: true }],
  ];
  for (const [urlPath, file, opts] of publicShots) {
    await shoot(BASE + urlPath, file, opts);
  }

  // login as each role
  const siswa = await loginAndGetCookies("siswa@kreo.id", "kreo123", "Siswa");
  const guru = await loginAndGetCookies("guru@kreo.id", "kreo123", "Guru");
  const admin = await loginAndGetCookies("admin@kreo.id", "kreo123", "Admin");

  // student role pages
  const siswaShots = [
    ["/dashboard/siswa", "dash-siswa.jpg"],
    ["/kelas", "kelas-siswa.jpg"],
    ["/kelas/seed-kelas-history-heroes/materi", "kelas-materi.jpg"],
    ["/kelas/seed-kelas-history-heroes/kuis/seed-kuis-history-heroes", "kuis.jpg"],
    ["/toko", "toko.jpg"],
    ["/inventori", "inventori.jpg"],
    ["/peringkat", "peringkat.jpg"],
    ["/laporan", "laporan.jpg"],
    ["/pesan", "pesan.jpg"],
    ["/pengaturan", "pengaturan.jpg"],
  ];
  for (const [urlPath, file] of siswaShots) {
    await shoot(BASE + urlPath, file, { cookies: siswa });
  }

  // teacher role pages
  const guruShots = [
    ["/dashboard/guru", "dash-guru.jpg"],
    ["/guru/kelas", "guru-kelas.jpg"],
    ["/guru/kelas/seed-kelas-history-heroes", "guru-kelas-detail.jpg"],
    ["/guru/kelas/seed-kelas-history-heroes/kuis/seed-kuis-history-heroes", "guru-kuis.jpg"],
    ["/guru/bank-soal", "guru-banksoal.jpg"],
    ["/guru/siswa", "guru-siswa.jpg"],
    ["/guru/analitik", "guru-analitik.jpg"],
  ];
  for (const [urlPath, file] of guruShots) {
    await shoot(BASE + urlPath, file, { cookies: guru });
  }

  // admin role pages
  const adminShots = [
    ["/dashboard/admin", "dash-admin.jpg"],
    ["/admin/pengguna", "admin-pengguna.jpg"],
    ["/admin/toko", "admin-toko.jpg"],
    ["/admin/lencana", "admin-lencana.jpg"],
    ["/admin/analitik", "admin-analitik.jpg"],
    ["/admin/homepage", "admin-homepage.jpg"],
  ];
  for (const [urlPath, file] of adminShots) {
    await shoot(BASE + urlPath, file, { cookies: admin });
  }

  const files = readdirSync(OUT).filter((f) => f.endsWith(".jpg")).sort();
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${files.length} screenshots in ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
