# RentaGh — Project Plan & Progress

Ghana property platform for **Student Hostels, Houses for Rent, Building Lands, Farm Lands** (rent & sale).
Brand: Deep Emerald #014421, Gold #D4A437, Cream #F8F6F1. Mobile-first African luxury aesthetic.

---

## 1. Done

### Design & content
- Brand design system (colours, display/body fonts with preloading + swap fallback), no gradients, no eyebrow labels.
- Homepage: hero with location search, category rail (mobile cards equal size), featured listings, per-category spotlights, regions, testimonials, stats, app promo.
- Ghanaian imagery, consistent 4:3 crops for hostel/category/listing cards.
- Pages: Home, Browse, Browse by category, Property detail, About, Contact, FAQs, Terms & Conditions, Login, Reset password.
- Navigation: Houses, Hostels, Lands, Terms & Conditions, FAQs, Contact Us, Login (auth-aware).
- SEO: unique titles/descriptions, canonical, Open Graph/Twitter tags per page, robots.txt.

### Backend (Supabase project "Renta Ghana")
- Auth: email/password signup, login, password reset; profile auto-created on signup.
- Tables: profiles, user_roles, category_metadata, properties, property_images, property_landmarks.
- Four fixed categories; access rules so visitors see only published listings, owners see their own, admins see everything.
- Photo storage bucket (private, 10 MB per file) with secure long-lived photo links.

### Features
- Owner dashboard: listing count, own listings, add-listing button.
- Listing creation form for all four categories with photos, amenities, nearby landmarks; only admins can publish or feature.
- Admin dashboard: overview stats, category label/tagline editing, listing publish/feature control, user list with promote/demote admin.
- Onboarding: first signed-in person can claim the administrator role from the dashboard, then promote others.
- All listing surfaces now read real database listings (sample data removed).
- Full TypeScript typing, clean build.

---

## 2. Known gaps / blocked

| Item | Status |
| --- | --- |
| Public photo URLs | Blocked — workspace policy forbids public buckets. Enable public storage in workspace Settings → Privacy & Security, then flip the bucket. |
| Empty site | Listing pages are empty until real listings are added and published. |
| Sitemap.xml | Waiting on a live domain. |
| Ratings/reviews shown on cards | Currently placeholder numbers, not real data. |

---

## 3. Next up (recommended order)

1. **Seed real content** — add first listings, publish them, confirm homepage/browse/detail look right.
2. **Listing management** — edit and delete own listings, draft/published toggle for owners, image reordering and cover selection.
3. **Enquiries/messaging** — enquiry form on property pages storing leads, owner inbox, email notification.
4. **Real reviews & ratings** — reviews table tied to listings, replace placeholder numbers.
5. **Saved listings** — favourites for signed-in users.
6. **Search upgrades** — price range, beds/baths, land size, sort options, pagination.
7. **Verification badge** — admin-controlled verified flag instead of always-true.
8. **Payments** — MoMo/card payments and escrow flow (currently copy only, no processing).
9. **Maps** — real map on property pages (client-only) replacing the placeholder.
10. **Profile settings** — name, phone, avatar upload.
11. **Analytics & SEO** — sitemap once domain is live, structured data for listings.
12. **PWA / native apps** — install prompt, offline shell; native apps later.

---

## 4. Notes for future sessions

- Framework is TanStack Start; routes live in `src/routes`, server logic in `src/lib/*.functions.ts`.
- Database changes go through migrations, never by hand.
- Categories are fixed: `hostels`, `homes`, `lands`, `farmlands`.
- Only admins may publish or feature a listing; this is enforced on the server.
