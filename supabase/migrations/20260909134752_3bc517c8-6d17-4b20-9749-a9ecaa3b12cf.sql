CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.property_category AS ENUM ('hostels', 'homes', 'lands', 'farmlands');
CREATE TYPE public.listing_type AS ENUM ('rent', 'sale');
CREATE TYPE public.price_period AS ENUM ('night', 'month', 'year', 'total');
CREATE TYPE public.property_status AS ENUM ('draft', 'published', 'archived');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

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

-- New user bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
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

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Category metadata
CREATE TABLE public.category_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug public.property_category NOT NULL UNIQUE,
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

CREATE POLICY "Public can read categories" ON public.category_metadata FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update categories" ON public.category_metadata FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_category_metadata_updated_at BEFORE UPDATE ON public.category_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.property_category NOT NULL,
  listing_type public.listing_type NOT NULL DEFAULT 'rent',
  price NUMERIC(12, 2) NOT NULL,
  price_period public.price_period,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  beds INT,
  baths INT,
  area_sqm NUMERIC(12, 2),
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  status public.property_status NOT NULL DEFAULT 'draft',
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

CREATE POLICY "Public can read published properties" ON public.properties FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Owners can read own properties" ON public.properties FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can create properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own properties" ON public.properties FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete own properties" ON public.properties FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_properties_category ON public.properties (category);
CREATE INDEX idx_properties_status ON public.properties (status);
CREATE INDEX idx_properties_user ON public.properties (user_id);

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
  SELECT full_name INTO v_full_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;

  IF v_full_name IS NULL OR v_full_name = '' THEN
    SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id LIMIT 1;
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

CREATE OR REPLACE FUNCTION public.count_properties_by_category()
RETURNS TABLE(category public.property_category, count BIGINT)
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

GRANT EXECUTE ON FUNCTION public.count_properties_by_category() TO anon, authenticated;

-- Property images
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT SELECT ON public.property_images TO anon;
GRANT ALL ON public.property_images TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read images of published properties" ON public.property_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'published'));
CREATE POLICY "Owners can manage images of own properties" ON public.property_images FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid()));
CREATE POLICY "Admins can manage all property images" ON public.property_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_property_images_property ON public.property_images (property_id);

-- Property landmarks
CREATE TABLE public.property_landmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  km NUMERIC(6, 2) NOT NULL DEFAULT 0,
  mins INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_landmarks TO authenticated;
GRANT SELECT ON public.property_landmarks TO anon;
GRANT ALL ON public.property_landmarks TO service_role;
ALTER TABLE public.property_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read landmarks of published properties" ON public.property_landmarks FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'published'));
CREATE POLICY "Owners can manage landmarks of own properties" ON public.property_landmarks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid()));
CREATE POLICY "Admins can manage all landmarks" ON public.property_landmarks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_property_landmarks_property ON public.property_landmarks (property_id);

-- Seed the four fixed categories
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