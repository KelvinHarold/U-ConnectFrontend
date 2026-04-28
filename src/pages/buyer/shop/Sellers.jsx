import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  Store,
  Package,
  Star,
  Search,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Award,
  MapPin,
  Clock,
  AlertTriangle,
  X,
  Users,
  ChevronLeft,
  BadgeCheck
} from "lucide-react";

// ==================== SKELETON LOADERS ====================
const SkeletonSellerCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative w-full pt-[28%] bg-gradient-to-r from-gray-200 to-gray-300"></div>
      <div className="relative px-3">
        <div className="absolute -top-8 left-3">
          <div className="w-14 h-14 bg-gray-200 rounded-full shadow-lg border-3 border-white"></div>
        </div>
      </div>
      <div className="p-3 pt-9 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="pt-2 border-t border-gray-100 flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-10"></div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonSellersGrid = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {[...Array(count)].map((_, i) => (
      <SkeletonSellerCard key={i} />
    ))}
  </div>
);

// ==================== MAIN COMPONENT ====================
const Sellers = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [logoErrors, setLogoErrors] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(6);
  const [stats, setStats] = useState({ total_sellers: 0, total_products: 0 });

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);
  const refreshButtonRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [currentPage, search]);

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buyer/shop/sellers', {
        params: {
          page: currentPage,
          per_page: perPage,
          search: search || undefined
        }
      });

      console.log('Sellers API Response:', response.data);

      const sellersData = response.data.data || response.data;

      // Log first seller to see available fields
      if (sellersData && sellersData.length > 0) {
        console.log('First seller data:', sellersData[0]);
        console.log('store_logo_url:', sellersData[0].store_logo_url);
        console.log('profile_photo_url:', sellersData[0].profile_photo_url);
        console.log('cover_image:', sellersData[0].cover_image);
      }

      setSellers(sellersData);
      setCurrentPage(response.data.current_page || 1);
      setLastPage(response.data.last_page || 1);
      setTotal(response.data.total || 0);
      setPerPage(response.data.per_page || 6);

      if (response.data.total) {
        setStats({
          total_sellers: response.data.total,
          total_products: sellersData.reduce((sum, seller) => sum + (seller.products_count || 0), 0)
        });
      }

      setImageErrors({});
      setLogoErrors({});
      announceToScreenReader(t('buyer.sellers.foundSellers', { count: response.data.total || 0, s: response.data.total !== 1 ? 's' : '' }));
    } catch (error) {
      console.error('Error fetching sellers:', error);
      const errorMsg = error.response?.data?.message || t('buyer.sellers.failedToLoad');
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setShowSearch(false);
    setCurrentPage(1);
    showToast(t('buyer.sellers.searchCleared'), 'info');
    announceToScreenReader(t('buyer.sellers.searchCleared'));
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      announceToScreenReader(t('buyer.sellers.pageChanged', { current: newPage, total: lastPage }));
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }, []);

  /**
   * Get seller display name for initials
   * Prioritizes store_name over name for the initial
   */
  const getSellerInitials = (seller) => {
    const displayName = seller.store_name || seller.name;
    if (!displayName) return 'S';

    // Get first character
    const firstChar = displayName.trim().charAt(0).toUpperCase();
    return /[A-Z]/i.test(firstChar) ? firstChar : 'S';
  };

  /**
   * Get seller display name for tooltip/text
   */
  const getSellerDisplayName = (seller) => {
    return seller.store_name || seller.name;
  };

  /**
   * Get seller subtitle (owner name if store_name exists, otherwise empty)
   */
  const getSellerSubtitle = (seller) => {
    if (seller.store_name && seller.name) {
      return `${t('buyer.sellers.by')} ${seller.name}`;
    }
    return null;
  };

  /**
   * Get the best available image URL for seller avatar
   * Priority: store_logo_url > profile_photo_url > null
   */
  const getSellerAvatarUrl = (seller) => {
    // Try store_logo_url first (from backend)
    if (seller.store_logo_url && !logoErrors[seller.id]) {
      return seller.store_logo_url;
    }

    // Try profile_photo_url second (from backend)
    if (seller.profile_photo_url && !logoErrors[seller.id]) {
      return seller.profile_photo_url;
    }

    // Try legacy fields if they exist
    if (seller.store_logo && !logoErrors[seller.id]) {
      return seller.store_logo;
    }

    if (seller.profile_photo && !logoErrors[seller.id]) {
      return seller.profile_photo;
    }

    return null;
  };

  /**
   * Get cover image URL
   */
  const getCoverImageUrl = (seller) => {
    if (seller.cover_image && !imageErrors[seller.id]) {
      return seller.cover_image;
    }
    if (seller.cover_image_url && !imageErrors[seller.id]) {
      return seller.cover_image_url;
    }
    return null;
  };

  const handleCoverImageError = (sellerId) => {
    console.log('Cover image failed to load for seller:', sellerId);
    setImageErrors(prev => ({ ...prev, [sellerId]: true }));
  };

  const handleLogoError = (sellerId) => {
    console.log('Logo/Profile image failed to load for seller:', sellerId);
    setLogoErrors(prev => ({ ...prev, [sellerId]: true }));
  };

  const getSellerRating = (seller) => {
    return seller.average_rating ? seller.average_rating.toFixed(1) : '5.0';
  };

  const getRatingsCount = (seller) => {
    return seller.ratings_count || 0;
  };

  const getMemberSince = (seller) => {
    if (seller.created_at) {
      return new Date(seller.created_at).getFullYear();
    }
    return null;
  };

  const refreshSellers = () => {
    setCurrentPage(1);
    fetchSellers();
    announceToScreenReader(t('buyer.sellers.refreshingSellers'));
  };

  const getPaginationPages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(lastPage, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-4 md:p-8">

          {/* Enhanced Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gradient-to-br from-[#5C352C] to-[#8B5E4F] rounded-xl shadow-lg">
                    <Store className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] bg-clip-text text-transparent">
                    {t('buyer.sellers.title')}
                  </h1>
                </div>
                <p className="text-gray-500 text-sm ml-11">{t('buyer.sellers.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100"
                  role="status"
                  aria-label={t('buyer.sellers.statsAria', { sellers: stats.total_sellers, products: stats.total_products })}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{stats.total_sellers}</span>
                      <span className="text-xs text-gray-500">{t('buyer.sellers.sellers')}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200"></div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-[#5C352C]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-gray-700">{stats.total_products}</span>
                      <span className="text-xs text-gray-500">{t('buyer.sellers.products')}</span>
                    </div>
                  </div>
                </div>
                <button
                  ref={refreshButtonRef}
                  onClick={refreshSellers}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] transition-all text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                  aria-label={t('buyer.sellers.refresh')}
                  onKeyPress={(e) => handleKeyPress(e, refreshSellers)}
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  {t('buyer.sellers.refresh')}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <div className="mb-8">
            {(showSearch || !isMobile) && (
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <label htmlFor="seller-search" className="sr-only">{t('buyer.sellers.searchSellers')}</label>
                <input
                  id="seller-search"
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('buyer.sellers.searchPlaceholder')}
                  value={search}
                  onChange={handleSearch}
                  className="w-full pl-11 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all text-sm bg-white shadow-sm"
                  aria-label={t('buyer.sellers.searchSellers')}
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                    aria-label={t('buyer.sellers.clearSearch')}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            {isMobile && !showSearch && (
              <button
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all w-full justify-center text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
                aria-label={t('buyer.sellers.openSearch')}
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                {t('buyer.sellers.searchSellers')}
              </button>
            )}

            {search && (
              <div
                className="mt-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block shadow-sm"
                role="status"
                aria-live="polite"
              >
                {total === 1
                  ? t('buyer.sellers.foundSellers', { count: total, s: '' })
                  : t('buyer.sellers.foundSellers', { count: total, s: 's' })
                } "<span className="font-semibold">{search}</span>"
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <SkeletonSellersGrid count={12} />
          ) : error ? (
            <div
              className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 text-center shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-3" aria-hidden="true" />
              <h3 className="text-lg font-bold text-rose-800 mb-2">{t('buyer.sellers.errorLoading')}</h3>
              <p className="text-rose-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchSellers();
                }}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label={t('buyer.sellers.tryAgain')}
              >
                {t('buyer.sellers.tryAgain')}
              </button>
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center">
              {search ? (
                <>
                  <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.sellers.noSellersFound')}</h3>
                  <p className="text-gray-500 text-sm mb-4">{t('buyer.sellers.noSellersMatch')} "{search}"</p>
                  <button
                    onClick={clearSearch}
                    className="px-6 py-2 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2"
                    aria-label={t('buyer.sellers.clearSearchButton')}
                  >
                    {t('buyer.sellers.clearSearchButton')}
                  </button>
                </>
              ) : (
                <>
                  <Store className="w-20 h-20 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">{t('buyer.sellers.noSellersFound')}</h3>
                  <p className="text-gray-500 text-sm">{t('buyer.sellers.noSellersMessage')}</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Enhanced Sellers Grid */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
                role="list"
                aria-label={t('buyer.sellers.sellers')}
              >
                {sellers.map((seller) => {
                  const displayName = getSellerDisplayName(seller);
                  const subtitle = getSellerSubtitle(seller);
                  const initials = getSellerInitials(seller);
                  const avatarUrl = getSellerAvatarUrl(seller);
                  const coverUrl = getCoverImageUrl(seller);
                  const hasAvatar = !!avatarUrl;
                  const hasCover = !!coverUrl;

                  console.log(`Seller ${seller.id} - Avatar URL:`, avatarUrl, 'Has Avatar:', hasAvatar);

                  return (
                    <Link
                      key={seller.id}
                      to={`/buyer/shop/sellers/${seller.id}/products`}
                      className="group block focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-xl transform transition-all duration-300 hover:scale-105"
                      aria-label={t('buyer.sellers.viewProducts', { name: displayName })}
                    >
                      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 h-full group-hover:border-[#5C352C]/20">

                        {/* Seller Cover/Banner */}
                        <div className="relative w-full pt-[28%] bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] overflow-hidden">
                          <div className="absolute inset-0">
                            {hasCover ? (
                              <img
                                src={coverUrl}
                                alt={t('buyer.sellers.storeCover', { name: displayName })}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={() => handleCoverImageError(seller.id)}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#5C352C] to-[#8B5E4F]" aria-hidden="true">
                                <div className="absolute inset-0 bg-black/10"></div>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true"></div>

                          {/* Verified Badge */}
                          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 shadow-lg z-10">
                            <BadgeCheck className="w-3 h-3 text-white" aria-hidden="true" />
                          </div>
                        </div>

                        {/* Seller Avatar/Logo - Circular */}
                        <div className="relative px-3">
                          <div className="absolute -top-8 left-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5C352C] to-[#956959] flex items-center justify-center text-white font-bold text-lg shadow-xl border-3 border-white overflow-hidden">
                              {hasAvatar ? (
                                <img
                                  src={avatarUrl}
                                  alt={seller.store_logo_url ? t('buyer.sellers.storeLogo', { name: displayName }) : t('buyer.sellers.profileImage', { name: displayName })}
                                  className="w-full h-full object-cover"
                                  onError={() => handleLogoError(seller.id)}
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-white font-bold text-xl" aria-hidden="true">
                                  {initials}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="p-3 pt-9">
                          <div className="mb-2">
                            <h2 className="font-bold text-gray-900 text-sm group-hover:text-[#5C352C] transition-colors line-clamp-1">
                              {displayName}
                            </h2>
                            {subtitle && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{subtitle}</p>
                            )}
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                              <Package className="w-3 h-3 text-[#5C352C]" aria-hidden="true" />
                              <span className="text-xs font-semibold text-gray-700">
                                {seller.products_count || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg" title={`${getRatingsCount(seller)} reviews`}>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                              <span className="text-xs font-semibold text-amber-700">
                                {getSellerRating(seller)}
                              </span>
                              <span className="text-[10px] text-amber-600/70 ml-0.5">({getRatingsCount(seller)})</span>
                            </div>
                          </div>

                          {/* Location */}
                          {seller.location && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2 bg-gray-50 px-2 py-1 rounded-lg">
                              <MapPin className="w-3 h-3 text-gray-400" aria-hidden="true" />
                              <span className="text-xs line-clamp-1">{seller.location}</span>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" aria-hidden="true" />
                              <span className="text-xs text-gray-500 font-medium">
                                {getMemberSince(seller) ? `${t('buyer.sellers.since')} ${getMemberSince(seller)}` : t('buyer.sellers.newSeller')}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#5C352C] flex items-center gap-1 group-hover:gap-2 transition-all bg-[#5C352C]/5 px-2 py-1 rounded-lg">
                              {t('buyer.sellers.shop')}
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Component */}
              {lastPage > 1 && (
                <nav
                  className="mt-10 flex justify-center items-center gap-3"
                  role="navigation"
                  aria-label={t('buyer.sellers.goToPage', { page: '' })}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                      }`}
                    aria-label={t('buyer.sellers.goToPreviousPage')}
                    aria-disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <div className="flex items-center gap-2">
                    {getPaginationPages().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${currentPage === page
                            ? 'bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white shadow-lg'
                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C]'
                          }`}
                        aria-label={t('buyer.sellers.goToPage', { page })}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${currentPage === lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-[#5C352C] shadow-md'
                      }`}
                    aria-label={t('buyer.sellers.goToNextPage')}
                    aria-disabled={currentPage === lastPage}
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </nav>
              )}

              {/* Showing results info */}
              <div
                className="mt-4 text-center text-sm text-gray-500 bg-white px-4 py-2 rounded-lg inline-block mx-auto shadow-sm"
                role="status"
                aria-live="polite"
              >
                {t('buyer.sellers.showing')} <span className="font-semibold text-[#5C352C]">{sellers.length}</span> {t('buyer.sellers.of')} <span className="font-semibold">{total}</span> {total === 1 ? t('buyer.sellers.seller') : t('buyer.sellers.sellers')}
                {search && ` ${t('buyer.sellers.matching').toLowerCase().replace('matching', '')}"${search}"`}
              </div>

              {/* Featured Sellers Banner */}
              {!search && sellers.length > 3 && (
                <div className="mt-8 bg-gradient-to-r from-[#5C352C] via-[#7A4B3A] to-[#8B5E4F] rounded-xl p-5 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{t('buyer.sellers.trustedSellers')}</h3>
                        <p className="text-white/90 text-xs">{t('buyer.sellers.trustedSellersDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      <span className="text-sm font-semibold">{stats.total_sellers}+ {t('buyer.sellers.activeSellers')}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Sellers;