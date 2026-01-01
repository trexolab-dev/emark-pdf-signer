import { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from '@/components/layout';
import { GitHubStatsProvider } from '@/context/GitHubStatsContext';
import { ScrollToTop, SplashScreen, MouseTrail } from '@/components/common';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const Installation = lazy(() => import('@/pages/Installation'));
const Documentation = lazy(() => import('@/pages/Documentation'));
const Projects = lazy(() => import('@/pages/Projects'));
const Diagrams = lazy(() => import('@/pages/Diagrams'));

// Professional page loader component
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated loader */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-slate-700"
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin"
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400/60 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
        {/* Loading text */}
        <span className="text-sm text-slate-400 tracking-wide">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <HelmetProvider>
      <GitHubStatsProvider>
        {/* Splash Screen */}
        {isLoading && (
          <SplashScreen
            onLoadComplete={() => setIsLoading(false)}
            minDisplayTime={1800}
          />
        )}

        {/* Mouse Trail Effect */}
        <MouseTrail />

        {/* Main App - renders behind splash screen */}
        <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
          <HashRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="installation" element={<Installation />} />
                  <Route path="documentation" element={<Documentation />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="diagrams" element={<Diagrams />} />
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </div>
      </GitHubStatsProvider>
    </HelmetProvider>
  );
}

export default App;
