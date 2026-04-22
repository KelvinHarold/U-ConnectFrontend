// src/pages/admin/products/EditProduct.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  DollarSign, 
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Star,
  RefreshCw,
  Info,
  TrendingUp,
  ChevronLeft,
  Edit  // Added Edit icon here
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonFormField = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

const SkeletonTextareaField = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-24 bg-gray-200 rounded w-full"></div>
  </div>
);

const SkeletonToggle = () => (
  <div className="animate-pulse">
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    is_active: true,
    is_featured: false
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false
      });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to load product data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProduct();
    setRefreshing(false);
    showToast('Product data refreshed', 'info');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      await api.put(`/admin/products/${id}`, formData);
      showToast("Product updated successfully", "success");
      setTimeout(() => {
        navigate(`/admin/products/${id}`);
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast("Please fix the form errors", "error");
      } else {
        showToast(error.response?.data?.message || "Error updating product", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const formatPricePreview = (price) => {
    if (!price) return 'Not set';
    return `Tsh ${Number(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#2A1713] to-[#5C352C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl animate-pulse"></div>
                  <div>
                    <div className="h-5 bg-white/20 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-white/20 rounded w-48 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <SkeletonFormField />
                <SkeletonTextareaField />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkeletonFormField />
                  <SkeletonFormField />
                </div>
                <SkeletonToggle />
                <SkeletonToggle />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link to={`/admin/products/${id}`} className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Product Details</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <Edit className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Update product information and settings</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#2A1713] to-[#5C352C]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Product</h2>
                  <p className="text-[#E9B48A] text-sm mt-0.5">Update product information and settings</p>
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="m-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-rose-800 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm text-rose-700 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm ${
                      errors.name ? 'border-rose-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm"
                    placeholder="Enter product description"
                  />
                  <p className="mt-1 text-xs text-gray-400">Provide a detailed description of the product</p>
                </div>

                {/* Price and Quantity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Tsh</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm ${
                          errors.price ? 'border-rose-500' : 'border-gray-200'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-xs text-rose-500">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm ${
                        errors.quantity ? 'border-rose-500' : 'border-gray-200'
                      }`}
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-rose-500">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="space-y-4">
                  {/* Active Status Toggle */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <CheckCircle className="w-5 h-5 text-[#5C352C]" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Product Status</label>
                          <p className="text-xs text-gray-400 mt-0.5">Enable or disable product visibility in the marketplace</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5C352C]"></div>
                        <span className="ml-3 text-sm font-medium">
                          {formData.is_active ? (
                            <span className="flex items-center text-emerald-600">
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-rose-600">
                              <AlertCircle className="w-4 h-4 mr-1.5" />
                              Inactive
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Featured Status Toggle */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Featured Product</label>
                          <p className="text-xs text-gray-400 mt-0.5">Show on homepage and featured sections for better visibility</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_featured"
                          checked={formData.is_featured}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        <span className="ml-3 text-sm font-medium">
                          {formData.is_featured ? (
                            <span className="flex items-center text-yellow-600">
                              <Star className="w-4 h-4 mr-1.5" />
                              Featured
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              Not Featured
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-2.5 bg-[#5C352C] text-white rounded-lg font-medium hover:bg-[#956959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <Link
                    to={`/admin/products/${id}`}
                    className="flex-1 px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Updating product information will immediately affect how the product appears to customers. 
                  Changes to stock quantity and status are reflected in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Preview */}
          <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E9B48A]/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-[#5C352C]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Quick Stats:</span> Current price is <span className="font-medium text-[#5C352C]">{formatPricePreview(formData.price)}</span> 
                  with <span className="font-medium">{formData.quantity || 0}</span> units in stock.
                  {formData.is_featured && " This product is featured on the homepage."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProduct;