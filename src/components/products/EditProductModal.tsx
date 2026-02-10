import React, { useState, useEffect } from 'react';
import { Product } from '../../types/products';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product }) => {
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [features, setFeatures] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    if (product) {
      setDescription(product.description || '');
      setTargetAudience(''); // Empty by default as placeholder shows
      setFeatures('');
      setThumbnail(product.thumbnail || '');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    console.log('Saving product changes:', { description, targetAudience, features, thumbnail });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-[28px] shadow-2xl w-full max-w-[540px] flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-[18px] font-semibold tracking-tight text-[#0A0A0A]">Edit your product</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#0A0A0A]/[0.04] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Info Banner */}
          <div className="mx-5 px-3 py-2 bg-[#06E8DC]/[0.04] border-l-2 border-[#06E8DC] flex items-center gap-2.5">
            <div className="w-4 h-4 flex items-center justify-center bg-[#06E8DC] rounded-full flex-shrink-0">
              <span className="text-white text-[10px] font-bold">i</span>
            </div>
            <p className="text-[12px] leading-[18px] text-[#0A0A0A]/80">
              The more information you provide to Ad Forge, the more accurate your creatives will be.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 flex gap-6">
            {/* Left: Image Section */}
            <div className="flex flex-col gap-3 w-[160px] flex-shrink-0">
              <div className="relative group cursor-pointer w-full aspect-square rounded-[20px] overflow-hidden border border-[#0A0A0A]/[0.06] bg-[#F9FAFB]">
                {thumbnail ? (
                  <>
                    <img src={thumbnail} alt="Product" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {/* Hover Overlay with Icon */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0A0A0A]/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {/* Hidden File Input for thumbnail */}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setThumbnail(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <button 
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                  input?.click();
                }}
                className="flex items-center justify-center gap-1.5 w-full h-[36px] bg-white border border-[#0A0A0A]/[0.06] rounded-xl shadow-sm hover:bg-[#0A0A0A]/[0.02] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[12px] font-medium text-[#0A0A0A]">Import photo</span>
              </button>
            </div>

            {/* Right: Form Fields */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#0A0A0A]">How would you describe your product?</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full h-[80px] p-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/[0.12] transition-colors resize-none text-[13px] text-[#0A0A0A]"
                />
              </div>

              {/* Target Audience */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#0A0A0A]">Who is your target audience?</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Young professionals"
                  className="w-full h-[40px] px-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/[0.12] transition-colors text-[13px] text-[#0A0A0A]"
                />
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-[#0A0A0A]">List all your features...</label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Key features..."
                  className="w-full h-[90px] p-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/[0.12] transition-colors resize-none text-[13px] text-[#0A0A0A]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-0 flex gap-2.5 mt-auto">
            <button
              onClick={onClose}
              className="flex-1 h-[48px] bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] font-semibold text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.02] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-[1.2] h-[48px] bg-[#0A0A0A] text-white rounded-[18px] font-semibold hover:bg-[#0A0A0A]/[0.9] transition-all"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProductModal;
