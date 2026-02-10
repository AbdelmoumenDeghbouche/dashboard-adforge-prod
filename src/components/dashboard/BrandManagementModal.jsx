import React, { useState } from 'react';
import { useBrand } from '../../contexts/BrandContext';

const BrandManagementModal = ({ isOpen, onClose }) => {
  const { brands, createBrand, updateBrand, deleteBrand, refreshBrands } = useBrand();
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit'
  const [editingBrand, setEditingBrand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    brandName: '',
    domain: '',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    accentColor: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      brandName: '',
      domain: '',
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      accentColor: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setError('');
    setSuccess('');
    setEditingBrand(null);
  };

  const handleClose = () => {
    resetForm();
    setActiveView('list');
    onClose();
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await createBrand(formData, logoFile);
      
      if (result.success) {
        setSuccess('Brand created successfully!');
        setTimeout(() => {
          resetForm();
          setActiveView('list');
          refreshBrands();
        }, 1500);
      } else {
        setError(result.error || 'Failed to create brand');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const updates = {};
      if (formData.brandName !== editingBrand.brandName) updates.brandName = formData.brandName;
      if (formData.primaryColor !== editingBrand.primaryColor) updates.primaryColor = formData.primaryColor;
      if (formData.secondaryColor !== editingBrand.secondaryColor) updates.secondaryColor = formData.secondaryColor;
      if (formData.accentColor !== editingBrand.accentColor) updates.accentColor = formData.accentColor;

      const result = await updateBrand(editingBrand.brandId, updates, logoFile);
      
      if (result.success) {
        setSuccess('Brand updated successfully!');
        setTimeout(() => {
          resetForm();
          setActiveView('list');
          refreshBrands();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update brand');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setFormData({
      brandName: brand.brandName,
      domain: brand.domain,
      primaryColor: brand.primaryColor || '#000000',
      secondaryColor: brand.secondaryColor || '#FFFFFF',
      accentColor: brand.accentColor || '',
    });
    setLogoPreview(brand.customLogoUrl || brand.logoUrl);
    setActiveView('edit');
  };

  const handleDeleteBrand = async (brandId) => {
    setIsDeleting(true);
    setError('');

    try {
      const result = await deleteBrand(brandId);
      
      if (result.success) {
        setSuccess('Brand deleted successfully!');
        setDeleteConfirmId(null);
        setTimeout(() => {
          refreshBrands();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error || 'Failed to delete brand');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0F0F0F] rounded-2xl border border-[#262626] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <h2 className="text-2xl font-bold text-white">
            {activeView === 'list' && 'Manage Brands'}
            {activeView === 'create' && 'Create New Brand'}
            {activeView === 'edit' && 'Edit Brand'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* List View */}
          {activeView === 'list' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setActiveView('create')}
                  className="w-full px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Brand
                </button>
              </div>

              {brands.length > 0 ? (
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div
                      key={brand.brandId}
                      className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-4 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        {brand.customLogoUrl || brand.logoUrl ? (
                          <img
                            src={brand.customLogoUrl || brand.logoUrl}
                            alt={brand.brandName}
                            className="w-16 h-16 rounded-lg object-contain bg-white/5"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold"
                            style={{ backgroundColor: brand.primaryColor || '#8B5CF6' }}
                          >
                            {brand.brandName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1">{brand.brandName}</h3>
                          <p className="text-sm text-gray-400 mb-2">{brand.domain}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{brand.productCount || 0} products</span>
                            <span>{brand.adCount || 0} ads</span>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.primaryColor }}></div>
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.secondaryColor }}></div>
                              {brand.accentColor && (
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.accentColor }}></div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBrand(brand)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {deleteConfirmId === brand.brandId ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteBrand(brand.brandId)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(brand.brandId)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg mb-2">No brands yet</p>
                  <p className="text-sm opacity-75">Create your first brand to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Create/Edit Form */}
          {(activeView === 'create' || activeView === 'edit') && (
            <form onSubmit={activeView === 'create' ? handleCreateBrand : handleUpdateBrand} className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-contain bg-white/5" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] text-white rounded-lg transition-all">
                    <span className="text-sm">Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="e.g., Nike"
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Domain *</label>
                <input
                  type="text"
                  required
                  disabled={activeView === 'edit'}
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g., nike.com"
                />
                {activeView === 'edit' && (
                  <p className="text-xs text-gray-500 mt-1">Domain cannot be changed after creation</p>
                )}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      required
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg border-2 border-[#262626] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      required
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-lg border-2 border-[#262626] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor || '#000000'}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-12 h-12 rounded-lg border-2 border-[#262626] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveView('list');
                  }}
                  className="flex-1 px-6 py-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#262626] text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : activeView === 'create' ? 'Create Brand' : 'Update Brand'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandManagementModal;

