import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Scale,
  FileCheck,
  Sparkles,
  Share2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  Heart,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Printer,
  FileText,
  Eye,
  Info,
  Clock,
  BookOpen,
  Wheat,
  Image as ImageIcon,
  Compass,
  AlertTriangle,
  ZoomIn,
  Download,
  X
} from 'lucide-react';
import { fetchProducts, fetchProductById, slugify } from '../services/api';

/**
 * Mobile Slick Slider & Desktop Grid for Product Gallery Images
 */
function ProductGallerySlider({ images, productName, onOpenLightbox }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs font-medium text-stone-400">
        Chưa có dữ liệu
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500 font-semibold text-xs">
        Chưa có dữ liệu
      </div>
    );
  }

  const currentItem = images[currentIndex];

  return (
    <div className="space-y-4">
      {/* MOBILE SLICK SLIDER (chỉ hiển thị trên Mobile < sm) */}
      <div className="block sm:hidden space-y-3">
        {/* Main Slide Card */}
        <div className="relative group">
          <div
            className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm cursor-pointer select-none flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => onOpenLightbox && onOpenLightbox(currentItem)}
          >
            <img
              src={currentItem}
              alt={`${productName} ảnh ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Action Badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/65 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs shadow">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Chạm xem lớn</span>
            </div>

            {/* Counter Badge */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/65 text-white text-[11px] font-bold backdrop-blur-xs shadow">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* 2 Navigation Buttons: Trái (Left) & Phải (Right) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center shadow-lg transition backdrop-blur-xs z-10 cursor-pointer"
                aria-label="Trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white flex items-center justify-center shadow-lg transition backdrop-blur-xs z-10 cursor-pointer"
                aria-label="Kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip on mobile */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition bg-stone-100 ${
                  idx === currentIndex ? 'border-[#0f2d22] ring-2 ring-[#84CC16]/50' : 'border-stone-200 opacity-70'
                }`}
              >
                <img src={img} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP / TABLET: Responsive Grid (ẩn trên mobile, hiện từ sm trở lên) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => onOpenLightbox && onOpenLightbox(img)}
            className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-sm hover:shadow-md transition cursor-zoom-in"
          >
            <img
              src={img}
              alt={`${productName} ảnh ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
              <ZoomIn className="w-4 h-4" />
              <span>Xem ảnh lớn</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductTraceabilityPage({
  selectedProductId,
  onProductChange,
  onBackToHome,
  onOpenQrRegister,
  onNavigateToAdmin
}) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'specs', 'story', 'raw', 'map', 'gallery'
  const [viewMode, setViewMode] = useState('modern'); // 'modern' or 'document'
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Load product data from API
  const loadProduct = async (idOrCodeOrSlug) => {
    setLoading(true);
    try {
      const [prodsRes, currentRes] = await Promise.all([
        fetchProducts(),
        idOrCodeOrSlug ? fetchProductById(idOrCodeOrSlug) : null
      ]);

      const list = prodsRes.data || [];
      setAllProducts(list);

      let chosen = null;
      if (currentRes && currentRes.data) {
        chosen = currentRes.data;
      } else if (list.length > 0) {
        if (idOrCodeOrSlug) {
          const lowerKey = String(idOrCodeOrSlug).toLowerCase().trim();
          chosen = list.find(p => 
            p._id === idOrCodeOrSlug || 
            p.verificationCode === idOrCodeOrSlug ||
            (p.slug && p.slug.toLowerCase() === lowerKey) ||
            slugify(p.name) === lowerKey
          ) || list[0];
        } else {
          // Priority to default product (Kẹo dừa dẻo Ngọc Hải)
          chosen = list.find(p => p.isDefault) || list[0];
        }
      }

      if (chosen) {
        setProductData(chosen);
        // Automatically sync current URL with product slug
        const slug = chosen.slug || slugify(chosen.name);
        const currentPath = window.location.pathname.replace(/^\/+/, '');
        if (slug && currentPath !== slug && !window.location.pathname.startsWith('/admin')) {
          window.history.replaceState({}, '', `/${slug}`);
        }
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct(selectedProductId);
  }, [selectedProductId]);

  const handleCopyLink = () => {
    const slug = productData?.slug || slugify(productData?.name || '');
    const shareUrl = slug ? `${window.location.origin}/${slug}` : window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !productData) {
    return (
      <div className="bg-[#F8F7F3] min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-[#0f2d22] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-600">Đang đồng bộ dữ liệu truy xuất dntrace.com...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="bg-[#F8F7F3] min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Không tìm thấy thông tin sản phẩm</h2>
          <p className="text-xs text-stone-600">
            Hệ thống dntrace.com chưa tìm thấy mã tra cứu hợp lệ trong cơ sở dữ liệu.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => loadProduct()}
              className="px-4 py-2 rounded-xl bg-[#0f2d22] text-white text-xs font-bold hover:bg-[#194535] cursor-pointer"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lấy danh sách ảnh thực tế từ database (không dùng ảnh thay thế)
  const rawList = [
    ...(productData.image ? [productData.image] : []),
    ...(Array.isArray(productData.gallery) ? productData.gallery : [])
  ];
  const galleryImages = Array.from(new Set(rawList.filter(Boolean)));

  // Scannable QR code linking to http:.../ten-san-pham
  const productSlug = productData.slug || slugify(productData.name);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://dntrace.com';
  const productQrTargetUrl = `${currentOrigin}/${productSlug}`;
  const qrDisplayUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(productQrTargetUrl)}&color=0f2d22&bgcolor=ffffff&margin=1`;
  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(productQrTargetUrl)}&color=0f2d22&bgcolor=ffffff&margin=2`;

  return (
    <div className="bg-[#F8F7F3] min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Utility & Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          
          {/* Product Switcher Dropdown & Back to Home */}
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f2d22] px-3 py-2 rounded-xl bg-white border border-stone-200 shadow-sm hover:bg-stone-50 active:scale-95 transition cursor-pointer"
                title="Về Trang Chủ"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#0f2d22]" />
                <span className="hidden sm:inline">Trang Chủ</span>
              </button>
            )}

            {/* Product Name Display */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900 px-3.5 py-2 rounded-xl bg-white border border-stone-200 shadow-xs">
              <QrCode className="w-4 h-4 text-[#84CC16]" />
              <span className="truncate max-w-[220px] sm:max-w-md">{productData.name}</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-stone-100/80 px-2 py-1 rounded-lg border border-stone-200/60">
              <span>Mã:</span>
              <span className="font-mono font-bold text-stone-700">{productData.verificationCode}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(productData.verificationCode)}
                className="p-1 rounded hover:bg-stone-200/80 text-stone-400 hover:text-stone-700 transition cursor-pointer flex items-center justify-center"
                title="Sao chép mã định danh"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {copiedCode && (
                <span className="text-[10px] text-emerald-600 font-bold">Đã chép</span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('modern')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'modern' ? 'bg-white text-[#0f2d22] shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Giao diện số</span>
              </button>
              <button
                onClick={() => setViewMode('document')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'document' ? 'bg-white text-[#0f2d22] shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bản công bố</span>
              </button>
            </div>

            {/* <button
              onClick={handlePrint}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              title="In bản tra cứu"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">In hồ sơ</span>
            </button> */}

            <button
              onClick={handleCopyLink}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-sm transition cursor-pointer flex items-center gap-1.5"
              title="Sao chép link chia sẻ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
              <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
            </button>

            {onOpenQrRegister && (
              <button
                onClick={onOpenQrRegister}
                className="px-3 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] text-xs font-bold shadow transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cấp tem QR</span>
              </button>
            )}
          </div>

        </div>

        {/* Verification Success Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0f2d22] via-[#164332] to-[#0f2d22] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#84CC16]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84CC16] text-[#0f2d22] text-xs font-black uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#0f2d22]" />
                <span>{productData.status || 'ĐÃ XÁC THỰC THÀNH CÔNG'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {productData.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
                Dữ liệu tem điện tử chính hãng được xác thực trên Hệ thống truy xuất thông tin số{' '}
                <strong className="text-[#84CC16]">dntrace.com</strong>. Minh bạch toàn diện thông tin sản phẩm, cơ sở sản xuất và chuỗi cung ứng.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 text-center shrink-0 w-full sm:w-auto flex flex-col items-center shadow-lg">
              {/* Real Scannable QR Code */}
              <div
                onClick={() => setLightboxImg(qrDownloadUrl)}
                className="relative p-2 bg-white rounded-2xl shadow-xl border border-white/50 cursor-zoom-in group transition-all duration-300 hover:scale-105"
                title="Quét bằng camera điện thoại hoặc nhấp để phóng to"
              >
                <img
                  src={qrDisplayUrl}
                  alt={`Mã QR quét tra cứu ${productData.name}`}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>

              <p className="text-[10px] text-stone-200 uppercase font-black tracking-wider mt-2.5">
                MÃ ĐỊNH DANH DNTRACE
              </p>
              <p className="font-mono text-xs font-bold text-[#84CC16] mt-0.5">
                {productData.verificationCode}
              </p>

              {/* Action buttons under QR */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <a
                  href={qrDownloadUrl}
                  download={`QR_${productSlug}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-stone-200 hover:text-white transition"
                  title="Tải ảnh mã QR độ phân giải cao"
                >
                  <Download className="w-3 h-3 text-[#84CC16]" />
                  <span>Tải QR</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-stone-200 hover:text-white transition cursor-pointer"
                  title="Sao chép link truy xuất"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#84CC16]" />}
                  <span>{copied ? 'Đã chép' : 'Copy link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: DOCUMENT / SPEC SHEET VIEW (Exactly like Image 1) */}
        {viewMode === 'document' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
            
            {/* Document Header */}
            <div className="text-center pb-6 border-b-2 border-stone-800 space-y-2">
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                HỆ THỐNG truy xuất thông tin SỐ DNTRACE.COM
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
                BẢN THÔNG TIN CÔNG BỐ SẢN PHẨM
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                MÃ TRA CỨU: {productData.verificationCode} &bull; NGÀY ĐỒNG BỘ: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* PHẦN 1: THÔNG TIN SẢN PHẨM */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-wide border-l-4 border-[#0f2d22] pl-3">
                THÔNG TIN SẢN PHẨM
              </h3>
              
              <div className="overflow-hidden border border-stone-200 rounded-2xl">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody className="divide-y divide-stone-100">
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800 w-1/3 sm:w-1/4">Tên sản phẩm</td>
                      <td className="py-3 px-4 font-bold text-stone-900 text-base">{productData.name || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800 align-top">Thành phần</td>
                      <td className="py-3 px-4 text-stone-800 whitespace-pre-line leading-relaxed">{productData.ingredients || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Số TCBSP</td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{productData.tcbsp || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Số Tiêu chuẩn</td>
                      <td className="py-3 px-4 text-stone-800">{productData.standardCode || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Ngày sản xuất</td>
                      <td className="py-3 px-4 text-stone-800 font-medium">{productData.manufactureDate || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Thời hạn sử dụng</td>
                      <td className="py-3 px-4 text-stone-800 font-medium">{productData.expiry || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Khối lượng tịnh</td>
                      <td className="py-3 px-4 text-stone-800 font-medium">{productData.netWeight || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800 align-top">Hướng dẫn sử dụng</td>
                      <td className="py-3 px-4 text-stone-800 whitespace-pre-line leading-relaxed">{productData.usageGuide || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800 align-top">Bảo quản</td>
                      <td className="py-3 px-4 text-stone-800 whitespace-pre-line leading-relaxed">{productData.storageGuide || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Cảnh báo</td>
                      <td className="py-3 px-4 text-stone-800">{productData.warning || 'Chưa có dữ liệu'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PHẦN 2: THÔNG TIN ĐƠN VỊ/ NHÀ SẢN XUẤT */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-base sm:text-lg font-black text-stone-900 uppercase tracking-wide border-l-4 border-[#0f2d22] pl-3">
                THÔNG TIN ĐƠN VỊ/ NHÀ SẢN XUẤT
              </h3>

              <div className="overflow-hidden border border-stone-200 rounded-2xl">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody className="divide-y divide-stone-100">
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800 w-1/3 sm:w-1/4">Tên đơn vị:</td>
                      <td className="py-3 px-4 font-bold text-stone-900 text-base">{productData.manufacturer?.name || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Quốc gia:</td>
                      <td className="py-3 px-4 text-stone-800">{productData.manufacturer?.country || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Số XNCK ATTP</td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{productData.manufacturer?.attpCode || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Địa chỉ liên lạc:</td>
                      <td className="py-3 px-4 text-stone-800">{productData.manufacturer?.address || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Số đăng ký kinh doanh</td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{productData.manufacturer?.businessId || 'Chưa có dữ liệu'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-stone-800">Di động:</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0f2d22]">
                        {productData.manufacturer?.phone ? (
                          <a href={`tel:${productData.manufacturer.phone.replace(/\s+/g, '')}`} className="hover:underline">
                            {productData.manufacturer.phone}
                          </a>
                        ) : 'Chưa có dữ liệu'}
                      </td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="py-3 px-4 font-bold text-stone-800">Website:</td>
                      <td className="py-3 px-4">
                        {productData.manufacturer?.website ? (
                          <a
                            href={productData.manufacturer.website.startsWith('http') ? productData.manufacturer.website : `http://${productData.manufacturer.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0f2d22] font-semibold hover:underline"
                          >
                            {productData.manufacturer.website}
                          </a>
                        ) : 'Chưa có dữ liệu'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 MỤC BỔ SUNG TRONG BẢN CÔNG BỐ */}
            <div className="space-y-6 pt-4 border-t border-stone-200">
              
              {/* CÂU CHUYỆN SẢN PHẨM */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  CÂU CHUYỆN SẢN PHẨM
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-line">
                  {productData.story || 'Chưa có dữ liệu'}
                </p>
              </div>

              {/* NGUYÊN LIỆU ĐẦU VÀO */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  NGUYÊN LIỆU ĐẦU VÀO
                </h4>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-line">
                  {productData.rawMaterials || 'Chưa có dữ liệu'}
                </p>
              </div>

              {/* BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT
                </h4>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                  <p className="font-semibold mb-2">Địa chỉ: {productData.manufacturer?.address || 'Chưa có dữ liệu'}</p>
                  {productData.mapEmbed ? (
                    <div className="rounded-lg overflow-hidden h-64 border border-stone-200">
                      <iframe
                        title="Bản đồ nơi sản xuất"
                        src={productData.mapEmbed.includes('src=') ? (productData.mapEmbed.match(/src=["']([^"']+)["']/)?.[1] || productData.mapEmbed) : productData.mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <p className="text-stone-400 italic">Chưa có dữ liệu bản đồ</p>
                  )}
                </div>
              </div>

              {/* HÌNH ẢNH SẢN PHẨM */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  HÌNH ẢNH SẢN PHẨM
                </h4>
                <ProductGallerySlider
                  images={galleryImages}
                  productName={productData.name}
                  onOpenLightbox={(img) => setLightboxImg(img)}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW MODE 2: MODERN RICH INTERACTIVE VIEW */}
        {viewMode === 'modern' && (
          <div className="space-y-8">
            
            {/* Top 2-Column Grid: Visual & Producer (Left) + Specifications (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column (5 cols): Photo, Verification Badge, Manufacturer Card */}
              <div className="lg:col-span-5 space-y-6">

                {/* Real Product Image Showcase */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm relative group overflow-hidden">
                  {productData.image ? (
                    <div
                      onClick={() => setLightboxImg(productData.image)}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 flex items-center justify-center cursor-zoom-in"
                    >
                      <img
                        src={productData.image}
                        alt={productData.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/80 flex flex-col items-center justify-center p-6 text-stone-400 space-y-2">
                      <ImageIcon className="w-12 h-12 text-stone-300" />
                      <span className="text-xs font-semibold">Chưa có dữ liệu</span>
                    </div>
                  )}
                </div>

                {/* Manufacturer Card (THÔNG TIN ĐƠN VỊ/ NHÀ SẢN XUẤT) */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                    <div className="w-10 h-10 rounded-xl bg-[#0f2d22]/10 text-[#0f2d22] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#0f2d22]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0f2d22] text-sm uppercase tracking-wide">
                        THÔNG TIN ĐƠN VỊ/ NHÀ SẢN XUẤT
                      </h3>
                      <p className="text-[11px] text-stone-500">Chủ sở hữu &amp; chịu trách nhiệm chất lượng</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-stone-700">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Tên đơn vị:</span>
                      <span className="font-bold text-stone-900 text-sm">{productData.manufacturer?.name || 'Chưa có dữ liệu'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Quốc gia</span>
                        <span className="font-bold text-stone-900 text-xs mt-0.5 block">{productData.manufacturer?.country || 'Chưa có dữ liệu'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-stone-500 block text-[10px] uppercase font-semibold">Số XNCK ATTP</span>
                        <span className="font-mono font-bold text-[#0f2d22] text-xs mt-0.5 block">{productData.manufacturer?.attpCode || 'Chưa có dữ liệu'}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-stone-500 block text-[10px] uppercase font-semibold">Số đăng ký kinh doanh</span>
                      <span className="font-mono font-bold text-stone-900 text-xs mt-0.5 block">{productData.manufacturer?.businessId || 'Chưa có dữ liệu'}</span>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <MapPin className="w-4 h-4 text-[#0f2d22] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 block text-[11px]">Địa chỉ liên lạc:</span>
                        <span className="font-medium text-stone-800">{productData.manufacturer?.address || 'Chưa có dữ liệu'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Phone className="w-4 h-4 text-[#0f2d22] shrink-0" />
                      <div>
                        <span className="text-stone-500 block text-[11px]">Di động:</span>
                        {productData.manufacturer?.phone ? (
                          <a
                            href={`tel:${productData.manufacturer.phone.replace(/\s+/g, '')}`}
                            className="font-bold text-[#0f2d22] hover:underline"
                          >
                            {productData.manufacturer.phone}
                          </a>
                        ) : (
                          <span className="font-medium text-stone-800">Chưa có dữ liệu</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Globe className="w-4 h-4 text-[#0f2d22] shrink-0" />
                      <div>
                        <span className="text-stone-500 block text-[11px]">Website:</span>
                        {productData.manufacturer?.website ? (
                          <a
                            href={productData.manufacturer.website.startsWith('http') ? productData.manufacturer.website : `http://${productData.manufacturer.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0f2d22] font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>{productData.manufacturer.website}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="font-medium text-stone-800">Chưa có dữ liệu</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {productData.manufacturer?.phone && (
                    <div className="pt-2">
                      <a
                        href={`tel:${productData.manufacturer.phone.replace(/\s+/g, '')}`}
                        className="w-full py-3 rounded-xl bg-[#0f2d22] hover:bg-[#164332] text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition"
                      >
                        <Phone className="w-4 h-4 text-[#84CC16]" />
                        <span>Gọi Trực Tiếp Đặt Hàng: {productData.manufacturer.phone}</span>
                      </a>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (7 cols): THÔNG TIN SẢN PHẨM Table & Specs */}
              <div className="lg:col-span-7 space-y-6">

                {/* THÔNG TIN SẢN PHẨM Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                  
                  <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#0f2d22]">
                        HẠNG MỤC 01
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5 uppercase">
                        THÔNG TIN SẢN PHẨM
                      </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Hợp chuẩn CBSP</span>
                    </span>
                  </div>

                  {/* Thành phần Box */}
                  <div className="p-5 rounded-2xl bg-[#F8F7F3] border border-stone-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0f2d22]">
                      <Sparkles className="w-4 h-4 text-[#84CC16]" />
                      <span>Thành phần công thức:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-semibold whitespace-pre-line">
                      {productData.ingredients || 'Chưa có dữ liệu'}
                    </p>
                  </div>

                  {/* Specs Table covering ALL fields from Image 1 */}
                  <div className="overflow-hidden rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-stone-100">
                        <tr className="bg-stone-50/60">
                          <td className="py-3 px-4 font-bold text-stone-600 w-2/5">Tên sản phẩm</td>
                          <td className="py-3 px-4 font-bold text-stone-900">{productData.name || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-stone-600">Số TCBSP</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#0f2d22]">{productData.tcbsp || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr className="bg-stone-50/60">
                          <td className="py-3 px-4 font-bold text-stone-600">Số Tiêu chuẩn</td>
                          <td className="py-3 px-4 text-stone-700">{productData.standardCode || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-stone-600">Ngày sản xuất</td>
                          <td className="py-3 px-4 font-semibold text-stone-900">{productData.manufactureDate || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr className="bg-stone-50/60">
                          <td className="py-3 px-4 font-bold text-stone-600">Thời hạn sử dụng</td>
                          <td className="py-3 px-4 font-semibold text-stone-900">{productData.expiry || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-stone-600">Khối lượng tịnh</td>
                          <td className="py-3 px-4 font-semibold text-stone-900">{productData.netWeight || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr className="bg-stone-50/60">
                          <td className="py-3 px-4 font-bold text-stone-600 align-top">Hướng dẫn sử dụng</td>
                          <td className="py-3 px-4 text-stone-700 leading-relaxed whitespace-pre-line">{productData.usageGuide || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-bold text-stone-600 align-top">Bảo quản</td>
                          <td className="py-3 px-4 text-stone-700 leading-relaxed whitespace-pre-line">{productData.storageGuide || 'Chưa có dữ liệu'}</td>
                        </tr>
                        <tr className="bg-stone-50/60">
                          <td className="py-3 px-4 font-bold text-stone-600">Cảnh báo</td>
                          <td className="py-3 px-4 text-stone-700">{productData.warning || 'Chưa có dữ liệu'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Legal Standards Badges */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                      Hồ sơ pháp lý &amp; Tiêu chuẩn đã đối soát:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
                        <span className="text-[10px] text-emerald-800 font-semibold block">Tự công bố (TCBSP)</span>
                        <strong className="text-emerald-950 font-mono">{productData.tcbsp ? productData.tcbsp.replace(/Số\s*TCBSP:\s*/i, '') : 'Chưa có dữ liệu'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
                        <span className="text-[10px] text-emerald-800 font-semibold block">Số XNCK ATTP</span>
                        <strong className="text-emerald-950 font-mono">{productData.manufacturer?.attpCode || 'Chưa có dữ liệu'}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs">
                        <span className="text-[10px] text-emerald-800 font-semibold block">Số ĐKKD</span>
                        <strong className="text-emerald-950 font-mono">{productData.manufacturer?.businessId || 'Chưa có dữ liệu'}</strong>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* 4 DEDICATED SECTIONS AS HIGHLIGHTED IN IMAGE 1 */}
            <div className="space-y-6 pt-4">

              {/* Navigation Tabs for the 4 Sections */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-200/70 border border-stone-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                    activeTab === 'all' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  Tất cả các mục
                </button>
                <button
                  onClick={() => setActiveTab('story')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'story' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>CÂU CHUYỆN SẢN PHẨM</span>
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'raw' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Wheat className="w-3.5 h-3.5" />
                  <span>NGUYÊN LIỆU ĐẦU VÀO</span>
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'map' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT</span>
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'gallery' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>HÌNH ẢNH SẢN PHẨM</span>
                </button>
              </div>

              {/* 1. CÂU CHUYỆN SẢN PHẨM */}
              {(activeTab === 'all' || activeTab === 'story') && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                    <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5 text-[#0f2d22]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                        CÂU CHUYỆN SẢN PHẨM
                      </h3>
                      <p className="text-xs text-stone-500">Hương vị quê hương và tâm huyết người làm nghề</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F8F7F3] to-stone-100/70 border border-stone-200/80">
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                      {productData.story || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. NGUYÊN LIỆU ĐẦU VÀO */}
              {(activeTab === 'all' || activeTab === 'raw') && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                    <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center font-bold">
                      <Wheat className="w-5 h-5 text-[#0f2d22]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                        NGUYÊN LIỆU ĐẦU VÀO
                      </h3>
                      <p className="text-xs text-stone-500">Minh bạch thông tin xuất xứ nguyên liệu sạch</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#F8F7F3] border border-stone-200/80 space-y-4">
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line font-medium">
                      {productData.rawMaterials || 'Chưa có dữ liệu'}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT */}
              {(activeTab === 'all' || activeTab === 'map') && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center font-bold">
                        <Compass className="w-5 h-5 text-[#0f2d22]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                          BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT
                        </h3>
                        <p className="text-xs text-stone-500">Định vị GPS tọa độ cơ sở sản xuất</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                      <MapPin className="w-4 h-4 text-[#0f2d22]" />
                      <span>{productData.manufacturer?.address || 'Chưa có dữ liệu'}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-inner h-[400px] w-full bg-stone-100 flex items-center justify-center">
                    {productData.mapEmbed ? (() => {
                      const rawEmbed = productData.mapEmbed.trim();
                      const srcMatch = rawEmbed.match(/src=["']([^"']+)["']/);
                      const iframeSrc = srcMatch ? srcMatch[1] : rawEmbed;
                      return (
                        <iframe
                          title={`Bản đồ ${productData.name}`}
                          src={iframeSrc}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      );
                    })() : (
                      <div className="text-center p-6 text-stone-500 space-y-2">
                        <MapPin className="w-8 h-8 text-stone-400 mx-auto" />
                        <p className="text-xs">Chưa có dữ liệu</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. HÌNH ẢNH SẢN PHẨM */}
              {(activeTab === 'all' || activeTab === 'gallery') && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                    <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center font-bold">
                      <ImageIcon className="w-5 h-5 text-[#0f2d22]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                        HÌNH ẢNH SẢN PHẨM
                      </h3>
                      <p className="text-xs text-stone-500">Hình ảnh bao bì thực tế và quy cách sản phẩm</p>
                    </div>
                  </div>

                  <ProductGallerySlider
                    images={galleryImages}
                    productName={productData.name}
                    onOpenLightbox={(img) => setLightboxImg(img)}
                  />
                </div>
              )}

            </div>

            {/* Registration Callout Banner */}
            {/* <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f2d22] to-[#194535] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#84CC16] text-[#0f2d22] flex items-center justify-center shrink-0 font-black shadow-md">
                  <QrCode className="w-8 h-8 text-[#0f2d22]" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#84CC16]">
                    DÀNH CHO DOANH NGHIỆP &amp; HỢP TÁC XÃ
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Đăng Ký Cấp Mã QR truy xuất thông tin dntrace.com
                  </h4>
                  <p className="text-xs text-stone-200 max-w-xl">
                    Khởi tạo cổng truy xuất, tem chống giả và nhật ký sản xuất minh bạch cho sản phẩm của bạn chỉ trong 24 giờ.
                  </p>
                </div>
              </div>

              {onOpenQrRegister && (
                <button
                  onClick={onOpenQrRegister}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] font-black text-xs uppercase tracking-wider shadow-lg transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Đăng Ký Cấp Mã QR Ngay</span>
                </button>
              )}
            </div> */}

          </div>
        )}

      </div>

      {/* Image Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer z-20"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={lightboxImg}
            alt="Phóng to ảnh sản phẩm"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
}
