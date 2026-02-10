/**
 * Extract domain from a URL
 * @param {string} url - Full URL
 * @returns {string|null} - Domain without 'www.' or null if invalid
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    console.error('Invalid URL:', url);
    return null;
  }
};

/**
 * Find brand by domain
 * @param {Array} brands - Array of brand objects
 * @param {string} domain - Domain to search for
 * @returns {Object|null} - Brand object or null
 */
export const findBrandByDomain = (brands, domain) => {
  if (!brands || !domain) return null;
  return brands.find(b => b.domain === domain) || null;
};

/**
 * Get brand colors as object
 * @param {Object} brand - Brand object
 * @returns {Object} - Object with primary, secondary, accent colors
 */
export const getBrandColors = (brand) => {
  if (!brand) {
    return {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: null,
    };
  }
  
  return {
    primary: brand.primaryColor || '#000000',
    secondary: brand.secondaryColor || '#FFFFFF',
    accent: brand.accentColor || null,
  };
};

/**
 * Get brand logo URL (prioritize custom logo over scraped)
 * @param {Object} brand - Brand object
 * @returns {string|null} - Logo URL or null
 */
export const getBrandLogoUrl = (brand) => {
  if (!brand) return null;
  return brand.customLogoUrl || brand.logoUrl || null;
};

/**
 * Format brand stats for display
 * @param {Object} brand - Brand object
 * @returns {Object} - Formatted stats
 */
export const formatBrandStats = (brand) => {
  if (!brand) {
    return {
      products: 0,
      ads: 0,
      displayText: '0 products · 0 ads',
    };
  }
  
  const productCount = brand.productCount || 0;
  const adCount = brand.adCount || 0;
  
  return {
    products: productCount,
    ads: adCount,
    displayText: `${productCount} product${productCount !== 1 ? 's' : ''} · ${adCount} ad${adCount !== 1 ? 's' : ''}`,
  };
};

/**
 * Validate brand data before creation
 * @param {Object} brandData - Brand data to validate
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateBrandData = (brandData) => {
  const errors = [];
  
  if (!brandData.brandName || brandData.brandName.trim() === '') {
    errors.push('Brand name is required');
  }
  
  if (!brandData.domain || brandData.domain.trim() === '') {
    errors.push('Domain is required');
  }
  
  const hexRegex = /^#[0-9A-F]{6}$/i;
  
  if (brandData.primaryColor && !hexRegex.test(brandData.primaryColor)) {
    errors.push('Primary color must be a valid hex color (e.g., #000000)');
  }
  
  if (brandData.secondaryColor && !hexRegex.test(brandData.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color (e.g., #FFFFFF)');
  }
  
  if (brandData.accentColor && brandData.accentColor !== '' && !hexRegex.test(brandData.accentColor)) {
    errors.push('Accent color must be a valid hex color (e.g., #FF0000)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Convert logo URL to File object for upload
 * @param {string} logoUrl - URL of the logo
 * @param {string} filename - Desired filename
 * @returns {Promise<File|null>} - File object or null
 */
export const logoUrlToFile = async (logoUrl, filename = 'logo.png') => {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    return new File([blob], `${filename.split('.')[0]}.${extension}`, { type: mimeType });
  } catch (error) {
    console.error('Error converting logo URL to file:', error);
    return null;
  }
};

/**
 * Prepare FormData for ad generation with brand info
 * @param {Object} brand - Brand object
 * @param {Object} product - Product object
 * @param {Object} options - Additional options (count, aspectRatio, lang, etc.)
 * @returns {FormData} - Prepared FormData
 */
export const prepareAdGenerationFormData = async (brand, product, options = {}) => {
  const formData = new FormData();
  
  // Brand information
  if (brand) {
    formData.append('brand_id', brand.brandId);
    formData.append('brand_name', brand.brandName);
    
    const colors = getBrandColors(brand);
    formData.append('primary_color_hex', colors.primary);
    formData.append('secondary_color_hex', colors.secondary);
    if (colors.accent) {
      formData.append('accent_color_hex', colors.accent);
    }
  }
  
  // Product information
  if (product) {
    formData.append('product_full_name', product.productName || product.title || '');
    formData.append('product_description', product.description || '');
  }
  
  // Options
  if (options.count) formData.append('count', options.count.toString());
  if (options.aspectRatio) formData.append('aspect_ratio', options.aspectRatio);
  if (options.lang) formData.append('lang', options.lang);
  
  return formData;
};

export default {
  extractDomain,
  findBrandByDomain,
  getBrandColors,
  getBrandLogoUrl,
  formatBrandStats,
  validateBrandData,
  logoUrlToFile,
  prepareAdGenerationFormData,
};
