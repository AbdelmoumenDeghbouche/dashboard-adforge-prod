# API Service Configuration

## Overview

The API service provides centralized HTTP client configuration using Axios with automatic authentication, error handling, and request/response transformation.

## Location
- `src/services/apiService.js` - Main API service with all endpoints

## Base Configuration

### Axios Instances

Two axios instances for different content types:

```javascript
import axios from 'axios';
import { auth } from '../config/firebase';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// 1. JSON API instance (default Content-Type: application/json)
const api = axios.create({
  baseURL: baseURL,
  timeout: 300000, // 5 minutes
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// 2. FormData API instance (no default Content-Type - browser sets it)
const apiFormData = axios.create({
  baseURL: baseURL,
  timeout: 300000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});
```

### Why Two Instances?

- **api**: For JSON payloads (most endpoints)
- **apiFormData**: For file uploads (lets browser set `multipart/form-data` boundary)

## Request Interceptor

### Authentication Injection

Automatically adds Firebase ID token to all requests (except public routes):

```javascript
const authInterceptor = async (config) => {
  const publicRoutes = [
    '/api/v1/auth/signup',
    '/api/v1/auth/verify-token',
    '/api/v1/auth/login',
    '/api/v1/auth/resend-verification'
  ];
  
  // Always add ngrok skip header
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
  
  if (!isPublicRoute) {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Token retrieval failed - will be handled by response interceptor
      }
    }
  }
  
  return config;
};

// Apply to both instances
api.interceptors.request.use(authInterceptor);
apiFormData.interceptors.request.use(authInterceptor);
```

## Response Interceptor

### Success Handler

Automatically unwraps `response.data`:

```javascript
const responseInterceptor = (response) => response.data;
```

**Before:**
```javascript
const response = await api.get('/api/v1/brands');
const brands = response.data.data.brands; // Nested
```

**After:**
```javascript
const response = await api.get('/api/v1/brands');
const brands = response.data.brands; // Direct access
```

### Error Handler

Transforms errors into user-friendly messages:

```javascript
const errorInterceptor = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('[API] Server error:', {
      status: error.response.status,
      data: error.response.data,
    });
    
    // Handle validation errors (422)
    if (error.response.status === 422 && error.response.data?.detail) {
      const detailMsg = Array.isArray(error.response.data.detail) 
        ? error.response.data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ')
        : JSON.stringify(error.response.data.detail);
      
      const fullError = new Error(`Validation error: ${detailMsg}`);
      fullError.response = error.response;
      return Promise.reject(fullError);
    }
    
    // Extract error message
    const message = 
      error.response.data?.message || 
      error.response.data?.detail || 
      'Une erreur est survenue';
    
    const customError = new Error(message);
    customError.response = error.response;
    return Promise.reject(customError);
    
  } else if (error.request) {
    // Request made but no response
    return Promise.reject(new Error('Le serveur est temporairement indisponible. Veuillez réessayer.'));
    
  } else if (error.code === 'ECONNABORTED') {
    // Timeout
    return Promise.reject(new Error('Le serveur met trop de temps à répondre.'));
    
  } else {
    return Promise.reject(new Error('Une erreur est survenue. Veuillez réessayer.'));
  }
};

api.interceptors.response.use(responseInterceptor, errorInterceptor);
apiFormData.interceptors.response.use(responseInterceptor, errorInterceptor);
```

## Timeout Configuration

Different endpoints have different timeouts based on operation complexity:

| Operation | Timeout | Reason |
|-----------|---------|--------|
| Default | 5 minutes | Standard operations |
| Job submission | 30-90 seconds | Quick job creation |
| Job polling | 10 seconds | Fast status checks |
| Video generation | 30 minutes | Long-running AI operations |
| Research | 15 minutes | AI analysis |

### Example

```javascript
// Quick operation - 10 second timeout
await api.get('/api/v1/brands', { timeout: 10000 });

// Long operation - 30 minute timeout
await api.post('/api/v1/sora/generate', payload, { timeout: 1800000 });
```

## Making API Calls

### GET Request

```javascript
const response = await api.get('/api/v1/brands');
// response = { success: true, data: { brands: [...] } }
```

### GET with Query Params

```javascript
const response = await api.get('/api/v1/jobs', {
  params: { status: 'completed', limit: 50 },
  timeout: 10000
});
```

### POST Request (JSON)

```javascript
const response = await api.post('/api/v1/auth/signup', {
  email: 'user@example.com',
  password: 'password123',
  display_name: 'John Doe'
});
```

### POST Request (FormData)

```javascript
const formData = new FormData();
formData.append('brand_id', brandId);
formData.append('product_id', productId);
formData.append('logo_file', logoFile);

// Use apiFormData for file uploads
const response = await apiFormData.post('/api/v1/brands/create', formData, {
  timeout: 30000
});
```

### PATCH Request

```javascript
const response = await api.patch(`/api/v1/brands/${brandId}`, {
  brandName: 'New Name',
  primaryColor: '#FF0000'
});
```

### DELETE Request

```javascript
const response = await api.delete(`/api/v1/brands/${brandId}`, {
  timeout: 10000
});
```

## Error Handling

### Try-Catch Pattern

```javascript
try {
  const response = await api.get('/api/v1/brands');
  
  if (response.success) {
    // Handle success
    const brands = response.data.brands;
  }
} catch (error) {
  // Error already formatted by interceptor
  console.error('Error:', error.message);
  
  // Access original response if needed
  if (error.response?.status === 404) {
    // Handle not found
  }
}
```

### Graceful Degradation

```javascript
try {
  const response = await adsAPI.getProductAds(brandId, productId);
  return response;
} catch (error) {
  console.error('Error fetching ads:', error);
  
  // Return empty array instead of crashing
  if (error.response?.status === 404) {
    return { success: true, data: { ads: [], count: 0 } };
  }
  
  throw error;
}
```

## Response Format

### Standard Success Response

```javascript
{
  success: true,
  data: {
    // Actual data here
  },
  message: "Optional success message" // Sometimes included
}
```

### Standard Error Response

```javascript
{
  success: false,
  message: "Error description",
  detail: "Additional error details" // Optional
}
```

### Validation Error (422)

```javascript
{
  detail: [
    {
      loc: ["body", "email"],
      msg: "Invalid email format",
      type: "value_error"
    }
  ]
}
```

## ngrok Support

All requests include special header to bypass ngrok browser warning:

```javascript
headers: {
  'ngrok-skip-browser-warning': 'true'
}
```

This allows testing with ngrok URLs during development.

## Best Practices

1. ✅ Always use try-catch for API calls
2. ✅ Check `response.success` before accessing data
3. ✅ Use `apiFormData` for file uploads (not `api`)
4. ✅ Set appropriate timeouts for different operations
5. ✅ Handle 404 errors gracefully with empty data
6. ✅ Log errors for debugging but show user-friendly messages
7. ✅ Never manually add Authorization header (interceptor handles it)

## Testing API Connection

```javascript
// Quick health check
try {
  const response = await api.get('/health');
  console.log('Backend connected:', response);
} catch (error) {
  console.error('Backend connection failed:', error.message);
}
```
