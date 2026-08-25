import { Search, Download, Activity, Sun, Moon, Loader2, X, Command, FileText, Package, Users, AlertTriangle, Wrench, DollarSign, TrendingUp, Boxes, Wallet, MessageSquare, GitBranch, CalendarDays, Settings, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNotifications } from "./AdminNotifications";

const tabTitles: Record<string, string> = {
  dashboard: "Kontrol Paneli",
  rfq: "Talep Merkezi",
  orders: "Üretim Günlüğü",
  wbs: "İş Akış Hattı",
  scheduling: "Kaynak Yerleşimi",
  financial: "Finansal Analitik",
  pipeline: "Satış Pipeline",
  tpm: "TPM & Bakım",
  inventory: "Envanter & Takım",
  financedocs: "Nakit Akışı",
  support: "Destek Talepleri",
  issues: "Olay Merkezi",
  customers: "Çözüm Ortakları",
  settings: "Sistem Ayarları",
};

const moduleIcons: Record<string, any> = {
  dashboard: LayoutDashboard, rfq: FileText, orders: Package, wbs: GitBranch,
  scheduling: CalendarDays, financial: DollarSign, pipeline: TrendingUp, tpm: Wrench,
  inventory: Boxes, financedocs: Wallet, support: MessageSquare, issues: AlertTriangle,
  customers: Users, settings: Settings,
};

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  moduleLabel: string;
}

interface Props {
  activeTab: string;
  onToggleSidebar: () => void;
  onExportCSV: () => void;
  onNavigate?: (tab: string) => void;
  mobileSidebar?: ReactNode;
  exporting?: boolean;
}

export const AdminHeader = ({ activeTab, onToggleSidebar, onExportCSV, onNavigate, mobileSidebar, exporting }: Props) => {
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);

    // Search modules by name first
    const moduleResults: SearchResult[] = Object.entries(tabTitles)
      .filter(([, label]) => label.toLowerCase().includes(q.toLowerCase()))
      .map(([id, label]) => ({
        id: `module-${id}`, title: label, subtitle: "Modüle git", module: id, moduleLabel: label,
      }));

    // Search across database tables in parallel
    const like = `%${q}%`;
    try {
      const [rfqR, ordR, custR, issR, pipeR] = await Promise.all([
        supabase.from("rfqs").select("id, customer, service, status").or(`customer.ilike.${like},service.ilike.${like},id.ilike.${like}`).limit(5),
        supabase.from("orders").select("id, part_name, customer, status").or(`part_name.ilike.${like},customer.ilike.${like},id.ilike.${like}`).limit(5),
        supabase.from("customers").select("id, name, company, city").or(`name.ilike.${like},company.ilike.${like},city.ilike.${like}`).limit(5),
        supabase.from("issues").select("id, detail, machine, severity").or(`detail.ilike.${like},machine.ilike.${like},id.ilike.${like}`).limit(5),
        supabase.from("pipeline_leads").select("id, company, contact_name, stage").or(`company.ilike.${like},contact_name.ilike.${like}`).limit(5),
      ]);

      const dbResults: SearchResult[] = [];

      rfqR.data?.forEach((r) => dbResults.push({
        id: `rfq-${r.id}`, title: `RFQ: ${r.id}`, subtitle: `${r.customer || "—"} • ${r.service || "—"}`, module: "rfq", moduleLabel: "Talep Merkezi",
      }));
      ordR.data?.forEach((o) => dbResults.push({
        id: `order-${o.id}`, title: `Sipariş: ${o.id}`, subtitle: `${o.part_name || "—"} • ${o.customer || "—"}`, module: "orders", moduleLabel: "Üretim Günlüğü",
      }));
      custR.data?.forEach((c) => dbResults.push({
        id: `cust-${c.id}`, title: c.company || c.name || "Müşteri", subtitle: `${c.city || "—"}`, module: "customers", moduleLabel: "Çözüm Ortakları",
      }));
      issR.data?.forEach((i) => dbResults.push({
        id: `issue-${i.id}`, title: `Olay: ${i.id}`, subtitle: `${i.machine || "—"} • ${i.severity || "—"}`, module: "issues", moduleLabel: "Olay Merkezi",
      }));
      pipeR.data?.forEach((p) => dbResults.push({
        id: `pipe-${p.id}`, title: p.company || "Lead", subtitle: `${p.contact_name || "—"} • ${p.stage || "—"}`, module: "pipeline", moduleLabel: "Satış Pipeline",
      }));

      setResults([...moduleResults, ...dbResults].slice(0, 12));
    } catch {
      setResults(moduleResults);
    }
    setSearching(false);
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIdx(-1);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (result: SearchResult) => {
    onNavigate?.(result.module);
    setQuery("");
    setShowResults(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIdx]);
    }
  };

  return (
    <header className="h-14 border-b dark:border-[#334155] border-slate-200 dark:bg-[#0F172A] bg-white flex items-center justify-between px-3 sm:px-4 shrink-0 gap-2">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {mobileSidebar}
        <h2 className="font-black dark:text-white text-slate-800 text-xs sm:text-sm tracking-wider uppercase truncate">
          {tabTitles[activeTab] || "Dashboard"}
        </h2>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ÇEVRİMİÇİ</span>
        </div>
      </div>

      {/* Center - Search */}
      <div ref={containerRef} className="relative hidden md:block flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onKeyDown={handleKeyDown}
            placeholder="Modül, sipariş, müşteri ara..."
            className="w-full pl-9 pr-20 py-1.5 rounded-lg dark:bg-[#1E293B] bg-slate-100 border dark:border-[#334155] border-slate-200 text-sm dark:text-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0AA2CD] focus:ring-1 focus:ring-[#0AA2CD]/30 transition-all"
          />
          {query ? (
            <button onClick={() => { setQuery(""); setResults([]); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-slate-500 pointer-events-none">
              <Command className="w-3 h-3" />
              <span className="text-[10px] font-mono font-bold">K</span>
            </div>
          )}
        </div>

        {/* Results dropdown */}
        {showResults && (query.length >= 2) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 dark:bg-[#1E293B] bg-white border dark:border-[#334155] border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0AA2CD]" />
                <span className="text-xs text-slate-400">Aranıyor...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-1">
                <Search className="w-6 h-6 text-slate-500/30" />
                <span className="text-xs text-slate-500">"{query}" için sonuç bulunamadı</span>
              </div>
            ) : (
              <div className="py-1">
                {results.map((r, idx) => {
                  const Icon = moduleIcons[r.module] || FileText;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleSelect(r)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        idx === selectedIdx
                          ? "dark:bg-[#0AA2CD]/10 bg-[#0AA2CD]/5"
                          : "dark:hover:bg-white/5 hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg dark:bg-[#0AA2CD]/10 bg-[#0AA2CD]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#0AA2CD]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dark:text-white text-slate-800 truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{r.subtitle}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 dark:bg-white/5 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {r.moduleLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="px-4 py-2 border-t dark:border-[#334155] border-slate-200 flex items-center justify-between">
              <span className="text-[9px] text-slate-500">↑↓ gezin • ↵ seç • esc kapat</span>
              <span className="text-[9px] text-slate-500 font-mono">{results.length} sonuç</span>
            </div>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD] dark:hover:bg-[#1E293B] hover:bg-slate-100 transition-colors"
          title={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <AdminNotifications onNavigate={onNavigate} />
        <button
          onClick={onExportCSV}
          disabled={exporting}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0AA2CD]/10 text-[#0AA2CD] text-xs font-bold hover:bg-[#0AA2CD]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {exporting ? "İndiriliyor..." : "Rapor Al"}
        </button>
      </div>
    </header>
  );
};
