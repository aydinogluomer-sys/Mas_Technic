import { ShellAction, ShellMetaRow, ShellNotice, ShellTagRow, ShellTitleBlock } from "@/components/shell";
import { CAD_ACCEPT_ATTR, CAD_FORMAT_CHIPS, CAD_FORMAT_HINT } from "@/hooks/useCadHandoff";
import type { UploadedCadFile } from "@/utils/cadUpload";
import { CadStageHost } from "./CadStageHost";
import { CAD_MAX_FILE_SIZE_MB, type Dimensions } from "./rfq-model";
import type { CadSelection, CadSelectionError } from "./useCadSelection";

/* ══════════════════════════════════════════════════════════════════════════
   STEP 01 — THE FILE

   THE DISCLOSURE IS BEFORE THE CHOICE, NOT AFTER IT (§7). The accepted
   formats and the size ceiling are on screen while the drop area is still
   empty, in three places that all read the SAME constants:
   `CAD_FORMAT_CHIPS`, `CAD_FORMAT_HINT` and `CAD_MAX_FILE_SIZE_MB`, every one
   of them derived from `CAD_ACCEPTED_EXTENSIONS` / `CAD_MAX_FILE_SIZE` in
   `@/utils/cadUpload`. The old page had a second, hand-written list in its
   side panel — `["STEP","STP","STL","OBJ","IGES","3MF"]` — which had already
   drifted: it omitted `IGS`, a format the validator accepts.

   THE PREVIEW IS REQUESTED, NOT ASSUMED. Mounting the viewer used to be a
   side effect of choosing a file, which meant the WebGL stack was the price
   of admission to the form. It is now an explicit action, so a reader who
   just wants a quote never downloads a renderer — and the ones who do ask get
   the same viewer. `RFQCadPreview.tsx:602` in the back office already worked
   this way; this is that pattern on the public route.
   ══════════════════════════════════════════════════════════════════════════ */

const MEGABYTE = 1024 * 1024;

export type RfqUploadStepProps = {
  selection: CadSelection | null;
  handoff: UploadedCadFile | null;
  error: CadSelectionError | null;
  isDragging: boolean;
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent) => void;
  };
  onSelectFile: (file: File) => void;
  onClear: () => void;
  previewOpen: boolean;
  onOpenPreview: () => void;
  onClosePreview: () => void;
  dimensions: Dimensions | null;
  onDimensions: (dimensions: Dimensions | null) => void;
  parseError: string | null;
  onParseError: (message: string | null) => void;
  stageAttempt: number;
  onStageRetry: () => void;
};

export function RfqUploadStep({
  selection,
  handoff,
  error,
  isDragging,
  dragHandlers,
  onSelectFile,
  onClear,
  previewOpen,
  onOpenPreview,
  onClosePreview,
  dimensions,
  onDimensions,
  parseError,
  onParseError,
  stageAttempt,
  onStageRetry,
}: RfqUploadStepProps) {
  const recordName = selection?.file.name ?? handoff?.name ?? null;
  const recordSize = selection?.file.size ?? handoff?.size ?? null;
  const recordExtension = selection?.extension ?? handoff?.extension ?? null;

  return (
    <div className="shell-stack">
      <ShellTitleBlock
        id="rfq-step-cad"
        index="01"
        title="CAD dosyanızı yükleyin"
        standfirst="Teknik resim yerine 3B model gönderin; üretilebilirlik incelemesi doğrudan geometri üzerinden yapılır."
      />

      <div className="shell-stack" data-gap="sm">
        <p className="shell-eyebrow">KABUL EDİLEN FORMATLAR</p>
        <ShellTagRow items={[...CAD_FORMAT_CHIPS]} ariaLabel="Kabul edilen CAD formatları" />
        <p className="shell-field-hint" id="rfq-cad-hint">
          Tek dosya · en fazla {CAD_MAX_FILE_SIZE_MB} MB · {CAD_FORMAT_HINT}
        </p>
      </div>

      <div className="shell-dropzone" data-dragging={isDragging || undefined} {...dragHandlers}>
        {/* A real, focusable file input. Keeping it in the DOM in BOTH states
            means "değiştir" is the same control as "seç" — one accessible
            name, one tab stop, one place a test can attach a file. */}
        <input
          id="rfq-cad"
          name="cad"
          type="file"
          accept={CAD_ACCEPT_ATTR}
          aria-describedby="rfq-cad-hint"
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelectFile(file);
            /* Cleared so choosing the same file twice still fires `change` —
               the retry path after a rejected file. */
            event.target.value = "";
          }}
        />
        <label htmlFor="rfq-cad" className="shell-dropzone-area">
          {recordName ? (
            <>
              <span className="shell-dropzone-title">{recordName}</span>
              <span className="shell-dropzone-hint">Başka bir dosya seçmek için tıklayın</span>
            </>
          ) : (
            <>
              <span className="shell-dropzone-title">CAD dosyanızı sürükleyin veya seçin</span>
              <span className="shell-dropzone-hint">{CAD_FORMAT_HINT}</span>
            </>
          )}
        </label>
      </div>

      {/* A20 — the CAD error is a persistent, announced block, not a toast. */}
      {error && (
        <ShellNotice tone="error" label={error.label} title={error.title}>
          <p>{error.detail}</p>
        </ShellNotice>
      )}

      {recordName && (
        <ShellMetaRow
          items={[
            { label: "Dosya", value: recordName },
            {
              label: "Boyut",
              value: recordSize != null ? `${(recordSize / MEGABYTE).toFixed(2)} MB` : "—",
            },
            { label: "Format", value: (recordExtension ?? "—").toUpperCase() },
            {
              label: "Ölçü",
              value: dimensions
                ? `${dimensions.x} × ${dimensions.y} × ${dimensions.z} mm`
                : "Önizlemede okunur",
            },
          ]}
        />
      )}

      {selection && selection.previewKind && !previewOpen && (
        <div className="shell-state-actions">
          <ShellAction variant="ghost" onClick={onOpenPreview}>
            3B önizlemeyi aç
          </ShellAction>
          <ShellAction variant="quiet" onClick={onClear}>
            Dosyayı kaldır
          </ShellAction>
        </div>
      )}

      {selection && !selection.previewKind && (
        <ShellNotice
          tone="note"
          label="ÖNİZLEME YOK"
          title={`${selection.extension.toUpperCase()} için tarayıcı önizlemesi bulunmuyor`}
        >
          <p>
            Dosya teklif talebine eklenir ve mühendislerimiz kendi CAD yazılımlarında açar. Tarayıcıda
            görüntüleme yalnızca STEP, STP, STL ve OBJ dosyaları için çalışır.
          </p>
        </ShellNotice>
      )}

      {selection && selection.previewKind && previewOpen && (
        <CadStageHost
          file={selection.file}
          kind={selection.previewKind}
          attempt={stageAttempt}
          onRetry={onStageRetry}
          onDimensions={onDimensions}
          onParseError={onParseError}
          onClose={onClosePreview}
        />
      )}

      {!selection && handoff && (
        <ShellNotice
          tone="note"
          label="ANA SAYFADAN AKTARILDI"
          title="Dosyanız yüklendi ve talebe eklenecek"
        >
          <p>
            Bu dosya ana sayfadaki bırakma alanından yüklendi. Tarayıcıda önizlemek isterseniz aynı dosyayı
            yukarıdan tekrar seçin; teklif talebi için gerekli değildir.
          </p>
        </ShellNotice>
      )}

      {parseError && !error && (
        <ShellNotice tone="error" label="ÇÖZÜMLEME HATASI" title="Dosya çizilemedi">
          <p>{parseError}</p>
        </ShellNotice>
      )}
    </div>
  );
}
