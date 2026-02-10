import { Download, Share2, Sparkles } from 'lucide-react';

/**
 * Video Preview Card Component
 * Displays the final generated video with player and action buttons
 * 
 * Features:
 * - HTML5 video player with controls
 * - Video info (style, duration)
 * - Download button
 * - Share button (copy link)
 * - "Generate Another Video" button
 * - Success celebration UI
 */
export default function VideoPreviewCard({ videoData }) {
  const videoUrl = videoData?.video_url;
  const duration = videoData?.duration;
  const scenes = videoData?.scenes;

  const handleDownload = () => {
    if (!videoUrl) return;
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `strategic-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!videoUrl) return;
    
    try {
      if (navigator.share) {
        // Use native share if available
        await navigator.share({
          title: 'Strategic Video',
          text: 'Check out this AI-generated video!',
          url: videoUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(videoUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: just copy to clipboard
      try {
        await navigator.clipboard.writeText(videoUrl);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        alert('Could not share video. URL: ' + videoUrl);
      }
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#262626] rounded-2xl p-6 shadow-2xl max-w-3xl">
      {/* Header with Success Animation */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#262626]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-3xl">🎬</span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Your Video is Ready!
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </h3>
          <p className="text-sm text-gray-400">
            Perfect UGC Hybrid style{duration && ` • ${Math.round(duration)} seconds`}
            {scenes && ` • ${scenes} scenes`}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            ⚠️ Generated with Kling Talking Head + Sora B-Roll overlay
          </p>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black mb-6 shadow-2xl">
        <video 
          src={videoUrl}
          controls
          className="w-full"
          poster="/video-thumbnail.jpg"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#262626] p-3 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-1">Style</p>
          <p className="text-sm font-semibold text-white">UGC Hybrid</p>
        </div>
        {duration && (
          <div className="bg-[#262626] p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Duration</p>
            <p className="text-sm font-semibold text-white">{Math.round(duration)}s</p>
          </div>
        )}
        {scenes && (
          <div className="bg-[#262626] p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500 mb-1">Scenes</p>
            <p className="text-sm font-semibold text-white">{scenes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button 
          onClick={handleDownload}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold text-sm shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download Video</span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex-1 bg-[#262626] hover:bg-[#2A2A2A] text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold text-sm border border-[#3A3A3A]"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Generate Another Video */}
      <div className="pt-4 border-t border-[#262626]">
        <p className="text-xs text-gray-500 text-center mb-3">
          Want to try a different creative variation?
        </p>
        <button 
          onClick={() => window.location.reload()} // Simple reload - in production you'd handle this better
          className="w-full text-sm text-purple-400 hover:text-purple-300 py-2 transition-colors"
        >
          Generate Another Video →
        </button>
      </div>

      {/* Success Message */}
      <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm text-green-300 font-medium mb-1">Video Successfully Generated!</p>
            <p className="text-xs text-gray-400">
              Your strategic video has been created using AI-powered hybrid technology. 
              Download it now and use it in your marketing campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

