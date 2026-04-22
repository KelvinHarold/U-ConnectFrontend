// src/pages/admin/reports/SalesReport.jsx
import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  AlertCircle,
  Activity,
  ChevronLeft,
  CheckCircle
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const StatCardSkeleton = () => (
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

const ChartRowSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="flex justify-between mb-1">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-8"></div>
  </div>
);

// ==================== MAIN COMPONENT ====================
const SalesReport = () => {
  const { showToast } = useToast();
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/reports/sales', {
        params: { start_date: startDate, end_date: endDate }
      });
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setError(error.response?.data?.message || 'Failed to load sales report');
      showToast(error.response?.data?.message || 'Failed to load sales report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSalesReport();
    setRefreshing(false);
    showToast('Sales report refreshed', 'info');
  };

  const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

  const formatCompactPrice = (price) => {
    if (price >= 1000000) {
      return `Tsh ${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `Tsh ${(price / 1000).toFixed(1)}K`;
    }
    return formatPrice(price);
  };

  const handleExport = () => {
    if (!salesData?.daily_sales?.length) return;
    
    const csvData = [
      ['Date', 'Orders Count', 'Total Sales', 'Average Order Value'],
      ...salesData.daily_sales.map(sale => [
        sale.date,
        sale.orders_count,
        sale.total_sales,
        sale.average_order_value
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Report exported successfully', 'success');
  };

  const maxTotal = Math.max(...(salesData?.daily_sales?.map(s => s.total_sales) || [0]));

  const quickRanges = [
    { label: 'Today', get: () => {
      const today = new Date().toISOString().split('T')[0];
      return { start: today, end: today };
    }},
    { label: 'This Week', get: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      return { start: start.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    }},
    { label: 'This Month', get: () => {
      const start = new Date(); start.setDate(1);
      return { start: start.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    }},
    { label: 'Last Month', get: () => {
      const start = new Date(); start.setMonth(start.getMonth() - 1); start.setDate(1);
      const end = new Date(); end.setDate(0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { label: 'Last 30 Days', get: () => {
      const start = new Date(); start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    }},
    { label: 'This Year', get: () => {
      const start = new Date(new Date().getFullYear(), 0, 1);
      return { start: start.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    }}
  ];

  const setQuickRange = (range) => {
    const { start, end } = range.get();
    setStartDate(start);
    setEndDate(end);
    setShowDatePicker(false);
  };

  const totalOrders = salesData?.summary?.total_orders || 0;
  const totalRevenue = salesData?.summary?.total_revenue || 0;
  const averageOrder = salesData?.summary?.average_order || 0;
  const totalDays = salesData?.daily_sales?.length || 1;

  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      subValue: `${Math.round(totalOrders / totalDays)} per day`,
      icon: ShoppingBag,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Total Revenue",
      value: formatCompactPrice(totalRevenue),
      subValue: `${formatCompactPrice(totalRevenue / totalDays)} per day`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Average Order",
      value: formatCompactPrice(averageOrder),
      subValue: "Per transaction",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Period",
      value: `${totalDays} days`,
      subValue: `${startDate} to ${endDate}`,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  if (loading && !salesData) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <ChartRowSkeleton key={i} />)}
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
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#5C352C]/10 rounded-xl">
                <BarChart3 className="w-5 h-5 text-[#5C352C]" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Sales Report</h1>
            </div>
            <p className="text-sm text-gray-500 ml-11">Track sales performance and revenue trends</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={handleExport}
              disabled={!salesData?.daily_sales?.length}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {card.subValue}
                    </p>
                  </div>
                  <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5C352C]" />
                <span className="font-medium text-gray-700 text-sm">Date Range</span>
              </div>
              
              {isMobile ? (
                <div className="relative" ref={datePickerRef}>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="text-sm">
                      {startDate} to {endDate}
                    </span>
                    {showDatePicker ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showDatePicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-700 text-sm">Quick Select</span>
                          <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {quickRanges.map((range, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuickRange(range)}
                              className="px-3 py-2 text-sm text-[#5C352C] bg-[#E9B48A]/10 hover:bg-[#E9B48A]/30 rounded-lg transition-colors text-left"
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                        <hr className="my-3" />
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">End Date</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 items-center">
                  {quickRanges.slice(0, 4).map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuickRange(range)}
                      className="px-3 py-1.5 text-sm text-[#5C352C] hover:bg-[#E9B48A]/20 rounded-lg transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Sales Chart */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5C352C]" />
                Daily Sales Breakdown
              </h3>
              {!isMobile && (
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="text-sm text-[#5C352C] hover:text-[#956959] transition-colors"
                >
                  {showChart ? 'Hide Chart' : 'Show Chart'}
                </button>
              )}
            </div>
            
            <div className="p-6">
              {error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-600 text-sm">{error}</p>
                  <button onClick={fetchSalesReport} className="mt-3 text-sm text-[#5C352C] hover:underline">
                    Try again
                  </button>
                </div>
              ) : salesData?.daily_sales?.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No sales data available for selected period</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bar Chart */}
                  {showChart && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Date</span>
                        <span className="text-xs text-gray-500">Revenue</span>
                      </div>
                      {salesData?.daily_sales?.map((sale, index) => (
                        <div key={index} className="group">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-600">{sale.date}</span>
                            <span className="font-semibold text-[#5C352C]">{formatCompactPrice(sale.total_sales)}</span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-100 rounded-full h-8">
                              <div
                                className="bg-gradient-to-r from-[#5C352C] to-[#956959] h-8 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${(sale.total_sales / maxTotal) * 100}%` }}
                              >
                                <span className="text-white text-xs font-medium">
                                  {sale.orders_count} orders
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Orders</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Sales</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Avg Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {salesData?.daily_sales?.map((sale, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{sale.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{sale.orders_count}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-[#5C352C]">{formatCompactPrice(sale.total_sales)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{formatCompactPrice(sale.average_order_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Days</p>
                        <p className="font-bold text-gray-900 text-lg">{totalDays}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Orders</p>
                        <p className="font-bold text-gray-900 text-lg">{totalOrders.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Revenue</p>
                        <p className="font-bold text-[#5C352C] text-sm">{formatPrice(totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SalesReport;