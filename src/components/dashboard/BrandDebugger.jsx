import React, { useEffect, useState } from 'react';
import { useBrand } from '../../contexts/BrandContext';
import { useAuth } from '../../contexts/AuthContext';
import { brandsAPI } from '../../services/apiService';

/**
 * Brand Debugger Component
 * 
 * This component helps diagnose why brands are not showing up.
 * Add this temporarily to your dashboard to see what's happening.
 * 
 * Usage: <BrandDebugger />
 */
const BrandDebugger = () => {
  const { brands, loading, error } = useBrand();
  const { currentUser } = useAuth();
  const [apiTest, setApiTest] = useState(null);
  const [testing, setTesting] = useState(false);

  const testDirectApiCall = async () => {
    setTesting(true);
    setApiTest(null);

    try {
      console.log('[BrandDebugger] Testing direct API call...');
      const response = await brandsAPI.getBrands();
      console.log('[BrandDebugger] Direct API response:', response);
      
      setApiTest({
        success: true,
        response: response,
        brandsCount: response.data?.brands?.length || 0,
      });
    } catch (error) {
      console.error('[BrandDebugger] Direct API call failed:', error);
      setApiTest({
        success: false,
        error: error.message,
        details: error.response?.data || error,
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    console.log('[BrandDebugger] Component mounted');
    console.log('[BrandDebugger] Current user:', currentUser);
    console.log('[BrandDebugger] Brands from context:', brands);
    console.log('[BrandDebugger] Loading:', loading);
    console.log('[BrandDebugger] Error:', error);
  }, [currentUser, brands, loading, error]);

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl p-4 z-[9999] max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Brand Debugger
        </h3>
      </div>

      {/* Auth Status */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">🔐 Authentication</h4>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">User:</span>
            <span className={currentUser ? 'text-green-400' : 'text-red-400'}>
              {currentUser ? '✅ Logged In' : '❌ Not Logged In'}
            </span>
          </div>
          {currentUser && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">UID:</span>
                <span className="text-white truncate ml-2 max-w-[200px]">{currentUser.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white truncate ml-2 max-w-[200px]">{currentUser.email}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Brand Context Status */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">📦 Brand Context</h4>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Loading:</span>
            <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
              {loading ? '⏳ Loading...' : '✅ Done'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Error:</span>
            <span className={error ? 'text-red-400' : 'text-green-400'}>
              {error ? `❌ ${error}` : '✅ None'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Brands Count:</span>
            <span className={brands.length > 0 ? 'text-green-400' : 'text-red-400'}>
              {brands.length > 0 ? `✅ ${brands.length} brands` : '❌ 0 brands'}
            </span>
          </div>
        </div>
      </div>

      {/* Brands List */}
      {brands.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">📋 Brands in State</h4>
          <div className="text-xs space-y-2">
            {brands.map((brand, index) => (
              <div key={brand.brandId || index} className="bg-gray-700 p-2 rounded">
                <div className="text-white font-medium">{brand.brandName}</div>
                <div className="text-gray-400">ID: {brand.brandId}</div>
                <div className="text-gray-400">Domain: {brand.domain}</div>
                <div className="text-gray-400">
                  {brand.productCount || 0} products · {brand.adCount || 0} ads
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Test */}
      <div className="mb-4">
        <button
          onClick={testDirectApiCall}
          disabled={testing}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {testing ? 'Testing...' : '🔍 Test Direct API Call'}
        </button>
      </div>

      {apiTest && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">🧪 API Test Result</h4>
          {apiTest.success ? (
            <div className="text-xs space-y-1">
              <div className="text-green-400">✅ API call successful</div>
              <div className="text-white">
                Response.success: {apiTest.response.success ? '✅ true' : '❌ false'}
              </div>
              <div className="text-white">
                Brands count: {apiTest.brandsCount}
              </div>
              <details className="mt-2">
                <summary className="text-purple-400 cursor-pointer">View full response</summary>
                <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(apiTest.response, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-xs space-y-1">
              <div className="text-red-400">❌ API call failed</div>
              <div className="text-red-300">Error: {apiTest.error}</div>
              <details className="mt-2">
                <summary className="text-purple-400 cursor-pointer">View error details</summary>
                <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto text-red-300">
                  {JSON.stringify(apiTest.details, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-gray-800 rounded-lg border border-purple-500/30">
        <h4 className="text-xs font-semibold text-purple-400 mb-2">💡 Debugging Tips</h4>
        <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
          <li>Check browser console for detailed logs</li>
          <li>Verify backend is running on correct port</li>
          <li>Check Network tab for API requests</li>
          <li>Verify JWT token in request headers</li>
          <li>Test direct API call above</li>
        </ul>
      </div>

      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">Remove this component when done debugging</p>
      </div>
    </div>
  );
};

export default BrandDebugger;



