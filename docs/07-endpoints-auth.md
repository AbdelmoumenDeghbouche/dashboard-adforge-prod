# Authentication Endpoints

## Overview

Auth endpoints handle user signup, login verification, and account management.

**Base URL:** `VITE_API_BASE_URL` from .env

**Service:** `authAPI` from `src/services/apiService.js`

## Endpoints

### 1. Sign Up

**Create new user account**

```javascript
POST /api/v1/auth/signup
```

**Request:**
```javascript
{
  email: "user@example.com",
  password: "securePassword123",
  display_name: "John Doe"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_abc123",
    email: "user@example.com",
    display_name: "John Doe",
    created_at: "2024-01-15T10:00:00Z"
  }
}
```

**Frontend Usage:**
```javascript
import { authAPI } from '../services/apiService';

const result = await authAPI.signup(email, password, displayName);
```

---

### 2. Verify Token

**Verify Firebase ID token with backend**

```javascript
POST /api/v1/auth/verify-token
```

**Request:**
```javascript
{
  id_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_abc123",
    email: "user@example.com",
    verified: true
  }
}
```

**Frontend Usage:**
```javascript
// Automatically called by AuthContext
const idToken = await user.getIdToken();
await authAPI.verifyToken(idToken);
```

---

### 3. Get Current User

**Get current authenticated user details**

```javascript
GET /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer {firebase_id_token}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_abc123",
    email: "user@example.com",
    display_name: "John Doe",
    photo_url: "https://...",
    created_at: "2024-01-15T10:00:00Z",
    subscription: {
      plan: "pro",
      status: "active",
      credits_remaining: 100
    }
  }
}
```

**Frontend Usage:**
```javascript
const userData = await authAPI.getCurrentUser();
```

---

### 4. Update Profile

**Update user profile information**

```javascript
PATCH /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer {firebase_id_token}
```

**Request:**
```javascript
{
  display_name: "Jane Doe",
  photo_url: "https://example.com/photo.jpg"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    user_id: "user_abc123",
    email: "user@example.com",
    display_name: "Jane Doe",
    photo_url: "https://example.com/photo.jpg"
  }
}
```

**Frontend Usage:**
```javascript
await authAPI.updateProfile({
  display_name: newName,
  photo_url: newPhotoUrl
});
```

---

### 5. Delete Account

**Permanently delete user account**

```javascript
DELETE /api/v1/auth/me
```

**Headers:**
```
Authorization: Bearer {firebase_id_token}
```

**Response:**
```javascript
{
  success: true,
  message: "Account deleted successfully"
}
```

**Frontend Usage:**
```javascript
await authAPI.deleteAccount();
// Then sign out from Firebase
await signOut(auth);
```

---

### 6. Logout

**Revoke refresh tokens (backend cleanup)**

```javascript
POST /api/v1/auth/logout
```

**Headers:**
```
Authorization: Bearer {firebase_id_token}
```

**Response:**
```javascript
{
  success: true,
  message: "Logged out successfully"
}
```

**Frontend Usage:**
```javascript
// Called by AuthContext.logout()
await authAPI.logout();
await signOut(auth);
```

---

### 7. Resend Verification Email

**Resend email verification link**

```javascript
POST /api/v1/auth/resend-verification
```

**Request:**
```javascript
{
  email: "user@example.com"
}
```

**Response:**
```javascript
{
  success: true,
  message: "Verification email sent"
}
```

**Frontend Usage:**
```javascript
await authAPI.resendVerification(email);
```

---

## Complete Auth Flow Example

### Sign Up Flow

```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../services/apiService';

async function handleSignup(email, password, displayName) {
  try {
    // 1. Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    // 2. Update display name in Firebase
    await updateProfile(userCredential.user, { displayName });
    
    // 3. Get ID token
    const idToken = await userCredential.user.getIdToken();
    
    // 4. Verify token with backend (creates user in backend DB)
    await authAPI.verifyToken(idToken);
    
    // 5. Success - AuthContext will detect user
    console.log('Signup successful');
    
  } catch (error) {
    console.error('Signup failed:', error.message);
  }
}
```

### Login Flow

```javascript
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../config/firebase';

async function handleLogin(email, password, rememberMe) {
  try {
    // 1. Set persistence
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    }
    
    // 2. Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // 3. AuthContext automatically:
    //    - Detects user via onAuthStateChanged
    //    - Gets ID token
    //    - Verifies with backend
    //    - Sets currentUser
    
    console.log('Login successful');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error('User not found');
    } else if (error.code === 'auth/wrong-password') {
      console.error('Incorrect password');
    } else {
      console.error('Login failed:', error.message);
    }
  }
}
```

### Logout Flow

```javascript
import { useAuth } from '../contexts/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  async function handleLogout() {
    const result = await logout();
    
    if (result.success) {
      // Redirect to login
      navigate('/login');
    } else {
      console.error('Logout failed:', result.error);
    }
  }
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## Error Codes

### Firebase Auth Errors

| Code | Description | User Message |
|------|-------------|--------------|
| `auth/user-not-found` | No user with this email | "Aucun compte trouvé avec cet email" |
| `auth/wrong-password` | Incorrect password | "Mot de passe incorrect" |
| `auth/email-already-in-use` | Email already registered | "Cet email est déjà utilisé" |
| `auth/weak-password` | Password too weak | "Le mot de passe doit contenir au moins 6 caractères" |
| `auth/invalid-email` | Invalid email format | "Format d'email invalide" |
| `auth/network-request-failed` | Network error | "Erreur de connexion réseau" |

### Backend Errors

| Status | Description | Handling |
|--------|-------------|----------|
| 401 | Unauthorized - invalid token | Logout user |
| 403 | Forbidden - no permission | Show error message |
| 404 | User not found | Re-verify or logout |
| 422 | Validation error | Show field-specific errors |
| 500 | Server error | "Server error, try again" |

## Security Considerations

1. 🔒 **Never expose Firebase private key** - only use in backend
2. 🔒 **Always use HTTPS in production**
3. 🔒 **Let Firebase handle token storage** - don't store manually
4. 🔒 **Validate on backend** - never trust frontend-only validation
5. 🔒 **Use strong password requirements**
6. 🔒 **Implement rate limiting** - prevent brute force attacks
7. 🔒 **Clear all storage on logout** - prevent token leakage
