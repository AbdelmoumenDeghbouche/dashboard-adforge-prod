import { useState, useEffect, useCallback, useRef } from 'react';
import { brandsAPI, videoPlaygroundAPI, subscriptionAPI, creditsAPI } from '../services/apiService';
import { useBrand } from '../contexts/BrandContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to fetch real dashboard data from backend APIs
 * Returns comprehensive metrics for dashboard display
 */
export const useDashboardData = () => {
  const { selectedBrand } = useBrand();
  const { currentUser } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    // Stats
    totalBrands: 0,
    totalProducts: 0,
    totalAds: 0,
    totalVideos: 0,
    
    // Credits & Subscription
    availableCredits: 0,
    usedCredits: 0,
    subscriptionPlan: 'free',
    
    // Recent items
    recentVideos: [],
    recentAds: [],
    
    // Loading states
    loading: true,
    error: null,
  });
  
  // Prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  
  // Extract brand ID from video URL (same logic as ProductVideos)
  const extractBrandFromUrl = useCallback((videoUrl) => {
    if (!videoUrl) return null;
    const match = videoUrl.match(/stores\/([^\/]+)\//);
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch (e) {
      return match[1];
    }
  }, []);
  
  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) {
      setDashboardData(prev => ({ ...prev, loading: false }));
      return;
    }
    
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('[useDashboardData] ⏸️ Skipping fetch - already in progress');
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('[useDashboardData] 🔄 Fetching dashboard data...');
      
      // Fetch all data in parallel
      const [
        brandsResponse,
        playgroundVideosResponse,
        jobVideosResponse,
        subscriptionResponse,
        creditsResponse
      ] = await Promise.allSettled([
        brandsAPI.getBrands(),
        videoPlaygroundAPI.getAllVideos(100, 'all'), // Fetch videos from playground
        videoPlaygroundAPI.getVideosFromJobs(100), // Fetch videos from jobs API
        subscriptionAPI.getSubscription(),
        creditsAPI.getBalance(),
      ]);
      
      // Process brands data
      console.log('[useDashboardData] 🔍 Raw brandsResponse:', brandsResponse);
      console.log('[useDashboardData] 🔍 brandsResponse.value:', brandsResponse.value);
      console.log('[useDashboardData] 🔍 brandsResponse.value?.data:', brandsResponse.value?.data);
      
      // Try multiple possible response structures
      let brandsData = [];
      if (brandsResponse.status === 'fulfilled') {
        const responseData = brandsResponse.value?.data;
        // Check if brands is in data.brands, data.data.brands, or directly in data
        brandsData = responseData?.brands || responseData?.data?.brands || (Array.isArray(responseData) ? responseData : []);
      }
      
      const totalBrands = brandsData.length;
      
      console.log('[useDashboardData] 📦 Brands fetched:', totalBrands);
      console.log('[useDashboardData] 📦 Brands data:', brandsData);
      
      // Process products data (sum from all brands)
      const totalProducts = brandsData.reduce((sum, brand) => sum + (brand.productCount || 0), 0);
      
      // Process ads data (sum adsCount from all brands)
      const totalAds = brandsData.reduce((sum, brand) => sum + (brand.adsCount || 0), 0);
      
      console.log('[useDashboardData] 📊 Products:', totalProducts, 'Ads:', totalAds);
      
      // Process videos data - COUNT ALL VIDEOS ACROSS ALL BRANDS
      let recentVideos = [];
      let totalVideos = 0;
      
      // Merge videos from both sources
      const playgroundVideos = playgroundVideosResponse.status === 'fulfilled' && playgroundVideosResponse.value?.success
        ? playgroundVideosResponse.value.data?.videos || []
        : [];
      const jobVideos = jobVideosResponse.status === 'fulfilled' && jobVideosResponse.value?.success
        ? jobVideosResponse.value.data?.videos || []
        : [];
      
      // Deduplicate by video_url
      const videoMap = new Map();
      [...playgroundVideos, ...jobVideos].forEach(v => {
        if (v.video_url && !videoMap.has(v.video_url)) {
          videoMap.set(v.video_url, v);
        }
      });
      
      const allVideos = Array.from(videoMap.values());
      
      console.log('[useDashboardData] 🎬 Videos merged:', {
        playground: playgroundVideos.length,
        jobs: jobVideos.length,
        total: allVideos.length
      });
      
      // Count ALL videos (don't filter by brand for total count)
      totalVideos = allVideos.length;
      
      // For recent videos, show videos from the selected brand if available
      if (selectedBrand?.brandId || selectedBrand?.id) {
        const currentBrandId = selectedBrand?.brandId || selectedBrand?.id;
        
        const brandVideos = allVideos.filter(v => {
          if (!v.video_url) return false;
          const urlBrandId = extractBrandFromUrl(v.video_url);
          return urlBrandId === currentBrandId;
        });
        
        console.log('[useDashboardData] 📹 Videos for selected brand (' + currentBrandId + '):', brandVideos.length);
        
        // Get recent videos from selected brand
        recentVideos = brandVideos
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
          .slice(0, 5)
          .map(video => ({
            id: video.job_id || video.id,
            title: video.original_prompt || video.product_name || video.productName || 'Vidéo publicitaire',
            thumbnail: video.thumbnail_url || video.video_url || null,
            status: video.status || 'completed',
            created_at: video.created_at || video.createdAt,
            brand_id: currentBrandId,
            product_id: video.product_id,
          }));
      } else {
        // If no brand selected, show recent videos from all brands
        recentVideos = allVideos
          .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
          .slice(0, 5)
          .map(video => ({
            id: video.job_id || video.id,
            title: video.original_prompt || video.product_name || video.productName || 'Vidéo publicitaire',
            thumbnail: video.thumbnail_url || video.video_url || null,
            status: video.status || 'completed',
            created_at: video.created_at || video.createdAt,
            brand_id: extractBrandFromUrl(video.video_url),
            product_id: video.product_id,
          }));
      }
      
      // Process subscription data
      const subscriptionData = subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value?.data : null;
      const subscriptionPlan = subscriptionData?.plan || 'free';
      
      // Process credits data from getBalance
      const creditsData = creditsResponse.status === 'fulfilled' ? creditsResponse.value?.data : null;
      const availableCredits = creditsData?.credits || 0;
      const usedCredits = creditsData?.credits_used || 0;
      
      console.log('[useDashboardData] 📊 Final Dashboard Stats:', {
        totalBrands,
        totalProducts,
        totalAds,
        totalVideos,
        recentVideos: recentVideos.length,
        availableCredits,
        usedCredits,
        subscriptionPlan
      });
      
      setDashboardData({
        totalBrands,
        totalProducts,
        totalAds,
        totalVideos,
        availableCredits,
        usedCredits,
        subscriptionPlan,
        recentVideos,
        recentAds: [], // Empty for now
        loading: false,
        error: null,
      });
      
    } catch (error) {
      console.error('[useDashboardData] ❌ Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors du chargement des données',
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [currentUser, selectedBrand, extractBrandFromUrl]);
  
  // Fetch data on mount and when user changes (not when brand changes to avoid spam)
  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]); // Only re-fetch when user changes, not on every brand change
  
  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  return {
    ...dashboardData,
    refresh,
  };
};

export default useDashboardData;

