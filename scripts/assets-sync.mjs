/**
 * assets:sync — src/assets içindeki ham PNG/JPG'leri siteye uygun WebP'ye çevirir,
 * import'ları yeni uzantıya taşır ve asılları image-source/ altına arşivler.
 *
 * Neden var: görseller Midjourney'den 2944x1648 / 2048x2048 PNG olarak geliyor
 * (dosya başına ~6 MB). Bu boyut sitede hiçbir yerde kullanılmıyor; hem derlemeyi
 * yavaşlatıyor hem de yükü şişiriyor. Ayrıca yeni dosyalar .png uzantısıyla geldiği
 * için .jpg'ye bakan import'lar kırılıyor ve build patlıyor.
 *
 * Yeni paket kurmaz — dönüştürme, projede zaten kurulu olan Playwright'ın
 * headless Chromium'undaki canvas ile yapılır (CLAUDE.md yeni bağımlılığı yasaklıyor).
 *
 * Kullanım:
 *   npm run assets:sync            değişiklikleri uygula
 *   npm run assets:sync -- --dry   sadece ne yapacağını yazdır
 */
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const VARLIK_DIZINI = "src/assets";
const ARSIV_DIZINI = "image-source";
const KAYNAK_UZANTILARI = [".png", ".jpg", ".jpeg"];
const KOD_UZANTILARI = [".ts", ".tsx"];
const KALITE = 0.82;

/**
 * Hedef uzun kenar. Görselin en-boy oranına göre seçilir; rehberdeki iki üretim
 * oranına karşılık gelir (--ar 16:9 hero, --ar 1:1 kart).
 * ASLA büyütme yapılmaz: hedef, kaynağın kendi boyutuyla sınırlanır.
 */
function hedefUzunKenar(genislik, yukseklik) {
  const oran = genislik / yukseklik;
  // 16:9 ve daha geniş: tam genişlikte hero olarak kullanılıyor.
  if (oran > 1.5) return 1600;
  // Kareye yakın: sektör/proje kartları, en fazla ~350px CSS genişlikte render ediliyor.
  if (oran > 0.8) return 1200;
  // Dikey: nadir, kart içi görsel.
  return 1200;
}

const kuruProva = process.argv.includes("--dry");

function kodDosyalari(dizin, biriktir = []) {
  for (const ad of readdirSync(dizin, { withFileTypes: true })) {
    if (ad.name === "node_modules" || ad.name.startsWith(".")) continue;
    const yol = join(dizin, ad.name);
    if (ad.isDirectory()) kodDosyalari(yol, biriktir);
    else if (KOD_UZANTILARI.includes(extname(ad.name))) biriktir.push(yol);
  }
  return biriktir;
}

function kb(bayt) {
  return Math.round(bayt / 1024);
}

const kaynaklar = readdirSync(VARLIK_DIZINI)
  .filter((ad) => KAYNAK_UZANTILARI.includes(extname(ad).toLowerCase()))
  .sort();

if (kaynaklar.length === 0) {
  console.log("Çevrilecek ham görsel yok — src/assets zaten WebP.");
  process.exit(0);
}

console.log(`${kaynaklar.length} ham görsel bulundu${kuruProva ? " (kuru prova)" : ""}.\n`);

// Playwright'ın kendi Chromium'u indirilmemiş olabilir; o durumda sistemdeki
// Chrome/Edge'e düşülür. Böylece betik "npx playwright install" gerektirmez.
function tarayiciYolu() {
  const adaylar = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google/Chrome/Application/chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft/Edge/Application/msedge.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return adaylar.find((yol) => existsSync(yol));
}

const sistemTarayici = tarayiciYolu();
let tarayici;
try {
  tarayici = await chromium.launch();
} catch (hata) {
  if (!sistemTarayici) throw hata;
  tarayici = await chromium.launch({ executablePath: sistemTarayici });
}
const sayfa = await (await tarayici.newContext()).newPage();

const donusenler = [];
let oncekiToplam = 0;
let sonrakiToplam = 0;

try {
  for (const ad of kaynaklar) {
    const kaynakYol = join(VARLIK_DIZINI, ad);
    const kok = ad.slice(0, -extname(ad).length);
    const hedefYol = join(VARLIK_DIZINI, `${kok}.webp`);
    const uzanti = extname(ad).toLowerCase();
    const mime = uzanti === ".png" ? "image/png" : "image/jpeg";
    const veri = readFileSync(kaynakYol).toString("base64");

    const sonuc = await sayfa.evaluate(
      async ({ veri, mime, kalite }) => {
        const img = new Image();
        img.src = `data:${mime};base64,${veri}`;
        await img.decode();
        const g = img.naturalWidth;
        const y = img.naturalHeight;
        const oran = g / y;
        const uzunKenar = oran > 1.5 ? 1600 : 1200;
        const hedefUzun = Math.min(uzunKenar, Math.max(g, y));
        const olcek = hedefUzun / Math.max(g, y);
        const hg = Math.round(g * olcek);
        const hy = Math.round(y * olcek);

        // Kademeli küçültme: tek adımda 2944 -> 1600 keskinlik kaybettiriyor.
        let kaynak = img;
        let mevcut = g;
        while (mevcut / 2 >= hg) {
          const yeniG = Math.round(mevcut / 2);
          const yeniY = Math.round((yeniG / g) * y);
          const ara = document.createElement("canvas");
          ara.width = yeniG;
          ara.height = yeniY;
          ara.getContext("2d").drawImage(kaynak, 0, 0, yeniG, yeniY);
          kaynak = ara;
          mevcut = yeniG;
        }

        const tuval = document.createElement("canvas");
        tuval.width = hg;
        tuval.height = hy;
        const ctx = tuval.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(kaynak, 0, 0, hg, hy);
        return { veri: tuval.toDataURL("image/webp", kalite).split(",")[1], asil: `${g}x${y}`, yeni: `${hg}x${hy}` };
      },
      { veri, mime, kalite: KALITE },
    );

    const oncekiBoyut = statSync(kaynakYol).size;
    oncekiToplam += oncekiBoyut;
    const tampon = Buffer.from(sonuc.veri, "base64");
    sonrakiToplam += tampon.length;

    if (!kuruProva) writeFileSync(hedefYol, tampon);
    donusenler.push({ ad, kok, uzanti, kaynakYol, asil: sonuc.asil, yeni: sonuc.yeni, oncekiBoyut, sonrakiBoyut: tampon.length });
    console.log(
      `  ${ad.padEnd(36)} ${sonuc.asil.padEnd(11)} ${String(kb(oncekiBoyut)).padStart(6)} KB` +
        `  ->  ${sonuc.yeni.padEnd(11)} ${String(kb(tampon.length)).padStart(5)} KB`,
    );
  }
} finally {
  await tarayici.close();
}

// Import'ları yeni uzantıya taşı. Hem doğrudan .png/.jpg'ye bakanları hem de
// artık var olmayan bir uzantıya (ör. silinmiş .jpg) bakanları aynı köke bağlar.
const kokler = new Map(donusenler.map((d) => [d.kok, d]));
let dokunulanDosya = 0;
let degisenImport = 0;

for (const dosya of kodDosyalari("src")) {
  const onceki = readFileSync(dosya, "utf8");
  const sonraki = onceki.replace(/(@\/assets\/)([A-Za-z0-9._À-ɏ-]+?)\.(png|jpe?g|webp)\b/g, (tam, on, kok, uz) => {
    if (!kokler.has(kok)) return tam;
    if (uz === "webp") return tam;
    degisenImport += 1;
    return `${on}${kok}.webp`;
  });
  if (sonraki !== onceki) {
    if (!kuruProva) writeFileSync(dosya, sonraki);
    dokunulanDosya += 1;
  }
}

// Asılları arşivle: silinmiyorlar, sadece derlemeye girmedikleri yere taşınıyorlar.
if (!kuruProva) {
  if (!existsSync(ARSIV_DIZINI)) mkdirSync(ARSIV_DIZINI, { recursive: true });
  for (const d of donusenler) renameSync(d.kaynakYol, join(ARSIV_DIZINI, d.ad));
}

const yuzde = Math.round((1 - sonrakiToplam / oncekiToplam) * 100);
console.log(
  `\n${donusenler.length} görsel çevrildi: ${Math.round(oncekiToplam / 1024 / 1024)} MB -> ` +
    `${Math.round((sonrakiToplam / 1024 / 1024) * 10) / 10} MB (%${yuzde} küçülme)`,
);
console.log(`${degisenImport} import güncellendi (${dokunulanDosya} dosya).`);
console.log(kuruProva ? "Kuru prova — hiçbir dosya değişmedi." : `Asıllar ${ARSIV_DIZINI}/ altına taşındı.`);
