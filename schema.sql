-- RentaGh initial schema
-- Run this SQL in the Supabase SQL Editor after connecting your project.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Property enums
CREATE TYPE public.property_category AS ENUM ('hostels', 'homes', 'lands', 'farmlands');
CREATE TYPE public.listing_type AS ENUM ('rent', 'sale');
CREATE TYPE public.price_period AS ENUM ('night', 'month', 'year', 'total');
CREATE TYPE public.property_status AS ENUM ('draft', 'published', 'archived');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Helper: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO service_role;

-- Helper: claim_first_admin
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- Helper: count published properties by category
CREATE OR REPLACE FUNCTION public.count_properties_by_category()
RETURNS TABLE(category property_category, count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.category, COUNT(*)::BIGINT
  FROM public.properties p
  WHERE p.status = 'published'
  GROUP BY p.category;
$$;

GRANT EXECUTE ON FUNCTION public.count_properties_by_category() TO authenticated;

-- Trigger: create profile + default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Categories metadata (admin-editable labels for the fixed enum categories)
CREATE TABLE public.category_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug property_category NOT NULL UNIQUE,
  label TEXT NOT NULL,
  tagline TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'home',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.category_metadata TO anon;
GRANT SELECT, UPDATE ON public.category_metadata TO authenticated;
GRANT ALL ON public.category_metadata TO service_role;
ALTER TABLE public.category_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON public.category_metadata FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update categories"
  ON public.category_metadata FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category property_category NOT NULL,
  listing_type listing_type NOT NULL DEFAULT 'rent',
  price NUMERIC(12, 2) NOT NULL,
  price_period price_period,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  beds INT,
  baths INT,
  area_sqm NUMERIC(10, 2),
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  status property_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  details JSONB,
  cover_url TEXT,
  owner_display_name TEXT,
  owner_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Owners can read own properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can create properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-fill owner display name from profile
CREATE OR REPLACE FUNCTION public.set_property_owner_meta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_email TEXT;
BEGIN
  SELECT full_name INTO v_full_name
  FROM public.profiles
  WHERE user_id = NEW.user_id
  LIMIT 1;

  IF v_full_name IS NULL OR v_full_name = '' THEN
    SELECT email INTO v_email
    FROM auth.users
    WHERE id = NEW.user_id
    LIMIT 1;
    v_full_name := COALESCE(v_email, 'Owner');
  END IF;

  NEW.owner_display_name := v_full_name;
  NEW.owner_role := CASE WHEN public.has_role(NEW.user_id, 'admin') THEN 'Admin' ELSE 'Owner' END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_property_set_owner_meta
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_property_owner_meta();

-- Property images
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT SELECT ON public.property_images TO anon;
GRANT ALL ON public.property_images TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read images of published properties"
  ON public.property_images FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND status = 'published'
  ));

CREATE POLICY "Owners can manage images of own properties"
  ON public.property_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all property images"
  ON public.property_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Property landmarks
CREATE TABLE public.property_landmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  km NUMERIC(5, 2) NOT NULL,
  mins INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_landmarks TO authenticated;
GRANT SELECT ON public.property_landmarks TO anon;
GRANT ALL ON public.property_landmarks TO service_role;
ALTER TABLE public.property_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read landmarks of published properties"
  ON public.property_landmarks FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND status = 'published'
  ));

CREATE POLICY "Owners can manage landmarks of own properties"
  ON public.property_landmarks FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties WHERE id = property_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all landmarks"
  ON public.property_landmarks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can manage objects under their own user-id folder; public read
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Owners can upload to their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owners can update their own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owners can delete their own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can manage all storage objects"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'property-images'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Seed category metadata
INSERT INTO public.category_metadata (slug, label, tagline, icon, sort_order)
VALUES
  ('hostels', 'Student Hostels', 'Near campus', 'graduation-cap', 1),
  ('homes', 'Houses for Rent', 'Rent a home', 'home', 2),
  ('lands', 'Building Lands', 'Rent or buy', 'map-pin', 3),
  ('farmlands', 'Farm Lands', 'Rent or buy', 'sprout', 4)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label,
  tagline = EXCLUDED.tagline,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Seed demo properties (published, covering all four categories)
-- Replace demo cover_url values with real uploaded URLs when available.
INSERT INTO public.properties (
  user_id, title, description, category, listing_type, price, price_period,
  region, city, neighborhood, beds, baths, area_sqm, lat, lng,
  status, featured, amenities, cover_url
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'KNUST Garden Hostel — Twin Suite',
    'Clean twin-share with study desk, fast Wi-Fi, kitchenette and 24-hour security. Five minutes from the KNUST main gate.',
    'hostels', 'rent', 7200, 'year',
    'Ashanti', 'Kumasi', 'Ayeduase', 2, 1, NULL, 6.6745, -1.5716,
    'published', true,
    ARRAY['Wi-Fi', '24/7 security', 'Study lounge', 'Laundry', 'Backup power'],
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'Legon Court Hostel — Single En-suite',
    'Private en-suite room a short shuttle from the University of Ghana. Reading room, borehole water and a fenced compound with gate security.',
    'hostels', 'rent', 9600, 'year',
    'Greater Accra', 'Accra', 'East Legon', 1, 1, NULL, 5.6508, -0.1869,
    'published', true,
    ARRAY['Wi-Fi', 'En-suite bathroom', 'Shuttle to campus', 'Backup power', 'Laundry'],
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '3-Bedroom House for Rent, East Legon',
    'Bright three-bedroom house with wrap-around balcony, mid-century African furnishings and views over East Legon.',
    'homes', 'rent', 14500, 'month',
    'Greater Accra', 'Accra', 'East Legon', 3, 3, 210, 5.6304, -0.1597,
    'published', true,
    ARRAY['Backup power', 'Fitted kitchen', 'Parking', 'Air conditioning', 'Gated'],
    'https://images.unsplash.com/photo-1513584685937-4c994103c920?w=800&q=80'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '4-Bedroom Family House, Tema Community 25',
    'Newly built family home with terracotta tile roof, walled compound, mango trees and a paved driveway.',
    'homes', 'rent', 9500, 'month',
    'Greater Accra', 'Tema', 'Community 25', 4, 4, 380, 5.6839, -0.0166,
    'published', false,
    ARRAY['Walled compound', 'Gatehouse', 'Borehole', 'Solar geysers'],
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '1.2 Acre Hilltop Building Plot, Aburi',
    'Surveyed and registered hilltop plot with cool mountain air and views toward the Accra plains. Suitable for a private estate or boutique retreat.',
    'lands', 'sale', 420000, 'total',
    'Eastern', 'Aburi', 'Aburi Hills', NULL, NULL, 4856, 5.85, -0.1741,
    'published', true,
    ARRAY['Surveyed', 'Title documents', 'Road access'],
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '25-Acre Arable Farm Land for Hire, Afram Plains',
    'Cleared arable land for seasonal hire — maize, yam and vegetable ready, with irrigation access from the Volta and a caretaker on site.',
    'farmlands', 'rent', 18000, 'year',
    'Eastern', 'Donkorkrom', 'Afram Plains', NULL, NULL, 101171, 6.6667, -0.0667,
    'published', true,
    ARRAY['Cleared land', 'Irrigation access', 'Caretaker', 'Tractor access'],
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80'
  )
ON CONFLICT DO NOTHING;

-- Seed demo landmarks for the first property
INSERT INTO public.property_landmarks (property_id, name, kind, km, mins)
SELECT id, 'KNUST Main Gate', 'University', 2.2, 9
FROM public.properties
WHERE title = 'KNUST Garden Hostel — Twin Suite'
ON CONFLICT DO NOTHING;
