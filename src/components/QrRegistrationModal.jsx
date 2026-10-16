import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  Building2, 
  Package,
  Layers
} from 'lucide-react';
import { submitQrRequest } from '../services/api';

export default function QrRegistrationModal({ isOpen, onClose, initialProductName = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessName: '',
    productName: initialProductName || '',
    address: '',
    qrType: 'Tem truy xuất thông tin (QR Code)',
    quantity: '1.000 - 5.000 tem',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.businessName.trim() || !formData.productName.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ họ tên, tên đơn vị, tên sản phẩm và số điện thoại!');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await submitQrRequest(formData);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage('Lỗi khi gửi yêu cầu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/75 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 z-10 animate-fade-in my-8">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#174C3C] via-[#1E5D4A] to-[#174C3C] text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#84CC16] text-[#122A21] text-[10px] font-black uppercase tracking-wider">
              dntrace.com
            </span>
            <span className="text-xs text-stone-200">Hệ thống cấp tem chính hãng</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Đăng Ký Cấp Mã QR truy xuất thông tin
          </h3>
          <p className="text-xs text-[#DFCA9B] mt-1">
            Minh bạch chuỗi cung ứng &bull; Chống hàng nhái &bull; Tăng niềm tin người tiêu dùng
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[78vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-2xl font-bold text-stone-900">
                Gửi Yêu Cầu Thành Công!
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Cảm ơn bạn <strong>{formData.name}</strong> ({formData.businessName}). Ban quản trị <strong>dntrace.com</strong> đã tiếp nhận hồ sơ sản phẩm <strong>"{formData.productName}"</strong> và sẽ liên hệ hỗ trợ cấp tem trong vòng 2–4 giờ làm việc.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-[#174C3C] text-white text-xs font-bold hover:bg-[#205F4D] transition cursor-pointer"
                >
                  Hoàn Tất
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Tên & Điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên người đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đặng Ngọc Hải"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0982 101 377"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>
              </div>

              {/* Tên cơ sở & Tên sản phẩm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tên Cơ Sở / Hộ Kinh Doanh / HTX <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hộ Kinh Doanh Đặng Ngọc Hải"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tên sản phẩm đăng ký cấp mã QR <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Kẹo dừa dẻo Ngọc Hải"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>
              </div>

              {/* Địa chỉ & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Địa chỉ cơ sở sản xuất
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thôn Thắng Đông, xã Quế Sơn, Đà Nẵng"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email liên hệ (nếu có)
                  </label>
                  <input
                    type="email"
                    placeholder="info@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  />
                </div>
              </div>

              {/* Loại tem & Số lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Loại tem cần cấp
                  </label>
                  <select
                    value={formData.qrType}
                    onChange={(e) => setFormData({ ...formData, qrType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  >
                    <option value="Tem truy xuất thông tin (QR Code)">Tem truy xuất thông tin (QR Code)</option>
                    <option value="Tem Chống Giả Điện Tử QR">Tem Chống Giả Điện Tử QR</option>
                    <option value="Tem Sản Phẩm OCOP 3–5 Sao">Tem Sản Phẩm OCOP 3–5 Sao</option>
                    <option value="Tem Bảo Hành & Định Danh Số">Tem Bảo Hành &amp; Định Danh Số</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số lượng tem dự kiến
                  </label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                  >
                    <option value="Dưới 1.000 tem">Dưới 1.000 tem</option>
                    <option value="1.000 - 5.000 tem">1.000 - 5.000 tem</option>
                    <option value="5.000 - 20.000 tem">5.000 - 20.000 tem</option>
                    <option value="Trên 20.000 tem">Trên 20.000 tem</option>
                  </select>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mô tả thêm về sản phẩm hoặc yêu cầu kỹ thuật
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Sản phẩm kẹo dừa cần cấp tem dán nắp hộp, tích hợp chứng nhận ATTP..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#174C3C]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#174C3C] hover:bg-[#205F4D] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <span>Đang xử lý đăng ký...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#84CC16]" />
                    <span>Gửi Đăng Ký Cấp Mã QR Ngay</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Hỗ trợ tư vấn quy chuẩn ghi nhãn và hoàn thiện hồ sơ ATTP</span>
              </div>

            </form>
          )}
        </div>

        {/* Modal Footer Call Hotline */}
       

      </div>
    </div>
  );
}
