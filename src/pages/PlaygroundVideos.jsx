import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { videoPlaygroundAPI } from '../services/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PlaygroundVideos = () => {
  const { currentUser } = useAuth();

  // State
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;

  // 🔒 Proxy video URLs through backend for CORS-free, authenticated streaming
  const getProxyVideoUrl = (videoUrl) => {
    if (!videoUrl) return '';
    return `/api/v1/video-playground/proxy/download?url=${encodeURIComponent(videoUrl)}`;
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [videos, debouncedSearchQuery, sortBy]);

  const fetchVideos = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await videoPlaygroundAPI.getAllVideos(100, 'all');

      if (response.success) {
        const videos = response.data.videos || [];
        console.log('[PlaygroundVideos] Fetched videos:', videos.length);
        console.log('[PlaygroundVideos] First video sample:', videos[0]);
        console.log('[PlaygroundVideos] Thumbnails present:', videos.filter(v => v.thumbnail_url).length);
        setVideos(videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Only show playground videos (not product videos)
    let filtered = videos.filter(v => v.type === 'playground' || !v.product_id);

    // Search filter (debounced)
    if (debouncedSearchQuery) {
      filtered = filtered.filter(v =>
        v.original_prompt?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredVideos(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleVideoClick = (video) => {
    console.log('[PlaygroundVideos] Video clicked:', {
      has_thumbnail_url: !!video.thumbnail_url,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url
    });
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleDownload = async (videoUrl, videoId) => {
    try {
      console.log('[Download] Starting download for:', videoUrl);
      
      // Get auth token
      const token = await currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Use proxy URL for CORS-free download
      const proxyUrl = getProxyVideoUrl(videoUrl);
      console.log('[Download] Proxy URL:', proxyUrl);
      console.log('[Download] Auth token:', token?.substring(0, 20) + '...');
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('[Download] Response status:', response.status, response.statusText);
      console.log('[Download] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Download] Backend error:', errorText);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('[Download] Blob size:', blob.size, 'bytes, type:', blob.type);
      
      // Check if blob is too small (likely an error)
      if (blob.size < 10000) { // Videos should be larger than 10KB
        console.error('[Download] Blob too small, likely an error response');
        const textContent = await blob.text();
        console.error('[Download] Response content:', textContent.substring(0, 500));
        throw new Error('Downloaded file is too small. Backend returned HTML instead of video.');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${videoId}_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('[Download] Download completed successfully');
    } catch (error) {
      console.error('[Download] Download failed:', error);
      alert(`Failed to download video: ${error.message}`);
    }
  };

  // Pagination
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-[#0F0F0F]">
      {/* Header Section */}
      <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Video Library</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by prompt or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-4 pr-10 py-3 bg-[#0F0F0F] border border-[#262626] rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
            <p className="text-gray-400">
              You haven't created any playground videos yet. Switch to the Video Playground tab to create your first video!
            </p>
          </div>
        ) : (
          <>
            {/* Video Grid - Optimized with transform for smooth scrolling */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              style={{ willChange: 'transform' }}
            >
              {currentVideos.map((video) => (
                <VideoCard
                  key={video.job_id || video.id}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                  onDownload={() => handleDownload(video.video_url, video.job_id || video.id)}
                  getProxyVideoUrl={getProxyVideoUrl}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentPage === i + 1
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#1A1A1A] border border-[#262626] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          onDownload={() => handleDownload(selectedVideo.video_url, selectedVideo.job_id || selectedVideo.id)}
        />
      )}
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, onClick, onDownload, getProxyVideoUrl }) => {
  return (
    <div className="group relative bg-[#1A1A1A] border border-[#262626] rounded-xl overflow-hidden hover:border-purple-500 transition-all cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden" onClick={onClick}>
        {video.thumbnail_url ? (
          // Use backend-generated thumbnail (direct URL - no proxy needed for images)
          <img
            src={video.thumbnail_url}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            onLoad={() => console.log('[Thumbnail] Image loaded:', video.thumbnail_url)}
            onError={(e) => console.error('[Thumbnail] Image failed:', video.thumbnail_url, e)}
          />
        ) : video.video_url ? (
          // Fallback: Use proxied video for first frame (CORS-free!)
          <video
            src={getProxyVideoUrl(video.video_url)}
            poster={video.thumbnail_url}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center pointer-events-none">
          <svg className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-purple-500/90 backdrop-blur-sm text-white shadow-lg">
            Playground
          </span>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-3 right-3">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white font-medium shadow-lg">
              {video.duration}s
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3 bg-[#1A1A1A]">
        {/* Prompt */}
        <p className="text-sm text-gray-300 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {video.original_prompt || 'No description available'}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#262626]">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Ratio</p>
            <p className="text-xs font-semibold text-white">{video.aspect_ratio || '9:16'}</p>
          </div>
          <div className="text-center border-x border-[#262626]">
            <p className="text-xs text-gray-500 mb-1">Platform</p>
            <p className="text-xs font-semibold text-white capitalize">{video.platform || 'TikTok'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Provider</p>
            <p className="text-xs font-semibold text-white">{video.provider === 'openai' ? 'OpenAI' : 'KIE'}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {video.created_at ? new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Watch</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="flex items-center justify-center px-4 py-2.5 bg-[#0F0F0F] border border-[#262626] rounded-lg hover:border-purple-500 hover:bg-[#1A1A1A] transition-all"
            title="Download"
          >
            <svg className="w-5 h-5 text-gray-400 hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Optimized Video Modal Component
const VideoModal = ({ video, onClose, onDownload }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = React.useRef(null);

  // Try direct URL first (Firebase Storage has CORS), use proxy as fallback
  React.useEffect(() => {
    let blobUrl = null;

    const loadVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try direct URL first for better performance (streaming)
        console.log('[VideoModal] Trying direct video URL...');
        setVideoBlobUrl(video.video_url);
        setIsLoading(false);
        
      } catch (err) {
        console.error('[VideoModal] Error loading video:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadVideo();

    // Cleanup blob URL on unmount (if we created one)
    return () => {
      if (blobUrl) {
        console.log('[VideoModal] Cleaning up blob URL');
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [video.video_url]);

  // Handle video load
  const handleVideoLoad = () => {
    console.log('[VideoModal] Video loaded and ready to play');
  };

  // Keyboard escape handler
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-[#1A1A1A] rounded-xl border border-[#262626] max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <h3 className="text-xl font-bold text-white">Video Player</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#262626] rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6 space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-sm">Loading video...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white text-sm font-semibold mb-2">Failed to load video</p>
                  <p className="text-gray-400 text-xs">{error}</p>
                </div>
              </div>
            )}
            {videoBlobUrl && (
              <video
                ref={videoRef}
                src={videoBlobUrl}
                controls
                className="w-full max-h-[70vh] rounded-lg object-contain mx-auto"
                preload="metadata"
                playsInline
                onLoadedData={handleVideoLoad}
                onCanPlay={handleVideoLoad}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {/* Prompt */}
            {video.original_prompt && (
              <div>
                <label className="text-sm font-medium text-gray-400">Original Prompt:</label>
                <p className="text-white mt-1">{video.original_prompt}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0F0F0F] border border-[#262626] rounded-lg">
              <div>
                <div className="text-xs text-gray-400">Duration</div>
                <div className="text-sm font-semibold text-white mt-1">{video.duration || 'N/A'}s</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Aspect Ratio</div>
                <div className="text-sm font-semibold text-white mt-1">{video.aspect_ratio || '9:16'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Platform</div>
                <div className="text-sm font-semibold text-white mt-1 capitalize">{video.platform || 'TikTok'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Provider</div>
                <div className="text-sm font-semibold text-white mt-1">{video.provider === 'openai' ? 'OpenAI Sora' : 'KIE'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onDownload}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Video</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#0F0F0F] border border-[#262626] text-white font-semibold rounded-xl hover:border-purple-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundVideos;

