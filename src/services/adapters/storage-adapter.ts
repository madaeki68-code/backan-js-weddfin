/**
 * Storage Adapter
 * Wrapper untuk file upload/download dengan NestJS Storage API
 */

import { apiClient, handleApiError } from '../api-client';
import { useNestJSForModule } from '../../config/features';
import supabase from '../../lib/supabaseClient';

// ========== TYPES ==========

export interface UploadResult {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
}

// ========== CONSTANTS ==========

const STORAGE_FOLDERS = {
  // Public folders
  ASSETS: 'assets',
  GALLERY_IMAGES: 'gallery-images',
  GALLERY_PDFS: 'gallery-pdfs',
  PORTAL_ASSETS: 'portal-assets',
  PROFILE_ASSETS: 'profile-assets',
  PACKAGE_COVERS: 'package-covers',
  
  // Private folders
  PAYMENT_PROOFS: 'payment-proofs',
  CLIENT_AVATARS: 'clients/avatars',
  TEAM_AVATARS: 'team/avatars',
  VENDOR_SIGNATURES: 'vendor/signatures',
} as const;

export { STORAGE_FOLDERS };

// ========== UPLOAD ==========

/**
 * Upload a file
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const useNestJS = useNestJSForModule('storage');
  const { folder = STORAGE_FOLDERS.ASSETS, onProgress } = options;

  try {
    if (useNestJS) {
      // Upload via NestJS API
      const data = await apiClient.upload<UploadResult>(
        '/storage/upload',
        file,
        {
          fieldName: 'file',
          additionalData: { folder },
          onProgress,
        }
      );
      return data;
    } else {
      // Fallback to Supabase Storage
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const storagePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images') // Default bucket
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(storagePath);

      return {
        id: fileName,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        url: data.publicUrl,
      };
    }
  } catch (error) {
    console.error('[Storage Adapter] Error uploading file:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadFile(file, options);
    results.push(result);
  }

  return results;
}

/**
 * Upload avatar image (untuk clients atau team members)
 */
export async function uploadAvatar(
  file: File,
  type: 'client' | 'team'
): Promise<UploadResult> {
  const folder = type === 'client' 
    ? STORAGE_FOLDERS.CLIENT_AVATARS 
    : STORAGE_FOLDERS.TEAM_AVATARS;

  return uploadFile(file, { folder });
}

/**
 * Upload payment proof
 */
export async function uploadPaymentProof(file: File): Promise<UploadResult> {
  return uploadFile(file, { folder: STORAGE_FOLDERS.PAYMENT_PROOFS });
}

/**
 * Upload gallery images
 */
export async function uploadGalleryImage(file: File): Promise<UploadResult> {
  return uploadFile(file, { folder: STORAGE_FOLDERS.GALLERY_IMAGES });
}

/**
 * Upload gallery PDF
 */
export async function uploadGalleryPdf(file: File): Promise<UploadResult> {
  return uploadFile(file, { folder: STORAGE_FOLDERS.GALLERY_PDFS });
}

/**
 * Upload package cover
 */
export async function uploadPackageCover(file: File): Promise<UploadResult> {
  return uploadFile(file, { folder: STORAGE_FOLDERS.PACKAGE_COVERS });
}

/**
 * Upload profile logo
 */
export async function uploadProfileLogo(file: File): Promise<UploadResult> {
  return uploadFile(file, { folder: STORAGE_FOLDERS.PROFILE_ASSETS });
}

// ========== DOWNLOAD / ACCESS ==========

/**
 * Get public file URL
 */
export function getPublicFileUrl(id: string): string {
  const useNestJS = useNestJSForModule('storage');

  if (useNestJS) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    return `${apiBaseUrl}/storage/public/${id}`;
  } else {
    // Supabase public URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/gallery-images/${id}`;
  }
}

/**
 * Get private file URL (requires authentication)
 */
export function getPrivateFileUrl(id: string): string {
  const useNestJS = useNestJSForModule('storage');

  if (useNestJS) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    return `${apiBaseUrl}/storage/assets/${id}`;
  } else {
    // Supabase signed URL would need to be fetched
    console.warn('Private file access via Supabase not implemented');
    return '';
  }
}

/**
 * Download file as Blob
 */
export async function downloadFile(id: string, isPublic: boolean = false): Promise<Blob> {
  const useNestJS = useNestJSForModule('storage');

  try {
    if (useNestJS) {
      const endpoint = isPublic ? `/storage/public/${id}` : `/storage/assets/${id}`;
      const blob = await apiClient.download(endpoint, { requiresAuth: !isPublic });
      return blob;
    } else {
      // Fallback to direct fetch
      const url = isPublic ? getPublicFileUrl(id) : getPrivateFileUrl(id);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download file');
      return await response.blob();
    }
  } catch (error) {
    console.error('[Storage Adapter] Error downloading file:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Download file and trigger browser download
 */
export async function downloadFileToDevice(
  id: string,
  filename: string,
  isPublic: boolean = false
): Promise<void> {
  try {
    const blob = await downloadFile(id, isPublic);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[Storage Adapter] Error downloading file to device:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== DELETE ==========

/**
 * Delete a file
 */
export async function deleteFile(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('storage');

  try {
    if (useNestJS) {
      await apiClient.delete(`/storage/assets/${id}`);
    } else {
      // Supabase delete
      const { error } = await supabase.storage
        .from('gallery-images')
        .remove([id]);

      if (error) throw error;
    }
  } catch (error) {
    console.error('[Storage Adapter] Error deleting file:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(ids: string[]): Promise<void> {
  for (const id of ids) {
    await deleteFile(id);
  }
}

// ========== UTILITIES ==========

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Hanya ${allowedTypes.join(', ')} yang diperbolehkan.`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB} MB.`,
    };
  }
  return { valid: true };
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  options: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      const { minWidth, minHeight, maxWidth, maxHeight } = options;

      if (minWidth && width < minWidth) {
        resolve({
          valid: false,
          error: `Lebar gambar minimal ${minWidth}px`,
          dimensions: { width, height },
        });
        return;
      }

      if (minHeight && height < minHeight) {
        resolve({
          valid: false,
          error: `Tinggi gambar minimal ${minHeight}px`,
          dimensions: { width, height },
        });
        return;
      }

      if (maxWidth && width > maxWidth) {
        resolve({
          valid: false,
          error: `Lebar gambar maksimal ${maxWidth}px`,
          dimensions: { width, height },
        });
        return;
      }

      if (maxHeight && height > maxHeight) {
        resolve({
          valid: false,
          error: `Tinggi gambar maksimal ${maxHeight}px`,
          dimensions: { width, height },
        });
        return;
      }

      resolve({ valid: true, dimensions: { width, height } });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Gagal membaca gambar' });
    };

    img.src = url;
  });
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
