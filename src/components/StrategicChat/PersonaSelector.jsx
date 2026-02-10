import React, { useState, useEffect } from 'react';
import PersonaCard from './PersonaCard';

/**
 * PersonaSelector Component
 * Allows users to select a target persona after research completes
 */
const PersonaSelector = ({ personas = [], onSelect, onSkip, isLoading = false }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);

  // Auto-select first persona by default
  useEffect(() => {
    if (personas.length > 0 && !selectedPersonaId) {
      console.log('[PersonaSelector] Auto-selecting first persona:', personas[0].id);
      setSelectedPersonaId(personas[0].id);
    }
  }, [personas, selectedPersonaId]);

  const handleContinue = () => {
    console.log('[PersonaSelector] 🔘 Continue button clicked');
    console.log('[PersonaSelector] selectedPersonaId:', selectedPersonaId);
    console.log('[PersonaSelector] onSelect function exists?', !!onSelect);
    console.log('[PersonaSelector] personas array:', personas);
    
    if (!onSelect) {
      console.error('[PersonaSelector] ❌ onSelect callback is missing!');
      return;
    }
    
    if (selectedPersonaId) {
      // Handle "All Customers" option
      if (selectedPersonaId === 'all') {
        console.log('[PersonaSelector] Selecting "All Customers"');
        // Pass a special "all" persona object
        onSelect({
          id: 'all',
          label: 'All Customers • General Audience',
          age_range: 'All',
          gender: 'all',
          size: 'Broad targeting (100%)',
        });
      } else {
        // Find and pass the selected persona
        const selectedPersona = personas.find(p => p.id === selectedPersonaId);
        console.log('[PersonaSelector] Found persona:', selectedPersona);
        if (selectedPersona) {
          onSelect(selectedPersona);
        } else {
          console.error('[PersonaSelector] Could not find persona:', selectedPersonaId);
        }
      }
    } else {
      console.warn('[PersonaSelector] No persona selected');
    }
  };

  const handleSkipPersona = () => {
    if (onSkip) {
      onSkip();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Extracting personas from research...</p>
        </div>
      </div>
    );
  }

  if (!personas || personas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">No Personas Found</h3>
        <p className="text-gray-400 text-sm mb-6">
          We couldn't extract specific personas from the research. You can continue with general targeting.
        </p>
        <button
          onClick={handleSkipPersona}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          Continue with General Audience
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/30 mb-4">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400 text-sm font-medium">Research Complete</span>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">
          🎯 Who do you want to target?
        </h2>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Select your target audience. This will customize all marketing angles, creatives, and video content to match your chosen persona.
        </p>
      </div>

      {/* Research Summary */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 mb-8">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Research Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">6 Pages</div>
            <div className="text-gray-500 text-xs">Deep Research</div>
          </div>
          <div className="text-center border-l border-r border-[#262626]">
            <div className="text-2xl font-bold text-white mb-1">{personas.length}</div>
            <div className="text-gray-500 text-xs">Personas Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">✓</div>
            <div className="text-gray-500 text-xs">Offer Brief Ready</div>
          </div>
        </div>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            selected={selectedPersonaId === persona.id}
            onSelect={() => setSelectedPersonaId(persona.id)}
          />
        ))}

        {/* "All Customers" Option */}
        <div
          onClick={() => setSelectedPersonaId('all')}
          className={`cursor-pointer transition-all duration-300 rounded-xl border-2 p-6 hover:scale-102 ${
            selectedPersonaId === 'all'
              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
              : 'border-[#262626] bg-[#1A1A1A] hover:border-blue-500/50 hover:bg-[#1F1F1F]'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-1">
                All Customers • General Audience
              </h3>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                Broad targeting (100%)
              </span>
            </div>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedPersonaId === 'all'
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-600'
            }`}>
              {selectedPersonaId === 'all' && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Target everyone without persona filtering. Marketing angles and creatives will appeal to a broad audience across all demographics.
          </p>
          {selectedPersonaId === 'all' && (
            <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Selected for targeting</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {onSkip && (
          <button
            onClick={handleSkipPersona}
            className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#262626] text-gray-300 rounded-lg font-medium transition-all duration-200 border border-[#262626]"
          >
            Skip Persona Selection
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedPersonaId || !onSelect}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          <span>Continue to Angle Analysis</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Optional: Show impact preview */}
      {selectedPersonaId && selectedPersonaId !== 'all' && (
        <div className="mt-8 bg-purple-500/5 rounded-xl border border-purple-500/20 p-6">
          <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What happens next?
          </h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Marketing angles will be tailored to this persona's pain points and traits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Ad creatives will use appropriate pronouns and language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Video avatars will match the persona's demographics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">✓</span>
              <span>Voice and tone will be consistent throughout all content</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PersonaSelector;

