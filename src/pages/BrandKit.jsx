import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useBrand } from '../contexts/BrandContext';
import { getFirebaseImageUrl } from '../utils/storageHelpers';

const BrandKit = () => {
  const { selectedBrand, updateBrand } = useBrand();
  const [isEditingColors, setIsEditingColors] = useState(false);
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Color editor state
  const [primaryColor, setPrimaryColor] = useState(selectedBrand?.primaryColor || '#7C3AED');
  const [secondaryColor, setSecondaryColor] = useState(selectedBrand?.secondaryColor || '#3B82F6');
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Update colors when brand changes
  React.useEffect(() => {
    if (selectedBrand) {
      setPrimaryColor(selectedBrand.primaryColor || '#7C3AED');
      setSecondaryColor(selectedBrand.secondaryColor || '#3B82F6');
    }
  }, [selectedBrand]);

  const handleSaveColors = async () => {
    if (!selectedBrand) {
      setErrorMessage('Aucune marque sélectionnée');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await updateBrand(selectedBrand.brandId, {
        primaryColor,
        secondaryColor
      });
      setSuccessMessage('Couleurs mises à jour avec succès');
      setIsEditingColors(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating colors:', error);
      setErrorMessage('Erreur lors de la mise à jour des couleurs');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedBrand || !logoFile) {
      setErrorMessage('Veuillez sélectionner un logo');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', logoFile);

      await updateBrand(selectedBrand.brandId, formData);
      setSuccessMessage('Logo mis à jour avec succès');
      setIsEditingLogo(false);
      setLogoFile(null);
      setLogoPreview(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating logo:', error);
      setErrorMessage('Erreur lors de la mise à jour du logo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedBrand) {
    return (
      <DashboardLayout>
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full">
          <div className="max-w-4xl">
            <div className="bg-[#1A1A1A] rounded-xl p-8 border border-gray-800/50 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-white text-xl font-semibold mb-2">Aucune marque sélectionnée</h3>
              <p className="text-gray-400">Veuillez sélectionner une marque pour gérer son identité visuelle</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-[#0F0F0F] min-h-full">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-white text-3xl sm:text-4xl font-bold mb-2">Personnalisation & Brand Kit</h1>
            <p className="text-gray-400 text-lg mb-2">
              Configurez l'identité visuelle de <span className="text-white font-semibold">{selectedBrand.brandName}</span>
            </p>
            {selectedBrand.domain && (
              <p className="text-gray-500 text-sm">
                {selectedBrand.domain}
              </p>
            )}
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400">{errorMessage}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Colors */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">Couleurs de marque</h3>
                {!isEditingColors && (
                  <button
                    onClick={() => setIsEditingColors(true)}
                    className="text-purple-500 hover:text-purple-400 text-sm font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>
              
              {isEditingColors ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Couleur Primaire</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-16 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-[#0F0F0F] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                        placeholder="#7C3AED"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Couleur Secondaire</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-16 h-16 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 bg-[#0F0F0F] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveColors}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingColors(false);
                        setPrimaryColor(selectedBrand.primaryColor || '#7C3AED');
                        setSecondaryColor(selectedBrand.secondaryColor || '#3B82F6');
                      }}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-3 mb-4">
                    <div
                      className="w-20 h-20 rounded-xl shadow-lg border-2 border-gray-700"
                      style={{ backgroundColor: selectedBrand.primaryColor || '#7C3AED' }}
                      title={`Primaire: ${selectedBrand.primaryColor || '#7C3AED'}`}
                    ></div>
                    <div
                      className="w-20 h-20 rounded-xl shadow-lg border-2 border-gray-700"
                      style={{ backgroundColor: selectedBrand.secondaryColor || '#3B82F6' }}
                      title={`Secondaire: ${selectedBrand.secondaryColor || '#3B82F6'}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Primaire: <span className="text-gray-400 font-mono">{selectedBrand.primaryColor || '#7C3AED'}</span></p>
                    <p>Secondaire: <span className="text-gray-400 font-mono">{selectedBrand.secondaryColor || '#3B82F6'}</span></p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Brand Logo */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">Logo</h3>
                {!isEditingLogo && (
                  <button
                    onClick={() => setIsEditingLogo(true)}
                    className="text-purple-500 hover:text-purple-400 text-sm font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>
              
              {isEditingLogo ? (
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-600">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-4 bg-white rounded" />
                    ) : (selectedBrand.customLogoUrl || selectedBrand.logoUrl) ? (
                      <img 
                        src={getFirebaseImageUrl(selectedBrand.customLogoUrl || selectedBrand.logoUrl)} 
                        alt={selectedBrand.brandName} 
                        className="max-w-full max-h-full object-contain p-4 bg-white rounded"
                        onLoad={() => console.log('[BrandKit] Logo loaded successfully')}
                        onError={(e) => {
                          console.error('[BrandKit] Failed to load brand logo:', selectedBrand.customLogoUrl || selectedBrand.logoUrl);
                          e.target.parentElement.innerHTML = `<div class="text-gray-400 text-center">Logo introuvable</div>`;
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div 
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-2"
                          style={{ backgroundColor: selectedBrand.primaryColor || '#7C3AED' }}
                        >
                          {selectedBrand.brandName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-500 text-sm">Aucun logo</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="block w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-center font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Choisir un fichier
                  </label>
                  
                  {logoFile && (
                    <p className="text-sm text-gray-400 truncate">
                      📁 {logoFile.name}
                    </p>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveLogo}
                      disabled={isSaving || !logoFile}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Upload...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingLogo(false);
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      disabled={isSaving}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-full h-32 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                    {(selectedBrand.customLogoUrl || selectedBrand.logoUrl) ? (
                      <img 
                        src={getFirebaseImageUrl(selectedBrand.customLogoUrl || selectedBrand.logoUrl)} 
                        alt={selectedBrand.brandName} 
                        className="max-w-full max-h-full object-contain p-4 bg-white rounded"
                        onLoad={() => console.log('[BrandKit] Current logo loaded')}
                        onError={(e) => {
                          console.error('[BrandKit] Failed to load current logo:', selectedBrand.customLogoUrl || selectedBrand.logoUrl);
                          e.target.parentElement.innerHTML = `<div class="text-gray-400 text-center">Logo introuvable</div>`;
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div 
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-2"
                          style={{ backgroundColor: selectedBrand.primaryColor || '#7C3AED' }}
                        >
                          {selectedBrand.brandName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-500 text-sm">Aucun logo</p>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {(selectedBrand.customLogoUrl || selectedBrand.logoUrl) ? 'Logo actuel' : 'Aucun logo téléchargé'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Typography (Static for now) */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800/50">
              <h3 className="text-white text-xl font-semibold mb-4">Typographie</h3>
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Titre</p>
                  <p className="text-white text-xl font-bold">Poppins Bold</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Corps de texte</p>
                  <p className="text-white">Inter Regular</p>
                </div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <p className="text-purple-400 text-xs">
                  💡 La personnalisation des polices sera bientôt disponible
                </p>
              </div>
            </div>
          </div>
          
          {/* Brand Info Card */}
          <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-white text-lg font-semibold mb-4">Informations de la marque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Nom de la marque</p>
                <p className="text-white font-medium">{selectedBrand.brandName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">ID de la marque</p>
                <p className="text-white font-mono text-sm">{selectedBrand.brandId}</p>
              </div>
              {selectedBrand.domain && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Domaine</p>
                  <p className="text-white">{selectedBrand.domain}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm mb-1">Créé le</p>
                <p className="text-white">
                  {selectedBrand.created_at ? new Date(selectedBrand.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrandKit;

