import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Plus, Send, ArrowLeft } from "lucide-react";
import { TicketSkeleton } from "./MusteriSkeletons";
import { toast } from "sonner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string | null;
  priority: string | null;
  order_id: string | null;
  created_at: string;
}

interface Message {
  id: string;
  message: string;
  is_staff: boolean | null;
  created_at: string;
}

const PAGE_SIZE = 20;

const statusColor = (s: string | null) => {
  switch (s) {
    case "open": return "bg-amber-500/10 text-amber-600 border-amber-200";
    case "in_progress": case "in-progress": return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "resolved": return "bg-green-500/10 text-green-600 border-green-200";
    case "closed": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const statusLabel = (s: string | null) => {
  switch (s) {
    case "open": return "Açık";
    case "in_progress": case "in-progress": return "İşlemde";
    case "resolved": return "Çözüldü";
    case "closed": return "Kapalı";
    default: return s || "—";
  }
};

export const DestekTab = () => {
  const isMobile = useIsMobile();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTickets = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await supabase
      .from("support_tickets")
      .select("id, subject, message, status, priority, order_id, created_at")
      .order("created_at", { ascending: false })
      .range(from, to);
    const newItems = (data as Ticket[]) || [];
    setHasMore(newItems.length === PAGE_SIZE);
    if (append) setTickets(prev => [...prev, ...newItems]);
    else setTickets(newItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets(0, false);

    const ticketChannel = supabase
      .channel("customer-tickets-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_tickets" }, (payload) => {
        setTickets(prev => [payload.new as Ticket, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_tickets" }, (payload) => {
        const updated = payload.new as Ticket;
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "support_tickets" }, (payload) => {
        const deleted = payload.old as { id: string };
        setTickets(prev => prev.filter(t => t.id !== deleted.id));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, (payload) => {
        const newMsg = payload.new as { id: string; message: string; is_staff: boolean | null; created_at: string; ticket_id: string };
        if (newMsg.ticket_id) {
          setMessages(prev => ({
            ...prev,
            [newMsg.ticket_id]: [...(prev[newMsg.ticket_id] || []), {
              id: newMsg.id,
              message: newMsg.message,
              is_staff: newMsg.is_staff,
              created_at: newMsg.created_at,
            }],
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ticketChannel); };
  }, [fetchTickets]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedTicket]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchTickets(nextPage, true);
    setLoadingMore(false);
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) { toast.error("Konu ve mesaj zorunludur."); return; }
    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı."); setSubmitting(false); return; }

    const { error } = await supabase.from("support_tickets").insert({
      user_id: session.user.id,
      subject: form.subject,
      message: form.message,
    });
    if (error) { toast.error("Talep oluşturulamadı."); } else {
      toast.success("Destek talebi oluşturuldu!");
      setForm({ subject: "", message: "" });
      setShowNewDialog(false);
    }
    setSubmitting(false);
  };

  const selectTicket = async (ticketId: string) => {
    setSelectedTicket(ticketId);
    if (!messages[ticketId]) {
      const { data } = await supabase
        .from("support_messages")
        .select("id, message, is_staff, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      setMessages(prev => ({ ...prev, [ticketId]: (data as Message[]) || [] }));
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!reply.trim()) return;
    setSendingReply(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Oturum bulunamadı."); setSendingReply(false); return; }

    const { error } = await supabase.from("support_messages").insert({
      ticket_id: ticketId,
      user_id: session.user.id,
      message: reply,
      is_staff: false,
    });
    if (error) { toast.error("Mesaj gönderilemedi."); } else {
      setReply("");
    }
    setSendingReply(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, ticketId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleReply(ticketId);
    }
  };

  const activeTicket = tickets.find(t => t.id === selectedTicket);
  const activeMessages = selectedTicket ? (messages[selectedTicket] || []) : [];

  if (loading) return <TicketSkeleton count={3} />;

  const ticketListContent = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm">Destek Talepleri</h3>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus size={14} /> Yeni Talep
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Destek Talebi</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Konu" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              <Textarea placeholder="Mesajınız..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewDialog(false)}>İptal</Button>
                <Button size="sm" disabled={submitting} onClick={handleSubmit} className="gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Gönder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <MessageSquare size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Henüz destek talebiniz bulunmuyor.</p>
            <p className="text-xs mt-1">Yeni bir destek talebi oluşturun.</p>
          </div>
        ) : (
          <div>
            {tickets.map((t) => (
              <button
                key={t.id}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border ${
                  selectedTicket === t.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
                onClick={() => selectTicket(t.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{t.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] ${statusColor(t.status)}`}>{statusLabel(t.status)}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString("tr-TR")}</span>
                </div>
              </button>
            ))}
            {hasMore && tickets.length > 0 && (
              <div className="flex justify-center py-3">
                <Button variant="ghost" size="sm" disabled={loadingMore} onClick={loadMore} className="text-xs">
                  {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Daha Fazla"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const chatContent = (
    <div className="flex flex-col h-full">
      {activeTicket ? (
        <>
          <div className="p-3 border-b border-border flex items-center gap-3 shrink-0">
            {isMobile && (
              <button onClick={() => setSelectedTicket(null)} className="p-1 rounded hover:bg-muted transition-colors">
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{activeTicket.subject}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={`text-[10px] ${statusColor(activeTicket.status)}`}>{statusLabel(activeTicket.status)}</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(activeTicket.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Initial message */}
            <div className="flex justify-end">
              <div className="max-w-[75%] px-3 py-2 text-[13px] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm" style={{ backgroundColor: "#0688AD" }}>
                <p>{activeTicket.message}</p>
                <span className="block text-[10px] opacity-70 mt-1 text-right">
                  {new Date(activeTicket.created_at).toLocaleString("tr-TR")}
                </span>
              </div>
            </div>

            {activeMessages.map(m => (
              <div key={m.id} className={`flex ${m.is_staff ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 text-[13px] ${
                    m.is_staff
                      ? "bg-primary/10 text-primary rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-sm"
                      : "text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-sm"
                  }`}
                  style={m.is_staff ? undefined : { backgroundColor: "#0688AD" }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                      {m.is_staff ? "MAS Technic" : "Siz"}
                    </span>
                  </div>
                  <p>{m.message}</p>
                  <span className={`block text-[10px] mt-1 text-right ${m.is_staff ? "opacity-50" : "opacity-70"}`}>
                    {new Date(m.created_at).toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {activeTicket.status !== "closed" && activeTicket.status !== "resolved" && (
            <div className="p-3 border-t border-border flex gap-2 shrink-0">
              <Textarea
                placeholder="Yanıtınızı yazın... (Shift+Enter yeni satır)"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => handleKeyDown(e, activeTicket.id)}
                rows={2}
                className="resize-none text-sm"
              />
              <Button size="sm" disabled={sendingReply} onClick={() => handleReply(activeTicket.id)} className="self-end shrink-0">
                {sendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageSquare size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">Bir destek talebi seçin</p>
          <p className="text-xs mt-1">Soldaki listeden bir talep seçerek mesajları görüntüleyin.</p>
        </div>
      )}
    </div>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        {selectedTicket ? chatContent : ticketListContent}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-[calc(100vh-8rem)] border border-border rounded-lg overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
          {ticketListContent}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={40}>
          {chatContent}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
