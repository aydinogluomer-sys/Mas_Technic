import { Component, Suspense, lazy, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { ShellAction, ShellLoading, ShellNotice } from "@/components/shell";
import type { CadPreviewKind, Dimensions } from "./rfq-model";

/* ══════════════════════════════════════════════════════════════════════════
   THE LAZY BOUNDARY

   This module is reachable from the route chunk and must stay cheap: it names
   `./cad/CadStage` only inside `import()`, so Rollup emits the whole WebGL
   subsystem as a separate chunk and the browser fetches it the first time a
   reader asks to see a model — never on page load.

   It also owns the two failures a code-split boundary introduces and a static
   import does not: the chunk request can fail (offline, a stale hashed asset
   after a deploy), and it can be slow. Both are answered here rather than at
   `ShellRouteBoundary`, which would otherwise throw away the whole form —
   including everything the reader has typed — because a viewer would not load.
   ══════════════════════════════════════════════════════════════════════════ */

const CadStage = lazy(() => import("./cad/CadStage"));

type ChunkBoundaryState = { failed: boolean };

class ChunkBoundary extends Component<{ children: ReactNode; onRetry: () => void }, ChunkBoundaryState> {
  state: ChunkBoundaryState = { failed: false };

  static getDerivedStateFromError(): ChunkBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[rfq] CAD viewer chunk failed to load", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <ShellNotice
        tone="error"
        label={i18n.t("ÖNİZLEME YÜKLENEMEDİ")}
        title={i18n.t("3B görüntüleyici indirilemedi")}
        action={
          <ShellAction
            variant="ghost"
            onClick={() => {
              this.setState({ failed: false });
              this.props.onRetry();
            }}
          >
            Tekrar dene
          </ShellAction>
        }
      >
        <p>
          Görüntüleyici bileşeni yüklenemedi. Bu, teklif talebinizi etkilemez — dosyanız formda kalır ve
          önizleme olmadan da gönderebilirsiniz.
        </p>
      </ShellNotice>
    );
  }
}

export type CadStageHostProps = {
  file: File;
  kind: CadPreviewKind;
  onDimensions: (dimensions: Dimensions | null) => void;
  onParseError: (message: string | null) => void;
  onClose: () => void;
  /** Bumped by the page to remount the stage after a chunk-load retry. */
  attempt: number;
  onRetry: () => void;
};

export function CadStageHost({ attempt, onRetry, ...stage }: CadStageHostProps) {
  const { t } = useTranslation();
  return (
    <ChunkBoundary key={attempt} onRetry={onRetry}>
      <Suspense
        fallback={
          <ShellLoading
            label={t("GÖRÜNTÜLEYİCİ YÜKLENİYOR")}
            detail={t("3B görüntüleyici ilk açılışta indiriliyor.")}
            fullHeight={false}
          />
        }
      >
        <CadStage {...stage} />
      </Suspense>
    </ChunkBoundary>
  );
}
