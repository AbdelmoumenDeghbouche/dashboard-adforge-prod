# Social Auth Endpoints (Meta & TikTok OAuth)

## Overview

Connect Meta (Facebook) and TikTok Ads accounts for ad publishing and analytics.

**Service:** `socialAuthAPI` from `src/services/apiService.js`

## Meta Ads OAuth

### 1. Initiate Meta OAuth

**Start Meta Ads OAuth flow**

```javascript
POST /api/v1/social-auth/meta/authorize
```

**Request:**
```javascript
{
  redirect_uri: "https://yourdomain.com/oauth/meta/callback"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    authorization_url: "https://www.facebook.com/v18.0/dialog/oauth?...",
    state: "random_state_token"
  }
}
```

**Frontend Usage:**
```javascript
import { socialAuthAPI } from '../services/apiService';

async function connectMetaAccount() {
  const redirectUri = `${window.location.origin}/oauth/meta/callback`;
  
  const response = await socialAuthAPI.initMetaOAuth(redirectUri);
  
  // Redirect user to Meta authorization page
  window.location.href = response.data.authorization_url;
}
```

---

### 2. Handle OAuth Callback

After user authorizes, Meta redirects to your callback URL with code:

```
https://yourdomain.com/oauth/meta/callback?code=ABC123&state=xyz
```

Backend automatically:
1. Exchanges code for access token
2. Fetches user's ad accounts
3. Stores connection in database

**Frontend Callback Handler:**
```javascript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MetaOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      alert('OAuth failed: ' + error);
      navigate('/ad-accounts');
      return;
    }
    
    if (code) {
      // Backend handles token exchange automatically
      // Just show success and redirect
      alert('Meta account connected successfully!');
      navigate('/ad-accounts');
    }
  }, [searchParams, navigate]);
  
  return <div>Connecting Meta account...</div>;
}
```

---

## TikTok Ads OAuth

### 3. Initiate TikTok OAuth

**Start TikTok Ads OAuth flow**

```javascript
POST /api/v1/social-auth/tiktok/authorize
```

**Request:**
```javascript
{
  redirect_uri: "https://yourdomain.com/oauth/tiktok/callback"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    authorization_url: "https://business-api.tiktok.com/portal/auth?...",
    state: "random_state_token"
  }
}
```

**Frontend Usage:**
```javascript
async function connectTikTokAccount() {
  const redirectUri = `${window.location.origin}/oauth/tiktok/callback`;
  
  const response = await socialAuthAPI.initTikTokOAuth(redirectUri);
  
  // Redirect user to TikTok authorization page
  window.location.href = response.data.authorization_url;
}
```

---

## Account Management

### 4. Get Connected Accounts

**Get all connected social accounts**

```javascript
GET /api/v1/social-auth/accounts
```

**Response:**
```javascript
{
  success: true,
  data: {
    accounts: [
      {
        account_id: "social_account_123",
        platform: "meta",
        platform_user_id: "fb_user_456",
        platform_user_name: "John Doe",
        email: "john@example.com",
        access_token_expires_at: "2024-06-15T10:00:00Z",
        is_active: true,
        ad_accounts_count: 3,
        connected_at: "2024-01-15T10:00:00Z",
        last_synced_at: "2024-01-20T15:30:00Z"
      },
      {
        account_id: "social_account_789",
        platform: "tiktok",
        platform_user_id: "tt_user_012",
        platform_user_name: "Jane Smith",
        email: "jane@example.com",
        is_active: true,
        ad_accounts_count: 2,
        connected_at: "2024-01-18T12:00:00Z"
      }
    ],
    count: 2
  }
}
```

**Frontend Usage:**
```javascript
const response = await socialAuthAPI.getConnectedAccounts();
const accounts = response.data.accounts;

// Separate by platform
const metaAccounts = accounts.filter(a => a.platform === 'meta');
const tiktokAccounts = accounts.filter(a => a.platform === 'tiktok');
```

---

### 5. Get Ad Accounts

**Get ad accounts for connected social account**

```javascript
GET /api/v1/social-auth/accounts/{accountId}/ad-accounts?refresh={refresh}
```

**Query Params:**
```javascript
{
  refresh: false  // true = fetch fresh from platform, false = use cached
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    ad_accounts: [
      {
        ad_account_id: "act_123456789",
        name: "My Business Ad Account",
        currency: "USD",
        timezone: "America/Los_Angeles",
        account_status: "ACTIVE",
        spend_cap: 1000.00,
        balance: 750.50,
        can_create_ads: true,
        permissions: ["ANALYZE", "ADVERTISE", "MANAGE"]
      }
      // ... more ad accounts
    ],
    count: 3,
    last_synced_at: "2024-01-20T15:30:00Z"
  }
}
```

**Frontend Usage:**
```javascript
async function loadAdAccounts(accountId, forceRefresh = false) {
  const response = await socialAuthAPI.getAdAccounts(accountId, forceRefresh);
  return response.data.ad_accounts;
}
```

---

### 6. Disconnect Account

**Disconnect social account**

```javascript
DELETE /api/v1/social-auth/accounts/{accountId}
```

**Response:**
```javascript
{
  success: true,
  message: "Account disconnected successfully"
}
```

**Frontend Usage:**
```javascript
async function disconnectAccount(accountId) {
  if (!confirm('Disconnect this account?')) return;
  
  await socialAuthAPI.disconnectAccount(accountId);
  alert('Account disconnected');
  
  // Refresh accounts list
  await loadConnectedAccounts();
}
```

---

### 7. Health Check

**Check social auth service health**

```javascript
GET /api/v1/social-auth/health
```

**Response:**
```javascript
{
  success: true,
  status: "healthy",
  services: {
    meta: "operational",
    tiktok: "operational"
  }
}
```

**Frontend Usage:**
```javascript
const health = await socialAuthAPI.healthCheck();
console.log('Social auth status:', health.data.status);
```

---

## Complete Ad Accounts Integration

```javascript
import { useState, useEffect } from 'react';
import { socialAuthAPI } from '../services/apiService';

function AdAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [adAccounts, setAdAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadConnectedAccounts();
  }, []);
  
  async function loadConnectedAccounts() {
    setLoading(true);
    try {
      const response = await socialAuthAPI.getConnectedAccounts();
      setConnectedAccounts(response.data.accounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadAdAccounts(account) {
    setSelectedAccount(account);
    setLoading(true);
    
    try {
      const response = await socialAuthAPI.getAdAccounts(account.account_id);
      setAdAccounts(response.data.ad_accounts);
    } catch (error) {
      console.error('Failed to load ad accounts:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function connectMeta() {
    const redirectUri = `${window.location.origin}/oauth/meta/callback`;
    const response = await socialAuthAPI.initMetaOAuth(redirectUri);
    window.location.href = response.data.authorization_url;
  }
  
  async function connectTikTok() {
    const redirectUri = `${window.location.origin}/oauth/tiktok/callback`;
    const response = await socialAuthAPI.initTikTokOAuth(redirectUri);
    window.location.href = response.data.authorization_url;
  }
  
  async function handleDisconnect(accountId) {
    if (!confirm('Disconnect this account?')) return;
    
    await socialAuthAPI.disconnectAccount(accountId);
    await loadConnectedAccounts();
    setSelectedAccount(null);
    setAdAccounts([]);
  }
  
  return (
    <div>
      <h2>Ad Accounts</h2>
      
      {/* Connect Buttons */}
      <div>
        <button onClick={connectMeta}>Connect Meta Ads</button>
        <button onClick={connectTikTok}>Connect TikTok Ads</button>
      </div>
      
      {/* Connected Accounts */}
      <div>
        <h3>Connected Accounts</h3>
        {connectedAccounts.map(account => (
          <div key={account.account_id}>
            <h4>{account.platform_user_name} ({account.platform})</h4>
            <p>{account.email}</p>
            <p>{account.ad_accounts_count} ad accounts</p>
            <button onClick={() => loadAdAccounts(account)}>
              View Ad Accounts
            </button>
            <button onClick={() => handleDisconnect(account.account_id)}>
              Disconnect
            </button>
          </div>
        ))}
      </div>
      
      {/* Ad Accounts */}
      {selectedAccount && (
        <div>
          <h3>Ad Accounts for {selectedAccount.platform_user_name}</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {adAccounts.map(adAccount => (
                <div key={adAccount.ad_account_id}>
                  <h4>{adAccount.name}</h4>
                  <p>ID: {adAccount.ad_account_id}</p>
                  <p>Status: {adAccount.account_status}</p>
                  <p>Balance: ${adAccount.balance} {adAccount.currency}</p>
                  <p>Permissions: {adAccount.permissions.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## OAuth Scopes

### Meta Ads
- `ads_management` - Create and manage ads
- `ads_read` - Read ad data and insights
- `business_management` - Manage business accounts
- `pages_read_engagement` - Read page engagement

### TikTok Ads
- `ad.management` - Create and manage ads
- `ad.read` - Read ad data
- `audience.read` - Read audience data
- `reporting.read` - Access analytics

## Token Management

### Access Token Expiration
- **Meta**: 60 days (auto-refreshed by backend)
- **TikTok**: 30 days (auto-refreshed by backend)

### Refresh Flow
Backend automatically refreshes tokens before expiration. Frontend doesn't need to handle token refresh.

## Best Practices

1. ✅ Handle OAuth errors gracefully
2. ✅ Show loading state during OAuth flow
3. ✅ Store redirect URI in environment variables
4. ✅ Validate state parameter to prevent CSRF
5. ✅ Show connected account status clearly
6. ✅ Allow refreshing ad accounts list
7. ✅ Confirm before disconnecting accounts
8. ✅ Handle expired tokens gracefully
