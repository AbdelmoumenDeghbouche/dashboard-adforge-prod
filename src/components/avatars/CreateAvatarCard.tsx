import React, { useState } from 'react';
import CreateAvatarModal from './CreateAvatarModal';

const CreateAvatarCard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="group cursor-pointer w-full" onClick={() => setIsModalOpen(true)}>
        <div 
          style={{
            maxWidth: 'min(162.75px, 11.3vw)',
            aspectRatio: '162.75 / 324.86',
            gap: 'min(12px, 0.83vw)',
            opacity: 1,
          }}
          className="relative w-full mx-auto rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 transition-all duration-300 group-hover:border-gray-400 group-hover:bg-gray-100 flex items-center justify-center"
        >
          <img 
            src="/icons/Create an AI Avatar.svg" 
            alt="Create Avatar" 
            className="w-20 h-20 mt-8"
          />
        </div>
        
        {/* Text outside the container */}
        <div className="mt-2">
          <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
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
