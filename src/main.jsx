import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

import './index.css'

import { ProfileProvider } from './lib/ProfileContext';
import { ToastProvider } from './lib/ToastContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CalculationProvider } from './lib/CalculationContext';

// ─── Lazy-loaded route chunks ─────────────────────────────────────────────────
const Landing    = lazy(() => import('./pages/Landing.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const Dashboard  = lazy(() => import('./pages/Dashboard.jsx'));
const DeepChart  = lazy(() => import('./pages/DeepChart.jsx'));
const Vault      = lazy(() => import('./pages/Vault.jsx'));
const Settings      = lazy(() => import('./pages/Settings.jsx'));
const Compatibility = lazy(() => import('./pages/Compatibility.jsx'));
const Transits      = lazy(() => import('./pages/Transits.jsx'));
const Muhurta       = lazy(() => import('./pages/Muhurta.jsx'));
const About         = lazy(() => import('./pages/About.jsx'));
const Privacy    = lazy(() => import('./pages/Privacy.jsx'));
const Terms      = lazy(() => import('./pages/Terms.jsx'));
const Compare    = lazy(() => import('./pages/Compare.jsx'));
const PublicChart = lazy(() => import('./pages/PublicChart.jsx'));
const History    = lazy(() => import('./pages/History.jsx'));
const Rectification = lazy(() => import('./pages/Rectification.jsx'));
const NotFound   = lazy(() => import('./pages/NotFound.jsx'));

// ─── Route-level loading fallback ─────────────────────────────────────────────
function RouteFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-gray-700 animate-pulse">
        Initializing Module
      </span>
    </div>
  );
}

/**
 * Route-level Error Boundary wrapper
 */
function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary 
      customMessage="This specific module encountered a cosmic anomaly. Other app sections remain stable."
    >
      {children}
    </ErrorBoundary>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Onboarding />} />
          <Route path="/register" element={<Onboarding />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          
          <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
          <Route path="/chart" element={<RouteErrorBoundary><DeepChart /></RouteErrorBoundary>} />
          <Route path="/vault" element={<RouteErrorBoundary><Vault /></RouteErrorBoundary>} />
          <Route path="/compatibility" element={<RouteErrorBoundary><Compatibility /></RouteErrorBoundary>} />
          <Route path="/transits" element={<RouteErrorBoundary><Transits /></RouteErrorBoundary>} />
          <Route path="/muhurta" element={<RouteErrorBoundary><Muhurta /></RouteErrorBoundary>} />
          <Route path="/settings" element={<RouteErrorBoundary><Settings /></RouteErrorBoundary>} />
          <Route path="/compare" element={<RouteErrorBoundary><Compare /></RouteErrorBoundary>} />
          <Route path="/history" element={<RouteErrorBoundary><History /></RouteErrorBoundary>} />
          <Route path="/rectify" element={<RouteErrorBoundary><Rectification /></RouteErrorBoundary>} />
          
          <Route path="/chart/:slug" element={<PublicChart />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <CalculationProvider>
            <CosmicCalculationOverlay />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </CalculationProvider>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
