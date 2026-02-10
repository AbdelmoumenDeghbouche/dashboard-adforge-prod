import { MESSAGE_TYPES } from '../../contexts/StrategicChatContext';
import MessageBubble from './MessageBubble';
import ResearchSummaryCard from './ResearchSummaryCard';
import PersonaSelector from './PersonaSelector'; // NEW
import AngleCard from './AngleCard';
import PlatformAdLengthSelector from './PlatformAdLengthSelector';
import CreativeCard from './CreativeCard';
import VideoPreviewCard from './VideoPreviewCard';

/**
 * Chat Message Component
 * Renders different message types (text, research_summary, angles, creatives, video)
 * 
 * @param {Object} message - The message object to render
 * @param {Function} onAnalyzeAngles - Fresh callback from parent (overrides stored callback)
 */
export default function ChatMessage({ message, onAnalyzeAngles, onConfirmPlatformAdLength }) {
  const isAgent = message.sender === 'agent';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} gap-3 animate-slideIn`}>
      {/* Agent Avatar (left side) */}
      {isAgent && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-xl">🤖</span>
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-4xl w-full ${isAgent ? '' : 'flex flex-col items-end'}`}>
        {/* Sender Label */}
        <p className="text-xs text-gray-500 mb-1 px-1">
          {isAgent ? 'Strategic Agent' : 'You'}
        </p>

        {/* Message Bubble or Card */}
        {message.type === MESSAGE_TYPES.TEXT && (
          <MessageBubble 
            content={message.content}
            isAgent={isAgent}
          />
        )}

        {message.type === MESSAGE_TYPES.RESEARCH_SUMMARY && (
          <ResearchSummaryCard 
            data={message.data} 
            onAnalyzeClick={onAnalyzeAngles || message.onAnalyzeClick}
          />
        )}

        {message.type === MESSAGE_TYPES.PERSONA_SELECTOR && (
          <PersonaSelector
            personas={message.data?.personas || []}
            isLoading={message.data?.isLoading || false}
            onSelect={(persona) => {
              console.log('[ChatMessage] 📤 PersonaSelector onSelect triggered');
              console.log('[ChatMessage] Persona:', persona);
              console.log('[ChatMessage] message.onPersonaSelect exists?', !!message.onPersonaSelect);
              if (message.onPersonaSelect) {
                message.onPersonaSelect(persona);
              } else {
                console.error('[ChatMessage] ❌ message.onPersonaSelect is missing!');
              }
            }}
            onSkip={() => {
              console.log('[ChatMessage] 📤 PersonaSelector onSkip triggered');
              if (message.onPersonaSkip) {
                message.onPersonaSkip();
              }
            }}
          />
        )}

        {message.type === MESSAGE_TYPES.ANGLES && (
          <div className="space-y-4 w-full">
            {message.data?.angles?.map((angle) => (
              <AngleCard 
                key={angle.rank} 
                angle={angle}
                onSelect={() => message.onAngleSelect?.(angle)}
              />
            ))}
          </div>
        )}

        {message.type === MESSAGE_TYPES.PLATFORM_AD_LENGTH_SELECTOR && (
          <PlatformAdLengthSelector
            selectedAngle={message.data?.selectedAngle}
            onConfirm={(config) => {
              console.log('[ChatMessage] PlatformAdLengthSelector onConfirm called with:', config);
              console.log('[ChatMessage] onConfirmPlatformAdLength exists?', !!onConfirmPlatformAdLength);
              console.log('[ChatMessage] onConfirmPlatformAdLength.current exists?', !!onConfirmPlatformAdLength?.current);
              if (onConfirmPlatformAdLength?.current) {
                onConfirmPlatformAdLength.current(config);
              } else {
                console.error('[ChatMessage] ERROR: onConfirmPlatformAdLength callback is missing!');
              }
            }}
          />
        )}

        {message.type === MESSAGE_TYPES.CREATIVES && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Handle both array and object formats */}
            {Array.isArray(message.data?.creatives) ? (
              // Array format (from some endpoints)
              message.data.creatives.map((creativeObj) => {
                const mergedCreative = {
                  ...creativeObj.creative,
                  creative_score: {
                    overall_score: creativeObj.score?.total_score,
                    ...creativeObj.score?.score_breakdown
                  }
                };
                
                return (
                  <CreativeCard
                    key={creativeObj.variation_id}
                    creative={mergedCreative}
                    variationId={creativeObj.variation_id}
                    onSelect={() => message.onCreativeSelect?.(creativeObj.variation_id, message.data?.creative_gen_id)}
                  />
                );
              })
            ) : (
              // Object format with proof, fear, desire keys
              ['proof', 'fear', 'desire'].map((variationId) => {
                const creative = message.data?.creatives?.[variationId];
                if (!creative) return null;
                
                return (
                  <CreativeCard
                    key={variationId}
                    creative={creative}
                    variationId={variationId}
                    onSelect={() => message.onCreativeSelect?.(variationId, message.data?.creative_gen_id)}
                  />
                );
              })
            )}
          </div>
        )}

        {message.type === MESSAGE_TYPES.VIDEO && (
          <VideoPreviewCard videoData={message.data} />
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-600 mt-2 px-1">
          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* User Avatar (right side) */}
      {!isAgent && (
        <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0">
          <span className="text-xl">👤</span>
        </div>
      )}
    </div>
  );
}

