const FIREBASE_BUCKET = 'adforge-476017.appspot.com';

/**
 * Convert Firebase Storage path to public URL
 * @param {string} storagePath - Firebase Storage path (e.g., "users/userId/stores/brandId/ads/...")
 * @returns {string} Public URL
 */
export const getFirebaseImageUrl = (storagePath) => {
  if (!storagePath) return '';
  
  // If it's already a full URL, return it
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  
  // Convert storage path to public URL
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodedPath}?alt=media`;
};

/**
 * Get thumbnail URL with size parameter
 * @param {string} storagePath - Firebase Storage path
 * @param {number} width - Desired width in pixels
 * @returns {string} Public URL with size parameter
 */
export const getFirebaseThumbnailUrl = (storagePath, width = 400) => {
  const url = getFirebaseImageUrl(storagePath);
  return url;
};

/**
 * Extract filename from storage path
 * @param {string} storagePath - Firebase Storage path
 * @returns {string} Filename
 */
export const getFilenameFromPath = (storagePath) => {
  if (!storagePath) return '';
  const parts = storagePath.split('/');
  return parts[parts.length - 1];
};

/**
 * Check if image URL is valid
 * @param {string} url - Image URL
 * @returns {Promise<boolean>} True if image loads successfully
 */
export const isValidImageUrl = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Download image from Firebase Storage
 * Uses direct link approach to avoid CORS issues
 * @param {string} storagePath - Firebase Storage path or full URL
 * @param {string} filename - Desired filename for download
 */
export const downloadFirebaseImage = async (storagePath, filename) => {
  try {
    // Get the Firebase Storage URL
    let url = getFirebaseImageUrl(storagePath);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || getFilenameFromPath(storagePath);
    link.target = '_blank'; // Open in new tab as fallback
    link.rel = 'noopener noreferrer';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[StorageHelpers] Download initiated:', filename);
  } catch (error) {
    console.error('[StorageHelpers] Error downloading image:', error);
    // Fallback: open in new tab
    const url = getFirebaseImageUrl(storagePath);
    window.open(url, '_blank');
  }
};

export default {
  getFirebaseImageUrl,
  getFirebaseThumbnailUrl,
  getFilenameFromPath,
  isValidImageUrl,
  downloadFirebaseImage,
};
