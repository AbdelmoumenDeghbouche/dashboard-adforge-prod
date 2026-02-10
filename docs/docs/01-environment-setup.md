# Environment Setup

## Environment Variables

All environment variables are prefixed with `VITE_` for Vite to expose them to the frontend.

### `.env` File Structure

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCmB9xG09J-5tLSpmZ3Oyppm2DQvU6n0FE
VITE_FIREBASE_AUTH_DOMAIN=saas-adforge.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=saas-adforge
VITE_FIREBASE_STORAGE_BUCKET=saas-adforge.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=599347477659
VITE_FIREBASE_APP_ID=1:599347477659:web:fcb23a7dfc762412005a3e
VITE_FIREBASE_MEASUREMENT_ID=G-D8Z4H2Q8H6

# Backend API
VITE_API_BASE_URL=http://localhost:8000/

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ST3mmRtzJ1UpmKreTkVdU7hGrHTA1fWHGI9LUjOrFBtgjZdZtCtfLfrldi0NUmJkgLP91EWFzeCzdL8JwtHuw0W00yUOarR2K
```

## Accessing Environment Variables

In your code, access environment variables using `import.meta.env`:

```javascript
// Example from apiService.js
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Example from firebase.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

## Environment Validation

The app validates critical env vars on load:

```javascript
// From apiService.js
const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  throw new Error('Configuration error: Backend URL is not set');
}
```

## Development vs Production

### Development
```env
VITE_API_BASE_URL=http://localhost:8000/
```

### Production
```env
VITE_API_BASE_URL=https://api.adforge.com/
```

### Using ngrok (Development)
```env
VITE_API_BASE_URL=https://YOUR-NGROK-URL.ngrok-free.app/
```

**Note:** All API requests include `ngrok-skip-browser-warning: true` header to bypass ngrok's browser warning page.

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or use existing
3. Enable **Authentication** with Email/Password
4. Enable **Storage** for image uploads

### 2. Get Configuration
1. Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy configuration values to `.env`

### 3. Enable Authentication Methods
- Email/Password ✅ (Required)
- Google (Optional)
- Apple (Optional)

## Initial Setup Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd Adforge-dashboard

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your values
# Add Firebase config and backend URL

# 5. Start development server
npm run dev
```

## Verifying Setup

Once configured, the app should:
1. ✅ Connect to Firebase (check browser console for "[Firebase] Initialized")
2. ✅ Connect to backend (check for successful API health check)
3. ✅ Show login page without errors

## Common Issues

### Backend Connection Failed
```
Error: Configuration error: Backend URL is not set
```
**Solution:** Add `VITE_API_BASE_URL` to `.env`

### Firebase Not Configured
```
Error: Firebase config missing
```
**Solution:** Add all `VITE_FIREBASE_*` variables to `.env`

### CORS Errors
**Solution:** Backend must have proper CORS configuration to accept requests from frontend origin
