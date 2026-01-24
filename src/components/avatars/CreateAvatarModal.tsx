import React, { useState } from 'react';

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAvatarModal: React.FC<CreateAvatarModalProps> = ({ isOpen, onClose }) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setUploadedImages(prev => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = uploadedImages.length >= 3 && description.trim().length > 0;
  const needsMoreImages = uploadedImages.length < 3;

  const handleCreateAvatar = () => {
    if (isFormValid) {
      console.log('Creating avatar with:', { images: uploadedImages, description });
      setUploadedImages([]);
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with Strong Blur */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white shadow-2xl relative flex flex-col max-w-full"
          style={{
            width: 'min(794px, 55vw)',
            maxWidth: '90vw',
            minHeight: 'min(500px, 48vh)',
            maxHeight: '90vh',
            borderRadius: 'min(40px, 2.78vw)',
            padding: 'min(36px, 2.5vw)',
            gap: 'min(20px, 1.39vw)',
            opacity: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Create an AI Avatar</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Vertical Layout */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Image Gallery - Horizontal scrollable */}
            <div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Uploaded images */}
                {uploadedImages.map((imageUrl, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden border-2 border-gray-300 bg-gray-50">
                      <img 
                        src={imageUrl} 
                        alt={`Avatar ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Upload box */}
                <label
                  htmlFor="avatar-upload"
                  className="relative flex-shrink-0 block w-[120px] h-[120px] rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Description Textarea - Bottom (takes remaining space) */}
            <div className="flex-1 min-h-[200px]">
              {/* Textarea with buttons overlay */}
              <div className="h-full relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your AI Avatar..."
                  className="w-full h-full p-4 pb-14 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm text-text-primary placeholder:text-gray-400 min-h-[200px]"
                />
                
                {/* Buttons overlay - inside textarea */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  {/* Upload button - left */}
                  <label
                    htmlFor="avatar-upload-btn"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-text-secondary border border-gray-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload a file
                    <input
                      id="avatar-upload-btn"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* Create button - right */}
                  <button
                    onClick={handleCreateAvatar}
                    disabled={!isFormValid}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                      isFormValid
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                  >
                    Create an AI avatar
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Warning message if less than 3 images - moved here */}
            {needsMoreImages && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>You need at least 3 pictures to continue ({uploadedImages.length}/3)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAvatarModal;
