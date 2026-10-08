import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Phone, ShieldCheck, ChevronDown } from 'lucide-react';
import { db, supabase, isSupabaseConfigured, User as CustomerUser } from '../services/db';
import { IRAN_PROVINCES_AND_CITIES } from '../data';

// --- PHONE INPUT COMPONENT ---
export function PhoneInput({
  value,
  onChange,
  disabled
}: {
  value: string; // 10 digits without prefix e.g. "9123456789"
  onChange: (normalizedTenDigits: string) => void;
  disabled?: boolean;
}) {
  const digits = value.padEnd(10, '').slice(0, 10).split('');

  const handleRawChange = (rawInput: string) => {
    let clean = rawInput
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632))
      .replace(/\D/g, '');

    if (clean.startsWith('98') && clean.length > 10) {
      clean = clean.slice(2);
    }
    if (clean.startsWith('0')) {
      clean = clean.slice(1);
    }

    clean = clean.slice(0, 10);
    onChange(clean);
  };

  return (
    <div className="space-y-2.5">
      {/* Visual Box Grid +98 | □ □ □ □ □ □ □ □ □ □ (Responsive Grid) */}
      <div className="p-2.5 sm:p-3 bg-[#fffaf0] rounded-2xl border-2 border-[#37192c]/20 focus-within:border-[#37192C] transition shadow-xs space-y-2" dir="ltr">
        <div className="flex items-center justify-between text-xs font-bold text-[#37192C]">
          <div className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm">
            <span className="text-emerald-700">🇮🇷</span>
            <span>+98</span>
            <span className="text-[#37192C]/30">|</span>
            <span className="text-[11px] text-[#8b627e] font-sans font-semibold">شماره همراه ۱۰ رقمی</span>
          </div>
          <span className="text-[10px] font-mono text-[#37192C]/60">ایران</span>
        </div>

        {/* 10 Digit Grid Slot Container */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
          {Array.from({ length: 10 }).map((_, idx) => {
            const hasDigit = digits[idx] && digits[idx].trim() !== '';
            return (
              <div
                key={idx}
                className={`aspect-square w-full rounded-lg sm:rounded-xl border flex items-center justify-center font-mono font-black text-xs sm:text-sm transition ${
                  hasDigit
                    ? 'border-[#37192C] bg-[#37192C] text-[#FFF3C5] shadow-xs'
                    : 'border-[#37192c]/20 bg-white/80 text-[#37192C]/30'
                }`}
              >
                {hasDigit ? digits[idx] : '□'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Input Element */}
      <div className="relative">
        <input
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          value={value ? '0' + value : ''}
          onChange={(e) => handleRawChange(e.target.value)}
          placeholder="ورود شماره همراه (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
          className="w-full text-center font-mono font-black text-sm p-3 rounded-2xl border border-[#37192c]/20 bg-white text-[#37192C] outline-none focus:border-[#37192C] focus:ring-2 focus:ring-[#37192C]/20 transition disabled:opacity-50"
          dir="ltr"
        />
      </div>
    </div>
  );
}

// --- OTP INPUT COMPONENT ---
export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled
}: {
  length?: number;
  value: string;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, '').slice(0, length).split('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    let char = e.target.value
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632))
      .replace(/\D/g, '');

    if (char.length > 1) {
      char = char.slice(-1);
    }

    const newDigits = [...digits];
    newDigits[idx] = char;
    const newCode = newDigits.join('').replace(/\s/g, '');
    onChange(newCode);

    if (char && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    if (newCode.length === length && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] || digits[idx].trim() === '') {
        if (idx > 0) {
          inputRefs.current[idx - 1]?.focus();
          const newDigits = [...digits];
          newDigits[idx - 1] = '';
          onChange(newDigits.join('').replace(/\s/g, ''));
        }
      } else {
        const newDigits = [...digits];
        newDigits[idx] = '';
        onChange(newDigits.join('').replace(/\s/g, ''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632))
      .replace(/\D/g, '')
      .slice(0, length);

    if (pasted) {
      onChange(pasted);
      if (pasted.length === length && onComplete) {
        onComplete(pasted);
      }
      const focusIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] && digits[idx].trim() !== '' ? digits[idx] : ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`size-11 sm:size-12 rounded-2xl border-2 text-center font-mono text-lg font-black bg-white text-[#37192C] shadow-xs outline-none focus:border-[#37192C] focus:ring-2 focus:ring-[#37192C]/20 border-[#37192c]/20 transition ${
            digits[idx] && digits[idx].trim() !== '' ? 'border-[#37192C] bg-[#FFF3C5]/40' : ''
          }`}
        />
      ))}
    </div>
  );
}

// --- CUSTOMER AUTH MODAL COMPONENT ---
export interface CustomerAuthModalProps {
  open: boolean;
  initialMode?: 'login' | 'register';
  close: () => void;
  onSuccess: (user: CustomerUser) => void;
}

export function CustomerAuthModal({
  open,
  initialMode = 'login',
  close,
  onSuccess
}: CustomerAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phoneTenDigits, setPhoneTenDigits] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [authSessionUser, setAuthSessionUser] = useState<any | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    province: '',
    city: '',
    address: '',
    postalCode: ''
  });

  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setStep('phone');
    setPhoneTenDigits('');
    setOtpCode('');
    setErrorMessage(null);
  }, [initialMode, open]);

  // Resend Timer Countdown
  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  if (!open) return null;

  const canonicalPhone = `+98${phoneTenDigits}`;

  // Request SMS OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneTenDigits.length !== 10 || !phoneTenDigits.startsWith('9')) {
      setErrorMessage('لطفاً شماره موبایل ۱۰ رقمی معتبر ایران (مثال: ۰۹۱۲۳۴۵۶۷۸۹) را وارد کنید.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: canonicalPhone
        });

        if (error) {
          console.error('[AuraVibe Auth] Supabase signInWithOtp error:', error);
          if (
            error.message.includes('provider') ||
            error.message.includes('not configured') ||
            error.message.includes('disabled') ||
            error.status === 400 ||
            error.status === 500
          ) {
            setErrorMessage(
              `خطا در اتصال به سرویس پیامک: ${error.message} (سرویس ارسال SMS در تنظیمات Supabase این محیط فعال نگردیده است).`
            );
            setLoading(false);
            return;
          } else {
            setErrorMessage(`خطا در درخواست کد تایید: ${error.message}`);
            setLoading(false);
            return;
          }
        }
      } else {
        setErrorMessage('ارتباط با سرور احراز هویت Supabase برقرار نیست.');
        setLoading(false);
        return;
      }

      setStep('otp');
      setResendTimer(60);
      setOtpCode('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در برقراری ارتباط با سرویس پیامک.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMessage('لطفاً کد تایید ۶ رقمی را به‌طور کامل وارد نمایید.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase Auth پیکربندی نشده است.');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: canonicalPhone,
        token: otpCode,
        type: 'sms'
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || 'کد تایید وارد شده نادرست یا منقضی شده است.');
        setLoading(false);
        return;
      }

      setAuthSessionUser(data.user);

      // Check if user profile already exists in DB
      let existingProfile = await db.getUserByPhone(canonicalPhone);
      if (!existingProfile && data.user.id) {
        existingProfile = await db.getUserByAuthId(data.user.id);
      }

      if (existingProfile) {
        // Link auth_user_id if missing
        if (!existingProfile.authUserId && data.user.id) {
          existingProfile.authUserId = data.user.id;
          await db.saveUser(existingProfile);
        }
        onSuccess(existingProfile);
      } else {
        // User does not exist in DB -> Move to Profile Completion step
        setStep('profile');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در بررسی کد تایید پیامکی.');
    } finally {
      setLoading(false);
    }
  };

  // Save Complete Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setErrorMessage('وارد نمودن نام و نام خانوادگی الزامی است.');
      return;
    }
    if (!profileForm.province || !profileForm.city) {
      setErrorMessage('انتخاب استان و شهر الزامی است.');
      return;
    }
    if (!profileForm.address.trim()) {
      setErrorMessage('وارد نمودن آدرس الزامی است.');
      return;
    }
    if (profileForm.postalCode && !/^\d{10}$/.test(profileForm.postalCode.trim())) {
      setErrorMessage('کد پستی باید ۱۰ رقم عدد باشد.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const newProfile: Partial<CustomerUser> = {
        authUserId: authSessionUser?.id,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: canonicalPhone,
        email: profileForm.email.trim() || undefined,
        province: profileForm.province,
        city: profileForm.city,
        address: profileForm.address.trim(),
        postalCode: profileForm.postalCode.trim(),
        registrationDate: new Date().toLocaleDateString('fa-IR'),
        lastLogin: 'هم‌اکنون',
        status: 'active',
        orderCount: 0
      };

      const saved = await db.saveUser(newProfile);
      onSuccess(saved);
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در ذخیره اطلاعات پروفایل کاربر.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvinceData = IRAN_PROVINCES_AND_CITIES.find((p) => p.province === profileForm.province);
  const filteredProvinces = IRAN_PROVINCES_AND_CITIES.filter((p) => p.province.includes(provinceSearch));
  const filteredCities = (selectedProvinceData?.cities || []).filter((c) => c.includes(citySearch));

  return (
    <div className="modal-backdrop p-3" onClick={close}>
      <div
        className="w-full max-w-lg rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-2xl relative space-y-6 text-right max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute end-5 top-5 grid size-9 place-items-center rounded-full bg-[#FFF3C5] text-[#37192C] hover:bg-[#ffe79a] transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header Title */}
        <div className="text-center space-y-1">
          <div className="brand-font text-2xl font-black text-[#37192C]">AuraVibe</div>
          <h2 className="text-lg font-black text-[#37192C]">
            {step === 'profile'
              ? 'تکمیل حساب کاربری'
              : mode === 'register'
              ? 'ثبت‌نام حساب جدید'
              : 'ورود به حساب کاربری'}
          </h2>
          <p className="text-xs text-[#8b627e] font-bold">
            {step === 'phone'
              ? 'شماره همراه خود را جهت دریافت کد تایید ورود/ثبت‌نام وارد نمایید'
              : step === 'otp'
              ? `کد ۶ رقمی ارسال‌شده به شماره ${canonicalPhone} را وارد کنید`
              : 'برای ارائه بهترین خدمت، اطلاعات حساب خود را تکمیل نمایید'}
          </p>
        </div>

        {/* Mode Selector Tabs (only in phone step) */}
        {step === 'phone' && (
          <div className="flex rounded-2xl bg-[#fffaf0] p-1 border border-[#37192c]/10 text-xs font-bold">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition ${
                mode === 'login' ? 'bg-[#37192C] text-[#FFF3C5] shadow-xs font-black' : 'text-[#37192C]/70 hover:text-[#37192C]'
              }`}
            >
              ورود با شماره موبایل
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition ${
                mode === 'register' ? 'bg-[#37192C] text-[#FFF3C5] shadow-xs font-black' : 'text-[#37192C]/70 hover:text-[#37192C]'
              }`}
            >
              ثبت‌نام کاربر جدید
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-700 flex items-start gap-2 leading-6">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Phone Input Step */}
        {step === 'phone' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <PhoneInput
              value={phoneTenDigits}
              onChange={(val) => {
                setPhoneTenDigits(val);
                setErrorMessage(null);
              }}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || phoneTenDigits.length !== 10}
              className="w-full py-4 rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-xs sm:text-sm shadow-md hover:bg-[#5a2548] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>در حال دریافت کد...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>دریافت کد تایید OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <OTPInput
              length={6}
              value={otpCode}
              onChange={(code) => {
                setOtpCode(code);
                setErrorMessage(null);
              }}
              onComplete={() => handleVerifyOtp()}
              disabled={loading}
            />

            {/* Resend Timer & Actions */}
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                  setErrorMessage(null);
                }}
                className="text-[#8b627e] hover:underline flex items-center gap-1"
              >
                <ArrowRight size={14} /> ویرایش شماره موبایل
              </button>

              {resendTimer > 0 ? (
                <span className="text-[#37192C]/70 font-mono">
                  ارسال مجدد کد ({resendTimer} ثانیه)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="text-[#37192C] font-black underline flex items-center gap-1 hover:text-[#8b627e]"
                >
                  <RefreshCw size={14} /> ارسال مجدد کد OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpCode.length !== 6}
              className="w-full py-4 rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-xs sm:text-sm shadow-md hover:bg-[#5a2548] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>در حال تایید کد...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>تایید و ادامه</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: Profile Completion Step */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#37192C] mb-1">نام *</label>
                <input
                  type="text"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  placeholder="مثال: سارا"
                  className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] outline-none focus:border-[#37192C]"
                />
              </div>
              <div>
                <label className="block text-[#37192C] mb-1">نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  placeholder="مثال: محمدی"
                  className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] outline-none focus:border-[#37192C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#37192C] mb-1">شماره همراه</label>
                <input
                  type="text"
                  disabled
                  value={canonicalPhone}
                  className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-gray-100 text-gray-600 font-mono text-center cursor-not-allowed"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[#37192C] mb-1">ایمیل (اختیاری)</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="sara@example.com"
                  className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] outline-none focus:border-[#37192C]"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Custom Geographic Dropdowns: Province and City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Province Searchable Dropdown */}
              <div className="relative">
                <label className="block text-[#37192C] mb-1">استان *</label>
                <div
                  onClick={() => setProvinceDropdownOpen(!provinceDropdownOpen)}
                  className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] cursor-pointer flex justify-between items-center"
                >
                  <span>{profileForm.province || 'انتخاب استان...'}</span>
                  <ChevronDown size={16} />
                </div>
                {provinceDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-[#37192c]/20 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="جستجوی استان..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      className="w-full p-2 border-b text-xs outline-none mb-1 font-bold"
                    />
                    {filteredProvinces.map((p) => (
                      <div
                        key={p.province}
                        onClick={() => {
                          setProfileForm((prev) => ({ ...prev, province: p.province, city: '' }));
                          setProvinceDropdownOpen(false);
                          setProvinceSearch('');
                        }}
                        className="p-2 hover:bg-[#FFF3C5] rounded-lg cursor-pointer font-bold"
                      >
                        {p.province}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City Searchable Dropdown */}
              <div className="relative">
                <label className="block text-[#37192C] mb-1">شهر *</label>
                <div
                  onClick={() => {
                    if (profileForm.province) setCityDropdownOpen(!cityDropdownOpen);
                  }}
                  className={`w-full p-3 rounded-xl border border-[#37192c]/20 flex justify-between items-center ${
                    profileForm.province ? 'bg-[#fffaf0] cursor-pointer' : 'bg-gray-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{profileForm.city || (profileForm.province ? 'انتخاب شهر...' : 'ابتدا استان را انتخاب کنید')}</span>
                  <ChevronDown size={16} />
                </div>
                {cityDropdownOpen && profileForm.province && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-[#37192c]/20 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="جستجوی شهر..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full p-2 border-b text-xs outline-none mb-1 font-bold"
                    />
                    {filteredCities.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setProfileForm((prev) => ({ ...prev, city: c }));
                          setCityDropdownOpen(false);
                          setCitySearch('');
                        }}
                        className="p-2 hover:bg-[#FFF3C5] rounded-lg cursor-pointer font-bold"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[#37192C] mb-1">آدرس کامل *</label>
              <textarea
                required
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="خیابان، کوچه، پلاک، واحد..."
                className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] outline-none focus:border-[#37192C] h-20"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-[#37192C] mb-1">کد پستی ۱۰ رقمی</label>
              <input
                type="text"
                maxLength={10}
                value={profileForm.postalCode}
                onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                placeholder="۱۹۸۷۶۵۴۳۲۱"
                className="w-full p-3 rounded-xl border border-[#37192c]/20 bg-[#fffaf0] outline-none focus:border-[#37192C] font-mono text-center"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#37192C] text-[#FFF3C5] font-black text-xs sm:text-sm shadow-md hover:bg-[#5a2548] transition disabled:opacity-50 flex items-center justify-center gap-2 pt-3"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>در حال ذخیره اطلاعات...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>تکمیل و ورود به حساب</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
