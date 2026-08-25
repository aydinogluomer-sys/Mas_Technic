import { Activity, Sun, Moon, Home, ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react";
import { MusteriNotifications } from "./MusteriNotifications";
import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";

const tabTitles: Record<string, string> = {
  genel: "Genel Bakış",
  teklifler: "Tekliflerim",
  siparisler: "Siparişlerim",
  uretim: "Üretim Takip",
  arsiv: "Teknik Arşiv",
  kalite: "Kalite Raporları",
  finans: "Finans",
  odeme: "Ödeme",
  destek: "Destek",
  bildirimler: "Bildirim Tercihleri",
  profil: "Profil Ayarları",
};

interface Props {
  activeTab: string;
  mobileSidebar?: ReactNode;
  onTabChange?: (tab: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const MusteriHeader = ({ activeTab, mobileSidebar, onTabChange, sidebarCollapsed, onToggleSidebar }: Props) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="shrink-0">
      <header className="h-14 border-b dark:border-[#334155] border-slate-200 dark:bg-[#0F172A] bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {mobileSidebar}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD] dark:hover:bg-[#1E293B] hover:bg-slate-100 transition-colors"
            title={sidebarCollapsed ? "Kenar çubuğunu aç" : "Kenar çubuğunu kapat"}
          >
            {sidebarCollapsed ? <PanelLeft className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
          <h2 className="font-black dark:text-white text-slate-800 text-xs sm:text-sm tracking-wider uppercase truncate">
            {tabTitles[activeTab] || "Müşteri Paneli"}
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ÇEVRİMİÇİ</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD] dark:hover:bg-[#1E293B] hover:bg-slate-100 transition-colors"
            title={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <MusteriNotifications onTabChange={onTabChange} />
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0AA2CD]/10 text-[#0AA2CD] text-xs font-bold hover:bg-[#0AA2CD]/20 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Ana Sayfa
          </Link>
        </div>
      </header>

      {activeTab !== "genel" && (
        <nav className="h-9 px-4 flex items-center gap-1.5 text-[11px] dark:bg-[#0B1120] bg-slate-50 border-b dark:border-[#1E293B] border-slate-100">
          <button
            onClick={() => onTabChange?.("genel")}
            className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
          >
            Genel Bakış
          </button>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-foreground font-medium">
            {tabTitles[activeTab] || activeTab}
          </span>
        </nav>
      )}
    </div>
  );
};
