import React, { useState, useEffect } from 'react';
import { STYLE_MODIFIER_INFO } from '../../services/cinematicAdsService';

/**
 * Cinematic Ad Form Component
 * Simple form for Format #3 - collects product info and style preferences
 */
const CinematicAdForm = ({ product, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    product_name: product?.productName || '',
    product_description: product?.description || '',
    product_image_url: product?.main_image_url || '',
    brand_name: product?.brandName || '',
    brand_logo_url: product?.brandLogoUrl || '',
    target_duration: 15,
    style_modifiers: [],
    prefer_kie: true
  });

  const [errors, setErrors] = useState({});

  // Debug: Watch style_modifiers changes
  useEffect(() => {
    console.log('[CinematicAdForm] 🎨 Style modifiers changed:', formData.style_modifiers);
  }, [formData.style_modifiers]);

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_name: product.productName || prev.product_name,
        product_description: product.description || prev.product_description,
        product_image_url: product.main_image_url || prev.product_image_url,
        brand_name: product.brandName || prev.brand_name,
        brand_logo_url: product.brandLogoUrl || prev.brand_logo_url
      }));
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStyleModifierToggle = (modifier) => {
    console.log('[CinematicAdForm] 🎨 Style modifier clicked:', modifier);
    console.log('[CinematicAdForm] 🎨 Current modifiers BEFORE:', formData.style_modifiers);
    
    setFormData(prev => {
      const isSelected = prev.style_modifiers.includes(modifier);
      const newModifiers = isSelected
        ? prev.style_modifiers.filter(m => m !== modifier)
        : [...prev.style_modifiers, modifier];
      
      console.log('[CinematicAdForm] 🎨 New modifiers AFTER:', newModifiers);
      
      return {
        ...prev,
        style_modifiers: newModifiers
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    
    if (!formData.product_description.trim()) {
      newErrors.product_description = 'Product description is required';
    } else if (formData.product_description.trim().length < 20) {
      newErrors.product_description = 'Description should be at least 20 characters';
    }
    
    if (formData.target_duration < 10 || formData.target_duration > 15) {
      newErrors.target_duration = 'Duration must be between 10-15 seconds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      console.log('[CinematicAdForm] 📤 SUBMITTING PAYLOAD:', JSON.stringify(formData, null, 2));
      console.log('[CinematicAdForm] 📊 Video Duration:', formData.target_duration, 'seconds');
      console.log('[CinematicAdForm] 🎨 Style Modifiers:', formData.style_modifiers);
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-5xl">🎬</span>
          <h2 className="text-3xl font-bold text-white">
            Cinematic Product Ad
          </h2>
          <span className="text-5xl">✨</span>
        </div>
        <p className="text-gray-400 text-lg">
          Simple & fast - just provide your product info and we'll create a stunning cinematic ad
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</span>
            Product Information
          </h3>

          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="e.g., Mountain Peak IPA"
                className={`w-full px-4 py-3 bg-[#0F0F0F] border ${
                  errors.product_name ? 'border-red-500' : 'border-[#262626]'
                } rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                disabled={isSubmitting}
              />
              {errors.product_name && (
                <p className="text-red-400 text-xs mt-1">{errors.product_name}</p>
              )}
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Product Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.product_description}
                onChange={(e) => handleChange('product_description', e.target.value)}
                placeholder="Describe your product in detail... What makes it special? What are its key features?"
                rows={4}
                className={`w-full px-4 py-3 bg-[#0F0F0F] border ${
                  errors.product_description ? 'border-red-500' : 'border-[#262626]'
                } rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.product_description ? (
                  <p className="text-red-400 text-xs">{errors.product_description}</p>
                ) : (
                  <p className="text-gray-500 text-xs">
                    {formData.product_description.length} characters
                  </p>
                )}
              </div>
            </div>

            {/* Product Image URL */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Product Image URL <span className="text-gray-500 text-xs">(Optional, but recommended)</span>
              </label>
              <input
                type="url"
                value={formData.product_image_url}
                onChange={(e) => handleChange('product_image_url', e.target.value)}
                placeholder="https://storage.googleapis.com/.../product.jpg"
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={isSubmitting}
              />
              <p className="text-gray-500 text-xs mt-1">
                💡 Claude will SEE your product and generate much better prompts!
              </p>
            </div>
          </div>
        </div>

        {/* Brand Information (Optional) */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-500/50 text-white flex items-center justify-center text-sm font-bold">2</span>
            Brand Information <span className="text-gray-500 text-sm font-normal">(Optional)</span>
          </h3>

          <div className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={(e) => handleChange('brand_name', e.target.value)}
                placeholder="e.g., Mountain Peak Brewery"
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Brand Logo URL */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Brand Logo URL
              </label>
              <input
                type="url"
                value={formData.brand_logo_url}
                onChange={(e) => handleChange('brand_logo_url', e.target.value)}
                placeholder="https://storage.googleapis.com/.../logo.png"
                className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-500/50 text-white flex items-center justify-center text-sm font-bold">3</span>
            Video Settings
          </h3>

          <div className="space-y-4">
            {/* Duration Slider */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Video Duration: {formData.target_duration} seconds
              </label>
              <input
                type="range"
                min="10"
                max="15"
                step="1"
                value={formData.target_duration}
                onChange={(e) => handleChange('target_duration', parseInt(e.target.value))}
                className="w-full h-2 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-purple-500"
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>15s</span>
              </div>
            </div>

            {/* Style Modifiers */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Style Modifiers <span className="text-gray-500 text-xs font-normal">(Optional - select any)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(STYLE_MODIFIER_INFO).map(([modifier, info]) => {
                  const isSelected = formData.style_modifiers.includes(modifier);
                  return (
                    <button
                      key={modifier}
                      type="button"
                      onClick={() => handleStyleModifierToggle(modifier)}
                      disabled={isSubmitting}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${isSelected
                          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                          : 'border-[#262626] bg-[#0F0F0F] hover:border-purple-500/50'
                        }
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{info.icon}</span>
                        <span className="text-white text-sm font-semibold">{info.name}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{info.description}</p>
                    </button>
                  );
                })}
              </div>
              {formData.style_modifiers.length > 0 && (
                <p className="text-purple-400 text-xs mt-2">
                  ✓ Selected {formData.style_modifiers.length} style modifier{formData.style_modifiers.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg
              ${isSubmitting
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/50'
              }
              text-white
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Cinematic Ad...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                Generate Cinematic Ad
                <span className="text-2xl">✨</span>
              </span>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="text-blue-400 font-semibold mb-1">Lightning Fast Generation:</h4>
              <p className="text-gray-300 text-sm">
                Cinematic ads skip strategic analysis and jump straight to video generation. 
                Your video will be ready in <strong>60-90 seconds</strong> with KIE Sora 2 Pro!
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CinematicAdForm;

