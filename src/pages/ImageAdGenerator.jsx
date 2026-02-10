import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useBrand } from '../contexts/BrandContext';
import { adsAPI } from '../services/apiService';

const ImageAdGenerator = () => {
  const { selectedBrand, brandProducts, loadingProducts } = useBrand();

  // Step 1: Product Selection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState(null);
  const [productImages, setProductImages] = useState([]);

  // Step 2: Template Selection
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);

  // Previously Generated Ads
  const [brandTemplateAds, setBrandTemplateAds] = useState([]);
  const [loadingBrandAds, setLoadingBrandAds] = useState(false);

  // Template categories with real preview images and descriptions
  const templateCategories = [
    { 
      id: 1, 
      code: "hero_product", 
      name: "Hero Product Showcase", 
      description: "Premium product photography with dramatic lighting and clean backgrounds",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Fhero_product_example.png?alt=media&token=193fd867-6f3d-43a0-900b-315df178339e" 
    },
    { 
      id: 2, 
      code: "lifestyle_use", 
      name: "Real Life Integration", 
      description: "Product in authentic lifestyle scenarios and real-world environments",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Flifestyle_use_example.png?alt=media&token=43225854-92c6-45bf-a7a3-83d73649b1be" 
    },
    { 
      id: 3, 
      code: "feature_highlight", 
      name: "Feature Spotlight", 
      description: "Highlighting key technical features and product benefits with callouts",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Ffeature_highlight_example.png?alt=media&token=40c6c6dd-3846-4470-9a9e-7f6642f2d7c6" 
    },
    { 
      id: 4, 
      code: "transformation", 
      name: "Before/After Transformation", 
      description: "Problem-solution visual storytelling showing the transformation",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Ftransformation_example.png?alt=media&token=4ec88829-3f61-4a42-9354-008babcbc08e" 
    },
    { 
      id: 5, 
      code: "social_proof_ugc", 
      name: "UGC Social Proof", 
      description: "Authentic user-generated style content with real customer experiences",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Fsocial_proof_ugc_example.png?alt=media&token=d78eff28-c285-411a-a3a8-52e601dbd736" 
    },
    { 
      id: 6, 
      code: "limited_time", 
      name: "Limited Time Offer", 
      description: "Urgency and FOMO-driven designs with promotional messaging",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Flimited_time_example.png?alt=media&token=7bd95220-59b4-4641-9468-2f2bdcd80675" 
    },
    { 
      id: 7, 
      code: "unboxing_moment", 
      name: "Unboxing Experience", 
      description: "Premium unboxing and first impression moments that excite",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Funboxing_moment_example.png?alt=media&token=249a34ba-ff94-44b2-b2f6-5e9b4919c8eb" 
    },
    { 
      id: 8, 
      code: "comparison_winner", 
      name: "Comparison Chart", 
      description: "Side-by-side product comparison showing competitive advantages",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Fcomparison_winner_example.png?alt=media&token=b44fbdc0-fd2c-4cc9-b5ef-433048b1f578" 
    },
    { 
      id: 9, 
      code: "behind_design", 
      name: "Craftsmanship Focus", 
      description: "Quality materials and construction details that showcase craftsmanship",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Fbehind_design_example.png?alt=media&token=77bb6ac4-ef9c-4247-9c1f-745cb01821f5" 
    },
    { 
      id: 10, 
      code: "daily_ritual", 
      name: "Daily Ritual", 
      description: "Product as part of everyday routine and lifestyle integration",
      preview: "https://firebasestorage.googleapis.com/v0/b/saas-adforge.firebasestorage.app/o/template_examples%2Fdaily_ritual_example.png?alt=media&token=d08681c4-a430-47c8-8949-f81f283584f4" 
    }
  ];

  // Load brand's template ads
  const loadBrandTemplateAds = async (brandId) => {
    if (!brandId) return;
    
    try {
      setLoadingBrandAds(true);
      console.log('[ImageAdGen] Loading template ads for brand:', brandId);
      
      const response = await adsAPI.getTemplateAdsByBrand(brandId);
      console.log('[ImageAdGen] Template ads response:', response);
      
      if (response.data?.ads) {
        setBrandTemplateAds(response.data.ads);
        console.log('[ImageAdGen] Loaded', response.data.ads.length, 'template ads');
      } else {
        setBrandTemplateAds([]);
      }
    } catch (error) {
      console.error('[ImageAdGen] Error loading template ads:', error);
      setBrandTemplateAds([]);
    } finally {
      setLoadingBrandAds(false);
    }
  };

  // Reset when brand changes and load brand ads
  useEffect(() => {
    console.log('[ImageAdGen] Brand changed, resetting data...');
    setSelectedProduct(null);
    setSelectedProductImage(null);
    setProductImages([]);
    setSelectedTemplates({});
    setGeneratedImages([]);
    setBrandTemplateAds([]);
    
    // Load brand template ads
    if (selectedBrand?.brandId) {
      loadBrandTemplateAds(selectedBrand.brandId);
    }
  }, [selectedBrand?.brandId]);

  // Load product images when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const imagesFromProduct = selectedProduct.images || [];
      const formattedImages = imagesFromProduct.map((img, index) => ({
        id: `product_img_${index}`,
        url: typeof img === 'string' ? img : (img.url || img.imageUrl),
      })).filter(img => img.url);

      setProductImages(formattedImages);
      setSelectedProductImage(null); // Reset selected image when product changes
      if (formattedImages.length === 1) {
        setSelectedProductImage(formattedImages[0]);
      }
    }
  }, [selectedProduct]);

  // Calculate total images to be generated
  const getTotalImages = () => {
    return Object.values(selectedTemplates).reduce((sum, count) => sum + count, 0);
  };

  // Handle template count change
  const handleTemplateCountChange = (templateId, count) => {
    const newCount = parseInt(count) || 0;
    const currentTotal = getTotalImages();
    const otherTemplatesTotal = currentTotal - (selectedTemplates[templateId] || 0);
    
    if (otherTemplatesTotal + newCount > 10) {
      alert('⚠️ Maximum 10 images total!\n\nReduce other template counts first.');
      return;
    }

    if (newCount === 0) {
      const { [templateId]: _, ...rest } = selectedTemplates;
      setSelectedTemplates(rest);
    } else {
      setSelectedTemplates(prev => ({
        ...prev,
        [templateId]: newCount
      }));
    }
  };

  // Generate images
  const handleGenerate = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    if (!selectedProductImage) {
      alert('Please select a product image');
      return;
    }

    if (Object.keys(selectedTemplates).length === 0) {
      alert('Please select at least one template');
      return;
    }

    if (!selectedBrand) {
      alert('Please select a brand first');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[ImageAdGen] Generating images...');

      // Build templates array
      const templatesArray = Object.entries(selectedTemplates).map(([templateId, count]) => ({
        template_id: parseInt(templateId),
        count: count
      }));

      // Build FormData
      const formData = new FormData();
      formData.append('brand_name', selectedBrand.brandName);
      formData.append('product_name', selectedProduct.productName);
      formData.append('product_description', selectedProduct.description || selectedProduct.productDescription || 'Premium product');
      formData.append('templates', JSON.stringify(templatesArray));
      formData.append('aspect_ratio', aspectRatio);

      // Send product image URL (let backend fetch it to avoid CORS issues)
      formData.append('product_image_url', selectedProductImage.url);

      // Call backend using API service
      const data = await adsAPI.generateTemplateImages(formData);
      console.log('[ImageAdGen] Response:', data);

      // Handle both old (data.data.images) and new job-based (data.images) response structures
      const images = data.data?.images || data.images;
      const isSuccess = data.success || data.data?.success;

      if (isSuccess && images && images.length > 0) {
        setGeneratedImages(images);
        alert(`✅ Generated ${images.length} images successfully!`);
        
        // Refresh brand template ads to show newly generated ads
        if (selectedBrand?.brandId) {
          loadBrandTemplateAds(selectedBrand.brandId);
        }
      } else {
        throw new Error('No images returned from server');
      }

    } catch (error) {
      console.error('[ImageAdGen] Error:', error);
      alert('Failed to generate images: ' + (error.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Image Ad Generator</h1>
          <p className="text-gray-400">Generate professional ad images using AI-powered templates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Selection */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
              <h2 className="text-xl font-bold text-white mb-4">Select Product</h2>
              
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading products...</p>
                </div>
              ) : brandProducts.length === 0 ? (
                <p className="text-gray-400 text-sm">No products available</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {brandProducts.map((product) => (
                    <div
                      key={product.productId}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedProduct?.productId === product.productId
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-[#0F0F0F] hover:bg-[#262626]'
                      } border`}
                    >
                      <p className="text-white font-medium">{product.productName}</p>
                      {product.images && product.images.length > 0 && (
                        <p className="text-gray-400 text-xs mt-1">{product.images.length} images</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Image Selection */}
            {selectedProduct && (
              <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4">Select Product Image</h2>
                
                {productImages.length === 0 ? (
                  <p className="text-gray-400 text-sm">No images available</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {productImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => setSelectedProductImage(image)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                          selectedProductImage?.id === image.id
                            ? 'border-purple-500 ring-2 ring-purple-500/50'
                            : 'border-transparent hover:border-purple-500/50'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        {selectedProductImage?.id === image.id && (
                          <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aspect Ratio */}
            {selectedProduct && selectedProductImage && (
              <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4">Aspect Ratio</h2>
                <div className="grid grid-cols-2 gap-2">
                  {['1:1', '16:9', '9:16', '4:5'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        aspectRatio === ratio
                          ? 'bg-purple-500 text-white'
                          : 'bg-[#0F0F0F] text-gray-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Template Selection & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Select Templates</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Total:</span>
                  <span className={`text-lg font-bold ${getTotalImages() > 10 ? 'text-red-500' : 'text-purple-400'}`}>
                    {getTotalImages()} / 10
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-2">
                {templateCategories.map((template) => {
                  const isSelected = selectedTemplates[template.id] > 0;
                  return (
                    <div
                      key={template.id}
                      className={`group bg-[#0F0F0F] rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                        isSelected 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'border-[#262626] hover:border-purple-500/40'
                      }`}
                    >
                      {/* Preview Image - Fully Visible, No Overlays */}
                      <div className="relative overflow-hidden bg-[#1A1A1A]">
                        <div className="aspect-[3/4] relative">
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Selected Badge - Top Right, No Image Overlap */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xl backdrop-blur-sm">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {selectedTemplates[template.id]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Template Info - Compact */}
                      <div className="p-3 space-y-2">
                        <div>
                          <h3 className="text-white font-semibold text-sm mb-1">{template.name}</h3>
                          <p className="text-gray-400 text-xs leading-snug mb-1.5">{template.description}</p>
                          <span className="inline-block px-1.5 py-0.5 bg-[#1A1A1A] text-purple-400 text-[10px] font-mono rounded">
                            {template.code}
                          </span>
                        </div>

                        {/* Count Selector - Compact */}
                        <div className="flex items-center gap-2 pt-1">
                          <label className="text-xs text-gray-300 font-medium flex-shrink-0">Generate:</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={selectedTemplates[template.id] || 0}
                            onChange={(e) => handleTemplateCountChange(template.id, e.target.value)}
                            className={`flex-1 px-3 py-2 rounded-lg text-white text-sm text-center font-semibold focus:outline-none focus:ring-2 transition-all ${
                              isSelected
                                ? 'bg-purple-500/20 border-2 border-purple-500 focus:ring-purple-500'
                                : 'bg-[#1A1A1A] border-2 border-[#262626] focus:ring-purple-500 focus:border-purple-500'
                            }`}
                            placeholder="0"
                          />
                          <span className="text-gray-400 text-xs flex-shrink-0">images</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            {selectedProduct && selectedProductImage && Object.keys(selectedTemplates).length > 0 && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || getTotalImages() > 10 || getTotalImages() === 0}
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating {getTotalImages()} Images...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Generate {getTotalImages()} Images
                  </>
                )}
              </button>
            )}

            {/* Generated Images */}
            {generatedImages.length > 0 && (
              <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626] animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4">Generated Images ({generatedImages.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#262626] hover:border-purple-500 transition-all group">
                      <img
                        src={image.url || image.image_url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={image.url || image.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                      {image.template_name && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs">{image.template_name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previously Generated Template Ads */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generated Template Ads
                </h2>
                <button
                  onClick={() => loadBrandTemplateAds(selectedBrand?.brandId)}
                  disabled={loadingBrandAds || !selectedBrand}
                  className="p-2 hover:bg-[#0F0F0F] rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <svg className={`w-5 h-5 text-gray-400 ${loadingBrandAds ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {loadingBrandAds ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
              ) : brandTemplateAds.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {brandTemplateAds.map((ad, index) => (
                    <div key={ad.id || index} className="relative aspect-square rounded-lg overflow-hidden border border-[#262626] hover:border-purple-500 transition-all group bg-[#0F0F0F]">
                      <img
                        src={ad.image_url || ad.url}
                        alt={ad.template_name || `Template ad ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <a
                          href={ad.image_url || ad.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                          title="View full size"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {ad.created_at && (
                          <span className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">
                            {new Date(ad.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Template name badge */}
                      {ad.template_name && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate">{ad.template_name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    {selectedBrand ? 'No template ads generated yet' : 'Select a brand to view ads'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ImageAdGenerator;

