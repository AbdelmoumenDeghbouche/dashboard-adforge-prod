# Image Chat Endpoints

## Overview

Conversational AI-powered image modification using chat interface (powered by OpenAI DALL-E).

**Service:** `chatAPI` from `src/services/apiService.js`

## Endpoints

### 1. Create Conversation

**Start new image modification conversation**

```javascript
POST /api/v1/chat/conversations
```

**Request (FormData):**
```javascript
{
  brand_id: "brand_123",
  product_id: "prod_456",
  initial_image: File,              // Image file to modify
  initial_message: "Make it blue"   // Optional first message
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    conversation_id: "conv_abc123",
    brand_id: "brand_123",
    product_id: "prod_456",
    created_at: "2024-01-15T10:00:00Z",
    messages: [
      {
        message_id: "msg_001",
        role: "user",
        text: "Make it blue",
        timestamp: "2024-01-15T10:00:00Z"
      },
      {
        message_id: "msg_002",
        role: "assistant",
        text: "I've made the image blue. Here's the result:",
        image_url: "https://...",
        timestamp: "2024-01-15T10:00:15Z"
      }
    ]
  }
}
```

**Frontend Usage:**
```javascript
import { chatAPI } from '../services/apiService';

async function createImageConversation(brandId, productId, imageFile, message) {
  const conversation = await chatAPI.createConversation(
    brandId,
    productId,
    imageFile,
    message
  );
  
  console.log('Conversation ID:', conversation.conversation_id);
  return conversation;
}
```

---

### 2. Send Message

**Send modification request in existing conversation**

```javascript
POST /api/v1/chat/conversations/{conversationId}/messages
```

**Request:**
```javascript
{
  text: "Now make it darker and add sparkles",
  backend: "openai"  // openai | anthropic (default: openai)
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    message_id: "msg_003",
    role: "assistant",
    text: "I've made it darker and added sparkles:",
    image_url: "https://storage.googleapis.com/modified_image.png",
    timestamp: "2024-01-15T10:01:00Z",
    
    // Image history
    previous_image_url: "https://...previous.png"
  }
}
```

**Frontend Usage:**
```javascript
const response = await chatAPI.sendMessage(
  conversationId, 
  "Make it brighter",
  "openai"  // Backend provider
);

const modifiedImageUrl = response.image_url;
```

---

### 3. Get Conversation

**Retrieve conversation history and images**

```javascript
GET /api/v1/chat/brands/{brandId}/products/{productId}/conversations/{conversationId}
```

**Response:**
```javascript
{
  success: true,
  data: {
    conversation_id: "conv_abc123",
    brand_id: "brand_123",
    product_id: "prod_456",
    created_at: "2024-01-15T10:00:00Z",
    messages: [
      {
        message_id: "msg_001",
        role: "user",
        text: "Make it blue",
        timestamp: "2024-01-15T10:00:00Z"
      },
      {
        message_id: "msg_002",
        role: "assistant",
        text: "Done!",
        image_url: "https://...",
        timestamp: "2024-01-15T10:00:15Z"
      }
      // ... more messages
    ],
    total_messages: 4,
    latest_image_url: "https://...latest.png"
  }
}
```

**Frontend Usage:**
```javascript
const conversation = await chatAPI.getConversation(
  brandId,
  productId,
  conversationId
);

const messages = conversation.messages;
const latestImage = conversation.latest_image_url;
```

---

### 4. List Conversations

**Get all conversations for a product**

```javascript
GET /api/v1/chat/brands/{brandId}/products/{productId}/conversations
```

**Query Params:**
```javascript
{
  limit: 50  // Optional
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    conversations: [
      {
        conversation_id: "conv_001",
        created_at: "2024-01-15T10:00:00Z",
        message_count: 6,
        latest_image_url: "https://...",
        latest_message_preview: "Make it darker..."
      }
    ],
    count: 3
  }
}
```

**Frontend Usage:**
```javascript
const response = await chatAPI.listConversations(brandId, productId, 50);
const conversations = response.data.conversations;
```

---

## Complete Image Chat Example

```javascript
import { useState, useEffect } from 'react';
import { chatAPI } from '../services/apiService';
import { useBrand } from '../contexts/BrandContext';

function ImageChatModal({ product, onClose }) {
  const { selectedBrand } = useBrand();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  
  // Create conversation when modal opens
  useEffect(() => {
    if (product.imageUrl) {
      createConversation();
    }
  }, []);
  
  async function createConversation() {
    setLoading(true);
    try {
      // Convert product image URL to File (if needed)
      const imageBlob = await fetch(product.imageUrl).then(r => r.blob());
      const imageFile = new File([imageBlob], 'product.jpg', { type: 'image/jpeg' });
      
      // Create conversation
      const conversation = await chatAPI.createConversation(
        selectedBrand.brandId,
        product.productId,
        imageFile,
        "Let's modify this image"  // Initial message
      );
      
      setConversationId(conversation.conversation_id);
      setMessages(conversation.messages);
      
      // Set latest image
      const latestMessage = conversation.messages.findLast(m => m.image_url);
      if (latestMessage) {
        setCurrentImageUrl(latestMessage.image_url);
      }
      
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function sendMessage() {
    if (!inputText.trim() || !conversationId) return;
    
    setLoading(true);
    
    try {
      // Add user message to UI immediately
      const userMessage = {
        message_id: 'temp_' + Date.now(),
        role: 'user',
        text: inputText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Send to backend
      const response = await chatAPI.sendMessage(
        conversationId,
        inputText,
        'openai'
      );
      
      // Add assistant response
      const assistantMessage = {
        message_id: response.message_id,
        role: 'assistant',
        text: response.text,
        image_url: response.image_url,
        timestamp: response.timestamp
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update current image
      if (response.image_url) {
        setCurrentImageUrl(response.image_url);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="modal">
      {/* Header */}
      <div className="header">
        <h2>Modify Image: {product.productName}</h2>
        <button onClick={onClose}>✕</button>
      </div>
      
      {/* Current Image */}
      <div className="image-preview">
        {currentImageUrl && <img src={currentImageUrl} alt="Current" />}
      </div>
      
      {/* Chat Messages */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.message_id} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
            {msg.image_url && <img src={msg.image_url} alt="Modified" />}
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Describe the changes you want..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !inputText.trim()}>
          {loading ? 'Processing...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

## Backend Providers

### OpenAI DALL-E (Default)
```javascript
backend: "openai"
```
- Best for realistic product images
- Fast generation (10-30 seconds)
- Good at understanding natural language

### Anthropic Claude (Experimental)
```javascript
backend: "anthropic"
```
- Alternative AI backend
- May have different capabilities

## Timeout Configuration

- **Create conversation:** 3 minutes (includes initial image generation)
- **Send message:** 5 minutes (AI image modification)
- **Get conversation:** 30 seconds (fetch history)

## Best Practices

1. ✅ Use FormData for initial image upload
2. ✅ Show loading state during image generation (15-30s)
3. ✅ Display conversation history for context
4. ✅ Allow downloading modified images
5. ✅ Implement retry for failed modifications
6. ✅ Validate image file size/type before upload
7. ✅ Keep conversations associated with products
8. ✅ Provide clear modification instructions
