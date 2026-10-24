import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleVerifyCheckoutPhone } from '../supabase/functions/verify-checkout-phone/index';

describe('AuraLune Checkout Phone Verification Edge Function', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SMSIR_OTP_TEMPLATE_ID;
    delete process.env.SMSIR_API_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('fails closed (500) if Supabase client is missing/uninitialized', async () => {
    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '09123456789'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, null);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('سرویس پایگاه‌داده');
  });

  it('rejects invalid or non-Iranian mobile numbers', async () => {
    const mockSupabase = { from: vi.fn() };
    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '12345'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('شماره موبایل');
  });

  it('handles request_otp action with mockSupabase without leaking plain OTP', async () => {
    process.env.SMSIR_MOCK_MODE = 'true';
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, error: null })
          })
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '09123456789'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.mocked).toBe(true);
    expect(body.phone).toBe('0912***6789'); // Masked
    expect(body.otp).toBeUndefined(); // NEVER expose OTP
  });

  it('fails closed (500) if database insert into phone_verifications fails', async () => {
    process.env.SMSIR_MOCK_MODE = 'true';
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, error: null })
          })
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB connection failure' } })
      })
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '09123456789'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('خطا در ثبت درخواست کد تایید');
  });

  it('fails closed (500) in production when SMSIR_API_KEY is missing and mock mode is off', async () => {
    delete process.env.SMSIR_MOCK_MODE;
    delete process.env.SMSIR_API_KEY;
    process.env.SMSIR_OTP_TEMPLATE_ID = '549168';

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 0, error: null })
          })
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '09123456789'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('کلید وب‌سرویس پیامکی در سرور تنظیم نشده است');
  });

  it('enforces rate limiting when threshold exceeded in DB', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ count: 4, error: null }) // 4 requests in 10 mins
          })
        })
      })
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request_otp',
        phone: '09123456789'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain('تعداد درخواست‌های کد تایید بیش از حد مجاز است');
  });

  it('verifies OTP atomically via verify_checkout_otp_atomic RPC', async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { success: true, verification_token: 'test_token_12345' },
        error: null
      })
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_otp',
        phone: '09123456789',
        code: '123456'
      })
    });

    const res = await handleVerifyCheckoutPhone(req, mockSupabase);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.verified).toBe(true);
    expect(typeof body.verificationToken).toBe('string');
    expect(body.verificationToken.length).toBe(64);
  });
  it('does not treat Deno serve connection info as a Supabase client', async () => {
    // Deno.serve passes (req, info) where info is ServeHandlerInfo
    const mockServeHandlerInfo = {
      remoteAddr: { transport: 'tcp', hostname: '127.0.0.1', port: 8000 },
      completed: Promise.resolve()
    };

    const req = new Request('https://edge.supabase.co/verify-checkout-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify_otp',
        phone: '09123456789',
        code: '123456'
      })
    });

    // When connection info is passed without client methods (.from),
    // it must not crash with "supabaseClient.rpc is not a function",
    // but rather detect uninitialized client and fail closed with 500
    const res = await handleVerifyCheckoutPhone(req, mockServeHandlerInfo);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('سرویس پایگاه‌داده');
  });

});
