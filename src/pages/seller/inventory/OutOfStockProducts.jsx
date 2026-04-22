// src/pages/seller/inventory/OutOfStockProducts.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  XCircle, 
  RefreshCw, 
  Edit, 
  Eye,
  DollarSign,
  Package,
  AlertCircle,
  TrendingDown,
  Search,
  Filter,
  ChevronDown,
  ArrowUpRight,
  Info,
  CheckCircle
} from "lucide-react";

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
        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 mb-2"></div>
        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const SkeletonProductCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-hidden">
    <div className="flex justify-between mb-3">
      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
      <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full"></div>
      <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
      <div className="flex-1 h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
    </div>
  </div>
);

const OutOfStockProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name_asc");

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-out-of-stock')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-out-of-stock';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchOutOfStockProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case "price_asc": filtered.sort((a, b) => a.price - b.price); break;
      case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
      case "sales_desc": filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)); break;
      default: filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  const fetchOutOfStockProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/seller/inventory/out-of-stock');
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (error) {
      setError('Failed to load out of stock products');
      showToast('Failed to load out of stock products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const totalPotentialRevenue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;

  if (loading && products.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64 mt-1"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                <div className="h-9 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => <SkeletonStatCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <SkeletonProductCard key={i} />)}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button onClick={fetchOutOfStockProducts} className="mt-4 px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm">Try Again</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-rose-500/10 rounded-xl">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Out of Stock</h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">Products needing immediate restocking</p>
            </div>
            <div className="flex gap-3">
              <Link to="/seller/inventory/bulk-update">
                <button className="px-3 py-1.5 text-sm text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">Bulk Restock</button>
              </Link>
              <button onClick={fetchOutOfStockProducts} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          {products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-rose-600">{products.length}</p>
                <p className="text-xs text-gray-500">Out of Stock</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-sm font-bold text-amber-600 truncate">{formatPrice(totalPotentialRevenue)}</p>
                <p className="text-xs text-gray-500">Potential Revenue</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-sm font-bold text-blue-600 truncate">{formatPrice(averagePrice)}</p>
                <p className="text-xs text-gray-500">Avg Price</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-2xl font-bold text-rose-600">High</p>
                <p className="text-xs text-gray-500">Lost Sales Risk</p>
              </div>
            </div>
          )}

          {/* Urgent Warning */}
          {products.length > 0 && (
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <p className="text-xs text-rose-700">{products.length} product(s) out of stock. Restock immediately.</p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {products.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5C352C]" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${showFilters ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Filter className="w-4 h-4" />
                  Sort
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "name_asc", label: "Name: A to Z" },
                      { value: "price_asc", label: "Price: Low to High" },
                      { value: "price_desc", label: "Price: High to Low" },
                      { value: "sales_desc", label: "Best Sellers First" }
                    ].map(option => (
                      <button key={option.value} onClick={() => setSortBy(option.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === option.value ? 'bg-[#5C352C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No Out of Stock Products</h3>
              <p className="text-sm text-gray-500">All products are in stock</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Link to={`/seller/products/${product.id}`}>
                          <h3 className="font-medium text-gray-900 text-sm hover:text-[#5C352C]">{product.name}</h3>
                        </Link>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-600 rounded-full">Out of Stock</span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description || 'No description'}</p>
                      
                      <div className="bg-rose-50 rounded-lg p-2 text-center mb-3">
                        <p className="text-xs text-rose-600 font-medium">⚠️ Currently Unavailable</p>
                      </div>
                      
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-gray-500">Price</span>
                        <span className="font-semibold text-[#5C352C]">{formatPrice(product.price)}</span>
                      </div>
                      {product.sales_count > 0 && (
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-gray-500">Total Sold</span>
                          <span className="text-gray-700">{product.sales_count} units</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Link to={`/seller/products/${product.id}`} className="flex-1">
                          <button className="w-full py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">View</button>
                        </Link>
                        <Link to={`/seller/products/${product.id}/edit`} className="flex-1">
                          <button className="w-full py-1.5 text-xs text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">Restock</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && searchTerm && (
                <div className="bg-white rounded-xl p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No products found matching "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm("")} className="mt-2 text-sm text-[#5C352C] hover:underline">Clear search</button>
                </div>
              )}

              {/* Lost Sales Alert */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-700">Estimated lost revenue: <span className="font-bold">{formatPrice(totalPotentialRevenue)}</span></p>
                  </div>
                  <Link to="/seller/inventory/bulk-update">
                    <button className="px-3 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">Bulk Restock →</button>
                  </Link>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700">Set higher min stock alerts for best-selling products to avoid future stockouts.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OutOfStockProducts;