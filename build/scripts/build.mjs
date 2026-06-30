// ════════════════════════════════════════════════════════════════
//  GLINT — SÜRÜM SENKRONU + MINIFY
//  Konum:  build/scripts/build.mjs
//  Çıktı:  build/dist/  (derlenen .min.js / .min.css buraya gelir)
//  Sürüm:  build/version.js  (TEK KAYNAK)
//
//  Çalıştır:  node build/scripts/build.mjs   ·   build\minify.cmd
//  Gereksinim: esbuild (npx ile otomatik; veya `npm i -g esbuild`).
// ════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url)); // build/scripts/
const BUILD = join(__dirname, "..");                        // build/
const ROOT = join(BUILD, "..");                             // glint-ui-library/
const DIST = join(BUILD, "dist");                           // build/dist/
const VERSION = require(join(BUILD, "version.js"));

console.log("Glint build · sürüm " + VERSION + "\n");

// ── 1) Sürümü kaynak JS'e yaz (tek kaynak → Glint.version) ──
const inputJs = join(ROOT, "glint-input-library", "glint-input.js");
let js = readFileSync(inputJs, "utf8");
const verRe = /Glint\.version\s*=\s*"[^"]*";/;
if (!verRe.test(js)) { console.error("HATA: Glint.version satırı bulunamadı"); process.exit(1); }
js = js.replace(verRe, `Glint.version = "${VERSION}";`);
writeFileSync(inputJs, js);
console.log("✓ Glint.version = \"" + VERSION + "\"  (glint-input.js)");
console.log("  (HTML footer'ları runtime'da Glint.version okur → otomatik güncel)\n");

// ── 2) Minify (esbuild) → build/dist/, sürümlü ad + banner ──
const targets = [
  { src: "glint-input-library/glint-input.js",  pkg: "glint-input", ext: "js" },
  { src: "glint-input-library/glint-input.css", pkg: "glint-input", ext: "css" },
  { src: "glint-toast-library/glint-toast.js",  pkg: "glint-toast", ext: "js" },
  { src: "glint-toast-library/glint-toast.css", pkg: "glint-toast", ext: "css" },
];

let esbuildOk = true;
try { execSync("npx --no-install esbuild --version", { stdio: "pipe" }); }
catch (_) { esbuildOk = false; }
if (!esbuildOk) {
  console.error("⚠ esbuild bulunamadı. Kur:  npm i -g esbuild   (veya `npx esbuild` için ağ).");
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });
console.log("Minify → " + DIST + "\n");
for (const t of targets) {
  const srcAbs = join(ROOT, t.src);
  if (!existsSync(srcAbs)) { console.error("  ⚠ atlandı (yok): " + t.src); continue; }
  const outName = `${t.pkg}-${VERSION}.min.${t.ext}`;
  const outAbs = join(DIST, outName);
  execSync(`npx --no-install esbuild ${JSON.stringify(srcAbs)} --minify --outfile=${JSON.stringify(outAbs)}`, { stdio: "pipe" });
  const banner = `/*! Glint UI Kit v${VERSION} · ${outName} · saf vanilla, sıfır bağımlılık */`;
  const min = readFileSync(outAbs, "utf8");
  writeFileSync(outAbs, banner + "\n" + min);
  const srcKB = (readFileSync(srcAbs).length / 1024).toFixed(1);
  const minKB = (readFileSync(outAbs).length / 1024).toFixed(1);
  console.log(`  ✓ ${outName.padEnd(30)} ${srcKB} KB → ${minKB} KB`);
}
console.log("\nBitti. Derlenenler: " + DIST);
