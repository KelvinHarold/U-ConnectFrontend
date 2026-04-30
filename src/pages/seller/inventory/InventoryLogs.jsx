// src/pages/seller/inventory/InventoryLogs.jsx
import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  History, 
  RefreshCw, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Filter,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
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

// ==================== SKELETON LOADERS ====================
const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12 sm:w-16 mb-1 sm:mb-2"></div>
        <div className="h-5 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonLogRow = () => (
  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1 min-w-[120px]">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32"></div>
      <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-24 mt-1"></div>
    </div>
    <div className="flex-1">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28 sm:w-32"></div>
    </div>
    <div className="w-24">
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-20"></div>
    </div>
    <div className="w-16">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12"></div>
    </div>
    <div className="w-20 sm:w-24">
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 sm:w-20"></div>
    </div>
  </div>
);

const InventoryLogs = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-inventory-logs')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-inventory-logs';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [search, typeFilter]);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await api.get('/seller/inventory/logs', { params });
      
      if (response.data && response.data.data) {
        setLogs(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page,
          from: response.data.from,
          to: response.data.to
        });
      } else {
        setLogs([]);
      }
    } catch (error) {
      setError(t('seller.inventoryLogs.failedToLoad'));
      showToast(t('seller.inventoryLogs.failedToLoadLogs'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'add' || type === 'restock') return <TrendingUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600" />;
    if (type === 'remove' || type === 'sale') return <TrendingDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-600" />;
    return <Package className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-600" />;
  };

  const getTypeBadge = (type) => {
    const badges = {
      add: 'bg-emerald-50 text-emerald-700',
      remove: 'bg-rose-50 text-rose-700',
      sale: 'bg-blue-50 text-blue-700',
      restock: 'bg-purple-50 text-purple-700',
      adjustment: 'bg-amber-50 text-amber-700'
    };
    return badges[type] || 'bg-gray-50 text-gray-700';
  };

  const getTypeLabel = (type) => {
    const labels = {
      add: t('seller.inventoryLogs.typeAdded'),
      remove: t('seller.inventoryLogs.typeRemoved'),
      sale: t('seller.inventoryLogs.typeSale'),
      restock: t('seller.inventoryLogs.typeRestocked'),
      adjustment: t('seller.inventoryLogs.typeAdjusted')
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString();
  };

  if (loading && logs.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32 sm:w-40"></div>
                <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 sm:w-64 mt-1"></div>
              </div>
              <div className="h-8 sm:h-9 w-20 sm:w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="w-24 h-9 sm:h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-3 sm:p-4">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                  ))}
                </div>
              </div>
              {[1, 2, 3, 4, 5].map(i => <SkeletonLogRow key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalAdditions = logs.filter(l => l.type === 'add' || l.type === 'restock').reduce((sum, l) => sum + (l.quantity_change > 0 ? l.quantity_change : 0), 0);
  const totalRemovals = logs.filter(l => l.type === 'remove' || l.type === 'sale').reduce((sum, l) => sum + (l.quantity_change < 0 ? Math.abs(l.quantity_change) : 0), 0);
  const uniqueProducts = new Set(logs.map(l => l.product_id)).size;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <div className="p-1.5 sm:p-2 bg-[#5C352C]/10 rounded-lg sm:rounded-xl">
                    <History className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('seller.inventoryLogs.title')}</h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 ml-8 sm:ml-11">{t('seller.inventoryLogs.subtitle')}</p>
              </div>
              <button 
                onClick={() => fetchLogs(pagination.current_page)} 
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('seller.inventoryLogs.refresh')}</span>
              </button>
            </div>

            {/* Stats - Responsive */}
            {logs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{pagination.total}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">{t('seller.inventoryLogs.totalLogs')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600">{totalAdditions}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">{t('seller.inventoryLogs.added')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-rose-600">{totalRemovals}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">{t('seller.inventoryLogs.removed')}</p>
                </div>
                <div className="bg-white rounded-xl border-2 border-gray-100 p-2 sm:p-3 shadow-sm">
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{uniqueProducts}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500">{t('seller.inventoryLogs.products')}</p>
                </div>
              </div>
            )}

            {/* Search and Filters - Responsive */}
            <div className="bg-white rounded-xl border-2 border-gray-100 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-[180px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isSmallMobile ? t('seller.inventoryLogs.searchShort') : t('seller.inventoryLogs.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                    showFilters ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-md' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{t('seller.inventoryLogs.filters')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] cursor-pointer"
                  >
                    <option value="all">{t('seller.inventoryLogs.allTypes')}</option>
                    <option value="add">{t('seller.inventoryLogs.addRestock')}</option>
                    <option value="remove">{t('seller.inventoryLogs.remove')}</option>
                    <option value="sale">{t('seller.inventoryLogs.sale')}</option>
                    <option value="adjustment">{t('seller.inventoryLogs.adjustment')}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Error / Empty State - Responsive */}
            {error ? (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6 sm:p-8 text-center">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-400 mx-auto mb-3" />
                <p className="text-rose-600 text-xs sm:text-sm">{error}</p>
                <button 
                  onClick={() => fetchLogs(1)} 
                  className="mt-3 text-xs sm:text-sm text-[#5C352C] hover:underline"
                >
                  {t('seller.inventoryLogs.tryAgain')}
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-100 p-8 sm:p-12 text-center">
                <History className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{t('seller.inventoryLogs.noLogsFound')}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{t('seller.inventoryLogs.noLogsMessage')}</p>
              </div>
            ) : (
              /* Logs Table - Responsive with overflow */
              <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gray-50 border-b-2 border-gray-100">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.inventoryLogs.dateTime')}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.inventoryLogs.product')}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.inventoryLogs.type')}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.inventoryLogs.change')}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500">{t('seller.inventoryLogs.stock')}</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-xs font-medium text-gray-500 hidden lg:table-cell">{t('seller.inventoryLogs.reason')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs text-gray-700">{formatDate(log.created_at)}</span>
                              <span className="text-[8px] sm:text-[10px] text-gray-400 hidden sm:block">{formatTime(log.created_at)}</span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <Link 
                              to={`/seller/products/${log.product_id}`} 
                              className="text-[10px] sm:text-sm text-gray-900 hover:text-[#5C352C] font-medium truncate block max-w-[120px] sm:max-w-none"
                            >
                              {log.product?.name || `${t('seller.inventoryLogs.productLabel')} #${log.product_id}`}
                            </Link>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] font-medium ${getTypeBadge(log.type)}`}>
                              {getTypeIcon(log.type)}
                              <span className="hidden xs:inline">{getTypeLabel(log.type)}</span>
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className={`text-[9px] sm:text-xs font-medium ${log.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="text-[8px] sm:text-xs text-gray-500">{log.old_quantity} → </span>
                            <span className="text-[9px] sm:text-xs font-medium text-gray-900">{log.new_quantity}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                            <span 
                              className="text-[8px] sm:text-xs text-gray-500 block truncate max-w-[150px]" 
                              title={log.reason}
                            >
                              {log.reason || '—'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - Responsive */}
                {pagination.last_page > 1 && (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-t-2 border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="text-[9px] sm:text-xs text-gray-500 text-center sm:text-left">
                      {t('seller.inventoryLogs.showing')} {pagination.from || 0} {t('seller.inventoryLogs.to')} {pagination.to || 0} {t('seller.inventoryLogs.of')} {pagination.total} {t('seller.inventoryLogs.logs')}
                    </div>
                    <div className="flex justify-center gap-1">
                      <button 
                        onClick={() => fetchLogs(pagination.current_page - 1)} 
                        disabled={pagination.current_page === 1}
                        className="p-1 sm:p-1.5 rounded-lg border-2 border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm font-medium text-white bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] rounded-lg shadow-md">
                        {pagination.current_page} / {pagination.last_page}
                      </span>
                      <button 
                        onClick={() => fetchLogs(pagination.current_page + 1)} 
                        disabled={pagination.current_page === pagination.last_page}
                        className="p-1 sm:p-1.5 rounded-lg border-2 border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryLogs;