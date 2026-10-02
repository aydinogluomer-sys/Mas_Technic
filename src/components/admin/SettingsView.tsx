import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["Üretim Parametreleri", "İş Akışı", "Roller", "API"];

const defaultParams = {
  cncRate: "450",
  laborRate: "180",
  profitMargin: "25",
  wasteRate: "3",
};

const defaultApiSettings = {
  emailNotifications: true,
  realtimeSync: true,
};

/* The "Roller" tab printed a static matrix (Yönetici/Operatör/Müşteri/
   Tedarikçi) that had nothing to do with `user_roles`. It now reads the real
   table. `ProtectedRoute` admits ANY `user_roles` row to the whole panel and
   no view gates by role, so every role is shown with full panel access —
   the truthful matrix until per-role gating exists. */
const ROLE_LABELS: Record<string, string> = {
  admin: "Yönetici",
  staff: "Personel",
  production: "Üretim",
  quality: "Kalite",
};

const RoleRegister = () => {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [failed, setFailed] = useState(false);
  const [notAdmin, setNotAdmin] = useState(false);

  /* Only admins hold the RLS policy that exposes every `user_roles` row; for
     staff, production and quality the same query returns their own row
     alone, which would read as a census with every other role at zero. So
     the register is shown to admins only. */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { if (alive) setNotAdmin(true); return; }
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (!alive) return;
      if (roleError) { setFailed(true); return; }
      if (!isAdmin) { setNotAdmin(true); return; }
      const { data, error } = await supabase.from("user_roles").select("role");
      if (!alive) return;
      if (error) { setFailed(true); return; }
      const next: Record<string, number> = {};
      for (const row of data ?? []) next[row.role] = (next[row.role] ?? 0) + 1;
      setCounts(next);
    })();
    return () => { alive = false; };
  }, []);

  if (failed) return <p className="text-sm text-red-400">Roller okunamadı.</p>;
  if (notAdmin) return <p className="text-sm text-slate-400">Rol sayımı yalnızca yöneticilere gösterilir.</p>;
  if (!counts) return <p className="text-sm text-slate-400">Roller yükleniyor…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
          <th className="text-left pb-3">Rol</th>
          <th className="text-left pb-3">Kullanıcı</th>
          <th className="text-left pb-3">Panel erişimi</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <tr key={role} className="dark:border-[#334155]/50 border-slate-100 border-b">
            <td className="py-3 font-bold dark:text-white text-slate-800">{label}</td>
            <td className="py-3 font-mono dark:text-slate-300 text-slate-600">{counts[role] ?? 0}</td>
            <td className="py-3 text-xs dark:text-slate-300 text-slate-600">Tüm görünümler (rol bazlı kısıtlama tanımlı değil)</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const SettingsView = () => {
  const [active, setActive] = useState(0);
  const [params, setParams] = useState(defaultParams);
  const [apiSettings, setApiSettings] = useState(defaultApiSettings);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.params) setParams(parsed.params);
      if (parsed.apiSettings) setApiSettings(parsed.apiSettings);
    }
  }, []);

  const handleParamChange = (key: keyof typeof defaultParams, value: string) => {
    setParams((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem("nexus-settings", JSON.stringify({ params, apiSettings }));
    setDirty(false);
    toast.success("Ayarlar kaydedildi");
  };

  const paramFields = [
    { key: "cncRate" as const, label: "CNC Saatlik Ücret (₺/saat)" },
    { key: "laborRate" as const, label: "İşçilik Ücreti (₺/saat)" },
    { key: "profitMargin" as const, label: "Kar Marjı (%)" },
    { key: "wasteRate" as const, label: "Fire Oranı (%)" },
  ];

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                active === i ? "bg-[#0AA2CD] text-white" : "dark:bg-[#1E293B] bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-[#0AA2CD]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors animate-[fadeInUp_0.2s_ease-out]"
          >
            <Save className="w-3.5 h-3.5" />
            Kaydet
          </button>
        )}
      </div>

      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border p-6">
        {active === 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Üretim Parametreleri</h3>
            {paramFields.map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-4">
                <label className="text-sm dark:text-slate-300 text-slate-600">{p.label}</label>
                <input
                  value={params[p.key]}
                  onChange={(e) => handleParamChange(p.key, e.target.value)}
                  className="w-32 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 text-right font-mono tabular-nums focus:outline-none focus:border-[#0AA2CD]"
                />
              </div>
            ))}
          </div>
        )}
        {active === 1 && (
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Üretim Aşamaları</h3>
            <div className="space-y-2">
              {["Hammadde", "Hazırlık", "İşleme", "Final", "Kalite Kontrol", "Tamamlandı"].map((s, i) => (
                <div key={s} className="flex items-center gap-3 dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
                  <span className="text-xs font-bold text-[#0AA2CD]">{i + 1}</span>
                  <span className="text-sm dark:text-white text-slate-800">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {active === 2 && (
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rol Yönetimi</h3>
            <div className="overflow-x-auto">
              <RoleRegister />
            </div>
          </div>
        )}
        {active === 3 && (
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">API & Nexus Çekirdeği</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
                <span className="text-sm dark:text-slate-300 text-slate-600">E-posta Bildirimleri</span>
                <Switch
                  checked={apiSettings.emailNotifications}
                  onCheckedChange={(v) => { setApiSettings((s) => ({ ...s, emailNotifications: v })); setDirty(true); }}
                />
              </div>
              <div className="flex items-center justify-between dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
                <span className="text-sm dark:text-slate-300 text-slate-600">Realtime Sync</span>
                <Switch
                  checked={apiSettings.realtimeSync}
                  onCheckedChange={(v) => { setApiSettings((s) => ({ ...s, realtimeSync: v })); setDirty(true); }}
                />
              </div>
              <div className="dark:bg-[#0F172A] bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">API Key</p>
                <code className="text-xs text-[#0AA2CD] dark:bg-[#1E293B] bg-slate-100 px-3 py-1.5 rounded block font-mono">nxs_live_•••••••••••••••k4f2</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
