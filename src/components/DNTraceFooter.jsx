import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function DNTraceFooter({ onOpenQrRegister, onNavigateToAdmin }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 150);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-[#122A21] text-stone-300 pt-8 sm:pt-12 pb-8 border-t border-[#1C4638] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main Footer Block - Optimized for Mobile & Desktop */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-[#1E4D3E] text-center md:text-left">

            {/* Brand & Slogan */}
            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="bg-white/5 p-2 rounded-2xl border border-white/5 inline-flex items-center justify-center">
                <img
                  src="/assets/dntrace_logo_header.png"
                  alt="DNTrace Logo"
                  className="h-14 sm:h-18 md:h-20 w-auto max-w-[240px] sm:max-w-[280px] object-contain drop-shadow"
                  onError={(e) => {
                    e.target.src = "/assets/dntrace_logo.jpg";
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-stone-300/80 max-w-sm sm:max-w-md leading-relaxed">
                Hệ thống Truy xuất thông tin sản phẩm{' '}
                <strong className="text-[#84CC16] font-semibold">dntrace.com</strong>
              </p>
            </div>

            {/* Quick Actions / Slogan right */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 w-full sm:w-auto">
              {/* Optional actions */}
            </div>

          </div>

          {/* Bottom Bar: Copyright & Admin link */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-stone-400">
            <p className="text-center sm:text-left leading-relaxed">
              &copy; {new Date().getFullYear()} <strong>dntrace.com</strong>. Bản quyền thuộc về Hệ thống Truy xuất thông tin Dntrace.com.
            </p>

           
          </div>

        </div>
      </footer>

      {/* Floating Round Scroll-To-Top Button (Nút tròn góc dưới bên phải tích hợp Mobile & Desktop) */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0f2d22] hover:bg-[#164332] active:scale-90 text-[#84CC16] border-2 border-[#84CC16]/60 shadow-xl shadow-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-all duration-300 group ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-4 pointer-events-none scale-75'
        }`}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        <ArrowUp className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </>
  );
}
