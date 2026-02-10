import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Breadcrumb from '@/components/folders/Breadcrumb';
import WelcomeSection from '@/components/home/WelcomeSection';
import MessageInputBox from '@/components/home/MessageInputBox';
import AudienceCard from '@/components/home/AudienceCard';
import MarketingAngleCard from '@/components/home/MarketingAngleCard';
import AIResponseHeader from '@/components/home/AIResponseHeader';
import UserSelectionMessage from '@/components/home/UserSelectionMessage';
import PsychologyCard from '@/components/home/PsychologyCard';
import VideoResultCard from '@/components/home/VideoResultCard';
import StatusStep from '@/components/home/StatusStep';
import type { ChatMessage, Audience, MarketingAngle, PsychologyConcept } from '@/types/chat';
import type { Avatar } from '@/types/avatars';
import SelectionImpactBox from '@/components/home/SelectionImpactBox';
import SelectedMessagesBadge from '@/components/home/SelectedMessagesBadge';
import StaticAdResult from '@/components/home/StaticAdResult';
import { useBrand } from '@/contexts/BrandContext';

// Mock data for initial testing
const MOCK_AUDIENCES: Audience[] = [
  {
    id: '1',
    name: 'Women Perimeonopausal',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop',
    label: 'Secondary (15-20%)',
    labelColor: '#06E8DC',
    age: '45-65',
    gender: 'Female',
    location: 'United States',
    description: 'Women experiencing perimenopause and menopause who face new vaginal health challenges. They want proven, science-backed solutions with transparent strain information and are willing to commit if they see results.',
    traits: ['hormonal changes', 'evidence-seeking', 'long-term health focused'],
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      'Concerned about side effects and ingredient quality'
    ],
    features: []
  },
  {
    id: '2',
    name: 'College Students',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    label: 'Secondary (15-20%)',
    labelColor: '#06E8DC',
    age: '18-24',
    gender: 'Female',
    location: 'United States',
    description: 'Young women experiencing their first BV or yeast infection episodes, often triggered by new sexual activity or stress. They want fast, affordable solutions that fit their busy lifestyle.',
    traits: ['digital-native', 'price-conscious', 'seeking quick fixes'],
    painPoints: [
      'First-time experiencing intimate health issues',
      'Limited budget for ongoing treatments',
      'Embarrassment about discussing with doctors'
    ],
    features: []
  },
  {
    id: '3',
    name: 'Supportive Partners',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
    label: 'Minimal (2-5%)',
    labelColor: '#9CA3AF',
    age: '25-45',
    gender: 'Male',
    location: 'United States',
    description: 'Partners seeking to support their significant others dealing with vaginal health issues. They want to understand the science and help find effective solutions.',
    traits: ['supportive', 'research-oriented', 'relationship-focused'],
    painPoints: [
      'Want to help but unsure how',
      'Looking for credible information',
      'Concerned about partner\'s wellbeing'
    ],
    features: []
  },
  {
    id: '4',
    name: 'General Audience',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    label: 'Broad targeting (100%)',
    labelColor: '#06E8DC',
    age: '25-55',
    gender: 'Female',
    location: 'Global',
    description: 'Women of various ages seeking preventative vaginal health solutions. They are proactive about wellness and interested in maintaining optimal intimate health.',
    traits: ['wellness-focused', 'preventative mindset', 'health-conscious'],
    painPoints: [
      'Want to prevent issues before they start',
      'Interested in holistic health approaches',
      'Seeking long-term maintenance solutions'
    ],
    features: []
  }
];

const MOCK_ANGLES: MarketingAngle[] = [
  {
    id: '1',
    title: 'Angle 1 : Balance vs Mask',
    score: '9.3',
    description: 'Stop covering up odor with fragrances and wipes that irritate - start maintaining your natural pH balance from the inside out with probiotics',
    metrics: { emotion: '9.0', proof: '9.0', differentiation: '9.5' },
    reason: 'This angle works because it addresses the root cause of the issue rather than just masking symptoms, which is a major pain point for our target audience.'
  },
  {
    id: '2',
    title: 'Angle 2 : Antibiotic Yo-Yo Escape',
    score: '8.8',
    description: 'Break the vicious cycle of antibiotics that temporarily clear BV only to have it roar back worse - probiotics restore the good bacteria antibiotics destroy',
    metrics: { emotion: '9.0', proof: '9.0', differentiation: '9.5' },
    reason: 'This angle resonates with users who have tried medical treatments with limited long-term success.'
  }
];

const MOCK_PSYCHOLOGY: PsychologyConcept[] = [
  {
    id: '1',
    title: 'Loss Aversion',
    score: '7.8/10',
    description: 'Stop covering up odor with fragrances and wipes that irritate - start maintaining your natural pH balance from the inside out with probiotics',
    hook: 'Wait-if your pH is off, no amount of washing will fix that smell...',
    metrics: { hook: '9.0', mechanism: '8.5', believability: '6.5', cta: '7.5' }
  },
  {
    id: '2',
    title: 'Aspiration',
    score: '7.8/10',
    description: 'Wait—before you buy another feminine product, you need to hear this truth first. Wipes and sprays just mask odor for an hour—then it\'s back. Boric acid works',
    hook: 'Wait—before you buy another feminine product, you need to..',
    metrics: { hook: '9.0', mechanism: '8.5', believability: '6.5', cta: '7.5' }
  }
];

import AboutProductBox from '@/components/home/AboutProductBox';
import type { MediaType } from '@/types';

const HomePage: React.FC = () => {
  const { currentBrand, selectedChatId, getCurrentChatHistory } = useBrand();
  const isViewingChatHistory = selectedChatId !== null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaType>('video');
  const [selectedProduct, setSelectedProduct] = useState<string>('1');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedChatmode, setSelectedChatmode] = useState<string>('chatmode');
  const [isScriptReview, setIsScriptReview] = useState(false);
  const [currentScript, setCurrentScript] = useState('');
  const [showSimpleInput, setShowSimpleInput] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  console.log('🏠 HomePage - Current Brand:', currentBrand.name);
  console.log('🏠 HomePage - Selected Chat ID:', selectedChatId);
  console.log('🏠 HomePage - Messages Count:', messages.length);
  console.log('🏠 HomePage - Show Welcome?', messages.length === 0);

  // Load messages when chat is selected
  useLayoutEffect(() => {
    if (selectedChatId) {
      const chatHistory = getCurrentChatHistory();
      console.log('🔄 Loading chat history:', chatHistory?.title, 'messages:', chatHistory?.messages?.length || 0);
      setMessages(chatHistory?.messages || []);
    } else {
      console.log('🔄 No chat selected - showing welcome');
      setMessages([]);
    }
  }, [selectedChatId, getCurrentChatHistory]); // Update when brand chats change

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 200);
  };


  const handleSendMessage = (text: string) => {
    console.log('HomePage handleSendMessage:', text);
    if (text.toLowerCase().includes('selected') && text.toLowerCase().includes('messages')) {
      const match = text.match(/\d+/);
      const count = match ? parseInt(match[0]) : 5;
      handleMessageSelection(count);
    } else if (isScriptReview) {
      // Handle script submission
      setMessages(prev => [...prev, { 
        id: generateId(), 
        sender: 'user', 
        type: 'text', 
        timestamp: new Date(), 
        content: text 
      }]);
      scrollToBottom();
      setIsScriptReview(false);
      simulateVideoResult();
    } else {
      setMessages(prev => [...prev, { id: generateId(), sender: 'user', type: 'text', timestamp: new Date(), content: text }]);
      scrollToBottom();
      simulateGeneration();
    }
  };

  const handleChatmodeChange = (id: string) => {
    setSelectedChatmode(id);
    
    if (id === 'ai-avatars') {
      setIsScriptReview(true);
      setCurrentScript(`Hook (0~3s) "Your ads don't fail because of your product. They fail because of the video." Script "Before, brands wasted days scripting, filming, editing... and still ended up with ads that didn't convert." After, everything changes. I analyze your product, your market, and what already works in your niche. I pick the strongest angle. I write the hook, the script, and the CTA. Then I generate a video designed to sell. No guesswork. No creative fatigue. Just ads built to perform. "CTA "Generate your next winning ad."`);
      
      setMessages(prev => [...prev, {
        id: generateId(),
        type: 'text',
        sender: 'ai',
        timestamp: new Date(),
        content: "I've generated a high-converting script for you. You can review it below and select an AI Avatar to proceed with video generation.",
      }]);
    } else {
      setIsScriptReview(false);
      setCurrentScript('');
    }
  };

  const handleMessageSelection = async (count: number) => {
    // Add the user selection badge
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'selection_summary',
      sender: 'ai', // Even though it looks like user, it's a status badge in this UI
      timestamp: new Date(),
      data: {
        images: Array.from({ length: Math.min(count, 5) }, () => `https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=280&h=373&auto=format&fit=crop`)
      }
    }]);

    setIsGenerating(true);

    await new Promise(r => setTimeout(r, 1500));

    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'static_ad_result',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        extraInfo: "(2 min 40 sec)",
        productName: 'Sérum autobronzant progressif',
        conceptName: selectedConcept || 'Angle 2 : Antibiotic Yo-Yo Escape'
      }
    }]);

    setIsGenerating(false);
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);
    
    // Check if we are in image mode
    if (selectedMedia === 'image') {
       // Phase 1: Context Setting
       setMessages(prev => [...prev, {
         id: generateId(),
         type: 'status_update',
         sender: 'ai',
         timestamp: new Date(),
         data: { 
           label: 'Initializing creative generation...', 
           status: 'loading',
           productName: 'Sérum autobronzant progressif',
           conceptName: selectedConcept || 'Angle 2 : Antibiotic Yo-Yo Escape'
         }
       }]);

       await new Promise(r => setTimeout(r, 1000));

       setMessages(prev => {
         const next = [...prev];
         const last = next[next.length - 1];
         next[next.length - 1] = { 
           ...last, 
           data: { ...last.data, status: 'completed' } 
         };
         return next;
       });

       setIsGenerating(false);
       return;
    }

    // Phase 1: Audience Analysis (Video Mode)
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'status_update',
      sender: 'ai',
      timestamp: new Date(),
      data: { label: 'Analyzing market trends and competitor keywords...', status: 'loading' }
    }]);

    await new Promise(r => setTimeout(r, 1500));

    setMessages(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last.type === 'status_update') {
        next[next.length - 1] = { ...last, data: { ...last.data, status: 'completed' } };
      }
      return next;
    });

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'reasoning',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        reasoning: [
          'Based on recent data, SELF-CARE is a top-performing category for your audience.',
          'Your competitors are focusing on "quick fixes", so we should highlight long-term stability.'
        ]
      }
    }]);

    await new Promise(r => setTimeout(r, 1000));

    setMessages(prev => [...prev, {
      id: (Date.now() + 2).toString(),
      type: 'audience_group',
      sender: 'ai',
      timestamp: new Date(),
      data: { audiences: MOCK_AUDIENCES }
    }]);

    scrollToBottom();
    setIsGenerating(false);
  };

  const simulateVideoResult = async () => {
    setIsGenerating(true);
    
    // Status update for video generation
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'status_update',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        label: 'Generating your AI Video...', 
        status: 'loading',
        estimatedTime: '40s'
      }
    }]);

    scrollToBottom();
    await new Promise(r => setTimeout(r, 2000));

    setMessages(prev => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last.type === 'status_update') {
        next[next.length - 1] = { ...last, data: { ...last.data, status: 'completed' } };
      }
      return next;
    });

    await new Promise(r => setTimeout(r, 500));

    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'video_result',
      sender: 'ai',
      timestamp: new Date(),
      data: {
        productName: 'Ad Forges AI',
        extraInfo: '40s',
        avatarImage: selectedAvatar?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200'
      }
    }]);

    scrollToBottom();
    setIsGenerating(false);
    setShowSimpleInput(true); // Switch to simple input mode after video generation
  };

  const handleAudienceSelection = async (audienceName: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      data: { isSelection: true, label: 'Target', value: audienceName }
    }]);

    scrollToBottom();
    setIsGenerating(true);

    // Initial Status Block with one step
    const statusId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: statusId,
      type: 'status_update',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        steps: [
          { label: `Analyzing marketing angles for ${audienceName}...`, status: 'loading', estimatedTime: '2-3min' }
        ]
      }
    }]);

    scrollToBottom();
    await new Promise(r => setTimeout(r, 1500));

    // Update Status Block to add Completed step
    setMessages(prev => {
      const next = [...prev];
      const idx = next.findIndex(m => m.id === statusId);
      if (idx !== -1) {
        next[idx] = { 
          ...next[idx], 
          data: { 
            ...next[idx].data, 
            steps: [
              { label: `Analyzing marketing angles for ${audienceName}...`, status: 'loading', estimatedTime: '2-3min' },
              { label: 'Analyze Completed', status: 'completed' }
            ]
          } 
        };
      }
      return next;
    });

    scrollToBottom();
    await new Promise(r => setTimeout(r, 800));

    // Choice of Angles Header + Cards
    setMessages(prev => [...prev, {
      id: (Date.now() + 3).toString(),
      type: 'marketing_angle',
      sender: 'ai',
      timestamp: new Date(),
      data: { angles: MOCK_ANGLES }
    }]);

    scrollToBottom();
    setIsGenerating(false);
  };

  const handleAngleSelection = async (angleTitle: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      data: { isSelection: true, label: 'Angle', value: angleTitle }
    }]);

    scrollToBottom();
    setIsGenerating(true);

    const statusId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: statusId,
      type: 'status_update',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        steps: [
          { label: `Tailoring psychology hooks for "${angleTitle}"...`, status: 'loading', estimatedTime: '1-2min' }
        ]
      }
    }]);

    scrollToBottom();
    await new Promise(r => setTimeout(r, 1500));

    setMessages(prev => {
      const next = [...prev];
      const idx = next.findIndex(m => m.id === statusId);
      if (idx !== -1) {
        next[idx] = { 
          ...next[idx], 
          data: { 
            ...next[idx].data, 
            steps: [
              { label: `Tailoring psychology hooks for "${angleTitle}"...`, status: 'loading', estimatedTime: '1-2min' },
              { label: 'Psychology Hooks Optimized', status: 'completed' }
            ]
          } 
        };
      }
      return next;
    });

    scrollToBottom();
    await new Promise(r => setTimeout(r, 800));

    setMessages(prev => [...prev, {
      id: (Date.now() + 2).toString(),
      type: 'psychology_selection',
      sender: 'ai',
      timestamp: new Date(),
      content: "Perfect, let's go with that. Which script would you like to select to move forward?",
      data: { concepts: MOCK_PSYCHOLOGY }
    }]);

    scrollToBottom();
    setIsGenerating(false);
  };

  const handlePsychologySelection = async (conceptTitle: string) => {
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'text',
      sender: 'user',
      timestamp: new Date(),
      data: { isSelection: true, label: 'Psychology', value: conceptTitle }
    }]);

    scrollToBottom();
    setIsGenerating(true);

    const statusId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: statusId,
      type: 'status_update',
      sender: 'ai',
      timestamp: new Date(),
      data: { 
        steps: [
          { label: 'Generating final creative output...', status: 'loading', estimatedTime: '3-4min' }
        ]
      }
    }]);

    scrollToBottom();
    await new Promise(r => setTimeout(r, 2000));

    setMessages(prev => {
      const next = [...prev];
      const idx = next.findIndex(m => m.id === statusId);
      if (idx !== -1) {
        next[idx] = { 
          ...next[idx], 
          data: { 
            ...next[idx].data, 
            steps: [
              { label: 'Generating final creative output...', status: 'loading', estimatedTime: '3-4min' },
              { label: 'Video Ready', status: 'completed' }
            ]
          } 
        };
      }
      return next;
    });

    scrollToBottom();
    await new Promise(r => setTimeout(r, 1000));

    // Show video result after "Video Ready"
    setMessages(prev => [...prev, {
      id: generateId(),
      type: 'video_result',
      sender: 'ai',
      timestamp: new Date(),
      data: {
        productName: 'Ad Forges AI',
        extraInfo: '40s',
        avatarImage: selectedAvatar?.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200'
      }
    }]);

    scrollToBottom();
    setIsGenerating(false);
    setShowSimpleInput(true); // Switch to simple input mode after video generation
  };

  useEffect(() => {
    // Add delay to ensure DOM has updated and animations have started
    const scrollToBottom = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 300);

    return () => clearTimeout(scrollToBottom);
  }, [messages]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full bg-bg-sidebar pt-3 sm:pt-4 pr-1 pb-3 sm:pb-4 pl-1 overflow-hidden items-center">
      <div className="w-full max-w-[2800px] flex flex-col gap-3 sm:gap-4 h-full px-2 sm:px-4">
        <div className="px-1 sm:px-2.5">
          <Breadcrumb paths={[currentBrand.name, 'New chat']} />
        </div>

        <div className="flex-1 bg-white border border-[#0A0A0A]/[0.06] rounded-xl sm:rounded-2xl relative overflow-hidden flex flex-col items-center">
          <div ref={chatContainerRef} className="w-full overflow-y-auto overflow-x-hidden flex-1 scroll-smooth">
            <div className={`w-full max-w-[852px] mx-auto flex flex-col items-center ${messages.length === 0 ? 'justify-center min-h-full' : ''} gap-[24px] sm:gap-[32px] md:gap-[44px] px-3 sm:px-4 md:px-6 ${messages.length === 0 ? 'py-[24px] sm:pt-[40px] md:pt-[80px]' : 'pt-[16px] sm:pt-[20px] md:pt-[40px]'} ${isViewingChatHistory ? 'pb-[24px] sm:pb-[32px] md:pb-[44px]' : 'pb-[100px] sm:pb-[120px] md:pb-[180px]'}`}>
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-[16px] sm:gap-[20px] w-full">
                  <WelcomeSection />
                  <div className="w-full sm:w-[calc(100%-32px)] lg:w-[calc(100%-48px)] mx-auto mt-4 sm:mt-8 lg:mt-10">
                    <MessageInputBox 
                      selectedMedia={selectedMedia}
                      onMediaChange={(type) => setSelectedMedia(type)}
                      selectedProduct={selectedProduct}
                      onProductChange={setSelectedProduct}
                      selectedFormat={selectedFormat}
                      onFormatChange={setSelectedFormat}
                      selectedConcept={selectedConcept}
                      onConceptChange={setSelectedConcept}
                      onSend={handleSendMessage} 
                      isScriptReview={isScriptReview}
                      scriptText={currentScript}
                      selectedChatmode={selectedChatmode}
                      onChatmodeChange={handleChatmodeChange}
                    />
                  </div>
                  
                  {selectedMedia === 'image' && (
                    <div className="w-full mt-10">
                      <AboutProductBox 
                        productName="About your product"
                        painPoints={[
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                        ]}
                        keyDesires={[
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                          "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                        ]}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col gap-10">
                  {messages.map((msg) => (
                    <div key={msg.id} className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {msg.sender === 'user' && msg.data?.isSelection && msg.data.label && msg.data.value ? (
                        <UserSelectionMessage label={msg.data.label} value={msg.data.value} />
                      ) : msg.sender === 'user' ? (
                        <div className="flex justify-end w-full mb-6">
                           <div className="p-6 rounded-[24px] bg-[#F9FAFB] max-w-[80%]">
                             <p className="text-[15px] font-medium text-[#0A0A0A]">{msg.content}</p>
                           </div>
                        </div>
                      ) : null}

                      {msg.sender === 'ai' && (msg.type === 'status_update' || msg.type === 'reasoning' || msg.type === 'audience_group' || msg.type === 'marketing_angle' || msg.type === 'psychology_selection' || msg.type === 'video_result' || msg.type === 'static_ad_result' || msg.type === 'selection_summary') && (
                        <div className="flex flex-col gap-6 mb-2">
                            {/* Show header only for visible message types (not status_update, reasoning, or selection_summary) */}
                            {(msg.type !== 'selection_summary' && msg.type !== 'status_update' && msg.type !== 'reasoning') && (
                              <AIResponseHeader 
                                product={(['audience_group', 'marketing_angle', 'static_ad_result'].includes(msg.type as string)) ? (msg.data?.productName || 'Sérum autobronzant progressif') : undefined}
                                format={(['audience_group', 'marketing_angle'].includes(msg.type as string)) ? 'UGC Storytelling+ Product Cutaways (Hybrid Format)' : undefined}
                                concept={msg.data?.conceptName}
                                extraInfo={msg.data?.extraInfo}
                              />
                            )}
                           
                           {/* Status update for loading states */}
                           {msg.type === 'status_update' && msg.data && (
                             <div className="flex items-start gap-3 w-full">
                               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-sm border border-[#0A0A0A]/[0.04] shrink-0 -mt-1">
                                 <img src="/icons/ad forge logo.svg" alt="Ad Forges AI" className="w-full h-full" />
                               </div>
                               <div className="flex-1">
                                 <StatusStep 
                                    label={msg.data.label} 
                                    status={msg.data.status} 
                                    estimatedTime={msg.data.estimatedTime} 
                                    steps={msg.data.steps}
                                 />
                               </div>
                             </div>
                           )}
                           
                           {/* Hidden: Reasoning box not in design */}
                           {/* {msg.type === 'reasoning' && msg.data?.reasoning && (
                             <ReasoningBox reasoning={msg.data.reasoning} />
                           )} */}

                          {msg.type === 'audience_group' && msg.data?.audiences && (
                            <div className="flex flex-col gap-4 w-full">
                              {/* Hidden: Question not in design */}
                              {/* <p className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em]">
                                 Which persona would be most suitable for your creative?
                              </p> */}
                              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full items-start">
                                {msg.data.audiences.map((audience: Audience, index: number) => {
                                  const cardId = `audience-${msg.id}-${audience.id}-${index}`;
                                  return (
                                    <AudienceCard 
                                      key={cardId}
                                      audience={audience}
                                      isExpanded={expandedCardId === cardId}
                                      onToggleExpand={() => setExpandedCardId(expandedCardId === cardId ? null : cardId)}
                                      onContinue={() => handleAudienceSelection(audience.name)} 
                                    />
                                  );
                                })}
                               </div>
                               <SelectionImpactBox />
                             </div>
                           )}

                          {msg.type === 'marketing_angle' && msg.data?.angles && (
                            <div className="flex flex-col gap-4 w-full">
                              <p className="text-[16px] font-medium leading-[24px] text-[#0A0A0A] -tracking-[0.007em]">
                                 Perfect, now select an angle
                               </p>
                              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full items-start">
                                {msg.data.angles.map((angle: MarketingAngle, index: number) => {
                                  const cardId = `angle-${msg.id}-${angle.id}-${index}`;
                                  return (
                                    <MarketingAngleCard 
                                      key={cardId}
                                      angle={angle}
                                      isExpanded={expandedCardId === cardId}
                                      onToggleExpand={() => setExpandedCardId(expandedCardId === cardId ? null : cardId)}
                                      onSelect={() => handleAngleSelection(angle.title)} 
                                    />
                                  );
                                })}
                               </div>
                             </div>
                           )}

                           {msg.type === 'psychology_selection' && msg.data?.concepts && (
                             <div className="flex flex-col gap-5 w-full">
                               {msg.content && (
                                 <div className="flex items-start gap-3">
                                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-sm border border-[#0A0A0A]/[0.04] shrink-0 -mt-1">
                                     <img src="/icons/ad forge logo.svg" alt="Ad Forges AI" className="w-full h-full" />
                                   </div>
                                   <p className="text-[14px] font-normal leading-[22px] text-[#0A0A0A] -tracking-[0.007em] flex-1">
                                     {msg.content}
                                   </p>
                                 </div>
                               )}
                               {msg.data.concepts.map((concept: PsychologyConcept) => (
                                 <PsychologyCard 
                                   key={concept.id} 
                                   concept={concept} 
                                   onGenerateScript={() => handlePsychologySelection(concept.title)}
                                   onGenerateVideo={() => handlePsychologySelection(concept.title)}
                                 />
                               ))}
                             </div>
                           )}

                           {msg.type === 'video_result' && (
                             <div className="flex flex-col gap-4">
                               <VideoResultCard thumbnail={msg.data?.avatarImage} />
                             </div>
                           )}

                           {msg.type === 'selection_summary' && msg.data?.images && (
                               <SelectedMessagesBadge 
                                 count={msg.data.images.length} 
                                 images={msg.data.images} 
                               />
                             )}

                             {msg.type === 'static_ad_result' && (
                               <StaticAdResult imageUrl="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=480&h=600&auto=format&fit=crop" />
                             )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="w-full pt-10 flex flex-col gap-6">
                    {isGenerating && (
                      <div className="flex items-center gap-3 animate-pulse px-4">
                        <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-[#00D1FF] rounded-full animate-bounce" />
                        <span className="text-[13px] font-bold text-[#0A0A0A]/40 ml-2">Pulsor AI is thinking...</span>
                      </div>
                    )}
                     {!isViewingChatHistory && !(selectedMedia === 'video' && selectedFormat) && !(selectedMedia === 'image' && selectedConcept) && (
                       <div className="w-full sm:w-[calc(100%-32px)] lg:w-[calc(100%-48px)] mx-auto">
                         <MessageInputBox 
                           selectedMedia={selectedMedia}
                           onMediaChange={(type) => setSelectedMedia(type)}
                           selectedProduct={selectedProduct}
                           onProductChange={setSelectedProduct}
                           selectedFormat={selectedFormat}
                           onFormatChange={setSelectedFormat}
                           selectedConcept={selectedConcept}
                           onConceptChange={setSelectedConcept}
                           onSend={handleSendMessage} 
                           isScriptReview={isScriptReview}
                           scriptText={currentScript}
                           selectedChatmode={selectedChatmode}
                           onChatmodeChange={handleChatmodeChange}
                           selectedAvatar={selectedAvatar}
                           onAvatarChange={setSelectedAvatar}
                           simpleMode={showSimpleInput}
                         />
                       </div>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
