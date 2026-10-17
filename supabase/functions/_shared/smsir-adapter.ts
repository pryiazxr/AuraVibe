/**
 * AuraLune — SMS.ir Provider Adapter
 * 
 * Server-side adapter for the SMS.ir REST API (v1).
 * 
 * Security Guarantees:
 * - Reads API key exclusively from Deno.env.get("SMSIR_API_KEY") (or process.env in test runners).
 * - Never logs or exposes the API key or secret values in return types, exceptions, or console logs.
 * - Confirms configuration via boolean check without printing the key value.
 * - Sanitizes log outputs (masks phone numbers, never logs OTP tokens).
 * - Implements strict timeout handling via AbortController.
 * - Supports dependency-injected fetch or mock transport for safe automated testing.
 */

import { maskPhoneNumber } from './phone-utils.ts';

// --- Types & Interfaces ---

export interface SmsIrVerifyParameter {
  name: string;
  value: string;
}

export interface SmsIrSendVerifyRequest {
  mobile: string;
  templateId: number;
  parameters: SmsIrVerifyParameter[];
}

export interface SmsIrSendVerifyResponseData {
  messageId: number;
  cost?: number;
}

export interface SmsIrApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface SmsIrSendBulkRequest {
  lineNumber: number | string;
  messageText: string;
  mobiles: string[];
  sendDateTime?: number | null;
}

export interface SmsIrAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
  mockMode?: boolean;
}

// --- Custom Error Classes ---

export class SmsIrError extends Error {
  public readonly status?: number;
  public readonly isSmsIrError = true;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SmsIrError';
    this.status = status;
    Object.setPrototypeOf(this, SmsIrError.prototype);
  }
}

export class SmsIrConfigurationError extends SmsIrError {
  constructor(message: string = 'SMS.ir API key is not configured.') {
    super(message, 500);
    this.name = 'SmsIrConfigurationError';
    Object.setPrototypeOf(this, SmsIrConfigurationError.prototype);
  }
}

export class SmsIrNetworkError extends SmsIrError {
  constructor(message: string) {
    super(message, 504);
    this.name = 'SmsIrNetworkError';
    Object.setPrototypeOf(this, SmsIrNetworkError.prototype);
  }
}

export class SmsIrRateLimitError extends SmsIrError {
  constructor(message: string = 'Too many requests to SMS.ir gateway. Rate limit exceeded.') {
    super(message, 429);
    this.name = 'SmsIrRateLimitError';
    Object.setPrototypeOf(this, SmsIrRateLimitError.prototype);
  }
}

// --- SMS.ir Gateway Adapter ---

export class SmsIrAdapter {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly customApiKey?: string;
  private readonly customFetch?: typeof fetch;
  private readonly mockMode: boolean;

  constructor(options: SmsIrAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl || 'https://api.sms.ir/v1').replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs ?? 10000;
    this.customApiKey = options.apiKey;
    this.customFetch = options.fetchFn;
    this.mockMode = options.mockMode ?? false;
  }

  /**
   * Safely retrieves the SMS.ir API key.
   * Priority:
   * 1. Injected customApiKey (for isolated tests)
   * 2. Deno.env.get("SMSIR_API_KEY") (Supabase Edge Function runtime)
   * 3. process.env.SMSIR_API_KEY (Node/Vitest test runner fallback)
   */
  private getApiKey(): string | undefined {
    if (this.customApiKey) {
      return this.customApiKey;
    }

    if (typeof (globalThis as any).Deno !== 'undefined' && typeof (globalThis as any).Deno?.env?.get === 'function') {
      const key = (globalThis as any).Deno.env.get('SMSIR_API_KEY');
      if (key && typeof key === 'string' && key.trim().length > 0) {
        return key.trim();
      }
    }

    if (typeof process !== 'undefined' && process.env?.SMSIR_API_KEY) {
      const key = process.env.SMSIR_API_KEY;
      if (key && typeof key === 'string' && key.trim().length > 0) {
        return key.trim();
      }
    }

    return undefined;
  }

  /**
   * Checks whether the SMS.ir API key is configured without exposing or logging it.
   */
  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  /**
   * Sends an ultra-fast verification (OTP) message using an approved SMS.ir template.
   * Documented SMS.ir endpoint: POST https://api.sms.ir/v1/send/verify
   *
   * @param request The verification request payload
   * @returns The API response data with messageId
   */
  public async sendVerifyOtp(
    request: SmsIrSendVerifyRequest
  ): Promise<SmsIrApiResponse<SmsIrSendVerifyResponseData>> {
    if (!request.mobile || typeof request.mobile !== 'string') {
      throw new SmsIrError('شماره موبایل مقصد نامعتبر است.', 400);
    }

    if (!request.templateId || typeof request.templateId !== 'number' || request.templateId <= 0) {
      throw new SmsIrConfigurationError(
        'شناسه قالب پیامک تایید (templateId) نامعتبر یا ثبت نشده است. لطفاً شناسه قالب تایید شده را تنظیم فرمایید.'
      );
    }

    if (!Array.isArray(request.parameters) || request.parameters.length === 0) {
      throw new SmsIrError('پارامترهای متغیر قالب پیامک وارد نشده است.', 400);
    }

    // In mock mode or when explicitly set, return a simulated successful response
    if (this.mockMode) {
      const masked = maskPhoneNumber(request.mobile);
      console.info(`[AuraLune SMS.ir] [MOCK MODE] Simulated verify OTP to ${masked} for template ${request.templateId}.`);
      return {
        status: 1,
        message: 'موفق (شبیه‌سازی شده در محیط آزمایشی)',
        data: {
          messageId: Math.floor(1000000 + Math.random() * 9000000),
          cost: 0
        }
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new SmsIrConfigurationError();
    }

    const endpoint = `${this.baseUrl}/send/verify`;
    const payload = {
      mobile: request.mobile,
      templateId: request.templateId,
      parameters: request.parameters.map((p) => ({
        name: String(p.name).trim(),
        value: String(p.value).trim()
      }))
    };

    return this.executeRequest<SmsIrSendVerifyResponseData>(endpoint, payload, apiKey, request.mobile);
  }

  /**
   * Sends a bulk or line message via SMS.ir.
   * Documented SMS.ir endpoint: POST https://api.sms.ir/v1/send/bulk
   *
   * @param request The bulk message request payload
   * @returns The API response data
   */
  public async sendBulk(
    request: SmsIrSendBulkRequest
  ): Promise<SmsIrApiResponse<number[]>> {
    if (!request.lineNumber) {
      throw new SmsIrConfigurationError('شماره خط فرستنده (lineNumber) تعیین نشده است.');
    }

    if (!request.messageText || typeof request.messageText !== 'string' || request.messageText.trim().length === 0) {
      throw new SmsIrError('متن پیامک نمی‌تواند خالی باشد.', 400);
    }

    if (!Array.isArray(request.mobiles) || request.mobiles.length === 0) {
      throw new SmsIrError('حداقل یک شماره موبایل برای ارسال پیامک الزامی است.', 400);
    }

    if (this.mockMode) {
      console.info(`[AuraLune SMS.ir] [MOCK MODE] Simulated bulk SMS to ${request.mobiles.length} recipients.`);
      return {
        status: 1,
        message: 'موفق (شبیه‌سازی شده در محیط آزمایشی)',
        data: request.mobiles.map(() => Math.floor(1000000 + Math.random() * 9000000))
      };
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new SmsIrConfigurationError();
    }

    const endpoint = `${this.baseUrl}/send/bulk`;
    const parsedLineNumber = typeof request.lineNumber === 'string'
      ? parseInt(request.lineNumber, 10)
      : request.lineNumber;

    const payload = {
      lineNumber: parsedLineNumber,
      messageText: request.messageText.trim(),
      mobiles: request.mobiles,
      sendDateTime: request.sendDateTime ?? null
    };

    return this.executeRequest<number[]>(endpoint, payload, apiKey, `${request.mobiles.length} recipients`);
  }

  /**
   * Executes an authenticated HTTP request to the SMS.ir gateway with timeout and error handling.
   */
  private async executeRequest<T>(
    endpoint: string,
    body: any,
    apiKey: string,
    recipientSummary: string
  ): Promise<SmsIrApiResponse<T>> {
    const fetchImplementation = this.customFetch || globalThis.fetch;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    try {
      const response = await fetchImplementation(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutHandle);

      // Handle HTTP Rate Limits
      if (response.status === 429) {
        throw new SmsIrRateLimitError();
      }

      // Handle HTTP Authentication Errors
      if (response.status === 401 || response.status === 403) {
        throw new SmsIrError('خطای احراز هویت در سامانه پیامکی SMS.ir. کلید وب‌سرویس معتبر نیست.', response.status);
      }

      let responseJson: any;
      try {
        responseJson = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        throw new SmsIrError(`پاسخ وب‌سرویس SMS.ir در قالب JSON معتبر دریافت نشد: ${text.slice(0, 100)}`, response.status);
      }

      // Check SMS.ir logical status (status: 1 indicates success)
      if (responseJson.status !== 1) {
        const errMessage = responseJson.message || 'خطای نامشخص در سامانه پیامکی SMS.ir.';
        throw new SmsIrError(errMessage, responseJson.status || response.status);
      }

      return responseJson as SmsIrApiResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutHandle);

      if (error?.name === 'AbortError') {
        throw new SmsIrNetworkError(`مهلت زمان ارتباط با وب‌سرویس پیامکی به پایان رسید (${this.timeoutMs} میلی‌ثانیه).`);
      }

      if (error instanceof SmsIrError) {
        throw error;
      }

      throw new SmsIrNetworkError(`خطا در برقراری ارتباط شبکه با سرور پیامک: ${error?.message || 'نامشخص'}`);
    }
  }
}
