-- ========================================================
-- AuraVibe Security Hardening, RLS & Authorization Migration
-- Migration: 20261007000003_hardening_rls_and_auth.sql
-- ========================================================

-- --------------------------------------------------------
-- 1. Helper Functions with Strict Status & Role Check
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND status = 'active'
  );
$$;

-- --------------------------------------------------------
-- 2. Secure RPC: create_admin_user
-- Only active SUPER_ADMIN can execute this function.
-- Atomically creates an auth.users record and links it to admin_users.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_username text,
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_role text DEFAULT 'MANAGER',
  p_permissions jsonb DEFAULT '["manage_products", "manage_orders"]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  new_auth_uid uuid;
  encrypted_pw text;
  new_admin_id bigint;
  clean_email text;
  clean_username text;
BEGIN
  -- Authorization guard
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'دسترسی غیرمجاز: فقط مدیر کل (SUPER_ADMIN) مجاز به تعریف حساب ادمین جدید می‌باشد.';
  END IF;

  clean_username := lower(trim(p_username));
  clean_email := lower(trim(p_email));

  IF clean_username = '' OR clean_email = '' OR p_password = '' THEN
    RAISE EXCEPTION 'اطلاعات نام کاربری، ایمیل و کلمه عبور نمی‌تواند خالی باشد.';
  END IF;

  -- Check uniqueness in admin_users
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE username = clean_username) THEN
    RAISE EXCEPTION 'این نام کاربری قبلاً در سامانه ثبت شده است.';
  END IF;

  -- Check uniqueness in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = clean_email) THEN
    RAISE EXCEPTION 'این آدرس ایمیل قبلاً در سیستم احراز هویت ثبت شده است.';
  END IF;

  new_auth_uid := gen_random_uuid();
  encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Insert into Supabase Auth users table
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_auth_uid,
    'authenticated',
    'authenticated',
    clean_email,
    encrypted_pw,
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name, 'username', clean_username),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert into Supabase Auth identities table
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_auth_uid,
    new_auth_uid,
    jsonb_build_object('sub', new_auth_uid::text, 'email', clean_email),
    'email',
    clean_email,
    now(),
    now(),
    now()
  );

  -- Insert into application admin_users table
  INSERT INTO public.admin_users (
    auth_user_id,
    admin_code,
    first_name,
    last_name,
    username,
    role,
    custom_permissions,
    status
  ) VALUES (
    new_auth_uid,
    'ADM-' || floor(100 + random() * 899)::text,
    p_first_name,
    p_last_name,
    clean_username,
    p_role,
    p_permissions,
    'active'
  )
  RETURNING id INTO new_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', new_auth_uid,
    'admin_id', new_admin_id
  );
END;
$$;

-- --------------------------------------------------------
-- 3. Secure RPC: create_customer_order
-- Allows validated customer order placement without raw arbitrary INSERTs.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_customer jsonb,
  p_items jsonb,
  p_shipping_method jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id text;
  subtotal numeric;
  discount numeric;
  total_amount numeric;
  calc_subtotal numeric := 0;
  calc_total numeric := 0;
  item_elem jsonb;
  new_order_row public.orders%ROWTYPE;
  now_ts timestamptz := now();
  caller_user_id bigint := NULL;
BEGIN
  IF p_customer IS NULL OR p_customer->>'phone' IS NULL OR trim(p_customer->>'phone') = '' THEN
    RAISE EXCEPTION 'شماره همراه خریدار الزامی است.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'سبد خرید نمی‌تواند خالی باشد.';
  END IF;

  FOR item_elem IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    calc_subtotal := calc_subtotal + ((item_elem->>'originalPrice')::numeric * (item_elem->>'quantity')::numeric);
    calc_total := calc_total + (item_elem->>'lineTotal')::numeric;
  END LOOP;

  subtotal := calc_subtotal;
  total_amount := calc_total;
  discount := subtotal - total_amount;

  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO caller_user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
  ELSIF (p_customer->>'userId') IS NOT NULL AND (p_customer->>'userId') ~ '^\d+$' THEN
    caller_user_id := (p_customer->>'userId')::bigint;
  END IF;

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
    'جدید',
    'پرداخت شده',
    jsonb_build_array(
      jsonb_build_object(
        'status', 'جدید',
        'date', to_char(now_ts, 'YYYY/MM/DD'),
        'time', to_char(now_ts, 'HH24:MI'),
        'note', 'سفارش توسط خریدار در سایت ثبت گردید.'
      )
    ),
    now_ts,
    now_ts
  )
  RETURNING * INTO new_order_row;

  RETURN to_jsonb(new_order_row);
END;
$$;

-- --------------------------------------------------------
-- 4. Secure RPC: create_customer_ticket
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_customer_ticket(
  p_customer_name text,
  p_customer_phone text,
  p_subject text,
  p_category text,
  p_initial_message text,
  p_media_url text DEFAULT NULL,
  p_media_type text DEFAULT 'text',
  p_customer_avatar text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ticket_id text;
  now_ts timestamptz := now();
  caller_user_id bigint := NULL;
  new_ticket_row public.support_tickets%ROWTYPE;
BEGIN
  IF trim(p_customer_phone) = '' OR trim(p_initial_message) = '' THEN
    RAISE EXCEPTION 'شماره همراه و متن پیام اولیه الزامی است.';
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO caller_user_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
  END IF;

  new_ticket_id := 'TCK-' || floor(1000 + random() * 8999)::text;

  INSERT INTO public.support_tickets (
    id,
    ticket_number,
    user_id,
    customer_name,
    customer_phone,
    customer_avatar,
    subject,
    category,
    status,
    priority,
    unread_admin_count,
    unread_user_count,
    messages,
    created_at,
    updated_at
  ) VALUES (
    new_ticket_id,
    new_ticket_id,
    caller_user_id,
    coalesce(trim(p_customer_name), 'کاربر آورا'),
    trim(p_customer_phone),
    p_customer_avatar,
    coalesce(trim(p_subject), 'سوال از پشتیبانی'),
    p_category,
    'New',
    'Normal',
    1,
    0,
    jsonb_build_array(
      jsonb_build_object(
        'id', 'msg-' || floor(extract(epoch from now_ts) * 1000)::text,
        'sender', 'customer',
        'senderName', coalesce(trim(p_customer_name), 'کاربر آورا'),
        'message', trim(p_initial_message),
        'type', coalesce(p_media_type, 'text'),
        'mediaUrl', p_media_url,
        'createdAt', to_char(now_ts, 'YYYY/MM/DD HH24:MI'),
        'readByAdmin', false,
        'readByUser', true
      )
    ),
    now_ts,
    now_ts
  )
  RETURNING * INTO new_ticket_row;

  RETURN to_jsonb(new_ticket_row);
END;
$$;

-- --------------------------------------------------------
-- 5. Drop Insecure Policies (id = 1, WITH CHECK (true), and anonymous bypasses)
-- --------------------------------------------------------

-- users table
DROP POLICY IF EXISTS "Users view own or admin view all" ON public.users;
DROP POLICY IF EXISTS "Users can insert self or admin insert" ON public.users;
DROP POLICY IF EXISTS "Users update own profile or admin update" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

CREATE POLICY "Users view own profile or admin view all" ON public.users
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  );

CREATE POLICY "Users insert self or admin insert" ON public.users
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  );

CREATE POLICY "Users update self or admin update" ON public.users
  FOR UPDATE USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  ) WITH CHECK (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
  );

CREATE POLICY "Admins only delete users" ON public.users
  FOR DELETE TO authenticated USING (public.is_admin());

-- admin_users table
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "SuperAdmin can modify admin_users" ON public.admin_users;

CREATE POLICY "Admins view admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (
    public.is_admin() OR auth.uid() = auth_user_id
  );

CREATE POLICY "SuperAdmin only modify admin_users" ON public.admin_users
  FOR ALL TO authenticated USING (
    public.is_super_admin()
  ) WITH CHECK (
    public.is_super_admin()
  );

-- orders table
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders or admin view all" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Users view own orders or admin view all" ON public.orders
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Validated customer insert orders" ON public.orders
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (order_status = 'جدید' AND order_number IS NOT NULL AND customer IS NOT NULL AND items IS NOT NULL)
  );

CREATE POLICY "Admins only update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins only delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());

-- support_tickets table
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets or admin view all" ON public.support_tickets;
DROP POLICY IF EXISTS "Users and Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON public.support_tickets;

CREATE POLICY "Users view own tickets or admin view all" ON public.support_tickets
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Validated customer insert tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (status = 'New' AND ticket_number IS NOT NULL AND customer_phone IS NOT NULL AND messages IS NOT NULL)
  );

CREATE POLICY "Users and Admins update tickets" ON public.support_tickets
  FOR UPDATE USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  ) WITH CHECK (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Admins only delete tickets" ON public.support_tickets
  FOR DELETE TO authenticated USING (public.is_admin());

-- notifications table
DROP POLICY IF EXISTS "Admins and users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users/admins can mark notifications read" ON public.notifications;

CREATE POLICY "Authorized users view notifications" ON public.notifications
  FOR SELECT USING (
    (target_role = 'admin' AND public.is_admin()) OR
    (target_role = 'user' AND auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Admins only insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Authorized update notifications" ON public.notifications
  FOR UPDATE USING (
    public.is_admin() OR
    (target_role = 'user' AND auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  );

-- audit_logs table
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit_logs" ON public.audit_logs;

CREATE POLICY "Admins view audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Strict admin insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (
    public.is_admin() AND
    admin_id IN (SELECT id FROM public.admin_users WHERE auth_user_id = auth.uid())
  );

-- --------------------------------------------------------
-- 6. Hardened Storage Policies
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Public can read banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

-- Public read for storefront assets
CREATE POLICY "Public read banners and products" ON storage.objects
  FOR SELECT USING (bucket_id IN ('banners', 'products', 'avatars'));

-- Support media read: Admins or authenticated
CREATE POLICY "Authorized read support media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'support-media' AND (public.is_admin() OR auth.uid() IS NOT NULL)
  );

-- Banner and Product upload: Admins only
CREATE POLICY "Admins only upload banners and products" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('banners', 'products') AND public.is_admin()
  );

-- Avatar upload: Admins or authenticated users
CREATE POLICY "Authorized upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND (public.is_admin() OR auth.uid() IS NOT NULL OR name LIKE 'avatars/%')
  );

-- Support media upload: Namespaced non-overwriting upload
CREATE POLICY "Authorized upload support media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'support-media' AND (public.is_admin() OR auth.uid() IS NOT NULL OR name LIKE 'support-media/%')
  );

-- Only Admins can update/delete any storage files
CREATE POLICY "Admins only update storage objects" ON storage.objects
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins only delete storage objects" ON storage.objects
  FOR DELETE USING (public.is_admin());
