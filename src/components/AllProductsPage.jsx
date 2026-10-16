import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { fetchProducts, slugify } from '../services/api';

export default function AllProductsPage({
  onSelectProduct,
  onBackToHome,
  onOpenQrRegister
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState('grid'); // 'grid' or 'slider'

  // Mobile Slider State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchProducts();
        if (isMounted) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải toàn bộ danh sách sản phẩm:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by Name or Code/TCBSP/Slug/Manufacturer
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
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

  // Reset slide index if search results change
  useEffect(() => {
    if (activeSlideIndex >= filteredProducts.length && filteredProducts.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [filteredProducts.length, activeSlideIndex]);

  const prevSlide = () => {
    if (filteredProducts.length <= 1) return;
    setActiveSlideIndex((prev) => (prev === 0 ? filteredProducts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (filteredProducts.length <= 1) return;
    setActiveSlideIndex((prev) => (prev === filteredProducts.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (filteredProducts.length === 1) {
      onSelectProduct(filteredProducts[0]);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F7F3] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* TOP BREADCRUMB & BACK NAVIGATION */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <button
              onClick={onBackToHome}
              className="hover:text-[#0f2d22] font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Trang Chủ</span>
            </button>
            <span>/</span>
            <span className="font-bold text-stone-800">Tất Cả Sản Phẩm</span>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f2d22] px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-xs hover:bg-stone-50 active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Trang Chủ</span>
          </button>
        </div>

        {/* HEADER TITLE & SEARCH BAR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
             
              <h1 className="text-xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
                Tất Cả Sản Phẩm
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Tra cứu nhanh thông tin, kiểm tra mã xác thực và đối soát hồ sơ công bố cho mọi sản phẩm.
              </p>
            </div>

            {onOpenQrRegister && (
              <button
                onClick={onOpenQrRegister}
                className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] active:scale-95 text-[#0f2d22] text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0f2d22]" />
                <span>Đăng Ký Cấp Mã QR</span>
              </button>
            )}
          </div>

          {/* DEDICATED SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên sản phẩm, mã tra cứu (mã QR, TCBSP, mã vạch)..."
              className="w-full pl-12 pr-28 sm:pr-32 py-3.5 rounded-2xl bg-[#F8F7F3] border-2 border-stone-200 focus:bg-white focus:border-[#0f2d22] focus:ring-4 focus:ring-[#84CC16]/20 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 transition outline-none"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-24 sm:right-28 p-1 text-stone-400 hover:text-stone-600 transition"
                aria-label="Xoá từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#0f2d22] hover:bg-[#194535] active:scale-95 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>Tìm kiếm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* STATS & FILTER META */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 pt-1 border-t border-stone-100">
            <div>
              Hiển thị <strong className="text-stone-900">{filteredProducts.length}</strong> / {products.length} sản phẩm
              {searchTerm && (
                <span className="ml-2 text-[#0f2d22] font-semibold">
                  (theo từ khóa: "{searchTerm}")
                </span>
              )}
            </div>

            {/* Mobile View Switcher (Grid vs Slider) */}
            <div className="flex sm:hidden items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setMobileViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  mobileViewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Lưới
              </button>
              <button
                onClick={() => setMobileViewMode('slider')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  mobileViewMode === 'slider' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Trượt (Slider)
              </button>
            </div>

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#0f2d22] font-semibold hover:underline cursor-pointer"
              >
                Xoá bộ lọc tìm kiếm
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#0f2d22] animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-stone-600">
              Đang tải danh sách sản phẩm từ hệ thống dntrace.com...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 text-base">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {searchTerm
                  ? `Không có kết quả nào khớp với "${searchTerm}". Vui lòng thử lại với tên khác hoặc mã sản phẩm khác.`
                  : 'Chưa có dữ liệu sản phẩm trong hệ thống.'}
              </p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-xl bg-[#0f2d22] text-white text-xs font-bold hover:bg-[#194535] transition cursor-pointer"
              >
                Xem toàn bộ sản phẩm
              </button>
            )}
          </div>
        )}

        {/* MOBILE SLICK SLIDER (khi chọn chế độ Slider trên Mobile) */}
        {!loading && filteredProducts.length > 0 && mobileViewMode === 'slider' && (
          <div className="block sm:hidden space-y-3">
            {(() => {
              const currentProduct = filteredProducts[activeSlideIndex] || filteredProducts[0];
              const productCode = currentProduct.verificationCode || currentProduct.tcbsp || currentProduct._id || 'Chưa có dữ liệu';

              return (
                <div className="space-y-3">
                  <div className="relative group">
                    <div
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => onSelectProduct(currentProduct)}
                      className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm active:scale-[0.99] transition-transform duration-200 flex flex-col cursor-pointer select-none"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center mb-4">
                        {currentProduct.image ? (
                          <img
                            src={currentProduct.image}
                            alt={currentProduct.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-stone-400 space-y-1.5">
                            <ImageIcon className="w-8 h-8 text-stone-300" />
                            <span className="text-xs font-semibold">Chưa có dữ liệu</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                          {activeSlideIndex + 1} / {filteredProducts.length}
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-stone-900 text-base line-clamp-2 leading-snug mb-2">
                        {currentProduct.name || 'Chưa có dữ liệu'}
                      </h3>

                      {/* Product Code */}
                      <div className="space-y-1.5 mb-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 text-[11px] font-medium shrink-0">Mã SP:</span>
                          <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 truncate text-[11px]">
                            {productCode}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-500 truncate">
                          Đơn vị:{' '}
                          <span className="font-medium text-stone-800">
                            {currentProduct.manufacturer?.name || 'Chưa có dữ liệu'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action CTA */}
                      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0f2d22]">
                        <span>Truy xuất thông tin</span>
                        <div className="w-8 h-8 rounded-full bg-[#84CC16] text-[#0f2d22] flex items-center justify-center shadow-xs">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons: Trái / Phải */}
                    {filteredProducts.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                          }}
                          className="absolute left-2 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center shadow-lg transition backdrop-blur-xs z-10 cursor-pointer"
                          aria-label="Sản phẩm trước"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                          }}
                          className="absolute right-2 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center shadow-lg transition backdrop-blur-xs z-10 cursor-pointer"
                          aria-label="Sản phẩm tiếp theo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* 2 Buttons Dưới & Dots */}
                  {filteredProducts.length > 1 && (
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={prevSlide}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 active:scale-95 text-[#0f2d22] text-xs font-bold border border-stone-200 flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Trước</span>
                      </button>

                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[150px] px-1 py-1 no-scrollbar">
                        {filteredProducts.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 shrink-0 ${
                              idx === activeSlideIndex ? 'w-5 bg-[#0f2d22]' : 'w-2 bg-stone-300'
                            }`}
                            aria-label={`Sản phẩm ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={nextSlide}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 active:scale-95 text-[#0f2d22] text-xs font-bold border border-stone-200 flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        <span>Tiếp</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* RESPONSIVE GRID (hiển thị trên mobile khi chọn Grid hoặc mặc định từ sm trở lên) */}
        {!loading && filteredProducts.length > 0 && (
          <div className={`${mobileViewMode === 'slider' ? 'hidden sm:grid' : 'grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
            {filteredProducts.map((product) => {
              const productCode = product.verificationCode || product.tcbsp || product._id || 'Chưa có dữ liệu';

              return (
                <div
                  key={product._id || product.slug}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-xl hover:border-[#84CC16] transition-all duration-300 flex flex-col cursor-pointer select-none"
                >
                  {/* 1. Hình ảnh sản phẩm (tuân thủ quy tắc: không có thì hiển thị "Chưa có dữ liệu") */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center mb-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-stone-400 space-y-1.5">
                        <ImageIcon className="w-8 h-8 text-stone-300" />
                        <span className="text-xs font-semibold">Chưa có dữ liệu</span>
                      </div>
                    )}

                    {/* Verification Badge */}
                 
                  </div>

                  {/* 2. Tên sản phẩm */}
                  <h3 className="font-bold text-stone-900 text-base line-clamp-2 group-hover:text-[#0f2d22] transition-colors leading-snug mb-2.5">
                    {product.name || 'Chưa có dữ liệu'}
                  </h3>

                  {/* 3. Mã sản phẩm / Số TCBSP */}
                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500 text-[11px] font-medium shrink-0">Mã SP:</span>
                      <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 truncate text-[11px]">
                        {productCode}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 truncate">
                      Đơn vị:{' '}
                      <span className="font-medium text-stone-800">
                        {product.manufacturer?.name || 'Chưa có dữ liệu'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0f2d22]">
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      Truy xuất thông tin
                    </span>
                    <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-[#84CC16] text-[#0f2d22] flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

