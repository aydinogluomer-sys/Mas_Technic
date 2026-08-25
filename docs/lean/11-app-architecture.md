# 11 · App Architecture — Mas Technic

## Rendering Stratejisi

**CSR-only** — Client Side Rendering, Next.js/SSR yok.  
Vite ile bundle, React Router ile client-side routing.  
GSAP SSR context'te çalışmaz — bu mimari kasıtlı.

---

## Routing Mimarisi

```typescript
// src/App.tsx — root router
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/" element={<Index />} />
    <Route path="/hizmetler/:slug" element={<ServiceDetail />} />
    <Route path="/:category" element={<CategoryPage />} />
    /* ... 23 route */

    {/* Korumalı — Admin */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    } />

    {/* Korumalı — Müşteri */}
    <Route path="/musteri-paneli" element={
      <CustomerProtectedRoute>
        <MusteriPaneli />
      </CustomerProtectedRoute>
    } />
  </Routes>
</BrowserRouter>
```

**Lazy loading:** Tüm pages React.lazy() + Suspense.  
**Fallback:** `<PageLoader />` — skeleton spinner.

---

## Provider Hiyerarşisi

```
QueryClientProvider (TanStack Query)
  └── BrowserRouter
        └── SmoothScrollProvider (Lenis — public routes)
              └── App
                    ├── ScrollToTop
                    ├── PageTransition
                    ├── ChatBot (public)
                    ├── CustomCursor / BrutalCrosshairCursor (landing)
                    └── Routes → lazy Pages
```

**SmoothScrollProvider devre dışı:** `/admin`, `/musteri-paneli` route'larında.

---

## State Yönetimi

| State Türü | Araç | Nerede |
|-----------|------|--------|
| Server state | TanStack Query | hooks/queries |
| Local UI state | useState | component-local |
| Form state | React Hook Form | form bileşeni içinde |
| Animation state | GSAP context / Framer motion values | animation hook'ları |
| Theme | localStorage + CSS class | useTheme hook |
| Auth | Supabase Auth + React context | ProtectedRoute |
| Scroll position | window.__lenis | global (Lenis instance) |

Redux veya Zustand kullanılmıyor ve eklenmeyecek.

---

## Component Ownership

### Landing Page Components
`src/components/` root level — 40+ bileşen.  
Sadece `src/pages/Index.tsx` tarafından kullanılır.  
Diğer sayfalar bu bileşenlere dokunmaz.

### Admin Panel
`src/components/admin/` — 23 modül.  
`src/pages/AdminDashboard.tsx` tarafından kullanılır.  
**Dokunulabilir:** Yalnızca admin spesifik değişiklikler.

### Müşteri Portalı
`src/components/musteri/` — 15 bileşen.  
`src/pages/MusteriPaneli.tsx` tarafından kullanılır.  
**Dokunulabilir:** Yalnızca müşteri spesifik değişiklikler.

### UI Library
`src/components/ui/` — shadcn/ui primitives.  
**Genellikle dokunulmaz.** Gerekirse `variant` eklenir.

### R3F (3D)
`src/components/r3f/` — HeroCanvas, LiquidImage, CNCModel.  
IntersectionObserver ile lazy mount — viewport dışındayken devre dışı.

---

## Supabase Entegrasyonu

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Kullanım pattern — her zaman TanStack Query ile wrap
const { data } = useQuery({
  queryKey: ['orders'],
  queryFn: () => supabase.from('orders').select('*')
})
```

**RLS:** Tüm tablolarda aktif. Client-side query'ler kullanıcı rolüne göre filtrelenir.  
**Realtime:** Müşteri portalında sipariş güncellemeleri için kullanılır.

---

## Feature Sınırları

```
Landing page ↔ Admin panel → bağımsız, paylaşılan state yok
Admin panel ↔ Müşteri portalı → bağımsız
Chatbot → tüm public sayfalarda global
3D canvas → IntersectionObserver ile izole
CAD viewer → TeklifAl sayfasına özel
```

---

## File Size Limits

```
Bileşen dosyası: 180 satır max
Hook dosyası: 100 satır max
Veri dosyası: limitli değil (materialsData 500+ item)
Snippet: 50 satır max
```

180 satırı aşıyorsa → sub-component çıkar, dosyayı böl.
