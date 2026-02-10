import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Research Summary Card Component
 * Displays comprehensive research summary with collapsible sections
 * 
 * Sections:
 * - Key Pain Points
 * - Top Desires
 * - Market Insights
 * - Competitive Gaps
 * - Customer Profile (always visible in blue box)
 * - Offer Highlights (always visible)
 * - "Analyze Marketing Angles" action button
 * 
 * @param {Object} data - Research summary data
 * @param {Function} onAnalyzeClick - Handler for "Analyze Marketing Angles" button
 */
export default function ResearchSummaryCard({ data, onAnalyzeClick }) {
  const [expandedSection, setExpandedSection] = useState('pain_points');

  // Sections configuration
  const sections = [
    {
      id: 'pain_points',
      title: 'Key Pain Points',
      icon: '💔',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      items: data?.summary?.key_pain_points || []
    },
    {
      id: 'desires',
      title: 'Top Desires',
      icon: '✨',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      items: data?.summary?.top_desires || []
    },
    {
      id: 'insights',
      title: 'Market Insights',
      icon: '📊',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      items: data?.summary?.market_insights || []
    },
    {
      id: 'gaps',
      title: 'Competitive Gaps',
      icon: '🎯',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      items: data?.summary?.competitive_gaps || []
    }
  ];

  const customerProfile = data?.summary?.customer_profile || {};
  const offerHighlights = data?.summary?.offer_highlights || {};
  const nextSteps = data?.next_steps || [];

  return (
    <div className="bg-[#1A1A1A] border border-[#262626] rounded-2xl p-6 shadow-2xl max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[#262626]">
        <span className="text-4xl">📊</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Research Summary</h3>
          <p className="text-sm text-gray-400">
            Here's what I discovered about your market and customers
          </p>
          {data?.product_name && (
            <p className="text-xs text-purple-400 mt-1">
              Product: {data.product_name}
            </p>
          )}
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-3 mb-6">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`border rounded-lg overflow-hidden transition-colors ${
              expandedSection === section.id 
                ? section.borderColor 
                : 'border-[#262626]'
            }`}
          >
            {/* Section Header (Collapsible) */}
            <button
              onClick={() => setExpandedSection(
                expandedSection === section.id ? null : section.id
              )}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#262626]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <span className="font-medium text-white text-sm">{section.title}</span>
                <span className="text-xs text-gray-500 bg-[#262626] px-2 py-0.5 rounded-full">
                  {section.items.length}
                </span>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Section Content */}
            {expandedSection === section.id && (
              <div className={`px-4 py-4 ${section.bgColor} border-t ${section.borderColor}`}>
                <ul className="space-y-2.5">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex gap-3">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Customer Profile - Always Visible in Blue Box */}
      <div className="mb-6 p-5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="font-semibold text-white text-base mb-5 flex items-center gap-2">
          <span className="text-xl">👤</span>
          <span>Customer Profile</span>
        </h4>
        
        {/* DEMOGRAPHICS SECTION */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📊</span>
            <h5 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Demographics</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Age Range:</span>
              <span className="text-white text-sm font-medium">{customerProfile.age_range || 'N/A'}</span>
            </div>
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Gender Distribution:</span>
              <span className="text-white text-sm font-medium">{customerProfile.gender_distribution || 'N/A'}</span>
            </div>
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Location:</span>
              <span className="text-white text-sm font-medium">{customerProfile.location || 'N/A'}</span>
            </div>
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Income Level:</span>
              <span className="text-white text-sm font-medium">{customerProfile.income_level || 'N/A'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 mt-3">
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Professional Backgrounds:</span>
              <p className="text-white text-sm">{customerProfile.professional_backgrounds || 'N/A'}</p>
            </div>
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1">Typical Identities:</span>
              <p className="text-white text-sm">{customerProfile.typical_identities || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* PSYCHOGRAPHICS SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🧠</span>
            <h5 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">Psychographics</h5>
          </div>
          <div className="space-y-3">
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1 flex items-center gap-1">
                <span>💡</span>
                <span>Primary Motivation:</span>
              </span>
              <p className="text-white text-sm">{customerProfile.primary_motivation || 'N/A'}</p>
            </div>
            <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
              <span className="text-gray-500 text-xs block mb-1 flex items-center gap-1">
                <span>😤</span>
                <span>Core Frustration:</span>
              </span>
              <p className="text-white text-sm">{customerProfile.core_frustration || 'N/A'}</p>
            </div>
            {customerProfile.decision_factors && customerProfile.decision_factors.length > 0 && (
              <div className="bg-[#1A1A1A]/50 p-3 rounded-lg">
                <span className="text-gray-500 text-xs block mb-2 flex items-center gap-1">
                  <span>✅</span>
                  <span>Decision Factors:</span>
                </span>
                <ul className="space-y-1.5">
                  {customerProfile.decision_factors.map((factor, idx) => (
                    <li key={idx} className="text-white text-sm flex gap-2">
                      <span className="text-purple-400">•</span>
                      <span className="flex-1">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Highlights - Always Visible */}
      {(offerHighlights.unique_mechanism || offerHighlights.key_differentiator) && (
        <div className="mb-6 p-5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <h4 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span>Offer Highlights</span>
          </h4>
          <div className="space-y-3 text-sm">
            {offerHighlights.unique_mechanism && (
              <div>
                <span className="text-gray-500 block mb-1">Unique Mechanism:</span>
                <p className="text-white">{offerHighlights.unique_mechanism}</p>
              </div>
            )}
            {offerHighlights.key_differentiator && (
              <div>
                <span className="text-gray-500 block mb-1">Key Differentiator:</span>
                <p className="text-white">{offerHighlights.key_differentiator}</p>
              </div>
            )}
            {offerHighlights.pricing_position && (
              <div>
                <span className="text-gray-500 block mb-1">Pricing Position:</span>
                <p className="text-white">{offerHighlights.pricing_position}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="mb-6 p-4 bg-[#262626] rounded-lg">
          <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Recommended Next Steps</span>
          </h4>
          <ul className="space-y-2">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="text-xs text-gray-400 flex gap-2">
                <span className="text-green-400">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-6 border-t border-[#262626]">
        <p className="text-sm text-gray-400 mb-4">
          Ready to identify the best marketing angles for this product?
        </p>
        <button 
          onClick={onAnalyzeClick}
          disabled={!onAnalyzeClick}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] font-semibold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">🎯</span>
          <span>Analyze Marketing Angles</span>
        </button>
      </div>
    </div>
  );
}

