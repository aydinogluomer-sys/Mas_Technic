import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Loader2, User, Mail, Building2, Phone, MapPin } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  city: string | null;
}

interface ProfilCardProps {
  user: SupaUser;
  profile: Profile | null;
  editing: boolean;
  saving: boolean;
  editForm: { full_name: string; company: string; phone: string; city: string };
  setEditing: (v: boolean) => void;
  setEditForm: (v: { full_name: string; company: string; phone: string; city: string }) => void;
  onSave: () => void;
}

const ProfileRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) => (
  <div className="flex items-center gap-3">
    <Icon size={15} className="text-muted-foreground/50 shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  </div>
);

export const ProfilCard = ({ user, profile, editing, saving, editForm, setEditing, setEditForm, onSave }: ProfilCardProps) => (
  <div className="bg-card border border-border p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Profil Bilgileri</h2>
      {!editing ? (
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs">
          <Edit2 size={14} /> Düzenle
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="text-xs"><X size={14} /></Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="text-xs gap-1.5">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
          </Button>
        </div>
      )}
    </div>

    {editing ? (
      <div className="space-y-3">
        {[
          { label: "Ad Soyad", key: "full_name" as const },
          { label: "Firma", key: "company" as const },
          { label: "Telefon", key: "phone" as const },
          { label: "Şehir", key: "city" as const },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
            <Input value={editForm[f.key]} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} className="h-9" />
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        <ProfileRow icon={User} label="Ad Soyad" value={profile?.full_name} />
        <ProfileRow icon={Mail} label="E-posta" value={user?.email} />
        <ProfileRow icon={Building2} label="Firma" value={profile?.company} />
        <ProfileRow icon={Phone} label="Telefon" value={profile?.phone} />
        <ProfileRow icon={MapPin} label="Şehir" value={profile?.city} />
      </div>
    )}
  </div>
);
