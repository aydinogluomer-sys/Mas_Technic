# Font swap shift — after

Base: http://localhost:4197 · fonts held 1200ms for the CLS run · reduced motion on

| vw | route | elements | mean Δtop | max Δtop | moved >1px | Δ doc height | CLS control (blocked) | CLS held (swap happens) | swap CLS |
|---|---|---|---|---|---|---|---|---|---|
| 1280 | / | 328 | 0.18px | 19.4px | 3 | 0px | 0.079 | 0.0817 | **0.0027** |
| 1280 | /hizmetler/cnc-frezeleme | 318 | 51.07px | 74px | 274 | -74px | 0.079 | 0.079 | **0** |
| 1280 | /blog | 142 | 21.66px | 24.8px | 124 | -25px | 0.079 | 0.0887 | **0.0097** |
| 1280 | /kvkk | 142 | 57.09px | 131px | 79 | -131px | 0.079 | 0.0803 | **0.0013** |
| 1280 | /malzemeler | 835 | 1.37px | 24.8px | 47 | -25px | 0.079 | 0.079 | **0** |
| 375 | / | 283 | 19.22px | 58.3px | 275 | -19px | 0 | 0.0109 | **0.0109** |
| 375 | /hizmetler/cnc-frezeleme | 282 | 7.29px | 20.2px | 165 | 2px | 0 | 0.0001 | **0.0001** |
| 375 | /blog | 111 | 14.86px | 30px | 55 | 30px | 0 | 0.0001 | **0.0001** |
| 375 | /kvkk | 113 | 24.36px | 49.6px | 66 | 50px | 0 | 0.0237 | **0.0237** |
| 375 | /malzemeler | 446 | 4.76px | 21px | 101 | 21px | 0.0822 | 0.0002 | **-0.082** |
| — | **mean** | | 20.186px | | | -17.1px | 0.0477 | 0.0444 | **-0.0033** |

## Overlay — one paragraph, 300px column, 20px/1.5, webfont vs fallback face

| vw | route | family | fallback stack | webfont lines / height / 1-line width | fallback lines / height / 1-line width | width ratio | height ratio |
|---|---|---|---|---|---|---|---|
| 1280 | / | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 1280 | / | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1788.3 | 1.006 | 1 |
| 1280 | / | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 1280 | /hizmetler/cnc-frezeleme | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 1280 | /hizmetler/cnc-frezeleme | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1788.3 | 1.0066 | 1 |
| 1280 | /hizmetler/cnc-frezeleme | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 1280 | /blog | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 1280 | /blog | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1788.3 | 1.0066 | 1 |
| 1280 | /blog | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 1280 | /kvkk | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 1280 | /kvkk | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1773.6 | 7 / 210 / 1788.3 | 1.0083 | 1 |
| 1280 | /kvkk | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 1280 | /malzemeler | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 1280 | /malzemeler | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1788.3 | 1.006 | 1 |
| 1280 | /malzemeler | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 375 | / | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 375 | / | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1788.3 | 1.006 | 1 |
| 375 | / | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 375 | /hizmetler/cnc-frezeleme | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 375 | /hizmetler/cnc-frezeleme | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1788.3 | 1.0066 | 1 |
| 375 | /hizmetler/cnc-frezeleme | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
| 375 | /blog | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 375 | /blog | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1776.5 | 7 / 210 / 1788.3 | 1.0066 | 1 |
| 375 | /blog | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2729.8 | 11 / 330 / 2735.1 | 1.0019 | 1 |
| 375 | /kvkk | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 375 | /kvkk | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1773.6 | 7 / 210 / 1788.3 | 1.0083 | 1 |
| 375 | /kvkk | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2729.8 | 11 / 330 / 2735.1 | 1.0019 | 1 |
| 375 | /malzemeler | Space Grotesk | "Space Grotesk Fallback", Arial | 9 / 270 / 2100.7 | 9 / 270 / 2083.2 | 0.9917 | 1 |
| 375 | /malzemeler | Newsreader | "Newsreader Fallback", Georgia | 7 / 210 / 1777.7 | 7 / 210 / 1788.3 | 1.006 | 1 |
| 375 | /malzemeler | IBM Plex Mono | "IBM Plex Mono Fallback", "Courier New" | 11 / 330 / 2736 | 11 / 330 / 2735.1 | 0.9997 | 1 |
