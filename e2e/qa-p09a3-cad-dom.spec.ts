import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertNoSupabaseContact, assertSealed, sealNetwork } from "./fixtures/qa-p09a2-seal";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R3 — the C3 corrections IN THE RENDERED DOM.

   Round 2 established the 63-route sweep; this file does not repeat it. It
   reads the five pages C3 actually changed and asks four questions of the
   painted text, not of the source:

     1. Does any sentence OFFER a CAD format `validateCadFile()` refuses?
        A format may be NAMED in order to be refused — that is what keeps the
        six chatbot phrasings landing on a true answer — so the test is the
        offer VERB, not the token.
     2. Does the derived list appear where it should, in both its prose and
        its extension form?
     3. Do the two lists on the DFM page still contradict each other? That
        contradiction was found in the DOM in round 2 and fixed by `b3ae3c7`;
        it can only be re-checked in the DOM.
     4. Are the carried claims gone from the painted page — D3, F1, F2a, F2b,
        F3, and F4's column — and does every comparison table still render as
        many header cells as its rows have data cells?

   WHERE THE OUTPUT GOES — corrected in 09a-C4. This file used to say it did
   not repeat the round-2 sweep spec's defect because it wrote into its OWN
   round's directory rather than an earlier one. That distinction is not the
   defect. `reports/qa/phase-09a-r3/**` is COMMITTED EVIDENCE the moment it is
   committed, and this spec rewrote `dom-cad-*.json` and `dom-tables-*.json`
   on every run — so running it again as a required regression check, which
   09a-C4 did, destroyed the record of the round that produced it. The
   overwrite was font-request ordering only that time; nothing guarantees the
   next one is.

   Evidence is a record of what was true on a date, so writing it is now an
   explicit act: `QA_P09A3_WRITE_EVIDENCE=1` refreshes the committed artefact
   on purpose. Every ordinary run drops its output in `test-results/`, which is
   gitignored, and both tests echo the path they wrote, so a regression run is
   still fully inspectable and cannot destroy anything. See `writeEvidence`.

   Read-only. The network is sealed and the seal is proved with a live canary
   before any page is read. No form is submitted and no upload control is
   touched.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Writes one artefact, to scratch unless the committed record is asked for.
 *
 * 09a-C4. Both call sites went through `reports/qa/phase-09a-r3/`
 * unconditionally. One helper now owns the decision, so a third write added
 * later cannot quietly reintroduce the overwrite.
 */
function writeEvidence(name: string, payload: unknown): void {
  const committed = process.env.QA_P09A3_WRITE_EVIDENCE === "1";
  const outDir = committed
    ? path.join(process.cwd(), "reports", "qa", "phase-09a-r3")
    : path.join(process.cwd(), "test-results", "qa-p09a3-cad-dom");
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, name);
  writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `P09A3_JSON=${path.relative(process.cwd(), outFile).replace(/\\/g, "/")}` +
      `${committed ? " (committed evidence, QA_P09A3_WRITE_EVIDENCE=1)" : " (scratch)"}`,
  );
}

/** `src/utils/cadUpload.ts` — the authority, transcribed for the assertion. */
const ACCEPTED = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"];
const PROSE_LIST = "STEP, STP, STL, OBJ, IGES, IGS ve 3MF";
const EXT_LIST = ".step, .stp, .stl, .obj, .iges, .igs, .3mf";

/** Formats the uploader refuses. Superset of the gate's vocabulary. */
const REJECTED = [
  "parasolid", "x_t", "x_b", "sldprt", "sldasm", "solidworks", "catpart", "catproduct",
  "catia", "dwg", "dxf", "ipt", "iam", "inventor", "creo", "rhino", "3dm", "f3d",
  "acis", "jt", "pdf", "prt", "nx", "mastercam",
];
const REJECTED_TOKEN = new RegExp(`(?<![A-Za-z0-9_])\\.?(?:${REJECTED.join("|")})(?![A-Za-z0-9_])`, "gi");

/** The verb that turns naming a format into OFFERING it. Turkish, folded. */
const OFFER_VERB =
  /kabul\s+ed(?:iyoruz|iyor|er|ilir|ilen|ilmekte|ebiliyoruz|iliyor)|destekl(?:iyoruz|iyor|enen|ediğimiz|emekteyiz|enir)|işleyebiliyoruz|işleyebiliriz|doğrudan\s+işl|yükleyebilirsiniz|yükleyebileceğiniz|yüklenebilir|yükleyebiliyorsunuz|gönderebilirsiniz/i;

/** Sentence around an index, bounded by terminal punctuation or a line break. */
function sentenceAt(text: string, index: number): string {
  let start = 0;
  for (const p of [".", "!", "?", "\n", "—", "•"]) {
    const k = text.lastIndexOf(p, index);
    if (k + 1 > start) start = k + 1;
  }
  let end = text.length;
  for (const p of [".", "!", "?", "\n"]) {
    const k = text.indexOf(p, index);
    if (k !== -1 && k < end) end = k;
  }
  return text.slice(start, Math.min(end + 1, text.length)).trim();
}

/** Claims C3 removed. Each must be absent from the painted page it lived on. */
const CARRIED: { route: string; id: string; gone: RegExp }[] = [
  { route: "/kabiliyetler/tasarim-rehberi-dfm", id: "D3 free DFM (:1965)", gone: /ücretsiz|bedelsiz|ilk\s+DFM\s+değerlendirmesi\s+ücret/iu },
  { route: "/hizmetler/cnc-frezeleme", id: "F1 %40 daha hızlı (:117)", gone: /%\s?40\s*daha\s*hızlı/iu },
  { route: "/hizmetler/cnc-tornalama", id: "F1b %50 setup tasarrufu (:208)", gone: /%\s?50\s*setup/iu },
  { route: "/kabiliyetler/tasarim-rehberi-dfm", id: "F2b Ortalama %30-50 (:1945)", gone: /Maliyet\s+Tasarrufu[\s\S]{0,40}?%\s?30\s?-\s?50|Ortalama\s+%\s?30\s?-\s?50/iu },
  { route: "/endustriyel/prototip-uretim", id: "F3 EOS M290 (:2103 and :2131)", gone: /EOS\s?M\s?290/i },
  { route: "/hizmetler/enjeksiyon-kalibi", id: "F4 Parça/Saat column (:517)", gone: /Parça\s*\/\s*Saat/iu },
];

/* F2a (`:1922`) and D3b (`:81`) live in `metaDescription`, and the source
   comments say they shipped "into search results and social cards". MEASURED,
   THEY DID NOT: `ServiceDetail.tsx:193` passes `page.description` — not
   `page.metaDescription` — to `usePageMeta`, and `:284` passes it to
   `JsonLdSchema` too. No component in `src/**` reads `metaDescription` on a
   service page, so the field never reaches a `<meta>` tag. Its only
   publication surface was the JS chunk, which is why those two are proved
   gone by `scripts/qa-probes/p09a3-dist-grep.mjs` over `dist/` instead.

   The assertion below PINS that render path, so the day someone wires
   `metaDescription` up, this test says so and the two claims get a DOM check. */
const META_IS_DESCRIPTION_NOT_METADESCRIPTION: { route: string; is: string }[] = [
  {
    route: "/hizmetler/cnc-frezeleme",
    is: "5 eksenli CNC frezeleme merkezlerimiz ile karmaşık geometrileri yüksek hassasiyetle işliyoruz.",
  },
  {
    route: "/kabiliyetler/tasarim-rehberi-dfm",
    is: "DFM/DFA analizi ile tasarımlarınızı üretilebilirlik açısından optimize ediyoruz.",
  },
];

const CAD_ROUTES = [
  "/hizmetler/cnc-frezeleme",
  "/kabiliyetler/tasarim-rehberi-dfm",
  "/sss",
  "/hizmetler/cnc-tornalama",
  "/hizmetler/enjeksiyon-kalibi",
  "/endustriyel/prototip-uretim",
];

type Offer = { route: string; token: string; sentence: string };

test.describe("09a-R3 — the C3 corrections in the rendered DOM", () => {
  test("no page offers a CAD format the validator refuses, and the carried claims are gone", async ({ page }) => {
    test.setTimeout(180_000);
    const seal = await sealNetwork(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await assertSealed(page, seal);

    const offers: Offer[] = [];
    const refusalMentions: Offer[] = [];
    const pageText: Record<string, string> = {};
    const metaText: Record<string, string> = {};

    for (const route of CAD_ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1_200);
      /* The FAQ is native `<details>` (ServiceDetail.tsx:514, SSS.tsx:231) and
         a closed one contributes nothing to `innerText`. Opening it is an
         attribute, not a click: clicking the `<summary>` as well toggles it
         straight back shut, which is how the first pass of this test read a
         `/sss` with no answers in it at all. */
      await page.evaluate(() => {
        for (const d of document.querySelectorAll("details:not([open])")) d.setAttribute("open", "");
      });
      await page.waitForTimeout(300);
      const text = await page.evaluate(() => document.body.innerText);
      pageText[route] = text;
      metaText[route] = await page.evaluate(
        () => document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      );

      REJECTED_TOKEN.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = REJECTED_TOKEN.exec(text)) !== null) {
        const s = sentenceAt(text, m.index);
        (OFFER_VERB.test(s) ? offers : refusalMentions).push({ route, token: m[0], sentence: s });
      }
    }

    /* 1 — the derived list is painted where the source says it is. */
    expect(pageText["/sss"], "/sss must render the derived prose list").toContain(PROSE_LIST);
    expect(pageText["/hizmetler/cnc-frezeleme"], "the CNC milling FAQ must render the derived extension list")
      .toContain(EXT_LIST);
    expect(pageText["/kabiliyetler/tasarim-rehberi-dfm"], "the DFM FAQ must render the derived extension list")
      .toContain(EXT_LIST);
    expect(pageText["/kabiliyetler/tasarim-rehberi-dfm"], 'the DFM "Desteklenen CAD" row must render the derived prose list')
      .toContain(PROSE_LIST);

    /* 2 — every accepted extension reaches the reader on the pages that list. */
    for (const ext of ACCEPTED) {
      expect(pageText["/sss"].toLowerCase(), `/sss must name ${ext}`).toContain(ext);
    }

    /* 3 — nothing offers a refused format. This is the whole class. */
    expect(offers, `a page offers a format validateCadFile() refuses:\n${JSON.stringify(offers, null, 2)}`)
      .toEqual([]);

    /* 4 — the refusal route is still there, or the six phrasings fall through. */
    expect(pageText["/hizmetler/cnc-frezeleme"], "the refusal must still name the formats and give an email route")
      .toContain("sales@mastechnic.com");
    expect(pageText["/hizmetler/cnc-frezeleme"]).toMatch(/SolidWorks[\s\S]{0,40}CATIA[\s\S]{0,40}NX/i);

    /* 5 — carried claims, in the body. */
    const stillPresent: string[] = [];
    for (const c of CARRIED) {
      const t = pageText[c.route];
      const hit = t.match(c.gone);
      if (hit) stillPresent.push(`${c.id} on ${c.route}: ${JSON.stringify(sentenceAt(t, hit.index ?? 0))}`);
    }
    expect(stillPresent, `a removed claim is still rendered:\n${stillPresent.join("\n")}`).toEqual([]);

    /* 6 — the render path for the two metaDescription claims. See the comment
       on META_IS_DESCRIPTION_NOT_METADESCRIPTION. */
    for (const m of META_IS_DESCRIPTION_NOT_METADESCRIPTION) {
      expect(
        metaText[m.route],
        `${m.route} renders page.description as its meta description, not page.metaDescription — ` +
          "if this ever changes, F2a and D3b need a DOM check they do not currently have",
      ).toContain(m.is);
    }

    writeEvidence(`dom-cad-${test.info().project.name}.json`, {
      offers,
      refusalMentions,
      metaText,
      blocked: seal.blocked,
      passed: seal.passed,
    });
    assertNoSupabaseContact(seal);
  });

  test("every comparison table paints as many header cells as its rows have cells", async ({ page }) => {
    test.setTimeout(180_000);
    const seal = await sealNetwork(page);
    await page.goto("/hizmetler/enjeksiyon-kalibi", { waitUntil: "domcontentloaded" });
    await assertSealed(page, seal);

    const routes = ["/hizmetler/enjeksiyon-kalibi", "/hizmetler/cnc-frezeleme", "/hizmetler/cnc-tornalama", "/kabiliyetler/tasarim-rehberi-dfm"];
    const tables: { route: string; caption: string; headers: string[]; rowWidths: number[] }[] = [];
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1_200);
      const found = await page.evaluate(() =>
        [...document.querySelectorAll("table")].map((t) => ({
          caption: t.getAttribute("aria-label") ?? "",
          headers: [...t.querySelectorAll("thead th")].map((h) => (h.textContent ?? "").trim()),
          rowWidths: [...t.querySelectorAll("tbody tr")].map((r) => r.children.length),
        })),
      );
      for (const f of found) tables.push({ route, ...f });
    }

    const mismatched = tables.filter((t) => t.rowWidths.some((w) => w !== t.headers.length));
    expect(mismatched, `a table paints a header row of a different width from its body rows:\n${JSON.stringify(mismatched, null, 2)}`)
      .toEqual([]);

    const withParcaSaat = tables.filter((t) => t.headers.some((h) => /Parça\s*\/\s*Saat/iu.test(h)));
    expect(withParcaSaat, "the parts-per-hour column must not be painted anywhere").toEqual([]);

    const cavity = tables.find((t) => /Kavite Sayısı/iu.test(t.caption));
    expect(cavity, "the cavity table must still render").toBeTruthy();
    expect(cavity?.headers, "the cycle-rate column stays; only the parts-per-hour column went").toEqual([
      "Kavite", "Çevrim/Saat", "Birim Maliyet", "Kalıp Maliyeti", "Önerilen Hacim",
    ]);

    writeEvidence(`dom-tables-${test.info().project.name}.json`, tables);
    assertNoSupabaseContact(seal);
  });
});
