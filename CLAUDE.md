# CLAUDE.md — Mas Technic / Precision Dynamics Hub

> Master AI loader. Claude Code bu dosyayı her session başında otomatik okur.
> ≤5K token hedefi. Detay için ilgili lean doc'a bak.

---

## Proje Kimliği

**Şirket:** Mas Technic — CNC Hassas İmalat, İzmir  
**Repo:** precision-dynamics-hub  
**Platform:** Claude Code (primary, 2026-05-12'den itibaren — Lovable terk edildi)  
**Branch kuralı:** Her feature için `claude/[kısa-açıklama]` branch'i aç  
**Deploy:** Lovable.dev preview (mas-technic-precision.lovable.app)

---

## Stack (Hızlı Tablo)

| Katman | Teknoloji | Versiyon |
| -------- | ----------- | --------- |
| Framework | React | 18.3.1 |
| Dil | TypeScript | 5.8.3 |
| Build | Vite + SWC | 5.4.19 |
| CSS | Tailwind CSS | 3.4.17 |
| UI | shadcn/ui (Radix) | Latest |
| Motion | GSAP + ScrollTrigger | 3.14.2 |
| Motion | Framer Motion | 12.34.0 |
| Scroll | Lenis | 1.3.19 |
| 3D | Three.js + R3F + Drei | 0.170.0 |
| Backend | Supabase (PostgreSQL) | SDK ^2.95.3 |
| Routing | React Router DOM | 6.30.1 |
| State | TanStack Query | 5.83.0 |

---

## Kritik Dosya Yolları

```text
src/
  App.tsx                          ← Root: router, providers, lazy routes
  index.css                        ← Global CSS, forge tokens, utilities
  styles/z-index.ts                ← Z ve SECTION_Z objeleri — dokunmadan önce oku
  components/
    providers/SmoothScrollProvider.tsx  ← Lenis + GSAP ticker entegrasyonu
    HeroSection.tsx                ← 4-phase GSAP scroll choreography
    HeadlineStagger.tsx            ← Character stagger animation
    CustomCursor.tsx               ← Desktop cursor (>901px, pointer:fine)
    BrutalCrosshairCursor.tsx      ← Landing page crosshair cursor
    PageTransition.tsx             ← Clip-path page transition
  hooks/
    use-gsap.ts                    ← GSAP + ScrollTrigger re-export
    use-reduced-motion.ts          ← prefers-reduced-motion hook
    useScrollVelocity.ts           ← Scroll hızı ölçümü
    useInViewClass.ts              ← IO ile "bir kez" efekt sınıfı (GSAP'sız, mobil dahil)
  pages/Index.tsx                  ← Landing page (tüm sections)
docs/lean/                         ← Phase 1 lean dokümantasyon
snippets/                          ← Geçici pattern referansları (AI okumaz)
```

---

## Session Protokolü

1. **Session başında:** ACTIVE_TASK.md oku → aktif task ve constraint'leri öğren
2. **Task başlamadan:** Constraint'leri tekrar et, onay bekle
3. **10+ mesaj sonra:** Mid-session anchor — "Şu ana kadar ne yaptık, constraint'ler neler?"
4. **Yeni major task:** `/clear` ile yeni session aç
5. **Her commit öncesi:** `npm run build` geçmeli

---

## Todo Oluşturma Kuralı

Plan'daki HER adım todo'ya girer.  
"Snippet damıtma", "cleanup", "doc silme" görev değilmiş gibi görünse de zorunlu adımdır.  
Atlanamaz. Selective reading yasaktır.

---

## Context Yükleme Protokolü

```text
L0 — Her session (otomatik):
  CLAUDE.md + MASTER_CONTEXT.md + ACTIVE_TASK.md  (≤5K token)

L1 — Task'a göre (manuel seç, max 2-3 dosya, ≤3K token):
  Motion task    → docs/lean/07-motion-system.md + docs/lean/motion-tokens.json
  Component task → ilgili component-spec + docs/lean/13-forbidden-patterns.md
  Architecture   → docs/lean/14-animation-architecture.md + docs/lean/11-app-architecture.md
  Yeni feature   → docs/lean/ai-coding-rules.md + docs/lean/13-forbidden-patterns.md

L2 — Referans (AI'a yükleme, sen okursun):
  snippets/ klasörü → @snippets/gsap/[dosya] ile referans ver

Kural: Çelişki çıkarsa MASTER_CONTEXT.md kazanır.
```

---

## Forbidden Actions (Dokunma)

- `supabase/` ve `docs/supabase-full-setup.sql` — schema değişikliği yok
- `/admin/*` ve `/musteri-paneli/*` route'ları — silme veya büyük değişiklik yok
- Yeni npm package ekleme — GSAP, Lenis, Three.js zaten mevcut; başka ekleme yok
- SSR context'te GSAP kullanma — React Router CSR-only
- Lenis'i mobile'da aktif bırakma — `<768px` native scroll + snap
- Z objesi dışında z-index kullanma — `src/styles/z-index.ts` tek kaynak
- Hardcoded hex/rgb renk — CSS custom property kullan

---

## Animation Kuralları (Özet)

```typescript
// ✅ Her component kendi context'ini yönetir
useEffect(() => {
  const ctx = gsap.context(() => { /* animations */ }, containerRef)
  return () => ctx.revert()  // cleanup zorunlu
}, [])

// ✅ Reduced motion her zaman kontrol edilir
const prefersReduced = usePrefersReducedMotion()
if (prefersReduced) { /* skip veya instant state */ }

// ❌ gsap.registerPlugin birden fazla yerde çağrılmaz
// ❌ Framer Motion ve GSAP aynı elemana uygulanmaz
// ❌ Three.js canvas IntersectionObserver olmadan mount edilmez
```

---

## Snippet Workflow

```text
1. Repo clone'la → git clone https://github.com/[repo] /tmp/ref-[isim]
2. Pattern analiz et → Claude Code ile incele
3. Snippets'e damıt → snippets/gsap/[pattern].ts
4. Reference ver → @snippets/gsap/[pattern].ts
5. Implement sonrası → snippets'ten sil, ROADMAP.md'de işaretle
```

---

## Awwwards Hedefi

**Hedef:** Site of the Day (SOTD) — 2026-08-13'te kullanıcı tarafından yükseltildi  
**Estetik:** Premium Industrial — brutalist + DIGITALWERK cinematic scroll  
**5 Kriter:** Design ≥7.5, Usability ≥7.5, Creativity ≥7.5, Content ≥8, Developer ≥8  
**Lighthouse:** Performance ≥90, LCP <2.5s, CLS <0.1

---

<!-- BEGIN: AUTONOMOUS_AWWWARDS_RUN EXCEPTION (Phase 00) -->

## Otonom Koşu İstisnası — AUTONOMOUS_AWWWARDS_RUN

> **Kural:** `IMPLEMENTATION.md` aktifken ve `PROGRESS.md` modu `AUTONOMOUS_AWWWARDS_RUN`
> olarak işaretlediğinde, ajan faz onayı için duraklamaz. Bunun yerine
> `IMPLEMENTATION.md` içindeki durma (stop) kurallarını uygular.
>
> *(EN: When `IMPLEMENTATION.md` is active and `PROGRESS.md` marks mode as
> `AUTONOMOUS_AWWWARDS_RUN`, the agent must not pause for phase approval. It
> follows the stop rules in `IMPLEMENTATION.md` instead.)*

**Kapsam ve sınırlar:**

- Bu istisna **yalnızca bu otonom koşuya** özgüdür. Koşu bittiğinde yukarıdaki
  "Session Protokolü" maddesi 2'deki normal onay bekleme davranışı geri geçerlidir.
- İstisna **sadece faz onayı duraklamasını** kaldırır. Yukarıdaki
  **Forbidden Actions**, **Animation Kuralları**, **Context Yükleme Protokolü**,
  **Todo Oluşturma Kuralı** ve diğer tüm güvenlik kuralları aynen yürürlüktedir;
  hiçbiri zayıflatılmaz, gevşetilmez veya atlanmaz.
- Yıkıcı/geri alınamaz işlemler (production deploy, production DB/şema mutasyonu,
  paylaşılan geçmişe force-push, kimlik bilgisi rotasyonu, DNS değişikliği,
  korumalı `main`'e merge) hâlâ **durma** koşuludur — `IMPLEMENTATION.md` §1.4.
- Başarısız bir test durma koşulu **değildir**; düzeltme döngüsünü tetikler.

**Öncelik sırası (`IMPLEMENTATION.md` §1.1 — bu koşu süresince geçerlidir):**

1. `IMPLEMENTATION.md`
2. `USER_INPUTS.md`
3. Mevcut production kodu ve depo testleri
4. `MASTER_CONTEXT.md`
5. `CLAUDE.md`  ← bu dosya
6. Diğer dokümanlar / eski planlar / tarihsel referanslar

Yani bu koşu süresince `IMPLEMENTATION.md` bu dosyayla çelişirse `IMPLEMENTATION.md`
kazanır. `USER_INPUTS.md` içinde bir bilginin **doğru** olması onun **yayımlanabilir**
olduğu anlamına gelmez; yayın izni ayrı bir karardır.

<!-- END: AUTONOMOUS_AWWWARDS_RUN EXCEPTION (Phase 00) -->

---

*Detay için:* `docs/lean/` klasörüne bak  
*Güncel task için:* `ACTIVE_TASK.md` oku  
*Tam bağlam için:* `MASTER_CONTEXT.md` oku
