import { Component, type CSSProperties, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Kök hata yüzeyi.
 *
 * Eksik ya da yanlış bir yapılandırma değeri (ör. `VITE_SUPABASE_URL`) bugün
 * modül değerlendirme sırasında fırlatıyor; kök `ErrorBoundary` hiçbir yere
 * bağlı olmadığı için kamuya açık sitenin tamamı beyaz ekrana düşüyordu
 * (`reports/baseline/known-blockers.md` B01). Bu yüzey o düşüşü markalı,
 * klavyeyle kullanılabilir ve kurtarma bağlantısı olan bir sayfaya çevirir.
 *
 * Bilinçli olarak sade: gerçek hata-durumu tasarımı Faz 08'in konusu. Tailwind
 * sınıfı kullanılmaz — bu yüzey uygulama grafiği çökmüşken de doğru boyanmak
 * zorunda olduğu için yalnız `index.css` içindeki CSS custom property'lerine
 * dayanan satır içi stil kullanılır; sabitlenmiş hex/rgb yoktur.
 */
const surface: CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "1.5rem",
  padding: "clamp(1.5rem, 6vw, 5rem)",
  background: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
};

const kicker: CSSProperties = {
  margin: 0,
  fontSize: "0.6875rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "hsl(var(--muted-foreground))",
};

const heading: CSSProperties = {
  margin: 0,
  maxWidth: "22ch",
  fontFamily: '"Space Grotesk", system-ui, sans-serif',
  fontSize: "clamp(1.75rem, 5vw, 3rem)",
  fontWeight: 600,
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
};

const body: CSSProperties = {
  margin: 0,
  maxWidth: "56ch",
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "hsl(var(--muted-foreground))",
};

const action: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.75rem 1.5rem",
  border: "1px solid hsl(var(--primary))",
  color: "hsl(var(--primary))",
  fontSize: "0.75rem",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  textDecoration: "none",
};

export function AppErrorFallback() {
  return (
    <main id="main-content" style={surface} data-testid="app-error-fallback">
      <p style={kicker}>MAS TECHNIC · SİSTEM DURUMU</p>
      <hr style={{ margin: 0, border: 0, borderTop: "1px solid hsl(var(--border))" }} />
      <h1 style={heading}>Sayfa şu anda yüklenemedi.</h1>
      <p style={body}>
        Beklenmeyen bir teknik hata oluştu. Sayfayı yeniden yüklemeyi ya da ana
        sayfaya dönmeyi deneyebilirsiniz. Sorun sürerse{" "}
        <a href="mailto:sales@mastechnic.com" style={{ color: "hsl(var(--primary))" }}>
          sales@mastechnic.com
        </a>{" "}
        adresinden bize ulaşın.
      </p>
      {/* Uygulama grafiği çökmüş olabileceği için router'a değil, gerçek bir
          tam sayfa yüklemesine dayanan bağlantı kullanılır. */}
      <p style={{ margin: 0 }}>
        <a data-testid="app-error-home" href="/" style={action}>
          Ana sayfaya dön
        </a>
      </p>
    </main>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <AppErrorFallback />;
    }
    return this.props.children;
  }
}
