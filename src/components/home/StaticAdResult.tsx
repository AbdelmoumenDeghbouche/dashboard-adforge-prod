import React from 'react';

interface StaticAdResultProps {
  imageUrl: string;
}

const StaticAdResult: React.FC<StaticAdResultProps> = ({ imageUrl }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <span className="text-[14px] font-medium text-[#0A0A0A]">Here's your static ad:</span>
      
      <div className="relative group overflow-hidden rounded-[24px] border border-[#0A0A0A]/[0.06] bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-[#0A0A0A]/[0.08] w-full max-w-[480px]">
        {/* Image Display */}
        <div className="aspect-[4/5] relative">
          <img 
            src={imageUrl} 
            alt="Generated Static Ad" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          
          {/* Overlay for premium look */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
          
          {/* Action indicator if needed, but designers mockup shows just the image */}
        </div>
      </div>
    </div>
  );
};

export default StaticAdResult;
