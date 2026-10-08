import { createClient, SupabaseClient } from '@supabase/supabase-js';

const nodeProcessEnv = typeof globalThis !== 'undefined' ? (globalThis as any).process?.env : undefined;

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  nodeProcessEnv?.VITE_SUPABASE_URL ||
  '';
const supabaseKey =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  nodeProcessEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  nodeProcessEnv?.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '');
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return supabase;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg'
];

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/mp3',
  'audio/m4a'
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Validates a file before upload against size limits and supported MIME types.
 */
export function validateFile(
  file: File | Blob,
  allowedTypes: string[] = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES],
  maxSizeBytes: number = MAX_MEDIA_SIZE_BYTES
): void {
  if (!file) {
    throw new Error('فایلی برای آپلود انتخاب نشده است.');
  }

  if (file.size > maxSizeBytes) {
    const sizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    throw new Error(`حجم فایل انتخاب‌شده بیشتر از حد مجاز (${sizeMB} مگابایت) است.`);
  }

  if (file.type && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some((t) =>
      t.endsWith('/*') ? file.type.startsWith(t.replace('/*', '')) : file.type === t
    );
    if (!isAllowed) {
      throw new Error(`فرمت فایل «${file.type}» پشتیبانی نمی‌شود.`);
    }
  }
}

/**
 * Uploads a File, Blob, or base64 Data URL to a Supabase Storage bucket.
 * Returns the public URL of the uploaded asset.
 * Generates unique, non-colliding UUID filepaths to prevent overwriting.
 */
export async function uploadToStorage(
  bucket: 'banners' | 'products' | 'avatars' | 'support-media',
  fileOrDataUrl: File | Blob | string,
  customFileName?: string
): Promise<string> {
  if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('blob:')) {
    throw new Error('آدرس موقت (blob:) قابل آپلود به دیتابیس یا Storage نیست. لطفاً فایل اصلی را انتخاب کنید.');
  }

  if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
    // Already a remote HTTP/HTTPS URL
    return fileOrDataUrl;
  }

  const client = requireSupabase();

  let blob: Blob;
  let fileExt = 'png';

  if (typeof fileOrDataUrl === 'string') {
    if (fileOrDataUrl.startsWith('data:')) {
      const parts = fileOrDataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      fileExt = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
      const binaryStr = atob(parts[1]);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: mime });
    } else {
      throw new Error('رشته ورودی جهت آپلود نامعتبر است.');
    }
  } else {
    blob = fileOrDataUrl;
    if (fileOrDataUrl instanceof File && fileOrDataUrl.name) {
      const parts = fileOrDataUrl.name.split('.');
      if (parts.length > 1) {
        fileExt = parts.pop()?.toLowerCase() || 'png';
      }
    } else if (fileOrDataUrl.type) {
      fileExt = fileOrDataUrl.type.split('/')[1]?.toLowerCase() || 'png';
    }
  }

  // Validate File/Blob size & MIME
  const isVideoOrAudio = blob.type.startsWith('video/') || blob.type.startsWith('audio/');
  const maxBytes = isVideoOrAudio ? MAX_MEDIA_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const allowedTypes = isVideoOrAudio
    ? [...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES]
    : ALLOWED_IMAGE_TYPES;
  validateFile(blob, allowedTypes, maxBytes);

  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);
  const safeExt = fileExt.replace(/[^a-zA-Z0-9]/g, '');
  const cleanName = customFileName || `${bucket}/${Date.now()}_${randomId}.${safeExt}`;
  const filePath = cleanName.replace(/[^a-zA-Z0-9/._-]/g, '_');

  const { error: uploadError } = await client.storage.from(bucket).upload(filePath, blob, {
    upsert: false,
    contentType: blob.type || 'image/png',
  });

  if (uploadError) {
    console.error(`[AuraVibe Storage] Upload failed for bucket '${bucket}':`, uploadError);
    throw new Error(`خطا در آپلود فایل در ذخیره‌ساز (${bucket}): ${uploadError.message}`);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  if (!data?.publicUrl || data.publicUrl.startsWith('blob:')) {
    throw new Error('دریافت URL عمومی فایل با شکست مواجه شد.');
  }

  return data.publicUrl;
}
