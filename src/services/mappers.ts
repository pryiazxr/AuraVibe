import type {
  CategoryItem,
  ProductBadgeItem,
  Product,
  ProductReview,
  Banner,
  Order,
  User,
  AdminUser,
  SupportTicket,
  Article,
  GlobalSEO,
  GeneralSettings,
  RedirectRule,
  AppNotification,
  AuditLog
} from './db';

// --- CATEGORY ---
export function rowToCategory(row: any): CategoryItem {
  return {
    id: Number(row.id),
    name: row.name,
    image: row.image,
    displayOrder: row.display_order ?? row.displayOrder ?? 0
  };
}

export function categoryToRow(item: Partial<CategoryItem>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.name !== undefined) row.name = item.name;
  if (item.image !== undefined) row.image = item.image;
  if (item.displayOrder !== undefined) row.display_order = item.displayOrder;
  return row;
}

// --- BADGE ---
export function rowToBadge(row: any): ProductBadgeItem {
  return {
    id: Number(row.id),
    title: row.title,
    color: row.color ?? undefined
  };
}

export function badgeToRow(item: Partial<ProductBadgeItem>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.title !== undefined) row.title = item.title;
  if (item.color !== undefined) row.color = item.color;
  return row;
}

// --- PRODUCT REVIEW ---
export function rowToReview(row: any): ProductReview {
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    userId: row.user_id ? Number(row.user_id) : undefined,
    userName: row.user_name ?? 'کاربر آورا',
    userAvatar: row.user_avatar ?? undefined,
    rating: Number(row.rating),
    comment: row.comment ?? '',
    status: row.status ?? 'approved',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

export function reviewToRow(item: Partial<ProductReview>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.productId !== undefined) row.product_id = item.productId;
  if (item.userId !== undefined) row.user_id = item.userId;
  if (item.userName !== undefined) row.user_name = item.userName;
  if (item.userAvatar !== undefined) row.user_avatar = item.userAvatar;
  if (item.rating !== undefined) row.rating = item.rating;
  if (item.comment !== undefined) row.comment = item.comment;
  if (item.status !== undefined) row.status = item.status;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- PRODUCT ---
export function rowToProduct(row: any): Product {
  return {
    id: Number(row.id),
    productCode: row.product_code ?? row.productCode ?? `AUR-${row.id}`,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    stock: Number(row.stock ?? 0),
    images: Array.isArray(row.images) ? row.images : [],
    mainImageIndex: Number(row.main_image_index ?? 0),
    videoUrl: row.video_url ?? undefined,
    cropData: row.crop_data ?? undefined,
    badge: row.badge ?? undefined,
    colors: Array.isArray(row.colors) ? row.colors : [],
    description: row.description ?? '',
    seo: row.seo ?? undefined,
    relatedIds: Array.isArray(row.related_ids) ? row.related_ids : [],
    status: row.status ?? 'active',
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

export function productToRow(item: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.productCode !== undefined) row.product_code = item.productCode;
  if (item.name !== undefined) row.name = item.name;
  if (item.category !== undefined) row.category = item.category;
  if (item.price !== undefined) row.price = item.price;
  if (item.oldPrice !== undefined) row.old_price = item.oldPrice;
  if (item.stock !== undefined) row.stock = item.stock;
  if (item.images !== undefined) row.images = item.images;
  if (item.mainImageIndex !== undefined) row.main_image_index = item.mainImageIndex;
  if (item.videoUrl !== undefined) row.video_url = item.videoUrl;
  if (item.cropData !== undefined) row.crop_data = item.cropData;
  if (item.badge !== undefined) row.badge = item.badge;
  if (item.colors !== undefined) row.colors = item.colors;
  if (item.description !== undefined) row.description = item.description;
  if (item.seo !== undefined) row.seo = item.seo;
  if (item.relatedIds !== undefined) row.related_ids = item.relatedIds;
  if (item.status !== undefined) row.status = item.status;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- BANNER ---
export function rowToBanner(row: any): Banner {
  return {
    id: Number(row.id),
    internalName: row.internal_name ?? row.internalName ?? '',
    eyebrow: row.eyebrow ?? '',
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    image: row.image,
    targetCategory: row.target_category ?? undefined,
    ctaText: row.cta_text ?? undefined,
    link: row.link ?? undefined,
    cropData: row.crop_data ?? undefined,
    active: Boolean(row.active),
    displayOrder: Number(row.display_order ?? row.displayOrder ?? 0)
  };
}

export function bannerToRow(item: Partial<Banner>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.internalName !== undefined) row.internal_name = item.internalName;
  if (item.eyebrow !== undefined) row.eyebrow = item.eyebrow;
  if (item.title !== undefined) row.title = item.title;
  if (item.subtitle !== undefined) row.subtitle = item.subtitle;
  if (item.image !== undefined) row.image = item.image;
  if (item.targetCategory !== undefined) row.target_category = item.targetCategory;
  if (item.ctaText !== undefined) row.cta_text = item.ctaText;
  if (item.link !== undefined) row.link = item.link;
  if (item.cropData !== undefined) row.crop_data = item.cropData;
  if (item.active !== undefined) row.active = item.active;
  if (item.displayOrder !== undefined) row.display_order = item.displayOrder;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- USER ---
export function rowToUser(row: any): User {
  return {
    id: Number(row.id),
    authUserId: row.auth_user_id ?? undefined,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? undefined,
    avatar: row.avatar ?? undefined,
    address: row.address ?? undefined,
    province: row.province ?? undefined,
    city: row.city ?? undefined,
    postalCode: row.postal_code ?? undefined,
    registrationDate: row.registration_date ?? '',
    lastLogin: row.last_login ?? '',
    status: row.status ?? 'active',
    blockReason: row.block_reason ?? undefined,
    orderCount: Number(row.order_count ?? 0)
  };
}

export function userToRow(item: Partial<User>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.authUserId !== undefined) row.auth_user_id = item.authUserId;
  if (item.firstName !== undefined) row.first_name = item.firstName;
  if (item.lastName !== undefined) row.last_name = item.lastName;
  if (item.phone !== undefined) row.phone = item.phone;
  if (item.email !== undefined) row.email = item.email;
  if (item.avatar !== undefined) row.avatar = item.avatar;
  if (item.address !== undefined) row.address = item.address;
  if (item.province !== undefined) row.province = item.province;
  if (item.city !== undefined) row.city = item.city;
  if (item.postalCode !== undefined) row.postal_code = item.postalCode;
  if (item.registrationDate !== undefined) row.registration_date = item.registrationDate;
  if (item.lastLogin !== undefined) row.last_login = item.lastLogin;
  if (item.status !== undefined) row.status = item.status;
  if (item.blockReason !== undefined) row.block_reason = item.blockReason;
  if (item.orderCount !== undefined) row.order_count = item.orderCount;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- ADMIN USER ---
export function rowToAdmin(row: any): AdminUser {
  return {
    id: Number(row.id),
    authUserId: row.auth_user_id,
    adminCode: row.admin_code ?? '',
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    username: row.username ?? '',
    role: row.role ?? 'MANAGER',
    customPermissions: Array.isArray(row.custom_permissions) ? row.custom_permissions : [],
    status: row.status ?? 'active',
    createdAt: row.created_at ?? '',
    lastLogin: row.last_login ?? ''
  };
}

export function adminToRow(item: Partial<AdminUser>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.authUserId !== undefined) row.auth_user_id = item.authUserId;
  if (item.adminCode !== undefined) row.admin_code = item.adminCode;
  if (item.firstName !== undefined) row.first_name = item.firstName;
  if (item.lastName !== undefined) row.last_name = item.lastName;
  if (item.username !== undefined) row.username = item.username;
  if (item.role !== undefined) row.role = item.role;
  if (item.customPermissions !== undefined) row.custom_permissions = item.customPermissions;
  if (item.status !== undefined) row.status = item.status;
  if (item.lastLogin !== undefined) row.last_login = item.lastLogin;
  return row;
}

// --- ORDER ---
export function rowToOrder(row: any): Order {
  return {
    id: String(row.id),
    orderNumber: row.order_number ?? String(row.id),
    customer: row.customer,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount ?? 0),
    totalAmount: Number(row.total_amount),
    shippingMethod: row.shipping_method,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method ?? row.paymentMethod ?? 'card_to_card',
    paymentReceiptUrl: row.payment_receipt_url ?? row.paymentReceiptUrl ?? undefined,
    paymentGatewayProvider: row.payment_gateway_provider ?? row.paymentGatewayProvider ?? undefined,
    trackingCode: row.tracking_code ?? undefined,
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

export function orderToRow(item: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.orderNumber !== undefined) row.order_number = item.orderNumber;
  if (item.customer !== undefined) {
    row.customer = item.customer;
    if (item.customer.userId) row.user_id = item.customer.userId;
  }
  if (item.items !== undefined) row.items = item.items;
  if (item.subtotal !== undefined) row.subtotal = item.subtotal;
  if (item.discount !== undefined) row.discount = item.discount;
  if (item.totalAmount !== undefined) row.total_amount = item.totalAmount;
  if (item.shippingMethod !== undefined) row.shipping_method = item.shippingMethod;
  if (item.orderStatus !== undefined) row.order_status = item.orderStatus;
  if (item.paymentStatus !== undefined) row.payment_status = item.paymentStatus;
  if (item.paymentMethod !== undefined) row.payment_method = item.paymentMethod;
  if (item.paymentReceiptUrl !== undefined) row.payment_receipt_url = item.paymentReceiptUrl;
  if (item.paymentGatewayProvider !== undefined) row.payment_gateway_provider = item.paymentGatewayProvider;
  if (item.trackingCode !== undefined) row.tracking_code = item.trackingCode;
  if (item.timeline !== undefined) row.timeline = item.timeline;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- SUPPORT TICKET ---
export function rowToTicket(row: any): SupportTicket {
  return {
    id: String(row.id),
    ticketNumber: row.ticket_number ?? String(row.id),
    userId: row.user_id ? Number(row.user_id) : undefined,
    customerName: row.customer_name ?? '',
    customerPhone: row.customer_phone ?? '',
    customerAvatar: row.customer_avatar ?? undefined,
    subject: row.subject ?? '',
    category: row.category,
    status: row.status ?? 'New',
    priority: row.priority ?? 'Normal',
    assignedAdminId: row.assigned_admin_id ? Number(row.assigned_admin_id) : undefined,
    isPinned: Boolean(row.is_pinned),
    isBlocked: Boolean(row.is_blocked),
    unreadAdminCount: Number(row.unread_admin_count ?? 0),
    unreadUserCount: Number(row.unread_user_count ?? 0),
    messages: Array.isArray(row.messages) ? row.messages : [],
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString()
  };
}

export function ticketToRow(item: Partial<SupportTicket>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.ticketNumber !== undefined) row.ticket_number = item.ticketNumber;
  if (item.userId !== undefined) row.user_id = item.userId;
  if (item.customerName !== undefined) row.customer_name = item.customerName;
  if (item.customerPhone !== undefined) row.customer_phone = item.customerPhone;
  if (item.customerAvatar !== undefined) row.customer_avatar = item.customerAvatar;
  if (item.subject !== undefined) row.subject = item.subject;
  if (item.category !== undefined) row.category = item.category;
  if (item.status !== undefined) row.status = item.status;
  if (item.priority !== undefined) row.priority = item.priority;
  if (item.assignedAdminId !== undefined) row.assigned_admin_id = item.assignedAdminId;
  if (item.isPinned !== undefined) row.is_pinned = item.isPinned;
  if (item.isBlocked !== undefined) row.is_blocked = item.isBlocked;
  if (item.unreadAdminCount !== undefined) row.unread_admin_count = item.unreadAdminCount;
  if (item.unreadUserCount !== undefined) row.unread_user_count = item.unreadUserCount;
  if (item.messages !== undefined) row.messages = item.messages;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- ARTICLE ---
export function rowToArticle(row: any): Article {
  return {
    id: Number(row.id),
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    fullArticleTitle: row.full_article_title ?? undefined,
    articleLink: row.article_link ?? undefined,
    displayOrder: row.display_order != null ? Number(row.display_order) : undefined,
    slug: row.slug,
    digest: row.digest ?? '',
    content: row.content ?? '',
    tag: row.tag ?? '',
    category: row.category ?? '',
    author: row.author ?? '',
    source: row.source ?? undefined,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    image: row.image,
    status: row.status ?? 'published',
    createdAt: row.created_at ?? new Date().toISOString(),
    publishedAt: row.published_at ?? new Date().toISOString(),
    seo: row.seo ?? {}
  };
}

export function articleToRow(item: Partial<Article>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.title !== undefined) row.title = item.title;
  if (item.subtitle !== undefined) row.subtitle = item.subtitle;
  if (item.fullArticleTitle !== undefined) row.full_article_title = item.fullArticleTitle;
  if (item.articleLink !== undefined) row.article_link = item.articleLink;
  if (item.displayOrder !== undefined) row.display_order = item.displayOrder;
  if (item.slug !== undefined) row.slug = item.slug;
  if (item.digest !== undefined) row.digest = item.digest;
  if (item.content !== undefined) row.content = item.content;
  if (item.tag !== undefined) row.tag = item.tag;
  if (item.category !== undefined) row.category = item.category;
  if (item.author !== undefined) row.author = item.author;
  if (item.source !== undefined) row.source = item.source;
  if (item.keywords !== undefined) row.keywords = item.keywords;
  if (item.image !== undefined) row.image = item.image;
  if (item.status !== undefined) row.status = item.status;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  if (item.publishedAt !== undefined) row.published_at = item.publishedAt;
  if (item.seo !== undefined) row.seo = item.seo;
  return row;
}

// --- GLOBAL SEO ---
export function rowToGlobalSEO(row: any): GlobalSEO {
  return {
    siteTitle: row.site_title ?? '',
    defaultMetaDescription: row.default_meta_description ?? '',
    defaultOgImage: row.default_og_image ?? '',
    defaultCanonical: row.default_canonical ?? '',
    organizationName: row.organization_name ?? '',
    organizationLogo: row.organization_logo ?? '',
    robotsTxt: row.robots_txt ?? '',
    sitemapGeneratedAt: row.sitemap_generated_at ?? new Date().toISOString()
  };
}

export function globalSeoToRow(item: Partial<GlobalSEO>): Record<string, any> {
  const row: Record<string, any> = { id: 1 };
  if (item.siteTitle !== undefined) row.site_title = item.siteTitle;
  if (item.defaultMetaDescription !== undefined) row.default_meta_description = item.defaultMetaDescription;
  if (item.defaultOgImage !== undefined) row.default_og_image = item.defaultOgImage;
  if (item.defaultCanonical !== undefined) row.default_canonical = item.defaultCanonical;
  if (item.organizationName !== undefined) row.organization_name = item.organizationName;
  if (item.organizationLogo !== undefined) row.organization_logo = item.organizationLogo;
  if (item.robotsTxt !== undefined) row.robots_txt = item.robotsTxt;
  if (item.sitemapGeneratedAt !== undefined) row.sitemap_generated_at = item.sitemapGeneratedAt;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- GENERAL SETTINGS ---
export function rowToGeneralSettings(row: any): GeneralSettings {
  return {
    siteName: row.site_name ?? 'AuraVibe',
    logoUrl: row.logo_url ?? '',
    faviconUrl: row.favicon_url ?? '',
    contactEmail: row.contact_email ?? '',
    contactPhone: row.contact_phone ?? '',
    address: row.address ?? '',
    workingHours: row.working_hours ?? '',
    socialLinks: row.social_links ?? {},
    timezone: row.timezone ?? 'Asia/Tehran',
    language: row.language ?? 'fa',
    headerLinks: Array.isArray(row.header_links) ? row.header_links : [],
    footerDescription: row.footer_description ?? '',
    notifications: row.notifications ?? {
      newOrder: true,
      newUser: true,
      newTicket: true,
      securityAlert: true
    },
    cardToCardSettings: row.card_to_card_settings ?? row.cardToCardSettings ?? {
      cardNumber: '6037997512345678',
      cardholderName: 'فروشگاه آورا وایب'
    },
    paymentGatewaySettings: row.payment_gateway_settings ?? row.paymentGatewaySettings ?? {
      providerName: 'درگاه پرداخت آنلاین',
      gatewayUrl: 'https://api.zarinpal.com/pg/v4/payment/request.json',
      active: false
    }
  };
}

export function generalSettingsToRow(item: Partial<GeneralSettings>): Record<string, any> {
  const row: Record<string, any> = { id: 1 };
  if (item.siteName !== undefined) row.site_name = item.siteName;
  if (item.logoUrl !== undefined) row.logo_url = item.logoUrl;
  if (item.faviconUrl !== undefined) row.favicon_url = item.faviconUrl;
  if (item.contactEmail !== undefined) row.contact_email = item.contactEmail;
  if (item.contactPhone !== undefined) row.contact_phone = item.contactPhone;
  if (item.address !== undefined) row.address = item.address;
  if (item.workingHours !== undefined) row.working_hours = item.workingHours;
  if (item.socialLinks !== undefined) row.social_links = item.socialLinks;
  if (item.timezone !== undefined) row.timezone = item.timezone;
  if (item.language !== undefined) row.language = item.language;
  if (item.headerLinks !== undefined) row.header_links = item.headerLinks;
  if (item.footerDescription !== undefined) row.footer_description = item.footerDescription;
  if (item.notifications !== undefined) row.notifications = item.notifications;
  if (item.cardToCardSettings !== undefined) row.card_to_card_settings = item.cardToCardSettings;
  if (item.paymentGatewaySettings !== undefined) row.payment_gateway_settings = item.paymentGatewaySettings;
  row.updated_at = new Date().toISOString();
  return row;
}

// --- REDIRECT ---
export function rowToRedirect(row: any): RedirectRule {
  return {
    id: String(row.id),
    sourceUrl: row.source_url,
    destinationUrl: row.destination_url,
    type: row.type ?? 301,
    createdAt: row.created_at ?? new Date().toISOString()
  };
}

export function redirectToRow(item: Partial<RedirectRule>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.sourceUrl !== undefined) row.source_url = item.sourceUrl;
  if (item.destinationUrl !== undefined) row.destination_url = item.destinationUrl;
  if (item.type !== undefined) row.type = item.type;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  return row;
}

// --- NOTIFICATION ---
export function rowToNotification(row: any): AppNotification {
  return {
    id: String(row.id),
    targetRole: row.target_role,
    userId: row.user_id ? Number(row.user_id) : undefined,
    title: row.title,
    message: row.message,
    type: row.type,
    read: Boolean(row.read),
    createdAt: row.created_at ?? new Date().toISOString()
  };
}

export function notificationToRow(item: Partial<AppNotification>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.targetRole !== undefined) row.target_role = item.targetRole;
  if (item.userId !== undefined) row.user_id = item.userId;
  if (item.title !== undefined) row.title = item.title;
  if (item.message !== undefined) row.message = item.message;
  if (item.type !== undefined) row.type = item.type;
  if (item.read !== undefined) row.read = item.read;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  return row;
}

// --- AUDIT LOG ---
export function rowToAuditLog(row: any): AuditLog {
  return {
    id: String(row.id),
    adminId: Number(row.admin_id ?? 0),
    adminName: row.admin_name ?? '',
    action: row.action ?? '',
    module: row.module ?? 'Settings',
    target: row.target ?? '',
    timestamp: row.timestamp ?? 'هم‌اکنون',
    date: row.date ?? '',
    time: row.time ?? '',
    ip: row.ip ?? '',
    device: row.device ?? '',
    details: row.details ?? ''
  };
}

export function auditLogToRow(item: Partial<AuditLog>): Record<string, any> {
  const row: Record<string, any> = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.adminId !== undefined) row.admin_id = item.adminId;
  if (item.adminName !== undefined) row.admin_name = item.adminName;
  if (item.action !== undefined) row.action = item.action;
  if (item.module !== undefined) row.module = item.module;
  if (item.target !== undefined) row.target = item.target;
  if (item.timestamp !== undefined) row.timestamp = item.timestamp;
  if (item.date !== undefined) row.date = item.date;
  if (item.time !== undefined) row.time = item.time;
  if (item.ip !== undefined) row.ip = item.ip;
  if (item.device !== undefined) row.device = item.device;
  if (item.details !== undefined) row.details = item.details;
  return row;
}
