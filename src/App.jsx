import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  Home,
  Search
} from 'lucide-react';
import HomePage from './components/HomePage';
import ProductTraceabilityPage from './components/ProductTraceabilityPage';
import AdminProductManager from './components/AdminProductManager';
import AdminLogin from './components/AdminLogin';
import QrRegistrationModal from './components/QrRegistrationModal';
import DNTraceLogo from './components/DNTraceLogo';
import DNTraceFooter from './components/DNTraceFooter';
import { fetchApiStatus, isUserLoggedIn, clearLoginSession, slugify } from './services/api';

export default function App() {
  // Determine initial product slug from browser URL or query string
  const getInitialProductSlug = () => {
    if (typeof window !== 'undefined') {
      // 1. Check query parameter ?code=...
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) return codeParam.trim();

      // 2. Check pathname /ten-san-pham (ignore admin)
      const path = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      const lower = path ? path.toLowerCase() : '';
      if (lower && lower !== 'admin') {
        return decodeURIComponent(path).trim();
      }
    }
    return null;
  };

  // Determine initial view from browser URL
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      if (cleanPath === 'admin') {
        return 'admin';
      }
      const slug = getInitialProductSlug();
      if (slug) {
        return 'traceability';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isAuthenticated, setIsAuthenticated] = useState(isUserLoggedIn);
  const [selectedProductId, setSelectedProductId] = useState(getInitialProductSlug);
  const [qrRegistrationOpen, setQrRegistrationOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Sync state with browser URL (popstate for back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const cleanPath = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      if (cleanPath === 'admin') {
        setCurrentView('admin');
      } else {
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('code');
        const slug = (cleanPath && cleanPath !== 'admin')
          ? decodeURIComponent(cleanPath).trim()
          : (codeParam ? codeParam.trim() : null);

        if (slug) {
          setSelectedProductId(slug);
          setCurrentView('traceability');
        } else {
          setSelectedProductId(null);
          setCurrentView('home');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to Home
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedProductId(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update browser URL when switching view
  const navigateToView = (viewName) => {
    setCurrentView(viewName);
    if (viewName === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (viewName === 'home') {
      setSelectedProductId(null);
      window.history.pushState({}, '', '/');
    } else {
      if (selectedProductId) {
        window.history.pushState({}, '', `/${selectedProductId}`);
      } else {
        window.history.pushState({}, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check MongoDB connection status
  useEffect(() => {
    fetchApiStatus().then(status => setDbStatus(status));
  }, [currentView, isAuthenticated]);

  const handleSelectProduct = (productOrSlug) => {
    let slug = '';
    if (typeof productOrSlug === 'object' && productOrSlug !== null) {
      slug = productOrSlug.slug || slugify(productOrSlug.name);
    } else if (typeof productOrSlug === 'string') {
      slug = productOrSlug;
    }
    setSelectedProductId(slug);
    setCurrentView('traceability');
    if (slug) {
      window.history.pushState({}, '', `/${slug}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductChange = (product) => {
    if (!product) return;
    const slug = product.slug || slugify(product.name);
    setSelectedProductId(slug);
    window.history.pushState({}, '', `/${slug}`);
  };

  const handleLogout = () => {
    clearLoginSession();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#19241F] flex flex-col selection:bg-[#84CC16]/30 selection:text-[#0f2d22]">

      {/* Top Application Header - Shown on Traceability */}
      {currentView === 'traceability' && (
        <header className="sticky top-0 z-40 bg-[#0f2d22] text-white shadow-md border-b border-[#1C4638]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-13 sm:h-16 md:h-18">

              {/* Brand Logo & Name (Click to go Home) */}
              <div
                onClick={navigateToHome}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
                title="Về Trang Chủ dntrace.com"
              >
                <DNTraceLogo className="h-8 sm:h-9" isWhite={true} />
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-1.5 sm:gap-3">

                {/* Return Home Button */}
                <button
                  onClick={navigateToHome}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-stone-200 text-[11px] sm:text-xs font-bold border border-white/10 transition cursor-pointer"
                  title="Về Trang Chủ"
                >
                  <Home className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span className="hidden xs:inline">Trang Chủ</span>
                </button>

                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-stone-200 text-xs font-bold border border-white/10">
                  <QrCode className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>Trang Truy Xuất</span>
                </div>

                {/* Đăng ký cấp mã QR CTA */}
                <button
                  onClick={() => setQrRegistrationOpen(true)}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#84CC16] hover:bg-[#74B843] active:scale-95 text-[#0f2d22] text-[11px] sm:text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0f2d22]" />
                  <span className="hidden sm:inline">Đăng Ký Cấp Mã QR</span>
                  <span className="inline sm:hidden">Cấp Mã QR</span>
                </button>

              </div>

            </div>
          </div>
        </header>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <HomePage
            onSelectProduct={handleSelectProduct}
            onOpenQrRegister={() => setQrRegistrationOpen(true)}
            onNavigateToAdmin={() => navigateToView('admin')}
          />
        )}

        {/* VIEW 3: PRODUCT TRACEABILITY DETAIL PAGE */}
        {currentView === 'traceability' && (
          <>
            <ProductTraceabilityPage
              selectedProductId={selectedProductId}
              onProductChange={handleProductChange}
              onBackToHome={navigateToHome}
              onOpenQrRegister={() => setQrRegistrationOpen(true)}
              onNavigateToAdmin={() => navigateToView('admin')}
            />
            {/* Footer with dntrace.com branding */}
            <DNTraceFooter
              onOpenQrRegister={() => setQrRegistrationOpen(true)}
              onNavigateToAdmin={() => navigateToView('admin')}
            />
          </>
        )}

        {/* VIEW 4: ADMIN MANAGEMENT */}
        {currentView === 'admin' && (
          isAuthenticated ? (
            <AdminProductManager
              onViewProduct={handleSelectProduct}
              onBackToTraceability={navigateToHome}
              onLogout={handleLogout}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={() => setIsAuthenticated(true)}
              onBackToTraceability={navigateToHome}
            />
          )
        )}
      </main>

      {/* Modal: Đăng Ký Cấp Mã QR */}
      <QrRegistrationModal
        isOpen={qrRegistrationOpen}
        onClose={() => setQrRegistrationOpen(false)}
      />

    </div>
  );
}
