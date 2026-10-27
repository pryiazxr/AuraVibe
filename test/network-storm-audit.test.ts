import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, DatabaseEvent } from '../src/services/db';

describe('AuraLune Network Request Storm Audit & Targeted Invalidation', () => {
  let capturedRequests: Array<{ method: string; url: string; table?: string }> = [];
  let originalFetch: typeof globalThis.fetch;
  let activeMockFetch: typeof globalThis.fetch;

  beforeEach(() => {
    capturedRequests = [];
    db.clearUserSessionCache();

    originalFetch = globalThis.fetch;
    activeMockFetch = async (input: any, init?: any) => {
      const method = (init?.method || 'GET').toUpperCase();
      const url = typeof input === 'string' ? input : input?.url || '';

      let table: string | undefined;
      const restMatch = url.match(/\/rest\/v1\/([^?]+)/);
      if (restMatch) table = restMatch[1];
      const authMatch = url.match(/\/auth\/v1\/([^?]+)/);
      if (authMatch) table = `auth:${authMatch[1]}`;

      capturedRequests.push({ method, url, table });

      let body = '[]';
      if (table === 'products') {
        body = JSON.stringify([
          { id: 101, name: 'گردنبند صدف و مروارید', price: 380000, images: ['https://example.com/1.jpg'] },
          { id: 102, name: 'ساعت مچی وینتیج', price: 890000, images: ['https://example.com/2.jpg'] }
        ]);
      } else if (table === 'categories') {
        body = JSON.stringify([{ id: 1, name: 'ساعت', display_order: 1 }]);
      } else if (table === 'banners') {
        body = JSON.stringify([{ id: 1, internal_name: 'بنر ۱', active: true, display_order: 1 }]);
      } else if (table === 'articles') {
        body = JSON.stringify([{ id: 1, title: 'مقاله ۱', slug: 'art-1', status: 'published' }]);
      } else if (table === 'orders') {
        body = JSON.stringify([{ id: 'ORD-101', order_number: 'ORD-101', total_amount: 380000, user_id: 1 }]);
      } else if (table === 'support_tickets') {
        body = JSON.stringify([]);
      } else if (table === 'product_reviews') {
        body = JSON.stringify([{ id: 1, product_id: 101, rating: 5, comment: 'عالی' }]);
      } else if (table === 'user_carts') {
        body = JSON.stringify([{ id: 1, user_id: 1, product_id: 101, quantity: 1 }]);
      } else if (table === 'user_wishlists') {
        body = JSON.stringify([{ user_id: 1, product_id: 101 }]);
      } else if (table === 'auth:session') {
        body = JSON.stringify({ session: null });
      }

      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'content-range': '0-0/1'
        }
      });
    };
    globalThis.fetch = activeMockFetch;

    return () => {
      globalThis.fetch = originalFetch;
    };
  });

  it('deduplicates concurrent identical read operations via in-flight Promise sharing', async () => {
    // Dispatch 5 concurrent getProducts() calls
    const [p1, p2, p3, p4, p5] = await Promise.all([
      db.getProducts({ forceRefresh: true }),
      db.getProducts({ forceRefresh: true }),
      db.getProducts({ forceRefresh: true }),
      db.getProducts({ forceRefresh: true }),
      db.getProducts({ forceRefresh: true })
    ]);

    expect(p1.length).toBeGreaterThan(0);
    expect(p1).toEqual(p2);
    expect(p1).toEqual(p5);

    // Exactly 1 network fetch should have been sent to products
    const productFetches = capturedRequests.filter((r) => r.table === 'products');
    expect(productFetches.length).toBe(1);
  });

  it('serves cached public data on subsequent reads without hitting the network', async () => {
    capturedRequests = [];
    // First read populates cache
    await db.getCategories();
    expect(capturedRequests.filter((r) => r.table === 'categories').length).toBe(1);

    // Second and third reads must use in-memory cache
    capturedRequests = [];
    const c2 = await db.getCategories();
    const c3 = await db.getCategories();
    expect(c2.length).toBeGreaterThan(0);
    expect(c3.length).toBeGreaterThan(0);
    expect(capturedRequests.filter((r) => r.table === 'categories').length).toBe(0);
  });

  it('ensures a category change event notifies ONLY category subscribers and not unrelated tables', async () => {
    const categoryListener = vi.fn();
    const orderListener = vi.fn();
    const ticketListener = vi.fn();
    const bannerListener = vi.fn();

    const unsubCat = db.subscribe('categories', categoryListener);
    const unsubOrd = db.subscribe('orders', orderListener);
    const unsubTkt = db.subscribe('support_tickets', ticketListener);
    const unsubBan = db.subscribe('banners', bannerListener);

    // Trigger a category event
    db.notify({ table: 'categories', eventType: 'UPDATE', origin: 'local' });

    expect(categoryListener).toHaveBeenCalledTimes(1);
    expect(categoryListener.mock.calls[0][0].table).toBe('categories');

    // Unrelated listeners must NOT be notified
    expect(orderListener).not.toHaveBeenCalled();
    expect(ticketListener).not.toHaveBeenCalled();
    expect(bannerListener).not.toHaveBeenCalled();

    unsubCat();
    unsubOrd();
    unsubTkt();
    unsubBan();
  });

  it('ensures a cart or wishlist event does not refetch orders, banners or tickets', async () => {
    const cartListener = vi.fn();
    const orderListener = vi.fn();
    const bannerListener = vi.fn();
    const ticketListener = vi.fn();

    const unsubCart = db.subscribe('user_carts', cartListener);
    const unsubOrd = db.subscribe('orders', orderListener);
    const unsubBan = db.subscribe('banners', bannerListener);
    const unsubTkt = db.subscribe('support_tickets', ticketListener);

    db.notify({ table: 'user_carts', eventType: 'INSERT', origin: 'local', userId: 42 });

    expect(cartListener).toHaveBeenCalledTimes(1);
    expect(orderListener).not.toHaveBeenCalled();
    expect(bannerListener).not.toHaveBeenCalled();
    expect(ticketListener).not.toHaveBeenCalled();

    unsubCart();
    unsubOrd();
    unsubBan();
    unsubTkt();
  });

  it('ensures product review changes only notify product_reviews and do not trigger full app refresh', async () => {
    const reviewListener = vi.fn();
    const appListener = vi.fn();

    const unsubRev = db.subscribe('product_reviews', reviewListener);
    const unsubApp = db.subscribe(['categories', 'products', 'banners', 'orders'], appListener);

    db.notify({ table: 'product_reviews', eventType: 'INSERT', origin: 'local', productId: 101 });

    expect(reviewListener).toHaveBeenCalledTimes(1);
    expect(reviewListener.mock.calls[0][0].productId).toBe(101);
    expect(appListener).not.toHaveBeenCalled();

    unsubRev();
    unsubApp();
  });

  it('coalesces rapid bursts of Realtime events within 50ms into a single notification', async () => {
    const productListener = vi.fn();
    const unsub = db.subscribe('products', productListener);

    // Simulate 5 rapid realtime events arriving on the same table
    const serviceAny = db as any;
    serviceAny.handleRealtimeChange('products', { eventType: 'UPDATE', new: { id: 101, name: 'V1' } });
    serviceAny.handleRealtimeChange('products', { eventType: 'UPDATE', new: { id: 101, name: 'V2' } });
    serviceAny.handleRealtimeChange('products', { eventType: 'UPDATE', new: { id: 101, name: 'V3' } });

    // Immediately before debounce timer: not called yet
    expect(productListener).toHaveBeenCalledTimes(0);

    // Wait for the 50ms coalescing window to fire
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Coalesced into exactly 1 dispatch
    expect(productListener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('suppresses redundant Realtime echo for local mutations while allowing external updates', async () => {
    const productListener = vi.fn();
    const unsub = db.subscribe('products', productListener);
    const serviceAny = db as any;

    // 1. Local mutation notifies with origin 'local'
    db.notify({
      table: 'products',
      eventType: 'UPDATE',
      origin: 'local',
      productId: 101,
      record: { id: 101 }
    });
    expect(productListener).toHaveBeenCalledTimes(1);

    // 2. Realtime event arrives immediately with the same record id (echo)
    serviceAny.handleRealtimeChange('products', { eventType: 'UPDATE', new: { id: 101 } });
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Echo should be suppressed -> listener still called only 1 time!
    expect(productListener).toHaveBeenCalledTimes(1);

    // 3. External mutation arrives from another user/tab for product 102
    serviceAny.handleRealtimeChange('products', { eventType: 'UPDATE', new: { id: 102 } });
    await new Promise((resolve) => setTimeout(resolve, 80));

    // External change must be processed!
    expect(productListener).toHaveBeenCalledTimes(2);

    unsub();
  });

  it('isolates user cart/wishlist data and clears cache on logout', async () => {
    // User 1 cart
    const u1Cart = await db.getUserCart(1);
    expect(u1Cart.length).toBe(1);

    // Logout
    await db.userLogout();

    // After logout, user session cache is cleared
    // Now querying user 2 gets user 2's fresh data, not user 1's
    capturedRequests = [];
    await db.getUserCart(2);
    const cartFetches = capturedRequests.filter((r) => r.table === 'user_carts');
    expect(cartFetches.length).toBe(1);
    expect(cartFetches[0].url).toContain('user_id=eq.2');
  });

    it('surfaces network errors correctly without permanently poisoning the cache', async () => {
    let failCount = 0;
    const failingFetch = async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('/rest/v1/categories') && failCount === 0) {
        failCount++;
        return new Response('Database connection error', { status: 500, statusText: 'Internal Error' });
      }
      return activeMockFetch(input, init);
    };

    globalThis.fetch = failingFetch as any;

    // First call fails but falls back safely to default categories without caching corrupted state
    const res1 = await db.getCategories({ forceRefresh: true });
    expect(res1.length).toBeGreaterThan(0);

    // Second call with healthy fetch succeeds normally
    globalThis.fetch = activeMockFetch;
    const res2 = await db.getCategories({ forceRefresh: true });
    expect(res2.length).toBeGreaterThan(0);
  });
});
