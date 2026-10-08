import { supabase, isSupabaseConfigured, uploadToStorage, requireSupabase } from './supabase';
import {
  rowToCategory, categoryToRow,
  rowToBadge, badgeToRow,
  rowToProduct, productToRow,
  rowToBanner, bannerToRow,
  rowToUser, userToRow,
  rowToAdmin, adminToRow,
  rowToOrder, orderToRow,
  rowToTicket, ticketToRow,
  rowToArticle, articleToRow,
  rowToGlobalSEO, globalSeoToRow,
  rowToGeneralSettings, generalSettingsToRow,
  rowToRedirect, redirectToRow,
  rowToNotification, notificationToRow,
  rowToAuditLog, auditLogToRow
} from './mappers';

// --- TYPES & INTERFACES ---

export type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: '1:1' | '4:5' | '16:9' | 'custom';
};

export type ProductSEO = {
  title?: string;
  metaDescription?: string;
  slug?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: string;
};

export type CategoryItem = {
  id: number;
  name: string;
  image: string;
  displayOrder: number;
};

export type ProductBadgeItem = {
  id: number;
  title: string;
  color?: string;
};

export type Product = {
  id: number;
  productCode: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  mainImageIndex: number;
  videoUrl?: string;
  cropData?: CropData;
  badge?: string;
  colors: string[];
  description: string;
  seo?: ProductSEO;
  relatedIds?: number[];
  status: 'active' | 'draft' | 'archived';
  updatedAt: string;
};

export type Banner = {
  id: number;
  internalName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  targetCategory?: string;
  ctaText?: string;
  link?: string;
  cropData?: CropData;
  active: boolean;
  displayOrder: number;
};

export type ShippingMethodKey = 'POST' | 'TIPAX' | 'AURA_EXPRESS';

export type ShippingMethod = {
  key: ShippingMethodKey;
  title: string;
  subtitle: string;
  costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)';
};

export type OrderStatus =
  | 'جدید'
  | 'در حال بررسی'
  | 'تأیید شده'
  | 'در حال آماده‌سازی'
  | 'آماده ارسال'
  | 'تحویل به شرکت حمل'
  | 'ارسال شده'
  | 'تحویل داده شده'
  | 'لغو شده'
  | 'مرجوع شده'
  | 'ناموفق / مشکل در ارسال';

export type PaymentStatus = 'پرداخت شده' | 'در انتظار پرداخت' | 'ناموفق' | 'عکاسی/ثبت دستی';

export type OrderItemSnapshot = {
  productId: number;
  productCode: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  color?: string;
  lineTotal: number;
};

export type TimelineEvent = {
  status: OrderStatus;
  date: string;
  time: string;
  note?: string;
};

export type OrderCustomer = {
  userId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  fullAddress: string;
  postalCode: string;
};

export type Order = {
  id: string; // e.g., 'ORD-10452'
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  shippingMethod: ShippingMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingCode?: string;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type UserStatus = 'active' | 'blocked';

export type User = {
  id: number;
  authUserId?: string;
  firstName: string;
  lastName: string;
  phone: string; // Unique Identifier
  email?: string;
  avatar?: string;
  address?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  registrationDate: string;
  lastLogin: string;
  status: UserStatus;
  blockReason?: string;
  orderCount: number;
};

export type Permission =
  | 'manage_products'
  | 'manage_orders'
  | 'manage_banners'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_support'
  | 'manage_content'
  | 'manage_seo'
  | 'manage_settings'
  | 'view_audit_logs';

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'PRODUCT_MANAGER' | 'ORDER_MANAGER' | 'CONTENT_MANAGER' | 'SUPPORT_AGENT';

export type AdminUser = {
  id: number;
  authUserId?: string;
  adminCode: string;
  firstName: string;
  lastName: string;
  username: string; // Unique
  passwordHash?: string;
  role: AdminRole;
  customPermissions: Permission[];
  status: 'active' | 'disabled';
  createdAt: string;
  lastLogin: string;
};

export type TicketStatus = 'New' | 'Open' | 'Closed' | 'In Progress' | 'Waiting for Customer' | 'Resolved';
export type TicketPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type TicketMessage = {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  senderName: string;
  message: string;
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  attachments?: string[];
  createdAt: string;
  isInternalNote?: boolean;
  readByAdmin?: boolean;
  readByUser?: boolean;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  userId?: number;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  subject: string;
  category: 'مشکل سفارش' | 'مشکل پرداخت' | 'پیگیری ارسال' | 'مرجوعی' | 'حساب کاربری' | 'سوال درباره محصول' | 'سایر';
  status: TicketStatus;
  priority: TicketPriority;
  assignedAdminId?: number;
  isPinned?: boolean;
  isBlocked?: boolean;
  unreadAdminCount?: number;
  unreadUserCount?: number;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
};

export type Article = {
  id: number;
  title: string;
  subtitle?: string;
  fullArticleTitle?: string;
  articleLink?: string;
  displayOrder?: number;
  slug: string;
  digest: string;
  content: string; // Rich body content with markdown/image block nodes
  tag: string;
  category: string;
  author: string;
  source?: string;
  keywords: string[];
  image: string;
  status: 'published' | 'draft' | 'scheduled';
  createdAt: string;
  publishedAt: string;
  seo: {
    seoTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
};

export type RedirectRule = {
  id: string;
  sourceUrl: string;
  destinationUrl: string;
  type: 301 | 302;
  createdAt: string;
};

export type GlobalSEO = {
  siteTitle: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  defaultCanonical: string;
  organizationName: string;
  organizationLogo: string;
  robotsTxt: string;
  sitemapGeneratedAt: string;
};

export type GeneralSettings = {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  socialLinks: {
    instagram?: string;
    telegram?: string;
    bale?: string;
  };
  timezone: string;
  language: string;
  headerLinks: { title: string; url: string }[];
  footerDescription: string;
  notifications: {
    newOrder: boolean;
    newUser: boolean;
    newTicket: boolean;
    securityAlert: boolean;
  };
};

export type AuditLog = {
  id: string;
  adminId: number;
  adminName: string;
  action: string;
  module: 'Products' | 'Orders' | 'Banners' | 'Users' | 'Admins' | 'Content' | 'Settings' | 'Security';
  target: string;
  timestamp: string;
  date: string;
  time: string;
  ip: string;
  device: string;
  details: string;
};

export type AppNotification = {
  id: string;
  targetRole: 'admin' | 'user';
  userId?: number;
  title: string;
  message: string;
  type: 'order' | 'ticket' | 'user' | 'system' | 'security';
  read: boolean;
  createdAt: string;
};

export type CartItem = {
  id?: number;
  userId?: number;
  productId: number;
  product: Product;
  quantity: number;
  color?: string;
};

// --- HELPER UTILS ---

export function getJalaliDateString(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '۱۴۰۳/۰۶/۰۱';
    return d.toLocaleDateString('fa-IR-u-nu-latn');
  } catch {
    return '۱۴۰۳/۰۶/۰۱';
  }
}

// --- CENTRAL SUPABASE DATA ACCESS & REPOSITORY LAYER ---

const getClient = () => requireSupabase();

class DatabaseService {
  private listeners: Set<() => void> = new Set();
  private realtimeChannel: any = null;

  // Runtime In-memory caches to allow fast synchronous lookups during active sessions
  private cachedCategories: CategoryItem[] = [];
  private cachedBadges: ProductBadgeItem[] = [];
  private cachedProducts: Product[] = [];
  private cachedBanners: Banner[] = [];
  private cachedOrders: Order[] = [];
  private cachedUsers: User[] = [];
  private cachedAdmins: AdminUser[] = [];
  private cachedTickets: SupportTicket[] = [];
  private cachedArticles: Article[] = [];
  private cachedAuditLogs: AuditLog[] = [];
  private cachedRedirects: RedirectRule[] = [];
  private cachedNotifications: AppNotification[] = [];
  private cachedSEO: GlobalSEO | null = null;
  private cachedSettings: GeneralSettings | null = null;

  constructor() {
    this.initRealtime();
  }

  private initRealtime() {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const tables = [
        'products',
        'banners',
        'categories',
        'product_badges',
        'orders',
        'support_tickets',
        'general_settings',
        'user_carts',
        'user_wishlists'
      ];

      this.realtimeChannel = getClient().channel('auravibe-table-sync');

      for (const table of tables) {
        this.realtimeChannel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            this.notify();
          }
        );
      }

      this.realtimeChannel.subscribe();
    } catch (err) {
      console.warn('[AuraVibe DB] Realtime subscription could not be established:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[AuraVibe DB] Listener notification error:', err);
      }
    });
  }

  /**
   * Upload file or base64 to Supabase Storage
   */
  public async uploadFile(
    bucket: 'banners' | 'products' | 'avatars' | 'support-media',
    fileOrDataUrl: File | Blob | string,
    fileName?: string
  ): Promise<string> {
    return uploadToStorage(bucket, fileOrDataUrl, fileName);
  }

  // --- PRODUCT BADGES / LABELS ---
  public async getBadges(): Promise<ProductBadgeItem[]> {
    try {
      const { data, error } = await getClient().from('product_badges').select('*').order('id', { ascending: true });
      if (!error && data) {
        this.cachedBadges = data.map(rowToBadge);
        return this.cachedBadges;
      }
    } catch (err) {
      console.warn('[AuraVibe DB] Network fetch error for badges:', err);
    }
    return this.cachedBadges.length ? this.cachedBadges : [
      { id: 1, title: 'جدیدترین‌ها' },
      { id: 2, title: 'پرفروش‌ترین‌ها' },
      { id: 3, title: 'تخفیف ویژه' }
    ];
  }

  public async saveBadge(badgeData: Partial<ProductBadgeItem>, adminUser?: { id: number; name: string }): Promise<ProductBadgeItem> {
    const row = badgeToRow(badgeData);
    if (!row.id) {
      delete row.id;
    }
    const { data, error } = await getClient().from('product_badges').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving badge:', error);
      throw error;
    }
    const saved = rowToBadge(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: badgeData.id ? 'Badge Edited' : 'Badge Created',
        module: 'Settings',
        target: saved.title,
        details: badgeData.id ? 'برچسب محصول ویرایش شد' : 'برچسب جدید ایجاد شد'
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async deleteBadge(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('product_badges').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting badge:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Badge Deleted',
        module: 'Settings',
        target: String(id),
        details: `برچسب با شناسه ${id} حذف گردید`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- CATEGORIES ---
  public async getCategories(): Promise<CategoryItem[]> {
    try {
      const { data, error } = await getClient()
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        this.cachedCategories = data.map(rowToCategory);
        return this.cachedCategories;
      }
    } catch (err) {
      console.warn('[AuraVibe DB] Network fetch error for categories:', err);
    }
    return this.cachedCategories.length ? this.cachedCategories : [
      { id: 1, name: 'ساعت', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800', displayOrder: 1 },
      { id: 2, name: 'گردنبند', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800', displayOrder: 2 },
      { id: 3, name: 'دستبند', image: 'https://images.unsplash.com/photo-1611591475170-438d212b1928?q=80&w=800', displayOrder: 3 },
      { id: 4, name: 'گوشواره', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800', displayOrder: 4 }
    ];
  }

  public async saveCategory(catData: Partial<CategoryItem>, adminUser?: { id: number; name: string }): Promise<CategoryItem> {
    const row = categoryToRow(catData);
    if (!row.id) {
      delete row.id;
    }
    const { data, error } = await getClient().from('categories').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving category:', error);
      throw error;
    }
    const saved = rowToCategory(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: catData.id ? 'Category Edited' : 'Category Created',
        module: 'Settings',
        target: saved.name,
        details: catData.id ? 'نام دسته‌بندی تغییر یافت' : 'دسته‌بندی جدید ایجاد شد'
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async deleteCategory(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('categories').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting category:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Category Deleted',
        module: 'Settings',
        target: String(id),
        details: `دسته‌بندی ${id} حذف گردید`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- PRODUCTS ---
  public async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await getClient()
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data) {
        this.cachedProducts = data.map(rowToProduct);
        return this.cachedProducts;
      }
    } catch (err) {
      console.warn('[AuraVibe DB] Network fetch error for products:', err);
    }
    return this.cachedProducts.length ? this.cachedProducts : [
      {
        id: 101,
        productCode: 'AUR-101',
        name: 'گردنبند صدف و مروارید آورا',
        category: 'گردنبند',
        price: 380000,
        oldPrice: 450000,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800'],
        mainImageIndex: 0,
        badge: 'پرفروش',
        colors: ['#D4AF37'],
        description: 'گردنبند استیل ضدحساسیت رنگ ثابت با صدف طبیعی.',
        status: 'active',
        updatedAt: new Date().toISOString()
      },
      {
        id: 102,
        productCode: 'AUR-102',
        name: 'ساعت مچی ظریف طلایی وینتیج',
        category: 'ساعت',
        price: 890000,
        oldPrice: 1100000,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800'],
        mainImageIndex: 0,
        badge: 'جدید',
        colors: ['#D4AF37'],
        description: 'ساعت ضدآب ظریف تک‌موتوره ژاپنی با بند حصیری.',
        status: 'active',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  public async getProductById(id: number): Promise<Product | undefined> {
    const { data, error } = await getClient().from('products').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return rowToProduct(data);
  }

  public async saveProduct(prodData: Partial<Product>, adminUser?: { id: number; name: string }): Promise<Product> {
    const row = productToRow(prodData);
    if (!row.id) {
      row.id = Math.floor(100000 + Math.random() * 899999);
    }

    const { data, error } = await getClient().from('products').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving product:', error);
      throw error;
    }
    const saved = rowToProduct(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: prodData.id ? 'Product Edited' : 'Product Created',
        module: 'Products',
        target: saved.name,
        details: `کد محصول: ${saved.productCode} | قیمت: ${saved.price} تومان`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async deleteProduct(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('products').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting product:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Product Deleted',
        module: 'Products',
        target: String(id),
        details: `محصول با شناسه ${id} حذف شد`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- BANNERS ---
  public async getBanners(): Promise<Banner[]> {
    try {
      const { data, error } = await getClient()
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        this.cachedBanners = data.map(rowToBanner);
        return this.cachedBanners;
      }
    } catch (err) {
      console.warn('[AuraVibe DB] Network fetch error for banners:', err);
    }
    return this.cachedBanners.length ? this.cachedBanners : [
      {
        id: 1,
        internalName: 'بنر اصلی ۱',
        eyebrow: 'کالکشن زمستانه',
        title: 'درخشش در جزئیات',
        subtitle: 'مجموعه زیورآلات و ساعت‌های ظریف آورا وایب',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200',
        active: true,
        displayOrder: 1
      }
    ];
  }

  public async getActiveBanners(): Promise<Banner[]> {
    const banners = await this.getBanners();
    return banners.filter((b) => b.active);
  }

  public async saveBanner(bannerData: Partial<Banner>, adminUser?: { id: number; name: string }): Promise<Banner> {
    const row = bannerToRow(bannerData);
    if (!row.id) {
      row.id = Date.now();
    }

    const { data, error } = await getClient().from('banners').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving banner:', error);
      throw error;
    }
    const saved = rowToBanner(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: bannerData.id ? 'Banner Edited' : 'Banner Created',
        module: 'Banners',
        target: saved.internalName,
        details: `وضعیت: ${saved.active ? 'فعال' : 'غیرفعال'}`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async reorderBanners(reordered: Banner[], adminUser?: { id: number; name: string }): Promise<void> {
    const updates = reordered.map((b, idx) => ({
      id: b.id,
      display_order: idx + 1
    }));

    for (const item of updates) {
      const { error } = await getClient().from('banners').update({ display_order: item.display_order }).eq('id', item.id);
      if (error) {
        console.error('[AuraVibe DB] Error reordering banner:', error);
        throw error;
      }
    }

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Banners Reordered',
        module: 'Banners',
        target: 'اسلایدر اصلی',
        details: 'ترتیب بنرهای صفحه اصلی تغییر یافت'
      }).catch(console.error);
    }

    this.notify();
  }

  public async deleteBanner(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('banners').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting banner:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Banner Deleted',
        module: 'Banners',
        target: String(id),
        details: `بنر ${id} حذف شد`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- ORDERS ---
  public async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await getClient()
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        this.cachedOrders = data.map(rowToOrder);
        return this.cachedOrders;
      }
    } catch (err) {
      console.warn('[AuraVibe DB] Network fetch error for orders:', err);
    }
    return this.cachedOrders;
  }

  public async getValidOrders(): Promise<Order[]> {
    const all = await this.getOrders();
    const invalidStatuses: OrderStatus[] = ['لغو شده', 'مرجوع شده', 'ناموفق / مشکل در ارسال'];
    return all.filter((o) => !invalidStatuses.includes(o.orderStatus));
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    const { data, error } = await getClient()
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .maybeSingle();
    if (error || !data) return undefined;
    return rowToOrder(data);
  }

  public async createOrder(orderPayload: {
    customer: OrderCustomer;
    items: OrderItemSnapshot[];
    shippingMethod: ShippingMethod;
  }): Promise<Order> {
    // 1. Try secure RPC create_customer_order
    const { data: rpcData, error: rpcError } = await getClient().rpc('create_customer_order', {
      p_customer: orderPayload.customer,
      p_items: orderPayload.items,
      p_shipping_method: orderPayload.shippingMethod
    });

    if (!rpcError && rpcData) {
      const saved = rowToOrder(rpcData);
      this.cachedOrders.unshift(saved);

      // Auto notify admin
      this.addNotification({
        targetRole: 'admin',
        title: 'سفارش جدید',
        message: `سفارش جدید ${saved.orderNumber} به ارزش ${saved.totalAmount} تومان ثبت گردید.`,
        type: 'order'
      }).catch(console.error);

      this.notify();
      return saved;
    }

    // 2. Direct validated insert fallback
    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 89999)}`;
    const now = new Date();

    const subtotal = orderPayload.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
    const totalAmount = orderPayload.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = subtotal - totalAmount;

    const newOrder: Order = {
      id: orderNum,
      orderNumber: orderNum,
      customer: orderPayload.customer,
      items: orderPayload.items,
      subtotal,
      discount,
      totalAmount,
      shippingMethod: orderPayload.shippingMethod,
      orderStatus: 'جدید',
      paymentStatus: 'پرداخت شده',
      timeline: [
        {
          status: 'جدید',
          date: now.toLocaleDateString('fa-IR'),
          time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
          note: 'سفارش توسط خریدار در سایت ثبت گردید.'
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const row = orderToRow(newOrder);
    const { data, error } = await getClient().from('orders').insert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error creating order:', error);
      throw error;
    }
    const saved = rowToOrder(data);
    this.cachedOrders.unshift(saved);

    this.addNotification({
      targetRole: 'admin',
      title: 'سفارش جدید',
      message: `سفارش جدید ${saved.orderNumber} به ارزش ${saved.totalAmount} تومان ثبت گردید.`,
      type: 'order'
    }).catch(console.error);

    this.notify();
    return saved;
  }

  public async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    adminUser: { id: number; name: string },
    note?: string,
    trackingCode?: string
  ): Promise<void> {
    const now = new Date();
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('سفارش مورد نظر یافت نشد.');

    const newTimelineEvent: TimelineEvent = {
      status,
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      note: note || `وضعیت سفارش توسط ${adminUser.name} به «${status}» تغییر یافت.`
    };

    const updatedTimeline = [...order.timeline, newTimelineEvent];
    const updatePayload: Record<string, any> = {
      order_status: status,
      timeline: updatedTimeline,
      updated_at: now.toISOString()
    };
    if (trackingCode !== undefined) {
      updatePayload.tracking_code = trackingCode;
    }

    const { error } = await getClient().from('orders').update(updatePayload).eq('id', orderId);
    if (error) {
      console.error('[AuraVibe DB] Error updating order status:', error);
      throw error;
    }

    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'Order Status Changed',
      module: 'Orders',
      target: order.orderNumber,
      details: `وضعیت به «${status}» تغییر یافت`
    }).catch(console.error);

    this.notify();
  }

  public async deleteOrder(orderId: string, adminUser: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('[AuraVibe DB] Error deleting order:', error);
      throw error;
    }
    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'Order Deleted',
      module: 'Orders',
      target: orderId,
      details: 'سفارش از سیستم حذف گردید'
    }).catch(console.error);
    this.notify();
  }

  // --- USERS & ADMINS ---
  public async getUsers(): Promise<User[]> {
    const { data, error } = await getClient()
      .from('users')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.error('[AuraVibe DB] Error fetching users:', error);
      throw error;
    }
    this.cachedUsers = (data || []).map(rowToUser);
    return this.cachedUsers;
  }

  public async getUserById(id: number): Promise<User | undefined> {
    const { data, error } = await getClient().from('users').select('*').eq('id', id).maybeSingle();
    if (error || !data) return undefined;
    return rowToUser(data);
  }

  public async getUserByAuthId(authUserId: string): Promise<User | null> {
    try {
      const { data, error } = await getClient()
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToUser(data);
    } catch {
      return null;
    }
  }

  public async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await getClient()
        .from('users')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      if (error || !data) return null;
      return rowToUser(data);
    } catch {
      return null;
    }
  }

  public async saveUser(userData: Partial<User>, adminUser?: { id: number; name: string }): Promise<User> {
    const row = userToRow(userData);
    if (!row.id) {
      row.id = Math.floor(1000 + Math.random() * 8999);
      if (!row.registration_date) row.registration_date = new Date().toLocaleDateString('fa-IR');
      if (!row.status) row.status = 'active';
      if (!row.order_count) row.order_count = 0;
    }

    const { data, error } = await getClient().from('users').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving user:', error);
      throw error;
    }
    const saved = rowToUser(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: userData.id ? 'User Profile Updated' : 'New User Created',
        module: 'Users',
        target: `${saved.firstName} ${saved.lastName}`,
        details: `شماره همراه: ${saved.phone}`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async blockUser(userId: number, blockReason: string, adminUser: { id: number; name: string }): Promise<void> {
    const { error } = await getClient()
      .from('users')
      .update({ status: 'blocked', block_reason: blockReason })
      .eq('id', userId);
    if (error) {
      console.error('[AuraVibe DB] Error blocking user:', error);
      throw error;
    }

    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'User Blocked',
      module: 'Users',
      target: String(userId),
      details: `علت مسدودی: ${blockReason}`
    }).catch(console.error);

    this.notify();
  }

  public async unblockUser(userId: number, adminUser: { id: number; name: string }): Promise<void> {
    const { error } = await getClient()
      .from('users')
      .update({ status: 'active', block_reason: null })
      .eq('id', userId);
    if (error) {
      console.error('[AuraVibe DB] Error unblocking user:', error);
      throw error;
    }

    this.addAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'User Unblocked',
      module: 'Users',
      target: String(userId),
      details: 'حساب کاربر مجدداً فعال گردید'
    }).catch(console.error);

    this.notify();
  }

  public async getAdmins(): Promise<AdminUser[]> {
    const { data, error } = await getClient()
      .from('admin_users')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.error('[AuraVibe DB] Error fetching admins:', error);
      throw error;
    }
    this.cachedAdmins = (data || []).map(rowToAdmin);
    return this.cachedAdmins;
  }

  public async getCurrentAdmin(): Promise<AdminUser | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
      const { data: authData } = await getClient().auth.getUser();
      if (!authData?.user) return null;

      const { data, error } = await getClient()
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !data) return null;
      return rowToAdmin(data);
    } catch (err) {
      console.error('[AuraVibe DB] Error retrieving current admin:', err);
      return null;
    }
  }

  public async adminLogin(usernameOrEmail: string, password: string): Promise<AdminUser> {
    const cleanUsername = usernameOrEmail.trim().toLowerCase();
    const email = usernameOrEmail.includes('@')
      ? cleanUsername
      : `${cleanUsername}@auravibe.ir`;

    if (isSupabaseConfigured()) {
      try {
        const { data: authResult, error: authError } = await getClient().auth.signInWithPassword({
          email,
          password
        });

        if (!authError && authResult?.user) {
          const { data: adminData, error: adminErr } = await getClient()
            .from('admin_users')
            .select('*')
            .eq('auth_user_id', authResult.user.id)
            .eq('status', 'active')
            .single();

          if (!adminErr && adminData) {
            const admin = rowToAdmin(adminData);
            await getClient()
              .from('admin_users')
              .update({ last_login: 'هم‌اکنون' })
              .eq('id', admin.id);

            this.addAuditLog({
              adminId: admin.id,
              adminName: `${admin.firstName} ${admin.lastName}`,
              action: 'Admin Login',
              module: 'Security',
              target: admin.username,
              details: 'ورود موفقیت‌آمیز به پیشخوان مدیریتی'
            }).catch(console.error);

            this.notify();
            return admin;
          }
        }
      } catch (err) {
        console.warn('[AuraVibe DB] Supabase admin auth offline/fallback:', err);
      }
    }

    throw new Error('نام کاربری یا رمز عبور نامعتبر است.');
  }

  public async adminLogout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await getClient().auth.signOut();
    }
    this.notify();
  }

  public async userLogout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await getClient().auth.signOut();
    }
    this.notify();
  }

  public async saveAdmin(
    adminData: Partial<AdminUser> & { password?: string; passwordHash?: string },
    currentSuperAdmin: { id: number; name: string; role: AdminRole }
  ): Promise<AdminUser> {
    if (currentSuperAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('فقط مدیر اصلی (SUPER_ADMIN) مجاز به مدیریت حساب ادمین‌ها می‌باشد.');
    }

    if (adminData.id) {
      // Edit existing application record
      const row = adminToRow(adminData);
      delete row.auth_user_id; // Never overwrite auth_user_id on update
      const { data, error } = await getClient()
        .from('admin_users')
        .update(row)
        .eq('id', adminData.id)
        .select()
        .single();
      if (error) {
        console.error('[AuraVibe DB] Error updating admin user:', error);
        throw error;
      }
      const saved = rowToAdmin(data);
      this.addAuditLog({
        adminId: currentSuperAdmin.id,
        adminName: currentSuperAdmin.name,
        action: 'Admin Account Edited',
        module: 'Admins',
        target: saved.username,
        details: `نقش: ${saved.role}`
      }).catch(console.error);
      this.notify();
      return saved;
    } else {
      // Create new admin user in auth.users and admin_users via secure RPC
      const rawPassword = adminData.password || adminData.passwordHash;
      if (!rawPassword) {
        throw new Error('کلمه عبور اختصاصی برای ایجاد حساب ادمین الزامی است.');
      }
      const cleanUsername = (adminData.username || '').trim().toLowerCase();
      const email = `${cleanUsername}@auravibe.ir`;

      const { data: rpcResult, error: rpcError } = await getClient().rpc('create_admin_user', {
        p_username: cleanUsername,
        p_email: email,
        p_password: rawPassword,
        p_first_name: adminData.firstName || 'ادمین',
        p_last_name: adminData.lastName || 'جدید',
        p_role: adminData.role || 'MANAGER',
        p_permissions: adminData.customPermissions || ['manage_products', 'manage_orders']
      });

      if (rpcError) {
        console.error('[AuraVibe DB] Error creating admin user via RPC:', rpcError);
        throw rpcError;
      }

      const admins = await this.getAdmins();
      const saved = admins.find((a) => a.username === cleanUsername);
      if (!saved) {
        throw new Error('حساب ادمین ایجاد شد، لطفاً صفحه را مجدداً بارگذاری فرمایید.');
      }

      this.addAuditLog({
        adminId: currentSuperAdmin.id,
        adminName: currentSuperAdmin.name,
        action: 'Admin Account Created',
        module: 'Admins',
        target: saved.username,
        details: `کد ادمین: ${saved.adminCode} | نقش: ${saved.role}`
      }).catch(console.error);

      this.notify();
      return saved;
    }
  }

  // --- SUPPORT TICKETS ---
  public async getTickets(): Promise<SupportTicket[]> {
    const { data, error } = await getClient()
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[AuraVibe DB] Error fetching tickets:', error);
      throw error;
    }
    this.cachedTickets = (data || []).map(rowToTicket);
    return this.cachedTickets;
  }

  public async getUnreadSupportConversationsCount(): Promise<number> {
    const tickets = await this.getTickets();
    return tickets.filter((t) => (t.unreadAdminCount ?? 0) > 0 && t.status !== 'Closed').length;
  }

  public async createTicket(payload: {
    userId?: number;
    customerName: string;
    customerPhone: string;
    customerAvatar?: string;
    subject: string;
    category: SupportTicket['category'];
    initialMessage: string;
    mediaUrl?: string;
    mediaType?: 'text' | 'image' | 'video' | 'audio';
  }): Promise<SupportTicket> {
    // 1. Try secure RPC create_customer_ticket
    const { data: rpcData, error: rpcError } = await getClient().rpc('create_customer_ticket', {
      p_customer_name: payload.customerName,
      p_customer_phone: payload.customerPhone,
      p_subject: payload.subject,
      p_category: payload.category,
      p_initial_message: payload.initialMessage,
      p_media_url: payload.mediaUrl || null,
      p_media_type: payload.mediaType || 'text',
      p_customer_avatar: payload.customerAvatar || null
    });

    if (!rpcError && rpcData) {
      const saved = rowToTicket(rpcData);
      this.cachedTickets.unshift(saved);

      this.addNotification({
        targetRole: 'admin',
        title: 'تیکت پشتیبانی جدید',
        message: `گفتگوی جدید با موضوع «${saved.subject}» توسط ${saved.customerName} ایجاد شد.`,
        type: 'ticket'
      }).catch(console.error);

      this.notify();
      return saved;
    }

    // 2. Direct validated insert fallback
    const ticketNum = `TCK-${Math.floor(1000 + Math.random() * 8999)}`;
    const now = new Date();

    const newTicket: SupportTicket = {
      id: ticketNum,
      ticketNumber: ticketNum,
      userId: payload.userId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerAvatar: payload.customerAvatar,
      subject: payload.subject,
      category: payload.category,
      status: 'New',
      priority: 'Normal',
      unreadAdminCount: 1,
      unreadUserCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: payload.customerName,
          message: payload.initialMessage,
          type: payload.mediaType || 'text',
          mediaUrl: payload.mediaUrl,
          createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
          readByAdmin: false,
          readByUser: true
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const row = ticketToRow(newTicket);
    const { data, error } = await getClient().from('support_tickets').insert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error creating ticket:', error);
      throw error;
    }
    const saved = rowToTicket(data);
    this.cachedTickets.unshift(saved);

    this.addNotification({
      targetRole: 'admin',
      title: 'تیکت پشتیبانی جدید',
      message: `گفتگوی جدید با موضوع «${saved.subject}» توسط ${saved.customerName} ایجاد شد.`,
      type: 'ticket'
    }).catch(console.error);

    this.notify();
    return saved;
  }

  public async replyTicket(
    ticketId: string,
    message: string,
    sender: 'customer' | 'admin',
    senderName: string,
    isInternalNote = false,
    newStatus?: TicketStatus,
    mediaType: 'text' | 'image' | 'video' | 'audio' = 'text',
    mediaUrl?: string
  ): Promise<void> {
    const { data: currentData, error: fetchErr } = await getClient()
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchErr || !currentData) throw new Error('تیکت مورد نظر برای پاسخ‌گویی یافت نشد.');
    const ticket = rowToTicket(currentData);

    const now = new Date();
    ticket.messages.push({
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message,
      type: mediaType,
      mediaUrl,
      isInternalNote,
      createdAt: `${now.toLocaleDateString('fa-IR')} ${now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      readByAdmin: sender === 'admin',
      readByUser: sender === 'customer'
    });

    if (newStatus) {
      ticket.status = newStatus;
    } else if (sender === 'admin' && !isInternalNote) {
      ticket.status = 'Open';
      ticket.unreadUserCount = (ticket.unreadUserCount || 0) + 1;
    } else if (sender === 'customer') {
      ticket.status = 'New';
      ticket.unreadAdminCount = (ticket.unreadAdminCount || 0) + 1;
    }
    ticket.updatedAt = now.toISOString();

    const row = ticketToRow(ticket);
    const { error } = await getClient()
      .from('support_tickets')
      .update(row)
      .eq('id', ticketId);

    if (error) {
      console.error('[AuraVibe DB] Error replying ticket:', error);
      throw error;
    }

    this.notify();
  }

  public async updateTicketState(
    ticketId: string,
    updates: Partial<Pick<SupportTicket, 'status' | 'priority' | 'isPinned' | 'isBlocked' | 'assignedAdminId'>>
  ): Promise<void> {
    const rowUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.priority !== undefined) rowUpdates.priority = updates.priority;
    if (updates.isPinned !== undefined) rowUpdates.is_pinned = updates.isPinned;
    if (updates.isBlocked !== undefined) rowUpdates.is_blocked = updates.isBlocked;
    if (updates.assignedAdminId !== undefined) rowUpdates.assigned_admin_id = updates.assignedAdminId;

    const { error } = await getClient().from('support_tickets').update(rowUpdates).eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error updating ticket state:', error);
      throw error;
    }
    this.notify();
  }

  public async markTicketAsReadByAdmin(ticketId: string): Promise<void> {
    const { error } = await getClient()
      .from('support_tickets')
      .update({ unread_admin_count: 0 })
      .eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error marking ticket read by admin:', error);
      return;
    }
    this.notify();
  }

  public async markTicketAsReadByUser(ticketId: string): Promise<void> {
    const { error } = await getClient()
      .from('support_tickets')
      .update({ unread_user_count: 0 })
      .eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error marking ticket read by user:', error);
      return;
    }
    this.notify();
  }

  public async deleteMessageFromTicket(ticketId: string, messageId: string): Promise<void> {
    const { data, error: fetchErr } = await getClient()
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchErr || !data) return;
    const ticket = rowToTicket(data);
    ticket.messages = ticket.messages.filter((m) => m.id !== messageId);
    ticket.updatedAt = new Date().toISOString();

    const row = ticketToRow(ticket);
    const { error } = await getClient().from('support_tickets').update(row).eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error deleting message from ticket:', error);
      throw error;
    }
    this.notify();
  }

  // --- ARTICLES / MAGAZINE ---
  public async getArticles(): Promise<Article[]> {
    const { data, error } = await getClient()
      .from('articles')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      console.error('[AuraVibe DB] Error fetching articles:', error);
      throw error;
    }
    this.cachedArticles = (data || []).map(rowToArticle);
    return this.cachedArticles;
  }

  public async saveArticle(articleData: Partial<Article>, adminUser?: { id: number; name: string }): Promise<Article> {
    const row = articleToRow(articleData);
    if (!row.id) {
      row.id = Date.now();
      if (!row.slug) row.slug = `article-${Date.now()}`;
    }

    const { data, error } = await getClient().from('articles').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving article:', error);
      throw error;
    }
    const saved = rowToArticle(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: articleData.id ? 'Article Edited' : 'Article Created',
        module: 'Content',
        target: saved.title,
        details: `وضعیت: ${saved.status}`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async deleteArticle(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('articles').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting article:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Article Deleted',
        module: 'Content',
        target: String(id),
        details: `مقاله با شناسه ${id} حذف شد`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- SEO & SETTINGS ---
  public async getGlobalSEO(): Promise<GlobalSEO> {
    const { data, error } = await getClient().from('global_seo').select('*').eq('id', 1).maybeSingle();
    if (error) {
      console.error('[AuraVibe DB] Error fetching global SEO:', error);
      throw error;
    }
    if (!data) {
      return {
        siteTitle: 'AuraVibe | فروشگاه تخصصی اکسسوری و زیورآلات ظریف',
        defaultMetaDescription: 'خرید جدیدترین زیورآلات دست‌ساز، ساعت زنانه، اسکرانچی، کلیپس و بدلیجات استیل رنگ ثابت با بسته‌بندی لوکس آورا استایل.',
        defaultOgImage: '',
        defaultCanonical: 'https://auravibe.ir',
        organizationName: 'مجموعه آورا وایب و وینا اکسسوری',
        organizationLogo: '',
        robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://auravibe.ir/sitemap.xml',
        sitemapGeneratedAt: new Date().toISOString()
      };
    }
    this.cachedSEO = rowToGlobalSEO(data);
    return this.cachedSEO;
  }

  public async updateGlobalSEO(seoData: Partial<GlobalSEO>, adminUser?: { id: number; name: string }): Promise<void> {
    const row = globalSeoToRow(seoData);
    const { error } = await getClient().from('global_seo').upsert(row);
    if (error) {
      console.error('[AuraVibe DB] Error updating global SEO:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Global SEO Updated',
        module: 'Settings',
        target: 'موتورهای جستجو',
        details: 'تنظیمات کلی SEO ذخیره گردید'
      }).catch(console.error);
    }
    this.notify();
  }

  public async getGeneralSettings(): Promise<GeneralSettings> {
    const { data, error } = await getClient().from('general_settings').select('*').eq('id', 1).maybeSingle();
    if (error) {
      console.error('[AuraVibe DB] Error fetching general settings:', error);
      throw error;
    }
    if (!data) {
      return {
        siteName: 'AuraVibe | آورا وایب',
        logoUrl: '',
        faviconUrl: '',
        contactEmail: 'hello@auravibe.ir',
        contactPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
        address: 'تهران، خیابان نیاوران، پلاک ۱۵، واحد ۴',
        workingHours: 'همه روزه از ساعت ۹:۰۰ الی ۲۱:۰۰',
        socialLinks: {
          instagram: 'https://instagram.com/auravibe',
          telegram: 'https://t.me/auravibe',
          bale: 'https://ble.ir/auravibe'
        },
        timezone: 'Asia/Tehran',
        language: 'fa',
        headerLinks: [
          { title: 'صفحه اصلی', url: '/' },
          { title: 'جدیدترین‌ها', url: '/category/new' },
          { title: 'پرفروش‌ترین‌ها', url: '/category/bestsellers' },
          { title: 'مجله استایل', url: '/journal' }
        ],
        footerDescription: 'فروشگاه تخصصی اکسسوری و زیورآلات ظریف با تم کرم وانیلی و بنفش آورا. جزئیات کوچکی که استایل شما را درخشان‌تر می‌کنند.',
        notifications: {
          newOrder: true,
          newUser: true,
          newTicket: true,
          securityAlert: true
        }
      };
    }
    this.cachedSettings = rowToGeneralSettings(data);
    return this.cachedSettings;
  }

  public async updateGeneralSettings(settings: Partial<GeneralSettings>, adminUser?: { id: number; name: string }): Promise<void> {
    const row = generalSettingsToRow(settings);
    const { error } = await getClient().from('general_settings').upsert(row);
    if (error) {
      console.error('[AuraVibe DB] Error updating general settings:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'General Settings Updated',
        module: 'Settings',
        target: 'تنظیمات عمومی سایت',
        details: 'اطلاعات هدر، فوتر و ارتباطات آپدیت شد'
      }).catch(console.error);
    }
    this.notify();
  }

  // --- REDIRECTS ---
  public async getRedirects(): Promise<RedirectRule[]> {
    const { data, error } = await getClient().from('redirects').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[AuraVibe DB] Error fetching redirects:', error);
      throw error;
    }
    this.cachedRedirects = (data || []).map(rowToRedirect);
    return this.cachedRedirects;
  }

  public async saveRedirect(redirect: Partial<RedirectRule>, adminUser?: { id: number; name: string }): Promise<RedirectRule> {
    const row = redirectToRow(redirect);
    if (!row.id) row.id = String(Date.now());
    const { data, error } = await getClient().from('redirects').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving redirect:', error);
      throw error;
    }
    const saved = rowToRedirect(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Redirect Saved',
        module: 'Settings',
        target: saved.sourceUrl,
        details: `ریدایرکت به ${saved.destinationUrl}`
      }).catch(console.error);
    }
    this.notify();
    return saved;
  }

  public async deleteRedirect(id: string, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await getClient().from('redirects').delete().eq('id', id);
    if (error) {
      console.error('[AuraVibe DB] Error deleting redirect:', error);
      throw error;
    }
    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'Redirect Deleted',
        module: 'Settings',
        target: id,
        details: `ریدایرکت ${id} حذف شد`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- AUDIT LOGS ---
  public async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await getClient()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('[AuraVibe DB] Error fetching audit logs:', error);
      throw error;
    }
    this.cachedAuditLogs = (data || []).map(rowToAuditLog);
    return this.cachedAuditLogs;
  }

  public async addAuditLog(entry: {
    adminId: number;
    adminName: string;
    action: string;
    module: AuditLog['module'];
    target: string;
    details: string;
  }): Promise<void> {
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminId: entry.adminId,
      adminName: entry.adminName,
      action: entry.action,
      module: entry.module,
      target: entry.target,
      timestamp: 'هم‌اکنون',
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      ip: '127.0.0.1',
      device: 'Admin Panel Web',
      details: entry.details
    };

    const row = auditLogToRow(newLog);
    const { error } = await getClient().from('audit_logs').insert(row);
    if (error) {
      console.warn('[AuraVibe DB] Warning inserting audit log:', error.message);
    }
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(role: 'admin' | 'user', userId?: number): Promise<AppNotification[]> {
    let query = getClient().from('notifications').select('*').eq('target_role', role);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('[AuraVibe DB] Error fetching notifications:', error);
      throw error;
    }
    this.cachedNotifications = (data || []).map(rowToNotification);
    return this.cachedNotifications;
  }

  public async addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const row = notificationToRow(newNotif);
    const { error } = await getClient().from('notifications').insert(row);
    if (error) {
      console.warn('[AuraVibe DB] Warning inserting notification:', error.message);
    }
    this.notify();
  }

  // --- WISHLIST ---
  public async getUserWishlist(userId: number): Promise<Product[]> {
    try {
      const { data, error } = await getClient()
        .from('user_wishlists')
        .select('product_id')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) return [];

      const productIds = data.map((item) => item.product_id);
      const allProducts = await this.getProducts();
      return allProducts.filter((p) => productIds.includes(p.id));
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching user wishlist:', err);
      return [];
    }
  }

  public async addToWishlist(userId: number, productId: number): Promise<void> {
    try {
      const { error } = await getClient()
        .from('user_wishlists')
        .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });
      if (error) {
        console.error('[AuraVibe DB] Error adding to wishlist:', error);
      }
      this.notify();
    } catch (err) {
      console.error('[AuraVibe DB] Error adding to wishlist:', err);
    }
  }

  public async removeFromWishlist(userId: number, productId: number): Promise<void> {
    try {
      const { error } = await getClient()
        .from('user_wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) {
        console.error('[AuraVibe DB] Error removing from wishlist:', error);
      }
      this.notify();
    } catch (err) {
      console.error('[AuraVibe DB] Error removing from wishlist:', err);
    }
  }

  public async toggleWishlist(userId: number, productId: number): Promise<boolean> {
    try {
      const { data, error } = await getClient()
        .from('user_wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (!error && data) {
        await this.removeFromWishlist(userId, productId);
        return false;
      } else {
        await this.addToWishlist(userId, productId);
        return true;
      }
    } catch (err) {
      console.error('[AuraVibe DB] Error toggling wishlist:', err);
      return false;
    }
  }

  // --- CART ---
  public async getUserCart(userId: number): Promise<CartItem[]> {
    try {
      const { data, error } = await getClient()
        .from('user_carts')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: true });

      if (error || !data) return [];

      const allProducts = await this.getProducts();
      const items: CartItem[] = [];

      for (const row of data) {
        const product = allProducts.find((p) => p.id === row.product_id);
        if (product) {
          items.push({
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            product,
            quantity: row.quantity,
            color: row.color
          });
        }
      }
      return items;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching user cart:', err);
      return [];
    }
  }

  public async addToCart(
    userId: number,
    productId: number,
    quantity = 1,
    color?: string
  ): Promise<CartItem[]> {
    try {
      let query = getClient()
        .from('user_carts')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (color) {
        query = query.eq('color', color);
      } else {
        query = query.is('color', null);
      }

      const { data: existing, error: fetchErr } = await query.maybeSingle();

      if (!fetchErr && existing) {
        const newQty = existing.quantity + quantity;
        await getClient()
          .from('user_carts')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await getClient().from('user_carts').insert({
          user_id: userId,
          product_id: productId,
          quantity,
          color: color || null
        });
      }

      this.notify();
      return await this.getUserCart(userId);
    } catch (err) {
      console.error('[AuraVibe DB] Error adding to cart:', err);
      return await this.getUserCart(userId);
    }
  }

  public async updateCartItemQuantity(
    userId: number,
    productId: number,
    quantity: number,
    color?: string
  ): Promise<CartItem[]> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId, color);
      }

      let query = getClient()
        .from('user_carts')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (color) {
        query = query.eq('color', color);
      } else {
        query = query.is('color', null);
      }

      const { error } = await query;
      if (error) {
        console.error('[AuraVibe DB] Error updating cart quantity:', error);
      }

      this.notify();
      return await this.getUserCart(userId);
    } catch (err) {
      console.error('[AuraVibe DB] Error updating cart quantity:', err);
      return await this.getUserCart(userId);
    }
  }

  public async removeFromCart(
    userId: number,
    productId: number,
    color?: string
  ): Promise<CartItem[]> {
    try {
      let query = getClient()
        .from('user_carts')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (color) {
        query = query.eq('color', color);
      } else {
        query = query.is('color', null);
      }

      const { error } = await query;
      if (error) {
        console.error('[AuraVibe DB] Error removing from cart:', error);
      }

      this.notify();
      return await this.getUserCart(userId);
    } catch (err) {
      console.error('[AuraVibe DB] Error removing from cart:', err);
      return await this.getUserCart(userId);
    }
  }

  public async clearCart(userId: number): Promise<void> {
    try {
      const { error } = await getClient().from('user_carts').delete().eq('user_id', userId);
      if (error) {
        console.error('[AuraVibe DB] Error clearing cart:', error);
      }
      this.notify();
    } catch (err) {
      console.error('[AuraVibe DB] Error clearing cart:', err);
    }
  }

  public async mergeGuestCartAndWishlist(
    userId: number,
    guestCart: CartItem[],
    guestWishlist: Product[]
  ): Promise<{ cart: CartItem[]; wishlist: Product[] }> {
    try {
      for (const item of guestWishlist) {
        await this.addToWishlist(userId, item.id);
      }
      for (const item of guestCart) {
        await this.addToCart(userId, item.product.id, item.quantity, item.color);
      }
    } catch (err) {
      console.error('[AuraVibe DB] Error merging guest cart & wishlist:', err);
    }
    const cart = await this.getUserCart(userId);
    const wishlist = await this.getUserWishlist(userId);
    return { cart, wishlist };
  }
}

export const db = new DatabaseService();

export { isSupabaseConfigured, requireSupabase, supabase } from './supabase';
