import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { findBestFaqMatch } from "@/data/chatFaqData";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/** Fire-and-forget analytics log to faq_analytics table */
function logChatEvent(eventType: string, query: string, question?: string, category?: string) {
  supabase.from("faq_analytics").insert({
    event_type: eventType,
    query,
    question: question ?? null,
    category: category ?? null,
  }).then(() => {});
}

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const AI_DAILY_LIMIT = 5;
const AI_LIMIT_KEY = "mas_chat_ai_count";

function getAiUsageToday(): number {
  try {
    const raw = localStorage.getItem(AI_LIMIT_KEY);
    if (!raw) return 0;
    const { count, date } = JSON.parse(raw);
    if (date !== new Date().toDateString()) return 0;
    return count;
  } catch { return 0; }
}

function incrementAiUsage() {
  const current = getAiUsageToday();
  localStorage.setItem(AI_LIMIT_KEY, JSON.stringify({ count: current + 1, date: new Date().toDateString() }));
}

async function streamChat({
  messages, onDelta, onDone, onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (e: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => null);
    onError(data?.error || "Bir hata oluştu.");
    return;
  }

  if (!resp.body) { onError("Stream başlatılamadı."); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { /* partial */ }
    }
  }
  onDone();
}

const quickQuestions = [
  "Hangi CNC hizmetleri sunuyorsunuz?",
  "Prototip üretimi yapıyor musunuz?",
  "Teklif nasıl alabilirim?",
];

export function ChatBot() {
  const { pathname } = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const addAssistantMsg = useCallback((content: string) => {
    setMsgs((prev) => [...prev, { role: "assistant", content }]);
  }, []);

  const callAi = useCallback(
    async (text: string, history: Msg[]) => {
      if (getAiUsageToday() >= AI_DAILY_LIMIT) {
        addAssistantMsg("⚠️ Günlük AI kullanım limitine ulaştınız. Lütfen yarın tekrar deneyin veya [Teklif Al](/teklif-al) sayfamızdan bize ulaşın.");
        setLoading(false);
        return;
      }
      incrementAiUsage();
      setLoading(true);
      let assistantSoFar = "";
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMsgs((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };
      try {
        await streamChat({
          messages: history,
          onDelta: upsert,
          onDone: () => setLoading(false),
          onError: (e) => {
            addAssistantMsg(`⚠️ ${e}`);
            setLoading(false);
          },
        });
      } catch {
        addAssistantMsg("⚠️ Bağlantı hatası. Lütfen tekrar deneyin.");
        setLoading(false);
      }
    },
    [addAssistantMsg]
  );

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      // Kullanıcı AI onayına "Evet" dedi
      if (pendingAiPrompt && (text.trim().toLowerCase() === "evet" || text.trim() === "👍")) {
        const userMsg: Msg = { role: "user", content: pendingAiPrompt };
        const newMsgs = [...msgs, { role: "user" as const, content: text.trim() }];
        setMsgs(newMsgs);
        setInput("");
        setPendingAiPrompt(null);
        // AI'ya orijinal soruyu gönder
        await callAi(pendingAiPrompt, [...msgs.filter(m => m.content !== "🤖 Bu soruyu daha detaylı yanıtlamak için AI asistanı kullanmamı ister misiniz? (Günlük limit: " + AI_DAILY_LIMIT + " mesaj)\n\n**Evet** yazarak onaylayabilirsiniz."), userMsg]);
        return;
      }

      // Hayır/iptal
      if (pendingAiPrompt && (text.trim().toLowerCase() === "hayır" || text.trim().toLowerCase() === "iptal")) {
        setPendingAiPrompt(null);
        setMsgs((prev) => [...prev, { role: "user", content: text.trim() }, { role: "assistant", content: "Tamam! Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım. 😊" }]);
        setInput("");
        return;
      }

      setPendingAiPrompt(null);
      const userMsg: Msg = { role: "user", content: text.trim() };
      const newMsgs = [...msgs, userMsg];
      setMsgs(newMsgs);
      setInput("");

      // 1. Yerel FAQ eşleştirme
      const match = findBestFaqMatch(text);
      if (match) {
        logChatEvent("faq_match", text.trim(), match.entry.question, "chatbot");
        addAssistantMsg(match.entry.answer);
        return;
      }

      // 2. Eşleşme yok → AI onayı iste
      logChatEvent("ai_fallback", text.trim(), undefined, "chatbot");
      const remaining = AI_DAILY_LIMIT - getAiUsageToday();
      if (remaining <= 0) {
        addAssistantMsg("⚠️ Günlük AI kullanım limitine ulaştınız. Lütfen yarın tekrar deneyin veya [Teklif Al](/teklif-al) sayfamızdan bize ulaşın.");
        return;
      }

      setPendingAiPrompt(text.trim());
      addAssistantMsg(`🤖 Bu soruyu daha detaylı yanıtlamak için AI asistanı kullanmamı ister misiniz? (Kalan: ${remaining} mesaj)\n\n**Evet** veya **Hayır** yazarak yanıtlayın.`);
    },
    [msgs, loading, pendingAiPrompt, addAssistantMsg, callAi]
  );

  if (pathname === "/") return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            data-chat-launcher
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            exit={reducedMotion ? undefined : { scale: 0 }}
            whileHover={reducedMotion ? undefined : { scale: 1.1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            onClick={() => setOpen(true)}
            className="fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl md:h-14 md:w-14"
            style={{
              bottom: "calc(5.75rem + var(--shell-safe-bottom))",
              right: "max(1rem, var(--shell-safe-right))",
            }}
            aria-label="Sohbet aç"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed z-50 flex h-[min(520px,calc(100dvh-7rem))] w-[380px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:max-h-[calc(100vh-4rem)]"
            style={{
              bottom: "calc(5.5rem + var(--shell-safe-bottom))",
              right: "max(0.75rem, var(--shell-safe-right))",
            }}
            role="dialog"
            aria-modal="false"
            aria-label="MAS Technic sohbet asistanı"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
              <Bot className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">MAS Technic Asistan</p>
                <p className="text-xs opacity-80">CNC & İmalat Uzmanı</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-[rgb(var(--text-primary-rgb)/0.2)] transition-colors"
                aria-label="Sohbeti kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.length === 0 && (
                <div className="space-y-3">
                  <div className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 text-sm text-foreground">
                      Merhaba! 👋 MAS Technic asistanıyım. CNC işleme, imalat ve hizmetlerimiz hakkında sorularınızı yanıtlayabilirim.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-9">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}

              {loading && msgs[msgs.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* AI onay butonları */}
              {pendingAiPrompt && !loading && (
                <div className="flex gap-2 ml-9">
                  <button
                    onClick={() => send("Evet")}
                    className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    ✅ Evet
                  </button>
                  <button
                    onClick={() => send("Hayır")}
                    className="text-xs px-4 py-1.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-colors"
                  >
                    ❌ Hayır
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 px-3 py-3 border-t border-border bg-background"
            >
              <input
                aria-label="Sohbet mesajı"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                disabled={loading}
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label="Mesajı gönder"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
