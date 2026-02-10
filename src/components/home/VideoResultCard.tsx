import React from 'react';

interface VideoResultCardProps {
  thumbnail?: string;
}

const VideoResultCard: React.FC<VideoResultCardProps> = ({ thumbnail }) => {
  return (
    <div className="flex flex-col gap-6 w-fit animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-[320px] aspect-[9/16] rounded-[28px] overflow-hidden bg-gray-100 shadow-[0px_24px_48px_-12px_rgba(0,0,0,0.18)] relative group border border-[#0A0A0A]/[0.08]">
          <img 
            src={thumbnail || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&h=2000&auto=format&fit=crop"} 
            alt="AI Avatar Result" 
            className="w-full h-full object-cover" 
          />
          
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-[72px] h-[72px] bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 cursor-pointer hover:scale-105 transition-all shadow-[0px_8px_16px_rgba(0,0,0,0.2)]">
                <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="translate-x-0.5">
                    <path d="M8 5V19L19 12L8 5Z" fill="#0A0A0A" />
                  </svg>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default VideoResultCard;
