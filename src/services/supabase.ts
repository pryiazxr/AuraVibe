import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '');
};

if (!isSupabaseConfigured()) {
  throw new Error(
    'Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

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

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, blob, {
    upsert: false,
    contentType: blob.type || 'image/png',
  });

  if (uploadError) {
    console.error(`[AuraVibe Storage] Upload failed for bucket '${bucket}':`, uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
