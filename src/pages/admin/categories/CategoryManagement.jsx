// src/pages/admin/categories/CategoryManagement.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { confirmAlert } from "../../../utils/sweetAlertHelper";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  FolderTree, 
  Folder,
  ChevronRight,
  ChevronDown,
  Package,
  AlertCircle,
  X,
  Upload,
  CheckCircle,
  Info,
  Activity,
  Layers,
  AlertTriangle,
  ChevronLeft,
  Power
} from "lucide-react";
import { Link } from "react-router-dom";

// ==================== SKELETON LOADERS ====================
const StatCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const CategoryRowSkeleton = ({ level = 0 }) => {
  const indentLevel = Math.min(level * 20, 80);
  
  return (
    <div className="animate-pulse border-b border-gray-100">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div style={{ width: `${indentLevel}px`, flexShrink: 0 }} />
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const CategoryManagement = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [treeView, setTreeView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/categories');
      const treeData = buildTree(response.data);
      setCategories(treeData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.response?.data?.message || t('seller.categories.errorLoading'));
      showToast(error.response?.data?.message || t('seller.categories.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/categories/tree');
      setCategories(response.data);
      setTreeView(true);
    } catch (error) {
      console.error('Error fetching category tree:', error);
      setError(error.response?.data?.message || t('seller.categories.errorLoadingTree'));
      showToast(error.response?.data?.message || t('seller.categories.errorLoadingTree'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (treeView) {
      await fetchCategoryTree();
    } else {
      await fetchCategories();
    }
    setRefreshing(false);
    showToast(t('alerts.refreshed'), 'info');
  };

  const buildTree = (flatList, parentId = null) => {
    const tree = [];
    for (const item of flatList) {
      if (item.parent_id === parentId) {
        const children = buildTree(flatList, item.id);
        if (children.length) {
          item.children = children;
        }
        tree.push(item);
      }
    }
    return tree;
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmAlert({
      title: t('alerts.deleteConfirm', { name }),
      text: t('alerts.categoryDeleteText'),
      icon: 'warning',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel'),
      dangerMode: true,
    });
    if (confirmed) {
      try {
        await api.delete(`/admin/categories/${id}`);
        showToast(t('alerts.deleteSuccess'), 'success');
        if (treeView) {
          await fetchCategoryTree();
        } else {
          await fetchCategories();
        }
      } catch (error) {
        showToast(error.response?.data?.message || t('alerts.deleteError'), 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const actionKey = currentStatus ? 'deactivate' : 'activate';
    const confirmed = await confirmAlert({
      title: t(`alerts.${actionKey}Confirm`, { name }),
      text: '',
      icon: 'question',
      confirmButtonText: t(`alerts.${actionKey}`),
      cancelButtonText: t('common.cancel'),
    });
    
    if (!confirmed) return;

    try {
      await api.put(`/admin/categories/${id}`, { is_active: !currentStatus });
      showToast(t(`alerts.${currentStatus ? 'deactivation' : 'activation'}Success`), 'success');
      if (treeView) {
        await fetchCategoryTree();
      } else {
        await fetchCategories();
      }
    } catch (error) {
      showToast(error.response?.data?.message || t(`alerts.${currentStatus ? 'deactivation' : 'activation'}Error`), 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImageError = (categoryId) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  const getTotalProducts = (category) => {
    let total = category.products_count || 0;
    if (category.children) {
      category.children.forEach(child => {
        total += getTotalProducts(child);
      });
    }
    return total;
  };

  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => {
    const countSubs = (category) => {
      let count = category.children?.length || 0;
      if (category.children) {
        category.children.forEach(child => {
          count += countSubs(child);
        });
      }
      return count;
    };
    return sum + countSubs(cat);
  }, 0);
  const totalProducts = categories.reduce((sum, cat) => sum + getTotalProducts(cat), 0);
  const activeCategories = categories.filter(cat => cat.is_active).length;

  const statCards = [
    {
      title: "Total Categories",
      value: totalCategories,
      subValue: `${totalSubcategories} Subcategories`,
      icon: FolderTree,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Active Categories",
      value: activeCategories,
      subValue: `${categories.length - activeCategories} Inactive`,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total Products",
      value: totalProducts,
      subValue: "Across all categories",
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  const renderCategoryTree = (categoriesList, level = 0) => {
    return categoriesList.map((category) => {
      const totalProductsCount = getTotalProducts(category);
      const indentLevel = Math.min(level * 20, 80);
      
      return (
        <React.Fragment key={category.id}>
          <div className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div style={{ width: `${indentLevel}px`, flexShrink: 0 }} />
                    
                    {category.children && category.children.length > 0 ? (
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-[#5C352C] transition-colors mt-0.5"
                      >
                        {expandedNodes[category.id] ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                    ) : (
                      <div className="w-4 flex-shrink-0" />
                    )}
                    
                    <div className="flex-shrink-0">
                      {category.image && !imageErrors[category.id] ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          onError={() => handleImageError(category.id)}
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.is_active ? 'bg-[#5C352C]/10' : 'bg-gray-100'}`}>
                          <Folder className={`w-5 h-5 ${category.is_active ? 'text-[#5C352C]' : 'text-gray-400'}`} />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm truncate ${category.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                        {category.name}
                      </p>
                      {category.description && !isMobile && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 ml-10 sm:ml-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                    <Package className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-semibold text-[#5C352C]">{totalProductsCount}</span>
                  </div>

                  <div className="flex gap-1">
                    <Link to={`/admin/categories/${category.id}`}>
                      <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({
                          name: category.name,
                          description: category.description || '',
                          parent_id: category.parent_id || '',
                          is_active: category.is_active,
                          image: null
                        });
                        setImagePreview(category.image);
                        setShowCreateModal(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category.id, category.is_active, category.name)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={category.is_active ? "Deactivate" : "Activate"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              {category.description && isMobile && (
                <p className="text-xs text-gray-500 mt-2 ml-12">{category.description}</p>
              )}
            </div>
          </div>
          {category.children && category.children.length > 0 && expandedNodes[category.id] && (
            <div>
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  const renderFlatList = () => {
    const flattenCategories = (cats, level = 0) => {
      let result = [];
      for (const cat of cats) {
        result.push({ ...cat, level, totalProducts: getTotalProducts(cat) });
        if (cat.children && cat.children.length > 0) {
          result = [...result, ...flattenCategories(cat.children, level + 1)];
        }
      }
      return result;
    };

    const flatList = flattenCategories(categories);

    return flatList.map((category) => {
      const indentLevel = Math.min(category.level * 20, 80);
      
      return (
        <div key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div style={{ width: `${indentLevel}px`, flexShrink: 0 }} />
                  
                  <div className="flex-shrink-0">
                    {category.image && !imageErrors[category.id] ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        onError={() => handleImageError(category.id)}
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.is_active ? 'bg-[#5C352C]/10' : 'bg-gray-100'}`}>
                        <Folder className={`w-5 h-5 ${category.is_active ? 'text-[#5C352C]' : 'text-gray-400'}`} />
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate ${category.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {category.name}
                    </p>
                    {category.description && !isMobile && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{category.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 ml-10 sm:ml-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                  <Package className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-[#5C352C]">{category.totalProducts}</span>
                </div>
                <div className="flex gap-1">
                  <Link to={`/admin/categories/${category.id}`}>
                    <button className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        description: category.description || '',
                        parent_id: category.parent_id || '',
                        is_active: category.is_active,
                        image: null
                      });
                      setImagePreview(category.image);
                      setShowCreateModal(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-[#5C352C] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(category.id, category.is_active, category.name)}
                    className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {category.description && isMobile && (
              <p className="text-xs text-gray-500 mt-2 ml-10">{category.description}</p>
            )}
          </div>
        </div>
      );
    });
  };

  if (loading && categories.length === 0) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              {[1, 2, 3, 4, 5].map(i => <CategoryRowSkeleton key={i} level={i % 3 === 0 ? 1 : 0} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <FolderTree className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Category Management</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Organize products with hierarchical categories</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => {
                  setTreeView(true);
                  fetchCategoryTree();
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  treeView 
                    ? 'bg-[#5C352C] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4" />
                  Tree View
                </div>
              </button>
              <button
                onClick={() => {
                  setTreeView(false);
                  fetchCategories();
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !treeView 
                    ? 'bg-[#5C352C] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  List View
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({
                    name: '',
                    description: '',
                    parent_id: '',
                    is_active: true,
                    image: null
                  });
                  setImagePreview(null);
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </div>
          </div>

          {/* Categories Display */}
          {error ? (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => treeView ? fetchCategoryTree() : fetchCategories()} className="mt-3 text-sm text-[#5C352C] hover:underline">
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Categories Found</h3>
              <p className="text-sm text-gray-500">Get started by creating your first category</p>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({
                    name: '',
                    description: '',
                    parent_id: '',
                    is_active: true,
                    image: null
                  });
                  setImagePreview(null);
                  setShowCreateModal(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create First Category
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {treeView ? renderCategoryTree(categories) : renderFlatList()}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCreateModal && (
        <CategoryModal
          category={editingCategory}
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            if (treeView) {
              fetchCategoryTree();
            } else {
              fetchCategories();
            }
          }}
          isMobile={isMobile}
          showToast={showToast}
        />
      )}
    </MainLayout>
  );
};

// ==================== CATEGORY MODAL ====================
const CategoryModal = ({ 
  category, 
  formData, 
  setFormData, 
  imagePreview, 
  setImagePreview, 
  categories, 
  onClose, 
  onSave, 
  isMobile,
  showToast
}) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isParentSelectOpen, setIsParentSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: t('alerts.invalidImageText') });
        showToast(t('alerts.invalidFile'), 'error');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, image: t('alerts.fileSizeError') });
        showToast(t('alerts.fileTooLarge'), 'error');
        return;
      }
      
      setFormData({ ...formData, image: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (errors.image) {
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);
      }
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      
      if (formData.parent_id) {
        submitData.append('parent_id', formData.parent_id);
      }
      
      submitData.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      if (category) {
        submitData.append('_method', 'PUT');
        await api.post(`/admin/categories/${category.id}`, submitData);
        showToast(t('alerts.updateSuccess'), 'success');
      } else {
        await api.post('/admin/categories', submitData);
        showToast(t('alerts.success'), 'success');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showToast(t('common.error'), 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast(t('alerts.updateError'), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const isTopLevelCategory = (categoryItem) => {
    return !categoryItem.parent_id;
  };

  const flattenCategoriesForSelect = (cats, level = 0, excludeId = null) => {
    let options = [];
    for (const cat of cats) {
      if (cat.id !== excludeId) {
        const isCircular = category && (cat.id === category.id || isChildOf(cat, category.id));
        const isSelectable = isTopLevelCategory(cat);
        const isDisabled = isCircular || !isSelectable;
        
        options.push({
          id: cat.id,
          name: cat.name,
          level: level,
          disabled: isDisabled,
          disabledReason: !isSelectable ? 'Only top-level categories can be parents' : (isCircular ? 'Circular reference not allowed' : ''),
          isActive: cat.is_active
        });
      }
      if (cat.children && cat.children.length > 0) {
        options = [...options, ...flattenCategoriesForSelect(cat.children, level + 1, excludeId)];
      }
    }
    return options;
  };

  const isChildOf = (parentCategory, childId) => {
    if (!parentCategory.children) return false;
    for (const child of parentCategory.children) {
      if (child.id === childId) return true;
      if (child.children && isChildOf(child, childId)) return true;
    }
    return false;
  };

  const categoryOptions = flattenCategoriesForSelect(categories, 0, category?.id);

  const filteredOptions = searchTerm 
    ? categoryOptions.filter(opt => 
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categoryOptions;

  const getSelectedCategoryName = () => {
    if (!formData.parent_id) return 'None (Top Level)';
    const selected = categoryOptions.find(opt => opt.id === parseInt(formData.parent_id));
    return selected ? selected.name : 'None (Top Level)';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2A1713] to-[#5C352C] px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {category ? 'Edit Category' : 'Create Category'}
            </h3>
            <p className="text-[#E9B48A] text-xs mt-0.5">
              {category ? 'Update category information' : 'Add a new category to organize products'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-rose-800 mb-1">Please fix the following errors:</h4>
                  <ul className="text-xs text-rose-700 space-y-0.5">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Category Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm ${
                errors.name ? 'border-rose-500' : 'border-gray-200'
              }`}
              placeholder="Enter category name"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5C352C] focus:border-[#5C352C] text-sm"
              placeholder="Optional description"
            />
          </div>

          {/* Parent Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsParentSelectOpen(!isParentSelectOpen)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C] focus:ring-1 focus:ring-[#5C352C] text-sm bg-white flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gray-400" />
                  <span className={formData.parent_id ? 'text-gray-900' : 'text-gray-500'}>
                    {getSelectedCategoryName()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isParentSelectOpen ? 'rotate-180' : ''}`} />
              </button>

              {isParentSelectOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  <div className="sticky top-0 bg-white p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#5C352C]"
                    />
                  </div>
                  
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, parent_id: '' });
                        setIsParentSelectOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">None (Top Level)</span>
                    </button>
                    
                    {filteredOptions.map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          if (!option.disabled) {
                            setFormData({ ...formData, parent_id: option.id });
                            setIsParentSelectOpen(false);
                            setSearchTerm('');
                          }
                        }}
                        disabled={option.disabled}
                        className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm ${
                          option.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                        }`}
                      >
                        <div style={{ width: `${option.level * 16}px`, flexShrink: 0 }} />
                        <Folder className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <span className={option.isActive ? 'text-gray-700' : 'text-gray-400'}>
                            {option.name}
                          </span>
                        </div>
                        {option.disabled && (
                          <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                            {option.disabledReason}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Only top-level categories can be selected as parent
            </p>
          </div>

          {/* Category Image Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            
            {!imagePreview ? (
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200 border-dashed hover:border-[#5C352C] transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="mt-2 flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-lg font-medium text-[#5C352C] hover:text-[#956959] px-3 py-1.5 border border-gray-200 shadow-sm text-sm"
                    >
                      Choose file
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, WEBP up to 2MB</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Preview</p>
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Active Status</label>
                <p className="text-xs text-gray-500">Inactive categories won't be visible to customers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5C352C]"></div>
                <span className="ml-3 text-sm font-medium">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[#5C352C] text-white rounded-lg font-medium hover:bg-[#956959] transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                category ? 'Update Category' : 'Create Category'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryManagement;