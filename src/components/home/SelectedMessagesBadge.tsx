import React from 'react';

interface SelectedMessagesBadgeProps {
  count: number;
  images: string[];
}

const SelectedMessagesBadge: React.FC<SelectedMessagesBadgeProps> = ({ count, images }) => {
  return (
    <div className="flex justify-end w-full mb-6">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F9FAFB] border border-[#0A0A0A]/[0.06] rounded-[16px]">
        {/* Thumbnails Stack */}
        <div className="flex -space-x-2.5">
          {images.slice(0, 5).map((img, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-md border-2 border-white overflow-hidden shadow-sm shrink-0"
              style={{ zIndex: 5 - i }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        
        <span className="text-[14px] font-bold text-[#0A0A0A]">
          {count} Messages selected
        </span>
      </div>
    </div>
  );
};

export default SelectedMessagesBadge;
