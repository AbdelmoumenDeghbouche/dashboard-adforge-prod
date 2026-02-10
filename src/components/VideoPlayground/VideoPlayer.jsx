import { useState } from 'react';

const VideoPlayer = ({ videoUrl, videoData, onGenerateAnother }) => {
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = async () => {
    if (!videoUrl) return;

    setDownloadingVideo(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playground_video_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download video. Please try again.');
    } finally {
      setDownloadingVideo(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Generated Video',
          text: 'Check out this video I created!',
          url: videoUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">✅ Video Ready!</h3>
          <p className="text-sm text-gray-400">
            Your UGC-style video has been generated
          </p>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          src={videoUrl}
          controls
          className="w-full max-h-[600px] object-contain"
          playsInline
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      {videoData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0F0F0F] border border-[#262626] rounded-lg">
          <div>
            <div className="text-xs text-gray-400">Duration</div>
            <div className="text-sm font-semibold text-white mt-1">
              {videoData.duration || 'N/A'}s
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Aspect Ratio</div>
            <div className="text-sm font-semibold text-white mt-1">
              {videoData.aspect_ratio || '9:16'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Platform</div>
            <div className="text-sm font-semibold text-white mt-1 capitalize">
              {videoData.platform || 'TikTok'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Provider</div>
            <div className="text-sm font-semibold text-white mt-1">
              {videoData.provider === 'openai' ? 'OpenAI Sora' : 'KIE'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownload}
          disabled={downloadingVideo}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloadingVideo ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download Video</span>
            </>
          )}
        </button>

        <button
          onClick={onGenerateAnother}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0F0F0F] border border-[#262626] text-white font-semibold rounded-xl hover:border-purple-500/50 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Generate Another</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0F0F0F] border border-[#262626] text-white font-semibold rounded-xl hover:border-purple-500/50 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Video URL */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">Video URL:</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={videoUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg text-sm text-gray-400 focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-[#0F0F0F] border border-[#262626] rounded-lg hover:border-purple-500/50 transition-colors"
            title="Copy link"
          >
            {copySuccess ? (
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      <div className="flex items-start space-x-3 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <svg
          className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <p className="text-sm text-green-300 font-medium">
            Your video has been saved!
          </p>
          <p className="text-xs text-green-400/80 mt-1">
            Download it now or access it later from your video library.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

