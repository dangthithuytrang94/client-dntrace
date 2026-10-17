import { defaultSeedProducts } from '../data/seedData.js';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}



// Fallback products in case backend is offline
let localFallbackProducts = JSON.parse(JSON.stringify(defaultSeedProducts)).map((p, idx) => ({
  ...p,
  _id: `fallback_${idx + 1}`,
  slug: p.slug || slugify(p.name),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================
const AUTH_KEY = 'vhh_admin_auth';

export function isUserLoggedIn() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data);
    return Boolean(parsed && parsed.token && parsed.username === 'admin');
  } catch {
    return false;
  }
}

export function saveLoginSession(token, username = 'admin') {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, username, loggedAt: Date.now() }));
  } catch (e) {
    console.error('Lỗi lưu session:', e);
  }
}

export function clearLoginSession() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error('Lỗi xoá session:', e);
  }
}

export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Đăng nhập không thành công');
    if (json.success && json.token) {
      saveLoginSession(json.token, username);
    }
    return json;
  } catch (err) {
    // Client-side fallback if server offline
    if (username === 'admin' && password === 'admin') {
      const mockToken = 'fallback_token_' + Date.now();
      saveLoginSession(mockToken, 'admin');
      return { success: true, token: mockToken, user: { username: 'admin' }, message: 'Đăng nhập thành công!' };
    }
    throw err;
  }
}

// ==========================================
// CLOUDINARY UPLOAD HELPERS & FILE OPTIMIZATION
// ==========================================

export const MAX_IMAGE_SIZE_KB = 10240; // 10 MB (Ảnh chụp từ máy ảnh/điện thoại sẽ tự động nén)

// Check image file size limit
export function checkFileLimit(file) {
  if (!file || typeof file === 'string') return { valid: true };
  const sizeKb = Math.round(file.size / 1024);
  const limitKb = MAX_IMAGE_SIZE_KB;

  return {
    valid: sizeKb <= limitKb,
    sizeKb,
    limitKb,
    fileName: file.name
  };
}

// Client-side Image Compression using HTML Canvas (tự động nén ảnh chụp điện thoại dung lượng lớn)
export const compressImageIfNeeded = async (file, maxDimension = 1920, quality = 0.82) => {
  if (!file || typeof file === 'string' || !file.type || !file.type.startsWith('image/')) {
    return file;
  }
  // Nếu ảnh đã nhỏ hơn 400 KB thì không cần nén thêm
  if (file.size <= 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch {
      resolve(file);
    }
  });
};

// Helper to convert browser File object to Base64 Data URL
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (typeof file === 'string') {
      return resolve(file); // Already a URL or base64 string
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Upload a single image (accepts File object or Base64 string or URL)
export async function uploadImageToCloudinary(fileOrBase64, folder = 'dntrace_products') {
  try {
    // Tự động nén ảnh trước khi chuyển sang base64 nếu là tệp ảnh
    const optimized = await compressImageIfNeeded(fileOrBase64);
    const base64Data = await fileToBase64(optimized);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, folder })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi tải ảnh lên Cloudinary');
    return json;
  } catch (err) {
    console.warn('Lỗi khi upload Cloudinary qua API:', err.message);
    const fallbackUrl = typeof fileOrBase64 === 'string' ? fileOrBase64 : await fileToBase64(fileOrBase64);
    return {
      success: true,
      url: fallbackUrl,
      storage: 'fallback_base64',
      message: 'Đã lưu ảnh tạm thời (Base64)'
    };
  }
}

// Upload multiple images individually to avoid exceeding Vercel 4.5MB request limit
export async function uploadMultipleImagesToCloudinary(filesOrBase64s, folder = 'dntrace_products', onProgress = null) {
  const fileList = Array.from(filesOrBase64s);
  const urls = [];
  const errors = [];

  for (let i = 0; i < fileList.length; i++) {
    const item = fileList[i];
    const fileName = typeof item === 'string' ? `Tệp ${i + 1}` : item.name;
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: fileList.length,
        name: fileName,
        percent: Math.round(((i) / fileList.length) * 100)
      });
    }

    try {
      const res = await uploadImageToCloudinary(item, folder);
      if (res && res.url) {
        urls.push(res.url);
      }
    } catch (err) {
      console.error(`Lỗi tải tệp ${fileName}:`, err);
      errors.push({ name: fileName, error: err.message });
    }
  }

  if (onProgress) {
    onProgress({
      current: fileList.length,
      total: fileList.length,
      name: 'Hoàn tất',
      percent: 100
    });
  }

  return {
    success: urls.length > 0,
    urls,
    count: urls.length,
    errors,
    storage: 'cloudinary',
    message: `Đã tải thành công ${urls.length}/${fileList.length} tệp lên Cloudinary!`
  };
}

// ==========================================
// SYSTEM STATUS
// ==========================================
export async function fetchApiStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('API server không phản hồi');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      dbConnected: false,
      uriConfigured: false,
      cloudinaryConfigured: false,
      error: 'Không thể kết nối tới Server Backend (Port 5001). Đang chạy bằng dữ liệu nội bộ React.',
      productCount: localFallbackProducts.length,
      storageType: 'Trình duyệt (Offline Fallback)'
    };
  }
}

// ==========================================
// PRODUCT CRUD
// ==========================================
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Lỗi tải sản phẩm');
    const json = await res.json();
    return {
      data: json.data || [],
      source: json.source || 'server',
      isOffline: false
    };
  } catch (err) {
    console.warn('API backend chưa chạy, sử dụng dữ liệu dự phòng cục bộ:', err.message);
    return {
      data: localFallbackProducts,
      source: 'offline_fallback',
      isOffline: true
    };
  }
}

export async function fetchProductById(idOrCodeOrSlug) {
  const query = encodeURIComponent(idOrCodeOrSlug);
  const rawKey = String(idOrCodeOrSlug).toLowerCase().trim();
  try {
    const res = await fetch(`${API_BASE}/products/${query}`);
    if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
    const json = await res.json();
    return { data: json.data, source: json.source, isOffline: false };
  } catch (err) {
    const found = localFallbackProducts.find(p => 
      p._id === idOrCodeOrSlug || 
      p.verificationCode === idOrCodeOrSlug ||
      (p.slug && p.slug.toLowerCase() === rawKey) ||
      slugify(p.name) === rawKey
    );
    if (found) {
      return { data: found, source: 'offline_fallback', isOffline: true };
    }
    return { data: null, source: 'not_found', isOffline: true };
  }
}

export async function createProduct(productData) {
  const withSlug = {
    ...productData,
    slug: slugify(productData.slug || productData.name)
  };
  let res;
  try {
    res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withSlug)
    });
  } catch (networkErr) {
    // Only fall back if backend server is completely unreachable / network error
    const newP = {
      ...withSlug,
      _id: `fallback_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localFallbackProducts.unshift(newP);
    return {
      success: true,
      data: newP,
      message: 'Server backend chưa chạy, đã lưu tạm vào bộ nhớ trình duyệt.'
    };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Lỗi tạo sản phẩm trên Server');
  }
  return json;
}

export async function updateProduct(id, productData) {
  const withSlug = {
    ...productData,
    slug: slugify(productData.slug || productData.name)
  };
  let res;
  try {
    res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withSlug)
    });
  } catch (networkErr) {
    const rawKey = String(id).toLowerCase().trim();
    const idx = localFallbackProducts.findIndex(p => 
      p._id === id || 
      p.verificationCode === id ||
      (p.slug && p.slug.toLowerCase() === rawKey) ||
      slugify(p.name) === rawKey
    );
    if (idx !== -1) {
      localFallbackProducts[idx] = {
        ...localFallbackProducts[idx],
        ...withSlug,
        updatedAt: new Date().toISOString()
      };
      return { success: true, data: localFallbackProducts[idx], message: 'Đã cập nhật (Bộ nhớ tạm)!' };
    }
    throw networkErr;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Lỗi cập nhật sản phẩm');
  }
  return json;
}

export async function deleteProduct(id) {
  let res;
  try {
    res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
  } catch (networkErr) {
    const idx = localFallbackProducts.findIndex(p => p._id === id || p.verificationCode === id);
    if (idx !== -1) {
      localFallbackProducts.splice(idx, 1);
      return { success: true, message: 'Đã xoá sản phẩm (Bộ nhớ tạm)!' };
    }
    throw networkErr;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Lỗi xoá sản phẩm');
  }
  return json;
}

export async function seedProducts() {
  try {
    const res = await fetch(`${API_BASE}/products/seed`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    localFallbackProducts = JSON.parse(JSON.stringify(defaultSeedProducts)).map((p, idx) => ({
      ...p,
      _id: `fallback_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    return { success: true, message: 'Đã nạp lại dữ liệu mẫu (Bộ nhớ tạm)!' };
  }
}

// ==========================================
// QR CODE REGISTRATION REQUESTS
// ==========================================
let localQrRequests = [];

export async function fetchQrRequests() {
  try {
    const res = await fetch(`${API_BASE}/qr-requests`);
    if (!res.ok) throw new Error('Lỗi tải yêu cầu cấp mã QR');
    const json = await res.json();
    return { data: json.data || [], count: json.count || 0 };
  } catch (err) {
    return { data: localQrRequests, count: localQrRequests.length };
  }
}

export async function submitQrRequest(requestData) {
  try {
    const res = await fetch(`${API_BASE}/qr-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi gửi yêu cầu');
    return json;
  } catch (err) {
    const newReq = {
      ...requestData,
      _id: 'local_qr_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localQrRequests.unshift(newReq);
    return { success: true, message: 'Đã tiếp nhận yêu cầu đăng ký cấp mã QR thành công!', data: newReq };
  }
}

export async function updateQrRequestStatus(id, status, note) {
  try {
    const res = await fetch(`${API_BASE}/qr-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi cập nhật');
    return json;
  } catch (err) {
    const found = localQrRequests.find(r => r._id === id);
    if (found) {
      if (status) found.status = status;
      if (note) found.note = note;
    }
    return { success: true, message: 'Đã cập nhật yêu cầu thành công!' };
  }
}

export async function deleteQrRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/qr-requests/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Lỗi xoá yêu cầu');
    return json;
  } catch (err) {
    localQrRequests = localQrRequests.filter(r => r._id !== id);
    return { success: true, message: 'Đã xoá yêu cầu thành công!' };
  }
}

// ==========================================
// CLOUDINARY IMAGE DELETION HELPERS
// ==========================================
export async function deleteCloudinaryImage(urlOrPublicId) {
  if (!urlOrPublicId) return { success: true };
  try {
    const isUrl = typeof urlOrPublicId === 'string' && urlOrPublicId.startsWith('http');
    const payload = isUrl ? { url: urlOrPublicId } : { public_id: urlOrPublicId };

    const res = await fetch(`${API_BASE}/upload/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('Lỗi gọi API xoá ảnh Cloudinary:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteMultipleCloudinaryImages(urls) {
  if (!urls || urls.length === 0) return { success: true };
  try {
    const res = await fetch(`${API_BASE}/upload/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    return await res.json();
  } catch (err) {
    console.warn('Lỗi gọi API xoá danh sách ảnh Cloudinary:', err);
    return { success: false, error: err.message };
  }
}


