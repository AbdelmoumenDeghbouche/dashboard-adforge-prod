# Adforge Dashboard - Frontend Integration Guide

Complete documentation for integrating with the Adforge backend API.

## 📚 Documentation Structure

This documentation is organized into logical sections for easy navigation:

### 🚀 Getting Started
1. **[Environment Setup](./01-environment-setup.md)** - Environment variables and Firebase configuration
2. **[Authentication](./02-authentication.md)** - Firebase auth implementation and token management
3. **[API Service](./03-api-service.md)** - Core API setup with Axios interceptors

### 🏗️ Core Architecture
4. **[Brand Context](./04-brand-context.md)** - Brand management and state
5. **[State Management](./05-state-management.md)** - All Context providers and hooks
6. **[Job Polling](./06-job-polling.md)** - Async job handling and polling patterns

### 📡 API Endpoints

#### Authentication & Users
7. **[Auth Endpoints](./07-endpoints-auth.md)** - Signup, login, token verification

#### Brand & Products
8. **[Brand & Product Endpoints](./08-endpoints-brands.md)** - Brand/product CRUD operations
9. **[Scraping Endpoints](./09-endpoints-scraping.md)** - Product/store scraping

#### Ad Generation
10. **[Bulk Ad Generation](./10-endpoints-bulk-ads.md)** - Dynamic bulk ad generation
11. **[Image Chat Endpoints](./11-endpoints-image-chat.md)** - Conversational image modification

#### Strategic Analysis Pipeline
12. **[Strategic Analysis Flow](./12-strategic-analysis-flow.md)** - Complete Module 1-5 pipeline
13. **[Research Endpoints](./13-endpoints-research.md)** - Product research
14. **[Strategic Analysis Endpoints](./14-endpoints-strategic-analysis.md)** - Angle intelligence & creatives
15. **[Video Generation Endpoints](./15-endpoints-video-generation.md)** - Sora/Kling video generation

#### Avatar & Voice
16. **[Avatar Video Endpoints](./16-endpoints-avatar.md)** - Avatar video generation
17. **[Voice Endpoints](./17-endpoints-voice.md)** - Voice recommendations and STS

#### Video Playground
18. **[Video Playground Endpoints](./18-endpoints-video-playground.md)** - Simple video generation

#### Social & Payments
19. **[Social Auth Endpoints](./19-endpoints-social-auth.md)** - Meta/TikTok OAuth
20. **[Subscription Endpoints](./20-endpoints-subscriptions.md)** - Stripe subscriptions & credits

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Firebase and backend URL

# 3. Run development server
npm run dev
```

## 🔑 Key Concepts

### Job-Based Architecture
Most operations use **job-based async processing**:
1. Trigger endpoint returns `job_id` immediately
2. Poll `/api/v1/jobs/{job_id}` for status
3. Job completes with `result_data`

### Context Providers
The app uses React Context for state:
- **AuthContext** - User authentication
- **BrandContext** - Brand & product management
- **StrategicChatContext** - Strategic analysis workflow
- **TasksContext** - Background job tracking

### Firebase Integration
- **Authentication** - Firebase Auth with backend token verification
- **Storage** - Firebase Storage for image uploads
- **Real-time** - Firestore for job status updates (backend-driven)

## 📊 Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Firebase** - Auth & Storage
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

## 🔗 Related Documentation

- [Backend API Documentation](../backend_doc.json)
- [Testing Guide](../TESTING_GUIDE.md)

## 💡 Support

For questions or issues, check the specific endpoint documentation or review the source code in `/src/services/`.
