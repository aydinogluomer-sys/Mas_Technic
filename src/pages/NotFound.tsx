import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { TFunction } from "i18next";
import { PageShell } from "@/components/shell/PageShell";
import { ShellMetaRow } from "@/components/shell/ShellPrimitives";
import { ShellAction, ShellIndexList } from "@/components/shell/ShellComposition";
import {
  companyLinks,
  navigationItems,
  navigationTargets,
  resourceLinks,
} from "@/components/navigation/ia";

/* ══════════════════════════════════════════════════════════════════════════
   404 — A ROUTE-ERROR SHELL STATE, NOT A THIRD VISUAL LANGUAGE

   WHAT THIS PAGE USED TO BE (`reports/baseline/shell-inventory.md` §4/§5)
     · no header and no footer — a dead end with four hand-picked links;
     · its own light/teal canvas: six animated `hsla(190..210, 80%, 45%)`
       ribbons with a 30px glow shadow, plus a grid overlay, scanlines and a
       vignette, all `position:fixed` over the whole viewport;
     · its own brand mark, duplicating the header's;
     · a 15-second countdown that then set `window.location.href = "/"`.

   PHASE 04 FIXED THE SHELL: the page renders inside `PageShell`, the fixed
   canvas and its three overlay layers are gone, and the auto-redirect is gone
   — an unannounced timer that rewrites `window.location` after 15 seconds
   discards the reader's history position, cannot be paused or extended (WCAG
   2.2.1) and makes the wrong URL unshareable and undebuggable. Phase 04 then
   said, correctly, that the CONTENT belonged to Phase 08 (requirement IDs
   680–687) and left every string exactly as it found it.

   ══════════════════════════════════════════════════════════════════════════
   PHASE 08 — WHAT THE READER GETS NOW

   THE CONCEPT IS THE MEASUREMENT THE SITE IS BUILT ON. A 404 on a drawing
   sheet is not an apology; it is a coordinate that is not on the sheet. The
   status readout states the requested path as a position, and the page's job
   is to put the reader back on a datum. That is the whole brand idea, and it
   costs a mono readout and one sentence rather than an illustration — no
   glow, no gradient, no mascot, no emoji.

   RECOVERY, AND WHY THERE IS NO SEARCH BOX.
   The old page offered four hand-picked destinations — Ana Sayfa,
   Hizmetlerimiz, Teklif Al, SSS — chosen by somebody, in an order nobody can
   defend, covering four of ~90 routes. A reader who mistyped
   `/hizmetler/cnc-frezelme` was offered the home page.

   Two things replace it, and neither is a search field:

     1. NEAREST RECORDS. The requested path is tokenised and scored against
        the real IA (`navigationTargets()`), so `/hizmetler/cnc-frezelme`
        surfaces `/hizmetler/cnc-frezeleme`. A 404 needs a CORRECTION
        affordance, not a query interface, and this one runs over a list the
        app already holds in memory: no index, no request, no dependency.
     2. THE DIRECTORY. Below it, the three route families and the reference
        surfaces, from the same IA — so the page is a way in rather than four
        guesses.

   A global search box was considered and REJECTED on evidence: this project
   has no site-wide search index, and the two searches that do exist
   (`/malzemeler`, `/sss`) are scoped to their own corpora and cannot answer
   "where is the page I was trying to reach". A box that accepts a query and
   can only fail is worse than no box — it spends the reader's attention and
   returns them to the same dead end. Recorded in
   `docs/lean/17-inner-page-composition.md`.

   ══════════════════════════════════════════════════════════════════════════
   THE HTTP 404 (C3, later than this page)

   The host now answers an unknown path with a real 404 status: `vercel.json`
   is generated from the route table and serves the prerendered `404.html`,
   which is this component. `usePageMeta({ noindex: true })` below keeps the
   client-side state out of the index as well.
   ══════════════════════════════════════════════════════════════════════════ */

/** Tokens worth scoring. One- and two-letter fragments match everything. */
function tokenise(path: string): string[] {
  return decodeURIComponent(path)
    .toLocaleLowerCase("tr-TR")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2);
}

/**
 * Nearest real routes to the path the reader asked for.
 *
 * The scoring is deliberately dull: a token present in both paths scores 2, a
 * token that is a prefix of one in the other (`frezelme` → `frezeleme`) scores
 * 1, and a candidate must clear 2 to be shown at all. A clever ranking that
 * confidently offers three wrong answers is worse than an honest empty
 * result — which is why the block disappears entirely when nothing scores.
 */
function nearestRoutes(requested: string, limit = 4): string[] {
  const wanted = tokenise(requested);
  if (wanted.length === 0) return [];

  return navigationTargets()
    .filter((path) => path !== "/" && path !== requested)
    .map((path) => {
      const candidate = tokenise(path);
      const score = wanted.reduce((total, token) => {
        if (candidate.includes(token)) return total + 2;
        if (candidate.some((other) => other.startsWith(token) || token.startsWith(other))) return total + 1;
        return total;
      }, 0);
      return { path, score };
    })
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length)
    .slice(0, limit)
    .map((entry) => entry.path);
}

/** A route's own label, read out of the IA rather than re-titled here. */
function labelFor(path: string, t: TFunction): string {
  for (const family of navigationItems) {
    for (const category of family.children ?? []) {
      if (category.path === path) return `${t(family.label)} · ${t(category.label)}`;
      const link = category.links.find((entry) => entry.path === path);
      if (link) return `${t(family.label)} · ${t(link.label)}`;
    }
  }
  const label = resourceLinks.find((link) => link.path === path)?.label
    ?? companyLinks.find((link) => link.path === path)?.label;
  return label ? t(label) : path;
}

/** The three route families plus the reference surfaces, in IA order. */
const directory = (t: TFunction) => {
  const families = navigationItems.filter((family) => family.children?.length);
  return [
    ...families.map((family) => ({
      to: family.children?.[0]?.path ?? "/",
      title: t(family.label),
      description: (family.children ?? []).map((category) => t(category.label)).join(" · "),
      index: family.index,
    })),
    ...resourceLinks.map((link, offset) => ({
      to: link.path,
      title: t(link.label),
      index: String(families.length + offset + 1).padStart(2, "0"),
    })),
  ];
};

/**
 * `shell={false}` is for the PANEL branch only (`src/App.tsx` `panelRoutes`).
 * `/admin*` and `/musteri-paneli` are out of this run's scope per
 * `USER_INPUTS.md` §N and carry their own chrome; dropping the public
 * navigation and the site footer onto an admin 404 would be this phase
 * reaching into that shell.
 *
 * The body is identical either way — a Phase 04 decision this phase keeps
 * rather than re-argues, and the reason everything below is one flow block
 * instead of a stack of `ShellBand`s: a band needs the master grid that
 * `PageShell layout="band"` publishes, and the bare variant publishes none.
 */
export const NotFound = ({ shell = true }: { shell?: boolean }) => {
  const location = useLocation();
  const requested = location.pathname;
  const suggestions = useMemo(() => nearestRoutes(requested), [requested]);
  const { t } = useTranslation();
  usePageMeta({
    title: t("Sayfa bulunamadı"),
    description: t("İstenen yol bu sitenin sayfa dizininde bir konuma karşılık gelmiyor."),
    noindex: true,
  });

  useEffect(() => {
    console.error("404 Error:", requested);
  }, [requested]);

  /* The off-datum readout. Pointer position is written straight to CSS custom
     properties and two text nodes — never React state — so a pointer move
     costs one style write, not a render. Coarse pointers never get it. */
  const stageRef = useRef<HTMLElement>(null);
  const readX = useRef<HTMLSpanElement>(null);
  const readY = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        stage.style.setProperty("--nf-x", `${x}px`);
        stage.style.setProperty("--nf-y", `${y}px`);
        stage.dataset.tracking = "";
        /* Sheet coordinates in millimetres from datum A (bottom-left), 1px = 0.1mm. */
        if (readX.current) readX.current.textContent = (x / 10).toFixed(3);
        if (readY.current) readY.current.textContent = ((rect.height - y) / 10).toFixed(3);
      });
    };
    const onLeave = () => { delete stage.dataset.tracking; };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const body = (
    <div className="shell-notfound">
      <section ref={stageRef} className="nf-stage" aria-labelledby="nf-title">
        <div className="nf-cross" aria-hidden="true">
          <i className="nf-cross-x" />
          <i className="nf-cross-y" />
          <span className="nf-cross-read">X <span ref={readX}>0.000</span> · Y <span ref={readY}>0.000</span></span>
        </div>

        <header className="nf-top">
          <p className="shell-eyebrow">ERR::PAGE_NOT_FOUND</p>
          <p className="nf-path" aria-hidden="true">
            <span>{t("İSTENEN")}</span>
            <code>{requested}</code>
          </p>
        </header>

        <p className="nf-code" aria-hidden="true">
          <span className="nf-digit">4</span>
          <span className="nf-digit nf-hole">
            0
            <span className="nf-hole-dim">
              <i />
              <b>{t("Ø — ÖLÇÜLEMEDİ")}</b>
            </span>
          </span>
          <span className="nf-digit">4</span>
        </p>

        <div className="nf-copy">
          <h1 id="nf-title" className="shell-notfound-title">
            {t("Bu koordinatta")} <em>{t("kayıt yok.")}</em>
          </h1>
          <div className="nf-copy-side">
            <p className="shell-lede">
              {t("İstenen yol bu sitenin sayfa dizininde bir konuma karşılık gelmiyor. Adres değişmiş, yanlış yazılmış veya bağlantı eskimiş olabilir. Aşağıdaki kayıtlar sizi tekrar bir datuma oturtur.")}
            </p>
            <div className="shell-notfound-actions">
              <ShellAction to="/" variant="primary">{t("Ana sayfa")}</ShellAction>
              <ShellAction to="/teklif-al" variant="ghost">{t("Teklif al")}</ShellAction>
            </div>
          </div>
        </div>
      </section>

      <ShellMetaRow
        className="shell-notfound-meta"
        items={[
          { label: t("DURUM"), value: t("404 · BULUNAMADI") },
          { label: t("İSTENEN YOL"), value: requested },
          { label: t("YAKIN KAYIT"), value: String(suggestions.length) },
          { label: t("YÖNLENDİRME"), value: t("YOK") },
        ]}
      />

      <div className="nf-registers">
        {/* Rendered only when something really scored. An empty "did you mean"
            block is a worse answer than no block at all. */}
        {suggestions.length > 0 && (
          <section className="shell-notfound-section" aria-labelledby="notfound-near">
            <h2 id="notfound-near" className="shell-eyebrow">{t("YAKIN KAYITLAR")}</h2>
            <ShellIndexList
              compact
              ariaLabel={t("İstenen adrese en yakın sayfalar")}
              items={suggestions.map((path, index) => ({
                to: path,
                title: labelFor(path, t),
                description: path,
                index: `Y${index + 1}`,
              }))}
            />
          </section>
        )}

        <section className="shell-notfound-section" aria-labelledby="notfound-directory">
          <h2 id="notfound-directory" className="shell-eyebrow">{t("SAYFA DİZİNİ")}</h2>
          <ShellIndexList compact ariaLabel={t("Sayfa dizini")} items={directory(t)} />
        </section>
      </div>

      <div className="nf-report">
        <ShellAction to="/iletisim" variant="quiet">{t("Bu bağlantıyı bize bildirin")}</ShellAction>
      </div>
    </div>
  );

  if (!shell) return <div className="shell-root shell-notfound-bare" data-shell-surface="graphite">{body}</div>;
  return <PageShell surface="graphite" rail={{ no: "404", label: "HATA" }}>{body}</PageShell>;
};
