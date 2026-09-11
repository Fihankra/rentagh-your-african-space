-- RentaGh is the sole intermediary: for rentals it sources the property from a
-- landlord, signs the tenant directly, collects rent, and pays the landlord
-- minus commission. For sales it actually buys the property (real ownership,
-- holds it as inventory) and resells at a profit. None of that exists yet —
-- properties.user_id is just the internal RentaGh account. This migration adds
-- property owners (landlords/sellers), customers (tenants/buyers), rent
-- agreements + recurring payments, and sale transactions. All admin-only.

-- 1. Enums ------------------------------------------------------------------
CREATE TYPE public.customer_type AS ENUM ('tenant', 'buyer');
CREATE TYPE public.rent_agreement_status AS ENUM ('active', 'ended', 'terminated');
CREATE TYPE public.rent_payment_status AS ENUM ('pending', 'collected', 'paid_to_landlord', 'overdue');
CREATE TYPE public.sale_transaction_status AS ENUM ('held', 'listed', 'sold');

-- 2. Property owners (landlords + sellers) -----------------------------------
CREATE TABLE public.property_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_number TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_owners TO authenticated;
GRANT ALL ON public.property_owners TO service_role;
ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage property owners" ON public.property_owners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_property_owners_updated_at BEFORE UPDATE ON public.property_owners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Customers (tenants + buyers) --------------------------------------------
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_number TEXT,
  customer_type public.customer_type NOT NULL DEFAULT 'tenant',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Link properties to the owner RentaGh sourced/bought them from -----------
ALTER TABLE public.properties
  ADD COLUMN owner_id UUID REFERENCES public.property_owners(id) ON DELETE SET NULL;

-- 5. Rent agreements ----------------------------------------------------------
CREATE TABLE public.rent_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.property_owners(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  rent_amount NUMERIC(12, 2) NOT NULL,
  price_period public.price_period NOT NULL DEFAULT 'month',
  commission_rate NUMERIC(5, 2),
  commission_amount NUMERIC(12, 2),
  deposit_amount NUMERIC(12, 2),
  start_date DATE NOT NULL DEFAULT current_date,
  end_date DATE,
  status public.rent_agreement_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (commission_rate IS NOT NULL OR commission_amount IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rent_agreements TO authenticated;
GRANT ALL ON public.rent_agreements TO service_role;
ALTER TABLE public.rent_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage rent agreements" ON public.rent_agreements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rent_agreements_updated_at BEFORE UPDATE ON public.rent_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX rent_agreements_property_idx ON public.rent_agreements(property_id);

-- 6. Rent payments (the real commission ledger) ------------------------------
CREATE TABLE public.rent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rent_agreement_id UUID NOT NULL REFERENCES public.rent_agreements(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_due NUMERIC(12, 2) NOT NULL,
  commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payout_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status public.rent_payment_status NOT NULL DEFAULT 'pending',
  collected_at TIMESTAMPTZ,
  payout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rent_payments TO authenticated;
GRANT ALL ON public.rent_payments TO service_role;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage rent payments" ON public.rent_payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON public.rent_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX rent_payments_agreement_idx ON public.rent_payments(rent_agreement_id, period_start DESC);

-- 7. Sale transactions (RentaGh buys, holds, resells) ------------------------
CREATE TABLE public.sale_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.property_owners(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  acquisition_cost NUMERIC(12, 2) NOT NULL,
  acquisition_date DATE NOT NULL DEFAULT current_date,
  sale_price NUMERIC(12, 2),
  sale_date DATE,
  status public.sale_transaction_status NOT NULL DEFAULT 'held',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_transactions TO authenticated;
GRANT ALL ON public.sale_transactions TO service_role;
ALTER TABLE public.sale_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sale transactions" ON public.sale_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sale_transactions_updated_at BEFORE UPDATE ON public.sale_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX sale_transactions_property_idx ON public.sale_transactions(property_id);
