import { Play } from 'lucide-react';

/**
 * Creative Card Component
 * Displays a creative variation (proof, fear, desire) with hook, script, CTA, and scores
 * 
 * Features:
 * - Trigger-specific icon and label
 * - Overall creative score
 * - Hook display
 * - Script preview (first 150 chars)
 * - CTA display
 * - 4 score breakdowns (hook, mechanism, believability, CTA)
 * - Generate Video button
 */
export default function CreativeCard({ creative, variationId, onSelect }) {
  // Trigger configuration (proof, fear, desire)
  const triggerConfig = {
    proof: {
      icon: '📊',
      label: 'Social Proof',
      color: 'blue',
      gradient: 'from-blue-600 to-blue-700'
    },
    fear: {
      icon: '⚠️',
      label: 'Loss Aversion',
      color: 'orange',
      gradient: 'from-orange-600 to-red-600'
    },
    desire: {
      icon: '✨',
      label: 'Aspiration',
      color: 'purple',
      gradient: 'from-purple-600 to-pink-600'
    }
  };

  const config = triggerConfig[variationId] || triggerConfig.proof;

  // Get color for score
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="bg-[#1A1A1A] border-2 border-[#262626] rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 group h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{config.icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">{config.label}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span>Overall Score:</span>
            <span className={`font-bold ${getScoreColor(creative.creative_score?.overall_score ?? creative.creative_score?.total_score ?? 0)}`}>
              {(creative.creative_score?.overall_score ?? creative.creative_score?.total_score ?? 0).toFixed(1)}/10
            </span>
          </div>
        </div>
      </div>

      {/* Hook */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1.5">Hook:</p>
        <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {creative.hook}
        </p>
      </div>

      {/* Script Preview */}
      <div className="mb-4 flex-1">
        <p className="text-xs text-gray-500 mb-1.5">Script Preview:</p>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
          {creative.script}
        </p>
      </div>

      {/* CTA */}
      <div className="mb-4 p-3 bg-[#262626] rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Call to Action:</p>
        <p className="text-xs font-medium text-white">
          {creative.cta}
        </p>
      </div>

      {/* Visual Direction (if available) */}
      {creative.visual_direction && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Visual Direction:</p>
          <p className="text-xs text-purple-300 line-clamp-2">
            {creative.visual_direction}
          </p>
        </div>
      )}

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="flex justify-between items-center bg-[#262626] px-2 py-1.5 rounded">
          <span className="text-gray-500">Hook:</span>
          <span className={`font-bold ${getScoreColor(creative.creative_score?.hook_strength ?? 0)}`}>
            {(creative.creative_score?.hook_strength ?? 0).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#262626] px-2 py-1.5 rounded">
          <span className="text-gray-500">Mechanism:</span>
          <span className={`font-bold ${getScoreColor(creative.creative_score?.mechanism_clarity ?? creative.creative_score?.clarity ?? 0)}`}>
            {(creative.creative_score?.mechanism_clarity ?? creative.creative_score?.clarity ?? 0).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#262626] px-2 py-1.5 rounded">
          <span className="text-gray-500">Believability:</span>
          <span className={`font-bold ${getScoreColor(creative.creative_score?.believability ?? creative.creative_score?.proof_credibility ?? 0)}`}>
            {(creative.creative_score?.believability ?? creative.creative_score?.proof_credibility ?? 0).toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#262626] px-2 py-1.5 rounded">
          <span className="text-gray-500">CTA:</span>
          <span className={`font-bold ${getScoreColor(creative.creative_score?.cta_strength ?? creative.creative_score?.cta_friction ?? 0)}`}>
            {(creative.creative_score?.cta_strength ?? creative.creative_score?.cta_friction ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Generate Video Button */}
      <button 
        onClick={onSelect}
        className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold text-sm shadow-lg mt-auto`}
      >
        <Play className="w-4 h-4" />
        <span>Generate Video</span>
      </button>

      {/* Note about hardcoded values (hidden, for developer reference) */}
      {/* ⚠️ CRITICAL: When this button is clicked, the video generation will use:
          - video_style: "perfect_ugc_hybrid" (Kling + Sora hybrid)
          - ai_model: "claude"
          These are HARDCODED in strategicAnalysisAPI.generateVideo() */}
    </div>
  );
}

