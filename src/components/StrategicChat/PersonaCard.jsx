import React from 'react';

/**
 * PersonaCard Component
 * Displays a selectable persona card with details about the target audience
 */
const PersonaCard = ({ persona, selected, onSelect }) => {
  if (!persona) return null;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left transition-all duration-300 rounded-xl border-2 p-6 hover:scale-102 ${
        selected
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-[#262626] bg-[#1A1A1A] hover:border-purple-500/50 hover:bg-[#1F1F1F]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-1">
            {persona.label}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            persona.size?.includes('primary')
              ? 'bg-green-500/20 text-green-400'
              : persona.size?.includes('secondary')
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {persona.size || 'Target segment'}
          </span>
        </div>
        
        {/* Selection indicator */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? 'border-purple-500 bg-purple-500'
            : 'border-gray-600'
        }`}>
          {selected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Age & Gender */}
        <div className="flex items-center gap-4 text-sm">
          {persona.age_range && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Age:</span>
              <span className="text-white font-medium">{persona.age_range}</span>
            </div>
          )}
          {persona.gender && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Gender:</span>
              <span className="text-white font-medium capitalize">{persona.gender}</span>
            </div>
          )}
        </div>

        {/* Key Traits */}
        {persona.key_traits && persona.key_traits.length > 0 && (
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Key Traits
            </p>
            <div className="flex flex-wrap gap-2">
              {persona.key_traits.map((trait, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-md border border-purple-500/30"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pain Points */}
        {persona.pain_points && persona.pain_points.length > 0 && (
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Pain Points
            </p>
            <ul className="space-y-1">
              {persona.pain_points.slice(0, 3).map((pain, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="flex-1">{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Description */}
      {persona.description && (
        <p className="text-gray-400 text-sm leading-relaxed border-t border-[#262626] pt-4">
          {persona.description}
        </p>
      )}

      {/* Selection prompt */}
      {selected && (
        <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Selected for targeting</span>
        </div>
      )}
    </button>
  );
};

export default PersonaCard;

