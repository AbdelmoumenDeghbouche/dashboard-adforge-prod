import { useEffect, useState } from 'react';

const RESEARCH_STEPS = [
  { label: 'Analyzing market trends', icon: '📊' },
  { label: 'Extracting customer pain points', icon: '💔' },
  { label: 'Identifying competitor gaps', icon: '🔍' },
  { label: 'Building customer personas', icon: '👥' },
  { label: 'Generating strategic insights', icon: '💡' },
];

/**
 * Research Loading Animation Component
 * Shows animated loading state while research is processing
 * Cycles through 5 steps every 3 seconds
 */
export default function ResearchLoadingAnimation() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % RESEARCH_STEPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentStep = RESEARCH_STEPS[currentStepIndex];
  const progress = ((currentStepIndex + 1) / RESEARCH_STEPS.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Agent Avatar with Pulsing Ring */}
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
          <span className="text-4xl">🤖</span>
        </div>
        
        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-pulse opacity-30"></div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-white mb-3">Research Agent Working</h3>
      
      {/* Current Step with Icon */}
      <div className="flex items-center gap-3 text-gray-300 mb-8 bg-[#1A1A1A] px-6 py-4 rounded-xl border border-[#262626]">
        <span className="text-2xl">{currentStep.icon}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <p className="text-sm font-medium">{currentStep.label}...</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="h-2 bg-[#262626] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          This usually takes 3-5 minutes. We'll notify you when it's ready.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="mt-8 flex gap-2">
        {RESEARCH_STEPS.map((step, idx) => (
          <div
            key={idx}
            className={`
              w-2.5 h-2.5 rounded-full transition-all duration-300
              ${idx <= currentStepIndex 
                ? 'bg-purple-500 scale-110' 
                : 'bg-[#262626]'
              }
            `}
            title={step.label}
          />
        ))}
      </div>

      {/* Helpful Tip */}
      <div className="mt-12 max-w-lg">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">Did you know?</p>
              <p className="text-xs text-gray-400">
                Our research agent analyzes thousands of data points including competitor strategies, 
                customer reviews, market trends, and psychological triggers to find the best angles for your product.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

