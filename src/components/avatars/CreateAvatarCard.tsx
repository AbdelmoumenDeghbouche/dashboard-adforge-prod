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
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              Create an AI Avatar
            </p>
          </div>
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
