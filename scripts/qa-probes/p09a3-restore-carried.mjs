/* QA 09a-R3 — the gate in the OTHER direction.
 *
 * Restore each carried claim, one at a time, into the file it was removed from
 * and assert the gate FAILS on it. Then restore the file byte-for-byte and
 * assert `git diff --quiet` before the next one. Gate-only: no tsc, so this is
 * seconds per case. Nothing mutated is ever committed.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "reports/qa/phase-09a-r3");
mkdirSync(OUT, { recursive: true });

const SP = "src/data/servicePages.ts";
const SSS = "src/pages/SSS.tsx";

const sh = (cmd) => {
  try {
    return { code: 0, out: execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const requireClean = (label) => {
  if (sh("git diff --quiet").code !== 0) {
    throw new Error(`ABORT: dirty tree at ${label}\n${sh("git status --porcelain").out}`);
  }
};
/* The tree checks out with CRLF on this machine, so a multi-line anchor written
   with LF finds nothing. Try both, and still insist on exactly one match. */
const sub = (src, from, to) => {
  const crlf = src.includes("\r\n");
  const f = crlf ? from.replace(/\r?\n/g, "\r\n") : from;
  const t = crlf ? to.replace(/\r?\n/g, "\r\n") : to;
  const n = src.split(f).length - 1;
  if (n !== 1) throw new Error(`anchor appears ${n} times, expected 1:\n${from.slice(0, 100)}`);
  return src.replace(f, t);
};

/** id, file, the CURRENT text, and the PRE-C3 text that must fire. */
const CASES = [
  {
    id: "D1-faq-cnc-frezeleme",
    file: SP,
    now: "        answer: `Teklif akışındaki yükleyici şu uzantıları doğrular: ${CAD_UPLOAD_EXTENSIONS} — listede olmayan bir uzantı yükleme adımından geçmez. Yerel CAD kayıtlarınızı (SolidWorks .sldprt, CATIA .catpart, NX .prt) veya PDF/DWG teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz.`,",
    was: '        answer: "STEP, IGES, Parasolid, SolidWorks (.sldprt), CATIA (.catpart), NX (.prt) ve PDF/DWG teknik çizim formatlarını destekliyoruz.",',
    expect: "cad-format-list-not-derived",
  },
  {
    id: "D1b-body-prose-same-page",
    file: SP,
    now: "; teklif akışındaki yükleyici ${CAD_UPLOAD_FORMATS} uzantılarını doğrular, listede olmayan yerel CAD kayıtlarını ve teknik resimleri e-posta ile alıyoruz.`,",
    was: ", STEP, IGES, SolidWorks, CATIA ve NX formatlarını doğrudan işleyebiliyoruz.`,",
    expect: "cad-format-list-not-derived",
  },
  {
    id: "D1c-label-value-dfm",
    file: SP,
    now: '      { label: "Desteklenen CAD", value: CAD_UPLOAD_FORMATS },',
    was: '      { label: "Desteklenen CAD", value: "STEP, IGES, CATIA, NX, SW" },',
    expect: "cad-format-list-not-derived",
  },
  {
    id: "D2-dfm-faq-correct-but-handwritten",
    file: SP,
    now: "        answer: `Teklif akışındaki yükleyici şu uzantıları doğrular: ${CAD_UPLOAD_EXTENSIONS} — listede olmayan bir uzantı yükleme adımından geçmez. Yerel CAD kaydınızı veya ölçülendirilmiş teknik resminizi sales@mastechnic.com adresine iletirseniz teklif için değerlendiririz.`,",
    was: '        answer: "Teklif akışında STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını doğrudan yükleyebilirsiniz.",',
    expect: "cad-format-list-not-derived",
  },
  {
    id: "D2b-SSS-general-faq",
    file: SSS,
    now: "    answer: `Teklif akışındaki yükleyici ${CAD_UPLOAD_FORMATS} dosyalarını kabul eder. Ölçülendirilmiş 2B teknik resminizi veya listede olmayan bir formatı e-posta ile iletebilirsiniz.`,",
    was: '    answer: "Teklif akışındaki yükleyici STEP, STP, STL, OBJ, IGES, IGS ve 3MF dosyalarını kabul eder.",',
    expect: "cad-format-list-not-derived",
  },
  /* The FOUR EXTRA sites b3ae3c7 fixed on the DFM page, which the QA packet
     does not name. Restored to ask a different question: is anything watching
     them? A removal no rule protects is one commit from coming back. */
  {
    id: "D4a-yaygin-cad-formatlari",
    file: SP,
    now: '      "Analiz, teklif akışına yüklenen katı model üzerinden yürütülür; modelle birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır.',
    was: '      "Yaygın CAD formatlarını doğrudan işleyebiliyoruz; katı model ile birlikte ölçülendirilmiş teknik resim gönderilmesi analiz süresini kısaltır.',
    expect: null,
  },
  {
    id: "D4b-cadcam-entegrasyonu-inventory",
    file: SP,
    now: '      "CAD/CAM Entegrasyonu — katı model, takım yolu ve revizyon tek akışta",',
    was: '      "CAD/CAM Entegrasyonu — CATIA, SolidWorks, NX, Mastercam",',
    expect: null,
  },
  {
    id: "D4c-catia-solidworks-nx-entegre",
    file: SP,
    now: '      "Müşteri modeli üzerinden çalışma: gelen katı model revize edilip geri gönderilir",',
    was: '      "CATIA, SolidWorks, NX entegre çalışma",',
    expect: null,
  },
  {
    id: "D4d-metaDescription-software-inventory",
    file: SP,
    now: '      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, üretilebilirlik incelemesi, parça bazında maliyet kaldıraçları.",',
    was: '      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, CATIA/SolidWorks/NX entegrasyonu, parça bazında maliyet kaldıraçları.",',
    expect: null,
  },
  {
    id: "D3-free-dfm-faq",
    file: SP,
    now: '      { question: "DFM analizi ücreti var mı?", answer: "Yayımlanan sabit bir DFM ücret tarifemiz yok.',
    was: '      { question: "DFM analizi ücreti var mı?", answer: "İlk DFM değerlendirmesi ücretsizdir.',
    expect: "free-of-charge-commitment",
  },
  {
    id: "D3b-free-dfm-metaDescription",
    file: SP,
    now: '      "3, 4 ve 5 eksenli CNC frezeleme ile ±0.01 mm standart tolerans aralığında üretim. Alüminyum, titanyum ve çelik işleme, teklifle birlikte üretilebilirlik incelemesi.",',
    was: '      "3, 4 ve 5 eksenli CNC frezeleme ile ±0.01 mm standart tolerans aralığında üretim. Alüminyum, titanyum ve çelik işleme, ücretsiz DFM analizi.",',
    expect: "free-of-charge-commitment",
  },
  {
    id: "F1-hsm-40-percent",
    file: SP,
    now: '      "HSM stratejisiyle ince cidarlı parçalarda düşük kesme kuvveti ve iyi yüzey kalitesi",',
    was: '      "HSM ile %40 daha hızlı üretim ve üstün yüzey kalitesi",',
    expect: "delivery-or-quality-rate",
  },
  {
    id: "F1b-50-percent-setup",
    file: SP,
    now: '      "Çift mil ile parçanın arka yüzü ayrı bir bağlama gerektirmeden tamamlanır",',
    was: '      "Çift milli üretimle %50 setup tasarrufu",',
    expect: "delivery-or-quality-rate",
  },
  {
    id: "F2a-70-percent-metaDescription",
    file: SP,
    now: '      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, üretilebilirlik incelemesi, parça bazında maliyet kaldıraçları.",',
    was: '      "Design for Manufacturing (DFM/DFA) analizi ile tasarımlarınızı optimize edin. CNC ve enjeksiyon DFM kuralları, CATIA/SolidWorks/NX entegrasyonu, %70\'e kadar maliyet tasarrufu.",',
    expect: "delivery-or-quality-rate",
  },
  {
    id: "F2b-average-30-50",
    file: SP,
    now: '      { label: "Maliyet Kaldıraçları", value: "Parça sayısı, bağlama, tolerans" },',
    was: '      { label: "Maliyet Tasarrufu", value: "Ortalama %30-50" },',
    expect: "delivery-or-quality-rate",
  },
  {
    id: "F3-eos-m290-feature",
    file: SP,
    now: '      "Metal 3D Baskı (DMLS) — alüminyum, paslanmaz çelik ve titanyum",',
    was: '      "Metal 3D Baskı (DMLS) — EOS M290 ile Al, SS, Ti",',
    expect: "machine-inventory",
  },
  {
    id: "F3b-eos-m290-faq-chat-pool",
    file: SP,
    now: '      { question: "Metal 3D baskı yapabiliyor musunuz?", answer: "Evet. DMLS (doğrudan metal lazer sinterleme) ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapıyoruz; parça ölçüsü ve ulaşılabilir tolerans teknik incelemede değerlendirilir." },',
    was: '      { question: "Metal 3D baskı yapabiliyor musunuz?", answer: "Evet, EOS M290 DMLS sistemimiz ile alüminyum, paslanmaz çelik ve titanyum malzemelerde metal 3D baskı yapabiliyoruz." },',
    expect: "machine-inventory",
  },
  {
    id: "F4-parca-saat-column",
    file: SP,
    now: `        headers: ["Kavite", "Çevrim/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],
        rows: [
          ["Tek kavite", "60-120", "$$$", "$", "1-10.000 adet"],
          ["2 kavite", "60-120", "$$", "1.5×", "10.000-50.000"],
          ["4 kavite", "50-100", "$$", "2×", "50.000-200.000"],
          ["8 kavite", "40-80", "$", "3×", "200.000-500.000"],
          ["16+ kavite", "30-60", "$", "4-5×", "500.000+"],
        ],`,
    was: `        headers: ["Kavite", "Çevrim/Saat", "Parça/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],
        rows: [
          ["Tek kavite", "60-120", "60-120", "$$$", "$", "1-10.000 adet"],
          ["2 kavite", "60-120", "120-240", "$$", "1.5×", "10.000-50.000"],
          ["4 kavite", "50-100", "200-400", "$$", "2×", "50.000-200.000"],
          ["8 kavite", "40-80", "320-640", "$", "3×", "200.000-500.000"],
          ["16+ kavite", "30-60", "480-960+", "$", "4-5×", "500.000+"],
        ],`,
    expect: "periodic-volume-disclosure",
  },
  {
    /* F4's counter-question: the column the Coder chose to KEEP must stay
       silent even though `saat` is now in the period list. Restoring only the
       cycle-rate header — no `Parça/Saat` — must leave the gate PASSING. */
    id: "F4-control-cevrim-saat-alone-stays-silent",
    file: SP,
    now: '        headers: ["Kavite", "Çevrim/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],',
    was: '        headers: ["Kavite", "Çevrim/Saat", "Çevrim/Vardiya", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim"],',
    expectSilent: true,
  },
];

const only = process.argv.slice(2);
const selected = only.length === 0 ? CASES : CASES.filter((c) => only.some((p) => c.id.startsWith(p)));
if (selected.length === 0) throw new Error(`no case matches ${only.join(",")}`);
const prior = (() => {
  try {
    return JSON.parse(readFileSync(resolve(OUT, "restore-carried.json"), "utf8"));
  } catch {
    return [];
  }
})();
const results = prior.filter((r) => !selected.some((c) => c.id === r.id));
requireClean("start");

for (const c of selected) {
  const abs = resolve(ROOT, c.file);
  const original = readFileSync(abs, "utf8");
  let rec;
  try {
    writeFileSync(abs, sub(original, c.now, c.was), "utf8");
    const gate = sh("node scripts/claims-gate.mjs");
    const hits = [...gate.out.matchAll(/^\s*(src\/[^\s:]+:\d+):.*$/gm)].map((m) => m[0].trim());
    const ruleIds = [...gate.out.matchAll(/^\s*[·•-]?\s*rule\s+([a-z0-9-]+)/gim)].map((m) => m[1]);
    rec = {
      id: c.id,
      file: c.file,
      restored: c.was.trim().slice(0, 110),
      expectSilent: c.expectSilent === true,
      expectedRule: c.expect ?? null,
      gateExit: gate.code,
      verdict: (gate.out.match(/^(PASS|FAIL).*$/m) || ["(none)"])[0].trim(),
      hits,
      mentionsExpectedRule: c.expect ? gate.out.includes(c.expect) : null,
      ruleIds,
    };
    rec.result = c.expectSilent
      ? gate.code === 0
        ? "ok (correctly silent)"
        : "*** UNEXPECTED FIRE ***"
      : gate.code !== 0
        ? c.expect == null
          ? "fired (no rule was expected)"
          : rec.mentionsExpectedRule
            ? `fired by ${c.expect}`
            : `FIRED, BUT NOT BY ${c.expect}`
        : c.expect == null
          ? "*** UNGATED — restoring it leaves the gate green ***"
          : "*** NOT CAUGHT ***";
  } finally {
    writeFileSync(abs, original, "utf8");
  }
  requireClean(`after ${c.id}`);
  results.push(rec);
  console.log(`${rec.id.padEnd(44)} exit=${rec.gateExit}  ${rec.result}`);
  for (const h of rec.hits) console.log(`      ${h}`);
}

requireClean("end");
writeFileSync(resolve(OUT, "restore-carried.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log("\nworking tree verified clean after every case.");
