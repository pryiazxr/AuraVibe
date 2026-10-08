import { createClient, SupabaseClient } from '@supabase/supabase-js';

const nodeProcessEnv = typeof globalThis !== 'undefined' ? (globalThis as any).process?.env : undefined;

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  nodeProcessEnv?.VITE_SUPABASE_URL ||
  'https://demo.supabase.co';
const supabaseKey =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  nodeProcessEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  nodeProcessEnv?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo';

export const isSupabaseConfigured = (): boolean => {
  return true;
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

/**
 * Uploads a File, Blob, or base64 Data URL to a Supabase Storage bucket.
 * Returns the public URL of the uploaded asset.
 * Generates unique, non-colliding UUID filepaths to prevent overwriting.
 */
export async function uploadToStorage(
  bucket: 'banners' | 'products' | 'avatars' | 'support-media' | 'receipts',
  fileOrDataUrl: File | Blob | string,
  customFileName?: string
): Promise<string> {
  const client = requireSupabase();

  let blob: Blob;
  let fileExt = 'png';

  if (typeof fileOrDataUrl === 'string') {
    if (fileOrDataUrl.startsWith('data:')) {
      const parts = fileOrDataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      fileExt = mime.split('/')[1] || 'png';
      const binaryStr = atob(parts[1]);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: mime });
    } else if (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://')) {
      // Already a remote HTTP URL
      return fileOrDataUrl;
    } else {
      blob = new Blob([fileOrDataUrl], { type: 'text/plain' });
    }
  } else {
    blob = fileOrDataUrl;
    if (fileOrDataUrl instanceof File && fileOrDataUrl.name) {
      const parts = fileOrDataUrl.name.split('.');
      if (parts.length > 1) {
        fileExt = parts.pop() || 'png';
      }
    } else if (fileOrDataUrl.type) {
      fileExt = fileOrDataUrl.type.split('/')[1] || 'png';
    }
  }

  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);
  const cleanName = customFileName || `${bucket}/${Date.now()}_${randomId}.${fileExt}`;
  const filePath = cleanName.replace(/[^a-zA-Z0-9/._-]/g, '_');

  const { error: uploadError } = await client.storage.from(bucket).upload(filePath, blob, {
    upsert: false,
    contentType: blob.type || 'image/png',
  });

  if (uploadError) {
    console.error(`[AuraVibe Storage] Upload failed for bucket '${bucket}':`, uploadError);
    throw uploadError;
  }

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
