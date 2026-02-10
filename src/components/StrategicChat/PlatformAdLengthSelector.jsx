import React, { useState } from 'react';

/**
 * Platform & Ad Length Selector Component
 * Shows AFTER angle selection, BEFORE creative generation
 * User selects platform and ad length to optimize the creative
 */
export default function PlatformAdLengthSelector({ selectedAngle, onConfirm }) {
  const [platform, setPlatform] = useState('facebook');
  const [adLength, setAdLength] = useState(30);

  console.log('[PlatformAdLengthSelector] Rendered with:', { 
    selectedAngle: selectedAngle?.angle_name, 
    hasOnConfirm: !!onConfirm,
    platform,
    adLength
  });

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Feed & Stories' },
    { id: 'instagram', name: 'Instagram', icon: '📸', description: 'Reels & Stories' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', description: 'Short-form video' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', description: 'Pre-roll & Shorts' },
  ];

  const adLengths = [
    { value: 15, label: '15 seconds', description: 'Quick hook, ideal for TikTok' },
    { value: 30, label: '30 seconds', description: 'Balanced, works everywhere' },
    { value: 45, label: '45 seconds', description: 'More detail, better for Facebook' },
    { value: 60, label: '60 seconds', description: 'Full story, YouTube/Facebook' },
  ];

  const handleConfirm = () => {
    console.log('[PlatformAdLengthSelector] handleConfirm called!');
    console.log('[PlatformAdLengthSelector] Confirming with:', { platform, adLength });
    console.log('[PlatformAdLengthSelector] onConfirm callback exists?', !!onConfirm);
    
    if (onConfirm) {
      onConfirm({ platform, adLength });
    } else {
      console.error('[PlatformAdLengthSelector] ERROR: onConfirm callback is missing!');
    }
  };

  return (
    <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-xl max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-200">
        <span className="text-3xl">🎯</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Configure Your Ad</h3>
          <p className="text-sm text-gray-600">
            You've selected: <span className="font-semibold text-purple-600">{selectedAngle?.angle_name}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Choose your platform and ad length to optimize the creative generation
          </p>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          1. Choose Platform
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                platform === p.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-semibold text-sm text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-500 mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Ad Length Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          2. Choose Ad Length
        </label>
        <div className="space-y-2">
          {adLengths.map((length) => (
            <button
              key={length.value}
              onClick={() => setAdLength(length.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                adLength === length.value
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{length.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{length.description}</div>
                </div>
                {adLength === length.value && (
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Selected Configuration:</div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Platform:</span>
            <span className="font-semibold text-purple-600 capitalize">{platform}</span>
          </div>
          <div className="text-gray-300">•</div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Length:</span>
            <span className="font-semibold text-purple-600">{adLength}s</span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log('[PlatformAdLengthSelector] Button clicked! Config:', { platform, adLength });
          handleConfirm();
        }}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 active:scale-[0.98] transition-all font-bold text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-white">Generate Creatives with These Settings</span>
      </button>

      <p className="text-xs text-center text-gray-500 mt-3">
        💡 This will generate 3 creative variations (Proof, Fear, Desire) optimized for <span className="font-semibold text-purple-600 capitalize">{platform}</span> ({adLength}s)
      </p>
    </div>
  );
}

