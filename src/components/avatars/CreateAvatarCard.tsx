import React, { useState } from 'react';
import CreateAvatarModal from './CreateAvatarModal';

const CreateAvatarCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group cursor-pointer flex flex-col gap-3 w-full" onClick={() => setIsModalOpen(true)}>
        {/* Dashed Picture Container */}
        <div className="w-full aspect-[162.75/290.86] rounded-xl sm:rounded-2xl border border-dashed border-[#0A0A0A]/[0.12] bg-[#0A0A0A]/[0.04] transition-all duration-300 group-hover:bg-[#0A0A0A]/[0.06] flex items-center justify-center relative">
          {/* Floating Action Button */}
          <img 
            src="/icons/Create an AI Avatar.svg" 
            alt="" 
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-[90px] lg:h-[90px] translate-y-1 sm:translate-y-2 transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
        
        {/* Label Content - Frame 1707484110 */}
        <div className="px-1.5 sm:px-2 md:px-2.5">
          <p className="font-medium text-[11px] sm:text-xs md:text-[14px] leading-[16px] sm:leading-[18px] md:leading-[22px] tracking-[-0.007em] text-[#0A0A0A] group-hover:text-black transition-colors">
            Create an AI Avatar
          </p>
        </div>
      </div>

      <CreateAvatarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CreateAvatarCard;
