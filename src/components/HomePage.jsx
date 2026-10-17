import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  Package,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { fetchProducts, slugify } from '../services/api';

export default function HomePage({
  onSelectProduct,
  onOpenQrRegister,
  onNavigateToAdmin
}) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Load products from API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetchProducts();
        if (isMounted) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products live based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    const cleanTerm = slugify(term);

    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const code = (p.verificationCode || '').toLowerCase();
      const tcbsp = (p.tcbsp || '').toLowerCase();
      const standard = (p.standardCode || '').toLowerCase();
      const slug = (p.slug || slugify(p.name || '')).toLowerCase();
      const mfrName = (p.manufacturer?.name || '').toLowerCase();

      return (
        name.includes(term) ||
        code.includes(term) ||
        tcbsp.includes(term) ||
        standard.includes(term) ||
        slug.includes(cleanTerm) ||
        mfrName.includes(term)
      );
    });
  }, [products, searchTerm]);

  // Click outside to collapse search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    if (searchResults.length === 1) {
      onSelectProduct(searchResults[0]);
    } else {
      setIsSearchFocused(true);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: "url('/assets/bg-clean.png')" }}
    >
      {/* Subtle backdrop-blur to softly diffuse the background and make the logo & search box pop */}
      <div className="absolute inset-0 backdrop-blur-[2.5px] bg-black/15 pointer-events-none" />

      {/* Top subtle admin corner icon */}
      

      {/* CENTER HERO: LOGO + 1 Ô SEARCH + 1 BUTTON ĐĂNG KÝ TRUY XUẤT */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center text-center z-10 my-auto">
        
        {/* LOGO WITH FROSTED GLASS HIGHLIGHT */}
        <div className="mb-6 sm:mb-8 transition-transform duration-300 hover:scale-105">
          <div className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xl inline-flex items-center justify-center">
            <img
              src="/assets/dntrace_logo_header.png"
              alt="DNTrace Logo"
              className="h-14 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-sm"
              onError={(e) => {
                e.target.src = '/assets/logohelmet.png';
              }}
            />
          </div>
        </div>

        {/* 1 Ô SEARCH */}
        <div ref={searchContainerRef} className="w-full max-w-xl relative">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white rounded-full shadow-2xl border-2 border-stone-200/90 focus-within:border-[#0f2d22] transition-colors duration-150 backdrop-blur-md"
          >
            <div className="pl-4 sm:pl-5 pointer-events-none text-[#0f2d22]">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Nhập tên sản phẩm hoặc mã truy xuất..."
              className="w-full py-3.5 sm:py-4 pl-3 sm:pl-4 pr-24 sm:pr-28 text-stone-900 placeholder:text-stone-400 text-base bg-transparent outline-none font-medium"
            />

            {/* Clear button */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-20 sm:right-24 p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                title="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0f2d22] hover:bg-[#1a4a39] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1 shadow-md cursor-pointer"
            >
              <span>Tìm</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#84CC16]" />
            </button>
          </form>

          {/* LIVE SEARCH AUTOCOMPLETE DROPDOWN (Chỉ hiển thị 4 sản phẩm, nếu nhiều hơn sẽ scroll) */}
          {isSearchFocused && searchTerm.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white/98 shadow-2xl border border-stone-200 p-2 z-50 text-left animate-fade-in backdrop-blur-md">
              {searchResults.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-100 mb-1">
                    <span>Gợi ý ({searchResults.length} sản phẩm)</span>
                    <span className="text-[#0f2d22] font-semibold text-[10px]">
                      {searchResults.length > 4 ? 'Cuộn xem thêm ↓' : 'Bấm để xem'}
                    </span>
                  </div>

                  {/* Vùng hiển thị tối đa 4 sản phẩm, vượt quá sẽ có thanh cuộn tinh tế */}
                  <div className="space-y-1 max-h-[256px] overflow-y-auto pr-1">
                    {searchResults.map((product) => (
                      <div
                        key={product._id || product.slug}
                        onClick={() => {
                          onSelectProduct(product);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 transition cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-stone-50 p-1 flex items-center justify-center shrink-0 border border-stone-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-stone-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0f2d22] transition-colors truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                            <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                              {product.verificationCode || product.tcbsp || 'Mã xác thực'}
                            </span>
                            <span className="truncate">
                              {product.manufacturer?.name || 'Doanh nghiệp'}
                            </span>
                          </div>
                        </div>

                        <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#0f2d22] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-1">
                  <p className="text-xs font-bold text-stone-700">
                    Không tìm thấy sản phẩm khớp với "{searchTerm}"
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Vui lòng kiểm tra lại chính tả hoặc mã số xác thực.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1 BUTTON ĐĂNG KÝ TRUY XUẤT */}
        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            onClick={onOpenQrRegister}
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#0f2d22] hover:bg-[#184535] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl border border-[#84CC16]/60 transition-all flex items-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#84CC16] group-hover:rotate-12 transition-transform" />
            <span>Đăng Ký Truy Xuất</span>
          </button>
        </div>

      </main>

      {/* MINIMAL FOOTER */}
      <footer className="w-full py-3 text-center text-[11px] sm:text-xs text-stone-500 font-medium z-10">
        <span>© 2026 DNTRACE.COM — Hệ Thống Truy Xuất Thông Tin</span>
      </footer>
    </div>
  );
}
