// src/pages/seller/products/EditProduct.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  DollarSign, 
  AlertCircle, 
  Image as ImageIcon, 
  X, 
  Upload, 
  CheckCircle,
  Layers,
  TrendingUp,
  Info,
  RefreshCw,
  Eye
} from "lucide-react";

// ==================== SHIMMER ANIMATION STYLES ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
    background-size: 200% 100%;
  }
`;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockData, setStockData] = useState({ quantity: '', reason: '', type: 'add' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    discount_percentage: '0'
  });

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-edit-product')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-edit-product';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/seller/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id || '',
        is_active: product.is_active,
        discount_percentage: product.discount_percentage || '0'
      });
      
      if (product.image) {
        setCurrentImage(product.image);
      }
    } catch (error) {
      showToast(t('seller.editProduct.errorLoading'), 'error');
      setTimeout(() => navigate('/seller/products'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/seller/products/categories/list');
      setCategories(response.data);
    } catch (error) {
      showToast(t('seller.editProduct.errorLoadingCategories'), 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: t('seller.editProduct.invalidImageFormat') }));
        showToast(t('seller.editProduct.invalidImageFormat'), 'error');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t('seller.editProduct.imageTooLarge') }));
        showToast(t('seller.editProduct.imageTooLarge'), 'error');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setCurrentImage(null);
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeNewImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const removeCurrentImage = async () => {
    if (window.confirm(t('seller.editProduct.confirmRemoveImage'))) {
      try {
        await api.put(`/seller/products/${id}`, {
          ...formData,
          remove_image: true
        });
        setCurrentImage(null);
        showToast(t('seller.editProduct.imageRemoved'), 'success');
      } catch (error) {
        showToast(t('seller.editProduct.errorRemovingImage'), 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category_id', formData.category_id);
    formDataToSend.append('is_active', formData.is_active ? '1' : '0');
    formDataToSend.append('discount_percentage', formData.discount_percentage || 0);
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    formDataToSend.append('_method', 'PUT');

    try {
      await api.post(`/seller/products/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccess(true);
      showToast(t('seller.editProduct.updateSuccess'), 'success');
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/seller/products/${id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showToast(t('seller.editProduct.fixErrors'), 'error');
      } else {
        showToast(error.response?.data?.message || t('seller.editProduct.errorUpdating'), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!stockData.quantity && stockData.quantity !== 0) {
      showToast(t('seller.editProduct.enterQuantity'), 'error');
      return;
    }

    try {
      const quantityValue = parseInt(stockData.quantity);
      const finalQuantity = stockData.type === 'remove' ? -Math.abs(quantityValue) : Math.abs(quantityValue);
      
      await api.patch(`/seller/products/${id}/stock`, {
        quantity: finalQuantity,
        reason: stockData.reason
      });
      showToast(t('seller.editProduct.stockUpdated'), 'success');
      setShowStockModal(false);
      setStockData({ quantity: '', reason: '', type: 'add' });
      fetchProduct();
    } catch (error) {
      showToast(error.response?.data?.message || t('seller.editProduct.errorUpdatingStock'), 'error');
    }
  };

  const getDiscountedPrice = () => {
    if (parseInt(formData.discount_percentage) > 0 && formData.price > 0) {
      return parseFloat(formData.price) * (1 - parseInt(formData.discount_percentage) / 100);
    }
    return null;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-1"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48"></div>
              </div>
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 mb-2"></div>
                    <div className="h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const discountedPrice = getDiscountedPrice();

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          
          {/* Success Toast */}
          {showSuccess && (
            <div className="fixed top-20 right-4 z-50 animate-slide-in">
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t('seller.editProduct.updateSuccess')}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link to={`/seller/products/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5C352C] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t('seller.editProduct.back')}
            </Link>
            <button
              onClick={() => setShowStockModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('seller.editProduct.updateStock')}
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h1 className="text-lg font-semibold text-gray-900">{t('seller.editProduct.title')}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{t('seller.editProduct.subtitle')}</p>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="m-5 bg-rose-50 border border-rose-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-rose-700">{t('seller.editProduct.fixErrors')}:</p>
                    <ul className="text-xs text-rose-600 list-disc list-inside">
                      {Object.values(errors).slice(0, 3).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t('seller.editProduct.productName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                  placeholder={t('seller.editProduct.productNamePlaceholder')}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('seller.editProduct.description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C] resize-none"
                  placeholder={t('seller.editProduct.descriptionPlaceholder')}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('seller.editProduct.category')}</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                >
                  <option value="">{t('seller.editProduct.selectCategory')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('seller.editProduct.price')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Tsh</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('seller.editProduct.discountPercent')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C]"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* Price Preview if Discounted */}
              {discountedPrice && (
                <div className="bg-rose-50 rounded-lg p-3 border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-rose-600 font-semibold tracking-wider">{t('seller.editProduct.discountedPrice')}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-rose-700">Tsh {discountedPrice.toLocaleString()}</p>
                      <span className="text-[10px] text-rose-400 line-through">Tsh {Number(formData.price).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    -{formData.discount_percentage}% OFF
                  </div>
                </div>
              )}

              {/* Image Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{t('seller.editProduct.productImage')}</label>
                <div className="flex items-start gap-4 flex-wrap">
                  {currentImage && !imagePreview && (
                    <div className="relative">
                      <img src={currentImage} alt={t('seller.editProduct.currentImage')} className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                      <button 
                        type="button" 
                        onClick={removeCurrentImage} 
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors"
                        aria-label={t('seller.editProduct.removeImage')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt={t('seller.editProduct.preview')} className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-500" />
                      <button 
                        type="button" 
                        onClick={removeNewImage} 
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors"
                        aria-label={t('seller.editProduct.removeImage')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center hover:border-[#5C352C] transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <label className="cursor-pointer">
                      <span className="text-[10px] text-[#5C352C] font-medium">{t('seller.editProduct.changeImage')}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
                {errors.image && <p className="text-xs text-rose-500 mt-1">{errors.image}</p>}
                <p className="text-[10px] text-gray-400 mt-2">{t('seller.editProduct.imageHint')}</p>
              </div>

              {/* Active Status Toggle */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{t('seller.editProduct.productStatus')}</p>
                    <p className="text-[10px] text-gray-500">
                      {formData.is_active ? t('seller.editProduct.visibleToCustomers') : t('seller.editProduct.hiddenFromCustomers')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    aria-label={t('seller.editProduct.toggleStatus')}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">{t('seller.editProduct.quickTips')}</p>
                    <p className="text-[10px] text-blue-700">{t('seller.editProduct.tipsMessage')}</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#5C352C] text-white rounded-lg font-medium text-sm hover:bg-[#4A2A22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('seller.editProduct.saving')}
                  </div>
                ) : (
                  t('seller.editProduct.saveChanges')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowStockModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{t('seller.editProduct.updateStock')}</h3>
            </div>
            <form onSubmit={handleStockUpdate} className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockData({ ...stockData, type: 'add' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${stockData.type === 'add' ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  + {t('seller.editProduct.addStock')}
                </button>
                <button
                  type="button"
                  onClick={() => setStockData({ ...stockData, type: 'remove' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${stockData.type === 'remove' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  - {t('seller.editProduct.removeStock')}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('seller.editProduct.quantity')}</label>
                <input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]"
                  placeholder={t('seller.editProduct.enterQuantity')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('seller.editProduct.reasonOptional')}</label>
                <input
                  type="text"
                  value={stockData.reason}
                  onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]"
                  placeholder={t('seller.editProduct.reasonPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-[#5C352C] text-white rounded-lg text-sm font-medium hover:bg-[#4A2A22] transition-colors">
                  {t('seller.editProduct.update')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowStockModal(false)} 
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('seller.editProduct.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </MainLayout>
  );
};

export default EditProduct;