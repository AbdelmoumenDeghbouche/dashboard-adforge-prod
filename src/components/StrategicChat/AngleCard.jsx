import { useState } from 'react';
import { Star, TrendingUp, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Angle Card Component
 * Displays a marketing angle with scores and rationale
 * 
 * Features:
 * - Rank display
 * - Overall score badge with star icon
 * - 3 score types with color coding (urgency, believability, differentiation)
 * - Collapsible rationale section
 * - Selection button
 */
export default function AngleCard({ angle, onSelect }) {
  const [showRationale, setShowRationale] = useState(false);

  // Score color coding
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-green-500/10';
    if (score >= 6) return 'bg-yellow-500/10';
    return 'bg-orange-500/10';
  };

  return (
    <div className="bg-[#1A1A1A] border-2 border-[#262626] rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-lg">Angle #{angle.rank}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {angle.awareness_level}
              </span>
            </div>
          </div>
        </div>
        
        {/* Overall Score Badge */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
          <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
          <span className="text-base font-bold text-purple-400">
            {(angle.overall_score ?? angle.total_score ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Angle Name */}
      <h5 className="font-semibold text-white text-base mb-2">
        {angle.angle_name}
      </h5>

      {/* Angle Description */}
      <p className="text-sm text-gray-400 mb-5 leading-relaxed line-clamp-3">
        {angle.angle_description}
      </p>

      {/* Scores Grid with Color Coding */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Emotional Density - Orange */}
        <div className={`text-center p-3 rounded-lg ${getScoreBg(angle.score_breakdown?.emotional_density ?? 0)} border border-orange-500/20`}>
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Emotion</span>
          </div>
          <div className={`font-bold text-lg ${getScoreColor(angle.score_breakdown?.emotional_density ?? 0)}`}>
            {(angle.score_breakdown?.emotional_density ?? 0).toFixed(1)}
          </div>
        </div>

        {/* Proof Availability - Green */}
        <div className={`text-center p-3 rounded-lg ${getScoreBg(angle.score_breakdown?.proof_availability ?? 0)} border border-green-500/20`}>
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Proof</span>
          </div>
          <div className={`font-bold text-lg ${getScoreColor(angle.score_breakdown?.proof_availability ?? 0)}`}>
            {(angle.score_breakdown?.proof_availability ?? 0).toFixed(1)}
          </div>
        </div>

        {/* Differentiation Score - Purple */}
        <div className={`text-center p-3 rounded-lg ${getScoreBg(angle.score_breakdown?.differentiation ?? 0)} border border-purple-500/20`}>
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
            <Star className="w-3 h-3" />
            <span>Differentiation</span>
          </div>
          <div className={`font-bold text-lg ${getScoreColor(angle.score_breakdown?.differentiation ?? 0)}`}>
            {(angle.score_breakdown?.differentiation ?? 0).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Rationale - Collapsible */}
      <div className="mb-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowRationale(!showRationale);
          }}
          className="w-full text-left px-4 py-2 bg-[#262626] hover:bg-[#2A2A2A] rounded-lg transition-colors flex items-center justify-between"
        >
          <span className="text-xs font-medium text-gray-400">
            Why this angle works
          </span>
          {showRationale ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {showRationale && (
          <div className="mt-2 px-4 py-3 bg-[#262626] rounded-lg border-l-2 border-purple-500">
            <p className="text-xs text-gray-300 leading-relaxed">
              {angle.rationale}
            </p>
          </div>
        )}
      </div>

      {/* Select Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold text-sm shadow-lg group-hover:shadow-purple-500/50"
      >
        <CheckCircle className="w-4 h-4" />
        <span>Select This Angle</span>
      </button>
    </div>
  );
}

