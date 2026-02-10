import React, { useState, useRef } from 'react';
import { Product } from '../types/products';

interface ProductEditPageProps {
  product: Product | null;
  onBack: () => void;
  onSave?: (product: Product) => void;
}

const ProductEditPage: React.FC<ProductEditPageProps> = ({ product, onBack, onSave }) => {
  // Initialize state with product data or defaults
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      title: '',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Product, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.title) {
      alert('Please enter a product title');
      return;
    }

    const savedProduct: Product = {
      id: product?.id || Date.now().toString(),
      title: formData.title || '',
      description: formData.description || '',
      thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      primaryProblem: formData.primaryProblem || '',
      mainReason: formData.mainReason || '',
      moment: formData.moment || '',
      whyPreviousFailed: formData.whyPreviousFailed || '',
      whatTheyWantToFeel: formData.whatTheyWantToFeel || '',
      bestProof: formData.bestProof || '',
    };

    if (onSave) {
      onSave(savedProduct);
    }
    onBack();
  };

  return (
    <div className="flex flex-col gap-[48px]">
      {/* Go Back Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#0A0A0A]/70 hover:text-[#0A0A0A] transition-colors self-start"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-medium text-sm leading-[22px] tracking-[-0.007em]">Go back</span>
      </button>

      {/* Top Section: Image and Name/Description */}
      <div className="grid grid-cols-[200px_1fr] gap-8 items-start">
        {/* Left: Product Image */}
        <div className="flex flex-col gap-4">
          <div className="w-[200px] h-[200px] rounded-[14px] overflow-hidden bg-[#F5F5F5] border border-[#0A0A0A]/[0.06]">
            <img 
              src={formData.thumbnail} 
              alt={formData.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button 
            onClick={handleImageClick}
            type="button"
            className="flex items-center justify-center gap-2 w-full h-[38px] px-4 py-2 border border-[#0A0A0A]/[0.06] rounded-[14px] hover:bg-[#F5F5F5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-medium text-sm text-[#0A0A0A]">Import a new photo</span>
          </button>
        </div>

        {/* Right: Product Name and Description */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-[#0A0A0A]">What do you call your product?</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full h-[46px] px-4 py-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/20 transition-all font-normal text-sm"
              placeholder="Insta360 Ace Pro"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm text-[#0A0A0A]">How would you describe your product?</label>
            <textarea 
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full min-h-[160px] px-4 py-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/20 transition-all font-normal text-sm resize-none"
              placeholder="How would you describe your product?"
            />
          </div>
        </div>
      </div>

      {/* Grid Section: Ad-specific fields */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-6">
        {[
          { label: 'Primary problem this product is meant to solve', field: 'primaryProblem', placeholder: "Clothes that don't fit the way they should" },
          { label: "Main reason people don't trust solutions like this", field: 'mainReason', placeholder: '"It\'s just marketing"' },
          { label: 'Moment that pushes people to take action', field: 'moment', placeholder: 'When getting dressed' },
          { label: "Why previous solutions didn't work", field: 'whyPreviousFailed', placeholder: '"The problem wasn\'t you — it was the approach"' },
          { label: 'What people really want to feel=', field: 'whatTheyWantToFeel', placeholder: 'Confidence, simplicity, relief and control' },
          { label: 'Best type of proof for ads', field: 'bestProof', placeholder: 'Reviews / UGC and Demos' },
        ].map((item) => (
          <div key={item.field} className="flex flex-col gap-2">
            <label className="font-medium text-sm text-[#0A0A0A]">{item.label}</label>
            <input 
              type="text"
              value={formData[item.field as keyof Product] || ''}
              onChange={(e) => handleChange(item.field as keyof Product, e.target.value)}
              className="w-full h-[46px] px-4 py-3 bg-white border border-[#0A0A0A]/[0.06] rounded-[14px] outline-none focus:border-[#0A0A0A]/20 transition-all font-normal text-sm"
              placeholder={item.placeholder}
            />
          </div>
        ))}
      </div>

      {/* Footer: Save Change Button */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className="h-[38px] px-6 py-2 bg-[#0A0A0A] rounded-[14px] hover:bg-[#0A0A0A]/90 transition-colors"
        >
          <span className="font-medium text-sm text-white">Save change</span>
        </button>
      </div>
    </div>
  );
};

export default ProductEditPage;
