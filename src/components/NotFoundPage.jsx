import React from 'react';
import { AlertTriangle, Home, ArrowRight, ShieldAlert } from 'lucide-react';

export default function NotFoundPage({ onBackToHome, onNavigateToAdmin, invalidPath = '' }) {
  const isNearAdmin = Boolean(
    invalidPath && (
      invalidPath.toLowerCase().includes('admin') ||
      invalidPath.toLowerCase().startsWith('adm') ||
      invalidPath.toLowerCase() === 'ad'
    )
  );

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between bg-cover bg-center bg-no-repeat text-stone-900 select-none"
      style={{ backgroundImage: "url('/assets/bg.jpg')" }}
    >
      {/* Subtle backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-[3px] bg-black/25 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 pt-4 flex items-center justify-between">
        <div onClick={onBackToHome} className="cursor-pointer">
          <img
            src="/assets/dntrace_logo_header.png"
            alt="DNTrace Logo"
            className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-sm"
            onError={(e) => {
              e.target.src = '/assets/logohelmet.png';
            }}
          />
        </div>
      </header>

      {/* 404 Center Box */}
      <main className="relative z-10 max-w-lg w-full mx-auto px-4 py-8 my-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-9 shadow-2xl border border-stone-200 text-center space-y-5 animate-fade-in">
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-amber-600 uppercase">
              Lỗi 404 • Không tìm thấy
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Trang Không Tồn Tại
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
              Đường dẫn <code className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono text-xs">/{invalidPath || ''}</code> không tồn tại trên hệ thống dntrace.com.
            </p>
          </div>

          {/* Security Alert if path attempted admin */}
          

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0f2d22] hover:bg-[#1a4a39] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#84CC16]" />
              <span>Về Trang Chủ</span>
            </button>

            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-[11px] text-white/80 font-medium">
        © 2026 DNTRACE.COM — Hệ Thống Truy Xuất Nguồn Gốc Số
      </footer>
    </div>
  );
}

