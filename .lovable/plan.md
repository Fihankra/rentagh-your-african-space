## RentaGh — v1 Build Plan

A premium, mobile-first, static (no backend) marketing + browse experience for RentaGh. All 9 categories surfaced from the homepage. Designed to feel investor-ready and unmistakably African-premium — not a SaaS template.

### Scope (this pass)
- Landing page (cinematic)
- Listings browse page (grid + filters, mock data)
- Property detail page (gallery, map placeholder, nearby landmarks, booking/inquiry CTA — all static)
- Category landing variants reachable from homepage entry points
- Fully responsive, PWA-ready (no service worker yet)
- No auth, no database, no payments — mocked data in `src/lib/mock-properties.ts`

### Routes
```
/                      Landing (hero, search, categories, featured, hostels, hotels, lands, testimonials, app promo)
/browse                All listings grid with filters (category, region, price, beds)
/browse/$category      Same grid filtered by category slug
/property/$id          Property detail (gallery, specs, map, landmarks, host card, inquiry)
/about                 Brand story
/contact               Contact form (static)
```

Each route gets its own `head()` with unique title/description/og tags.

### Design system (src/styles.css)
Brand tokens locked in oklch:
- `--primary` Deep Emerald `#014421`
- `--accent` Gold `#D4A437`
- `--background` Cream `#F8F6F1`
- `--foreground` Charcoal `#1B1B1B`
- `--muted` Soft Gray `#EAEAEA`
- `--card` White
- Custom: `--gradient-hero`, `--shadow-elegant`, `--shadow-card`, generous radius scale

Typography: serif display for headings (Fraunces or Cormorant), clean sans for body (Inter). Large spacing, restrained motion, no gradient overload.

### Key components
- `SiteHeader` — translucent on hero, solid on scroll; logo + nav + "List your property" CTA
- `SiteFooter` — premium multi-column with newsletter, app badges, social
- `SearchBar` — pill-shaped, category / location / dates / guests
- `CategoryRail` — 9 categories with custom iconography (Homes, Apartments, Houses for Sale, Lands, Farmlands, Commercial, Hostels, Hotels & Stays, Vacation)
- `PropertyCard` — image carousel, verified badge, price, location, specs
- `FeaturedCarousel` — horizontal scroll with snap
- `RegionGrid` — Accra, Kumasi, Takoradi, Tamale, Cape Coast, etc.
- `Testimonials`, `StatsBand`, `AppPromo`
- `Gallery` (detail page) — lightbox-style full-screen viewer
- `MapPlaceholder` — styled static map preview with pin (Mapbox/Google can be wired later)
- `NearbyLandmarks` — list with distance chips
- `InquirySheet` — booking/inquiry slide-over (static submit)

### Imagery
Generate ~10 hero/section images via imagegen (premium tier for hero): Ghanaian villa exteriors, Accra skyline interiors, farmland aerials, coastal hotels, hostel rooms, market-area commercial. Store under `src/assets/`. Logo from `user-uploads://Logo.png` copied to `src/assets/logo.png`.

### Mock data
`src/lib/mock-properties.ts` with ~24 listings spanning all 9 categories and major Ghanaian regions, each with images, price, GHS currency, specs, coordinates, and 5–8 nearby landmarks.

### Out of scope (future passes)
- Auth & role dashboards (admin, landlord, agent, hotel, hostel)
- Lovable Cloud schema, RLS, listings CRUD
- Real Mapbox/Google Maps integration
- MoMo / card payments, escrow, wallet
- In-app messaging, notifications
- Native Android/iOS apps

### Technical notes
- TanStack Start file-based routes under `src/routes/`
- Each major section is its own component in `src/components/landing/` and `src/components/property/`
- Semantic tokens only — no hard-coded hex in components
- Lazy-load below-the-fold images; `loading="lazy"` + responsive `srcset` where appropriate
- Light mode only for v1 (dark mode can come later)
