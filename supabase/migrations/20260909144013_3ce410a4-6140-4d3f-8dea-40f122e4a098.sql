CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (property_id, user_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reviews of published listings"
ON public.reviews FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = reviews.property_id AND p.status = 'published'));

CREATE POLICY "Users can create own reviews"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND rating BETWEEN 1 AND 5
  AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'published'));

CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND rating BETWEEN 1 AND 5);

CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX reviews_property_id_idx ON public.reviews(property_id);

CREATE TABLE public.enquiry_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id UUID NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.enquiry_replies TO authenticated;
GRANT ALL ON public.enquiry_replies TO service_role;

ALTER TABLE public.enquiry_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read replies on own enquiries"
ON public.enquiry_replies FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.enquiries e WHERE e.id = enquiry_replies.enquiry_id
  AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Owners can add replies on own enquiries"
ON public.enquiry_replies FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.enquiries e WHERE e.id = enquiry_id
    AND (e.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Owners can delete own replies"
ON public.enquiry_replies FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX enquiry_replies_enquiry_id_idx ON public.enquiry_replies(enquiry_id);

CREATE OR REPLACE FUNCTION public.property_rating_summary()
RETURNS TABLE(property_id uuid, avg_rating numeric, review_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.property_id, ROUND(AVG(r.rating)::numeric, 1), COUNT(*)::BIGINT
  FROM public.reviews r
  JOIN public.properties p ON p.id = r.property_id AND p.status = 'published'
  GROUP BY r.property_id;
$$;

GRANT EXECUTE ON FUNCTION public.property_rating_summary() TO anon, authenticated, service_role;