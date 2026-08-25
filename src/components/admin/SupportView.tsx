import { useEffect, useState } from "react";
import { IndustrialSkeleton } from "@/components/ui/IndustrialSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare, Send, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string | null;
  priority: string | null;
  created_at: string;
  user_id: string;
  order_id: string | null;
}

interface Message {
  id: string;
  message: string;
  is_staff: boolean | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  "in-progress": "bg-amber-500/20 text-amber-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-slate-500/20 text-slate-400",
};

const filterLabels: Record<string, string> = {
  "Tümü": "Tümü", open: "Açık", "in-progress": "İşlemde", resolved: "Çözüldü", closed: "Kapalı"
};

export const SupportView = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Tümü");

  // New ticket modal state
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newTicketForm, setNewTicketForm] = useState({ user_id: "", subject: "", message: "" });
  const [creatingTicket, setCreatingTicket] = useState(false);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, company");
    setProfiles((data as Profile[]) || []);
  };

  const openNewTicketModal = () => {
    setShowNewTicket(true);
    fetchProfiles();
  };

  const createTicketForCustomer = async () => {
    if (!newTicketForm.user_id || !newTicketForm.subject.trim() || !newTicketForm.message.trim()) {
      toast.error("Müşteri, konu ve mesaj zorunludur");
      return;
    }
    setCreatingTicket(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı"); setCreatingTicket(false); return; }

    // Create ticket on behalf of the customer
    const { data: ticketData, error: ticketError } = await supabase.from("support_tickets").insert({
      user_id: newTicketForm.user_id,
      subject: newTicketForm.subject,
      message: newTicketForm.message,
      status: "open",
    } as any).select("id").single();

    if (ticketError || !ticketData) {
      toast.error("Ticket oluşturulamadı");
      setCreatingTicket(false);
      return;
    }

    // Send first message as staff
    await supabase.from("support_messages").insert({
      ticket_id: ticketData.id,
      user_id: session.user.id,
      message: newTicketForm.message,
      is_staff: true,
    });

    toast.success("Müşteriye mesaj gönderildi!");
    setShowNewTicket(false);
    setNewTicketForm({ user_id: "", subject: "", message: "" });
    setCreatingTicket(false);
    fetchTickets();
  };

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    setMsgLoading(true);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
    setMsgLoading(false);
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı"); setSending(false); return; }

    const { error } = await supabase.from("support_messages").insert({
      ticket_id: selected.id,
      user_id: session.user.id,
      message: reply.trim(),
      is_staff: true,
    });
    if (error) { toast.error("Mesaj gönderilemedi"); }
    else { toast.success("Yanıt gönderildi"); setReply(""); openTicket(selected); }
    setSending(false);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId);
    if (error) { toast.error("Güncelleme hatası"); return; }
    toast.success(`Durum "${filterLabels[status]}" olarak güncellendi`);
    fetchTickets();
    if (selected?.id === ticketId) setSelected({ ...selected, status });
  };

  const filters = ["Tümü", "open", "in-progress", "resolved", "closed"];
  const filtered = statusFilter === "Tümü" ? tickets : tickets.filter(t => t.status === statusFilter);

  if (loading) return <IndustrialSkeleton variant="list" rows={5} />;

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === f ? "bg-[#0AA2CD] text-white" : "dark:bg-[#1E293B] bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-[#0AA2CD]"
              }`}>
              {filterLabels[f]} {f !== "Tümü" && `(${tickets.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>
        <button onClick={openNewTicketModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Müşteriye Yaz
        </button>
      </div>

      <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <MessageSquare className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Destek talebi bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 dark:bg-[#1E293B] bg-white z-10">
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest dark:border-[#334155] border-slate-200 border-b">
                  <th className="text-left p-4">Konu</th>
                  <th className="text-left p-4 hidden md:table-cell">Mesaj</th>
                  <th className="text-left p-4">Durum</th>
                  <th className="text-left p-4">Öncelik</th>
                  <th className="text-left p-4 hidden md:table-cell">Tarih</th>
                  <th className="text-left p-4">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => openTicket(t)}
                    className="dark:border-[#334155]/50 border-slate-100 border-b dark:hover:bg-white/5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="p-4 dark:text-white text-slate-800 font-medium">{t.subject}</td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell max-w-[200px] truncate">{t.message}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColors[t.status || "open"]}`}>
                        {filterLabels[t.status || "open"]}
                      </span>
                    </td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 capitalize text-xs">{t.priority || "normal"}</td>
                    <td className="p-4 dark:text-slate-400 text-slate-500 hidden md:table-cell text-xs">{new Date(t.created_at).toLocaleDateString("tr-TR")}</td>
                    <td className="p-4">
                      <button onClick={(e) => { e.stopPropagation(); openTicket(t); }}
                        className="text-xs bg-[#0AA2CD]/10 text-[#0AA2CD] px-3 py-1 rounded font-bold hover:bg-[#0AA2CD]/20">
                        Yanıtla
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b dark:border-[#334155] border-slate-200">
              <div>
                <h3 className="font-black dark:text-white text-slate-800">{selected.subject}</h3>
                <p className="text-xs dark:text-slate-400 text-slate-500 mt-1">{selected.message}</p>
              </div>
              <button onClick={() => setSelected(null)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex gap-2 px-5 py-3 border-b dark:border-[#334155] border-slate-200">
              {["open", "in-progress", "resolved", "closed"].map(s => (
                <button key={s} onClick={() => updateTicketStatus(selected.id, s)}
                  className={`text-[10px] px-3 py-1 rounded-full font-bold transition-colors ${
                    selected.status === s ? statusColors[s] : "dark:bg-slate-700 bg-slate-100 dark:text-slate-400 text-slate-500"
                  }`}>
                  {filterLabels[s]}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px]">
              {msgLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#0AA2CD]" /></div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Henüz mesaj yok</p>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.is_staff ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm ${
                      m.is_staff ? "bg-[#0AA2CD] text-white" : "dark:bg-slate-700 bg-slate-100 dark:text-white text-slate-800"
                    }`}>
                      <p>{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.is_staff ? "text-white/60" : "dark:text-slate-400 text-slate-500"}`}>
                        {m.is_staff ? "Staff" : "Müşteri"} • {new Date(m.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t dark:border-[#334155] border-slate-200 flex gap-2">
              <input value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                placeholder="Yanıt yazın..."
                className="flex-1 px-4 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] text-sm" />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                className="px-4 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket for Customer Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowNewTicket(false)}>
          <div className="dark:bg-[#1E293B] bg-white rounded-xl dark:border-[#334155] border-slate-200 border w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black dark:text-white text-slate-800">Müşteriye Mesaj Gönder</h3>
              <button onClick={() => setShowNewTicket(false)} className="dark:text-slate-400 text-slate-500 hover:text-[#0AA2CD]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Müşteri</label>
                <select value={newTicketForm.user_id} onChange={e => setNewTicketForm(f => ({ ...f, user_id: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] text-sm">
                  <option value="">Seçin...</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name || "İsimsiz"} {p.company ? `(${p.company})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konu</label>
                <input value={newTicketForm.subject} onChange={e => setNewTicketForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] text-sm"
                  placeholder="Konu başlığı..." />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mesaj</label>
                <textarea value={newTicketForm.message} onChange={e => setNewTicketForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg dark:bg-[#0F172A] bg-slate-50 dark:border-[#334155] border-slate-200 border dark:text-white text-slate-800 focus:outline-none focus:border-[#0AA2CD] text-sm min-h-[100px]"
                  placeholder="Mesajınız..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNewTicket(false)} className="flex-1 py-2 dark:bg-slate-700 bg-slate-200 dark:text-slate-300 text-slate-600 rounded-lg text-xs font-bold">İptal</button>
              <button onClick={createTicketForCustomer} disabled={creatingTicket}
                className="flex-1 py-2 bg-[#0AA2CD] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50">
                {creatingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
