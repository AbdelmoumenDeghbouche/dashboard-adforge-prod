import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { BrandProvider } from './contexts/BrandContext';
import { JobNotificationProvider } from './contexts/JobNotificationContext';
import { TasksProvider } from './contexts/TasksContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationToast from './components/NotificationToast';

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Accueil = lazy(() => import("./pages/Accueil"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProductIngestion = lazy(() => import("./pages/ProductIngestion"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const GeneratedAds = lazy(() => import("./pages/GeneratedAds"));
const VideoGeneration = lazy(() => import("./pages/VideoGeneration"));
const BrandKit = lazy(() => import("./pages/BrandKit"));
const Videos = lazy(() => import("./pages/Videos"));
const AdAccounts = lazy(() => import("./pages/AdAccounts"));
const TrendingAds = lazy(() => import("./pages/TrendingAds"));
const AvatarVideoGeneration = lazy(() => import("./pages/AvatarVideoGeneration"));
const VoiceOverGeneration = lazy(() => import("./pages/VoiceOverGeneration"));
const ImageAdGenerator = lazy(() => import("./pages/ImageAdGenerator"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Account = lazy(() => import("./pages/Account"));
const ShopifyIntegration = lazy(() => import("./pages/ShopifyIntegration"));
const StrategicAnalysis = lazy(() => import("./pages/StrategicAnalysis"));
const Tasks = lazy(() => import("./pages/Tasks"));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BrandProvider>
          <JobNotificationProvider>
            <TasksProvider>
              <Suspense fallback={<LoadingSpinner />}>
              <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route 
            path="/accueil" 
            element={
              <ProtectedRoute>
                <Accueil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ingestion" 
            element={
              <ProtectedRoute>
                <ProductIngestion />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/product/:productId" 
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generated-ads" 
            element={
              <ProtectedRoute>
                <GeneratedAds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generation" 
            element={
              <ProtectedRoute>
                <VideoGeneration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/brand" 
            element={
              <ProtectedRoute>
                <BrandKit />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ad-accounts"
            element={
              <ProtectedRoute>
                <AdAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategic-analysis"
            element={
              <ProtectedRoute>
                <StrategicAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trending-ads"
            element={
              <ProtectedRoute>
                <TrendingAds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/avatar-video"
            element={
              <ProtectedRoute>
                <AvatarVideoGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-generation"
            element={
              <ProtectedRoute>
                <VoiceOverGeneration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image-ads"
            element={
              <ProtectedRoute>
                <ImageAdGenerator />
              </ProtectedRoute>
            }
          />

          {/* Shopify Integration */}
          <Route
            path="/shopify"
            element={
              <ProtectedRoute>
                <ShopifyIntegration />
              </ProtectedRoute>
            }
          />

          {/* OAuth Callback Routes */}
          <Route
            path="/oauth/callback/meta"
            element={
              <ProtectedRoute>
                <OAuthCallback platform="meta" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/oauth/callback/tiktok"
            element={
              <ProtectedRoute>
                <OAuthCallback platform="tiktok" />
              </ProtectedRoute>
            }
          />

          {/* Account Settings */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

            <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            {/* Global notification toast */}
            <NotificationToast />
            </TasksProvider>
          </JobNotificationProvider>
        </BrandProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
