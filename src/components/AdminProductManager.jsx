import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Database,
  RefreshCw,
  Sparkles,
  QrCode,
  Check,
  Copy,
  AlertTriangle,
  Info,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  MapPin,
  Phone,
  Eye,
  Server,
  LogOut,
  Cloud,
  CloudUpload,
  Download,
  FileText,
  Clock,
  Filter,
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Star,
  ZoomIn
} from 'lucide-react';
import {
  fetchProducts,
  fetchApiStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteCloudinaryImage,
  deleteMultipleCloudinaryImages,
  fetchQrRequests,
  updateQrRequestStatus,
  deleteQrRequest,
  slugify,
  checkFileLimit,
  MAX_IMAGE_SIZE_KB
} from '../services/api';
import DNTraceLogo from './DNTraceLogo';

export default function AdminProductManager({
  onViewProduct,
  onBackToTraceability,
  onLogout
}) {
  // Main view state
  const [adminTab, setAdminTab] = useState('products'); // 'products' or 'qr_requests'
  const [products, setProducts] = useState([]);
  const [qrRequests, setQrRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInfo, setStatusInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrProduct, setSelectedQrProduct] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [modalTab, setModalTab] = useState('general'); // 'general', 'specs', 'producer', 'content', 'images'
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [manualGalleryUrl, setManualGalleryUrl] = useState('');
  const [previewLightboxImg, setPreviewLightboxImg] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const initialFormState = {
    name: '',
    slug: '',
    system: 'CỔNG truy xuất thông tin DNTRACE (dntrace.com)',
    provider: 'dntrace.com',
    status: 'ĐÃ XÁC THỰC THÀNH CÔNG',
    verificationCode: '',
    image: '',
    gallery: [],
    ingredients: '',
    tcbsp: '',
    standardCode: '',
    manufactureDate: '',
    expiry: '',
    netWeight: '',
    usageGuide: '',
    storageGuide: '',
    warning: '',
    story: '',
    rawMaterials: '',
    manufacturer: {
      name: '',
      country: '',
      attpCode: '',
      businessId: '',
      address: '',
      phone: '',
      website: ''
    },
    mapEmbed: '',
    isDefault: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, statRes, qrRes] = await Promise.all([
        fetchProducts(),
        fetchApiStatus(),
        fetchQrRequests()
      ]);
      setProducts(prodRes.data || []);
      setStatusInfo(statRes);
      setQrRequests(qrRes.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Add Product modal
  const handleOpenAddModal = () => {
    const randomCode = 'DNTRACE-' + Math.floor(100000 + Math.random() * 900000);
    setFormData({
      ...initialFormState,
      verificationCode: randomCode,
      slug: ''
    });
    setEditingProduct(null);
    setModalTab('general');
    setIsEditModalOpen(true);
  };

  // Open Edit Product modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || slugify(product.name || ''),
      system: product.system || 'CỔNG truy xuất thông tin DNTRACE (dntrace.com)',
      provider: product.provider || 'dntrace.com',
      status: product.status || 'ĐÃ XÁC THỰC THÀNH CÔNG',
      verificationCode: product.verificationCode || '',
      image: product.image || '',
      gallery: product.gallery || [],
      ingredients: product.ingredients || '',
      tcbsp: product.tcbsp || '',
      standardCode: product.standardCode || '',
      manufactureDate: product.manufactureDate || '',
      expiry: product.expiry || '',
      netWeight: product.netWeight || '',
      usageGuide: product.usageGuide || '',
      storageGuide: product.storageGuide || '',
      warning: product.warning || '',
      story: product.story || '',
      rawMaterials: product.rawMaterials || '',
      manufacturer: {
        name: product.manufacturer?.name || '',
        country: product.manufacturer?.country || '',
        attpCode: product.manufacturer?.attpCode || '',
        businessId: product.manufacturer?.businessId || '',
        address: product.manufacturer?.address || '',
        phone: product.manufacturer?.phone || '',
        website: product.manufacturer?.website || ''
      },
      mapEmbed: product.mapEmbed || '',
      isDefault: Boolean(product.isDefault)
    });
    setModalTab('general');
    setIsEditModalOpen(true);
  };

  // Quick Create Product from a QR Request
  const handleConvertRequestToProduct = (req) => {
    const randomCode = 'DNTRACE-' + Math.floor(100000 + Math.random() * 900000);
    setFormData({
      ...initialFormState,
      name: req.productName || '',
      slug: slugify(req.productName || ''),
      verificationCode: randomCode,
      manufacturer: {
        name: req.businessName || '',
        country: 'Việt Nam',
        attpCode: '',
        businessId: '',
        address: req.address || '',
        phone: req.phone || '',
        website: ''
      },
      story: req.note ? `Ghi chú từ đơn đăng ký: ${req.note}` : ''
    });
    setEditingProduct(null);
    setModalTab('general');
    setViewingRequest(null);
    setAdminTab('products');
    setIsEditModalOpen(true);
  };

  // Save product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formData.verificationCode.trim()) {
      showToast('⚠️ Vui lòng nhập mã xác thực dntrace!');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.verificationCode;
        const res = await updateProduct(id, formData);
        showToast(res.message || '✅ Đã cập nhật sản phẩm thành công!');
      } else {
        const res = await createProduct(formData);
        showToast(res.message || '✅ Đã tạo mới sản phẩm thành công!');
      }
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      showToast('❌ Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      const id = deletingProduct._id || deletingProduct.verificationCode;
      const res = await deleteProduct(id);
      showToast(res.message || '🗑️ Đã xoá sản phẩm thành công!');
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      await loadData();
    } catch (err) {
      showToast('❌ Lỗi: ' + err.message);
    }
  };

  // Re-seed data
  const handleSeedData = async () => {
    if (!window.confirm('Khởi tạo lại dữ liệu mẫu sẽ làm mới danh sách sản phẩm theo chuẩn (Kẹo dừa dẻo Ngọc Hải...). Tiếp tục?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await seedProducts();
      showToast(res.message || '✅ Đã nạp lại dữ liệu mẫu!');
      await loadData();
    } catch (err) {
      showToast('❌ Lỗi nạp dữ liệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Primary Image Upload (Single to Cloudinary)
  const handlePrimaryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const check = checkFileLimit(file);
    if (!check.valid) {
      alert(
        `⚠️ CẢNH BÁO DUNG LƯỢNG:\n\n` +
        `Ảnh "${check.fileName}" có kích thước ${check.sizeKb.toLocaleString()} KB (vượt quá mức cho phép ${check.limitKb.toLocaleString()} KB).\n` +
        `Vui lòng chọn ảnh nhỏ hơn để đảm bảo tải lên nhanh chóng và ổn định!`
      );
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    setUploadProgressText('☁️ Đang tối ưu dung lượng và tải ảnh chính lên Cloudinary...');
    try {
      const res = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, image: res.url }));
      showToast('📸 Đã tải ảnh chính lên Cloudinary thành công!');
    } catch (err) {
      showToast('❌ Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingImage(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  // Handle Multiple Gallery Images Upload (Batch to Cloudinary)
  const handleMultipleGalleryUpload = async (e) => {
    let files = [];
    if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    } else if (e.target && e.target.files) {
      files = Array.from(e.target.files);
    }

    if (!files || files.length === 0) return;

    // Filter image files only
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('⚠️ Vui lòng chọn các tệp hình ảnh hợp lệ (JPG, PNG, WEBP...)');
      if (e.target) e.target.value = '';
      return;
    }

    // Check size for each image
    const oversizedFiles = [];
    const validFiles = [];
    for (const f of imageFiles) {
      const check = checkFileLimit(f);
      if (!check.valid) {
        oversizedFiles.push(check);
      } else {
        validFiles.push(f);
      }
    }

    if (oversizedFiles.length > 0) {
      const detailList = oversizedFiles.map(o => `• "${o.fileName}": ${(o.sizeKb / 1024).toFixed(1)} MB > 10 MB`).join('\n');
      alert(`⚠️ CẢNH BÁO: Các ảnh sau vượt quá giới hạn 10 MB:\n${detailList}\nVui lòng chọn ảnh nhỏ hơn!`);
      if (validFiles.length === 0) {
        if (e.target) e.target.value = '';
        return;
      }
    }

    setUploadingImage(true);
    setUploadProgressText(`☁️ Đang chuẩn bị tải ${validFiles.length} ảnh lên Cloudinary...`);
    
    try {
      const res = await uploadMultipleImagesToCloudinary(validFiles, 'dntrace_products', (progress) => {
        setUploadProgressText(
          `☁️ Đang tải ảnh [${progress.current}/${progress.total}]: ${progress.name} (${progress.percent}%)...`
        );
      });

      if (res.urls && res.urls.length > 0) {
        setFormData(prev => {
          const currentGallery = prev.gallery || [];
          const newGallery = [...currentGallery, ...res.urls];
          const firstImage = res.urls[0];
          return {
            ...prev,
            gallery: newGallery,
            image: (!prev.image || prev.image.includes('spec.png')) && firstImage ? firstImage : prev.image
          };
        });
        showToast(`✅ Đã tải thành công ${res.urls.length} ảnh lên Cloudinary!`);
      } else {
        showToast('⚠️ Không nhận được link ảnh từ Cloudinary');
      }
    } catch (err) {
      showToast('❌ Lỗi tải ảnh lên Cloudinary: ' + err.message);
    } finally {
      setUploadingImage(false);
      setUploadProgressText('');
      if (e.target) e.target.value = '';
    }
  };

  // Set selected gallery image as primary product image
  const handleSetAsPrimaryImage = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    showToast('⭐ Đã đặt ảnh này làm ảnh đại diện chính!');
  };

  // Add manual image URL to gallery
  const handleAddManualGalleryUrl = () => {
    if (!manualGalleryUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), manualGalleryUrl.trim()]
    }));
    setManualGalleryUrl('');
    showToast('Đã thêm ảnh vào thư viện!');
  };

  // Remove Primary Image and delete from Cloudinary
  const handleRemovePrimaryImage = async () => {
    const imgToDelete = formData.image;
    setFormData(prev => ({ ...prev, image: '' }));
    if (imgToDelete && imgToDelete.includes('cloudinary.com')) {
      showToast('🗑️ Đang xoá ảnh khỏi Cloudinary...');
      await deleteCloudinaryImage(imgToDelete);
      showToast('✅ Đã xoá ảnh chính khỏi Cloudinary!');
    } else {
      showToast('Đã xoá ảnh đại diện');
    }
  };

  // Remove Single Gallery Image and delete from Cloudinary
  const handleRemoveGalleryImage = async (index, imgUrl) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, idx) => idx !== index)
    }));
    if (imgUrl && imgUrl.includes('cloudinary.com')) {
      showToast('🗑️ Đang xoá ảnh khỏi Cloudinary...');
      await deleteCloudinaryImage(imgUrl);
      showToast('✅ Đã xoá ảnh khỏi Cloudinary!');
    } else {
      showToast('Đã xoá ảnh khỏi thư viện');
    }
  };

  // Remove All Gallery Images and delete from Cloudinary
  const handleRemoveAllGalleryImages = async () => {
    const currentGallery = formData.gallery || [];
    if (currentGallery.length === 0) return;
    setFormData(prev => ({ ...prev, gallery: [] }));
    const cloudImages = currentGallery.filter(u => u && u.includes('cloudinary.com'));
    if (cloudImages.length > 0) {
      showToast(`🗑️ Đang xoá ${cloudImages.length} ảnh khỏi Cloudinary...`);
      await deleteMultipleCloudinaryImages(cloudImages);
      showToast(`✅ Đã xoá ${cloudImages.length} ảnh khỏi Cloudinary!`);
    } else {
      showToast('Đã xoá tất cả ảnh trong thư viện');
    }
  };

  // Update QR Request Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await updateQrRequestStatus(id, newStatus);
      showToast(res.message || '✅ Đã cập nhật trạng thái đơn!');
      const updatedList = qrRequests.map(r => r._id === id ? { ...r, status: newStatus } : r);
      setQrRequests(updatedList);
      if (viewingRequest && viewingRequest._id === id) {
        setViewingRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast('❌ Lỗi cập nhật: ' + err.message);
    }
  };

  // Delete QR Request
  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đơn đăng ký cấp mã QR này?')) return;
    try {
      const res = await deleteQrRequest(id);
      showToast(res.message || '🗑️ Đã xoá đơn thành công!');
      setQrRequests(prev => prev.filter(r => r._id !== id));
      if (viewingRequest && viewingRequest._id === id) setViewingRequest(null);
    } catch (err) {
      showToast('❌ Lỗi: ' + err.message);
    }
  };

  // Copy code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.verificationCode?.toLowerCase().includes(q) ||
      p.manufacturer?.name?.toLowerCase().includes(q) ||
      p.tcbsp?.toLowerCase().includes(q)
    );
  });

  // Filter requests
  const filteredRequests = qrRequests.filter(r => {
    const matchesFilter = requestFilter === 'all' || r.status === requestFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      r.name?.toLowerCase().includes(q) ||
      r.businessName?.toLowerCase().includes(q) ||
      r.productName?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q)
    );
    return matchesFilter && matchesSearch;
  });

  const pendingRequestsCount = qrRequests.filter(r => r.status === 'pending' || !r.status).length;

  return (
    <div className="bg-[#F8F7F3] min-h-screen pb-16 text-[#19241F]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f2d22] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#84CC16]/30 flex items-center gap-3 animate-bounce">
          <Info className="w-5 h-5 text-[#84CC16]" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div className="bg-[#0f2d22] text-white border-b border-[#1C4638] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Portal Title */}
            <div className="flex items-center gap-3">
              <DNTraceLogo className="h-8" isWhite={true} pillBackground={true} />
             
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* DB Status Badge */}
              {/* <div
                title={statusInfo?.dbConnected ? 'Đã kết nối cơ sở dữ liệu MongoDB' : 'Đang chạy bộ nhớ In-Memory tạm thời'}
                className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs border border-white/10"
              >
                <span className={`w-2 h-2 rounded-full ${statusInfo?.dbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-medium text-stone-200">
                  {statusInfo?.dbConnected ? 'MongoDB Đã Kết Nối' : 'In-Memory Cache'}
                </span>
              </div> */}

              {/* Back to Traceability */}
              <button
                onClick={onBackToTraceability}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Về Trang Truy Xuất</span>
              </button>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Đăng xuất quản trị"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">

        {/* Top Tab Switcher: Products vs QR Requests */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm">
          
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setAdminTab('products')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                adminTab === 'products' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Quản Lý Sản Phẩm ({products.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('qr_requests')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                adminTab === 'qr_requests' ? 'bg-[#0f2d22] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Đơn Đăng Ký Cấp Mã QR ({qrRequests.length})</span>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#84CC16] text-[#0f2d22] text-[10px] font-black">
                  {pendingRequestsCount} mới
                </span>
              )}
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {adminTab === 'products' ? (
              <>
                <button
                  onClick={handleSeedData}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Tải lại dữ liệu mẫu Kẹo dừa dẻo Ngọc Hải"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Khởi Tạo Dữ Liệu Mẫu</span>
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
              </>
            ) : (
              <button
                onClick={loadData}
                className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm Mới Danh Sách</span>
              </button>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* TAB 1: PRODUCT MANAGEMENT */}
        {/* ======================================================== */}
        {adminTab === 'products' && (
          <div className="space-y-6">
            
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm theo tên, mã định danh dntrace, tên cơ sở, số TCBSP..."
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-stone-900 placeholder:text-stone-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-stone-400 hover:text-stone-600">
                  Xoá
                </button>
              )}
            </div>

            {/* Products Data Table */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0f2d22] text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-4 px-4 sm:px-6">Sản Phẩm &amp; Quy Cách</th>
                      <th className="py-4 px-4">Mã Định Danh (QR)</th>
                      <th className="py-4 px-4">Số TCBSP &amp; Pháp Lý</th>
                      <th className="py-4 px-4">Cơ Sở Sản Xuất</th>
                      <th className="py-4 px-4">Trạng Thái</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-stone-500">
                          <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                          <p className="font-semibold text-sm">Không tìm thấy sản phẩm nào</p>
                          <p className="text-xs text-stone-400 mt-1">Hãy bấm "Thêm Sản Phẩm Mới" hoặc "Khởi Tạo Dữ Liệu Mẫu"</p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p._id || p.verificationCode} className="hover:bg-stone-50/70 transition-colors">
                          
                          {/* Col 1: Visual & Name */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                              <div className="max-w-[220px]">
                                <h4 className="font-bold text-stone-900 leading-tight text-xs sm:text-sm">
                                  {p.name}
                                </h4>
                                <a
                                  href={`/${p.slug || slugify(p.name)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-mono text-[#0f2d22] font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                                  title="Mở liên kết sản phẩm"
                                >
                                  <span>/{p.slug || slugify(p.name)}</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                                <span className="text-[11px] text-stone-500 block truncate">
                                  {p.netWeight && `KL: ${p.netWeight}`} &bull; {p.expiry && `HSD: ${p.expiry}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Verification Code */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-[#0f2d22] bg-[#84CC16]/20 px-2 py-0.5 rounded-md">
                                {p.verificationCode}
                              </span>
                              <button
                                onClick={() => handleCopyCode(p.verificationCode)}
                                className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition"
                                title="Sao chép mã"
                              >
                                {copiedCode === p.verificationCode ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Col 3: Legal & Standards */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5 text-xs">
                              <p className="font-bold text-stone-800">{p.tcbsp || 'Chưa có dữ liệu'}</p>
                              {p.manufacturer?.attpCode && (
                                <p className="text-[11px] text-stone-500">ATTP: {p.manufacturer.attpCode}</p>
                              )}
                            </div>
                          </td>

                          {/* Col 4: Manufacturer */}
                          <td className="py-4 px-4">
                            <div className="max-w-[180px] text-xs">
                              <p className="font-semibold text-stone-900 truncate">
                                {p.manufacturer?.name || 'Chưa có dữ liệu'}
                              </p>
                              <p className="text-[11px] text-stone-500 truncate">
                                {p.manufacturer?.phone || p.manufacturer?.address || 'Chưa có dữ liệu'}
                              </p>
                            </div>
                          </td>

                          {/* Col 5: Status */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã Xác Thực</span>
                            </span>
                          </td>

                          {/* Col 6: Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* View on traceability */}
                              <button
                                onClick={() => onViewProduct(p.slug || slugify(p.name))}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-[#0f2d22] text-stone-600 hover:text-white transition cursor-pointer"
                                title="Xem trang truy xuất"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Download/View QR code */}
                              <button
                                onClick={() => {
                                  setSelectedQrProduct(p);
                                  setIsQrModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-[#84CC16] text-stone-600 hover:text-[#0f2d22] transition cursor-pointer"
                                title="Xuất / Tải mã QR"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-[#0f2d22] text-stone-600 hover:text-white transition cursor-pointer"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  setDeletingProduct(p);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-rose-500 text-stone-600 hover:text-white transition cursor-pointer"
                                title="Xoá sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: QR CODE REGISTRATION REQUESTS */}
        {/* ======================================================== */}
        {adminTab === 'qr_requests' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3 flex-1 bg-stone-50 px-3 py-2 rounded-2xl border border-stone-200">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên người gửi, cơ sở, sản phẩm, số điện thoại..."
                  className="w-full text-xs sm:text-sm bg-transparent outline-none text-stone-900"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setRequestFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    requestFilter === 'all' ? 'bg-[#0f2d22] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Tất cả ({qrRequests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    requestFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Chờ duyệt ({qrRequests.filter(r => r.status === 'pending' || !r.status).length})
                </button>
                <button
                  onClick={() => setRequestFilter('contacted')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    requestFilter === 'contacted' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Đã liên hệ ({qrRequests.filter(r => r.status === 'contacted').length})
                </button>
                <button
                  onClick={() => setRequestFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    requestFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Đã cấp mã ({qrRequests.filter(r => r.status === 'approved').length})
                </button>
              </div>

            </div>

            {/* Requests Data Table */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0f2d22] text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-4 px-4 sm:px-6">Cơ Sở &amp; Người Đăng Ký</th>
                      <th className="py-4 px-4">Sản Phẩm Đăng Ký</th>
                      <th className="py-4 px-4">Loại Tem &amp; SL</th>
                      <th className="py-4 px-4">Thời Gian</th>
                      <th className="py-4 px-4">Trạng Thái</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-stone-500">
                          <QrCode className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                          <p className="font-semibold text-sm">Chưa có đơn đăng ký cấp mã QR nào</p>
                          <p className="text-xs text-stone-400 mt-1">Các yêu cầu từ form "Đăng Ký Cấp Mã QR" sẽ được hiển thị tại đây.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req._id} className="hover:bg-stone-50/70 transition-colors">
                          
                          {/* Col 1: Business & Contact */}
                          <td className="py-4 px-4 sm:px-6">
                            <div>
                              <h4 className="font-bold text-stone-900 leading-tight text-xs sm:text-sm">
                                {req.businessName || 'Cơ sở sản xuất'}
                              </h4>
                              <p className="text-xs text-stone-600 mt-0.5">
                                Đại diện: <strong>{req.name}</strong>
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                                <a href={`tel:${req.phone}`} className="text-[#0f2d22] font-bold hover:underline flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{req.phone}</span>
                                </a>
                                {req.email && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{req.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Product Name */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-[#0f2d22] text-xs sm:text-sm block">
                              {req.productName}
                            </span>
                            {req.address && (
                              <span className="text-[11px] text-stone-500 truncate block max-w-xs mt-0.5">
                                {req.address}
                              </span>
                            )}
                          </td>

                          {/* Col 3: QR Type & Quantity */}
                          <td className="py-4 px-4">
                            <span className="text-xs font-semibold text-stone-800 block">
                              {req.qrType || 'Tem truy xuất QR'}
                            </span>
                            <span className="text-[11px] text-[#84CC16] bg-[#0f2d22] px-2 py-0.5 rounded font-mono inline-block mt-0.5">
                              {req.quantity || '1.000 tem'}
                            </span>
                          </td>

                          {/* Col 4: Time */}
                          <td className="py-4 px-4 text-xs text-stone-500 whitespace-nowrap">
                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                          </td>

                          {/* Col 5: Status */}
                          <td className="py-4 px-4">
                            {req.status === 'approved' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã cấp mã</span>
                              </span>
                            ) : req.status === 'contacted' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Đã liên hệ</span>
                              </span>
                            ) : req.status === 'rejected' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Từ chối
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Chờ duyệt</span>
                              </span>
                            )}
                          </td>

                          {/* Col 6: Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Quick create product */}
                              <button
                                onClick={() => handleConvertRequestToProduct(req)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] text-xs font-black shadow-sm transition cursor-pointer flex items-center gap-1"
                                title="Tạo nhanh sản phẩm từ đơn này"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">Tạo SP</span>
                              </button>

                              {/* View detail */}
                              <button
                                onClick={() => setViewingRequest(req)}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-[#0f2d22] text-stone-600 hover:text-white transition cursor-pointer"
                                title="Chi tiết đơn"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteRequest(req._id)}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-rose-500 text-stone-600 hover:text-white transition cursor-pointer"
                                title="Xoá đơn"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-stone-900/75 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 z-10 my-8">
            
            {/* Modal Header */}
            <div className="bg-[#0f2d22] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#84CC16] text-[#0f2d22] flex items-center justify-center font-black">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingProduct ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Sản Phẩm Mới Vào Hệ Thống dntrace.com'}
                  </h3>
                  <p className="text-xs text-stone-300">
                    Điền đầy đủ thông tin để cấp tem truy xuất thông tin chính hãng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Tabs */}
            <div className="flex items-center gap-2 p-2 bg-stone-100 border-b border-stone-200 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('general')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  modalTab === 'general' ? 'bg-white text-[#0f2d22] shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Thông Tin Chung &amp; Pháp Lý
              </button>
              <button
                type="button"
                onClick={() => setModalTab('specs')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  modalTab === 'specs' ? 'bg-white text-[#0f2d22] shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Quy Cách &amp; Thành Phần
              </button>
              <button
                type="button"
                onClick={() => setModalTab('producer')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  modalTab === 'producer' ? 'bg-white text-[#0f2d22] shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Đơn Vị Sản Xuất
              </button>
              <button
                type="button"
                onClick={() => setModalTab('content')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  modalTab === 'content' ? 'bg-white text-[#0f2d22] shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4. Câu Chuyện, Nguyên Liệu &amp; Bản Đồ
              </button>
              <button
                type="button"
                onClick={() => setModalTab('images')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  modalTab === 'images' ? 'bg-white text-[#0f2d22] shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                5. Hình Ảnh Sản Phẩm
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-5">
              
              {/* TAB 1: GENERAL & LEGAL */}
              {modalTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Tên sản phẩm <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            name: val,
                            slug: (!editingProduct || !prev.slug) ? slugify(val) : prev.slug
                          }));
                        }}
                        placeholder="Ví dụ: Kẹo dừa dẻo Ngọc Hải"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Đường dẫn tĩnh / Slug (URL sản phẩm)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 text-xs font-mono select-none">/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                          placeholder="keo-dua-deo-ngoc-hai"
                          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 font-mono text-[#0f2d22] outline-none focus:border-[#0f2d22] bg-white"
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 block font-mono truncate">
                        Link xem: {typeof window !== 'undefined' ? window.location.origin : 'https://dntrace.com'}/{formData.slug || slugify(formData.name)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Mã định danh xác thực dntrace <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.verificationCode}
                        onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                        placeholder="Ví dụ: DNTRACE-KDNH-2026-049189"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 font-mono font-bold text-[#0f2d22] outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Số TCBSP (Tự công bố sản phẩm)
                      </label>
                      <input
                        type="text"
                        value={formData.tcbsp}
                        onChange={(e) => setFormData({ ...formData, tcbsp: e.target.value })}
                        placeholder="Ví dụ: Số TCBSP: 01/NGOHAI/2026"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Số Tiêu chuẩn
                      </label>
                      <input
                        type="text"
                        value={formData.standardCode}
                        onChange={(e) => setFormData({ ...formData, standardCode: e.target.value })}
                        placeholder="Để trống hoặc điền mã tiêu chuẩn"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Trạng thái hiển thị
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      >
                        <option value="ĐÃ XÁC THỰC THÀNH CÔNG">ĐÃ XÁC THỰC THÀNH CÔNG</option>
                        <option value="ĐANG CẬP NHẬT DỮ LIỆU">ĐANG CẬP NHẬT DỮ LIỆU</option>
                        <option value="CHỜ XÁC MINH ATTP">CHỜ XÁC MINH ATTP</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-[#0f2d22] rounded"
                      />
                      <label htmlFor="isDefault" className="text-xs font-bold text-stone-700 cursor-pointer">
                        Đặt làm sản phẩm mặc định khi mở trang truy xuất
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS & INGREDIENTS */}
              {modalTab === 'specs' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Thành phần
                    </label>
                    <textarea
                      rows={2}
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="Ví dụ: Dừa 50%, đường, mạch nha, bánh tráng, mè"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Ngày sản xuất
                      </label>
                      <input
                        type="text"
                        value={formData.manufactureDate}
                        onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                        placeholder="Ví dụ: Xem trên bao bì"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Thời hạn sử dụng
                      </label>
                      <input
                        type="text"
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                        placeholder="Ví dụ: đang cập nhật hoặc 12 tháng"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Khối lượng tịnh
                      </label>
                      <input
                        type="text"
                        value={formData.netWeight}
                        onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
                        placeholder="Ví dụ: đang cập nhật hoặc 500g"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <textarea
                        rows={2}
                        value={formData.usageGuide}
                        onChange={(e) => setFormData({ ...formData, usageGuide: e.target.value })}
                        placeholder="Ví dụ: xem chi tiết trên bao bì"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Bảo quản
                      </label>
                      <textarea
                        rows={2}
                        value={formData.storageGuide}
                        onChange={(e) => setFormData({ ...formData, storageGuide: e.target.value })}
                        placeholder="Ví dụ: Bảo quản ở nơi khô ráo thoáng mát tránh ánh nắng trực tiếp"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Cảnh báo (nếu có)
                    </label>
                    <input
                      type="text"
                      value={formData.warning}
                      onChange={(e) => setFormData({ ...formData, warning: e.target.value })}
                      placeholder="Để trống hoặc ghi cảnh báo dị ứng, hạn dùng..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCER */}
              {modalTab === 'producer' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Tên đơn vị / Cơ sở sản xuất
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, name: e.target.value }
                        })}
                        placeholder="Ví dụ: Hộ Kinh Doanh Đặng Ngọc Hải"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Quốc gia
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.country}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, country: e.target.value }
                        })}
                        placeholder="Việt Nam"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Số XNCK ATTP
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.attpCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, attpCode: e.target.value }
                        })}
                        placeholder="Ví dụ: 11/XNCK-KTHT"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Số đăng ký kinh doanh (ĐKKD)
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.businessId}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, businessId: e.target.value }
                        })}
                        placeholder="Ví dụ: 049189001652"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Địa chỉ liên lạc
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        manufacturer: { ...formData.manufacturer, address: e.target.value }
                      })}
                      placeholder="Ví dụ: Thôn Thắng Đông, xã Quế Sơn, thành phố Đà Nẵng"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Di động / Hotline đặt hàng
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, phone: e.target.value }
                        })}
                        placeholder="Ví dụ: 0999.123.456"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Website cơ sở
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer.website}
                        onChange={(e) => setFormData({
                          ...formData,
                          manufacturer: { ...formData.manufacturer, website: e.target.value }
                        })}
                        placeholder="Ví dụ: http://keongochaiqs.vn/"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EXTENDED CONTENT */}
              {modalTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      CÂU CHUYỆN SẢN PHẨM
                    </label>
                    <textarea
                      rows={3}
                      value={formData.story}
                      onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                      placeholder="Kể lại câu chuyện truyền thống, nguồn cảm hứng hoặc quy trình làm nghề..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      NGUYÊN LIỆU ĐẦU VÀO
                    </label>
                    <textarea
                      rows={3}
                      value={formData.rawMaterials}
                      onChange={(e) => setFormData({ ...formData, rawMaterials: e.target.value })}
                      placeholder="Mô tả nguồn gốc nguyên liệu sạch, tiêu chuẩn tuyển chọn..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      BẢN ĐỒ VÙNG NGUYÊN LIỆU / NƠI SẢN XUẤT (Link Google Maps Embed hoặc thẻ &lt;iframe&gt;)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.mapEmbed}
                      onChange={(e) => setFormData({ ...formData, mapEmbed: e.target.value })}
                      placeholder="Dán link src Google Maps hoặc toàn bộ thẻ iframe..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-200 font-mono text-xs outline-none focus:border-[#0f2d22] bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: IMAGES */}
              {modalTab === 'images' && (
                <div className="space-y-6">
                  
                  {/* Uploading Progress Indicator */}
                  {uploadingImage && (
                    <div className="p-4 rounded-2xl bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center gap-3 animate-pulse">
                      <RefreshCw className="w-5 h-5 text-[#0f2d22] animate-spin shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-[#0f2d22]">
                          {uploadProgressText || 'Đang xử lý và tải ảnh lên Cloudinary...'}
                        </p>
                        <p className="text-[11px] text-stone-600">
                          Hệ thống đang mã hóa, tối ưu dung lượng và lưu trữ trực tiếp trên đám mây Cloudinary.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. PRIMARY PRODUCT IMAGE */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-black text-stone-900 uppercase tracking-wide">
                          Ảnh đại diện sản phẩm chính (Primary Image)
                        </label>
                        <p className="text-[11px] text-stone-500">
                          Ảnh xuất hiện đầu tiên trên cổng truy xuất và tem mã QR
                        </p>
                      </div>
                      {formData.image && formData.image.includes('cloudinary') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#84CC16]/30 text-[#0f2d22] border border-[#84CC16]/50">
                          <Cloud className="w-3 h-3 text-[#0f2d22]" />
                          <span>Đã lưu trên Cloudinary</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Image Preview */}
                      <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-stone-300 p-1.5 bg-white overflow-hidden shrink-0 flex items-center justify-center relative group">
                        {formData.image ? (
                          <>
                            <img src={formData.image} alt="Preview chính" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => setPreviewLightboxImg(formData.image)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                              title="Xem ảnh lớn"
                            >
                              <ZoomIn className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-stone-300" />
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex gap-2">
                          <label className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0f2d22] hover:bg-[#194535] text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 shadow-sm">
                            <CloudUpload className="w-4 h-4 text-[#84CC16]" />
                            <span>Tải ảnh chính lên Cloudinary</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePrimaryImageUpload}
                              disabled={uploadingImage}
                            />
                          </label>

                          {formData.image && (
                            <button
                              type="button"
                              onClick={handleRemovePrimaryImage}
                              className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                              title="Xoá ảnh (Sẽ xoá khỏi Cloudinary nếu là ảnh Cloud)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xoá</span>
                            </button>
                          )}
                        </div>

                        {/* URL input */}
                        <div>
                          <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="Hoặc dán URL ảnh trực tiếp vào đây..."
                            className="w-full text-xs p-2.5 rounded-xl border border-stone-200 outline-none focus:border-[#0f2d22] bg-white font-mono text-stone-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. MULTIPLE GALLERY IMAGES UPLOAD TO CLOUDINARY */}
                  <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-2">
                          <span>Thư viện hình ảnh sản phẩm (HÌNH ẢNH SẢN PHẨM)</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#84CC16]/20 text-[#0f2d22] text-[10px] font-bold">
                            {(formData.gallery || []).length} ảnh
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Cho phép chọn và upload <strong>NHIỀU ẢNH</strong> cùng lúc lên Cloudinary
                        </p>
                      </div>

                      {/* Manual URL adder */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <input
                          type="text"
                          value={manualGalleryUrl}
                          onChange={(e) => setManualGalleryUrl(e.target.value)}
                          placeholder="Dán link ảnh..."
                          className="text-xs p-2 rounded-xl border border-stone-200 outline-none bg-stone-50 w-full sm:w-44"
                        />
                        <button
                          type="button"
                          onClick={handleAddManualGalleryUrl}
                          className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Thêm link
                        </button>
                      </div>
                    </div>

                    {/* Drag and Drop Zone for Multiple Images */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        handleMultipleGalleryUpload(e);
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                        dragActive
                          ? 'border-[#84CC16] bg-[#84CC16]/10 scale-[1.01]'
                          : 'border-stone-300 hover:border-[#0f2d22] bg-stone-50/70 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleMultipleGalleryUpload}
                        disabled={uploadingImage}
                      />

                      <div className="space-y-2 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center mx-auto shadow-sm">
                          <CloudUpload className="w-7 h-7 text-[#0f2d22]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-stone-900">
                            Nhấp để chọn hoặc kéo thả NHIỀU ẢNH cùng lúc vào đây
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5 max-w-xl mx-auto">
                            Hỗ trợ chọn cùng lúc nhiều file JPG, PNG, WEBP... Hệ thống sẽ tự động tối ưu dung lượng và lưu trữ đám mây Cloudinary.
                          </p>
                        </div>
                        <div className="pt-1 flex items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0f2d22] text-white text-xs font-bold shadow-sm">
                            <Plus className="w-3.5 h-3.5 text-[#84CC16]" />
                            <span>Chọn nhiều ảnh từ máy</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Items Grid */}
                    {(formData.gallery || []).length > 0 ? (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
                          <span>Danh sách ảnh trong thư viện (Bấm ⭐ để chọn làm ảnh chính):</span>
                          <button
                            type="button"
                            onClick={handleRemoveAllGalleryImages}
                            className="text-rose-500 hover:text-rose-700 hover:underline text-[11px] cursor-pointer"
                          >
                            Xoá tất cả
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {formData.gallery.map((imgUrl, i) => {
                            const isCloud = imgUrl.includes('cloudinary');
                            const isPrimary = formData.image === imgUrl;

                            return (
                              <div
                                key={i}
                                className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition ${
                                  isPrimary ? 'border-[#84CC16] ring-2 ring-[#84CC16]/30' : 'border-stone-200 bg-stone-50'
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`gallery ${i}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Cloudinary Tag */}
                                {isCloud && (
                                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#0f2d22]/80 backdrop-blur-xs text-[#84CC16] text-[9px] font-bold flex items-center gap-1">
                                    <Cloud className="w-2.5 h-2.5" />
                                    <span>Cloud</span>
                                  </div>
                                )}

                                {/* Primary Tag */}
                                {isPrimary && (
                                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#84CC16] text-[#0f2d22] text-[9px] font-black shadow-xs">
                                    Ảnh chính
                                  </div>
                                )}

                                {/* Hover Action Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                                  {!isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetAsPrimaryImage(imgUrl)}
                                      className="p-1.5 rounded-lg bg-[#84CC16] text-[#0f2d22] text-xs font-bold hover:scale-110 transition cursor-pointer"
                                      title="Đặt làm ảnh chính"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setPreviewLightboxImg(imgUrl)}
                                    className="p-1.5 rounded-lg bg-white text-stone-800 text-xs font-bold hover:scale-110 transition cursor-pointer"
                                    title="Xem ảnh lớn"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(i, imgUrl)}
                                    className="p-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:scale-110 transition cursor-pointer"
                                    title="Xoá ảnh (Sẽ xoá khỏi Cloudinary nếu là ảnh Cloud)"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 text-center text-xs text-stone-400">
                        Chưa có ảnh nào trong thư viện. Hãy kéo thả hoặc chọn nhiều ảnh ở trên để tải lên Cloudinary.
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="pt-6 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{saving ? 'Đang lưu...' : (editingProduct ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: QR CODE PREVIEW & DOWNLOAD */}
      {/* ======================================================== */}
      {isQrModalOpen && selectedQrProduct && (() => {
        const productSlug = selectedQrProduct.slug || slugify(selectedQrProduct.name);
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dntrace.com';
        const productUrl = `${origin}/${productSlug}`;
        const qrImage240 = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(productUrl)}`;
        const qrImage600 = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(productUrl)}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-4">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#84CC16]/20 text-[#0f2d22] flex items-center justify-center mx-auto font-black">
                <QrCode className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-black text-stone-900">
                Tem Mã QR: {selectedQrProduct.name}
              </h3>
              <p className="text-xs text-stone-500">
                Mã xác thực: <strong className="font-mono text-[#0f2d22]">{selectedQrProduct.verificationCode}</strong>
              </p>

              {/* Đường dẫn tra cứu khi quét QR */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase block tracking-wider">
                  Đường dẫn quét mã QR:
                </span>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs font-bold text-[#0f2d22] hover:underline break-all block"
                >
                  {productUrl}
                </a>
              </div>

              {/* Generated QR Code Image */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
                <img
                  src={qrImage240}
                  alt={`QR Code - ${selectedQrProduct.name}`}
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={qrImage600}
                  download={`QR_${productSlug}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-[#0f2d22] hover:bg-[#194535] text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition"
                >
                  <Download className="w-4 h-4 text-[#84CC16]" />
                  <span>Tải Ảnh Mã QR Độ Phân Giải Cao (PNG)</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(productUrl);
                    showToast('Đã sao chép link tra cứu: ' + productUrl);
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Link Tra Cứu</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL 3: VIEW & MANAGE QR REGISTRATION REQUEST */}
      {/* ======================================================== */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#84CC16] bg-[#0f2d22] px-2.5 py-0.5 rounded">
                  Chi Tiết Đơn Đăng Ký
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {viewingRequest.productName}
                </h3>
              </div>
              <button
                onClick={() => setViewingRequest(null)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Tên đơn vị / Cơ sở sản xuất</span>
                <strong className="text-sm text-stone-900 block mt-0.5">{viewingRequest.businessName}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Người liên hệ</span>
                  <strong className="text-stone-900">{viewingRequest.name}</strong>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Số điện thoại</span>
                  <a href={`tel:${viewingRequest.phone}`} className="font-bold text-[#0f2d22] hover:underline">
                    {viewingRequest.phone}
                  </a>
                </div>
              </div>

              {viewingRequest.email && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Email</span>
                  <span className="text-stone-900">{viewingRequest.email}</span>
                </div>
              )}

              {viewingRequest.address && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Địa chỉ cơ sở</span>
                  <span className="text-stone-900">{viewingRequest.address}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Loại tem</span>
                  <strong className="text-stone-900">{viewingRequest.qrType}</strong>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Số lượng dự kiến</span>
                  <strong className="text-[#0f2d22] font-mono">{viewingRequest.quantity}</strong>
                </div>
              </div>

              {viewingRequest.note && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Ghi chú</span>
                  <p className="text-stone-800 italic mt-0.5 whitespace-pre-line">{viewingRequest.note}</p>
                </div>
              )}
            </div>

            {/* Change Status Buttons */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase block mb-2">
                Cập nhật trạng thái xử lý:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(viewingRequest._id, 'contacted')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewingRequest.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Đã liên hệ
                </button>
                <button
                  onClick={() => handleUpdateStatus(viewingRequest._id, 'approved')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewingRequest.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Đã duyệt cấp mã
                </button>
                <button
                  onClick={() => handleUpdateStatus(viewingRequest._id, 'rejected')}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewingRequest.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Từ chối
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => handleConvertRequestToProduct(viewingRequest)}
                className="w-full py-3 rounded-xl bg-[#84CC16] hover:bg-[#74B843] text-[#0f2d22] font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>⚡ Tạo Nhanh Sản Phẩm Từ Đơn Này</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-stone-900">
              Xác Nhận Xoá Sản Phẩm?
            </h3>
            <p className="text-xs text-stone-600">
              Bạn có chắc chắn muốn xoá sản phẩm <strong>"{deletingProduct.name}"</strong> (Mã: {deletingProduct.verificationCode}) khỏi hệ thống? Thao tác này không thể hoàn tác.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Đồng Ý Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewLightboxImg(null)}
        >
          <button
            onClick={() => setPreviewLightboxImg(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewLightboxImg}
            alt="Xem ảnh lớn"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  );
}
