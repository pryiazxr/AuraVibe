-- ========================================================
-- AuraVibe Checkout, Payment Methods & Receipts Migration
-- ========================================================

-- 1. Extend orders table with payment_method, payment_receipt_url, and payment_gateway_provider
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card_to_card',
  ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway_provider TEXT;

-- 2. Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies for receipts
DROP POLICY IF EXISTS "Public can read receipts bucket" ON storage.objects;
CREATE POLICY "Public can read receipts bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Public can upload receipts" ON storage.objects;
CREATE POLICY "Public can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Admins can delete receipts" ON storage.objects;
CREATE POLICY "Admins can delete receipts" ON storage.objects
  FOR DELETE USING (public.is_admin());
