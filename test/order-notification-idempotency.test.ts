import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleOrderStatusNotification } from '../supabase/functions/order-status-notification/index';

describe('AuraLune Order Status SMS Notification & Idempotency', () => {
  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-test-admin': 'true'
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SMSIR_ORDER_STATUS_TEMPLATE_ID;
    delete process.env.SMSIR_API_KEY;
  });

  it('rejects unauthenticated/unauthorized callers with 403 Forbidden', async () => {
    const mockSupabase = { from: vi.fn(), auth: { getUser: vi.fn().mockResolvedValue({ data: null, error: new Error('Invalid token') }) } };
    const req = new Request('https://edge.supabase.co/order-status-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ORD-12345', newStatus: 'ارسال شده' })
    });

    const res = await handleOrderStatusNotification(req, mockSupabase);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('دسترسی غیرمجاز');
  });

  it('rejects requests missing orderId or newStatus with 400', async () => {
    const mockSupabase = { from: vi.fn() };
    const req = new Request('https://edge.supabase.co/order-status-notification', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ orderId: 'ORD-12345' }) // missing newStatus
    });

    const res = await handleOrderStatusNotification(req, mockSupabase);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('orderId and newStatus are required');
  });

  it('skips duplicate notification when idempotency key already exists in DB', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: 'notif-uuid-1',
                order_id: 'ORD-54321',
                order_status: 'ارسال شده',
                status: 'skipped_unverified_template'
              }
            })
          })
        })
      })
    };

    const req = new Request('https://edge.supabase.co/order-status-notification', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        orderId: 'ORD-54321',
        newStatus: 'ارسال شده'
      })
    });

    const res = await handleOrderStatusNotification(req, mockSupabase);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(body.reason).toContain('idempotent');
  });

  it('safely skips live SMS delivery when order-status template is not prepared/verified', async () => {
    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'order_sms_notifications') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }) // not yet sent
              })
            }),
            insert: insertMock
          };
        }
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'ORD-99999',
                    order_number: 'ORD-99999',
                    customer: {
                      phone: '09123456789',
                      firstName: 'سارا'
                    }
                  },
                  error: null
                })
              })
            })
          };
        }
        return {};
      })
    };

    const req = new Request('https://edge.supabase.co/order-status-notification', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        orderId: 'ORD-99999',
        newStatus: 'در حال آماده‌سازی'
      })
    });

    const res = await handleOrderStatusNotification(req, mockSupabase);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(body.status).toBe('skipped_unverified_template');
    expect(body.recipient).toBe('0912***6789'); // Masked

    // Verify insert into order_sms_notifications with idempotency key
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'ORD-99999',
        order_status: 'در حال آماده‌سازی',
        status: 'skipped_unverified_template',
        idempotency_key: 'order_ORD-99999_status_%D8%AF%D8%B1%20%D8%AD%D8%A7%D9%84%20%D8%A2%D9%85%D8%A7%D8%AF%D9%87%E2%80%8C%D8%B3%D8%A7%D8%B2%DB%8C'
      })
    );
  });
});
