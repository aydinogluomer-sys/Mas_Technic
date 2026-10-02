# Font swap shift — before

Base: http://localhost:4197 · fonts held 1200ms for the CLS run · reduced motion on

| vw | route | elements | mean Δtop | max Δtop | moved >1px | Δ doc height | CLS control (blocked) | CLS held (swap happens) | swap CLS |
|---|---|---|---|---|---|---|---|---|---|
| 1280 | / | 328 | 25.3px | 51.9px | 242 | -36px | 0.0785 | 0.0826 | **0.0041** |
| 1280 | /hizmetler/cnc-frezeleme | 318 | 49.73px | 74px | 274 | -74px | 0.0785 | 0.0787 | **0.0002** |
| 1280 | /blog | 142 | 21.45px | 26.8px | 124 | -25px | 0.0785 | 0.0883 | **0.0098** |
| 1280 | /kvkk | 142 | 57.57px | 131px | 85 | -131px | 0.0785 | 0.1324 | **0.0539** |
| 1280 | /malzemeler | 835 | 20.45px | 96.3px | 484 | 71px | 0.0785 | 0.0786 | **0.0001** |
| 375 | / | 283 | 37.84px | 88.5px | 275 | -36px | 0 | 0.0107 | **0.0107** |
| 375 | /hizmetler/cnc-frezeleme | 282 | 265.04px | 432.1px | 267 | 432px | 0 | 0.0125 | **0.0125** |
| 375 | /blog | 111 | 108.31px | 231.7px | 98 | 231px | 0 | 0.0154 | **0.0154** |
| 375 | /kvkk | 113 | 211.68px | 349.3px | 99 | 350px | 0 | 0.0445 | **0.0445** |
| 375 | /malzemeler | 446 | 11.57px | 71.7px | 197 | 72px | 0 | 0.0004 | **0.0004** |
| — | **mean** | | 80.894px | | | 85.4px | 0.0393 | 0.0544 | **0.0152** |

## Overlay — one paragraph, 300px column, 20px/1.5, webfont vs fallback face

| vw | route | family | fallback stack | webfont lines / height / 1-line width | fallback lines / height / 1-line width | width ratio | height ratio |
|---|---|---|---|---|---|---|---|
| 1280 | / | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 1280 | / | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1960.8 | 1.103 | 1 |
| 1280 | / | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 1280 | /hizmetler/cnc-frezeleme | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 1280 | /hizmetler/cnc-frezeleme | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1960.8 | 1.1037 | 1 |
| 1280 | /hizmetler/cnc-frezeleme | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 1280 | /blog | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 1280 | /blog | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1960.8 | 1.1037 | 1 |
| 1280 | /blog | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 1280 | /kvkk | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 1280 | /kvkk | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1773.6 | 7 / 210 / 1960.8 | 1.1055 | 1 |
| 1280 | /kvkk | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 1280 | /malzemeler | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 1280 | /malzemeler | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1960.8 | 1.103 | 1 |
| 1280 | /malzemeler | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 375 | / | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 375 | / | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1960.8 | 1.103 | 1 |
| 375 | / | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 375 | /hizmetler/cnc-frezeleme | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 375 | /hizmetler/cnc-frezeleme | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1960.8 | 1.1037 | 1 |
| 375 | /hizmetler/cnc-frezeleme | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
| 375 | /blog | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 375 | /blog | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1960.8 | 1.1037 | 1 |
| 375 | /blog | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2729.8 | 11 / 330 / 2736.5 | 1.0025 | 1 |
| 375 | /kvkk | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 375 | /kvkk | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1773.6 | 7 / 210 / 1960.8 | 1.1055 | 1 |
| 375 | /kvkk | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2729.8 | 11 / 330 / 2736.5 | 1.0025 | 1 |
| 375 | /malzemeler | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 7 / 210 / 1939.7 | 0.9234 | 0.7778 |
| 375 | /malzemeler | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1960.8 | 1.103 | 1 |
| 375 | /malzemeler | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2736.5 | 1.0002 | 1 |
