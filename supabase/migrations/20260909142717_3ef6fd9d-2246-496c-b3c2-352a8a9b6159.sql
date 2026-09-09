-- 1. Enquiries -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  sender_user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send an enquiry" ON public.enquiries;
CREATE POLICY "Anyone can send an enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can read their enquiries" ON public.enquiries;
CREATE POLICY "Owners can read their enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their enquiries" ON public.enquiries;
CREATE POLICY "Owners can update their enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their enquiries" ON public.enquiries;
CREATE POLICY "Owners can delete their enquiries" ON public.enquiries
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admins can manage all enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage all enquiries" ON public.enquiries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS enquiries_owner_idx ON public.enquiries(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_property_idx ON public.enquiries(property_id);

-- 2. Demo owner account ----------------------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'demo-owner@rentagh.app',
  crypt('RentaGhDemo!2026', gen_salt('bf')), now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"RentaGh Demo Owner"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (user_id, full_name)
VALUES ('11111111-1111-4111-8111-111111111111', 'RentaGh Demo Owner')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('11111111-1111-4111-8111-111111111111', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Demo listings ---------------------------------------------------------
INSERT INTO public.properties (
  id, user_id, title, description, category, listing_type, price, price_period,
  region, city, neighborhood, beds, baths, area_sqm, lat, lng, status, featured,
  amenities, cover_url
) VALUES
('a1000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111',
 'Ayeduase Executive Student Hostel','A secure, purpose-built student hostel a short walk from KNUST. Two-in-a-room and one-in-a-room options, study desks, constant water supply, standby generator and 24-hour security.',
 'hostels','rent',4500,'year','Ashanti','Kumasi','Ayeduase',2,1,28,6.6745,-1.5716,'published',true,
 ARRAY['Wi-Fi','24/7 Security','Standby generator','Water storage','Study desk','Shared kitchen'],'/demo/hostel.jpg'),
('a1000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111',
 'Legon Gate Ladies Hostel','Clean and quiet hostel for female students minutes from the University of Ghana. En-suite rooms, common study lounge, laundry area and a resident caretaker.',
 'hostels','rent',6000,'year','Greater Accra','Accra','East Legon',1,1,22,5.6508,-0.1870,'published',false,
 ARRAY['Wi-Fi','En-suite bathroom','24/7 Security','Laundry area','Study lounge'],'/demo/hostel.jpg'),
('a1000000-0000-4000-8000-000000000003','11111111-1111-4111-8111-111111111111',
 'Modern 3-Bedroom House at East Legon','Newly built three-bedroom home in a gated neighbourhood. Fitted kitchen, spacious living area, air conditioning throughout, borehole and parking for two cars.',
 'homes','rent',7500,'month','Greater Accra','Accra','East Legon',3,3,220,5.6363,-0.1650,'published',true,
 ARRAY['Air conditioning','Fitted kitchen','Borehole','Parking','Gated community','Wi-Fi ready'],'/demo/house.jpg'),
('a1000000-0000-4000-8000-000000000004','11111111-1111-4111-8111-111111111111',
 'Family 4-Bedroom Home in Kwadaso','Comfortable four-bedroom family house on a quiet street in Kwadaso, Kumasi. Large compound, boys quarters, tiled floors and a walled perimeter with gate.',
 'homes','rent',5200,'month','Ashanti','Kumasi','Kwadaso',4,3,260,6.6800,-1.6500,'published',false,
 ARRAY['Boys quarters','Walled compound','Parking','Water storage','Tiled floors'],'/demo/house.jpg'),
('a1000000-0000-4000-8000-000000000005','11111111-1111-4111-8111-111111111111',
 'Serviced Building Plot at Oyarifa','Registered and litigation-free building plot with pillars in place, tarred access road, and electricity on the street. Ideal for a family home or small apartment block.',
 'lands','sale',180000,'total','Greater Accra','Accra','Oyarifa',NULL,NULL,4046,5.7500,-0.1500,'published',true,
 ARRAY['Registered title','Pillars in place','Tarred access road','Electricity nearby'],'/demo/land.jpg'),
('a1000000-0000-4000-8000-000000000006','11111111-1111-4111-8111-111111111111',
 'Two Plots at Ejisu with Indenture','Two adjoining plots on gently sloping land at Ejisu, fully documented with an indenture and site plan. Water and electricity available in the area.',
 'lands','sale',95000,'total','Ashanti','Kumasi','Ejisu',NULL,NULL,8092,6.7200,-1.3600,'published',false,
 ARRAY['Indenture available','Site plan','Water nearby','Electricity nearby'],'/demo/land.jpg'),
('a1000000-0000-4000-8000-000000000007','11111111-1111-4111-8111-111111111111',
 '10 Acres of Farm Land at Nsawam','Rich loamy farm land suitable for maize, cassava and vegetables. Stream on the boundary, motorable road access and a storage shed on site. Available for lease.',
 'farmlands','rent',9000,'year','Eastern','Nsawam','Adoagyiri',NULL,NULL,40469,5.8090,-0.3500,'published',true,
 ARRAY['Stream on site','Storage shed','Motorable access','Loamy soil'],'/demo/farmland.jpg'),
('a1000000-0000-4000-8000-000000000008','11111111-1111-4111-8111-111111111111',
 '25 Acres Cocoa Farm Land at Assin','Large tract of fertile farm land in the Central Region, previously cropped and ready for cocoa or oil palm. Clear boundaries and family documentation in place.',
 'farmlands','sale',260000,'total','Central','Assin Fosu','Assin',NULL,NULL,101171,5.9000,-1.2800,'published',false,
 ARRAY['Fertile soil','Clear boundaries','Family documentation','Road access'],'/demo/farmland.jpg')
ON CONFLICT (id) DO NOTHING;
