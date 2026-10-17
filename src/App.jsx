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
import NotFoundPage from './components/NotFoundPage';
import DNTraceLogo from './components/DNTraceLogo';
import DNTraceFooter from './components/DNTraceFooter';
import { fetchApiStatus, isUserLoggedIn, clearLoginSession, slugify } from './services/api';

// Parse and validate route strictly from URL
const parseUrlRoute = () => {
  if (typeof window === 'undefined') return { view: 'home', slug: null, invalidPath: null };

  const pathname = window.location.pathname;
  // Trim leading and trailing slashes
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').trim();

  // 1. Home path "/"
  if (!cleanPath) {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      return { view: 'traceability', slug: codeParam.trim(), invalidPath: null };
    }
    return { view: 'home', slug: null, invalidPath: null };
  }

  const lower = cleanPath.toLowerCase();

  // 2. Strict Admin Route: MUST BE EXACTLY "admin"
  if (lower === 'admin') {
    return { view: 'admin', slug: null, invalidPath: null };
  }

  // 3. Typo / variation of admin (dư chữ hoặc thiếu chữ)
  // Ví dụ: /adminn, /admi, /adm, /ad, /admins, /administrator, /admin/anything, /myadmin...
  const isAdminVariation =
    lower.startsWith('admin/') ||
    lower.startsWith('adm') ||
    lower.endsWith('admin') ||
    lower.includes('admin') ||
    lower === 'ad';

  if (isAdminVariation) {
    return { view: 'not-found', slug: null, invalidPath: cleanPath };
  }

  // 4. Multi-segment paths (products do not have subdirectories like "a/b")
  if (cleanPath.includes('/')) {
    return { view: 'not-found', slug: null, invalidPath: cleanPath };
  }

  // 5. Product slug for traceability
  return { view: 'traceability', slug: decodeURIComponent(cleanPath).trim(), invalidPath: null };
};

export default function App() {
  const initialRoute = parseUrlRoute();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [isAuthenticated, setIsAuthenticated] = useState(isUserLoggedIn);
  const [selectedProductId, setSelectedProductId] = useState(initialRoute.slug);
  const [invalidPath, setInvalidPath] = useState(initialRoute.invalidPath);
  const [qrRegistrationOpen, setQrRegistrationOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Sync state with browser URL (popstate for back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrlRoute();
      setCurrentView(route.view);
      setSelectedProductId(route.slug);
      setInvalidPath(route.invalidPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to Home
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedProductId(null);
    setInvalidPath(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Admin
  const navigateToAdmin = () => {
    setCurrentView('admin');
    setSelectedProductId(null);
    setInvalidPath(null);
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update browser URL when switching view
  const navigateToView = (viewName) => {
    if (viewName === 'admin') {
      navigateToAdmin();
    } else if (viewName === 'home') {
      navigateToHome();
    } else {
      setCurrentView(viewName);
      setInvalidPath(null);
      if (selectedProductId) {
        window.history.pushState({}, '', `/${selectedProductId}`);
      } else {
        window.history.pushState({}, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

        {/* VIEW 2: 404 NOT FOUND PAGE */}
        {currentView === 'not-found' && (
          <NotFoundPage
            invalidPath={invalidPath}
            onBackToHome={navigateToHome}
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
