// src/pages/seller/products/AddProduct.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  ShoppingBag,
  TrendingUp,
  Info,
  Shield,
  FolderTree,
  Tag,
  Box,
  AlertTriangle,
  Search,
  ChevronDown,
  Folder,
  ChevronRight
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  
  // Dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const dropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    min_stock_alert: '5',
    category_id: '',
    discount_percentage: '0',
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate form progress
  useEffect(() => {
    let progress = 0;
    if (formData.name) progress += 20;
    if (formData.description) progress += 20;
    if (formData.price && formData.price > 0) progress += 20;
    if (formData.quantity && formData.quantity > 0) progress += 20;
    if (formData.category_id) progress += 20;
    setFormProgress(progress);
  }, [formData]);

  const discountPercentage = parseInt(formData.discount_percentage || 0);
  const discountedPrice = formData.price 
    ? (parseFloat(formData.price) * (1 - discountPercentage / 100)).toFixed(2) 
    : 0;

  const fetchCategories = async () => {
    try {
      const response = await api.get('/seller/products/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast(t('seller.addProduct.errorLoadingCategories'), 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: t('seller.addProduct.invalidImageFormat') }));
        showToast(t('seller.addProduct.invalidImageFormat'), 'error');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t('seller.addProduct.imageTooLarge') }));
        showToast(t('seller.addProduct.imageTooLarge'), 'error');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleCategorySelect = (categoryId, categoryName, parentName = null) => {
    const displayName = parentName ? `${parentName} → ${categoryName}` : categoryName;
    setSelectedCategoryName(displayName);
    setFormData(prev => ({ ...prev, category_id: categoryId }));
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
    if (errors.category_id) {
      setErrors(prev => ({ ...prev, category_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('min_stock_alert', formData.min_stock_alert);
    formDataToSend.append('category_id', formData.category_id);
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    formDataToSend.append('discount_percentage', formData.discount_percentage || 0);

    try {
      await api.post('/seller/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowSuccess(true);
      showToast(t('seller.addProduct.createSuccess'), 'success');
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/seller/products');
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showToast(t('seller.addProduct.fixErrors'), 'error');
      } else {
        showToast(error.response?.data?.message || t('seller.addProduct.errorCreating'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const estimatedRevenue = formData.price && formData.quantity 
    ? (parseFloat(formData.price) * parseInt(formData.quantity)).toLocaleString() 
    : 0;

  // Flatten categories for search with parent info
  const getAllSubcategories = () => {
    const allSubs = [];
    for (const parent of categories) {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(sub => {
          allSubs.push({
            ...sub,
            parent_name: parent.name,
            parent_id: parent.id
          });
        });
      }
    }
    return allSubs;
  };

  const filteredSubcategories = getAllSubcategories().filter(sub => 
    sub.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    sub.parent_name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const getSelectedCategoryDisplay = () => {
    if (!formData.category_id) return t('seller.addProduct.selectSubcategory');
    if (selectedCategoryName) return selectedCategoryName;
    
    const found = getAllSubcategories().find(sub => sub.id === parseInt(formData.category_id));
    if (found) {
      return `${found.parent_name} → ${found.name}`;
    }
    return t('seller.addProduct.selectSubcategory');
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          
          {/* Success Toast */}
          {showSuccess && (
            <div className="fixed top-20 right-4 z-50 animate-slide-in">
              <div className="bg-emerald-500 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">{t('seller.addProduct.createSuccess')}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link 
              to="/seller/products" 
              className="inline-flex items-center text-[#5C352C] hover:text-[#956959] transition-colors group text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t('seller.addProduct.backToProducts')}
            </Link>
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm border border-gray-100">
              <span className="text-xs text-gray-500">{t('seller.addProduct.newProductListing')}</span>
            </div>
          </div>

          {/* Form Progress */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{t('seller.addProduct.formCompletion')}</span>
              <span className="text-xs font-semibold text-[#5C352C]">{formProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#5C352C] to-[#956959] h-2 rounded-full transition-all duration-500"
                style={{ width: `${formProgress}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg sm:rounded-xl">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">{t('seller.addProduct.title')}</h1>
                  <p className="text-[#E9B48A] text-xs sm:text-sm mt-0.5">{t('seller.addProduct.subtitle')}</p>
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 bg-rose-50 border border-rose-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-rose-800 mb-1">{t('seller.addProduct.fixErrors')}:</h4>
                    <ul className="text-xs sm:text-sm text-rose-700 list-disc list-inside space-y-0.5">
                      {Object.values(errors).slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                    <span>{t('seller.addProduct.productName')} <span className="text-rose-500">*</span></span>
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    errors.name 
                      ? 'border-rose-500 focus:ring-rose-200' 
                      : 'border-gray-200 focus:border-[#5C352C] focus:ring-[#5C352C]/20'
                  }`}
                  placeholder={t('seller.addProduct.productNamePlaceholder')}
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('seller.addProduct.productNameHint')}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  {t('seller.addProduct.description')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={isMobile ? 4 : 5}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm"
                  placeholder={t('seller.addProduct.descriptionPlaceholder')}
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('seller.addProduct.descriptionHint')}</p>
              </div>

              {/* Price, Quantity and Discount Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                      <span>{t('seller.addProduct.price')} <span className="text-rose-500">*</span></span>
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">Tsh</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className={`w-full pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                        errors.price 
                          ? 'border-rose-500 focus:ring-rose-200' 
                          : 'border-gray-200 focus:border-[#5C352C] focus:ring-[#5C352C]/20'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                      <span>{t('seller.addProduct.initialStock')} <span className="text-rose-500">*</span></span>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.quantity 
                        ? 'border-rose-500 focus:ring-rose-200' 
                        : 'border-gray-200 focus:border-[#5C352C] focus:ring-[#5C352C]/20'
                    }`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                      <span>{t('seller.addProduct.discountPercent')}</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Price Preview if Discounted */}
              {discountPercentage > 0 && formData.price > 0 && (
                <div className="bg-rose-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-rose-100 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-[10px] sm:text-xs text-rose-600 font-medium uppercase tracking-wider">{t('seller.addProduct.discountedPrice')}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base sm:text-xl font-bold text-rose-700">Tsh {Number(discountedPrice).toLocaleString()}</p>
                      <span className="text-xs text-rose-400 line-through">Tsh {Number(formData.price).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    -{discountPercentage}% OFF
                  </div>
                </div>
              )}

              {/* Category Dropdown with Search */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                    <span>{t('seller.addProduct.category')} <span className="text-rose-500">*</span></span>
                  </div>
                </label>
                
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-white flex items-center justify-between ${
                      errors.category_id 
                        ? 'border-rose-500 focus:ring-rose-200' 
                        : 'border-gray-200 focus:border-[#5C352C] focus:ring-[#5C352C]/20'
                    } ${isCategoryDropdownOpen ? 'ring-2 ring-[#5C352C]/20 border-[#5C352C]' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className={`truncate ${!formData.category_id ? 'text-gray-500' : 'text-gray-900'}`}>
                        {getSelectedCategoryDisplay()}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                      {/* Search Input */}
                      <div className="sticky top-0 bg-white p-3 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t('seller.addProduct.searchCategories')}
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20"
                            autoFocus
                          />
                          {categorySearchTerm && (
                            <button
                              type="button"
                              onClick={() => setCategorySearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Categories List */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredSubcategories.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Folder className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">{t('seller.addProduct.noCategoriesFound')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('seller.addProduct.tryDifferentSearch')}</p>
                          </div>
                        ) : (
                          filteredSubcategories.map((sub, index) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleCategorySelect(sub.id, sub.name, sub.parent_name)}
                              className={`w-full px-3 sm:px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                                formData.category_id === sub.id ? 'bg-[#E9B48A]/10 border-l-2 border-[#5C352C]' : ''
                              } ${index !== filteredSubcategories.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              <div className="flex-shrink-0">
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {sub.name}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">
                                    {sub.parent_name}
                                  </span>
                                </div>
                              </div>
                              {formData.category_id === sub.id && (
                                <CheckCircle className="w-4 h-4 text-[#5C352C] flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="sticky bottom-0 bg-gray-50 px-4 py-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {t('seller.addProduct.showing')} {filteredSubcategories.length} {t('seller.addProduct.subcategories')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-[10px] sm:text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {t('seller.addProduct.categoryHint')}
                </p>
                {errors.category_id && (
                  <p className="text-xs text-rose-500 mt-1">{errors.category_id}</p>
                )}
              </div>

              {/* Low Stock Alert */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                    <span>{t('seller.addProduct.lowStockAlert')}</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="min_stock_alert"
                  value={formData.min_stock_alert}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm"
                  placeholder="5"
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('seller.addProduct.lowStockHint')}</p>
              </div>

              {/* Estimated Value Card */}
              {formData.price && formData.quantity && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-100 animate-fade-in">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] sm:text-xs text-emerald-600 font-medium">{t('seller.addProduct.estimatedValue')}</p>
                      <p className="text-base sm:text-xl font-bold text-emerald-700">Tsh {estimatedRevenue}</p>
                      <p className="text-[10px] sm:text-xs text-emerald-500 mt-0.5">
                        {t('seller.addProduct.basedOn')} {formData.quantity} {t('seller.addProduct.units')} × Tsh {parseFloat(formData.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Upload Section */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
                    <span>{t('seller.addProduct.productImage')}</span>
                  </div>
                </label>
                
                {!imagePreview ? (
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-gray-200 border-dashed hover:border-[#5C352C] transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      <div className="mt-2 sm:mt-3 flex text-xs sm:text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#5C352C] hover:text-[#956959] focus-within:outline-none px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-200 shadow-sm text-xs sm:text-sm"
                        >
                          <span>{t('seller.addProduct.chooseFile')}</span>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1 sm:pl-2 text-gray-500">{t('seller.addProduct.orDragDrop')}</p>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
                        {t('seller.addProduct.imageFormatHint')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">{t('seller.addProduct.imagePreview')}</p>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt={t('seller.addProduct.productPreview')}
                        className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-lg sm:rounded-xl border-2 border-emerald-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-md"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {errors.image && (
                  <p className="mt-2 text-xs sm:text-sm text-rose-500">{errors.image}</p>
                )}
              </div>

              {/* Tips Card */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-blue-800 mb-1">{t('seller.addProduct.tipsTitle')}</h4>
                    <ul className="text-[10px] sm:text-xs text-blue-700 space-y-0.5">
                      <li>• {t('seller.addProduct.tip1')}</li>
                      <li>• {t('seller.addProduct.tip2')}</li>
                      <li>• {t('seller.addProduct.tip3')}</li>
                      <li>• {t('seller.addProduct.tip4')}</li>
                      <li>• {t('seller.addProduct.tip5')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#5C352C] to-[#956959] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      {t('seller.addProduct.creating')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t('seller.addProduct.createProduct')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Help Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-[#5C352C]/10 rounded-lg">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5C352C]" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">{t('seller.addProduct.needHelp')}</span> {t('seller.addProduct.checkGuidelines')}
                  <a href="#" className="text-[#5C352C] hover:underline ml-1">{t('seller.addProduct.sellerGuidelines')}</a> 
                  {t('seller.addProduct.forBestPractices')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </MainLayout>
  );
};

export default AddProduct;