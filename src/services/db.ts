import { supabase, isSupabaseConfigured, uploadToStorage } from './supabase';
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

class DatabaseService {
  private listeners: Set<() => void> = new Set();
  private realtimeChannel: any = null;

  // In-memory caches to allow instant initial reads and fast synchronous lookups
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
  private cachedSEO: GlobalSEO = {
    siteTitle: 'AuraVibe | فروشگاه تخصصی اکسسوری و زیورآلات ظریف',
    defaultMetaDescription: 'خرید جدیدترین زیورآلات دست‌ساز، ساعت زنانه، اسکرانچی، کلیپس و بدلیجات استیل رنگ ثابت با بسته‌بندی لوکس آورا استایل.',
    defaultOgImage: '',
    defaultCanonical: 'https://auravibe.ir',
    organizationName: 'مجموعه آورا وایب و وینا اکسسوری',
    organizationLogo: '',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://auravibe.ir/sitemap.xml',
    sitemapGeneratedAt: new Date().toISOString()
  };
  private cachedSettings: GeneralSettings = {
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

  constructor() {
    this.initRealtime();
  }

  private initRealtime() {
    if (!isSupabaseConfigured()) return;

    try {
      this.realtimeChannel = supabase
        .channel('public:auravibe-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            this.notify();
          }
        )
        .subscribe();
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
    if (!isSupabaseConfigured()) return this.cachedBadges;
    try {
      const { data, error } = await supabase.from('product_badges').select('*').order('id', { ascending: true });
      if (error) throw error;
      this.cachedBadges = (data || []).map(rowToBadge);
      return this.cachedBadges;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching badges:', err);
      return this.cachedBadges;
    }
  }

  public async saveBadge(badgeData: Partial<ProductBadgeItem>, adminUser?: { id: number; name: string }): Promise<ProductBadgeItem> {
    const row = badgeToRow(badgeData);
    if (!row.id) {
      // In PostgreSQL, identity or generate
      delete row.id;
    }
    const { data, error } = await supabase.from('product_badges').upsert(row).select().single();
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
    const { error } = await supabase.from('product_badges').delete().eq('id', id);
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
    if (!isSupabaseConfigured()) return this.cachedCategories;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      this.cachedCategories = (data || []).map(rowToCategory);
      return this.cachedCategories;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching categories:', err);
      return this.cachedCategories;
    }
  }

  public async saveCategory(catData: Partial<CategoryItem>, adminUser?: { id: number; name: string }): Promise<CategoryItem> {
    const row = categoryToRow(catData);
    if (!row.id) {
      delete row.id;
    }
    const { data, error } = await supabase.from('categories').upsert(row).select().single();
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
    const { error } = await supabase.from('categories').delete().eq('id', id);
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
    if (!isSupabaseConfigured()) return this.cachedProducts;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      this.cachedProducts = (data || []).map(rowToProduct);
      return this.cachedProducts;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching products:', err);
      return this.cachedProducts;
    }
  }

  public async getProductById(id: number): Promise<Product | undefined> {
    if (!isSupabaseConfigured()) return this.cachedProducts.find((p) => p.id === id);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error || !data) return undefined;
      return rowToProduct(data);
    } catch {
      return undefined;
    }
  }

  public async saveProduct(prodData: Partial<Product>, adminUser?: { id: number; name: string }): Promise<Product> {
    const row = productToRow(prodData);
    if (!row.id) {
      row.id = Math.floor(100000 + Math.random() * 899999);
      if (!row.product_code) row.product_code = `AUR-${row.id}`;
    }

    const { data, error } = await supabase.from('products').upsert(row).select().single();
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
        details: `کد: ${saved.productCode} | قیمت: ${saved.price} تومان | دسته: ${saved.category}`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async deleteArticle(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await supabase.from('articles').delete().eq('id', id);
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
        details: `مقاله شناسه ${id} حذف شد`
      }).catch(console.error);
    }
    this.notify();
  }

  public async deleteProduct(id: number, adminUser?: { id: number; name: string }): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
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
        details: `محصول شناسه ${id} حذف گردید`
      }).catch(console.error);
    }
    this.notify();
  }

  // --- BANNERS ---
  public async getBanners(): Promise<Banner[]> {
    if (!isSupabaseConfigured()) return this.cachedBanners;
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      this.cachedBanners = (data || []).map(rowToBanner);
      return this.cachedBanners;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching banners:', err);
      return this.cachedBanners;
    }
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

    const { data, error } = await supabase.from('banners').upsert(row).select().single();
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
      await supabase.from('banners').update({ display_order: item.display_order }).eq('id', item.id);
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
    const { error } = await supabase.from('banners').delete().eq('id', id);
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
    if (!isSupabaseConfigured()) return this.cachedOrders;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      this.cachedOrders = (data || []).map(rowToOrder);
      return this.cachedOrders;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching orders:', err);
      return this.cachedOrders;
    }
  }

  public async getValidOrders(): Promise<Order[]> {
    const all = await this.getOrders();
    const invalidStatuses: OrderStatus[] = ['لغو شده', 'مرجوع شده', 'ناموفق / مشکل در ارسال'];
    return all.filter((o) => !invalidStatuses.includes(o.orderStatus));
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    const all = await this.getOrders();
    return all.find((o) => o.id === id || o.orderNumber === id);
  }

  public async createOrder(orderPayload: {
    customer: OrderCustomer;
    items: OrderItemSnapshot[];
    shippingMethod: ShippingMethod;
  }): Promise<Order> {
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
    const { data, error } = await supabase.from('orders').insert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error creating order:', error);
      throw error;
    }
    const saved = rowToOrder(data);

    // Update order count for user
    if (orderPayload.customer.userId) {
      const user = await this.getUserById(orderPayload.customer.userId);
      if (user) {
        await supabase
          .from('users')
          .update({ order_count: (user.orderCount || 0) + 1 })
          .eq('id', user.id);
      }
    }

    // Add notification
    this.addNotification({
      targetRole: 'admin',
      title: 'سفارش جدید ثبت شد',
      message: `سفارش ${orderNum} به مبلغ ${totalAmount.toLocaleString('fa-IR')} تومان ثبت گردید.`,
      type: 'order'
    }).catch(console.error);

    this.notify();
    return saved;
  }

  public async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUser: { id: number; name: string },
    note?: string,
    shippingMethodKey?: ShippingMethodKey
  ): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) return;

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (shippingMethodKey) {
      if (shippingMethodKey === 'POST') {
        order.shippingMethod = {
          key: 'POST',
          title: 'پست پیشتاز',
          subtitle: 'ارسال به سراسر کشور (۲ تا ۴ روز کاری)',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      } else if (shippingMethodKey === 'TIPAX') {
        order.shippingMethod = {
          key: 'TIPAX',
          title: 'تیپاکس',
          subtitle: 'ارسال اکسپرس به سراسر کشور',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      } else {
        order.shippingMethod = {
          key: 'AURA_EXPRESS',
          title: 'پیک اختصاصی آورا',
          subtitle: 'فقط تهران (تحویل همان روز)',
          costNote: 'پس‌کرایه (پرداخت توسط مشتری در محل تحویل)'
        };
      }
    }

    const now = new Date();
    order.timeline.push({
      status: newStatus,
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      note: note || `وضعیت سفارش توسط ${adminUser.name} به "${newStatus}" تغییر نمود.`
    });

    const row = orderToRow(order);
    const { error } = await supabase.from('orders').update(row).eq('id', orderId);
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
      details: `تغییر از "${oldStatus}" به "${newStatus}"`
    }).catch(console.error);

    if (order.customer.userId) {
      this.addNotification({
        targetRole: 'user',
        userId: order.customer.userId,
        title: `به‌روزرسانی وضعیت سفارش ${order.orderNumber}`,
        message: `وضعیت سفارش شما به "${newStatus}" تغییر یافت.`,
        type: 'order'
      }).catch(console.error);
    }

    this.notify();
  }

  // --- USERS & ADMINS ---
  public async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured()) return this.cachedUsers;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      this.cachedUsers = (data || []).map(rowToUser);
      return this.cachedUsers;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching users:', err);
      return this.cachedUsers;
    }
  }

  public async getUserById(id: number): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  }

  public async saveUser(userData: Partial<User>, adminUser?: { id: number; name: string }): Promise<User> {
    const row = userToRow(userData);
    if (!row.id) {
      row.id = Math.floor(1000 + Math.random() * 8999);
      if (!row.registration_date) row.registration_date = new Date().toLocaleDateString('fa-IR');
      if (!row.status) row.status = 'active';
      if (!row.last_login) row.last_login = 'هم‌اکنون';
    }

    const { data, error } = await supabase.from('users').upsert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error saving user:', error);
      throw error;
    }
    const saved = rowToUser(data);

    if (adminUser) {
      this.addAuditLog({
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: userData.id ? 'User Edited' : 'User Created',
        module: 'Users',
        target: `${saved.firstName} ${saved.lastName}`,
        details: userData.id ? `وضعیت: ${saved.status}` : `شماره تماس: ${saved.phone}`
      }).catch(console.error);
    }

    this.notify();
    return saved;
  }

  public async blockUser(userId: number, blockReason: string, adminUser: { id: number; name: string }): Promise<void> {
    const { error } = await supabase
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
      details: `دلیل مسدودی: ${blockReason}`
    }).catch(console.error);
    this.notify();
  }

  public async unblockUser(userId: number, adminUser: { id: number; name: string }): Promise<void> {
    const { error } = await supabase
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
      details: 'کاربر از حالت مسدود خارج گردید'
    }).catch(console.error);
    this.notify();
  }

  // --- ADMIN USERS & SUPABASE AUTH ---
  public async getAdmins(): Promise<AdminUser[]> {
    if (!isSupabaseConfigured()) return this.cachedAdmins;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      this.cachedAdmins = (data || []).map(rowToAdmin);
      return this.cachedAdmins;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching admins:', err);
      return this.cachedAdmins;
    }
  }

  public async getCurrentAdmin(): Promise<AdminUser | null> {
    if (!isSupabaseConfigured()) {
      // Fallback in unconfigured mode
      const admins = await this.getAdmins();
      return admins[0] || null;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return null;

      const { data, error } = await supabase
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
    if (!isSupabaseConfigured()) {
      throw new Error('پیکربندی Supabase انجام نشده است. لطفاً فایل .env.local را تنظیم فرمایید.');
    }

    const email = usernameOrEmail.includes('@')
      ? usernameOrEmail
      : `${usernameOrEmail.trim().toLowerCase()}@auravibe.ir`;

    const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authResult.user) {
      throw new Error(authError?.message || 'نام کاربری یا رمز عبور نامعتبر است.');
    }

    const { data: adminData, error: adminErr } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', authResult.user.id)
      .eq('status', 'active')
      .single();

    if (adminErr || !adminData) {
      await supabase.auth.signOut();
      throw new Error('این حساب کاربری دسترسی معتبر ادمین در سیستم ندارد.');
    }

    const admin = rowToAdmin(adminData);

    // Update last_login
    await supabase
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

  public async adminLogout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
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

    const row = adminToRow(adminData);

    if (adminData.id) {
      // Edit existing application record
      const { data, error } = await supabase
        .from('admin_users')
        .update(row)
        .eq('id', adminData.id)
        .select()
        .single();
      if (error) throw error;
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
      // Create new admin
      const rawPassword = adminData.password || adminData.passwordHash || 'admin123';
      const email = `${(adminData.username || `admin_${Date.now()}`).trim().toLowerCase()}@auravibe.ir`;

      // Try RPC if defined
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_admin_user', {
        p_username: adminData.username || `admin_${Date.now()}`,
        p_email: email,
        p_password: rawPassword,
        p_first_name: adminData.firstName || 'ادمین',
        p_last_name: adminData.lastName || 'جدید',
        p_role: adminData.role || 'MANAGER',
        p_permissions: adminData.customPermissions || ['manage_products', 'manage_orders']
      });

      if (!rpcError && rpcResult?.user_id) {
        const admins = await this.getAdmins();
        const saved = admins.find((a) => a.username === adminData.username) || {
          id: Date.now(),
          adminCode: `ADM-${Math.floor(100 + Math.random() * 899)}`,
          firstName: adminData.firstName || 'ادمین',
          lastName: adminData.lastName || 'جدید',
          username: adminData.username || 'admin',
          role: adminData.role || 'MANAGER',
          customPermissions: adminData.customPermissions || [],
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: 'هرگز'
        };
        this.notify();
        return saved;
      }

      // Direct fallback insert if RLS permits
      row.id = Date.now();
      row.admin_code = `ADM-${Math.floor(100 + Math.random() * 899)}`;
      row.auth_user_id = row.auth_user_id || crypto.randomUUID();
      const { data, error } = await supabase.from('admin_users').insert(row).select().single();
      if (error) {
        console.error('[AuraVibe DB] Error creating admin:', error);
        throw error;
      }
      const saved = rowToAdmin(data);
      this.notify();
      return saved;
    }
  }

  // --- SUPPORT TICKETS ---
  public async getTickets(): Promise<SupportTicket[]> {
    if (!isSupabaseConfigured()) return this.cachedTickets;
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      this.cachedTickets = (data || []).map(rowToTicket);
      return this.cachedTickets;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching tickets:', err);
      return this.cachedTickets;
    }
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
    const { data, error } = await supabase.from('support_tickets').insert(row).select().single();
    if (error) {
      console.error('[AuraVibe DB] Error creating ticket:', error);
      throw error;
    }
    const saved = rowToTicket(data);
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
    const tickets = await this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

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
    const { error } = await supabase.from('support_tickets').update(row).eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error replying ticket:', error);
      throw error;
    }
    this.notify();
  }

  public async markTicketAsReadByAdmin(ticketId: string): Promise<void> {
    const tickets = await this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.unreadAdminCount = 0;
    ticket.messages.forEach((m) => {
      if (m.sender === 'customer') m.readByAdmin = true;
    });

    const row = ticketToRow(ticket);
    await supabase.from('support_tickets').update(row).eq('id', ticketId);
    this.notify();
  }

  public async markTicketAsReadByUser(ticketId: string): Promise<void> {
    const tickets = await this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.unreadUserCount = 0;
    ticket.messages.forEach((m) => {
      if (m.sender === 'admin') m.readByUser = true;
    });

    const row = ticketToRow(ticket);
    await supabase.from('support_tickets').update(row).eq('id', ticketId);
    this.notify();
  }

  public async updateTicketState(
    ticketId: string,
    updates: Partial<Pick<SupportTicket, 'status' | 'isPinned' | 'isBlocked'>>
  ): Promise<void> {
    const row: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.isPinned !== undefined) row.is_pinned = updates.isPinned;
    if (updates.isBlocked !== undefined) row.is_blocked = updates.isBlocked;

    const { error } = await supabase.from('support_tickets').update(row).eq('id', ticketId);
    if (error) {
      console.error('[AuraVibe DB] Error updating ticket state:', error);
      throw error;
    }
    this.notify();
  }

  public async deleteMessageFromTicket(ticketId: string, messageId: string): Promise<void> {
    const tickets = await this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.messages = ticket.messages.filter((m) => m.id !== messageId);
    ticket.updatedAt = new Date().toISOString();

    const row = ticketToRow(ticket);
    await supabase.from('support_tickets').update(row).eq('id', ticketId);
    this.notify();
  }

  // --- ARTICLES / MAGAZINE ---
  public async getArticles(): Promise<Article[]> {
    if (!isSupabaseConfigured()) return this.cachedArticles;
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      this.cachedArticles = (data || []).map(rowToArticle);
      return this.cachedArticles;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching articles:', err);
      return this.cachedArticles;
    }
  }

  public async saveArticle(articleData: Partial<Article>, adminUser?: { id: number; name: string }): Promise<Article> {
    const row = articleToRow(articleData);
    if (!row.id) {
      row.id = Date.now();
      if (!row.slug) row.slug = `article-${Date.now()}`;
    }

    const { data, error } = await supabase.from('articles').upsert(row).select().single();
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

  // --- SEO & SETTINGS ---
  public async getGlobalSEO(): Promise<GlobalSEO> {
    if (!isSupabaseConfigured()) return this.cachedSEO;
    try {
      const { data, error } = await supabase.from('global_seo').select('*').eq('id', 1).maybeSingle();
      if (error || !data) return this.cachedSEO;
      this.cachedSEO = rowToGlobalSEO(data);
      return this.cachedSEO;
    } catch {
      return this.cachedSEO;
    }
  }

  public async updateGlobalSEO(seoData: Partial<GlobalSEO>, adminUser?: { id: number; name: string }): Promise<void> {
    const row = globalSeoToRow(seoData);
    const { error } = await supabase.from('global_seo').upsert(row);
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
    if (!isSupabaseConfigured()) return this.cachedSettings;
    try {
      const { data, error } = await supabase.from('general_settings').select('*').eq('id', 1).maybeSingle();
      if (error || !data) return this.cachedSettings;
      this.cachedSettings = rowToGeneralSettings(data);
      return this.cachedSettings;
    } catch {
      return this.cachedSettings;
    }
  }

  public async updateGeneralSettings(settings: Partial<GeneralSettings>, adminUser?: { id: number; name: string }): Promise<void> {
    const row = generalSettingsToRow(settings);
    const { error } = await supabase.from('general_settings').upsert(row);
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
    if (!isSupabaseConfigured()) return this.cachedRedirects;
    try {
      const { data, error } = await supabase.from('redirects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.cachedRedirects = (data || []).map(rowToRedirect);
      return this.cachedRedirects;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching redirects:', err);
      return this.cachedRedirects;
    }
  }

  public async saveRedirect(redirect: Partial<RedirectRule>, adminUser?: { id: number; name: string }): Promise<RedirectRule> {
    const row = redirectToRow(redirect);
    if (!row.id) row.id = String(Date.now());
    const { data, error } = await supabase.from('redirects').upsert(row).select().single();
    if (error) throw error;
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
    const { error } = await supabase.from('redirects').delete().eq('id', id);
    if (error) throw error;
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
    if (!isSupabaseConfigured()) return this.cachedAuditLogs;
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      this.cachedAuditLogs = (data || []).map(rowToAuditLog);
      return this.cachedAuditLogs;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching audit logs:', err);
      return this.cachedAuditLogs;
    }
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

    if (isSupabaseConfigured()) {
      const row = auditLogToRow(newLog);
      await supabase.from('audit_logs').insert(row);
    } else {
      this.cachedAuditLogs.unshift(newLog);
    }
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(role: 'admin' | 'user', userId?: number): Promise<AppNotification[]> {
    if (!isSupabaseConfigured()) {
      return this.cachedNotifications.filter((n) => n.targetRole === role && (!userId || n.userId === userId));
    }
    try {
      let query = supabase.from('notifications').select('*').eq('target_role', role);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      this.cachedNotifications = (data || []).map(rowToNotification);
      return this.cachedNotifications;
    } catch (err) {
      console.error('[AuraVibe DB] Error fetching notifications:', err);
      return this.cachedNotifications;
    }
  }

  public async addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      const row = notificationToRow(newNotif);
      await supabase.from('notifications').insert(row);
    }
    this.notify();
  }
}

export const db = new DatabaseService();
