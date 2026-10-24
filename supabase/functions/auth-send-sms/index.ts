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
 * - Never logs or exposes SMSIR_API_KEY, webhook secret, token values, or the OTP code value.
 */

import { Webhook } from 'npm:standardwebhooks@1.0.0';
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
 * Creates a Standard Webhook verifier instance from the configured secret.
 * 
 * Secret handling according to Standard Webhooks spec and Supabase Auth Hooks:
 * - Supabase Send SMS Auth Hook generates a secret formatted as "v1,whsec_<base64>".
 * - The official `standardwebhooks` library expects secrets formatted as "whsec_<base64>" or raw base64.
 * - We strip the "v1," prefix so `standardwebhooks` receives "whsec_<base64>", which it then strips and decodes.
 * - URL-safe base64 characters ('-' and '_') and unpadded lengths are normalized so base64 decoding succeeds.
 * - Non-base64 test secrets fallback gracefully to raw format.
 */
function createStandardWebhookVerifier(secret: string): Webhook {
  let s = secret.trim();

  // Strip 'v1,' prefix if present from Supabase Auth Hook secret
  if (s.startsWith('v1,')) {
    s = s.slice(3);
  }

  // If secret starts with "whsec_", normalize the base64 part
  if (s.startsWith('whsec_')) {
    const rawB64 = s.slice(6);
    let normalizedB64 = rawB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalizedB64.length % 4;
    if (pad) {
      normalizedB64 += '='.repeat(4 - pad);
    }
    s = `whsec_${normalizedB64}`;
    return new Webhook(s);
  }

  // If secret doesn't start with whsec_, try base64 or fallback to raw format
  try {
    let normalizedB64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalizedB64.length % 4;
    if (pad) {
      normalizedB64 += '='.repeat(4 - pad);
    }
    return new Webhook(normalizedB64);
  } catch {
    return new Webhook(s, { format: 'raw' });
  }
}

/**
 * Verifies Supabase Auth Standard Webhook signature using official standardwebhooks flow.
 */
function verifyStandardWebhook(
  rawBody: string,
  headers: Headers,
  secret: string
): boolean {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signature = headers.get('webhook-signature');

  if (!id || !timestamp || !signature) {
    return false;
  }

  try {
    const wh = createStandardWebhookVerifier(secret);
    wh.verify(rawBody, {
      'webhook-id': id,
      'webhook-timestamp': timestamp,
      'webhook-signature': signature
    });
    return true;
  } catch (err: any) {
    console.warn('[AuraLune Auth Hook] Webhook signature verification failed:', err?.message || err);
    return false;
  }
}

/** Approved SMS.ir OTP Template ID for fast phone verification */
export const ACTIVE_SMSIR_OTP_TEMPLATE_ID = 549168;

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

    // Diagnostic logging: Presence only of headers and secret status (NO values/secrets/tokens/OTP logged)
    console.info('[AuraLune Auth Hook] Diagnostic header presence:', {
      authorization: Boolean(req.headers.get('authorization')),
      'webhook-id': Boolean(req.headers.get('webhook-id')),
      'webhook-timestamp': Boolean(req.headers.get('webhook-timestamp')),
      'webhook-signature': Boolean(req.headers.get('webhook-signature'))
    });

    console.info('[AuraLune Auth Hook] SEND_SMS_HOOK_SECRET status:', {
      configured: Boolean(hookSecret),
      startsWithV1Whsec: Boolean(hookSecret && hookSecret.startsWith('v1,whsec_'))
    });

    // Verify via Standard Webhook headers OR Bearer token
    const isWebhookValid = verifyStandardWebhook(rawBody, req.headers, hookSecret);
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-webhook-secret') || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const isBearerValid = Boolean(
      bearerToken && (
        bearerToken === hookSecret ||
        bearerToken === hookSecret.replace(/^v1,whsec_/, '') ||
        bearerToken === hookSecret.replace(/^whsec_/, '') ||
        `v1,whsec_${bearerToken}` === hookSecret ||
        `whsec_${bearerToken}` === hookSecret
      )
    );

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
    const envTemplateId = typeof (globalThis as any).Deno !== 'undefined'
      ? (globalThis as any).Deno?.env?.get('SMSIR_OTP_TEMPLATE_ID')
      : process.env?.SMSIR_OTP_TEMPLATE_ID;

    // Use environment variable if set, otherwise fallback to approved template 549168 in Edge runtime
    const rawTemplateId = envTemplateId !== undefined
      ? envTemplateId
      : (typeof (globalThis as any).Deno !== 'undefined' ? String(ACTIVE_SMSIR_OTP_TEMPLATE_ID) : undefined);

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
