import React from 'react';
import {
  ArrowUp,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function DNTraceFooter({ onOpenQrRegister, onNavigateToAdmin }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#122A21] text-stone-300 pt-8 sm:pt-12  pb-8 border-t border-[#1C4638] mt-auto">
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

          {/* Quick Actions & Trust Badge */}
          <div className="flex  flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 w-full sm:w-auto">
           
            
          </div>

        </div>

        {/* Bottom Bar: Copyright & Scroll to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="text-center sm:text-left leading-relaxed">
            &copy; {new Date().getFullYear()} <strong>dntrace.com</strong>. Bản quyền thuộc về Hệ thống Truy xuất nguồn gốc dntrace.com.
          </p>

          <div className="flex items-center gap-4">
           
            <button
              onClick={scrollToTop}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Về đầu trang"
            >
              <span>Lên đầu trang</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
