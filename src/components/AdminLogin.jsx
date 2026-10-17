import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { loginAdmin } from '../services/api';
import DNTraceLogo from './DNTraceLogo';

export default function AdminLogin({ onLoginSuccess, onBackToTraceability }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await loginAdmin(username.trim(), password.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#F8F7F3]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-6 relative overflow-hidden">

        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0f2d22] via-[#84CC16] to-[#0f2d22]" />

        {/* Back Link */}
        {onBackToTraceability && (
          <button
            onClick={onBackToTraceability}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#0f2d22] font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Cổng Truy Xuất</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center bg-green-900 rounded-xl  ">
            <DNTraceLogo className="h-9" pillBackground={true} />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Đăng Nhập
          </h2>
          <p className="text-xs text-stone-500">
            Khu vực quản lý sản phẩm &amp; cấp mã QR truy xuất dntrace.com
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

          

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 focus:bg-white focus:border-[#0f2d22] focus:ring-2 focus:ring-[#0f2d22]/10 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 focus:bg-white focus:border-[#0f2d22] focus:ring-2 focus:ring-[#0f2d22]/10 transition outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0f2d22] hover:bg-[#194535] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#0f2d22]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4 text-[#84CC16]" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-stone-400">
            Hệ thống xác thực dntrace.com &bull; Bảo mật đa lớp
          </p>
        </div>

      </div>
    </div>
  );
}
