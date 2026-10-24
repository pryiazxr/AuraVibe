import { describe, it, expect, vi } from 'vitest';
import { processOtpVerification } from '../src/components/CustomerAuthModal';

describe('CustomerAuthModal OTP Verification Flow Separation', () => {
  const canonicalPhone = '+989123456789';
  const otpCode = '123456';

  describe('GoTrue Auth Flow (authMethod === "gotrue")', () => {
    it('verifies successfully with GoTrue and does NOT call db.verifyPhoneOtp', async () => {
      const mockUser = { id: 'auth-user-uuid-1', phone: canonicalPhone };
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: {} },
            error: null
          })
        }
      };

      const mockDbService = {
        verifyPhoneOtp: vi.fn()
      };

      const result = await processOtpVerification({
        authMethod: 'gotrue',
        canonicalPhone,
        otpCode,
        supabaseClient: mockSupabase,
        dbService: mockDbService
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        phone: canonicalPhone,
        token: otpCode,
        type: 'sms'
      });
      // Crucial: Must NEVER call dbService.verifyPhoneOtp
      expect(mockDbService.verifyPhoneOtp).not.toHaveBeenCalled();
    });

    it('fails when GoTrue verification fails and does NOT fall back to db.verifyPhoneOtp', async () => {
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Token has expired or is invalid' }
          })
        }
      };

      const mockDbService = {
        verifyPhoneOtp: vi.fn().mockResolvedValue({
          verified: true,
          verificationToken: 'should-never-be-reached'
        })
      };

      const result = await processOtpVerification({
        authMethod: 'gotrue',
        canonicalPhone,
        otpCode,
        supabaseClient: mockSupabase,
        dbService: mockDbService
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Token has expired or is invalid');
      expect(result.user).toBeUndefined();
      expect(result.verificationToken).toBeUndefined();
      // Crucial: Fallback MUST NOT occur
      expect(mockDbService.verifyPhoneOtp).not.toHaveBeenCalled();
    });

    it('returns error when Supabase client is not available', async () => {
      const mockDbService = {
        verifyPhoneOtp: vi.fn()
      };

      const result = await processOtpVerification({
        authMethod: 'gotrue',
        canonicalPhone,
        otpCode,
        supabaseClient: null,
        dbService: mockDbService
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('ارتباط با سرویس احراز هویت برقرار نیست');
      expect(mockDbService.verifyPhoneOtp).not.toHaveBeenCalled();
    });
  });

  describe('Edge Function Direct Flow (authMethod === "edge_function")', () => {
    it('verifies successfully with db.verifyPhoneOtp and does NOT call GoTrue verifyOtp', async () => {
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn()
        }
      };

      const mockDbService = {
        verifyPhoneOtp: vi.fn().mockResolvedValue({
          verified: true,
          verificationToken: 'secure-token-64-chars',
          message: 'کد تایید معتبر است'
        })
      };

      const result = await processOtpVerification({
        authMethod: 'edge_function',
        canonicalPhone,
        otpCode,
        supabaseClient: mockSupabase,
        dbService: mockDbService
      });

      expect(result.success).toBe(true);
      expect(result.verificationToken).toBe('secure-token-64-chars');
      expect(mockDbService.verifyPhoneOtp).toHaveBeenCalledWith(canonicalPhone, otpCode);
      // Crucial: Must NEVER call GoTrue
      expect(mockSupabase.auth.verifyOtp).not.toHaveBeenCalled();
    });

    it('fails when db.verifyPhoneOtp rejects the OTP and does NOT call GoTrue', async () => {
      const mockSupabase = {
        auth: {
          verifyOtp: vi.fn()
        }
      };

      const mockDbService = {
        verifyPhoneOtp: vi.fn().mockResolvedValue({
          verified: false,
          message: 'کد تایید اشتباه است'
        })
      };

      const result = await processOtpVerification({
        authMethod: 'edge_function',
        canonicalPhone,
        otpCode,
        supabaseClient: mockSupabase,
        dbService: mockDbService
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('کد تایید اشتباه است');
      expect(mockDbService.verifyPhoneOtp).toHaveBeenCalledWith(canonicalPhone, otpCode);
      expect(mockSupabase.auth.verifyOtp).not.toHaveBeenCalled();
    });
  });
});
