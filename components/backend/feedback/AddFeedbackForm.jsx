import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Plus, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import axios from 'axios';

const SimpleEditor = dynamic(() => import('../../editor/SimpleEditor'), { ssr: false });

export default function AddFeedbackForm({ onSuccess, onCancel, editingProject = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  const isEditMode = !!editingProject;

  const [images, setImages] = useState([
    { src: '', aspectRatio: 'landscape', width: 16, height: 9 },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    customer: '',
    category: 'Đồng phục thể thao',
    industry: '',
    description: '',
    overview: '',
    logo: '',
    rating: 5,
    location: '',
    employeeCount: '',
    serviceTags: '',
    productLines: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title || '',
        slug: editingProject.slug || '',
        customer: editingProject.customer || '',
        category: editingProject.category || 'Đồng phục thể thao',
        industry: editingProject.industry || '',
        description: editingProject.description || '',
        overview: editingProject.overview || '',
        logo: editingProject.logo || '',
        rating: typeof editingProject.rating === 'number' ? editingProject.rating : 5,
        location: editingProject.location || '',
        employeeCount: editingProject.employeeCount || '',
        serviceTags: editingProject.serviceTags || '',
        productLines: typeof editingProject.productLines === 'number' ? editingProject.productLines : '',
        year: editingProject.year || new Date().getFullYear(),
      });

      const imageArray = [
        { src: editingProject.image || '', aspectRatio: 'landscape', width: 4, height: 3 },
      ];
      if (editingProject.gallery && Array.isArray(editingProject.gallery)) {
        editingProject.gallery.forEach((img) => {
          if (img && img.src) {
            imageArray.push({
              src: img.src || '',
              aspectRatio: img.aspectRatio || 'landscape-3-4',
              width: img.width || 4,
              height: img.height || 3,
            });
          }
        });
      }
      setImages(imageArray);
    } else {
      setFormData({
        title: '',
        slug: '',
        customer: '',
        category: 'Đồng phục thể thao',
        industry: '',
        description: '',
        overview: '',
        logo: '',
        rating: 5,
        location: '',
        employeeCount: '',
        serviceTags: '',
        productLines: '',
        year: new Date().getFullYear(),
      });
      setImages([
        { src: '', aspectRatio: 'landscape', width: 16, height: 9 },
      ]);
    }
  }, [editingProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (index, url) => {
    setImages((prev) => {
      const newImgs = [...prev];
      if (!newImgs[index]) newImgs[index] = { src: '', aspectRatio: 'landscape', width: 16, height: 9 };
      newImgs[index].src = url;
      return newImgs;
    });
  };

  const handleAspectRatioChange = (index, ratio) => {
    setImages((prev) => {
      const newImgs = [...prev];
      let w = 16,
        h = 9;
      if (ratio === 'square') {
        w = 1;
        h = 1;
      }
      if (ratio === 'portrait') {
        w = 3;
        h = 4;
      }
      if (ratio === 'landscape-3-4') {
        w = 4;
        h = 3;
      }
      newImgs[index] = { ...newImgs[index], aspectRatio: ratio, width: w, height: h };
      return newImgs;
    });
  };

  const handleWidthChange = (index, w) => {
    setImages((prev) => {
      const newImgs = [...prev];
      newImgs[index] = { ...newImgs[index], width: parseInt(w) || 16 };
      return newImgs;
    });
  };

  const handleHeightChange = (index, h) => {
    setImages((prev) => {
      const newImgs = [...prev];
      newImgs[index] = { ...newImgs[index], height: parseInt(h) || 9 };
      return newImgs;
    });
  };

  // Tạo mô tả ngắn gọn bằng AI dựa theo thông tin đối tác & Knowledge Base Univi
  const handleGenerateAiDescription = async () => {
    const cust = formData.customer?.trim();
    const title = formData.title?.trim();

    if (!cust && !title) {
      toast.warning('Vui lòng nhập Tên khách hàng hoặc Tiêu đề trước khi tạo mô tả bằng AI!');
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const { data } = await axios.post('/api/ai/generate', {
        type: 'feedback_description',
        customer: cust,
        title: title,
        category: formData.category,
        industry: formData.industry,
        location: formData.location,
        employeeCount: formData.employeeCount,
        serviceTags: formData.serviceTags,
      });

      if (data?.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
        toast.success(
          data.fallback
            ? 'Đã tạo mô tả Feedback từ Bộ tri thức Univi!'
            : 'Đã tạo mô tả ngắn bằng Gemini AI thành công!'
        );
      }
    } catch (err) {
      console.error('Lỗi tạo mô tả feedback bằng AI:', err);
      toast.error(err.response?.data?.error || 'Không thể tạo mô tả bằng Gemini AI. Vui lòng thử lại!');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Tạo & tối ưu Tổng quan chi tiết bằng AI dựa theo thông tin đối tác & Knowledge Base Univi
  const handleGenerateAiOverview = async () => {
    const cust = formData.customer?.trim();
    const title = formData.title?.trim();
    const currentOverview = formData.overview?.trim() || '';

    if (!cust && !title && currentOverview.length < 20) {
      toast.warning('Vui lòng nhập Tên khách hàng hoặc Tiêu đề trước khi tạo Tổng quan bằng AI!');
      return;
    }

    setIsGeneratingOverview(true);
    try {
      const { data } = await axios.post('/api/ai/generate', {
        type: 'feedback_overview',
        customer: cust,
        title: title,
        category: formData.category,
        industry: formData.industry,
        location: formData.location,
        employeeCount: formData.employeeCount,
        serviceTags: formData.serviceTags,
        year: formData.year,
        overview: currentOverview,
      });

      const newOverview = data?.overview || data?.content;
      if (newOverview) {
        setFormData((prev) => ({ ...prev, overview: newOverview }));
        toast.success(
          data.fallback
            ? 'Đã tạo Tổng quan Feedback từ Bộ tri thức Univi!'
            : 'Đã tạo Tổng quan chi tiết bằng Gemini AI thành công!'
        );
      }
    } catch (err) {
      console.error('Lỗi tạo tổng quan feedback bằng AI:', err);
      toast.error(err.response?.data?.error || 'Không thể tạo Tổng quan bằng Gemini AI. Vui lòng thử lại!');
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.warning('Vui lòng nhập Tiêu đề feedback!');
      return;
    }
    if (!formData.customer?.trim()) {
      toast.warning('Vui lòng nhập Tên khách hàng / Đơn vị!');
      return;
    }

    setIsSubmitting(true);
    try {
      const validGallery = images
        .slice(1)
        .filter((img) => img && typeof img.src === 'string' && img.src.trim());

      const payload = {
        ...formData,
        rating: formData.rating === '' ? 5 : Number(formData.rating),
        productLines: formData.productLines === '' ? 0 : Number(formData.productLines),
        year: formData.year === '' ? new Date().getFullYear() : Number(formData.year),
        image: images[0]?.src?.trim() || '',
        gallery: validGallery,
      };

      // Create or sanitize slug safely
      const sourceSlug = payload.slug || payload.title;
      payload.slug = sourceSlug
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (isEditMode) {
        payload.id = editingProject._id || editingProject.id;
      }

      const res = await fetch('/api/feedback', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(isEditMode ? 'Cập nhật feedback thành công!' : 'Thêm feedback thành công!');
        if (onSuccess) onSuccess(data.data);
      } else {
        toast.error(data.message || data.error || 'Lỗi từ máy chủ khi lưu feedback');
      }
    } catch (err) {
      console.error('Lỗi lưu feedback:', err);
      toast.error('Lỗi kết nối khi lưu feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 container mx-auto">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? '✏️ Chỉnh sửa Feedback' : '➕ Thêm Feedback mới'}
          </h2>
          {isEditMode && (
            <p className="text-sm text-gray-500 mt-1">
              Đang chỉnh sửa cho đối tác: <strong className="text-gray-800">{editingProject.customer || editingProject.title}</strong>
            </p>
          )}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Quay lại danh sách
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="VD: Đồng phục phòng tập California Fitness & Yoga..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn (Slug)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="VD: dong-phuc-phong-tap-california (để trống tự tạo)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng / Đơn vị *</label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="VD: California Fitness, FitCity Gym..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
            >
              <option value="Đồng phục thể thao">Đồng phục thể thao</option>
              <option value="Đồng phục CLB">Đồng phục CLB</option>
              <option value="Đồng phục doanh nghiệp">Đồng phục doanh nghiệp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngành / Bộ môn (hiển thị badge trên thẻ)</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
            >
              <option value="">Không có</option>
              <option value="Gym">Gym</option>
              <option value="Yoga">Yoga</option>
              <option value="Pickleball">Pickleball</option>
              <option value="Fitness">Fitness</option>
              <option value="MMA">MMA</option>
              <option value="Running">Running</option>
              <option value="Golf">Golf</option>
              <option value="Tennis">Tennis</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện chính *</label>
            <input
              type="text"
              value={images[0]?.src || ''}
              onChange={(e) => handleImageUrlChange(0, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="/images/feedback/cover.jpg hoặc URL ảnh"
              required
            />
            {images[0]?.src && (
              <div className="mt-2 relative w-32 h-24 border border-gray-300 rounded overflow-hidden">
                <Image src={images[0].src} alt="Cover Preview" fill className="object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo khách hàng (hiển thị góc thẻ)</label>
            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="/images/feedback/logo-khach-hang.png"
            />
            {formData.logo && (
              <div className="mt-2 relative w-16 h-16 border border-gray-300 rounded overflow-hidden bg-gray-50">
                <Image src={formData.logo} alt="Logo Preview" fill className="object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* MÔ TẢ NGẮN GỌN + NÚT TẠO AI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả ngắn gọn</label>
            <button
              type="button"
              onClick={handleGenerateAiDescription}
              disabled={isGeneratingDesc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              title="Tự động tạo mô tả ngắn dựa trên thông tin đối tác và Bộ tri thức Univi"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingDesc ? 'animate-spin' : ''}`} />
              {isGeneratingDesc ? 'AI đang tạo mô tả...' : 'Tạo mô tả bằng Gemini AI'}
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
            placeholder="VD: Hệ thống phòng tập thông minh cao cấp..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá (0-5)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="Hà Nội"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhân sự</label>
            <input
              type="text"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="120+"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số dòng sản phẩm</label>
            <input
              type="number"
              name="productLines"
              value={formData.productLines}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm hợp tác</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
              placeholder="2024"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm / Dịch vụ (cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            name="serviceTags"
            value={formData.serviceTags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]"
            placeholder="Coach, PT, Sale, Áo polo, Tanktop..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đường dẫn ảnh bổ sung (Thiết lập tỉ lệ)</label>
          <p className="text-sm text-gray-500 mb-3">
            Nhập tỷ lệ ảnh (width x height) để hiển thị trong React Photo Gallery.
          </p>
          {images.slice(1).map((img, idx) => {
            const index = idx + 1;
            return (
              <div key={index} className="flex gap-2 mb-2 items-center border p-2 rounded-lg bg-gray-50 overflow-hidden">
                {img.src ? (
                  <div className="relative w-16 h-16 border border-gray-300 rounded overflow-hidden flex-shrink-0">
                    <Image src={img.src} alt={`Preview ${index}`} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 border border-gray-300 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500">
                    Ảnh
                  </div>
                )}
                <input
                  type="text"
                  value={img.src}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  className="flex-1 min-w-[150px] px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#105d97] text-sm"
                  placeholder={`/images/feedback/anh-${index + 1}.jpg`}
                />
                <div className="flex gap-1 items-center flex-shrink-0">
                  <span className="text-xs text-gray-500 font-medium">W:</span>
                  <input
                    type="number"
                    value={img.width || 4}
                    onChange={(e) => handleWidthChange(index, e.target.value)}
                    className="w-12 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center"
                  />
                  <span className="text-xs text-gray-500 font-medium ml-1">H:</span>
                  <input
                    type="number"
                    value={img.height || 3}
                    onChange={(e) => handleHeightChange(index, e.target.value)}
                    className="w-12 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center"
                  />
                </div>
                <select
                  value={img.aspectRatio || 'landscape-3-4'}
                  onChange={(e) => handleAspectRatioChange(index, e.target.value)}
                  className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm flex-shrink-0"
                >
                  <option value="landscape">Ngang 16:9</option>
                  <option value="landscape-3-4">Ngang 4:3</option>
                  <option value="square">Vuông 1:1</option>
                  <option value="portrait">Dọc 3:4</option>
                </select>
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex-shrink-0"
                  title="Xóa ảnh này"
                >
                  <X size={18} />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setImages([...images, { src: '', width: 4, height: 3, aspectRatio: 'landscape-3-4' }])}
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-[#105d97] rounded-lg hover:bg-blue-100 gap-2 font-medium"
          >
            <Plus size={20} /> Thêm ảnh
          </button>
        </div>

        {/* TỔNG QUAN * + NÚT TẠO / TỐI ƯU AI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Tổng quan *</label>
            <button
              type="button"
              onClick={handleGenerateAiOverview}
              disabled={isGeneratingOverview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              title="Tự động biên soạn nội dung case study chi tiết chuẩn SEO dựa trên Knowledge Base Univi"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingOverview ? 'animate-spin' : ''}`} />
              {isGeneratingOverview
                ? 'AI đang viết tổng quan...'
                : formData.overview && formData.overview.trim().length > 20
                ? 'Tối ưu Tổng quan chuẩn SEO'
                : 'Tạo Tổng quan bằng Gemini AI'}
            </button>
          </div>
          <SimpleEditor
            content={formData.overview || ''}
            onChange={(content) => setFormData((prev) => ({ ...prev, overview: content }))}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy / Quay lại danh sách
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#105d97] text-white rounded-lg hover:bg-[#0a4572] font-medium transition-colors disabled:opacity-60"
          >
            {isSubmitting
              ? 'Đang lưu...'
              : isEditMode
              ? 'Cập nhật Feedback'
              : 'Lưu Feedback mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
