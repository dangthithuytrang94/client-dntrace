import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  QrCode,
  ShieldCheck,
  ArrowRight,
  X,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchProducts, slugify } from '../services/api';

export default function HomePage({
  onSelectProduct,
  onNavigateToAllProducts,
  onOpenQrRegister
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile Slick Slider State
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
        console.error('Lỗi khi tải danh sách sản phẩm trang chủ:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products by Name or Code/TCBSP/Slug - searches across ALL database products!
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

  // Quy tắc: Ở trang chủ hiển thị tối đa 8 sản phẩm. Khi search thì tìm và hiển thị toàn bộ kết quả từ database!
  const displayedProducts = useMemo(() => {
    if (searchTerm.trim()) {
      return filteredProducts;
    }
    return products.slice(0, 8);
  }, [products, filteredProducts, searchTerm]);

  // Reset slide index if search results change
  useEffect(() => {
    if (activeSlideIndex >= displayedProducts.length && displayedProducts.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [displayedProducts.length, activeSlideIndex]);

  const prevSlide = () => {
    if (displayedProducts.length <= 1) return;
    setActiveSlideIndex((prev) => (prev === 0 ? displayedProducts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (displayedProducts.length <= 1) return;
    setActiveSlideIndex((prev) => (prev === displayedProducts.length - 1 ? 0 : prev + 1));
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
    if (displayedProducts.length === 1) {
      onSelectProduct(displayedProducts[0]);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F7F3] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* HERO SECTION: Logo + Title + Description */}
        <div className="flex flex-col items-center text-center space-y-4 pt-1 sm:pt-4">
          <div className="bg-green-800 p-3.5 sm:p-5 rounded-3xl shadow-sm border border-stone-200/80 inline-flex items-center justify-center">
            <img
              src="/assets/dntrace_logo_header.png"
              alt="DNTrace Logo"
              className="h-14 sm:h-20 md:h-24 w-auto object-contain"
              onError={(e) => {
                e.target.src = '/assets/dntrace_logo.jpg';
              }}
            />
          </div>

          <div className="max-w-3xl space-y-2.5">
           

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              Tra Cứu &amp; Truy Xuất Thông Tin Sản Phẩm
            </h1>

          
          </div>

          {/* SEARCH BAR INPUT: Search by Name or Code */}
          <div className="w-full max-w-2xl pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 absolute left-3.5 sm:left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên sản phẩm, mã truy xuất hoặc số TCBSP..."
                className="w-full pl-10 sm:pl-12 pr-28 sm:pr-32 py-3 sm:py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#0f2d22] focus:ring-4 focus:ring-[#84CC16]/20 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 shadow-sm transition outline-none"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-24 sm:right-28 p-1 text-stone-400 hover:text-stone-600 transition"
                  aria-label="Xoá từ khóa"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#0f2d22] hover:bg-[#194535] active:scale-95 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Tra cứu</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between mt-2 px-2 text-[11px] sm:text-xs text-stone-500">
              <span>
                {searchTerm ? (
                  <>Tìm thấy <strong className="text-stone-900">{displayedProducts.length}</strong> kết quả từ toàn bộ cơ sở dữ liệu</>
                ) : (
                  <>Hiển thị <strong className="text-stone-900">{displayedProducts.length}</strong> / {products.length} sản phẩm</>
                )}
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-[#0f2d22] font-semibold hover:underline cursor-pointer"
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PRODUCT CARDS SECTION */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#84CC16]" />
              <h2 className="text-base sm:text-xl font-black text-stone-900 uppercase tracking-tight">
                Danh Sách Sản Phẩm 
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToAllProducts && (
                <button
                  onClick={onNavigateToAllProducts}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#0f2d22] text-xs font-bold transition border border-stone-200 cursor-pointer shadow-2xs"
                >
                  <span>Xem tất cả ({products.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0f2d22]" />
                </button>
              )}

              {onOpenQrRegister && (
                <button
                  onClick={onOpenQrRegister}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#84CC16]/20 hover:bg-[#84CC16]/30 text-[#0f2d22] text-xs font-bold transition border border-[#84CC16]/40 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cấp mã mới</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-14 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0f2d22] animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-stone-600">
                Đang tải dữ liệu sản phẩm từ hệ thống dntrace.com...
              </p>
            </div>
          )}

          {/* Empty Search Result State */}
          {!loading && displayedProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-base">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {searchTerm
                    ? `Không có kết quả nào khớp với từ khóa "${searchTerm}". Vui lòng thử tìm với tên hoặc mã khác.`
                    : 'Chưa có dữ liệu'}
                </p>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl bg-[#0f2d22] text-white text-xs font-bold hover:bg-[#194535] transition cursor-pointer"
                >
                  Xem tất cả sản phẩm
                </button>
              )}
            </div>
          )}

          {/* VIEW ON MOBILE: SLICK SLIDER (chỉ hiển thị trên Mobile < sm) */}
          {!loading && displayedProducts.length > 0 && (
            <div className="block sm:hidden space-y-3">
              {(() => {
                const currentProduct = displayedProducts[activeSlideIndex] || displayedProducts[0];
                const productCode = currentProduct.verificationCode || currentProduct.tcbsp || currentProduct._id || 'Chưa có dữ liệu';

                return (
                  <div className="space-y-3">
                    {/* Slider Card with touch swipe & 2 Left/Right Buttons */}
                    <div className="relative group">
                      <div
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => onSelectProduct(currentProduct)}
                        className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm active:scale-[0.99] transition-transform duration-200 flex flex-col cursor-pointer select-none"
                      >
                        {/* 1. Hình ảnh sản phẩm (tuân thủ quy tắc: không có thì hiển thị "Chưa có dữ liệu") */}
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

                          {/* Index Counter Badge */}
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/65 text-white text-[11px] font-bold backdrop-blur-xs shadow-xs">
                            {activeSlideIndex + 1} / {displayedProducts.length}
                          </div>
                        </div>

                        {/* 2. Tên sản phẩm */}
                        <h3 className="font-bold text-stone-900 text-base line-clamp-2 leading-snug mb-2">
                          {currentProduct.name || 'Chưa có dữ liệu'}
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

                      {/* 2 Navigation Buttons: Trái & Phải overlay */}
                      {displayedProducts.length > 1 && (
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

                    {/* 2 Nút bấm điều hướng Dưới & Dots Pagination */}
                    {displayedProducts.length > 1 && (
                      <div className="flex items-center justify-between gap-3 pt-1">
                       

                        {/* Dots */}
                        <div className="flex items-center justify-center gap-1.5 overflow-x-auto w-full px-1 py-1 no-scrollbar">
                          {displayedProducts.map((_, idx) => (
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

                        
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW ON DESKTOP: RESPONSIVE GRID (hiển thị trên màn hình sm trở lên) */}
          {!loading && displayedProducts.length > 0 && (
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => {
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

          {/* NÚT XEM THÊM: Hiển thị ở cuối danh sách sản phẩm trên trang chủ */}
          {!loading && !searchTerm && onNavigateToAllProducts && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onNavigateToAllProducts}
                className="px-6 py-3 rounded-2xl bg-[#0f2d22] hover:bg-[#164332] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>
                  {products.length > 8 ? `Xem thêm (${products.length - 8} sản phẩm khác)` : `Xem tất cả ${products.length} sản phẩm`}
                </span>
                <ArrowRight className="w-4 h-4 text-[#84CC16]" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
