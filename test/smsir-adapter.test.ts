import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SmsIrAdapter,
  SmsIrError,
  SmsIrConfigurationError,
  SmsIrRateLimitError,
  SmsIrNetworkError
} from '../supabase/functions/_shared/smsir-adapter';

describe('AuraLune SMS.ir Provider Adapter', () => {
  const dummyApiKey = 'test_secret_key_1234567890abcdef';

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SMSIR_API_KEY;
  });

  describe('Configuration & Security Checks', () => {
    it('reports isConfigured() = false when API key is missing', () => {
      const adapter = new SmsIrAdapter();
      expect(adapter.isConfigured()).toBe(false);
    });

    it('reports isConfigured() = true when API key is provided via env', () => {
      process.env.SMSIR_API_KEY = dummyApiKey;
      const adapter = new SmsIrAdapter();
      expect(adapter.isConfigured()).toBe(true);
    });

    it('throws SmsIrConfigurationError when executing send without API key', async () => {
      const adapter = new SmsIrAdapter();
      await expect(
        adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 10001,
          parameters: [{ name: 'Code', value: '123456' }]
        })
      ).rejects.toThrow(SmsIrConfigurationError);
    });

    it('never leaks the API key string in error messages or JSON representation', async () => {
      process.env.SMSIR_API_KEY = dummyApiKey;
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        json: async () => ({ status: 0, message: 'کلید وب‌سرویس نامعتبر است' })
      } as any);

      const adapter = new SmsIrAdapter({ fetchFn: mockFetch });

      try {
        await adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 10001,
          parameters: [{ name: 'Code', value: '123456' }]
        });
        expect.unreachable('Should have thrown an error');
      } catch (err: any) {
        expect(err.message).not.toContain(dummyApiKey);
        expect(JSON.stringify(err)).not.toContain(dummyApiKey);
      }
    });
  });

  describe('Verify OTP Request Construction (/v1/send/verify)', () => {
    it('constructs the exact documented SMS.ir verify request payload and headers', async () => {
      let capturedUrl = '';
      let capturedOptions: any = null;

      const mockFetch = vi.fn().mockImplementation((url, opts) => {
        capturedUrl = url;
        capturedOptions = opts;
        return Promise.resolve({
          status: 200,
          json: async () => ({
            status: 1,
            message: 'موفق',
            data: { messageId: 98765432, cost: 1.5 }
          })
        });
      });

      const adapter = new SmsIrAdapter({
        apiKey: dummyApiKey,
        fetchFn: mockFetch
      });

      const result = await adapter.sendVerifyOtp({
        mobile: '09123456789',
        templateId: 123456,
        parameters: [{ name: 'Code', value: '654321' }]
      });

      expect(capturedUrl).toBe('https://api.sms.ir/v1/send/verify');
      expect(capturedOptions.method).toBe('POST');
      expect(capturedOptions.headers).toEqual({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': dummyApiKey
      });

      const parsedBody = JSON.parse(capturedOptions.body);
      expect(parsedBody).toEqual({
        mobile: '09123456789',
        templateId: 123456,
        parameters: [{ name: 'Code', value: '654321' }]
      });

      expect(result.status).toBe(1);
      expect(result.data.messageId).toBe(98765432);
    });

    it('rejects invalid or missing templateId', async () => {
      const adapter = new SmsIrAdapter({ apiKey: dummyApiKey });
      await expect(
        adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 0,
          parameters: [{ name: 'Code', value: '123' }]
        })
      ).rejects.toThrow(SmsIrConfigurationError);
    });
  });

  describe('Bulk Send Request Construction (/v1/send/bulk)', () => {
    it('constructs documented bulk request payload with lineNumber', async () => {
      let capturedUrl = '';
      let capturedBody: any = null;

      const mockFetch = vi.fn().mockImplementation((url, opts) => {
        capturedUrl = url;
        capturedBody = JSON.parse(opts.body);
        return Promise.resolve({
          status: 200,
          json: async () => ({
            status: 1,
            message: 'موفق',
            data: [111111, 222222]
          })
        });
      });

      const adapter = new SmsIrAdapter({
        apiKey: dummyApiKey,
        fetchFn: mockFetch
      });

      const result = await adapter.sendBulk({
        lineNumber: 30004505000017,
        messageText: 'سفارش شما در فروشگاه اورالون آماده ارسال شد.',
        mobiles: ['09123456789', '09351234567']
      });

      expect(capturedUrl).toBe('https://api.sms.ir/v1/send/bulk');
      expect(capturedBody).toEqual({
        lineNumber: 30004505000017,
        messageText: 'سفارش شما در فروشگاه اورالون آماده ارسال شد.',
        mobiles: ['09123456789', '09351234567'],
        sendDateTime: null
      });

      expect(result.status).toBe(1);
      expect(result.data).toEqual([111111, 222222]);
    });
  });

  describe('Provider Errors and Network Timeouts', () => {
    it('maps SMS.ir status != 1 responses to SmsIrError', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({
          status: 0,
          message: 'اعتبار حساب شما برای ارسال پیامک کافی نمی‌باشد.'
        })
      } as any);

      const adapter = new SmsIrAdapter({ apiKey: dummyApiKey, fetchFn: mockFetch });

      await expect(
        adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 10001,
          parameters: [{ name: 'Code', value: '123' }]
        })
      ).rejects.toThrow('اعتبار حساب شما برای ارسال پیامک کافی نمی‌باشد.');
    });

    it('maps HTTP 429 to SmsIrRateLimitError', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        status: 429,
        json: async () => ({ status: 429, message: 'Too many requests' })
      } as any);

      const adapter = new SmsIrAdapter({ apiKey: dummyApiKey, fetchFn: mockFetch });

      await expect(
        adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 10001,
          parameters: [{ name: 'Code', value: '123' }]
        })
      ).rejects.toThrow(SmsIrRateLimitError);
    });

    it('maps network timeouts to SmsIrNetworkError', async () => {
      const mockFetch = vi.fn().mockImplementation(() => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        return Promise.reject(err);
      });

      const adapter = new SmsIrAdapter({ apiKey: dummyApiKey, fetchFn: mockFetch, timeoutMs: 100 });

      await expect(
        adapter.sendVerifyOtp({
          mobile: '09123456789',
          templateId: 10001,
          parameters: [{ name: 'Code', value: '123' }]
        })
      ).rejects.toThrow(SmsIrNetworkError);
    });
  });

  describe('Safe Mock Mode (Awaiting Template Approval)', () => {
    it('returns simulated successful response in mockMode without invoking network fetch', async () => {
      const mockFetch = vi.fn();
      const adapter = new SmsIrAdapter({
        apiKey: dummyApiKey,
        fetchFn: mockFetch,
        mockMode: true
      });

      const res = await adapter.sendVerifyOtp({
        mobile: '09123456789',
        templateId: 123456,
        parameters: [{ name: 'Code', value: '999999' }]
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(res.status).toBe(1);
      expect(res.data.messageId).toBeGreaterThan(0);
      expect(res.message).toContain('شبیه‌سازی');
    });
  });
});
