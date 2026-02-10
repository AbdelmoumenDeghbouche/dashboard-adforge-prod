# Mock Data Flow Documentation - Frontend

> **وثائق شاملة لطريقة سير البيانات الوهمية في الـ Frontend الحالي**

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البيانات الوهمية (Mock Data)](#البيانات-الوهمية-mock-data)
3. [تدفق البيانات (Data Flow)](#تدفق-البيانات-data-flow)
4. [دوال المحاكاة (Simulation Functions)](#دوال-المحاكاة-simulation-functions)
5. [دورة حياة الرسالة (Message Lifecycle)](#دورة-حياة-الرسالة-message-lifecycle)
6. [أمثلة عملية](#أمثلة-عملية)

---

## نظرة عامة

الـ Frontend الحالي يعمل بشكل كامل مع **بيانات وهمية محلية** (Mock Data) لمحاكاة سلوك الـ Backend. هذا يسمح بتطوير وتجربة الـ UI بدون الحاجة لـ Backend حقيقي.

### المكونات الرئيسية:
- **HomePage.tsx**: المكون الرئيسي الذي يدير الحالة والرسائل
- **Mock Data**: بيانات وهمية ثابتة (MOCK_AUDIENCES, MOCK_ANGLES, MOCK_PSYCHOLOGY)
- **Simulation Functions**: دوال تحاكي استجابة الـ Backend
- **Message State**: مصفوفة رسائل تحفظ تاريخ المحادثة

---

## البيانات الوهمية (Mock Data)

### 1. MOCK_AUDIENCES (بيانات الجمهور)

**الموقع:** `src/pages/HomePage.tsx` (السطر 19-92)

```typescript
const MOCK_AUDIENCES: Audience[] = [
  {
    id: '1',
    name: 'Women Perimeonopausal',
    avatar: 'https://images.unsplash.com/...',
    label: 'Secondary (15-20%)',
    labelColor: '#06E8DC',
    age: '45-65',
    gender: 'Female',
    location: 'United States',
    description: 'Women experiencing perimenopause...',
    traits: ['hormonal changes', 'evidence-seeking', ...],
    painPoints: [
      'Dryness and pH changes from menopause',
      'Skeptical after trying multiple failed solutions',
      ...
    ],
    features: []
  },
  // ... 3 personas أخرى
];
```

**الاستخدام:**
- يتم عرضها عند الضغط على "Start create"
- تظهر في شكل 4 بطاقات (grid 2x2)
- كل بطاقة قابلة للتوسيع لعرض التفاصيل

---

### 2. MOCK_ANGLES (زوايا التسويق)

**الموقع:** `src/pages/HomePage.tsx` (السطر 94-111)

```typescript
const MOCK_ANGLES: MarketingAngle[] = [
  {
    id: '1',
    title: 'Angle 1 : Balance vs Mask',
    score: '9.3',
    description: 'Stop covering up odor with fragrances...',
    metrics: { 
      emotion: '9.0', 
      proof: '9.0', 
      differentiation: '9.5' 
    },
    reason: 'This angle works because it addresses the root cause...'
  },
  {
    id: '2',
    title: 'Angle 2 : Antibiotic Yo-Yo Escape',
    score: '8.8',
    description: 'Break the vicious cycle of antibiotics...',
    metrics: { emotion: '9.0', proof: '9.0', differentiation: '9.5' },
    reason: 'This angle resonates with users who have tried...'
  }
];
```

**الاستخدام:**
- تظهر بعد اختيار الجمهور (Persona)
- تعرض في شكل بطاقتين
- المستخدم يختار زاوية واحدة للمتابعة

---

### 3. MOCK_PSYCHOLOGY (المفاهيم النفسية)

**الموقع:** `src/pages/HomePage.tsx` (السطر 113-130)

```typescript
const MOCK_PSYCHOLOGY: PsychologyConcept[] = [
  {
    id: '1',
    title: 'Loss Aversion',
    score: '7.8/10',
    description: 'Stop covering up odor with fragrances...',
    hook: 'Wait-if your pH is off, no amount of washing...',
    metrics: { 
      hook: '9.0', 
      mechanism: '8.5', 
      believability: '6.5', 
      cta: '7.5' 
    }
  },
  {
    id: '2',
    title: 'Aspiration',
    score: '7.8/10',
    description: 'Wait—before you buy another feminine product...',
    hook: 'Wait—before you buy another feminine product...',
    metrics: { hook: '9.0', mechanism: '8.5', believability: '6.5', cta: '7.5' }
  }
];
```

**الاستخدام:**
- تظهر بعد اختيار الزاوية التسويقية
- تعرض في شكل بطاقتين مع تفاصيل Script
- المستخدم يضغط "Generate video" لإنشاء الفيديو

---

## تدفق البيانات (Data Flow)

### المخطط العام:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action (Click)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Handler Function (handleXXX)                    │
│  - handleSendMessage()                                       │
│  - handleAudienceSelection()                                 │
│  - handleAngleSelection()                                    │
│  - handlePsychologySelection()                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Add User Message to State (setMessages)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Simulation Function (simulateXXX)                  │
│  - simulateGeneration()                                      │
│  - simulateVideoResult()                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          Add Loading Status (status_update)                  │
│  setMessages([...prev, { type: 'status_update', ... }])     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Wait (setTimeout / Promise)                     │
│  await new Promise(r => setTimeout(r, 1500))                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        Add Mock Data Message (audience_group, etc.)          │
│  setMessages([...prev, {                                     │
│    type: 'audience_group',                                   │
│    data: { audiences: MOCK_AUDIENCES }                       │
│  }])                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Update UI (React Re-render)                     │
│  Cards appear with animation                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         User Interacts with Cards (Select/Click)             │
└──────────────────────┴──────────────────────────────────────┘
                       │
                       └──────► Repeat Cycle
```

---

## دوال المحاكاة (Simulation Functions)

### 1. simulateGeneration()

**الوظيفة:** محاكاة توليد الجمهور المستهدف (Personas)

**الموقع:** `src/pages/HomePage.tsx` (السطر 242-321)

**الخطوات:**

```typescript
const simulateGeneration = async () => {
  setIsGenerating(true);
  
  // فحص نوع الميديا (video أو image)
  if (selectedMedia === 'image') {
    // مسار Image Mode
    // 1. عرض status "Initializing creative generation..."
    setMessages(prev => [...prev, {
      type: 'status_update',
      sender: 'ai',
      data: { label: 'Initializing...', status: 'loading' }
    }]);
    
    // 2. انتظار 1 ثانية
    await new Promise(r => setTimeout(r, 1000));
    
    // 3. تحديث الحالة إلى completed
    // ... Update status to completed
    
    setIsGenerating(false);
    return;
  }
  
  // مسار Video Mode
  // Phase 1: عرض status "Analyzing market trends..."
  setMessages(prev => [...prev, {
    type: 'status_update',
    data: { label: 'Analyzing market trends...', status: 'loading' }
  }]);
  
  // انتظار 1.5 ثانية
  await new Promise(r => setTimeout(r, 1500));
  
  // Phase 2: تحديث Status إلى completed
  // Update last message status
  
  // Phase 3: عرض Reasoning (optional)
  setMessages(prev => [...prev, {
    type: 'reasoning',
    data: { 
      reasoning: [
        'Based on recent data, SELF-CARE is a top-performing category',
        'Your competitors are focusing on "quick fixes"...'
      ]
    }
  }]);
  
  // Phase 4: عرض بطاقات الجمهور
  setMessages(prev => [...prev, {
    type: 'audience_group',
    data: { audiences: MOCK_AUDIENCES }
  }]);
  
  scrollToBottom(); // تمرير تلقائي
  setIsGenerating(false);
};
```

**التوقيت:**
- 1.5 ثانية: Analyzing market trends
- 1 ثانية: عرض Reasoning
- **المجموع:** ~2.5 ثانية

---

### 2. handleAudienceSelection()

**الوظيفة:** معالجة اختيار المستخدم لـ Persona

**الموقع:** `src/pages/HomePage.tsx` (السطر 371-428)

**الخطوات:**

```typescript
const handleAudienceSelection = async (audienceName: string) => {
  // 1. إضافة رسالة المستخدم
  setMessages(prev => [...prev, {
    type: 'text',
    sender: 'user',
    data: { isSelection: true, label: 'Target', value: audienceName }
  }]);
  
  scrollToBottom();
  setIsGenerating(true);
  
  // 2. عرض status "Analyzing marketing angles..."
  const statusId = (Date.now() + 1).toString();
  setMessages(prev => [...prev, {
    id: statusId,
    type: 'status_update',
    data: { 
      steps: [
        { 
          label: `Analyzing marketing angles for ${audienceName}...`, 
          status: 'loading', 
          estimatedTime: '2-3min' 
        }
      ]
    }
  }]);
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 1500));
  
  // 3. تحديث Status إلى completed
  setMessages(prev => {
    const next = [...prev];
    const idx = next.findIndex(m => m.id === statusId);
    if (idx !== -1) {
      next[idx] = { 
        ...next[idx], 
        data: { 
          steps: [
            { label: `Analyzing...`, status: 'loading', ... },
            { label: 'Analyze Completed', status: 'completed' }
          ]
        } 
      };
    }
    return next;
  });
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 800));
  
  // 4. عرض بطاقات Marketing Angles
  setMessages(prev => [...prev, {
    type: 'marketing_angle',
    data: { angles: MOCK_ANGLES }
  }]);
  
  scrollToBottom();
  setIsGenerating(false);
};
```

**التوقيت:**
- 1.5 ثانية: Analyzing marketing angles
- 0.8 ثانية: عرض completed status
- **المجموع:** ~2.3 ثانية

---

### 3. handleAngleSelection()

**الوظيفة:** معالجة اختيار زاوية تسويقية

**الموقع:** `src/pages/HomePage.tsx` (السطر 430-490)

**الخطوات:**

```typescript
const handleAngleSelection = async (angleTitle: string) => {
  // 1. إضافة رسالة المستخدم
  setMessages(prev => [...prev, {
    type: 'text',
    sender: 'user',
    data: { isSelection: true, label: 'Angle', value: angleTitle }
  }]);
  
  scrollToBottom();
  setIsGenerating(true);
  
  // 2. عرض status "Tailoring psychology hooks..."
  const statusId = (Date.now() + 1).toString();
  setMessages(prev => [...prev, {
    id: statusId,
    type: 'status_update',
    data: { 
      steps: [
        { 
          label: `Tailoring psychology hooks for "${angleTitle}"...`, 
          status: 'loading', 
          estimatedTime: '1-2min' 
        }
      ]
    }
  }]);
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 1500));
  
  // 3. تحديث Status
  // ... Update status to completed
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 800));
  
  // 4. عرض Psychology Selection Cards
  setMessages(prev => [...prev, {
    type: 'psychology_selection',
    content: "Perfect, let's go with that. Which script would you like to select?",
    data: { concepts: MOCK_PSYCHOLOGY }
  }]);
  
  scrollToBottom();
  setIsGenerating(false);
};
```

**التوقيت:**
- 1.5 ثانية: Tailoring psychology hooks
- 0.8 ثانية: عرض completed
- **المجموع:** ~2.3 ثانية

---

### 4. handlePsychologySelection()

**الوظيفة:** معالجة اختيار مفهوم نفسي وبدء توليد الفيديو

**الموقع:** `src/pages/HomePage.tsx` (السطر 492-554)

**الخطوات:**

```typescript
const handlePsychologySelection = async (conceptTitle: string) => {
  // 1. إضافة رسالة المستخدم
  setMessages(prev => [...prev, {
    type: 'text',
    sender: 'user',
    data: { isSelection: true, label: 'Psychology', value: conceptTitle }
  }]);
  
  scrollToBottom();
  setIsGenerating(true);
  
  // 2. عرض status "Generating final creative output..."
  const statusId = (Date.now() + 1).toString();
  setMessages(prev => [...prev, {
    id: statusId,
    type: 'status_update',
    data: { 
      steps: [
        { 
          label: 'Generating final creative output...', 
          status: 'loading', 
          estimatedTime: '3-4min' 
        }
      ]
    }
  }]);
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 2000));
  
  // 3. تحديث Status إلى "Video Ready"
  // ... Update status
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 1000));
  
  // 4. عرض نتيجة الفيديو
  setMessages(prev => [...prev, {
    type: 'video_result',
    data: {
      productName: 'Ad Forges AI',
      extraInfo: '40s',
      avatarImage: selectedAvatar?.image || 'https://...'
    }
  }]);
  
  scrollToBottom();
  setIsGenerating(false);
  setShowSimpleInput(true); // تبديل إلى simple mode
};
```

**التوقيت:**
- 2 ثانية: Generating final creative output
- 1 ثانية: عرض "Video Ready"
- **المجموع:** ~3 ثواني

---

### 5. simulateVideoResult()

**الوظيفة:** محاكاة توليد فيديو في AI Avatars mode

**الموقع:** `src/pages/HomePage.tsx` (السطر 321-369)

**الخطوات:**

```typescript
const simulateVideoResult = async () => {
  setIsGenerating(true);
  
  // 1. عرض status "Generating your AI Video..."
  setMessages(prev => [...prev, {
    type: 'status_update',
    data: { 
      label: 'Generating your AI Video...', 
      status: 'loading',
      estimatedTime: '40s'
    }
  }]);
  
  scrollToBottom();
  await new Promise(r => setTimeout(r, 2000));
  
  // 2. تحديث Status إلى completed
  setMessages(prev => {
    const next = [...prev];
    const last = next[next.length - 1];
    if (last.type === 'status_update') {
      next[next.length - 1] = { 
        ...last, 
        data: { ...last.data, status: 'completed' } 
      };
    }
    return next;
  });
  
  await new Promise(r => setTimeout(r, 500));
  
  // 3. عرض نتيجة الفيديو
  setMessages(prev => [...prev, {
    type: 'video_result',
    data: {
      productName: 'Ad Forges AI',
      extraInfo: '40s',
      avatarImage: selectedAvatar?.image || 'https://...'
    }
  }]);
  
  scrollToBottom();
  setIsGenerating(false);
  setShowSimpleInput(true);
};
```

**التوقيت:**
- 2 ثانية: Generating your AI Video
- 0.5 ثانية: قبل عرض النتيجة
- **المجموع:** ~2.5 ثانية

---

## دورة حياة الرسالة (Message Lifecycle)

### 1. إنشاء الرسالة (Message Creation)

```typescript
const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// إنشاء رسالة جديدة
const newMessage: ChatMessage = {
  id: generateId(),
  type: 'text',
  sender: 'user',
  timestamp: new Date(),
  content: 'User message text'
};
```

### 2. إضافة الرسالة للحالة (Add to State)

```typescript
setMessages(prev => [...prev, newMessage]);
```

**ماذا يحدث:**
1. React تكتشف تغيير في state
2. يحدث re-render للمكون
3. الرسالة الجديدة تظهر في الـ UI
4. Animation تشتغل (fade-in, slide-in)
5. Auto-scroll يتم تفعيله

### 3. عرض الرسالة (Rendering)

**الموقع:** `src/pages/HomePage.tsx` (السطر 650-762)

```typescript
{messages.map((msg) => (
  <div key={msg.id} className="w-full flex flex-col animate-in fade-in...">
    
    {/* رسالة المستخدم */}
    {msg.sender === 'user' && msg.data?.isSelection ? (
      <UserSelectionMessage label={msg.data.label} value={msg.data.value} />
    ) : msg.sender === 'user' ? (
      <div className="flex justify-end w-full mb-6">
        <div className="p-6 rounded-[24px] bg-[#F9FAFB] max-w-[80%]">
          <p className="text-[15px] font-medium text-[#0A0A0A]">
            {msg.content}
          </p>
        </div>
      </div>
    ) : null}

    {/* رسالة الـ AI */}
    {msg.sender === 'ai' && (
      <div className="flex flex-col gap-6 mb-2">
        {/* Header */}
        {msg.type !== 'status_update' && msg.type !== 'reasoning' && (
          <AIResponseHeader 
            product={...}
            format={...}
            concept={...}
          />
        )}
        
        {/* محتوى الرسالة حسب النوع */}
        {msg.type === 'status_update' && (
          <StatusStep {...} />
        )}
        
        {msg.type === 'audience_group' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {msg.data.audiences.map(audience => (
              <AudienceCard 
                audience={audience}
                onContinue={() => handleAudienceSelection(audience.name)}
              />
            ))}
          </div>
        )}
        
        {msg.type === 'marketing_angle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {msg.data.angles.map(angle => (
              <MarketingAngleCard 
                angle={angle}
                onSelect={() => handleAngleSelection(angle.title)}
              />
            ))}
          </div>
        )}
        
        {msg.type === 'psychology_selection' && (
          <div className="flex flex-col gap-5">
            {msg.data.concepts.map(concept => (
              <PsychologyCard 
                concept={concept}
                onGenerateVideo={() => handlePsychologySelection(concept.title)}
              />
            ))}
          </div>
        )}
        
        {msg.type === 'video_result' && (
          <VideoResultCard thumbnail={msg.data?.avatarImage} />
        )}
      </div>
    )}
  </div>
))}
```

### 4. تفاعل المستخدم (User Interaction)

```typescript
// مثال: المستخدم يضغط "Continue with this persona"
<button onClick={() => onContinue(audience.id)}>
  Continue with this persona
</button>

// في HomePage:
onContinue={() => handleAudienceSelection(audience.name)}
```

**الدورة تكرر:**
User Click → Handler → Add Message → Simulation → Add AI Response → Re-render → Auto-scroll

---

## أمثلة عملية

### مثال 1: تدفق كامل من البداية للنهاية

```
1. User clicks "Start create"
   ↓
2. handleSendMessage() called
   ↓
3. User message added: "Generate ads..."
   ↓
4. simulateGeneration() called
   ↓
5. Status message: "Analyzing market trends..."
   ↓ (Wait 1.5s)
6. Status updated: "completed"
   ↓
7. Reasoning message added (optional)
   ↓ (Wait 1s)
8. Audience cards displayed (4 personas)
   ↓
9. User clicks "Continue with Women Perimeonopausal"
   ↓
10. handleAudienceSelection("Women Perimeonopausal")
    ↓
11. User selection message added
    ↓
12. Status: "Analyzing marketing angles..."
    ↓ (Wait 1.5s)
13. Status: "Analyze Completed"
    ↓ (Wait 0.8s)
14. Marketing angle cards displayed (2 angles)
    ↓
15. User clicks angle "Balance vs Mask"
    ↓
16. handleAngleSelection("Angle 1: Balance vs Mask")
    ↓
17. Status: "Tailoring psychology hooks..."
    ↓ (Wait 1.5s)
18. Status: "Psychology Hooks Optimized"
    ↓ (Wait 0.8s)
19. Psychology cards displayed (2 concepts)
    ↓
20. User clicks "Generate video" on "Loss Aversion"
    ↓
21. handlePsychologySelection("Loss Aversion")
    ↓
22. Status: "Generating final creative output..."
    ↓ (Wait 2s)
23. Status: "Video Ready"
    ↓ (Wait 1s)
24. Video result card displayed
    ↓
25. Simple mode activated (input-only UI)
```

**الوقت الإجمالي:** ~11 ثانية من البداية للنهاية

---

### مثال 2: Image Mode Flow

```
1. User selects "Image" media type
   ↓
2. User selects concept "Angle 2: Antibiotic Yo-Yo"
   ↓
3. User clicks send/create
   ↓
4. simulateGeneration() with image mode
   ↓
5. Status: "Initializing creative generation..."
   ↓ (Wait 1s)
6. Status: "completed"
   ↓
7. Static ad result displayed
```

**الوقت الإجمالي:** ~1 ثانية

---

### مثال 3: AI Avatars Mode Flow

```
1. User selects "AI Avatars" chatmode
   ↓
2. Script review mode activated
   ↓
3. AI message: "I've generated a high-converting script..."
   ↓
4. Script text displayed in input
   ↓
5. User clicks avatar selector
   ↓
6. User selects avatar from modal
   ↓
7. User submits script
   ↓
8. simulateVideoResult() called
   ↓
9. Status: "Generating your AI Video..."
   ↓ (Wait 2s)
10. Status: "completed"
    ↓ (Wait 0.5s)
11. Video result displayed with selected avatar
    ↓
12. Simple mode activated
```

**الوقت الإجمالي:** ~2.5 ثانية

---

## الحالة العامة (Global State)

### State Variables في HomePage:

```typescript
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
const [showScrollButton, setShowScrollButton] = useState(false);
```

### دور كل State:

| State Variable | الوظيفة |
|----------------|---------|
| `messages` | مصفوفة جميع الرسائل في المحادثة |
| `isGenerating` | هل الـ AI يولد محتوى الآن؟ |
| `selectedMedia` | نوع الميديا (video/image/avatars) |
| `selectedProduct` | المنتج المختار |
| `selectedFormat` | الـ format المختار (للفيديو) |
| `selectedConcept` | الـ concept المختار (للصورة) |
| `selectedAvatar` | الـ Avatar المختار (AI Avatars) |
| `selectedChatmode` | وضع المحادثة (chatmode/ai-avatars) |
| `isScriptReview` | هل في وضع مراجعة السكريبت؟ |
| `currentScript` | نص السكريبت الحالي |
| `showSimpleInput` | هل نعرض الإدخال المبسط؟ |
| `expandedCardId` | أي بطاقة مفتوحة حالياً؟ |
| `showScrollButton` | هل نعرض زر التمرير للأسفل؟ |

---

## ملخص التوقيتات

| الخطوة | الوقت | الوظيفة |
|--------|-------|---------|
| Analyzing market trends | 1.5s | توليد الجمهور |
| Show reasoning | 1s | عرض التفكير المنطقي |
| Analyzing marketing angles | 1.5s | توليد الزوايا |
| Show completed status | 0.8s | تأكيد الإكمال |
| Tailoring psychology hooks | 1.5s | توليد المفاهيم |
| Show completed | 0.8s | تأكيد |
| Generating final output | 2s | توليد الفيديو |
| Show "Video Ready" | 1s | تأكيد الإكمال |
| Generating AI Video | 2s | AI Avatars mode |

**إجمالي الوقت لتدفق كامل:** ~11 ثانية

---

## نقاط مهمة للتطوير المستقبلي

### 1. استبدال المحاكاة بـ API حقيقية

```typescript
// الحالي (Mock):
const simulateGeneration = async () => {
  await new Promise(r => setTimeout(r, 1500));
  setMessages([...prev, { data: { audiences: MOCK_AUDIENCES } }]);
};

// المستقبل (Real API):
const generateAudiences = async () => {
  const response = await api.post('/api/chat/generate-audiences', {
    productId: selectedProduct,
    format: selectedFormat
  });
  setMessages([...prev, { data: { audiences: response.data.audiences } }]);
};
```

### 2. إضافة SSE للـ Streaming

```typescript
// المستقبل:
const streamAudiencesSSE = () => {
  const eventSource = new EventSource('/api/chat/stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'audience') {
      setMessages(prev => [...prev, {
        type: 'audience_group',
        data: { audiences: data.audiences }
      }]);
    }
  };
};
```

### 3. إضافة Error Handling

```typescript
try {
  const response = await api.post('/api/chat/generate');
  // Handle success
} catch (error) {
  setMessages(prev => [...prev, {
    type: 'error',
    data: { message: 'Failed to generate. Please try again.' }
  }]);
}
```

---

## الخلاصة

الـ Frontend الحالي يعمل بشكل كامل مع **بيانات وهمية محلية** تحاكي سلوك Backend حقيقي. التدفق منظم ومُنسّق بشكل جيد، مما يسهل:

1. ✅ تطوير وتجربة الـ UI بشكل مستقل
2. ✅ فهم التدفق المطلوب للبيانات
3. ✅ استبدال المحاكاة بـ API حقيقية بسهولة
4. ✅ اختبار جميع السيناريوهات بدون backend

**الخطوة التالية:** ربط الدوال بـ Backend APIs حقيقية مع الحفاظ على نفس التدفق والتجربة.

---

## المراجع

- **الملف الرئيسي:** `src/pages/HomePage.tsx`
- **الأنواع:** `src/types/chat.ts`
- **المكونات:** `src/components/home/`
- **التوثيق الكامل:** `CHAT_BACKEND_INTEGRATION.md`

---

**تاريخ الإنشاء:** 2026-02-09  
**الإصدار:** 1.0  
**الحالة:** ✅ محدّث
