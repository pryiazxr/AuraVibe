/**
 * AuraLune — Supabase Auth Send SMS Hook Edge Function
 * 
 * Invoked by Supabase Auth (GoTrue) when an SMS OTP needs to be dispatched.
 * Routes OTP delivery through SMS.ir ultra-fast verify API.
 * 
 * Security & Architecture:
 * - Fail-Closed: Verifies Standard Webhooks HMAC-SHA256 signature or Bearer token against SEND_SMS_HOOK_SECRET.
 * - Raw body parsing ensures bit-perfect cryptographic verification.
 * - Mock mode requires explicit configuration (SMSIR_MOCK_MODE=true); in production, missing template fails safely (500).
 * - Never logs or exposes SMSIR_API_KEY or the OTP code value.
 */

import { corsHeaders } from '../_shared/cors.ts';
import { normalizeIranianPhone, maskPhoneNumber } from '../_shared/phone-utils.ts';
import { SmsIrAdapter, SmsIrConfigurationError } from '../_shared/smsir-adapter.ts';

interface SupabaseSmsHookPayload {
  user?: {
    id?: string;
    phone?: string;
    email?: string;
  };
  sms?: {
    otp?: string;
  };
}

/**
 * Verifies Supabase Auth Standard Webhook signature (HMAC-SHA256).
 */
async function verifyStandardWebhook(
  rawBody: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signatureHeader = headers.get('webhook-signature');

  if (!id || !timestamp || !signatureHeader) {
    return false;
  }

  // Check timestamp drift (5 minutes tolerance)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return false;
  }

  try {
    let keyBytes: Uint8Array;
    if (secret.startsWith('whsec_')) {
      const base64Part = secret.replace(/^whsec_/, '');
      const binary = atob(base64Part);
      keyBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        keyBytes[i] = binary.charCodeAt(i);
      }
    } else {
      keyBytes = new TextEncoder().encode(secret);
    }

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signedPayload = new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`);
    const signatureBytes = await crypto.subtle.sign('HMAC', key, signedPayload);
    const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    const signatures = signatureHeader.split(' ');
    return signatures.some((sig) => {
      const trimmed = sig.trim();
      if (trimmed.startsWith('v1,')) {
        return trimmed.slice(3) === base64Sig;
      }
      return trimmed === base64Sig;
    });
  } catch (err) {
    console.error('[AuraLune Auth Hook] Webhook signature verification error:', err);
    return false;
  }
}

export async function handleAuthSendSms(req: Request): Promise<Response> {
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
    // 1. Read Raw Text Body for Signature Verification
    const rawBody = await req.text();

    // 2. Enforce Webhook Authentication (Fail-Closed)
    const hookSecret = typeof (globalThis as any).Deno !== 'undefined'
      ? (globalThis as any).Deno?.env?.get('SEND_SMS_HOOK_SECRET')
      : process.env?.SEND_SMS_HOOK_SECRET;

    if (!hookSecret) {
      console.warn('[AuraLune Auth Hook] SEND_SMS_HOOK_SECRET is not configured on server.');
      return new Response(
        JSON.stringify({ error: 'Authentication hook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify via Standard Webhook headers OR Bearer token
    const isWebhookValid = await verifyStandardWebhook(rawBody, req.headers, hookSecret);
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-webhook-secret') || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const isBearerValid = Boolean(bearerToken && bearerToken === hookSecret);

    if (!isWebhookValid && !isBearerValid) {
      console.warn('[AuraLune Auth Hook] Unauthorized hook invocation attempt: invalid signature or bearer token.');
      return new Response(
        JSON.stringify({ error: 'Unauthorized webhook invocation' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse Incoming JSON Payload
    let body: SupabaseSmsHookPayload;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Malformed JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientPhone = body.user?.phone;
    const otp = body.sms?.otp;

    if (!recipientPhone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Missing required payload: user.phone and sms.otp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Normalize Recipient Phone Number
    const normalized = normalizeIranianPhone(recipientPhone);
    if (!normalized.isValid) {
      console.warn(`[AuraLune Auth Hook] Invalid recipient phone format: ${maskPhoneNumber(recipientPhone)}`);
      return new Response(
        JSON.stringify({ error: `Invalid Iranian mobile number: ${normalized.error}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const maskedPhone = maskPhoneNumber(normalized.national);

    // 5. Template Configuration & Mock Mode Handling
    const rawTemplateId = typeof (globalThis as any).Deno !== 'undefined'
      ? (globalThis as any).Deno?.env?.get('SMSIR_OTP_TEMPLATE_ID')
      : process.env?.SMSIR_OTP_TEMPLATE_ID;

    const mockModeEnv = typeof (globalThis as any).Deno !== 'undefined'
      ? (globalThis as any).Deno?.env?.get('SMSIR_MOCK_MODE')
      : process.env?.SMSIR_MOCK_MODE;

    const isMockModeExplicit = mockModeEnv === 'true';
    const templateId = rawTemplateId ? parseInt(rawTemplateId, 10) : undefined;
    const templateParamName = (typeof (globalThis as any).Deno !== 'undefined'
      ? (globalThis as any).Deno?.env?.get('SMSIR_OTP_PARAM_NAME')
      : process.env?.SMSIR_OTP_PARAM_NAME) || 'Code';

    // If template is missing and NOT in explicit mock mode -> FAIL SAFELY (500)
    if (!templateId || isNaN(templateId)) {
      if (isMockModeExplicit) {
        console.info(
          `[AuraLune Auth Hook] [EXPLICIT MOCK MODE] SMS delivery simulated for ${maskedPhone}.`
        );
        return new Response(
          JSON.stringify({
            success: true,
            mocked: true,
            recipient: maskedPhone,
            note: 'Explicit mock mode active. Simulated SMS delivery.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('[AuraLune Auth Hook] SMSIR_OTP_TEMPLATE_ID is not configured in production.');
      return new Response(
        JSON.stringify({
          error: 'SMS.ir OTP template ID is not configured. Delivery cannot proceed.',
          status: 500
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Template is configured: Dispatch via SMS.ir Adapter
    const adapter = new SmsIrAdapter({ mockMode: isMockModeExplicit });
    if (!adapter.isConfigured() && !isMockModeExplicit) {
      throw new SmsIrConfigurationError();
    }

    const response = await adapter.sendVerifyOtp({
      mobile: normalized.national,
      templateId,
      parameters: [
        {
          name: templateParamName,
          value: otp
        }
      ]
    });

    console.info(`[AuraLune Auth Hook] SMS.ir OTP successfully dispatched to ${maskedPhone} (MessageId: ${response.data.messageId}).`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: response.data.messageId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error(`[AuraLune Auth Hook] Error dispatching SMS OTP: ${error?.message || 'Unknown error'}`);

    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal error in SMS delivery hook',
        status: error?.status || 500
      }),
      {
        status: error?.status && error.status >= 400 && error.status < 600 ? error.status : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Runtime entry point
if (typeof (globalThis as any).Deno !== 'undefined') {
  (globalThis as any).Deno.serve(handleAuthSendSms);
}
