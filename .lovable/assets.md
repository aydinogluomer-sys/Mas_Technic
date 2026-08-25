# Mas Technic — Harici Asset Listesi

Bu dosya, AI video/görsel üretim araçlarından (Kling AI, Runway, Sora vb.) üretilip projeye eklenecek tüm asset'leri tanımlar.

**Hedef konum:** Tüm asset'ler `public/` klasörüne yerleştirilecek.  
**Blokaj:** Bu dosyadaki asset'ler hazır olmadan Faz 2.2, Faz 3.2 ve Faz 3.3 başlatılamaz.

---

## Asset 0.1 — CNC Sequence (120 WebP Frame)

**Kullanım:** `CNCScrollStory.tsx` — Hero scrollytelling canvas animasyonu  
**Hedef konum:** `public/sequence-cnc/frame_0001.webp` ... `frame_0120.webp`

### Kaynak Video

**Süre:** 6 saniye  
**İçerik:** Ham alüminyum billet → exploded CNC parça dönüşümü

**Start frame prompt (Kling AI / Runway / Sora):**
```
Ultra-premium industrial photography, raw aluminum billet, matte black surface,
rim lighting, 85mm f/1.8, Apple-level product shoot, no text, no people
```

**End frame prompt:**
```
Exploded technical diagram, finished aerospace aluminum bracket,
floating components, studio rim lighting, dark background, no text, no people
```

### Frame Çıkarımı

```bash
# Video'dan JPEG frame çıkar
ffmpeg -i cnc_sequence.mp4 -vf fps=20 -q:v 2 frame_%04d.jpg

# JPEG'leri WebP'ye dönüştür (cwebp gerekli)
for f in frame_*.jpg; do
  cwebp -q 80 "$f" -o "public/sequence-cnc/${f%.jpg}.webp"
done

# Veya ImageMagick ile toplu dönüşüm
mogrify -format webp -quality 80 frame_*.jpg
mv frame_*.webp public/sequence-cnc/
```

**Hedef boyutlar:**
- Her frame: 50–80 KB
- Toplam: ~7–9 MB
- Çözünürlük: 1920×1080 veya 1280×720 (16:9)

**Frame kontrolü:**
```bash
ls public/sequence-cnc/ | wc -l   # 120 olmalı
du -sh public/sequence-cnc/        # ~7-9MB olmalı
```

---

## Asset 0.2 — Material Morph Sequence (80 WebP Frame)

**Kullanım:** `MaterialMorphScroll.tsx` — Malzemeler sayfası canvas animasyonu  
**Hedef konum:** `public/sequence-material/frame_0001.webp` ... `frame_0080.webp`

### Kaynak Video

**Süre:** 4 saniye  
**İçerik:** Ham titanyum yüzey → polished anodized finish dönüşümü

**Video prompt:**
```
Macro industrial photography, raw titanium surface texture transforming into
polished anodized aerospace finish, studio lighting, extreme close-up,
no text, no people, seamless loop-ready ending
```

### Frame Çıkarımı

```bash
ffmpeg -i material_morph.mp4 -vf fps=20 -q:v 2 frame_%04d.jpg

for f in frame_*.jpg; do
  cwebp -q 80 "$f" -o "public/sequence-material/${f%.jpg}.webp"
done
```

**Hedef boyutlar:**
- Her frame: 40–60 KB
- Toplam: ~4–5 MB
- Çözünürlük: 1920×1080 veya 1280×720

---

## Asset 0.3 — Machine Loop Video

**Kullanım:** `ServiceDetail.tsx` ve `ParallaxSection.tsx` (depth-3d variant) — ghost arka plan video  
**Hedef konum:** `public/machine-loop.mp4`

### Kaynak Video

**Süre:** 3 saniye (seamless loop)  
**İçerik:** Top-down görünüm, 5-axis CNC tezgah, sparks + coolant

**Video prompt:**
```
Cinematic top-down aerial shot, 5-axis CNC machining center in operation,
aluminum chips flying, coolant spray, dramatic industrial lighting,
dark workshop background, seamless loop, no text, no people
```

### Video Optimizasyonu

```bash
# H.264, 720p, <2MB, loop-ready
ffmpeg -i machine_loop_raw.mp4 \
  -vf scale=1280:720 \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -an \
  -movflags +faststart \
  public/machine-loop.mp4

# Boyut kontrolü
du -sh public/machine-loop.mp4   # <2MB olmalı
```

**Teknik gereksinimler:**
- Format: MP4 (H.264)
- Çözünürlük: 720p (1280×720)
- Boyut: < 2 MB
- Ses: yok (`-an`)
- Loop: son kare → ilk kare geçişi pürüzsüz
- `faststart` flag: web streaming için

---

## Üretim Araçları (Öneri Sırası)

| Araç | Güçlü Olduğu Alan | URL |
|------|-------------------|-----|
| **Kling AI** | Fiziksel malzeme dönüşümleri, makine görselleri | kling.ai |
| **Runway Gen-3** | Kamera hareketi kontrolü, cinematic | runwayml.com |
| **Sora** | Uzun sekanslar, fizik simülasyonu | sora.com |
| **Pika 2.0** | Hızlı iterasyon, kısa clip'ler | pika.art |

---

## Asset Hazırlık Kontrol Listesi (DURUM: ✅ TAMAMLANDI — 2026-04-17)

```
[x] public/sequence-cnc/frame_0001.webp ... frame_0120.webp (120 dosya) ✅
[x] public/sequence-material/frame_0001.webp ... frame_0080.webp (80 dosya) ✅
[x] public/machine-loop.mp4 (418 KB, loop-ready) ✅

[x] Toplam sequence boyutu hedef <14MB ✅
[x] machine-loop.mp4 = 418 KB (<2MB hedefin altında) ✅
[x] Tüm WebP dosyaları doğru çözünürlükte ✅
[x] machine-loop.mp4 sesiz ✅
[x] machine-loop.mp4 faststart flag'i ✅
```

Tüm asset'ler v3.0 release ile production'da aktif.

---

## Klasör Yapısı (Asset'ler Yerleştirildikten Sonra)

```
public/
├── sequence-cnc/
│   ├── frame_0001.webp
│   ├── frame_0002.webp
│   ├── ...
│   └── frame_0120.webp       ← 120 dosya, ~7-9MB toplam
├── sequence-material/
│   ├── frame_0001.webp
│   ├── ...
│   └── frame_0080.webp       ← 80 dosya, ~4-5MB toplam
└── machine-loop.mp4           ← tek dosya, <2MB
```
