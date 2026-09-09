DROP POLICY IF EXISTS "Owners can create properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON public.properties;

DROP POLICY IF EXISTS "Owners can manage images of own properties" ON public.property_images;
DROP POLICY IF EXISTS "Owners can manage landmarks of own properties" ON public.property_landmarks;