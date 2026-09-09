## RentaGh — Auth, Database, Admin & Listing Creation Plan

Connect the app to your own Supabase project, add real email/password auth with roles, and build the admin dashboard plus authenticated listing creation forms. Public browse and property-detail pages will read from the database instead of mock data.

### What will be built

1. **Supabase connection & client layer**
   - Install `@supabase/supabase-js`.
   - Add browser client, server publishable client, authenticated-server-function middleware, and bearer-token attacher.
   - Keep env-based config (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, plus server-only `SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY`).

2. **Database schema (one migration)**
   - `profiles` table (linked to `auth.users`), with display name, phone, avatar.
   - `user_roles` table + `app_role` enum (`admin`, `user`) + `has_role` security-definer helper.
   - `property_category` enum and `listing_type` enum (`rent`, `sale`).
   - `properties` table: owner, title, description, category, listing type, price/period, region/city/neighborhood, beds/baths/area, coordinates, status, featured flag, metadata JSONB.
   - `property_images` table: property reference, URL, sort order.
   - `property_landmarks` table: name, kind, distance/time, property reference.
   - `category_metadata` table: slug, label, tagline, icon name, sort order (admin-managed but seeded with the four fixed categories).
   - Supabase Storage bucket `property-images` with RLS policies for owners/admins.
   - RLS policies on every table; `GRANT`s for `authenticated`, `anon` (public reads), and `service_role`.
   - Seed 6–8 published demo properties covering all four categories.
   - `claim_first_admin` RPC so the first signed-up user can become admin; admin users can then promote others.

3. **Authentication UI**
   - Reuse the existing `/login` route and wire it to real Supabase sign-in and sign-up.
   - Show email-confirmation state after sign-up.
   - Add `/reset-password` recovery page.
   - Make `SiteHeader` session-aware: show user menu with dashboard/admin links and Sign Out.
   - Add protected `_authenticated` layout with `ssr: false` and `getUser()` gate.

4. **Admin dashboard** (`/_authenticated/admin`)
   - Stats cards (users, properties, listings per category).
   - Category management: edit labels/taglines/sort order for the four fixed categories; cannot add/delete categories (enum-backed).
   - Properties manager: list all properties, toggle published/featured, quick-edit status.
   - User management: list users, assign/revoke admin role.

5. **Authenticated listing creation** (`/_authenticated/listings/new`)
   - Category selector drives the form fields.
   - Common fields: title, description, category, listing type, price, price period, region, city, neighborhood, coordinates, status.
   - Conditional fields: beds/baths for hostels/houses; area for lands/farmlands.
   - Multi-image uploader to the `property-images` bucket.
   - Landmarks repeater.
   - Save to `properties` + `property_images` + `property_landmarks`.

6. **Public browse/detail integration**
   - Replace `properties` mock import with server functions that query published listings.
   - Keep existing facet counts, category filters, and region filters but compute from live data.
   - Property detail page loads from DB and falls back to 404 if not found.

7. **Owner dashboard** (`/_authenticated/dashboard`)
   - List properties owned by the signed-in user.
   - Links to edit each listing and to create a new one.

### Data & security rules

- Only authenticated users can create listings; each listing belongs to the creating user.
- Admins can publish/unpublish and feature any listing; owners can edit their own.
- Public visitors see only `status = 'published'` listings.
- Roles live in `user_roles`, never in `profiles`.
- `has_role` is a `SECURITY DEFINER` function to avoid recursive RLS.

### User action required

- Connect your own Supabase project in **Lovable → Project Settings → Connectors → Supabase**.
- After connection, migrations will be applied and the app can read/write real data.

### Out of scope for this pass

- Social login (Google/Apple) — can be added later once the base auth flow is stable.
- Real-time messaging, payments/escrow, Mapbox/Google Maps integration, and native apps.
- Automatic sitemap generation — pending a published/live domain.

### Files that will be created or modified

- New: `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`, `types.ts`
- New: `src/lib/auth.functions.ts`, `admin.functions.ts`, `listings.functions.ts`, `properties.functions.ts`
- New: `src/routes/_authenticated/route.tsx`, `_authenticated/dashboard.tsx`, `_authenticated/admin.tsx`, `_authenticated/listings/new.tsx`, `_authenticated/listings/edit.$id.tsx`, `/reset-password.tsx`
- New: Supabase migration file(s) under `supabase/migrations/`
- Modified: `src/routes/login.tsx`, `src/components/site/SiteHeader.tsx`, `src/components/browse/BrowseGrid.tsx`, `src/routes/browse.$category.tsx`, `src/routes/property.$id.tsx`, `src/start.ts`
