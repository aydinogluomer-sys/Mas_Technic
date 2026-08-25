import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Preferences {
  email_rfq: boolean;
  email_order: boolean;
  email_quality: boolean;
  email_finance: boolean;
  push_rfq: boolean;
  push_order: boolean;
  push_quality: boolean;
  push_finance: boolean;
}

const defaultPrefs: Preferences = {
  email_rfq: true, email_order: true, email_quality: true, email_finance: true,
  push_rfq: true, push_order: true, push_quality: true, push_finance: true,
};

const categories = [
  { key: "rfq", label: "Teklif Güncellemeleri", desc: "Fiyat teklifleri ve teklif durumu değişiklikleri" },
  { key: "order", label: "Sipariş Durumu", desc: "Sipariş ve üretim ilerleme bildirimleri" },
  { key: "quality", label: "Kalite Raporları", desc: "Yeni kalite raporu ve test sonuçları" },
  { key: "finance", label: "Finansal Belgeler", desc: "Fatura, ödeme ve finansal belge bildirimleri" },
];

export const BildirimTercihleri = () => {
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const { id, user_id, created_at, updated_at, ...rest } = data as any;
        setPrefs(rest as Preferences);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...prefs, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) toast.error("Tercihler kaydedilemedi");
    else toast.success("Bildirim tercihleri güncellendi");
    setSaving(false);
  };

  const toggle = (key: keyof Preferences) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold">Bildirim Tercihleri</h2>
        <p className="text-sm text-muted-foreground mt-1">Hangi olaylarda bildirim almak istediğinizi seçin.</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr,80px,80px] gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <span>Kategori</span>
          <span className="text-center flex items-center justify-center gap-1"><Smartphone size={13} /> Anlık</span>
          <span className="text-center flex items-center justify-center gap-1"><Mail size={13} /> E-posta</span>
        </div>

        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className={`grid grid-cols-[1fr,80px,80px] gap-2 px-4 py-4 items-center ${
              i < categories.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <div>
              <p className="text-sm font-semibold">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
            </div>
            <div className="flex justify-center">
              <Switch
                checked={prefs[`push_${cat.key}` as keyof Preferences]}
                onCheckedChange={() => toggle(`push_${cat.key}` as keyof Preferences)}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={prefs[`email_${cat.key}` as keyof Preferences]}
                onCheckedChange={() => toggle(`email_${cat.key}` as keyof Preferences)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Tercihleri Kaydet
        </Button>
      </div>
    </div>
  );
};
