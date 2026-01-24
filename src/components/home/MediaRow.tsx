import React, { useState } from 'react';
import ProductSelector from './ProductSelector';
import MediaToggle from './MediaToggle';
import type { MediaType } from '@/types';

const MediaRow: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaType>('video');

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-white border border-border-light rounded-lg p-3 flex-wrap sm:flex-nowrap">
      {/* Product Selector */}
      <div className="w-full sm:w-auto">
        <ProductSelector selected={selectedProduct} onSelect={setSelectedProduct} />
      </div>

      {/* Media Toggles */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center sm:justify-start">
        <MediaToggle
          value="video"
          active={selectedMedia === 'video'}
          onClick={() => setSelectedMedia('video')}
        />
        <MediaToggle
          value="image"
          active={selectedMedia === 'image'}
          onClick={() => setSelectedMedia('image')}
        />
        <MediaToggle
          value="chatmode"
          active={selectedMedia === 'chatmode'}
          onClick={() => setSelectedMedia('chatmode')}
          hasDropdown
        />
      </div>

      {/* Arrow Button */}
      <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md hover:bg-bg-hover transition-all flex-shrink-0">
        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

export default MediaRow;
