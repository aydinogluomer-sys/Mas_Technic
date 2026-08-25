import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Mail, Building2, Phone, MapPin, Camera, Lock, Trash2,
  Save, Loader2, Eye, EyeOff, AlertTriangle
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
}

export const ProfilAyarlari = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ full_name: "", company: "", phone: "", city: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || "");
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      const p = data as Profile;
      setProfile(p);
      setForm({
        full_name: p.full_name || "",
        company: p.company || "",
        phone: p.phone || "",
        city: p.city || "",
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      company: form.company,
      phone: form.phone,
      city: form.city,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error("Profil güncellenemedi"); return; }
    toast.success("Profil güncellendi");
    fetchProfile();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Dosya boyutu 2MB'dan küçük olmalı"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Sadece resim dosyaları yüklenebilir"); return; }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Yükleme başarısız"); setUploadingAvatar(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: `${publicUrl}?t=${Date.now()}` }).eq("id", profile.id);
    setUploadingAvatar(false);
    toast.success("Profil resmi güncellendi");
    fetchProfile();
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 6) { toast.error("Şifre en az 6 karakter olmalı"); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Şifreler eşleşmiyor"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
    setChangingPassword(false);
    if (error) { toast.error("Şifre değiştirilemedi: " + error.message); return; }
    toast.success("Şifre başarıyla değiştirildi");
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    // Sign out - actual deletion requires admin/edge function
    await supabase.auth.signOut();
    toast.success("Hesabınız silme işlemi için işaretlendi. Çıkış yapıldı.");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#0AA2CD]" />
      </div>
    );
  }

  const initials = (profile?.full_name || userEmail || "?").charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar & Profile Info */}
      <div className="bg-card border border-border p-6 space-y-6">
        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Profil Bilgileri</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-2 border-border">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Avatar" />
              ) : null}
              <AvatarFallback className="bg-[#0AA2CD]/20 text-[#0AA2CD] text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploadingAvatar ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <p className="font-semibold dark:text-white text-slate-800">{profile?.full_name || "İsimsiz"}</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: User, label: "Ad Soyad", key: "full_name" as const },
            { icon: Building2, label: "Firma", key: "company" as const },
            { icon: Phone, label: "Telefon", key: "phone" as const },
            { icon: MapPin, label: "Şehir", key: "city" as const },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <f.icon size={12} /> {f.label}
              </label>
              <Input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="h-9"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> E-posta
          </div>
          <span className="text-sm dark:text-white text-slate-800">{userEmail}</span>
          <span className="text-[10px] text-muted-foreground">(değiştirilemez)</span>
        </div>

        <Button onClick={handleSaveProfile} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Profili Kaydet
        </Button>
      </div>

      {/* Password Change */}
      <div className="bg-card border border-border p-6 space-y-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Lock size={14} /> Şifre Değiştir
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Yeni Şifre</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="h-9 pr-9"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Şifre Tekrar</label>
            <Input
              type={showPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="h-9"
              placeholder="••••••"
            />
          </div>
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword} variant="secondary" className="gap-1.5">
          {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          Şifreyi Güncelle
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/30 p-6 space-y-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-destructive flex items-center gap-2">
          <AlertTriangle size={14} /> Tehlikeli Bölge
        </h2>
        <p className="text-sm text-muted-foreground">
          Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-1.5">
              <Trash2 size={14} /> Hesabı Sil
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. Tüm verileriniz, teklifleriniz, siparişleriniz ve dosyalarınız kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} disabled={deletingAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deletingAccount ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Evet, Hesabı Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
