import { describe, it, expect, vi } from 'vitest';
import { db } from '../src/services/db';

describe('Baseline Request Storm Audit', () => {
  it('measures request counts for baseline operations with simulated network responses', async () => {
    const requests: Array<{ method: string; url: string; table?: string }> = [];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: any, init?: any) => {
      const method = (init?.method || 'GET').toUpperCase();
      const url = typeof input === 'string' ? input : input?.url || '';
      
      // Extract table or endpoint
      let table: string | undefined;
      const restMatch = url.match(/\/rest\/v1\/([^?]+)/);
      if (restMatch) table = restMatch[1];
      const authMatch = url.match(/\/auth\/v1\/([^?]+)/);
      if (authMatch) table = `auth:${authMatch[1]}`;

      requests.push({ method, url, table });

      // Return valid simulated responses
      let body = '[]';
      if (table === 'products') {
        body = JSON.stringify([{ id: 101, name: 'Sample Product', price: 100000, images: [] }]);
      } else if (table === 'categories') {
        body = JSON.stringify([{ id: 1, name: 'Sample Category', display_order: 1 }]);
      } else if (table === 'banners') {
        body = JSON.stringify([{ id: 1, internal_name: 'Sample Banner', active: true, display_order: 1 }]);
      } else if (table === 'orders') {
        body = JSON.stringify([]);
      } else if (table === 'support_tickets') {
        body = JSON.stringify([]);
      } else if (table === 'articles') {
        body = JSON.stringify([{ id: 1, title: 'Sample Article', slug: 'sample', status: 'published' }]);
      } else if (table === 'auth:user') {
        body = JSON.stringify({ id: 'dummy-admin-id' });
      } else if (table === 'admin_users') {
        body = JSON.stringify([]);
      } else if (table === 'user_carts') {
        body = JSON.stringify([{ id: 1, user_id: 1, product_id: 101, quantity: 2 }]);
      } else if (table === 'user_wishlists') {
        body = JSON.stringify([{ user_id: 1, product_id: 101 }]);
      }

      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'content-range': '0-0/1'
        }
      });
    };

    try {
      console.log('=== Step 1: refreshAllAppData (Storefront initial load) ===');
      const s1 = requests.length;
      await Promise.all([
        db.getCategories(),
        db.getProducts(),
        db.getActiveBanners(),
        db.getOrders(),
        db.getTickets(),
        db.getArticles(),
        db.getCurrentAdmin()
      ]);
      const s1Reqs = requests.slice(s1);
      console.log(`Step 1 Count: ${s1Reqs.length} requests`);
      s1Reqs.forEach(r => console.log(`  [${r.method}] ${r.table}`));

      console.log('=== Step 2: Immediate second load (e.g. component re-render / StrictMode) ===');
      const s2 = requests.length;
      await Promise.all([
        db.getCategories(),
        db.getProducts(),
        db.getActiveBanners(),
        db.getOrders(),
        db.getTickets(),
        db.getArticles(),
        db.getCurrentAdmin()
      ]);
      const s2Reqs = requests.slice(s2);
      console.log(`Step 2 Count: ${s2Reqs.length} requests (Expected 0 if cached!)`);

      console.log('=== Step 3: Cart and Wishlist Load ===');
      const s3 = requests.length;
      await db.getUserCart(1);
      await db.getUserWishlist(1);
      const s3Reqs = requests.slice(s3);
      console.log(`Step 3 Count: ${s3Reqs.length} requests`);
      s3Reqs.forEach(r => console.log(`  [${r.method}] ${r.table}`));

    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
