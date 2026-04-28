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
  <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16 mb-2"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonLogRow = () => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
    <div className="flex-1">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 mt-1"></div>
    </div>
    <div className="w-32">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
    </div>
    <div className="w-20">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-16"></div>
    </div>
    <div className="w-16">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-12"></div>
    </div>
    <div className="w-24">
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
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
    if (type === 'add' || type === 'restock') return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
    if (type === 'remove' || type === 'sale') return <TrendingDown className="w-3.5 h-3.5 text-rose-600" />;
    return <Package className="w-3.5 h-3.5 text-gray-600" />;
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
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="h-9 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="w-24 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-4">
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                  <History className="w-5 h-5 text-[#5C352C]" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">{t('seller.inventoryLogs.title')}</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">{t('seller.inventoryLogs.subtitle')}</p>
            </div>
            <button 
              onClick={() => fetchLogs(pagination.current_page)} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('seller.inventoryLogs.refresh')}
            </button>
          </div>

          {/* Stats */}
          {logs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                <p className="text-xs text-gray-500">{t('seller.inventoryLogs.totalLogs')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-emerald-600">{totalAdditions}</p>
                <p className="text-xs text-gray-500">{t('seller.inventoryLogs.added')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-rose-600">{totalRemovals}</p>
                <p className="text-xs text-gray-500">{t('seller.inventoryLogs.removed')}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-blue-600">{uniqueProducts}</p>
                <p className="text-xs text-gray-500">{t('seller.inventoryLogs.products')}</p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('seller.inventoryLogs.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${showFilters ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Filter className="w-4 h-4" />
                {t('seller.inventoryLogs.filters')}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#5C352C]"
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

          {/* Error / Empty State */}
          {error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => fetchLogs(1)} 
                className="mt-3 text-sm text-[#5C352C] hover:underline"
              >
                {t('seller.inventoryLogs.tryAgain')}
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">{t('seller.inventoryLogs.noLogsFound')}</h3>
              <p className="text-sm text-gray-500">{t('seller.inventoryLogs.noLogsMessage')}</p>
            </div>
          ) : (
            /* Logs Table */
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.dateTime')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.product')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.type')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.change')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.stock')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">{t('seller.inventoryLogs.reason')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-700">{formatDate(log.created_at)}</span>
                            <span className="text-[10px] text-gray-400">{formatTime(log.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            to={`/seller/products/${log.product_id}`} 
                            className="text-sm text-gray-900 hover:text-[#5C352C] font-medium"
                          >
                            {log.product?.name || `${t('seller.inventoryLogs.productLabel')} #${log.product_id}`}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeBadge(log.type)}`}>
                            {getTypeIcon(log.type)}
                            {getTypeLabel(log.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${log.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{log.old_quantity} → </span>
                          <span className="text-xs font-medium text-gray-900">{log.new_quantity}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="text-xs text-gray-500 block truncate max-w-[200px]" 
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

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                  <div className="text-xs text-gray-500">
                    {t('seller.inventoryLogs.showing')} {pagination.from || 0} {t('seller.inventoryLogs.to')} {pagination.to || 0} {t('seller.inventoryLogs.of')} {pagination.total} {t('seller.inventoryLogs.logs')}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => fetchLogs(pagination.current_page - 1)} 
                      disabled={pagination.current_page === 1}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium text-white bg-[#5C352C] rounded-lg">
                      {pagination.current_page} / {pagination.last_page}
                    </span>
                    <button 
                      onClick={() => fetchLogs(pagination.current_page + 1)} 
                      disabled={pagination.current_page === pagination.last_page}
                      className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#5C352C] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryLogs;