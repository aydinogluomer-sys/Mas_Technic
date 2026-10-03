import { useState, useRef, useEffect, useCallback } from "react";
import { safeLocal } from "@/lib/safe-storage";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/shell/motion";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { findBestFaqMatch } from "@/data/chatFaqData";
import { useSiteData } from "@/i18n/data";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/env";
import { useLocation } from "react-router-dom";
import { Link } from "@/i18n/LocaleLink";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/* ══════════════════════════════════════════════════════════════════════════
   THE LAST PUBLIC WRITE TO `faq_analytics` — PHASE 08 CORRECTION #1, C3

   WHAT WAS HERE
   -------------
   A `logChatEvent()` helper that wrote the visitor's raw message into the
   Supabase `faq_analytics` table on EVERY send, down both branches:

     logChatEvent("faq_match",   text.trim(), match.entry.question, "chatbot")
     logChatEvent("ai_fallback", text.trim(), undefined,            "chatbot")

   `/sss` lost its reads and writes to that same table earlier in this phase.
   This one survived because it lives in a different file — and this launcher
   mounts on EVERY public route except `/`, so the surface it covered was
   larger than the page that got fixed. The site went on logging visitor
   queries server-side while the pages that describe it said otherwise.

   WHY IT HAD TO GO — the same three grounds, none of them about taste
   -------------------------------------------------------------------
     A. `USER_INPUTS.md` §K records `ANALYTICS_PROVIDER: NONE`. Behavioural
        event logging is an analytics provider whether or not it has a vendor
        name; writing one by hand does not exempt it from the recorded policy.
     B. The payload was the visitor's own words, verbatim. On a CNC supplier's
        site the thing a buyer types is a part number, a project code, a
        material spec or their own company name.
     C. This phase rewrote `/cerez-politikasi` and `/gizlilik-politikasi` to
        say the site runs no analytics. The privacy policy's own words are
        "Bu sitede analitik aracı … çalışmaz" and "Site, siz bir form
        doldurmadıkça hiçbir kişisel bilgi toplamaz". Leaving this code in
        would have made a legal page false — which is a worse defect than the
        logging, because it is the page a reader is entitled to rely on.
        The fix is to delete the write. Softening the sentence to match the
        code would invert it.

   NOTHING THE FEATURE NEEDS DEPENDED ON IT
   ----------------------------------------
   Both calls were fire-and-forget: no `await`, no return value read, no state
   derived from the response. FAQ matching is `findBestFaqMatch()` over the
   local `chatFaqData` bundle and never touched the network. So the two
   branches below behave identically with the writes gone — measured by the
   fact that neither branch reads anything the helper produced.

   WHAT THIS COMPONENT STILL SENDS, STATED PLAINLY
   -----------------------------------------------
   One request, and it is the feature rather than telemetry: `POST
   {SUPABASE_URL}/functions/v1/chat` with the conversation, sent ONLY after
   the reader is asked "AI asistanı kullanmamı ister misiniz?" and types
   `Evet`. Until that confirmation, a session is answered entirely from the
   local FAQ bundle and this component makes no network call at all. It stores
   `mas_chat_ai_count` in `localStorage` to hold the reader to the daily AI
   limit; that key is already listed row-by-row in `/cerez-politikasi`.

   That request is not analytics and does not make the "no analytics" sentence
   untrue. It is, however, not itself described anywhere in the legal text —
   reported as a stated gap rather than patched here, because narrowing what a
   legal page promises is not a decision this correction gets to take alone.

   ── CORRECTION #2 CLOSED THAT GAP, AND CORRECTED THE PARAGRAPH ABOVE ──────
   THE SENTENCE ABOVE IS INCOMPLETE, DELIBERATELY LEFT AS WRITTEN. It says the
   conversation goes to `functions/v1/chat` and stops describing it there —
   which is where the escalated draft got its wrong wording ("the site's own
   backend"). The function does not answer. `supabase/functions/chat/index.ts`
   remaps the conversation into Gemini's `role`/`parts` shape at `:22-30`,
   builds `https://generativelanguage.googleapis.com/v1beta/models/
   gemini-2.0-flash:streamGenerateContent` at `:32` and fetches it at `:34`.

     WHAT LEAVES  the message text only — the outbound body is
                  `system_instruction`, `contents`, `generationConfig`
                  (`chat/index.ts:37-44`); no browser header is forwarded.
     WHAT STAYS   everything. The 103-line function holds no Supabase client,
                  no `insert`, no `from(`: this site's database receives
                  nothing from the chat.
     THE GATE     `:216` is the only call site of `callAi()`, reachable only
                  from `:209` (typed `Evet` / `👍`) or `:384` (the button).

   READ ANY LINE OF THIS FILE ALONGSIDE THE FUNCTION BEFORE DESCRIBING IT
   ANYWHERE. `/gizlilik-politikasi` madde 06 and `/cerez-politikasi` madde 03
   now state the whole chain, and the consent block below states it in the
   panel, at the moment of the decision. Change what this component sends and
   those three texts become false the same day.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * `kind` EXISTS SO THE OUTBOUND FILTER IS NEVER KEYED ON A STRING — 09b-2.
 *
 * THE DEFECT. `send()` stripped the AI-consent prompt out of the conversation
 * it forwards by comparing `m.content` against a string LITERAL:
 *
 *   msgs.filter(m => m.content !== "🤖 … (Günlük limit: " + AI_DAILY_LIMIT + " mesaj)\n\n**Evet** yazarak onaylayabilirsiniz.")
 *
 * The prompt the component actually renders had drifted to "(Kalan: N mesaj)
 * … **Evet** veya **Hayır** yazarak yanıtlayın." The literal therefore matched
 * nothing, the filter removed nothing, and the bot's own consent question was
 * forwarded to Google with the conversation.
 *
 * IT WAS INVISIBLE BECAUSE THE LEGAL COPY IS BROAD. `/gizlilik-politikasi`
 * madde 06, `/cerez-politikasi` madde 03 and `/kvkk` madde 04 all say "o ana
 * kadarki yazışma" — the whole conversation so far — which is TRUE of the
 * broken filter and true of the fixed one. Narrow that clause by one word and
 * three legal pages become false the same day, with nothing watching. That is
 * why the fix is structural and why `e2e/09b2-chat-consent-transfer.spec.ts`
 * asserts on the request body rather than on the copy.
 *
 * WHY A FIELD AND NOT AN INDEX. The prompt is identified by what it IS, in
 * state, so the filter cannot drift from the renderer: the same `send()` call
 * that writes the message writes its `kind`. A remembered index would go stale
 * on any insertion; a literal already did.
 */
type Msg = { role: "user" | "assistant"; content: string; kind?: "ai-consent" };

const CHAT_URL = `${SUPABASE_URL}/functions/v1/chat`;
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
  safeLocal.set(AI_LIMIT_KEY, JSON.stringify({ count: current + 1, date: new Date().toDateString() }));
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
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
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

/* Typed consent words, in either public language. */
const YES = new Set(["evet", "yes", "👍"]);
const NO = new Set(["hayır", "iptal", "no", "cancel"]);

const quickQuestions = [
  "Hangi CNC hizmetleri sunuyorsunuz?",
  "Prototip üretimi yapıyor musunuz?",
  "Teklif nasıl alabilirim?",
];

/* Internal links in an answer (`[Teklif Al](/teklif-al)`) stay in the
   reader's locale; anything else opens as a plain link. */
const MARKDOWN_COMPONENTS = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    href && href.startsWith("/") && !href.startsWith("//")
      ? <Link to={href}>{children}</Link>
      : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
};

export function ChatBot() {
  const { pathname } = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const { t } = useTranslation();
  const { faqEntries } = useSiteData();
  const [open, setOpen] = useState(false);
  /* Below 768px the launcher sits over the lower part of the screen, which is
     exactly where the footer's conversion buttons pass while scrolling. It
     steps aside while that row is on screen (same as on footer focus), so it
     never covers "Hemen Teklif Al" / "Bize Ulaşın". */
  const [yieldToFooter, setYieldToFooter] = useState(false);
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let tries = 0;
    let timer = 0;
    const attach = () => {
      const target = document.querySelector(".shell-footer-actions");
      if (!target) {
        if (tries++ < 20) timer = window.setTimeout(attach, 250);
        return;
      }
      observer = new IntersectionObserver(([entry]) => {
        setYieldToFooter(entry.isIntersecting && window.innerWidth < 768);
      });
      observer.observe(target);
    };
    setYieldToFooter(false);
    attach();
    return () => { window.clearTimeout(timer); observer?.disconnect(); };
  }, [pathname]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const addAssistantMsg = useCallback((content: string, kind?: Msg["kind"]) => {
    setMsgs((prev) => [...prev, { role: "assistant", content, kind }]);
  }, []);

  const callAi = useCallback(
    async (text: string, history: Msg[]) => {
      if (getAiUsageToday() >= AI_DAILY_LIMIT) {
        addAssistantMsg(t("⚠️ Günlük AI kullanım limitine ulaştınız. Lütfen yarın tekrar deneyin veya [Teklif Al](/teklif-al) sayfamızdan bize ulaşın."));
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
            addAssistantMsg(`⚠️ ${t(e)}`);
            setLoading(false);
          },
        });
      } catch {
        addAssistantMsg(t("⚠️ Bağlantı hatası. Lütfen tekrar deneyin."));
        setLoading(false);
      }
    },
    [addAssistantMsg, t]
  );

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      // Kullanıcı AI onayına "Evet" dedi
      if (pendingAiPrompt && YES.has(text.trim().toLocaleLowerCase())) {
        setMsgs([...msgs, { role: "user" as const, content: text.trim() }]);
        setInput("");
        setPendingAiPrompt(null);
        /* WHAT LEAVES: the conversation up to the moment of consent, minus the
           bot's own consent questions — which is exactly what the three legal
           pages describe as "o ana kadarki yazışma".

           `msgs` already ENDS with the reader's original question (it was
           pushed at the bottom of this same handler on the turn that produced
           the prompt), so re-appending it here would send it twice. The old
           code did, because its filter was dead and the duplicate was the only
           way the question survived at all. The filter is keyed on state now,
           so the duplicate is not needed and is not sent. */
        await callAi(pendingAiPrompt, msgs.filter((m) => m.kind !== "ai-consent"));
        return;
      }

      // Hayır/iptal
      if (pendingAiPrompt && NO.has(text.trim().toLocaleLowerCase())) {
        setPendingAiPrompt(null);
        setMsgs((prev) => [...prev, { role: "user", content: text.trim() }, { role: "assistant", content: t("Tamam! Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım. 😊") }]);
        setInput("");
        return;
      }

      setPendingAiPrompt(null);
      const userMsg: Msg = { role: "user", content: text.trim() };
      const newMsgs = [...msgs, userMsg];
      setMsgs(newMsgs);
      setInput("");

      // 1. Yerel FAQ eşleştirme
      const match = findBestFaqMatch(text, faqEntries);
      if (match) {
        addAssistantMsg(match.entry.answer);
        return;
      }

      // 2. Eşleşme yok → AI onayı iste
      const remaining = AI_DAILY_LIMIT - getAiUsageToday();
      if (remaining <= 0) {
        addAssistantMsg(t("⚠️ Günlük AI kullanım limitine ulaştınız. Lütfen yarın tekrar deneyin veya [Teklif Al](/teklif-al) sayfamızdan bize ulaşın."));
        return;
      }

      setPendingAiPrompt(text.trim());
      // The `"ai-consent"` kind is what the outbound filter above reads. Write
      // one without it and the bot's own question is forwarded to Google.
      addAssistantMsg(
        t("🤖 Bu soruyu daha detaylı yanıtlamak için AI asistanı kullanmamı ister misiniz? (Kalan: {{remaining}} mesaj)\n\n**Evet** veya **Hayır** yazarak yanıtlayın.", { remaining }),
        "ai-consent",
      );
    },
    [msgs, loading, pendingAiPrompt, addAssistantMsg, callAi, faqEntries, t]
  );

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            data-chat-launcher
            data-yield={yieldToFooter || undefined}
            initial={reducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            exit={reducedMotion ? undefined : { scale: 0 }}
            whileHover={reducedMotion ? undefined : { scale: 1.1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.9 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            onClick={() => setOpen(true)}
            className="chat-launcher fixed z-50 flex h-12 w-12 items-center justify-center md:h-14 md:w-14"
            style={{
              bottom: "calc(5.75rem + var(--shell-safe-bottom))",
              right: "max(1rem, var(--shell-safe-right))",
            }}
            aria-label={t("Sohbet aç")}
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
            aria-label={t("MAS Technic sohbet asistanı")}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
              <Bot className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{t("MAS Technic Asistan")}</p>
                <p className="text-xs opacity-80">{t("CNC & İmalat Uzmanı")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-[rgb(var(--text-primary-rgb)/0.2)] transition-colors"
                aria-label={t("Sohbeti kapat")}
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
                      {t("Merhaba! 👋 MAS Technic asistanıyım. CNC işleme, imalat ve hizmetlerimiz hakkında sorularınızı yanıtlayabilirim.")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-9">
                    {quickQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(t(q))}
                        className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-colors"
                      >
                        {t(q)}
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
                        <ReactMarkdown components={MARKDOWN_COMPONENTS}>{m.content}</ReactMarkdown>
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

              {/* AI onay butonları — ve onayın NEYE verildiğini söyleyen satır.
                  Onay ekranı, onayın sonucunu söylemediği sürece onay değildir:
                  buraya basan okuyucu yazışmasını üçüncü bir tarafa gönderiyor
                  ve bunu bir yasal sayfayı açmadan öğrenemiyordu. Metnin her
                  iddiası kodun kendisinden: `chat/index.ts:32` Gemini uç
                  noktasını kurar, `:34` çağırır. Uyarı, kararın verildiği yerde
                  ve karardan ÖNCE duruyor. */}
              {pendingAiPrompt && !loading && (
                <div className="ml-9 space-y-2">
                  <p className="rounded-lg border border-border px-3 py-2 text-xs leading-snug text-foreground">
                    {t("Evet derseniz o ana kadarki yazışma, sitenin sunucusu üzerinden Google’ın Gemini servisine iletilir. Paylaşmak istemediğiniz parça, ölçü veya firma bilgisini yazmayın —")}{" "}
                    <Link
                      to="/gizlilik-politikasi#sohbet-asistani"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {t("Gizlilik Politikası, madde 06")}
                    </Link>
                    .
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => send(t("Evet"))}
                      className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      ✅ {t("Evet")}
                    </button>
                    <button
                      onClick={() => send(t("Hayır"))}
                      className="text-xs px-4 py-1.5 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-colors"
                    >
                      ❌ {t("Hayır")}
                    </button>
                  </div>
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
                aria-label={t("Sohbet mesajı")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("Mesajınızı yazın...")}
                disabled={loading}
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label={t("Mesajı gönder")}
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
