-- ========================================================
-- AuraLune SMS Gateway, Checkout Phone Verification & Notification Idempotency
-- Migration: 20261007000007_sms_and_checkout_verification.sql
-- ========================================================

-- --------------------------------------------------------
-- 1. Table: phone_verifications
-- Stores secure server-side checkout phone verification states.
-- OTP codes are hashed; tokens are cryptographically generated.
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_token TEXT UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_token ON public.phone_verifications(verification_token);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON public.phone_verifications(expires_at);

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Security Policy: phone_verifications contains sensitive OTP hashes.
-- Anonymous users cannot read hashes or arbitrary rows directly.
-- Only Admins or service-role edge functions have direct access.
DROP POLICY IF EXISTS "Admins can view phone verifications" ON public.phone_verifications;
CREATE POLICY "Admins can view phone verifications" ON public.phone_verifications
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can modify phone verifications" ON public.phone_verifications;
CREATE POLICY "Admins can modify phone verifications" ON public.phone_verifications
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 2. Atomic OTP Verification Function
-- Uses row-level lock (FOR UPDATE) to prevent concurrency race conditions
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.verify_checkout_otp_atomic(
  p_phone text,
  p_otp_hash text,
  p_verification_token text,
  p_token_expires_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec public.phone_verifications%ROWTYPE;
BEGIN
  -- Lock row with FOR UPDATE to serialize concurrent attempts and prevent race conditions
  SELECT * INTO v_rec
  FROM public.phone_verifications
  WHERE phone = p_phone
    AND verified = false
    AND expires_at > now()
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'کد تایید منقضی شده یا درخواستی یافت نشد. لطفاً مجدداً درخواست دهید.');
  END IF;

  IF v_rec.attempts >= v_rec.max_attempts THEN
    RETURN jsonb_build_object('success', false, 'error', 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً کد جدید درخواست دهید.');
  END IF;

  -- Increment attempt count atomically
  UPDATE public.phone_verifications
  SET attempts = attempts + 1
  WHERE id = v_rec.id;

  IF v_rec.otp_hash <> p_otp_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'کد تایید وارد شده نادرست است.');
  END IF;

  -- Mark verified and set verification token atomically
  UPDATE public.phone_verifications
  SET verified = true,
      verified_at = now(),
      verification_token = p_verification_token,
      expires_at = p_token_expires_at
  WHERE id = v_rec.id;

  RETURN jsonb_build_object('success', true, 'verification_token', p_verification_token);
END;
$$;

-- --------------------------------------------------------
-- 3. Table: order_sms_notifications
-- Enforces strict idempotency and audit logs for customer order status SMS.
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.order_sms_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_status TEXT NOT NULL,
  phone TEXT NOT NULL,
  template_id BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'sent', 'mocked', 'skipped_unverified_template', 'failed')),
  message_id BIGINT,
  error_message TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_sms_notifications_order_id ON public.order_sms_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_sms_notifications_idempotency ON public.order_sms_notifications(idempotency_key);

ALTER TABLE public.order_sms_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all notifications
DROP POLICY IF EXISTS "Admins view all order notifications" ON public.order_sms_notifications;
CREATE POLICY "Admins view all order notifications" ON public.order_sms_notifications
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Customers can view notifications corresponding to their own orders
DROP POLICY IF EXISTS "Customers view own order notifications" ON public.order_sms_notifications;
CREATE POLICY "Customers view own order notifications" ON public.order_sms_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.users u ON o.user_id = u.id
      WHERE o.id = order_sms_notifications.order_id
        AND u.auth_user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- 4. Harden orders INSERT RLS Policy & Ensure Payment Columns
-- Prevents clients from bypassing phone verification via direct table inserts
-- --------------------------------------------------------

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card_to_card',
  ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway_provider TEXT;

DROP POLICY IF EXISTS "Validated customer insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins or verified RPC only insert orders" ON public.orders;

CREATE POLICY "Admins or verified RPC only insert orders" ON public.orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      auth.uid() IS NOT NULL AND
      order_status IN ('جدید', 'سفارش جدید', 'در حال بررسی پرداخت') AND
      order_number IS NOT NULL AND
      customer IS NOT NULL AND
      items IS NOT NULL AND
      (
        customer->>'phone' IS NOT NULL AND
        ('+98' || regexp_replace(regexp_replace(customer->>'phone', '^\+?98', ''), '^0', '')) =
        (SELECT '+98' || regexp_replace(regexp_replace(phone, '^\+?98', ''), '^0', '') FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
      )
    )
  );

-- --------------------------------------------------------
-- 5. Enhanced Secure RPC: create_customer_order with Phone Verification Enforcement
-- Validates that the customer phone on the order is server-verified.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_customer jsonb,
  p_items jsonb,
  p_shipping_method jsonb,
  p_verification_token text DEFAULT NULL,
  p_payment_method text DEFAULT 'card_to_card',
  p_payment_receipt_url text DEFAULT NULL,
  p_payment_gateway_provider text DEFAULT NULL,
  p_order_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  calc_subtotal numeric := 0;
  calc_total numeric := 0;
  subtotal numeric := 0;
  total_amount numeric := 0;
  discount numeric := 0;
  item_elem jsonb;
  new_order_id text;
  new_order_row public.orders%ROWTYPE;
  now_ts timestamptz := now();
  caller_user_id bigint := NULL;
  user_phone text := NULL;
  raw_cust_phone text;
  norm_cust_phone text;
  is_verified boolean := false;
  v_final_order_status text;
  v_final_payment_status text;
  v_timeline_note text;
BEGIN
  IF p_customer IS NULL OR p_customer->>'phone' IS NULL OR trim(p_customer->>'phone') = '' THEN
    RAISE EXCEPTION 'شماره همراه خریدار الزامی است.';
  END IF;

  raw_cust_phone := trim(p_customer->>'phone');
  -- Normalize phone (strip non-digits, unify +98 prefix)
  norm_cust_phone := regexp_replace(raw_cust_phone, '[^\d]', '', 'g');
  IF norm_cust_phone LIKE '0098%' THEN
    norm_cust_phone := substr(norm_cust_phone, 5);
  ELSIF norm_cust_phone LIKE '98%' AND length(norm_cust_phone) > 10 THEN
    norm_cust_phone := substr(norm_cust_phone, 3);
  ELSIF norm_cust_phone LIKE '0%' THEN
    norm_cust_phone := substr(norm_cust_phone, 2);
  END IF;
  norm_cust_phone := '+98' || norm_cust_phone;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'سبد خرید نمی‌تواند خالی باشد.';
  END IF;

  -- Verify caller ownership and phone verification
  IF auth.uid() IS NOT NULL THEN
    SELECT id, phone INTO caller_user_id, user_phone
    FROM public.users
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    -- Normalize user profile phone
    IF user_phone IS NOT NULL THEN
      DECLARE
        norm_user_phone text := regexp_replace(user_phone, '[^\d]', '', 'g');
      BEGIN
        IF norm_user_phone LIKE '0098%' THEN
          norm_user_phone := substr(norm_user_phone, 5);
        ELSIF norm_user_phone LIKE '98%' AND length(norm_user_phone) > 10 THEN
          norm_user_phone := substr(norm_user_phone, 3);
        ELSIF norm_user_phone LIKE '0%' THEN
          norm_user_phone := substr(norm_user_phone, 2);
        END IF;
        norm_user_phone := '+98' || norm_user_phone;

        IF norm_user_phone = norm_cust_phone THEN
          is_verified := true;
        END IF;
      END;
    END IF;

    -- Also check if verified in auth.users
    IF NOT is_verified THEN
      IF EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
          AND phone IS NOT NULL
          AND ('+98' || regexp_replace(regexp_replace(phone, '^\+?98', ''), '^0', '')) = norm_cust_phone
      ) THEN
        is_verified := true;
      END IF;
    END IF;
  END IF;

  -- If phone is not automatically verified by active user session, check phone_verifications table with row lock
  IF NOT is_verified AND p_verification_token IS NOT NULL AND trim(p_verification_token) <> '' THEN
    DECLARE
      v_token_id uuid;
    BEGIN
      SELECT id INTO v_token_id
      FROM public.phone_verifications
      WHERE verification_token = trim(p_verification_token)
        AND ('+98' || regexp_replace(regexp_replace(phone, '^\+?98', ''), '^0', '')) = norm_cust_phone
        AND verified = true
        AND expires_at > now_ts
        AND consumed_at IS NULL
      LIMIT 1
      FOR UPDATE;

      IF v_token_id IS NOT NULL THEN
        is_verified := true;
        -- Mark verification token as consumed atomically
        UPDATE public.phone_verifications
        SET consumed_at = now_ts
        WHERE id = v_token_id;
      END IF;
    END;
  END IF;

  -- Admin callers are permitted to bypass phone verification when creating orders on behalf of customers
  IF NOT is_verified AND public.is_admin() THEN
    is_verified := true;
  END IF;

  -- Enforce server-side verification check
  IF NOT is_verified THEN
    RAISE EXCEPTION 'شماره همراه سفارش تایید نشده است. جهت ادامه ثبت سفارش، شماره همراه باید تایید گردد.';
  END IF;

  -- Calculate order totals
  FOR item_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    calc_subtotal := calc_subtotal + ((item_elem->>'originalPrice')::numeric * (item_elem->>'quantity')::numeric);
    calc_total := calc_total + (item_elem->>'lineTotal')::numeric;
  END LOOP;

  subtotal := calc_subtotal;
  total_amount := calc_total;
  discount := subtotal - total_amount;

  v_final_order_status := COALESCE(
    p_order_status,
    CASE WHEN p_payment_method = 'card_to_card' THEN 'در حال بررسی پرداخت' ELSE 'سفارش جدید' END
  );
  v_final_payment_status := COALESCE(
    p_payment_status,
    CASE WHEN p_payment_method = 'card_to_card' THEN 'در حال بررسی' ELSE 'در انتظار پرداخت' END
  );
  v_timeline_note := CASE
    WHEN p_payment_method = 'card_to_card' THEN 'سفارش با روش کارت به کارت ثبت شد و رسید پرداخت ارسال گردید.'
    ELSE 'سفارش توسط خریدار در سایت ثبت گردید.'
  END;

  new_order_id := 'ORD-' || floor(10000 + random() * 89999)::text;

  INSERT INTO public.orders (
    id,
    order_number,
    user_id,
    customer,
    items,
    subtotal,
    discount,
    total_amount,
    shipping_method,
    order_status,
    payment_status,
    payment_method,
    payment_receipt_url,
    payment_gateway_provider,
    timeline,
    created_at,
    updated_at
  ) VALUES (
    new_order_id,
    new_order_id,
    caller_user_id,
    p_customer,
    p_items,
    subtotal,
    discount,
    total_amount,
    p_shipping_method,
    v_final_order_status,
    v_final_payment_status,
    COALESCE(p_payment_method, 'card_to_card'),
    p_payment_receipt_url,
    p_payment_gateway_provider,
    jsonb_build_array(
      jsonb_build_object(
        'status', v_final_order_status,
        'date', to_char(now_ts, 'YYYY/MM/DD'),
        'time', to_char(now_ts, 'HH24:MI'),
        'note', v_timeline_note
      )
    ),
    now_ts,
    now_ts
  )
  RETURNING * INTO new_order_row;

  RETURN to_jsonb(new_order_row);
END;
$$;
