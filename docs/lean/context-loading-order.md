# Context Loading Order — Mas Technic

## L0 — Her Session (Otomatik)

Claude Code `CLAUDE.md`'yi otomatik okur. Ek olarak yükle:

```
CLAUDE.md          ← Otomatik (Claude Code)
MASTER_CONTEXT.md  ← Manuel: @MASTER_CONTEXT.md
ACTIVE_TASK.md     ← Manuel: @ACTIVE_TASK.md
```

**Token limit:** ≤5K toplam  
**Kural:** Bu 3 dosya her session'da — istisna yok.

---

## L1 — Task'a Göre (Manuel Seç)

Task türüne göre 2-3 dosya seç. **Hepsini yükleme.**

```
Motion / Animasyon task:
  @docs/lean/07-motion-system.md
  @docs/lean/motion-tokens.json
  + ilgili component dosyası

Component oluşturma:
  @docs/lean/ai-coding-rules.md
  @docs/lean/13-forbidden-patterns.md
  + mevcut benzer component örneği

Architecture değişikliği:
  @docs/lean/14-animation-architecture.md
  @docs/lean/11-app-architecture.md

Design / Visual task:
  @docs/lean/06-design-system.md
  @docs/lean/design-tokens.json

Responsive fix:
  @docs/lean/09-responsive-rules.md
  + ilgili component

Performance task:
  @docs/lean/07-motion-system.md (performans bölümü)
  @docs/lean/ai-failure-patterns.md (performance hataları)

Yeni feature:
  @docs/lean/ai-coding-rules.md
  @docs/lean/13-forbidden-patterns.md
  @docs/lean/10-tech-stack.md
```

**Token limit:** ≤3K toplam (L1 için)

---

## L2 — Referans (Sen Okursun, AI Okumaz)

```
/snippets klasörü — implementation referansı
  @snippets/gsap/animation-manager-reference.ts
  @snippets/gsap/scrolltrigger-batch.ts
  vb.

Kullanım: Sen oku → anla → AI'a pattern'i açıkla
AI'a direkt @mention ile snippet dosyasını yükleme
— Token bütçesini harcar, genellikle bağlam kaybı olur
```

---

## Token Budget Kuralları

```
L0 (3 dosya):  ≤5K token
L1 (2-3 dosya): ≤3K token
L2 (referans):  0 token (sen okursun)
─────────────────────────
Toplam:         ≤8K token (giriş)
```

8K token'ı geçiyorsa → task çok büyük → böl → yeni session.

---

## Çelişki Çözüm Kuralı

```
L0 vs L1 çelişki → MASTER_CONTEXT.md kazanır
L1 vs L2 çelişki → L1 (lean doc) kazanır
Plan vs kaynak kod çelişki → kaynak kod kazanır
```

Çelişki bulunca → ACTIVE_TASK.md'e yaz → session'da çözüm üret → güncelle.

---

## "Hepsini Yükle" Anti-Pattern

```
❌ "Tüm docs/lean/ klasörünü yükle"
❌ "Bütün bağlamı ver"
❌ 5+ dosya tek seferde

✅ "07-motion-system.md ve motion-tokens.json yükle"
✅ Task spesifik, hedefli seçim
✅ 2-3 dosya maksimum (L1)
```

Fazla context → model dikkatini dağıtır → kalite düşer.

---

## Session Başlangıç Komutu

```
"CLAUDE.md ve ACTIVE_TASK.md oku.
Aktif constraint'leri ve şu anki task'ı söyle.
@docs/lean/[ilgili-doc].md yükle.
Onayımı bekle, sonra başla."
```

---

## Session Sonu Komutu

```
"Bu session'da ne değiştirdi?
ACTIVE_TASK.md'yi güncelle:
- Tamamlanan adımları işaretle
- Yarım kalan varsa not al
- Bir sonraki session için blokerleri yaz"
```
