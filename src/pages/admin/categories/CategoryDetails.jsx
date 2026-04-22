// src/pages/admin/categories/CategoryDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  ArrowLeft, 
  Folder, 
  Package, 
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
  Activity,
  TrendingUp,
  RefreshCw,
  Link as LinkIcon,
  Clock,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="animate-pulse">
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const SkeletonDetailItem = () => (
  <div className="animate-pulse">
    <div className="flex items-start gap-3 p-2 -mx-2">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const CategoryDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/categories/${id}`);
      setCategory(response.data);
      setImageError(false);
    } catch (error) {
      console.error("Error fetching category:", error);
      const errorMsg = error.response?.data?.message || "Category not found";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategory();
    setRefreshing(false);
    showToast('Category details refreshed', 'info');
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete category "${category?.name}"? Products will be moved to uncategorized.`)) {
      try {
        await api.delete(`/admin/categories/${category.id}`);
        showToast('Category deleted successfully', 'success');
        setTimeout(() => {
          window.location.href = '/admin/categories';
        }, 1500);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Error deleting category';
        showToast(errorMsg, 'error');
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse ml-12"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-2">
                      <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 bg-white/20 rounded w-48 mx-auto md:mx-0 animate-pulse"></div>
                    <div className="h-4 bg-white/20 rounded w-64 mx-auto md:mx-0 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <SkeletonDetailItem key={i} />)}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2].map(i => <SkeletonDetailItem key={i} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !category) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">Error Loading Category</h3>
              <p className="text-sm text-gray-500 mb-4">{error || "Category not found"}</p>
              <Link to="/admin/categories" className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Categories
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Stats cards
  const statCards = [
    {
      title: "Products Count",
      value: category.products_count || 0,
      subValue: "Products in this category",
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Subcategories",
      value: category.children?.length || 0,
      subValue: "Child categories",
      icon: Folder,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Category Status",
      value: category.is_active ? "Active" : "Inactive",
      subValue: category.is_active ? "Visible to customers" : "Hidden from customers",
      icon: Activity,
      color: category.is_active ? "text-emerald-600" : "text-rose-600",
      bg: category.is_active ? "bg-emerald-50" : "bg-rose-50"
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin/categories" className="inline-flex items-center gap-2 text-[#5C352C] hover:text-[#956959] transition-colors mb-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Categories</span>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <Folder className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Category Details</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">View and manage category information</p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-2">{card.subValue}</p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category Header Banner */}
          <div className="bg-gradient-to-r from-[#2A1713] to-[#5C352C] rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Category Image/Icon */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#E9B48A] to-[#956959] rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                  {category.image && !imageError ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full rounded-xl object-cover"
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <Folder className="w-12 h-12 md:w-16 md:h-16" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      category.is_active 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {category.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
                  {category.description && (
                    <p className="text-[#E9B48A] text-sm">{category.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-xs text-[#E9B48A]/70">
                    <LinkIcon className="w-3 h-3" />
                    <span className="font-mono">Slug: {category.slug}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Category Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#5C352C]" />
                  Category Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <DetailItem icon={Folder} label="Category Name" value={category.name} />
                <DetailItem icon={LinkIcon} label="Slug" value={category.slug} monospace />
                <DetailItem icon={Calendar} label="Created Date" value={formatDateTime(category.created_at)} />
                <DetailItem icon={Clock} label="Last Updated" value={formatDateTime(category.updated_at)} />
                {category.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{category.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hierarchy Information Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5C352C]" />
                  Hierarchy Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Parent Category */}
                <div className="flex items-start group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Folder className="w-5 h-5 text-[#5C352C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Category</p>
                    {category.parent ? (
                      <Link to={`/admin/categories/${category.parent.id}`} className="text-[#5C352C] hover:text-[#956959] text-sm inline-flex items-center gap-1">
                        {category.parent.name}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <p className="text-gray-700 text-sm">Top Level Category (No Parent)</p>
                    )}
                  </div>
                </div>
                
                {/* Subcategories */}
                {category.children && category.children.length > 0 && (
                  <div className="flex items-start group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-[#5C352C]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Subcategories</p>
                      <div className="space-y-1 mt-2">
                        {category.children.map(child => (
                          <Link key={child.id} to={`/admin/categories/${child.id}`} className="flex items-center text-[#5C352C] hover:text-[#956959] text-sm py-0.5">
                            <ChevronRight className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products List */}
          {category.products && category.products.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#5C352C]" />
                  Products in this Category ({category.products.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {category.products.slice(0, 10).map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link to={`/admin/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-[#5C352C] transition-colors">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-[#5C352C]">
                            Tsh {parseFloat(product.price).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${product.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {product.quantity} units
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {product.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {category.products.length > 10 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Showing 10 of {category.products.length} products</p>
                </div>
              )}
            </div>
          )}

          {/* Info Note if category has no products */}
          {(!category.products || category.products.length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> This category has no products assigned to it yet. 
                    Products can be assigned to this category when creating or editing products.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link to={`/admin/categories/${category.id}/edit`}>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors font-medium text-sm">
                <Edit className="w-4 h-4" />
                Edit Category
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Category
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper Component for Detail Items
const DetailItem = ({ icon: Icon, label, value, monospace }) => (
  <div className="flex items-start group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
    <div className="w-10 h-10 bg-[#E9B48A]/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#E9B48A]/30 transition-colors">
      <Icon className="w-5 h-5 text-[#5C352C]" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-gray-900 font-medium text-sm break-words ${monospace ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

export default CategoryDetails;