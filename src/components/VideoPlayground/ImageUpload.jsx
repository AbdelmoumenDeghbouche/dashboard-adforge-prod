import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { auth } from '../../config/firebase';

const ImageUpload = ({ imageUrl, setImageUrl, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const handleFileValidation = (file) => {
    if (!file) {
      setError('Aucun fichier sélectionné');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Fichier trop volumineux. Maximum 10MB.');
      return false;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format non supporté. Utilisez PNG, JPG ou WEBP.');
      return false;
    }

    setError('');
    return true;
  };

  const handleImageUpload = async (file) => {
    if (!handleFileValidation(file)) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Upload to Firebase Storage
      const storageRef = ref(
        storage,
        `users/${userId}/playground_images/${Date.now()}_${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload failed:', error);
          setError('Échec du téléchargement. Réessayez.');
          setUploading(false);
        },
        async () => {
          // Get download URL
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadUrl);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Une erreur est survenue. Réessayez.');
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          1. Upload Reference Image{' '}
          <span className="text-sm font-normal text-gray-400">(Optional)</span>
        </h3>
        {imageUrl && !uploading && (
          <button
            onClick={handleRemoveImage}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
            disabled={disabled}
          >
            Remove
          </button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-[#262626] bg-[#1A1A1A]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {/* Upload Area */}
        <div className="p-8">
          {!imageUrl && !uploading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-base text-white font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-white font-medium">Uploading...</p>
                <div className="mt-2 w-full max-w-xs mx-auto bg-[#0F0F0F] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {imageUrl && !uploading && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Reference"
                className="w-full h-64 object-contain rounded-lg"
              />
              <div className="absolute top-2 right-2">
                <div className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-2 text-red-400 text-sm">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

