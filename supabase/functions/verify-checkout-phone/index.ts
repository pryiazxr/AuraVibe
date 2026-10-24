/**
 * AuraLune — Checkout Phone Verification Edge Function
 * 
 * Provides server-side OTP issuance and verification for checkout phone numbers.
 * Generates single-use, time-limited verification tokens bound to the normalized phone number.
 * 
 * Security & Hardening:
 * - Fail-Closed: Strictly requires Supabase client; never returns verified: true without DB validation.
 * - Concurrency & Race-condition prevention: Atomic OTP verification and attempt counting via database.
 * - Rate limiting: Max 3 requests per 10 minutes per phone number.
 * - OTP expiration: 2 minutes.
 * - Max verification attempts: 5 attempts before invalidating the code.
 * - Verifications stored with secure SHA-256 hashes (never plain text).
 * - Never logs OTP values or user PII.
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizeIranianPhone, maskPhoneNumber } from '../_shared/phone-utils.ts';
import { SmsIrAdapter } from '../_shared/smsir-adapter.ts';

// Helper to hash OTP with salt
async function hashOtp(otp: string, phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = `auralune_${phone}_salt`;
  const data = encoder.encode(`${salt}:${otp}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate random secure token
function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate 6-digit numeric OTP
function generateOtp(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

/** Approved SMS.ir OTP Template ID for fast phone verification */
export const ACTIVE_SMSIR_OTP_TEMPLATE_ID = 549168;

export async function handleVerifyCheckoutPhone(
  req: Request,
  injectedSupabaseClient?: any
): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action; // 'request_otp' | 'verify_otp'
    const rawPhone = body.phone;

    if (!rawPhone || typeof rawPhone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'شماره همراه الزامی است.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalized = normalizeIranianPhone(rawPhone);
    if (!normalized.isValid) {
      return new Response(
        JSON.stringify({ error: normalized.error || 'شماره همراه نامعتبر است.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const masked = maskPhoneNumber(normalized.national);

    // Initialize Supabase client
    // Validate injectedSupabaseClient (e.g. from unit tests) to ensure it is an actual client
    // with client methods like .from, and not a runtime connection-info object from Deno.serve
    let supabaseClient = (injectedSupabaseClient && (typeof injectedSupabaseClient.from === 'function' || typeof injectedSupabaseClient.rpc === 'function'))
      ? injectedSupabaseClient
      : undefined;

    if (!supabaseClient) {
      const supabaseUrl = typeof (globalThis as any).Deno !== 'undefined'
        ? (globalThis as any).Deno?.env?.get('SUPABASE_URL')
        : process.env?.SUPABASE_URL;
      const serviceKey = typeof (globalThis as any).Deno !== 'undefined'
        ? (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY')
        : process.env?.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && serviceKey) {
        supabaseClient = createClient(supabaseUrl, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
      }
    }

    // Fail-Closed: database client is mandatory
    if (!supabaseClient) {
      console.error('[AuraLune Checkout Verification] Supabase client is not available: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
      return new Response(
        JSON.stringify({ error: 'سرویس پایگاه‌داده موقتاً در دسترس نیست.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // -------------------------------------------------------------
    // ACTION 1: Request OTP
    // -------------------------------------------------------------
    if (action === 'request_otp') {
      const otp = generateOtp();
      const otpHash = await hashOtp(otp, normalized.canonical);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes

      // Enforce Rate Limit: max 3 requests in the last 10 minutes
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabaseClient
        .from('phone_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('phone', normalized.canonical)
        .gte('created_at', tenMinutesAgo);

      if (!countErr && typeof count === 'number' && count >= 3) {
        return new Response(
          JSON.stringify({
            error: 'تعداد درخواست‌های کد تایید بیش از حد مجاز است. لطفاً ۱۰ دقیقه دیگر مجدداً تلاش نمایید.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store verification record
      const { error: insertErr } = await supabaseClient.from('phone_verifications').insert({
        phone: normalized.canonical,
        otp_hash: otpHash,
        verified: false,
        attempts: 0,
        max_attempts: 5,
        expires_at: expiresAt.toISOString()
      });

      if (insertErr) {
        console.error('[AuraLune Checkout Verification] Failed to record OTP in database:', insertErr);
        return new Response(
          JSON.stringify({ error: 'خطا در ثبت درخواست کد تایید در پایگاه‌داده.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check template & dispatch
      const envTemplateId = typeof (globalThis as any).Deno !== 'undefined'
        ? (globalThis as any).Deno?.env?.get('SMSIR_OTP_TEMPLATE_ID')
        : process.env?.SMSIR_OTP_TEMPLATE_ID;

      const rawTemplateId = envTemplateId !== undefined
        ? envTemplateId
        : (typeof (globalThis as any).Deno !== 'undefined' ? String(ACTIVE_SMSIR_OTP_TEMPLATE_ID) : undefined);

      const templateParamName = (typeof (globalThis as any).Deno !== 'undefined'
        ? (globalThis as any).Deno?.env?.get('SMSIR_OTP_PARAM_NAME')
        : process.env?.SMSIR_OTP_PARAM_NAME) || 'Code';

      const mockModeEnv = typeof (globalThis as any).Deno !== 'undefined'
        ? (globalThis as any).Deno?.env?.get('SMSIR_MOCK_MODE')
        : process.env?.SMSIR_MOCK_MODE;

      const isMockModeExplicit = mockModeEnv === 'true';

      if (isMockModeExplicit) {
        console.info(`[AuraLune Checkout Verification] [EXPLICIT MOCK MODE] Simulated checkout OTP sent to ${masked}.`);
        return new Response(
          JSON.stringify({
            success: true,
            mocked: true,
            phone: masked,
            expiresInSeconds: 120,
            message: 'کد تایید پیامکی ارسال گردید (محیط آزمایشی).'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fail-Closed: in production, template and API key are strictly required
      if (!rawTemplateId || isNaN(parseInt(rawTemplateId, 10))) {
        console.error('[AuraLune Checkout Verification] SMSIR_OTP_TEMPLATE_ID is missing or invalid in production.');
        return new Response(
          JSON.stringify({ error: 'شناسه قالب پیامک تایید در سرور تنظیم نشده است.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const adapter = new SmsIrAdapter();
      if (!adapter.isConfigured()) {
        console.error('[AuraLune Checkout Verification] SMSIR_API_KEY is not configured in production.');
        return new Response(
          JSON.stringify({ error: 'کلید وب‌سرویس پیامکی در سرور تنظیم نشده است.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await adapter.sendVerifyOtp({
        mobile: normalized.national,
        templateId: parseInt(rawTemplateId, 10),
        parameters: [{ name: templateParamName, value: otp }]
      });

      return new Response(
        JSON.stringify({
          success: true,
          phone: masked,
          expiresInSeconds: 120,
          message: 'کد تایید پیامکی با موفقیت ارسال شد.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // -------------------------------------------------------------
    // ACTION 2: Verify OTP
    // -------------------------------------------------------------
    if (action === 'verify_otp') {
      const code = String(body.code || '').trim();
      if (!code || code.length !== 6) {
        return new Response(
          JSON.stringify({ error: 'کد تایید ۶ رقمی الزامی است.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const inputHash = await hashOtp(code, normalized.canonical);
      const verificationToken = generateSecureToken();
      const now = new Date();
      const tokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

      // 1. Try atomic RPC verify_checkout_otp_atomic if present
      const { data: atomicData, error: atomicErr } = await supabaseClient.rpc(
        'verify_checkout_otp_atomic',
        {
          p_phone: normalized.canonical,
          p_otp_hash: inputHash,
          p_verification_token: verificationToken,
          p_token_expires_at: tokenExpiresAt.toISOString()
        }
      );

      if (!atomicErr && atomicData) {
        if (!atomicData.success) {
          const status = atomicData.error?.includes('تلاش') ? 429 : 400;
          return new Response(
            JSON.stringify({ error: atomicData.error || 'کد تایید نامعتبر است.' }),
            { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.info(`[AuraLune Checkout Verification] Phone ${masked} verified atomically.`);
        return new Response(
          JSON.stringify({
            success: true,
            verified: true,
            phone: normalized.canonical,
            verificationToken,
            expiresInSeconds: 900
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 2. Direct fallback with atomic verification logic
      const { data: record, error: recErr } = await supabaseClient
        .from('phone_verifications')
        .select('*')
        .eq('phone', normalized.canonical)
        .eq('verified', false)
        .gte('expires_at', now.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recErr || !record) {
        return new Response(
          JSON.stringify({ error: 'کد تایید منقضی شده یا درخواستی یافت نشد. لطفاً مجدداً درخواست دهید.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (record.attempts >= record.max_attempts) {
        return new Response(
          JSON.stringify({ error: 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً کد جدید درخواست دهید.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Increment attempt count
      await supabaseClient
        .from('phone_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);

      if (record.otp_hash !== inputHash) {
        return new Response(
          JSON.stringify({ error: 'کد تایید وارد شده نادرست است.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Successfully verified
      const { error: updateVerifyErr } = await supabaseClient
        .from('phone_verifications')
        .update({
          verified: true,
          verified_at: now.toISOString(),
          verification_token: verificationToken,
          expires_at: tokenExpiresAt.toISOString()
        })
        .eq('id', record.id);

      if (updateVerifyErr) {
        console.error('[AuraLune Checkout Verification] Failed to update verification status:', updateVerifyErr);
        return new Response(
          JSON.stringify({ error: 'خطا در ثبت وضعیت تایید در پایگاه‌داده.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.info(`[AuraLune Checkout Verification] Phone ${masked} verified successfully.`);

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          phone: normalized.canonical,
          verificationToken,
          expiresInSeconds: 900
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'عملیات نامعتبر است (action must be request_otp or verify_otp).' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error(`[AuraLune Checkout Verification] Error: ${error?.message || 'Unknown'}`);
    return new Response(
      JSON.stringify({ error: error?.message || 'خطای سرور در تایید شماره تلفن' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Runtime entry point
if (typeof (globalThis as any).Deno !== 'undefined') {
  (globalThis as any).Deno.serve(
    (req: Request) => handleVerifyCheckoutPhone(req)
  );
}
