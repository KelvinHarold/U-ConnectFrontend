// import React, { useState, useEffect, useCallback, useRef } from "react";
// import MainLayout from "../../../layouts/MainLayout";
// import api from "../../../api/axios";
// import { Link } from "react-router-dom";
// import { useLanguage } from "../../../contexts/LanguageContext";
// import {
//   ShoppingBag,
//   Heart,
//   Clock,
//   TrendingUp,
//   Star,
//   AlertTriangle,
//   RefreshCw,
//   ChevronRight,
//   ShoppingCart,
//   Tag,
//   MapPin,
//   Eye,
//   Package,
//   DollarSign,
//   Award,
//   Zap,
//   Calendar,
//   CheckCircle,
//   TruckIcon,
//   PieChart
// } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell
// } from 'recharts';

// // ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
// const shimmerStyle = `
//   @keyframes shimmer {
//     0% {
//       background-position: -200% 0;
//     }
//     100% {
//       background-position: 200% 0;
//     }
//   }
//   .animate-shimmer {
//     animation: shimmer 1.5s ease-in-out infinite;
//     background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
//     background-size: 200% 100%;
//   }
// `;

// // ==================== SKELETON LOADERS ====================
// const SkeletonStatCard = () => (
//   <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
//     <div className="flex items-start justify-between">
//       <div className="space-y-2">
//         <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
//         <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
//         <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
//       </div>
//       <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
//     </div>
//   </div>
// );

// const SkeletonChart = () => (
//   <div className="bg-white rounded-xl border border-gray-100 p-4 overflow-hidden">
//     <div className="flex justify-between mb-4">
//       <div>
//         <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28"></div>
//         <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-36 mt-1"></div>
//       </div>
//       <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
//     </div>
//     <div className="h-[240px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
//   </div>
// );

// const SkeletonRecommendedProduct = () => (
//   <div className="p-4 flex items-center gap-3 overflow-hidden">
//     <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl"></div>
//     <div className="flex-1 space-y-2">
//       <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
//       <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
//     </div>
//     <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg w-24"></div>
//   </div>
// );

// const SkeletonOrderRow = () => (
//   <div className="flex items-center gap-4 p-4 border-b border-gray-100 overflow-hidden">
//     <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
//     <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
//     <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
//     <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-20"></div>
//     <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 ml-auto"></div>
//   </div>
// );

// // ==================== MAIN COMPONENT ====================
// const BuyerDashboard = () => {
//   const { t } = useLanguage();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [imageErrors, setImageErrors] = useState({});

//   const refreshButtonRef = useRef(null);

//   // Add shimmer style to document head
//   useEffect(() => {
//     if (!document.querySelector('#shimmer-styles-buyer-dashboard')) {
//       const style = document.createElement('style');
//       style.id = 'shimmer-styles-buyer-dashboard';
//       style.textContent = shimmerStyle;
//       document.head.appendChild(style);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/buyer/dashboard');
//       setDashboardData(response.data);
//       setError(null);
//       setImageErrors({});
//     } catch (err) {
//       setError(err.response?.data?.message || t('buyerDashboard.errorLoading'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchDashboardData();
//     setRefreshing(false);
//   };

//   const formatPrice = (price) => `Tsh ${Number(price || 0).toLocaleString()}`;

//   const getStatusStyle = (status) => {
//     const styles = {
//       pending: "bg-amber-50 text-amber-700 border-amber-100",
//       delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
//       cancelled: "bg-rose-50 text-rose-700 border-rose-100",
//       processing: "bg-blue-50 text-blue-700 border-blue-100",
//       confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
//       preparing: "bg-purple-50 text-purple-700 border-purple-100",
//       ready_for_delivery: "bg-orange-50 text-orange-700 border-orange-100",
//     };
//     return styles[status] || "bg-gray-50 text-gray-700 border-gray-100";
//   };

//   const getStatusLabel = (status) => {
//     const labels = {
//       pending: t('buyerDashboard.statusPending'),
//       delivered: t('buyerDashboard.statusDelivered'),
//       cancelled: t('buyerDashboard.statusCancelled'),
//       processing: t('buyerDashboard.statusProcessing'),
//       confirmed: t('buyerDashboard.statusConfirmed'),
//       preparing: t('buyerDashboard.statusPreparing'),
//       ready_for_delivery: t('buyerDashboard.statusReady'),
//     };
//     return labels[status] || status?.toUpperCase() || t('buyerDashboard.statusUnknown');
//   };

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//       return imagePath;
//     }
//     return imagePath;
//   };

//   const handleImageError = (productId) => {
//     setImageErrors(prev => ({ ...prev, [productId]: true }));
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="p-6 bg-gray-50 min-h-screen">
//           <div className="max-w-7xl mx-auto">
//             <div className="mb-6">
//               <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-48 mb-2"></div>
//               <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-64"></div>
//             </div>
//             <div className="h-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl mb-6"></div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//               {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//               <div className="lg:col-span-2">
//                 <SkeletonChart />
//               </div>
//               <div>
//                 <SkeletonChart />
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
//               <div className="p-4 border-b border-gray-100">
//                 <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
//               </div>
//               <div className="divide-y divide-gray-100">
//                 {[1, 2, 3, 4].map(i => <SkeletonRecommendedProduct key={i} />)}
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//               <div className="p-4 border-b border-gray-100">
//                 <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
//               </div>
//               <div className="divide-y divide-gray-100">
//                 {[1, 2, 3, 4, 5].map(i => <SkeletonOrderRow key={i} />)}
//               </div>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error) {
//     return (
//       <MainLayout>
//         <div className="p-6 bg-gray-50 min-h-screen">
//           <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 p-8 text-center">
//             <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
//             <h3 className="text-base font-semibold text-gray-900 mb-1">{t('buyerDashboard.errorTitle')}</h3>
//             <p className="text-sm text-gray-500 mb-4">{error}</p>
//             <button onClick={handleRefresh} className="px-4 py-2 bg-[#5C352C] text-white rounded-lg text-sm">
//               {t('buyerDashboard.tryAgain')}
//             </button>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   const { stats, recent_orders, monthly_spending, recommended_products, order_status_distribution } = dashboardData || {};

//   const lineChartData = monthly_spending?.map(spending => ({
//     month: new Date(2024, spending.month - 1).toLocaleString('default', { month: 'short' }),
//     amount: spending.amount,
//     orders: spending.order_count
//   })) || [];

//   const pieChartData = order_status_distribution?.filter(item => item.value > 0) || [];

//   const pieChartColors = ['#5C352C', '#8B5E4F', '#A8786A', '#C49A8C', '#E9B48A'];

//   const statCards = [
//     {
//       title: t('buyerDashboard.orders'),
//       value: stats?.total_orders || 0,
//       subValue: `${stats?.pending_orders || 0} ${t('buyerDashboard.pending')}`,
//       icon: ShoppingBag,
//       color: "text-blue-600",
//       bg: "bg-blue-50",
//       link: "/buyer/orders"
//     },
//     {
//       title: t('buyerDashboard.cartItems'),
//       value: stats?.cart_items || 0,
//       subValue: t('buyerDashboard.readyToCheckout'),
//       icon: ShoppingCart,
//       color: "text-amber-600",
//       bg: "bg-amber-50",
//       link: "/cart"
//     },
//     {
//       title: t('buyerDashboard.avgOrder'),
//       value: formatPrice(stats?.avg_order_value || 0),
//       subValue: t('buyerDashboard.perTransaction'),
//       icon: TrendingUp,
//       color: "text-purple-600",
//       bg: "bg-purple-50",
//       link: "/buyer/orders"
//     }
//   ];

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
//           <p className="text-xs font-medium text-gray-500">{label}</p>
//           <p className="text-sm font-bold text-[#5C352C]">Tsh {payload[0].value.toLocaleString()}</p>
//           {payload[0].payload.orders && (
//             <p className="text-[10px] text-gray-400">{payload[0].payload.orders} {t('buyerDashboard.orders')}</p>
//           )}
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <MainLayout>
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="max-w-7xl mx-auto">
          
//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-xl font-semibold text-gray-900">{t('buyerDashboard.dashboard')}</h1>
//             <p className="text-sm text-gray-500 mt-1">{t('buyerDashboard.welcomeMessage')}</p>
//           </div>

//           {/* Welcome Banner */}
//           <div className="bg-gradient-to-r from-[#5C352C] to-[#7A4B3E] rounded-xl p-5 mb-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-lg font-semibold text-white mb-1">{t('buyerDashboard.welcomeBack')} 👋</h2>
//                 <p className="text-white/70 text-sm">{t('buyerDashboard.readyToDiscover')}</p>
//               </div>
//               <Link to="/buyer/shop/products" className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
//                 {t('buyerDashboard.startShopping')}
//               </Link>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//             {statCards.map((card, i) => (
//               <Link to={card.link} key={i} className="block">
//                 <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
//                       <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
//                       <p className="text-[10px] text-gray-400 mt-1">{card.subValue}</p>
//                     </div>
//                     <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
//                       <card.icon className="w-5 h-5" />
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>

//           {/* Charts Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
//             {/* Spending Chart */}
//             <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-900">{t('buyerDashboard.spendingTrend')}</h3>
//                   <p className="text-xs text-gray-500 mt-0.5">{t('buyerDashboard.monthlyHistory')}</p>
//                 </div>
//                 <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
//                   <option>{t('buyerDashboard.last12Months')}</option>
//                 </select>
//               </div>
//               <div className="h-[260px]">
//                 {lineChartData.length > 0 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={lineChartData}>
//                       <defs>
//                         <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="5%" stopColor="#5C352C" stopOpacity={0.8}/>
//                           <stop offset="95%" stopColor="#5C352C" stopOpacity={0.1}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
//                       <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `Tsh ${v/1000}k`} />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Area type="monotone" dataKey="amount" stroke="#5C352C" strokeWidth={2} fill="url(#colorAmount)" />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="h-full flex items-center justify-center text-gray-400">
//                     <div className="text-center">
//                       <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
//                       <p className="text-xs">{t('buyerDashboard.noSpendingData')}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Order Status Chart */}
//             <div className="bg-white rounded-xl border border-gray-100 p-4">
//               <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('buyerDashboard.orderStatus')}</h3>
//               <div className="h-[200px] relative">
//                 {pieChartData.length > 0 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <RechartsPieChart>
//                       <Pie
//                         data={pieChartData}
//                         innerRadius={45}
//                         outerRadius={70}
//                         dataKey="value"
//                         stroke="white"
//                         strokeWidth={2}
//                       >
//                         {pieChartData.map((entry, index) => (
//                           <Cell key={index} fill={pieChartColors[index % pieChartColors.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip formatter={(value) => [`${value} ${t('buyerDashboard.orders')}`, '']} />
//                     </RechartsPieChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div className="h-full flex items-center justify-center text-gray-400">
//                     <div className="text-center">
//                       <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
//                       <p className="text-xs">{t('buyerDashboard.noOrderData')}</p>
//                     </div>
//                   </div>
//                 )}
//                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                   <span className="text-xl font-bold text-gray-900">{stats?.total_orders || 0}</span>
//                   <span className="text-[10px] text-gray-500">{t('buyerDashboard.total')}</span>
//                 </div>
//               </div>
//               <div className="mt-3 grid grid-cols-2 gap-2">
//                 {pieChartData.slice(0, 4).map((item, idx) => (
//                   <div key={idx} className="flex items-center justify-between text-xs">
//                     <span className="text-gray-500">{item.name}</span>
//                     <span className="font-medium text-gray-900">{item.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Recommended Products */}
//           <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
//             <div className="p-4 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                   <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
//                   {t('buyerDashboard.recommendedForYou')}
//                 </h3>
//                 <p className="text-[10px] text-gray-500 mt-0.5">{t('buyerDashboard.basedOnHistory')}</p>
//               </div>
//               <Link to="/buyer/shop/products" className="text-xs text-[#5C352C] font-medium hover:underline">
//                 {t('buyerDashboard.browseAll')} →
//               </Link>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {recommended_products?.slice(0, 4).map((product, idx) => {
//                 const imageUrl = getImageUrl(product.image);
//                 const hasImageError = imageErrors[product.id];
                
//                 return (
//                   <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
//                     <div className="flex items-center gap-3 flex-1">
//                       <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
//                         {imageUrl && !hasImageError ? (
//                           <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => handleImageError(product.id)} loading="lazy" />
//                         ) : (
//                           <Package className="w-5 h-5 text-gray-400" />
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{product.name}</p>
//                         <p className="text-sm font-semibold text-[#5C352C]">{formatPrice(product.price)}</p>
//                       </div>
//                     </div>
//                     <Link to={`/buyer/shop/products/${product.id}`} className="px-3 py-1.5 text-xs font-medium text-white bg-[#5C352C] rounded-lg hover:bg-[#4A2A22] transition-colors">
//                       {t('buyerDashboard.view')}
//                     </Link>
//                   </div>
//                 );
//               })}
//               {(!recommended_products || recommended_products.length === 0) && (
//                 <div className="p-8 text-center text-gray-400">
//                   <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
//                   <p className="text-sm">{t('buyerDashboard.noRecommendations')}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recent Orders */}
//           <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//             <div className="p-4 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
//                   <TruckIcon className="w-4 h-4 text-[#5C352C]" />
//                   {t('buyerDashboard.recentOrders')}
//                 </h3>
//                 <p className="text-[10px] text-gray-500 mt-0.5">{t('buyerDashboard.trackPurchases')}</p>
//               </div>
//               <Link to="/buyer/orders" className="text-xs text-[#5C352C] font-medium hover:underline">
//                 {t('buyerDashboard.viewAll')} →
//               </Link>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-100">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">{t('buyerDashboard.order')}</th>
//                     <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">{t('buyerDashboard.date')}</th>
//                     <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">{t('buyerDashboard.items')}</th>
//                     <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase">{t('buyerDashboard.status')}</th>
//                     <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase">{t('buyerDashboard.total')}</th>
//                     <th className="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase"></th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {recent_orders?.slice(0, 5).map((order, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-4 py-3 text-xs font-mono font-medium text-gray-900">#{order.order_number}</td>
//                       <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
//                       <td className="px-4 py-3 text-xs text-gray-600">{order.item_count || 0} {t('buyerDashboard.itemsUnit')}</td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyle(order.status)}`}>
//                           {getStatusLabel(order.status)}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900">{formatPrice(order.total)}</td>
//                       <td className="px-4 py-3 text-center">
//                         <Link to={`/buyer/orders/${order.id}`} className="text-gray-400 hover:text-[#5C352C] transition-colors">
//                           <Eye className="w-4 h-4" />
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                   {(!recent_orders || recent_orders.length === 0) && (
//                     <tr>
//                       <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
//                         <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
//                         <p className="text-sm">{t('buyerDashboard.noOrdersYet')}</p>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default BuyerDashboard;