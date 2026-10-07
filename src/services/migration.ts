import { supabase, isSupabaseConfigured, uploadToStorage } from './supabase';
import {
  categoryToRow,
  badgeToRow,
  productToRow,
  bannerToRow,
  userToRow,
  adminToRow,
  orderToRow,
  ticketToRow,
  articleToRow,
  globalSeoToRow,
  generalSettingsToRow,
  redirectToRow,
  notificationToRow,
  auditLogToRow
} from './mappers';

export type MigrationReport = {
  success: boolean;
  timestamp: string;
  categories: number;
  badges: number;
  products: number;
  banners: number;
  orders: number;
  users: number;
  admins: number;
  tickets: number;
  articles: number;
  globalSeo: number;
  settings: number;
  redirects: number;
  notifications: number;
  auditLogs: number;
  errors: string[];
};

/**
 * Safely migrates local storage collections into Supabase.
 * Uploads Base64 images to Storage buckets and upserts records into PostgreSQL.
 * NEVER deletes or alters localStorage data.
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationReport> {
  const report: MigrationReport = {
    success: false,
    timestamp: new Date().toISOString(),
    categories: 0,
    badges: 0,
    products: 0,
    banners: 0,
    orders: 0,
    users: 0,
    admins: 0,
    tickets: 0,
    articles: 0,
    globalSeo: 0,
    settings: 0,
    redirects: 0,
    notifications: 0,
    auditLogs: 0,
    errors: []
  };

  if (!isSupabaseConfigured()) {
    const msg = 'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.';
    console.error(`[AuraVibe Migration] ${msg}`);
    report.errors.push(msg);
    return report;
  }

  console.log('[AuraVibe Migration] 🚀 Starting one-time migration from browser localStorage to Supabase...');

  // Helper for safe JSON parse
  const parseStorage = <T>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err: any) {
      report.errors.push(`Failed to parse localStorage key '${key}': ${err?.message || err}`);
      return null;
    }
  };

  try {
    // 1. Categories
    const rawCats = parseStorage<any[]>('aura_categories');
    if (rawCats && Array.isArray(rawCats)) {
      console.log(`[AuraVibe Migration] Migrating ${rawCats.length} categories...`);
      for (const cat of rawCats) {
        let img = cat.image || '';
        if (img.startsWith('data:')) {
          try {
            img = await uploadToStorage('products', img, `cat-${cat.id || Date.now()}`);
          } catch (e: any) {
            console.warn(`[AuraVibe Migration] Could not upload category image:`, e);
          }
        }
        const row = categoryToRow({ ...cat, image: img });
        await supabase.from('categories').upsert(row);
        report.categories++;
      }
    }

    // 2. Badges
    const rawBadges = parseStorage<any[]>('aura_badges');
    if (rawBadges && Array.isArray(rawBadges)) {
      console.log(`[AuraVibe Migration] Migrating ${rawBadges.length} product badges...`);
      for (const badge of rawBadges) {
        const row = badgeToRow(badge);
        await supabase.from('product_badges').upsert(row);
        report.badges++;
      }
    }

    // 3. Products
    const rawProducts = parseStorage<any[]>('aura_products');
    if (rawProducts && Array.isArray(rawProducts)) {
      console.log(`[AuraVibe Migration] Migrating ${rawProducts.length} products...`);
      for (const prod of rawProducts) {
        const images: string[] = [];
        if (Array.isArray(prod.images)) {
          for (let i = 0; i < prod.images.length; i++) {
            let img = prod.images[i];
            if (img.startsWith('data:')) {
              try {
                img = await uploadToStorage('products', img, `prod-${prod.id}-${i}`);
              } catch (e: any) {
                console.warn(`[AuraVibe Migration] Could not upload product image:`, e);
              }
            }
            images.push(img);
          }
        }
        let videoUrl = prod.videoUrl;
        if (videoUrl && videoUrl.startsWith('data:')) {
          try {
            videoUrl = await uploadToStorage('products', videoUrl, `prod-${prod.id}-vid`);
          } catch (e: any) {
            console.warn(`[AuraVibe Migration] Could not upload product video:`, e);
          }
        }
        const row = productToRow({ ...prod, images, videoUrl });
        await supabase.from('products').upsert(row);
        report.products++;
      }
    }

    // 4. Banners
    const rawBanners = parseStorage<any[]>('aura_banners');
    if (rawBanners && Array.isArray(rawBanners)) {
      console.log(`[AuraVibe Migration] Migrating ${rawBanners.length} banners...`);
      for (const banner of rawBanners) {
        let img = banner.image || '';
        if (img.startsWith('data:')) {
          try {
            img = await uploadToStorage('banners', img, `banner-${banner.id}`);
          } catch (e: any) {
            console.warn(`[AuraVibe Migration] Could not upload banner image:`, e);
          }
        }
        const row = bannerToRow({ ...banner, image: img });
        await supabase.from('banners').upsert(row);
        report.banners++;
      }
    }

    // 5. Orders
    const rawOrders = parseStorage<any[]>('aura_orders');
    if (rawOrders && Array.isArray(rawOrders)) {
      console.log(`[AuraVibe Migration] Migrating ${rawOrders.length} orders...`);
      for (const order of rawOrders) {
        const row = orderToRow(order);
        await supabase.from('orders').upsert(row);
        report.orders++;
      }
    }

    // 6. Users
    const rawUsers = parseStorage<any[]>('aura_users');
    if (rawUsers && Array.isArray(rawUsers)) {
      console.log(`[AuraVibe Migration] Migrating ${rawUsers.length} users...`);
      for (const user of rawUsers) {
        let avatar = user.avatar;
        if (avatar && avatar.startsWith('data:')) {
          try {
            avatar = await uploadToStorage('avatars', avatar, `user-${user.id}`);
          } catch (e: any) {
            console.warn(`[AuraVibe Migration] Could not upload user avatar:`, e);
          }
        }
        const row = userToRow({ ...user, avatar });
        await supabase.from('users').upsert(row);
        report.users++;
      }
    }

    // 7. Admins
    const rawAdmins = parseStorage<any[]>('aura_admins');
    if (rawAdmins && Array.isArray(rawAdmins)) {
      console.log(`[AuraVibe Migration] Migrating ${rawAdmins.length} admin users...`);
      for (const admin of rawAdmins) {
        const row = adminToRow(admin);
        await supabase.from('admin_users').upsert(row);
        report.admins++;
      }
    }

    // 8. Tickets
    const rawTickets = parseStorage<any[]>('aura_tickets');
    if (rawTickets && Array.isArray(rawTickets)) {
      console.log(`[AuraVibe Migration] Migrating ${rawTickets.length} support tickets...`);
      for (const ticket of rawTickets) {
        const messages = [];
        if (Array.isArray(ticket.messages)) {
          for (const msg of ticket.messages) {
            let mediaUrl = msg.mediaUrl;
            if (mediaUrl && mediaUrl.startsWith('data:')) {
              try {
                mediaUrl = await uploadToStorage('support-media', mediaUrl, `ticket-${ticket.id}-${msg.id}`);
              } catch (e: any) {
                console.warn(`[AuraVibe Migration] Could not upload ticket attachment:`, e);
              }
            }
            messages.push({ ...msg, mediaUrl });
          }
        }
        const row = ticketToRow({ ...ticket, messages });
        await supabase.from('support_tickets').upsert(row);
        report.tickets++;
      }
    }

    // 9. Articles
    const rawArticles = parseStorage<any[]>('aura_articles');
    if (rawArticles && Array.isArray(rawArticles)) {
      console.log(`[AuraVibe Migration] Migrating ${rawArticles.length} articles...`);
      for (const art of rawArticles) {
        let image = art.image;
        if (image && image.startsWith('data:')) {
          try {
            image = await uploadToStorage('products', image, `art-${art.id}`);
          } catch (e: any) {
            console.warn(`[AuraVibe Migration] Could not upload article image:`, e);
          }
        }
        const row = articleToRow({ ...art, image });
        await supabase.from('articles').upsert(row);
        report.articles++;
      }
    }

    // 10. Global SEO
    const rawSeo = parseStorage<any>('aura_global_seo');
    if (rawSeo) {
      console.log('[AuraVibe Migration] Migrating Global SEO...');
      const row = globalSeoToRow(rawSeo);
      await supabase.from('global_seo').upsert(row);
      report.globalSeo++;
    }

    // 11. Settings
    const rawSettings = parseStorage<any>('aura_settings');
    if (rawSettings) {
      console.log('[AuraVibe Migration] Migrating General Settings...');
      const row = generalSettingsToRow(rawSettings);
      await supabase.from('general_settings').upsert(row);
      report.settings++;
    }

    // 12. Redirects
    const rawRedirects = parseStorage<any[]>('aura_redirects');
    if (rawRedirects && Array.isArray(rawRedirects)) {
      console.log(`[AuraVibe Migration] Migrating ${rawRedirects.length} redirects...`);
      for (const red of rawRedirects) {
        const row = redirectToRow(red);
        await supabase.from('redirects').upsert(row);
        report.redirects++;
      }
    }

    // 13. Notifications
    const rawNotifications = parseStorage<any[]>('aura_notifications');
    if (rawNotifications && Array.isArray(rawNotifications)) {
      console.log(`[AuraVibe Migration] Migrating ${rawNotifications.length} notifications...`);
      for (const notif of rawNotifications) {
        const row = notificationToRow(notif);
        await supabase.from('notifications').upsert(row);
        report.notifications++;
      }
    }

    // 14. Audit Logs
    const rawLogs = parseStorage<any[]>('aura_audit_logs');
    if (rawLogs && Array.isArray(rawLogs)) {
      console.log(`[AuraVibe Migration] Migrating ${rawLogs.length} audit logs...`);
      for (const log of rawLogs) {
        const row = auditLogToRow(log);
        await supabase.from('audit_logs').upsert(row);
        report.auditLogs++;
      }
    }

    report.success = report.errors.length === 0;
    console.log('[AuraVibe Migration] ✅ Migration successfully completed! Report:', report);
  } catch (err: any) {
    console.error('[AuraVibe Migration] ❌ Migration failed with error:', err);
    report.errors.push(err?.message || String(err));
    report.success = false;
  }

  return report;
}

// Attach to window if flag enabled
if (import.meta.env.VITE_ENABLE_LOCAL_MIGRATION === 'true') {
  if (typeof window !== 'undefined') {
    (window as any).__AURA_MIGRATE__ = migrateLocalStorageToSupabase;
    (window as any).migrateLocalStorageToSupabase = migrateLocalStorageToSupabase;
    console.info(
      '%c[AuraVibe Migration]%c One-time LocalStorage migration utility is ENABLED. Run %cwindow.__AURA_MIGRATE__()%c in console to migrate.',
      'color: #FFF3C5; background: #37192C; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #37192C; font-weight: bold;',
      'color: #b8860b; font-family: monospace; font-weight: bold;',
      'color: #37192C;'
    );
  }
}
