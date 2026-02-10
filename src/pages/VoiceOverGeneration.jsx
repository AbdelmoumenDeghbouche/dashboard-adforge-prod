import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { voiceAPI } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const VoiceOverGeneration = () => {
  const { currentUser } = useAuth();
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null); // Server URL for uploaded video
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedVoices, setRecommendedVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [detectedGender, setDetectedGender] = useState(null);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef(null);

  // Test phrase for voice preview
  const testPhrase = "This is an AdForge voice over test";

  // Handle video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file');
      return;
    }

    setUploadedVideo(file);
    const videoUrl = URL.createObjectURL(file);
    setVideoPreview(videoUrl);
    
    // Reset states
    setRecommendedVoices([]);
    setSelectedVoice(null);
    setUploadedVideoUrl(null);

    // Upload video to server
    setIsUploading(true);
    try {
      console.log('[VoiceChanger] Uploading video to server...');
      
      // Get auth token
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const token = await currentUser.getIdToken();
      
      const formData = new FormData();
      formData.append('video', file); // Backend expects 'video' not 'file'

      // Upload video using fetch (since we need FormData)
      const response = await fetch('http://localhost:8000/api/v1/voice/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[VoiceChanger] Video uploaded and analyzed:', data);
      
      if (data.video_url) {
        setUploadedVideoUrl(data.video_url);
      } else {
        throw new Error('No video URL returned from server');
      }

      // Get analysis from backend
      const analysis = data.analysis || {};
      const gender = analysis.detected_gender || analysis.gender;
      
      console.log('[VoiceChanger] Analysis:', {
        gender: gender,
        age: analysis.detected_age || analysis.age,
        style: analysis.style,
        vibe: analysis.vibe,
        confidence: analysis.confidence
      });

      // Store analysis for display
      setDetectedGender(gender);
      setVideoAnalysis(analysis);

      // Use voices from backend response, filtered by detected gender
      if (data.voices && Array.isArray(data.voices)) {
        console.log('[VoiceChanger] Got voice recommendations from upload:', data.voices.length);
        
        // Filter voices by detected gender
        let filteredVoices = data.voices;
        if (gender && gender !== 'neutral') {
          filteredVoices = data.voices.filter(voice => 
            voice.labels?.gender === gender
          );
          console.log(`[VoiceChanger] Filtered to ${gender} voices:`, filteredVoices.length);
        }
        
        // Transform backend response to match frontend structure
        const voices = filteredVoices.map(voice => ({
          id: voice.voice_id,
          voice_id: voice.voice_id,
          name: voice.name,
          gender: voice.labels?.gender || 'unknown',
          age: voice.labels?.age || 'adult',
          accent: voice.labels?.accent || 'american',
          style: voice.labels?.category || 'premade',
          category: voice.labels?.category || 'premade',
          description: voice.description || `${voice.labels?.gender || ''} ${voice.labels?.age || ''} ${voice.labels?.accent || ''} voice`,
          match_score: voice.match_score || 0,
          preview_url: voice.preview_url,
          custom_preview_url: voice.custom_preview_url,
          labels: voice.labels,
        }));

        setRecommendedVoices(voices);
        console.log(`[VoiceChanger] Set ${voices.length} ${gender || ''} voices`);
        
        if (voices.length === 0 && gender) {
          console.warn('[VoiceChanger] No matching voices found for gender:', gender);
          alert(`⚠️ No ${gender} voices found in recommendations.\n\nShowing all available voices instead.`);
          // Fallback to all voices if gender filter returns nothing
          const allVoices = data.voices.map(voice => ({
            id: voice.voice_id,
            voice_id: voice.voice_id,
            name: voice.name,
            gender: voice.labels?.gender || 'unknown',
            age: voice.labels?.age || 'adult',
            accent: voice.labels?.accent || 'american',
            style: voice.labels?.category || 'premade',
            category: voice.labels?.category || 'premade',
            description: voice.description || `${voice.labels?.gender || ''} ${voice.labels?.age || ''} ${voice.labels?.accent || ''} voice`,
            match_score: voice.match_score || 0,
            preview_url: voice.preview_url,
            custom_preview_url: voice.custom_preview_url,
            labels: voice.labels,
          }));
          setRecommendedVoices(allVoices);
        }
      }
    } catch (error) {
      console.error('[VoiceChanger] Error uploading video:', error);
      alert('Failed to upload video: ' + (error.message || 'Unknown error') + '\n\nYou can still get voice recommendations, but voice changing requires the video to be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };

  // Refresh voice recommendations (voices are now returned from upload endpoint)
  const handleRefreshVoices = () => {
    if (recommendedVoices.length > 0) {
      // Just show a message that voices are already loaded
      alert(`✅ ${recommendedVoices.length} voices already loaded!\n\nVoices are automatically analyzed when you upload a video.\n\nTo get new recommendations, upload a different video.`);
    } else {
      alert('⚠️ Please upload a video first.\n\nVoice recommendations are generated automatically during upload.');
    }
  };

  // Select voice
  const handleSelectVoice = (voice) => {
    setSelectedVoice(voice);
  };

  // Change voice in video
  const handleApplyVoiceOver = async () => {
    if (!selectedVoice) {
      alert('Please select a voice first');
      return;
    }

    if (!uploadedVideo || !videoPreview) {
      alert('Please upload a video with audio first');
      return;
    }

    if (!uploadedVideoUrl) {
      alert('⚠️ Video is still uploading or upload failed.\n\nPlease wait for the upload to complete or try uploading again.');
      return;
    }

    setIsApplying(true);
    try {
      console.log('[VoiceChanger] Changing voice in video to:', selectedVoice.name);
      console.log('[VoiceChanger] Using uploaded video URL:', uploadedVideoUrl);
      
      const payload = {
        video_url: uploadedVideoUrl, // Use the uploaded server URL
        voice_id: selectedVoice.voice_id || selectedVoice.id,
        stability: 0.55, // Recommended for natural consistency
        similarity_boost: 0.60, // Recommended for maintaining natural sound
        style: 0.15, // Subtle natural character
      };

      const response = await voiceAPI.changeVoice(payload);
      
      console.log('[VoiceChanger] Voice changed:', response);

      if (response.job_id) {
        alert(`🎙️ Voice transformation started!\n\nJob ID: ${response.job_id}\n\nYour video is being processed with the new voice. Check back in a few minutes.`);
      }
      
      if (response.video_url) {
        alert(`✅ Voice changed successfully!\n\n${selectedVoice.category !== 'premade' ? '(Auto-managed library)\n\n' : ''}Video: ${response.video_url}${response.audio_url ? `\nAudio: ${response.audio_url}` : ''}`);
        
        // Update video preview to show result
        setVideoPreview(response.video_url);
      }

    } catch (error) {
      console.error('[VoiceChanger] Error changing voice:', error);
      const errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('audio track')) {
        alert('⚠️ Video must have an audio track for voice changing.\n\nPlease upload a video with existing audio.');
      } else {
        alert('Failed to change voice: ' + errorMsg + '\n\nTry selecting a different voice.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Clear and reset
  const handleReset = () => {
    setUploadedVideo(null);
    setVideoPreview(null);
    setUploadedVideoUrl(null);
    setRecommendedVoices([]);
    setSelectedVoice(null);
    setDetectedGender(null);
    setVideoAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Voice Changer</h1>
          <p className="text-gray-400">Transform the voice in your video while preserving timing and acoustics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Video Upload & Preview */}
          <div className="space-y-6">
            {/* Video Upload */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Upload Video
              </h2>

              {!videoPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#262626] rounded-lg p-12 text-center hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-600 text-sm">MP4, MOV, AVI (max 500MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Upload Status */}
                  {isUploading && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading video to server...
                      </p>
                    </div>
                  )}
                  {!isUploading && uploadedVideoUrl && (
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <p className="text-green-300 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Video uploaded successfully! Ready to change voice.
                      </p>
                    </div>
                  )}
                  {!isUploading && !uploadedVideoUrl && uploadedVideo && (
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-300 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Video upload failed. You can get recommendations but can't change voice.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2 px-4 bg-[#0F0F0F] hover:bg-[#262626] text-gray-400 hover:text-white rounded-lg transition-all border border-[#262626]"
                    >
                      Change Video
                    </button>
                    <button
                      onClick={handleRefreshVoices}
                      disabled={!uploadedVideoUrl}
                      className="flex-1 py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      title={recommendedVoices.length > 0 ? `${recommendedVoices.length} voices loaded` : 'Voices loaded automatically on upload'}
                    >
                      {recommendedVoices.length > 0 ? `✓ ${recommendedVoices.length} Voices Loaded` : 'Voice Recommendations'}
                    </button>
                  </div>
                  
                  {/* Info banner */}
                  {videoPreview && (
                    <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-blue-300 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Voice will be transformed while preserving timing and acoustics
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Voice Summary */}
            {selectedVoice && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30 animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Selected Voice
                </h3>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedVoice.name}</p>
                    <p className="text-gray-400 text-sm mt-1">{selectedVoice.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {selectedVoice.gender}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {selectedVoice.accent}
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        {selectedVoice.match_score}% match
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleApplyVoiceOver}
                    disabled={isApplying}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplying ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Change Voice
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Voice Recommendations */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#262626]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Recommended Voices
            </h2>

            {/* Gender Detection Indicator */}
            {detectedGender && recommendedVoices.length > 0 && (
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-purple-300 text-sm">
                    Showing <span className="font-semibold capitalize">{detectedGender}</span> voices based on video analysis
                    {videoAnalysis?.detected_age && (
                      <span className="text-purple-400"> • {videoAnalysis.detected_age}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {recommendedVoices.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-gray-400">Upload a video to get AI-powered voice recommendations</p>
                <p className="text-gray-600 text-sm mt-2">Voices are analyzed and matched automatically using Gemini AI</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {recommendedVoices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedVoice?.id === voice.id
                        ? 'bg-purple-500/10 border-purple-500'
                        : 'bg-[#0F0F0F] border-[#262626] hover:border-purple-500/50'
                    }`}
                    onClick={() => handleSelectVoice(voice)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{voice.name}</h3>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                            {voice.match_score}% match
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{voice.description}</p>
                        
                        {/* Audio Preview */}
                        {(voice.custom_preview_url || voice.preview_url) && (
                          <div className="mt-2 mb-2" onClick={(e) => e.stopPropagation()}>
                            <p className="text-xs text-purple-400 mb-1">
                              {voice.custom_preview_url ? '🎙️ Preview: "This is an AdForge test audio"' : '🎙️ Voice Preview'}
                            </p>
                            <audio 
                              src={voice.custom_preview_url || voice.preview_url}
                              controls
                              className="w-full h-8"
                              style={{ maxWidth: '100%' }}
                              preload="metadata"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs capitalize">
                            {voice.gender}
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {voice.accent}
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs capitalize">
                            {voice.style}
                          </span>
                          {voice.category === 'premade' ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
                              Ready to use
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                              Auto-managed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedVoice?.id === voice.id && (
                      <div className="mt-3 pt-3 border-t border-purple-500/30">
                        <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Selected
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoiceOverGeneration;

