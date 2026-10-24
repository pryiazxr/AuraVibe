import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAuthSendSms } from '../supabase/functions/auth-send-sms/index';

// Helper to generate Standard Webhook signature
async function createStandardWebhookHeaders(payload: string, secret: string) {
  const id = `msg_${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${id}.${timestamp}.${payload}`));
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signed)));
  return {
    'Content-Type': 'application/json',
    'webhook-id': id,
    'webhook-timestamp': timestamp,
    'webhook-signature': `v1,${base64Sig}`
  };
}

describe('AuraLune Supabase Auth Send SMS Hook', () => {
  const testSecret = 'test_webhook_secret_key_12345';

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SEND_SMS_HOOK_SECRET;
    delete process.env.SMSIR_OTP_TEMPLATE_ID;
    delete process.env.SMSIR_MOCK_MODE;
    delete process.env.SMSIR_API_KEY;
  });

  it('rejects GET requests with 405 Method Not Allowed', async () => {
    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'GET'
    });
    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(405);
  });

  it('handles CORS OPTIONS requests gracefully', async () => {
    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'OPTIONS'
    });
    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
  });

  it('fails closed (500) if SEND_SMS_HOOK_SECRET is not configured on server', async () => {
    delete process.env.SEND_SMS_HOOK_SECRET;
    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { phone: '+989123456789' }, sms: { otp: '123456' } })
    });
    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('secret not configured');
  });

  it('rejects unauthenticated requests with 401 when hook secret is configured', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;

    const reqWithoutAuth = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { phone: '+989123456789' }, sms: { otp: '123456' } })
    });
    const res = await handleAuthSendSms(reqWithoutAuth);
    expect(res.status).toBe(401);
  });

  it('accepts valid Standard Webhook HMAC-SHA256 signature', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;
    process.env.SMSIR_MOCK_MODE = 'true';

    const payload = JSON.stringify({
      user: { phone: '+989123456789' },
      sms: { otp: '123456' }
    });

    const headers = await createStandardWebhookHeaders(payload, testSecret);
    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers,
      body: payload
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mocked).toBe(true);
  });

  it('accepts valid Bearer token matching hook secret', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;
    process.env.SMSIR_MOCK_MODE = 'true';

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSecret}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '123456' }
      })
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('fails safely (500) in production when SMSIR_OTP_TEMPLATE_ID is missing and mock mode is off', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;
    delete process.env.SMSIR_OTP_TEMPLATE_ID;
    delete process.env.SMSIR_MOCK_MODE; // Production default

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSecret}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '123456' }
      })
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('template ID is not configured');
  });

  it('rejects invalid Iranian phone numbers with 400 Bad Request', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSecret}`
      },
      body: JSON.stringify({
        user: { phone: '+1234567890' },
        sms: { otp: '123456' }
      })
    });
    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid Iranian mobile number');
  });

  it('successfully dispatches OTP with approved template 549168', async () => {
    process.env.SEND_SMS_HOOK_SECRET = testSecret;
    process.env.SMSIR_OTP_TEMPLATE_ID = '549168';
    process.env.SMSIR_MOCK_MODE = 'true';

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSecret}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '654321' }
      })
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('accepts whsec_ formatted secret with standard base64 signature', async () => {
    // 32-byte secret encoded in base64: 'MfKQ9r8Gx7/...'
    const rawKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) rawKey[i] = i + 1;
    const b64Key = btoa(String.fromCharCode(...rawKey));
    const whsec = `whsec_${b64Key}`;

    process.env.SEND_SMS_HOOK_SECRET = whsec;
    process.env.SMSIR_MOCK_MODE = 'true';

    const payload = JSON.stringify({
      user: { phone: '+989123456789' },
      sms: { otp: '998877' }
    });

    const id = `msg_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`));
    const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signed)));

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-id': id,
        'webhook-timestamp': timestamp,
        'webhook-signature': `v1,${base64Sig}`
      },
      body: payload
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('handles whsec_ formatted secret with URL-safe base64 and stripped padding', async () => {
    // Create raw bytes that will generate + and / in base64
    const rawKey = new Uint8Array([251, 239, 255, 250, 240, 15, 200, 100]);
    let b64Key = btoa(String.fromCharCode(...rawKey));
    // Convert to url-safe and remove padding '='
    const urlSafeB64 = b64Key.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const whsec = `whsec_${urlSafeB64}`;

    process.env.SEND_SMS_HOOK_SECRET = whsec;
    process.env.SMSIR_MOCK_MODE = 'true';

    // Check that bearer token with whsec prefix or without is also accepted
    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${urlSafeB64}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '112233' }
      })
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('accepts v1,whsec_ formatted secret with Standard Webhook signature (Supabase Send SMS Hook format)', async () => {
    const rawKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) rawKey[i] = (i * 7 + 3) % 256;
    const b64Key = btoa(String.fromCharCode(...rawKey));
    // Supabase Auth Hook format: v1,whsec_<base64>
    const v1Whsec = `v1,whsec_${b64Key}`;

    process.env.SEND_SMS_HOOK_SECRET = v1Whsec;
    process.env.SMSIR_MOCK_MODE = 'true';

    const payload = JSON.stringify({
      user: { phone: '+989123456789' },
      sms: { otp: '789123' }
    });

    const id = `msg_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${payload}`));
    const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signed)));

    const req = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webhook-id': id,
        'webhook-timestamp': timestamp,
        'webhook-signature': `v1,${base64Sig}`
      },
      body: payload
    });

    const res = await handleAuthSendSms(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('accepts v1,whsec_ formatted secret via Bearer token', async () => {
    const rawKey = new Uint8Array([10, 20, 30, 40, 50, 60]);
    const b64Key = btoa(String.fromCharCode(...rawKey));
    const v1Whsec = `v1,whsec_${b64Key}`;

    process.env.SEND_SMS_HOOK_SECRET = v1Whsec;
    process.env.SMSIR_MOCK_MODE = 'true';

    // Test with full v1,whsec_ token
    const req1 = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${v1Whsec}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '456789' }
      })
    });

    const res1 = await handleAuthSendSms(req1);
    expect(res1.status).toBe(200);

    // Test with stripped token
    const req2 = new Request('https://edge.supabase.co/auth-send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${b64Key}`
      },
      body: JSON.stringify({
        user: { phone: '+989123456789' },
        sms: { otp: '456789' }
      })
    });

    const res2 = await handleAuthSendSms(req2);
    expect(res2.status).toBe(200);
  });
});
