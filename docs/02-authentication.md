# Authentication

## Overview

Adforge uses **Firebase Authentication** for user management with **backend token verification** for API security.

## Authentication Flow

```
1. User signs up/logs in via Firebase
   ↓
2. Firebase returns user + ID token
   ↓
3. Frontend sends token to backend for verification
   ↓
4. Backend validates token and creates/retrieves user
   ↓
5. All API requests include Firebase ID token in Authorization header
```

## Firebase Configuration

### Location
`src/config/firebase.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
```

## Auth Context Provider

### Location
`src/contexts/AuthContext.jsx`

### Features
- ✅ Firebase auth state listener
- ✅ Automatic token verification with backend
- ✅ Token refresh with retry logic
- ✅ Session persistence (remember me)
- ✅ Automatic logout on token failure

### Usage

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, loading, isAuthenticated, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome {currentUser.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Auth State

```javascript
{
  currentUser,        // Firebase user object or null
  loading,            // true during initial auth check
  isAuthenticated,    // true if user is logged in and verified
  error,              // Error message if auth failed
  setError,           // Set error message
  setPersistenceType, // Set session vs local persistence
  logout,             // Logout function
  refreshAuthToken    // Manually refresh token
}
```

## Token Verification Flow

### Automatic Verification

When user logs in via Firebase:

```javascript
// AuthContext.jsx - onAuthStateChanged listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Get Firebase ID token
    const idToken = await user.getIdToken();
    
    // Verify with backend
    await authAPI.verifyToken(idToken);
    
    // Token valid - set user
    setCurrentUser(user);
  }
});
```

### With Retry Logic

```javascript
// Retries up to 3 times with exponential backoff
let retryCount = 0;
const maxRetries = 2;

while (!verificationSuccess && retryCount <= maxRetries) {
  try {
    const forceRefresh = retryCount > 0;
    const idToken = await user.getIdToken(forceRefresh);
    await authAPI.verifyToken(idToken);
    verificationSuccess = true;
  } catch (error) {
    retryCount++;
    if (retryCount > maxRetries) {
      // Clear auth and sign out
      await signOut(auth);
    } else {
      // Wait before retry (500ms, 1s, 2s)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
    }
  }
}
```

## Request Interceptor

All API requests automatically include the Firebase ID token:

```javascript
// From apiService.js
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Public Routes

These routes don't require authentication:

```javascript
const publicRoutes = [
  '/api/v1/auth/signup',
  '/api/v1/auth/verify-token',
  '/api/v1/auth/login',
  '/api/v1/auth/resend-verification'
];
```

## Session Persistence

### Remember Me (Local Storage)

```javascript
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// User session persists across browser restarts
await setPersistence(auth, browserLocalPersistence);
```

### Session Only (Session Storage)

```javascript
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

// User logged out when browser closes
await setPersistence(auth, browserSessionPersistence);
```

### Usage in Login Component

```javascript
const { setPersistenceType } = useAuth();

async function handleLogin(email, password, rememberMe) {
  // Set persistence first
  await setPersistenceType(rememberMe);
  
  // Then sign in
  await signInWithEmailAndPassword(auth, email, password);
}
```

## Logout Flow

### Manual Logout

```javascript
const { logout } = useAuth();

async function handleLogout() {
  const result = await logout();
  if (result.success) {
    // User logged out successfully
    navigate('/login');
  }
}
```

### Automatic Logout (Token Failure)

If token verification fails after retries:
1. Clear localStorage and sessionStorage
2. Sign out from Firebase
3. Redirect to login page

## Protected Routes

### Implementation

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

### Usage in Routes

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Token Refresh

### Automatic Refresh
Firebase automatically refreshes tokens before expiration (every ~55 minutes for 1-hour tokens).

### Manual Refresh

```javascript
const { refreshAuthToken } = useAuth();

async function handleManualRefresh() {
  const result = await refreshAuthToken();
  if (result.success) {
    console.log('Token refreshed successfully');
  }
}
```

## Error Handling

### Common Auth Errors

```javascript
// Token verification failed
catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - token invalid/expired
    logout();
  }
}
```

### Network Errors

```javascript
// Backend unavailable
catch (error) {
  if (error.request && !error.response) {
    // No response from server
    setError('Backend is temporarily unavailable');
  }
}
```

## Best Practices

1. ✅ Always wrap app in `<AuthProvider>`
2. ✅ Use `useAuth()` hook to access auth state
3. ✅ Check `isAuthenticated` before rendering protected content
4. ✅ Handle `loading` state to prevent flash of wrong content
5. ✅ Clear sensitive data on logout
6. ✅ Let Firebase handle token refresh automatically
7. ✅ Use retry logic for transient failures

## Security Notes

- 🔒 Firebase ID tokens expire after 1 hour
- 🔒 Backend verifies every token on every request
- 🔒 Never store tokens manually (Firebase handles this)
- 🔒 Always use HTTPS in production
- 🔒 Clear all storage on logout
