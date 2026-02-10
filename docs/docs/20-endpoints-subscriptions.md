# Subscription & Credits Endpoints

## Overview

Manage Stripe subscriptions, one-time credit purchases, and credit balance.

**Services:**
- `subscriptionAPI` from `apiService.js`
- `creditsAPI` from `apiService.js`

## Subscription Endpoints

### 1. Get Available Plans

**Get all subscription plans**

```javascript
GET /api/v1/subscriptions/plans
```

**Response:**
```javascript
{
  success: true,
  data: {
    plans: [
      {
        plan_id: "free",
        name: "Free",
        price: 0,
        billing_period: "month",
        credits_per_month: 10,
        features: [
          "10 video generations per month",
          "Basic templates",
          "Email support"
        ],
        stripe_price_id: null
      },
      {
        plan_id: "pro",
        name: "Pro",
        price: 49,
        billing_period: "month",
        credits_per_month: 100,
        features: [
          "100 video generations per month",
          "All templates",
          "Priority support",
          "Advanced analytics"
        ],
        stripe_price_id: "price_abc123",
        popular: true
      },
      {
        plan_id: "enterprise",
        name: "Enterprise",
        price: 199,
        billing_period: "month",
        credits_per_month: 500,
        features: [
          "500 video generations per month",
          "Custom branding",
          "Dedicated support",
          "API access",
          "White-label option"
        ],
        stripe_price_id: "price_def456"
      }
    ]
  }
}
```

**Frontend Usage:**
```javascript
import { subscriptionAPI } from '../services/apiService';

const response = await subscriptionAPI.getPlans();
const plans = response.data.plans;

// Display plans
plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.price}/month - ${plan.credits_per_month} credits`);
});
```

---

### 2. Get Current Subscription

**Get user's current subscription**

```javascript
GET /api/v1/subscriptions/subscription
```

**Response:**
```javascript
{
  success: true,
  data: {
    subscription_id: "sub_123",
    plan_id: "pro",
    plan_name: "Pro",
    status: "active",  // active | cancelled | past_due | trialing
    current_period_start: "2024-01-01T00:00:00Z",
    current_period_end: "2024-02-01T00:00:00Z",
    cancel_at_period_end: false,
    
    // Credits
    credits_per_month: 100,
    credits_used_this_period: 35,
    credits_remaining: 65,
    
    // Billing
    price: 49,
    currency: "USD",
    billing_period: "month",
    next_billing_date: "2024-02-01T00:00:00Z",
    
    // Stripe
    stripe_subscription_id: "sub_stripe_xyz",
    stripe_customer_id: "cus_stripe_abc"
  }
}
```

**Frontend Usage:**
```javascript
const response = await subscriptionAPI.getSubscription();
const subscription = response.data;

console.log(`Plan: ${subscription.plan_name}`);
console.log(`Credits: ${subscription.credits_remaining}/${subscription.credits_per_month}`);
```

---

### 3. Create Checkout Session

**Create Stripe checkout session for subscription**

```javascript
POST /api/v1/subscriptions/checkout
```

**Request:**
```javascript
{
  plan: "pro",
  success_url: "https://yourdomain.com/checkout/success",
  cancel_url: "https://yourdomain.com/checkout/cancel"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    checkout_url: "https://checkout.stripe.com/c/pay/cs_test_...",
    session_id: "cs_test_abc123"
  }
}
```

**Frontend Usage:**
```javascript
async function subscribeToPlan(planId) {
  const successUrl = `${window.location.origin}/checkout/success`;
  const cancelUrl = `${window.location.origin}/pricing`;
  
  const response = await subscriptionAPI.createCheckout(
    planId,
    successUrl,
    cancelUrl
  );
  
  // Redirect to Stripe Checkout
  window.location.href = response.data.checkout_url;
}
```

---

### 4. Create Billing Portal Session

**Create Stripe billing portal session**

```javascript
POST /api/v1/subscriptions/billing-portal
```

**Request:**
```javascript
{
  return_url: "https://yourdomain.com/account"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    portal_url: "https://billing.stripe.com/p/session/..."
  }
}
```

**Frontend Usage:**
```javascript
async function openBillingPortal() {
  const returnUrl = `${window.location.origin}/account`;
  
  const response = await subscriptionAPI.createBillingPortal(returnUrl);
  
  // Redirect to Stripe billing portal
  window.location.href = response.data.portal_url;
}
```

---

### 5. Check Credits

**Check if user has enough credits for operation**

```javascript
POST /api/v1/subscriptions/check-credits
```

**Request:**
```javascript
{
  operation_type: "video_generation",  // video_generation | ad_generation | avatar_video
  quantity: 1
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    has_sufficient_credits: true,
    credits_required: 1,
    credits_available: 65,
    credits_remaining_after: 64
  }
}
```

**Frontend Usage:**
```javascript
async function checkCredits(operationType, quantity = 1) {
  const response = await subscriptionAPI.checkCredits(operationType, quantity);
  
  if (!response.data.has_sufficient_credits) {
    alert('Insufficient credits. Please upgrade your plan.');
    return false;
  }
  
  return true;
}
```

---

### 6. Schedule Cancellation

**Cancel subscription at period end**

```javascript
POST /api/v1/subscriptions/schedule-cancellation
```

**Request:**
```javascript
{}  // Empty body
```

**Response:**
```javascript
{
  success: true,
  data: {
    subscription_id: "sub_123",
    cancel_at_period_end: true,
    current_period_end: "2024-02-01T00:00:00Z",
    message: "Subscription will be cancelled on 2024-02-01"
  }
}
```

**Frontend Usage:**
```javascript
async function cancelSubscription() {
  if (!confirm('Cancel subscription at end of billing period?')) return;
  
  await subscriptionAPI.scheduleCancellation();
  alert('Subscription will be cancelled at the end of current period');
}
```

---

### 7. Reactivate Subscription

**Cancel scheduled cancellation**

```javascript
POST /api/v1/subscriptions/reactivate
```

**Request:**
```javascript
{}  // Empty body
```

**Response:**
```javascript
{
  success: true,
  data: {
    subscription_id: "sub_123",
    cancel_at_period_end: false,
    message: "Subscription reactivated"
  }
}
```

**Frontend Usage:**
```javascript
async function reactivateSubscription() {
  await subscriptionAPI.reactivate();
  alert('Subscription reactivated!');
}
```

---

## Credits Endpoints

### 8. Get Credit Packages

**Get available one-time credit packages**

```javascript
GET /api/v1/credits/packages
```

**Response:**
```javascript
{
  success: true,
  data: {
    packages: [
      {
        package_id: "credits_10",
        name: "Starter Pack",
        credits: 10,
        price: 9,
        currency: "USD",
        stripe_price_id: "price_credits_10",
        best_value: false
      },
      {
        package_id: "credits_50",
        name: "Pro Pack",
        credits: 50,
        price: 39,
        currency: "USD",
        price_per_credit: 0.78,
        savings_percent: 13,
        stripe_price_id: "price_credits_50",
        best_value: true
      },
      {
        package_id: "credits_100",
        name: "Enterprise Pack",
        credits: 100,
        price: 69,
        currency: "USD",
        price_per_credit: 0.69,
        savings_percent: 23,
        stripe_price_id: "price_credits_100",
        best_value: false
      }
    ]
  }
}
```

**Frontend Usage:**
```javascript
import { creditsAPI } from '../services/apiService';

const response = await creditsAPI.getPackages();
const packages = response.data.packages;
```

---

### 9. Get Credit Balance

**Get current credit balance**

```javascript
GET /api/v1/credits/balance
```

**Response:**
```javascript
{
  success: true,
  data: {
    total_credits: 75,
    subscription_credits: 65,    // From monthly subscription
    purchased_credits: 10,       // From one-time purchases
    subscription_plan: "pro",
    credits_per_month: 100,
    credits_used_this_period: 35
  }
}
```

**Frontend Usage:**
```javascript
const response = await creditsAPI.getBalance();
const balance = response.data;

console.log(`Total: ${balance.total_credits} credits`);
console.log(`Subscription: ${balance.subscription_credits}`);
console.log(`Purchased: ${balance.purchased_credits}`);
```

---

### 10. Purchase Credits

**Buy one-time credit package**

```javascript
POST /api/v1/credits/purchase
```

**Request:**
```javascript
{
  package_id: "credits_50",
  success_url: "https://yourdomain.com/credits/success",
  cancel_url: "https://yourdomain.com/credits"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    checkout_url: "https://checkout.stripe.com/c/pay/cs_test_...",
    session_id: "cs_test_xyz789"
  }
}
```

**Frontend Usage:**
```javascript
async function purchaseCredits(packageId) {
  const successUrl = `${window.location.origin}/credits/success`;
  const cancelUrl = `${window.location.origin}/credits`;
  
  const response = await creditsAPI.purchaseCredits(
    packageId,
    successUrl,
    cancelUrl
  );
  
  // Redirect to Stripe Checkout
  window.location.href = response.data.checkout_url;
}
```

---

### 11. Get Transaction History

**Get credit transaction history**

```javascript
GET /api/v1/credits/transactions?limit={limit}
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
    transactions: [
      {
        transaction_id: "txn_123",
        type: "credit",              // credit | debit
        amount: 50,
        description: "Purchased 50 credits",
        operation_type: "purchase",  // purchase | video_generation | ad_generation
        created_at: "2024-01-20T10:00:00Z",
        balance_after: 115
      },
      {
        transaction_id: "txn_124",
        type: "debit",
        amount: 1,
        description: "Video generation",
        operation_type: "video_generation",
        created_at: "2024-01-21T15:30:00Z",
        balance_after: 114
      }
    ],
    count: 25
  }
}
```

**Frontend Usage:**
```javascript
const response = await creditsAPI.getTransactions(50);
const transactions = response.data.transactions;

// Display history
transactions.forEach(txn => {
  console.log(`${txn.created_at}: ${txn.type === 'credit' ? '+' : '-'}${txn.amount} - ${txn.description}`);
});
```

---

## Complete Subscription Management

```javascript
import { useState, useEffect } from 'react';
import { subscriptionAPI, creditsAPI } from '../services/apiService';

function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  async function loadData() {
    setLoading(true);
    try {
      const [subResponse, plansResponse, creditsResponse] = await Promise.all([
        subscriptionAPI.getSubscription(),
        subscriptionAPI.getPlans(),
        creditsAPI.getBalance()
      ]);
      
      setCurrentSub(subResponse.data);
      setPlans(plansResponse.data.plans);
      setCredits(creditsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUpgrade(planId) {
    const successUrl = `${window.location.origin}/subscription/success`;
    const cancelUrl = `${window.location.origin}/subscription`;
    
    const response = await subscriptionAPI.createCheckout(
      planId,
      successUrl,
      cancelUrl
    );
    
    window.location.href = response.data.checkout_url;
  }
  
  async function handleManageBilling() {
    const returnUrl = `${window.location.origin}/subscription`;
    const response = await subscriptionAPI.createBillingPortal(returnUrl);
    window.location.href = response.data.portal_url;
  }
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Current Subscription */}
      <div className="current-subscription">
        <h2>Current Plan: {currentSub.plan_name}</h2>
        <p>Status: {currentSub.status}</p>
        <p>Credits: {currentSub.credits_remaining}/{currentSub.credits_per_month}</p>
        <p>Next billing: {new Date(currentSub.next_billing_date).toLocaleDateString()}</p>
        
        {currentSub.cancel_at_period_end && (
          <div className="cancellation-notice">
            <p>⚠️ Your subscription will be cancelled on {new Date(currentSub.current_period_end).toLocaleDateString()}</p>
            <button onClick={() => subscriptionAPI.reactivate()}>Reactivate</button>
          </div>
        )}
        
        <button onClick={handleManageBilling}>Manage Billing</button>
      </div>
      
      {/* Available Plans */}
      <div className="plans">
        <h2>Available Plans</h2>
        {plans.map(plan => (
          <div key={plan.plan_id} className={plan.popular ? 'popular' : ''}>
            <h3>{plan.name}</h3>
            <p className="price">${plan.price}/month</p>
            <p>{plan.credits_per_month} credits/month</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            
            {currentSub.plan_id !== plan.plan_id && (
              <button onClick={() => handleUpgrade(plan.plan_id)}>
                {plan.price > currentSub.price ? 'Upgrade' : 'Downgrade'}
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Credit Balance */}
      <div className="credits-balance">
        <h3>Credit Balance</h3>
        <p>Total: {credits.total_credits} credits</p>
        <p>From subscription: {credits.subscription_credits}</p>
        <p>Purchased: {credits.purchased_credits}</p>
      </div>
    </div>
  );
}
```

## Operation Credit Costs

| Operation | Credits | Notes |
|-----------|---------|-------|
| Video Generation (Sora/Kling) | 1 | Per video |
| Bulk Ad Generation | 0.1 per ad | Minimum 1 credit |
| Avatar Video | 1 | Per video |
| Image Chat Modification | 0.5 | Per modification |
| Strategic Analysis | 0 | Free (included) |

## Best Practices

1. ✅ Check credits before expensive operations
2. ✅ Show credit balance prominently in UI
3. ✅ Provide upgrade prompts when credits low
4. ✅ Handle Stripe redirects gracefully
5. ✅ Display transaction history for transparency
6. ✅ Allow easy upgrade/downgrade
7. ✅ Show next billing date clearly
8. ✅ Provide billing portal access
