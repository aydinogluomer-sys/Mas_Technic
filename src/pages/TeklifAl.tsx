import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/use-page-meta";
import { upper } from "@/i18n/upper";
import { Link } from "@/i18n/LocaleLink";
import { useLocalizedPath } from "@/i18n/hooks";
import { legalLinks } from "@/components/navigation/ia";
import {
  PageShell,
  ShellAction,
  ShellBreadcrumb,
  ShellNotice,
} from "@/components/shell";
import {
  MINIMUM_TOLERANCE,
  PUBLIC_PHONE,
  PUBLIC_PHONE_HREF,
  QUOTE_RESPONSE_TIME,
  SALES_EMAIL,
  SALES_EMAIL_HREF,
} from "@/content/claims";
import { CAD_FORMAT_CHIPS } from "@/hooks/useCadHandoff";
import { RfqAside } from "@/components/rfq/RfqAside";
import { RfqSpecStep } from "@/components/rfq/RfqSpecStep";
import { RfqStepper } from "@/components/rfq/RfqStepper";
import { RfqSubmitStep } from "@/components/rfq/RfqSubmitStep";
import { RfqUploadStep } from "@/components/rfq/RfqUploadStep";
import {
  CAD_MAX_FILE_SIZE_MB,
  EMPTY_RFQ_DRAFT,
  RFQ_STEPS,
  type Dimensions,
  type RfqDraft,
} from "@/components/rfq/rfq-model";
import {
  rfqFieldId,
  validateRfqDraft,
  type RfqFieldErrors,
  type RfqFieldName,
} from "@/components/rfq/rfq-schema";
import { useCadSelection } from "@/components/rfq/useCadSelection";
import { RFQ_ATTACHMENTS_ENABLED } from "@/components/rfq/rfq-attachments";
import { useAttachmentSelection } from "@/components/rfq/useAttachmentSelection";
import { RfqAttachmentsStep } from "@/components/rfq/RfqAttachmentsStep";
import { CadStageHost } from "@/components/rfq/CadStageHost";
import { cadPreviewKind } from "@/components/rfq/rfq-model";
import { getCadFileExtension } from "@/utils/cadFiles";
import { useRfqSubmission } from "@/components/rfq/useRfqSubmission";

/* ══════════════════════════════════════════════════════════════════════════
   /teklif-al — THE QUOTE REQUEST

   PHASE 04 mounted `PageShell` here and deliberately left the body alone
   ("The form body is untouched — Phase 09 owns the RFQ"). PHASE 08 built
   `ShellNotice tone="error"` for this page's two unbranded failures and
   recorded that it could not wire them (`PROGRESS.md` A20), and measured the
   body as the last public surface still in the old language: 16 legacy-teal
   `rgb(10,125,138)` nodes, 3 Radix tablists and 1 shell primitive inside
   `<main>`, against 0 / 0 / 47–404 on every migrated route (A21). This is
   that phase, and this file is now composition only.

   WHAT MOVED, AND WHY THE SEAMS ARE WHERE THEY ARE
   ------------------------------------------------
   1540 lines held an option catalogue, a WebGL viewer, three model loaders, a
   STEP tessellator, a validation routine, a four-call network pipeline and
   four screens of markup in one module scope. They are now:

       components/rfq/rfq-model.ts        options, the sent record, the id
       components/rfq/rfq-schema.ts       what a valid answer is
       components/rfq/useCadSelection.ts  choosing a file
       components/rfq/useRfqSubmission.ts talking to the backend
       components/rfq/Rfq*Step.tsx        one screen each
       components/rfq/RfqAside.tsx        the running record
       components/rfq/CadStageHost.tsx    the lazy boundary
       components/rfq/cad/CadStage.tsx    three / R3F / drei / STL / OBJ / OCCT

   The last line is the one with a number attached. `/teklif-al` was already a
   lazy ROUTE, but its chunk statically imported the 858 kB chunk carrying
   `three` and friends, so the whole renderer was the price of opening the
   quote form. It is now behind `import()` and arrives only when a reader asks
   to look at a model.

   THE SURFACE IS GRAPHITE, LIKE ITS EIGHTEEN SIBLINGS
   ---------------------------------------------------
   Every migrated public page passes `surface="graphite"`; this one still took
   `PageShell`'s `paper` default, so walking from `/iletisim` — which links
   straight here — flipped the field from graphite to paper mid-journey. That
   is a design-language break, not a page decision, and it is the one change
   in this phase that legitimately moves a golden: `shell-footer-rfq.png`
   picks up the graphite footer rule instead of the paper one.
   ══════════════════════════════════════════════════════════════════════════ */

const LAST_STEP = RFQ_STEPS.length;

export const TeklifAl = () => {
  const { t, i18n } = useTranslation();
  usePageMeta({
    title: t("Teklif Al"),
    description: t("CAD dosyanızı yükleyin, malzeme ve miktarı yazın; üretilebilirlik incelemesiyle birlikte teknik teklif hazırlayalım."),
  });
  const localized = useLocalizedPath();
  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [draft, setDraft] = useState<RfqDraft>(EMPTY_RFQ_DRAFT);
  const [errors, setErrors] = useState<RfqFieldErrors>({});
  const [formError, setFormError] = useState<{ title: string; detail: string; vars?: Record<string, string> } | null>(null);
  const [focusTarget, setFocusTarget] = useState<RfqFieldName | null>(null);

  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [stageAttempt, setStageAttempt] = useState(0);

  const cad = useCadSelection();
  const attachments = useAttachmentSelection();
  const submission = useRfqSubmission();
  const modelItem = attachments.items.find((item) => item.kind === "model") ?? null;
  const modelPreviewKind = modelItem ? cadPreviewKind(getCadFileExtension(modelItem.file.name)) : null;

  const pending = submission.state.status === "uploading" || submission.state.status === "sending";
  const sent = submission.state.status === "sent";
  const fileName = RFQ_ATTACHMENTS_ENABLED
    ? attachments.items.map((item) => item.file.name).join(", ") || null
    : cad.selection?.file.name ?? cad.handoff?.name ?? null;

  const setField = useCallback((field: RfqFieldName, value: string | number) => {
    setDraft((current) => ({ ...current, [field]: value }) as RfqDraft);
    /* Clear the field's own message as soon as it is edited: leaving a stale
       error under a control the reader has just fixed is how a form ends up
       looking broken while being valid. */
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  /* Focus is moved AFTER the commit that renders the step holding the field,
     which is why it goes through state rather than being called inline. */
  useEffect(() => {
    if (!focusTarget) return;
    document.getElementById(rfqFieldId(focusTarget))?.focus();
    setFocusTarget(null);
  }, [focusTarget, currentStep]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setFurthestStep((current) => Math.max(current, step));
    setFormError(null);
  }, []);

  /* RFQ01: with attachments on, "has a file" means the attachment contract is
     satisfied (at least one file, no count/size/type/revision problem). */
  const hasFile = RFQ_ATTACHMENTS_ENABLED
    ? attachments.items.length > 0 && attachments.problems.length === 0
    : Boolean(cad.selection || cad.handoff);

  const advance = useCallback(() => {
    if (currentStep === 1) {
      if (!hasFile) {
        if (RFQ_ATTACHMENTS_ENABLED) {
          const first = attachments.problems[0];
          setFormError({
            title: attachments.items.length ? "Dosyalarda düzeltilmesi gereken bir şey var" : "Önce bir dosya ekleyin",
            detail: first?.message ?? "Önce bir dosya ekleyin: 3B model, PDF teknik resim veya ikisi birlikte.",
            vars: first?.vars,
          });
          document.getElementById(attachments.items.length ? "rfq-revision-ack" : "rfq-model")?.focus();
          return;
        }
        /* RFQ03: the message names what this build can actually take. PDF
           drawings need the backend change (O06), so until then they go by
           e-mail, and the message says so instead of implying a CAD file is
           the only way to ask. */
        setFormError({
          title: "Önce bir 3B model dosyası ekleyin",
          detail:
            "Bu formdan {{formats}} formatlarından birini, en fazla {{size}} MB olacak şekilde ekleyebilirsiniz. " +
            "Elinizde yalnız teknik resim varsa {{email}} adresine gönderin.",
          vars: { formats: CAD_FORMAT_CHIPS.join(", "), size: String(CAD_MAX_FILE_SIZE_MB), email: SALES_EMAIL },
        });
        document.getElementById("rfq-cad")?.focus();
        return;
      }
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      const result = validateRfqDraft(draft);
      setErrors(result.errors);
      if (result.firstInvalid) {
        setFormError({
          title: "Bazı alanlar eksik veya hatalı",
          detail: result.errors[result.firstInvalid] ?? "Alanları kontrol edip tekrar deneyin.",
        });
        setFocusTarget(result.firstInvalid);
        return;
      }
      goToStep(3);
    }
  }, [attachments.items.length, attachments.problems, currentStep, draft, goToStep, hasFile]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (pending || sent) return;

      /* Implicit submission (Enter in a text field) reaches this handler from
         every step, so the step machine lives here rather than only on the
         buttons — otherwise pressing Enter on step 1 would post an empty
         request. */
      if (currentStep < LAST_STEP) {
        advance();
        return;
      }

      const result = validateRfqDraft(draft);
      setErrors(result.errors);
      if (result.firstInvalid) {
        setFormError({
          title: "Talep gönderilemedi: eksik alan var",
          detail: result.errors[result.firstInvalid] ?? "Alanları kontrol edip tekrar deneyin.",
        });
        setCurrentStep(2);
        setFocusTarget(result.firstInvalid);
        return;
      }
      if (!hasFile) {
        setFormError({
          title: "Talep gönderilemedi: dosya yok",
          detail: RFQ_ATTACHMENTS_ENABLED
            ? "Önce bir dosya ekleyin: 3B model, PDF teknik resim veya ikisi birlikte."
            : "Teklif talebi bir 3B model dosyası olmadan bu formdan gönderilemiyor.",
        });
        setCurrentStep(1);
        return;
      }

      setFormError(null);
      void submission.submit(
        RFQ_ATTACHMENTS_ENABLED
          ? { draft, file: null, handoff: null, attachments: attachments.items }
          : { draft, file: cad.selection?.file ?? null, handoff: cad.handoff },
      );
    },
    [advance, attachments.items, cad.handoff, cad.selection, currentStep, draft, hasFile, pending, sent, submission],
  );

  const restart = useCallback(() => {
    submission.reset();
    setDraft(EMPTY_RFQ_DRAFT);
    setErrors({});
    setFormError(null);
    setDimensions(null);
    setParseError(null);
    setPreviewOpen(false);
    cad.clear();
    attachments.clear();
    setFurthestStep(1);
    setCurrentStep(1);
  }, [attachments, cad, submission]);

  const heroMeta = useMemo(
    () => [
      { label: t("Teklif dönüşü"), value: t(QUOTE_RESPONSE_TIME) },
      { label: t("Kabul edilen format"), value: RFQ_ATTACHMENTS_ENABLED ? `${CAD_FORMAT_CHIPS.join(", ")} · PDF` : CAD_FORMAT_CHIPS.join(", ") },
      { label: t("Maksimum dosya"), value: `${CAD_MAX_FILE_SIZE_MB} MB` },
      { label: t("Tolerans"), value: MINIMUM_TOLERANCE },
    ],
    [t],
  );

  /* ROUND 2 — THE QUOTE STUDIO. The page no longer reads as a stack of
     inner-page bands ending in the site footer: it is one task surface.
     Left, the step rail (where you are, what is left, and the other ways in);
     centre, the one thing to do now; right, the live record of what will be
     sent. No footer — a form that asks for a drawing should not end in a
     site map. The form, its hooks and every field id are unchanged. */
  return (
    <PageShell surface="graphite" footer={false} className="rfq-page" rail={{ no: "13", label: "TEKLİF" }}>
      <section className="rfq-studio" id="talep" aria-labelledby="shell-page-title">
        <header className="rfq-head">
          <ShellBreadcrumb trail={[{ label: t("Ana sayfa"), to: "/" }, { label: t("Teklif al") }]} />
          <p className="shell-eyebrow">{upper(t("TEKLİF · 3 ADIM · {{time}} DÖNÜŞ", { time: t(QUOTE_RESPONSE_TIME) }), i18n.language)}</p>
          {/* The heading string is a measured contract: `e2e/qa-p08-scroll-region
             -reach.spec.ts:207` reads it as this route's anti-404 surface. */}
          <h1 id="shell-page-title">{t("Üretim Teklifi İsteyin")}</h1>
          {/* RFQ03: the contract's description, word for word, where this
              build can take what it promises. Without the attachment backend
              (O06) a PDF cannot be sent from the form, so the sentence says
              where it goes instead of offering it. The SLA is the ledger's. */}
          <p className="rfq-lede">
            {RFQ_ATTACHMENTS_ENABLED
              ? t("3B modelinizi, PDF teknik resminizi veya ikisini birlikte ekleyin. Geometri, tolerans ve üretim kapsamı incelendikten sonra {{time}} içinde dönüş yapılır.", { time: t(QUOTE_RESPONSE_TIME) })
              : t("3B modelinizi ekleyin; elinizde yalnız teknik resim varsa {{email}} adresine gönderin. Geometri, tolerans ve üretim kapsamı incelendikten sonra {{time}} içinde dönüş yapılır.", { email: SALES_EMAIL, time: t(QUOTE_RESPONSE_TIME) })}
          </p>
          <dl className="rfq-head-meta">
            {heroMeta.map((item) => (
              <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
            ))}
          </dl>
        </header>

        <div className="rfq-grid">
          <aside className="rfq-rail" aria-label={t("İlerleme ve alternatif yollar")}>
            <RfqStepper current={currentStep} furthest={furthestStep} onSelect={goToStep} />
            <div className="rfq-progress" aria-hidden="true">
              <i style={{ transform: `scaleY(${currentStep / LAST_STEP})` }} />
            </div>
            <div className="rfq-alt">
              <p className="shell-eyebrow">{t("DOSYA HAZIR DEĞİLSE")}</p>
              <ul>
                <li><a href={localized("/iletisim#toplanti")}>{t("Teknik görüşme planla")} <span aria-hidden="true">↗</span></a></li>
                <li><a href={localized("/sss")}>{t("Sık sorulan sorular")} <span aria-hidden="true">↗</span></a></li>
                <li><a href={PUBLIC_PHONE_HREF}>{PUBLIC_PHONE}</a></li>
                <li><a href={SALES_EMAIL_HREF}>{SALES_EMAIL}</a></li>
              </ul>
              {/* No site footer on this task surface, so the legal texts the
                  form's data handling refers to stay one click away here. */}
              <p className="rfq-legal">
                {legalLinks.map((link) => <Link key={link.path} to={link.path}>{t(link.label)}</Link>)}
              </p>
            </div>
          </aside>

          <div className="rfq-canvas">
              <form className="shell-stack rfq-form" onSubmit={handleSubmit} aria-busy={pending} noValidate>
                {currentStep === 1 && RFQ_ATTACHMENTS_ENABLED && (
                  <>
                    <RfqAttachmentsStep selection={attachments} />
                    {/* The model preview stays opt-in and is never a condition
                        for sending; PDFs are not previewed at all. */}
                    {modelItem && modelPreviewKind && !previewOpen && (
                      <div className="shell-state-actions">
                        <ShellAction variant="ghost" onClick={() => setPreviewOpen(true)}>{t("3B önizlemeyi aç")}</ShellAction>
                      </div>
                    )}
                    {modelItem && modelPreviewKind && previewOpen && (
                      <CadStageHost
                        file={modelItem.file}
                        kind={modelPreviewKind}
                        attempt={stageAttempt}
                        onRetry={() => setStageAttempt((value) => value + 1)}
                        onDimensions={setDimensions}
                        onParseError={setParseError}
                        onClose={() => setPreviewOpen(false)}
                      />
                    )}
                  </>
                )}

                {currentStep === 1 && !RFQ_ATTACHMENTS_ENABLED && (
                  <RfqUploadStep
                    selection={cad.selection}
                    handoff={cad.handoff}
                    error={cad.error}
                    isDragging={cad.isDragging}
                    dragHandlers={cad.dragHandlers}
                    onSelectFile={(file) => {
                      setDimensions(null);
                      setParseError(null);
                      setPreviewOpen(false);
                      setFormError(null);
                      cad.select(file);
                    }}
                    onClear={() => {
                      cad.clear();
                      setDimensions(null);
                      setParseError(null);
                      setPreviewOpen(false);
                    }}
                    previewOpen={previewOpen}
                    onOpenPreview={() => setPreviewOpen(true)}
                    onClosePreview={() => setPreviewOpen(false)}
                    dimensions={dimensions}
                    onDimensions={setDimensions}
                    parseError={parseError}
                    onParseError={setParseError}
                    stageAttempt={stageAttempt}
                    onStageRetry={() => setStageAttempt((value) => value + 1)}
                  />
                )}

                {currentStep === 2 && (
                  <RfqSpecStep draft={draft} errors={errors} onChange={setField} />
                )}

                {currentStep === 3 && (
                  <RfqSubmitStep
                    draft={draft}
                    fileName={fileName}
                    dimensions={dimensions}
                    state={submission.state}
                    onEdit={goToStep}
                    onRestart={restart}
                  />
                )}

                {/* A20 — the form-level failure. Persistent, announced
                    (`role="alert"` via `tone="error"`), square, Space Grotesk;
                    it was a `sonner` toast that named one problem and vanished. */}
                {formError && !sent && (
                  <ShellNotice tone="error" label={t("FORM HATASI")} title={t(formError.title)}>
                    <p>{t(formError.detail, formError.vars)}</p>
                  </ShellNotice>
                )}

                {!sent && (
                  <div className="shell-state-actions">
                    {currentStep > 1 && (
                      <ShellAction variant="quiet" onClick={() => goToStep(currentStep - 1)}>
                        {t("Geri")}
                      </ShellAction>
                    )}
                    {/* ONE PRIMARY CONTROL, ALWAYS `type="submit"`, AND THAT IS
                        A BUG FIX RATHER THAN A TIDY-UP.

                        The first version of this block rendered a
                        `type="button"` "İleri" for steps 1–2 and swapped it for
                        a `type="submit"` on step 3. React reconciles those as
                        the SAME `<button>` element and only rewrites its
                        attributes — and it does that synchronously, inside the
                        dispatch of the very click that advanced the step. So by
                        the time the browser evaluated the click's default
                        action, the element it had just dispatched on was a
                        submit button, and the form posted. Measured with every
                        non-loopback request logged and aborted, so nothing left
                        the machine: one click on step 2's "İleri" produced
                        `POST /storage/v1/object/cad-uploads/anonymous/RFQ-…`
                        with no second click anywhere. It reproduced in two runs
                        out of three, which is exactly the kind of intermittent
                        that survives review.

                        A single control whose `type` never changes cannot do
                        it, and it puts the whole step machine in `handleSubmit`
                        — the same path implicit submission (Enter) already
                        takes.

                        `disabled` while in flight is the visible half of the
                        double-submit guard; the ref in `useRfqSubmission` is the
                        half that actually holds, because `disabled` only reaches
                        the DOM on the next commit. */}
                    <ShellAction type="submit" variant="primary" disabled={pending}>
                      {t(pending
                        ? "Gönderiliyor…"
                        : currentStep < LAST_STEP
                          ? "İleri"
                          : "Teklif talebini gönder")}
                    </ShellAction>
                  </div>
                )}
              </form>
          </div>

          <div className="rfq-summary">
            <RfqAside draft={draft} fileName={fileName} />
          </div>
        </div>
      </section>
    </PageShell>
  );
};
