-- ========================================================
-- AuraVibe Storage, RLS & Security Policies Migration
-- ========================================================

-- Enable Row Level Security (RLS) on all application tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Helper function to check if the current user is an active admin.
-- Uses SECURITY DEFINER to bypass RLS recursion on admin_users.
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

-- --------------------------------------------------------
-- 1. categories Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 2. product_badges Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view product badges" ON public.product_badges;
CREATE POLICY "Public can view product badges" ON public.product_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product badges" ON public.product_badges;
CREATE POLICY "Admins can manage product badges" ON public.product_badges
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 3. products Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 4. banners Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners
  FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners" ON public.banners
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 5. users Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users view own or admin view all" ON public.users;
CREATE POLICY "Users view own or admin view all" ON public.users
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid()) OR
    -- Guest users or initial storefront user context
    id = 1
  );

DROP POLICY IF EXISTS "Users can insert self or admin insert" ON public.users;
CREATE POLICY "Users can insert self or admin insert" ON public.users
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    auth.uid() IS NOT NULL OR
    true
  );

DROP POLICY IF EXISTS "Users update own profile or admin update" ON public.users;
CREATE POLICY "Users update own profile or admin update" ON public.users
  FOR UPDATE USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid()) OR
    id = 1
  ) WITH CHECK (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid()) OR
    id = 1
  );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE TO authenticated USING (public.is_admin());

-- --------------------------------------------------------
-- 6. admin_users Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (
    public.is_admin() OR auth.uid() = auth_user_id
  );

DROP POLICY IF EXISTS "SuperAdmin can modify admin_users" ON public.admin_users;
CREATE POLICY "SuperAdmin can modify admin_users" ON public.admin_users
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE auth_user_id = auth.uid() AND role = 'SUPER_ADMIN' AND status = 'active'
    )
  );

-- --------------------------------------------------------
-- 7. orders Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own orders or admin view all" ON public.orders;
CREATE POLICY "Users can view own orders or admin view all" ON public.orders
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
    -- Storefront default customer / guest orders access
    user_id = 1
  );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());

-- --------------------------------------------------------
-- 8. support_tickets Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
CREATE POLICY "Anyone can create support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own tickets or admin view all" ON public.support_tickets;
CREATE POLICY "Users can view own tickets or admin view all" ON public.support_tickets
  FOR SELECT USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
    user_id = 1
  );

DROP POLICY IF EXISTS "Users and Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Users and Admins can update tickets" ON public.support_tickets
  FOR UPDATE USING (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
    user_id = 1
  ) WITH CHECK (
    public.is_admin() OR
    (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
    user_id = 1
  );

DROP POLICY IF EXISTS "Admins can delete tickets" ON public.support_tickets;
CREATE POLICY "Admins can delete tickets" ON public.support_tickets
  FOR DELETE TO authenticated USING (public.is_admin());

-- --------------------------------------------------------
-- 9. articles Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles" ON public.articles
  FOR SELECT USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage articles" ON public.articles;
CREATE POLICY "Admins can manage articles" ON public.articles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 10. global_seo Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view global_seo" ON public.global_seo;
CREATE POLICY "Public can view global_seo" ON public.global_seo
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update global_seo" ON public.global_seo;
CREATE POLICY "Admins can update global_seo" ON public.global_seo
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 11. general_settings Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view general_settings" ON public.general_settings;
CREATE POLICY "Public can view general_settings" ON public.general_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update general_settings" ON public.general_settings;
CREATE POLICY "Admins can update general_settings" ON public.general_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 12. redirects Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view redirects" ON public.redirects;
CREATE POLICY "Public can view redirects" ON public.redirects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage redirects" ON public.redirects;
CREATE POLICY "Admins can manage redirects" ON public.redirects
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- 13. notifications Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Admins and users can view their notifications" ON public.notifications;
CREATE POLICY "Admins and users can view their notifications" ON public.notifications
  FOR SELECT USING (
    (target_role = 'admin' AND public.is_admin()) OR
    (target_role = 'user' AND (
      (auth.uid() IS NOT NULL AND user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())) OR
      user_id = 1
    ))
  );

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users/admins can mark notifications read" ON public.notifications;
CREATE POLICY "Users/admins can mark notifications read" ON public.notifications
  FOR UPDATE USING (
    public.is_admin() OR
    (target_role = 'user' AND user_id = 1)
  );

-- --------------------------------------------------------
-- 14. audit_logs Policies
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- Storage Buckets Configuration
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('banners', 'banners', true),
  ('products', 'products', true),
  ('avatars', 'avatars', true),
  ('support-media', 'support-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public can read banners bucket" ON storage.objects;
CREATE POLICY "Public can read banners bucket" ON storage.objects
  FOR SELECT USING (bucket_id IN ('banners', 'products', 'avatars', 'support-media'));

DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
CREATE POLICY "Admins can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    bucket_id IN ('avatars', 'support-media')
  );

DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
CREATE POLICY "Admins can update files" ON storage.objects
  FOR UPDATE WITH CHECK (
    public.is_admin() OR
    bucket_id IN ('avatars', 'support-media')
  );

DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;
CREATE POLICY "Admins can delete files" ON storage.objects
  FOR DELETE USING (public.is_admin());

-- Enable Realtime publication for key tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
      public.products,
      public.banners,
      public.categories,
      public.product_badges,
      public.orders,
      public.support_tickets,
      public.articles,
      public.general_settings;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if publication already exists or not in supabase hosted environment
  NULL;
END $$;
