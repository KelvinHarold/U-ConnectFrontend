import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import api from "../api/axios";
import { 
  FiSearch, FiX, FiStar, FiShoppingCart, FiPlus, FiChevronRight, 
  FiChevronLeft, FiGrid, FiPackage, FiUsers, FiTruck, FiShield, 
  FiLock, FiMessageCircle, FiHome, FiBox, FiTag, FiMenu, 
  FiImage, FiCheck, FiArrowRight, FiArrowLeft, FiHeart, FiEye,
  FiMinus, FiLogIn, FiUserPlus, FiMail, FiPhone, FiMapPin
} from "react-icons/fi";
import { 
  BsBoxSeam, BsShop, BsCartCheck, BsStars, BsShieldCheck, 
  BsLightningCharge, BsHeadset, BsGem, BsAward, BsTrophy,
  BsChevronDown, BsChevronUp, BsEye, BsHeart
} from "react-icons/bs";
import { 
  FaStar, FaShoppingCart, FaPlus, FaMinus,
  FaChevronRight, FaChevronLeft, FaArrowRight
} from "react-icons/fa";
import { MdCategory, MdStore, MdVerified, MdClose } from "react-icons/md";
import { IoMdCheckmark, IoMdClose, IoMdAdd, IoMdRemove } from "react-icons/io";
import DiscountBadge from "../components/common/DiscountBadge";

// ==================== SKELETON LOADERS ====================
const SkeletonProductCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
      <div className="relative w-full pt-[110%] bg-gradient-to-br from-stone-100 to-stone-200"></div>
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-stone-200 rounded-full w-3/4"></div>
        <div className="h-2.5 bg-stone-100 rounded-full w-1/2"></div>
        <div className="h-5 bg-stone-200 rounded-full w-1/3 mt-1"></div>
        <div className="h-9 bg-stone-200 rounded-xl w-full mt-3"></div>
      </div>
    </div>
  </div>
);

const SkeletonCategoryCard = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-stone-100 to-stone-200"></div>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-200 rounded-full w-2/3"></div>
        <div className="h-2.5 bg-stone-100 rounded-full w-1/2"></div>
      </div>
    </div>
  </div>
);

const SkeletonHero = () => (
  <div className="animate-pulse h-[520px] bg-gradient-to-r from-[#3D1F18] to-[#7A4F3A]"></div>
);

// ==================== TOAST COMPONENT ====================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <IoMdCheckmark className="w-5 h-5" />,
    error: <MdClose className="w-5 h-5" />,
    info: <FiMessageCircle className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className="fixed top-24 right-4 z-[100] animate-slide-in">
      <div className={`${colors[type]} rounded-xl shadow-2xl px-5 py-4 flex items-center gap-3 min-w-[280px] max-w-md backdrop-blur-sm`}>
        <div className="flex-shrink-0 text-white">
          {icons[type]}
        </div>
        <p className="text-white font-medium text-sm flex-1">{message}</p>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <MdClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCartWithAuth } = useContext(AuthContext);
  const { t } = useLanguage();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Subcategories pagination states
  const [subcategoriesPagination, setSubcategoriesPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0
  });
  const [subcategoriesPage, setSubcategoriesPage] = useState(1);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [addingFromModal, setAddingFromModal] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const mobileMenuRef = useRef(null);
  const modalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([
      fetchFeaturedProducts(),
      fetchSubcategories(subcategoriesPage),
      fetchStats(),
      fetchProducts(1)
    ]).then(() => setInitialLoading(false))
      .catch(() => setInitialLoading(false));

    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, []);

  // Fetch subcategories when page changes
  useEffect(() => {
    fetchSubcategories(subcategoriesPage);
  }, [subcategoriesPage]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ['home', 'products', 'about'];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollSpy);
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e) => { if (e.key === 'Escape' && isModalOpen) closeModal(); };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen]);

  const handleClickOutside = useCallback((event) => {
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMobileMenuOpen)
      setIsMobileMenuOpen(false);
    if (modalRef.current && !modalRef.current.contains(event.target) && isModalOpen) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  }, [isMobileMenuOpen, isModalOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await api.get("/landing/products/featured?limit=4");
      setFeaturedProducts(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchSubcategories = async (page = 1) => {
    setLoadingSubcategories(true);
    try {
      const res = await api.get(`/landing/subcategories?page=${page}&per_page=8`);
      if (res.data.pagination) {
        setSubcategories(res.data.data || []);
        setSubcategoriesPagination({
          current_page: res.data.pagination.current_page,
          last_page: res.data.pagination.last_page,
          per_page: res.data.pagination.per_page,
          total: res.data.pagination.total
        });
      } else {
        setSubcategories(res.data.data || []);
      }
    } catch (e) { 
      console.error(e);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/landing/stats");
      setStats(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async (page = 1, categoryId = null, search = "") => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      let url = `/landing/products?per_page=12&page=${page}`;
      if (categoryId) url = `/landing/categories/${categoryId}/products?per_page=12&page=${page}`;
      if (search) url = `/landing/products?search=${encodeURIComponent(search)}&per_page=12&page=${page}`;
      const res = await api.get(url, { signal: abortControllerRef.current.signal });
      setAllProducts(res.data.data || []);
      setPagination({
        current_page: res.data.pagination?.current_page || 1,
        last_page: res.data.pagination?.last_page || 1,
        per_page: res.data.pagination?.per_page || 12,
        total: res.data.pagination?.total || 0
      });
      setCurrentPage(res.data.pagination?.current_page || 1);
      setImageErrors({});
      if (page !== 1) document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') showToast(t('landing.toast.failedToLoad'), "error");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      const result = await addToCartWithAuth(productId, quantity);
      if (result.requiresLogin) {
        showToast(t('landing.toast.pleaseLogin'), "info");
        setTimeout(() => navigate("/login"), 1500);
      } else if (result.success) {
        showToast(t('landing.toast.addedToCart'), "success");
      }
    } catch (e) {
      showToast(t('landing.toast.failedToAdd'), "error");
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddFromModal = async () => {
    if (!selectedProduct) return;
    setAddingFromModal(true);
    try {
      const result = await addToCartWithAuth(selectedProduct.id, modalQuantity);
      if (result.requiresLogin) {
        showToast(t('landing.toast.pleaseLogin'), "info");
        setTimeout(() => { navigate("/login"); closeModal(); }, 1500);
      } else if (result.success) {
        const productName = selectedProduct.name.substring(0, 30) + (selectedProduct.name.length > 30 ? '...' : '');
        showToast(t('landing.toast.addedToCartWithQuantity', { quantity: modalQuantity, product: productName }), "success");
        closeModal();
      }
    } catch (e) {
      showToast(t('landing.toast.failedToAdd'), "error");
    } finally {
      setAddingFromModal(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalQuantity(1);
    setActiveImage(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setModalQuantity(1);
  };

  const handleSubcategorySelect = async (subcategoryId, subcategoryName) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
      setSearchTerm("");
      await fetchProducts(1, null, "");
    } else {
      setSelectedSubcategory(subcategoryId);
      setSearchTerm("");
      await fetchProducts(1, subcategoryId, "");
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length > 2 || term.length === 0) {
      setSelectedSubcategory(null);
      await fetchProducts(1, null, term.length === 0 ? "" : term);
    }
  };

  const clearFilters = async () => {
    setSelectedSubcategory(null);
    setSearchTerm("");
    await fetchProducts(1, null, "");
  };

  const goToPage = (page) => {
    if (page !== currentPage && page >= 1 && page <= pagination.last_page) {
      if (selectedSubcategory) fetchProducts(page, selectedSubcategory, "");
      else if (searchTerm) fetchProducts(page, null, searchTerm);
      else fetchProducts(page, null, "");
    }
  };

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    setActiveSection(sectionId);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyPress = useCallback((event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
  }, []);

  // Pagination handlers for subcategories
  const loadMoreSubcategories = () => {
    if (subcategoriesPage < subcategoriesPagination.last_page && !loadingSubcategories) {
      setSubcategoriesPage(prev => prev + 1);
    }
  };

  const loadPreviousSubcategories = () => {
    if (subcategoriesPage > 1 && !loadingSubcategories) {
      setSubcategoriesPage(prev => prev - 1);
    }
  };

  const handleImageError = (productId) =>
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  const handleSubcategoryImageError = (id) =>
    setImageErrors(prev => ({ ...prev, [`sub_${id}`]: true }));

  const formatPrice = (price) => `Tsh ${Number(price).toLocaleString('en-US')}`;

  const incrementModalQuantity = () => {
    if (selectedProduct && modalQuantity < selectedProduct.quantity) setModalQuantity(modalQuantity + 1);
  };
  const decrementModalQuantity = () => { if (modalQuantity > 1) setModalQuantity(modalQuantity - 1); };

  const getProductImages = () => {
    if (!selectedProduct) return [];
    if (selectedProduct.images?.length > 0) return selectedProduct.images;
    if (selectedProduct.image) return [selectedProduct.image];
    return [];
  };

  // ==================== PRODUCT CARD ====================
  const ProductCard = ({ product }) => (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-product hover:shadow-product-hover transition-all duration-500 flex flex-col h-full border border-stone-100 hover:border-amber-200 hover:-translate-y-1">
      <div
        onClick={() => openProductModal(product)}
        className="cursor-pointer relative w-full pt-[100%] bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 overflow-hidden"
        role="button" tabIndex={0}
        onKeyPress={(e) => handleKeyPress(e, () => openProductModal(product))}
        aria-label={`${t('landing.productsSection.viewDetails')} ${product.name}`}
      >
        <div className="absolute inset-0">
          {product.image && !imageErrors[product.id] ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => handleImageError(product.id)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100">
              <FiImage className="w-10 h-10 text-stone-400" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount_percentage > 0 && (
            <DiscountBadge percentage={product.discount_percentage} className="shadow-md" />
          )}
          {product.is_featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm tracking-wide uppercase flex items-center gap-1">
              <FaStar className="w-2 h-2" /> {t('landing.productsSection.featured')}
            </span>
          )}
        </div>

        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-stone-800 text-white tracking-widest uppercase">
              {t('landing.productsSection.soldOut')}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="whitespace-nowrap px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-stone-700 rounded-full shadow-sm border border-stone-200 flex items-center gap-1">
            <FiEye className="w-2.5 h-2.5" /> {t('landing.productsSection.quickView')}
          </span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <div
          onClick={() => openProductModal(product)}
          className="cursor-pointer flex-1"
          role="button" tabIndex={0}
          onKeyPress={(e) => handleKeyPress(e, () => openProductModal(product))}
        >
          <h3 className="font-semibold text-stone-800 text-[11px] mb-1 leading-snug hover:text-[#5C352C] transition-colors line-clamp-2 min-h-[30px] tracking-wide">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <FaStar key={i} className={`w-2.5 h-2.5 ${i <= Math.round(product.average_rating || 5) ? 'text-amber-400' : 'text-stone-200'}`} />
          ))}
          <span className="text-[9px] text-stone-500 ml-0.5 font-semibold">{product.average_rating ? product.average_rating.toFixed(1) : '5.0'}</span>
          <span className="text-[9px] text-stone-400 ml-0.5">({product.sales_count || 0} {t('common.results')})</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-bold text-[#5C352C] text-sm tracking-tight">{formatPrice(product.discount_percentage > 0 ? product.discounted_price : product.price)}</span>
            {product.discount_percentage > 0 && (
              <span className="text-[10px] text-stone-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button
            onClick={() => handleAddToCart(product.id, 1)}
            disabled={product.quantity === 0 || addingToCart[product.id]}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#5C352C] ${
              product.quantity === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-[#5C352C] text-white hover:bg-[#3D1F18] shadow-sm hover:shadow-md active:scale-95'
            }`}
            aria-label={product.quantity === 0 ? t('landing.productsSection.outOfStock') : `${t('landing.productsSection.addToCart')} ${product.name}`}
          >
            {addingToCart[product.id] ? (
              <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FaPlus className="w-3 h-3" />
                {product.quantity === 0 ? t('landing.productsSection.soldOut') : t('landing.productsSection.addToCart')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== CATEGORY CARD ====================
  const CategoryCard = ({ category }) => {
    const productCount = category.products_count || 0;
    const isSelected = selectedSubcategory === category.id;

    const palettes = [
      'from-[#5C352C] to-[#956959]',
      'from-[#3D1F18] to-[#C07A50]',
      'from-[#7A4F3A] to-[#E9B48A]',
      'from-[#2C1A14] to-[#956959]',
      'from-[#956959] to-[#E9B48A]',
      'from-[#4A2A22] to-[#C07A50]',
    ];
    const paletteIndex = (category.id || 0) % palettes.length;

    return (
      <button
        onClick={() => handleSubcategorySelect(category.id, category.name)}
        className="group w-full text-left focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 rounded-2xl"
        aria-label={`${t('landing.categories.browse')} ${category.name} — ${productCount} ${productCount === 1 ? t('landing.categories.productCount') : t('landing.categories.productsCount')}`}
      >
        <div className={`relative rounded-2xl overflow-hidden transition-all duration-400 ${
          isSelected
            ? 'ring-2 ring-[#5C352C] ring-offset-2 shadow-xl scale-[1.02]'
            : 'hover:shadow-xl hover:-translate-y-1'
        }`}>
          <div className="relative w-full pt-[100%] overflow-hidden">
            {category.image && !imageErrors[`sub_${category.id}`] ? (
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => handleSubcategoryImageError(category.id)}
                loading="lazy"
              />
            ) : (
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${palettes[paletteIndex]} flex items-center justify-center`}>
                <MdCategory className="w-10 h-10 text-white/30" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-bold text-white text-sm line-clamp-1 drop-shadow-md tracking-wide">
                {category.name}
              </h3>
              <p className="text-white/70 text-[10px] mt-0.5 font-medium">
                {productCount} {productCount === 1 ? t('landing.categories.productCount') : t('landing.categories.productsCount')}
              </p>
            </div>

            {isSelected && (
              <div className="absolute top-2.5 right-2.5">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                  <IoMdCheckmark className="w-3 h-3 text-[#5C352C]" />
                </div>
              </div>
            )}
          </div>

          <div className={`px-3 py-2 flex items-center justify-between transition-colors duration-300 ${
            isSelected ? 'bg-[#5C352C]' : 'bg-white group-hover:bg-stone-50'
          }`}>
            {category.description ? (
              <p className={`text-[9px] line-clamp-1 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                {category.description}
              </p>
            ) : (
              <span className={`text-[9px] font-semibold uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                {isSelected ? t('landing.categories.selected') : t('landing.categories.browse')}
              </span>
            )}
            <FaChevronRight className={`w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-0.5 ${isSelected ? 'text-white' : 'text-[#5C352C]'}`} />
          </div>
        </div>
      </button>
    );
  };

  // ==================== PAGINATION ====================
  const Pagination = () => {
    const { current_page, last_page } = pagination;
    const maxVisible = 5;
    let startPage = Math.max(1, current_page - Math.floor(maxVisible / 2));
    let endPage = Math.min(last_page, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    if (last_page <= 1) return null;

    return (
      <nav className="flex flex-wrap justify-center items-center gap-2 mt-10" aria-label="Pagination">
        <button onClick={() => goToPage(current_page - 1)} disabled={current_page === 1}
          className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white flex items-center gap-1">
          <FaChevronLeft className="w-3 h-3" /> {t('common.previous')}
        </button>
        {pages.map(page => (
          <button key={page} onClick={() => goToPage(page)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
              current_page === page
                ? 'bg-[#5C352C] text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}>
            {page}
          </button>
        ))}
        <button onClick={() => goToPage(current_page + 1)} disabled={current_page === last_page}
          className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white flex items-center gap-1">
          {t('common.next')} <FaChevronRight className="w-3 h-3" />
        </button>
      </nav>
    );
  };

  // ==================== PRODUCT MODAL ====================
  const ProductModal = () => {
    if (!selectedProduct) return null;
    const productImages = getProductImages();

    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="min-h-screen px-2 py-4 sm:py-6 flex items-end sm:items-center justify-center">
          <div
            ref={modalRef}
            className="
              relative bg-white rounded-2xl shadow-2xl 
              w-full max-w-md sm:max-w-xl md:max-w-3xl
              max-h-[90vh] overflow-y-auto 
              animate-modal-in
            "
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors"
              aria-label={t('landing.modal.close')}
            >
              <MdClose className="w-4 h-4 text-stone-600" />
            </button>

            <div className="flex flex-col md:grid md:grid-cols-2">
              <div
                className="
                  relative bg-gradient-to-br from-stone-50 to-amber-50/30 
                  rounded-t-2xl md:rounded-l-3xl md:rounded-tr-none 
                  min-h-[200px] sm:min-h-[240px] md:min-h-[280px]
                  flex items-center justify-center 
                  p-4 sm:p-6 md:p-8
                "
              >
                {productImages[activeImage] ? (
                  <img
                    src={productImages[activeImage]}
                    alt={selectedProduct.name}
                    className="max-w-full max-h-56 sm:max-h-64 object-contain"
                  />
                ) : (
                  <div className="text-stone-300 flex flex-col items-center">
                    <FiImage className="w-12 h-12" />
                    <p className="text-sm mt-2">{t('landing.modal.noImage')}</p>
                  </div>
                )}

                {selectedProduct.discount_percentage > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <DiscountBadge percentage={selectedProduct.discount_percentage} className="shadow-lg scale-110" />
                  </div>
                )}

                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === activeImage ? 'bg-[#5C352C] w-3' : 'bg-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 md:p-8 flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">
                  {selectedProduct.name}
                </h2>

                <div className="flex items-baseline gap-3 mb-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#5C352C]">
                    {formatPrice(selectedProduct.discount_percentage > 0 ? selectedProduct.discounted_price : selectedProduct.price)}
                  </div>
                  {selectedProduct.discount_percentage > 0 && (
                    <div className="text-sm sm:text-base text-stone-400 line-through">
                      {formatPrice(selectedProduct.price)}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedProduct.quantity === 0
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {selectedProduct.quantity === 0
                      ? t('landing.modal.outOfStock')
                      : t('landing.modal.inStock', { quantity: selectedProduct.quantity })}
                  </span>
                </div>

                {selectedProduct.description && (
                  <p className="text-stone-500 text-sm mb-4 line-clamp-3">
                    {selectedProduct.description}
                  </p>
                )}

                {selectedProduct.quantity > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-stone-700 mb-2 block">
                      {t('landing.modal.quantity')}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                        <button
                          onClick={decrementModalQuantity}
                          disabled={modalQuantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">
                          {modalQuantity}
                        </span>
                        <button
                          onClick={incrementModalQuantity}
                          disabled={modalQuantity >= selectedProduct.quantity}
                          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddFromModal}
                  disabled={addingFromModal || selectedProduct.quantity === 0}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#5C352C] text-white hover:bg-[#3D1F18] transition flex items-center justify-center gap-2"
                >
                  {addingFromModal ? (
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : selectedProduct.quantity === 0 ? (
                    t('landing.modal.outOfStock')
                  ) : (
                    <>
                      <FiShoppingCart className="w-3.5 h-3.5" />
                      {t('landing.modal.addToCart')} · {formatPrice((selectedProduct.discount_percentage > 0 ? selectedProduct.discounted_price : selectedProduct.price) * modalQuantity)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <SkeletonHero />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="animate-pulse h-16 bg-stone-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonCategoryCard key={i} />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <SkeletonProductCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-body">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      {isModalOpen && <ProductModal />}

      {/* HEADER */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#5C352C] rounded-lg">
              <img src="/U-Connect Logo.png" alt="U-Connect Logo" className="h-9 w-auto object-contain" />
              <span className="text-lg font-display font-bold text-stone-800 tracking-tight">U-Connect</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {['home', 'products', 'about'].map(section => (
                <button key={section} onClick={() => scrollToSection(section)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize focus:outline-none focus:ring-2 focus:ring-[#5C352C] flex items-center gap-1.5 ${
                    activeSection === section
                      ? 'text-[#5C352C] bg-[#5C352C]/8 font-semibold'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                  }`}>
                  {section === 'home' && <FiHome className="w-3.5 h-3.5" />}
                  {section === 'products' && <FiPackage className="w-3.5 h-3.5" />}
                  {section === 'about' && <FiUsers className="w-3.5 h-3.5" />}
                  {section === 'home' ? t('landing.header.home') : section === 'products' ? t('landing.header.products') : t('landing.header.about')}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2.5">
              <LanguageSelector />
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-[#5C352C] transition-colors rounded-xl hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#5C352C] flex items-center gap-1.5">
                <FiLogIn className="w-3.5 h-3.5" /> {t('landing.header.login')}
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-bold bg-[#5C352C] text-white rounded-xl hover:bg-[#3D1F18] transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5C352C] focus:ring-offset-2 flex items-center gap-1.5">
                <FiUserPlus className="w-3.5 h-3.5" /> {t('landing.header.getStarted')}
              </Link>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5C352C]"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}>
              {isMobileMenuOpen ? <MdClose className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div ref={mobileMenuRef} className="md:hidden pb-4 pt-2 border-t border-stone-100 animate-fade-in">
              <div className="flex flex-col gap-1">
                {['home', 'products', 'about'].map(section => (
                  <button key={section} onClick={() => scrollToSection(section)}
                    className={`px-4 py-2.5 text-sm rounded-xl text-left font-medium transition-colors flex items-center gap-2 ${
                      activeSection === section ? 'text-[#5C352C] bg-[#5C352C]/8 font-semibold' : 'text-stone-500 hover:bg-stone-50'
                    }`}>
                    {section === 'home' && <FiHome className="w-4 h-4" />}
                    {section === 'products' && <FiPackage className="w-4 h-4" />}
                    {section === 'about' && <FiUsers className="w-4 h-4" />}
                    {section === 'home' ? t('landing.header.home') : section === 'products' ? t('landing.header.products') : t('landing.header.about')}
                  </button>
                ))}
                <div className="border-t border-stone-100 my-2" />
                <div className="px-4 py-2">
                  <LanguageSelector />
                </div>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-sm text-stone-500 hover:bg-stone-50 rounded-xl flex items-center gap-2">
                  <FiLogIn className="w-4 h-4" /> {t('landing.header.login')}
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}
                  className="mx-4 py-2.5 text-sm font-bold bg-[#5C352C] text-white rounded-xl text-center flex items-center justify-center gap-2">
                  <FiUserPlus className="w-4 h-4" /> {t('landing.header.getStarted')}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-[#3D1F18]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3D1F18] via-[#5C352C] to-[#7A4F3A]" />
          <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #E9B48A 1px, transparent 0)', backgroundSize: '40px 40px'}} />
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#956959]/30 to-transparent" />
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] opacity-[0.07] pointer-events-none">
          <img src="/U-Connect Logo.png" alt="" className="w-full h-auto" aria-hidden="true" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {t('landing.hero.badge')}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {t('landing.hero.title')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                {t('landing.hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-stone-300 text-lg mb-8 leading-relaxed max-w-xl">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => scrollToSection('products')}
                className="px-7 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#3D1F18] flex items-center gap-2">
                {t('landing.hero.shopNow')} <FaArrowRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => scrollToSection('about')}
                className="px-7 py-3 border border-white/30 text-white rounded-2xl font-semibold text-sm hover:bg-white/10 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center gap-2">
                {t('landing.hero.learnMore')} <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10 fill-stone-50">
            <path d="M0,60 C240,20 480,0 720,10 C960,20 1200,50 1440,30 L1440,60 Z" />
          </svg>
        </div>
      </section>

      {/* STATS SECTION */}
      {stats && (
        <section className="py-10 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: stats.total_products || 0, label: t('landing.stats.products'), icon: <FiPackage className="w-6 h-6" /> },
                { value: stats.total_categories || 0, label: t('landing.stats.categories'), icon: <MdCategory className="w-6 h-6" /> },
                { value: subcategoriesPagination.total || subcategories.length, label: t('landing.stats.subcategories'), icon: <FiGrid className="w-6 h-6" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all group">
                  <div className="text-2xl mb-1 flex justify-center text-[#5C352C] group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-[#5C352C]">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}+
                  </div>
                  <div className="text-xs text-stone-400 font-medium mt-0.5 tracking-wide uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      {subcategories.length > 0 && (
        <section className="py-12 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#956959] uppercase tracking-widest mb-1">{t('landing.categories.explore')}</p>
                <h2 className="font-display text-3xl font-bold text-stone-800">{t('landing.categories.title')}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#5C352C] ${
                    !selectedSubcategory
                      ? 'bg-[#5C352C] text-white shadow-sm'
                      : 'bg-white text-stone-500 border border-stone-200 hover:border-[#5C352C] hover:text-[#5C352C]'
                  }`}>
                  <FiGrid className="w-3.5 h-3.5" />
                  {t('common.all')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {subcategories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
            </div>

            {subcategoriesPagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={loadPreviousSubcategories}
                  disabled={subcategoriesPage === 1 || loadingSubcategories}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white flex items-center gap-1"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  {t('common.previous')}
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-600">
                    {t('landing.categories.pageOf', { current: subcategoriesPage, total: subcategoriesPagination.last_page })}
                  </span>
                </div>
                
                <button
                  onClick={loadMoreSubcategories}
                  disabled={subcategoriesPage === subcategoriesPagination.last_page || loadingSubcategories}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-sm font-semibold disabled:opacity-40 hover:border-[#5C352C] hover:text-[#5C352C] transition-all bg-white flex items-center gap-1"
                >
                  {t('common.next')}
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS SECTION */}
      <section id="products" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#956959] uppercase tracking-widest mb-1">{t('landing.productsSection.catalogue')}</p>
              <h2 className="font-display text-3xl font-bold text-stone-800">
                {selectedSubcategory
                  ? subcategories.find(s => s.id === selectedSubcategory)?.name || t('landing.productsSection.title')
                  : searchTerm ? t('landing.productsSection.resultsFor', { search: searchTerm }) : t('landing.productsSection.title')}
              </h2>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('landing.productsSection.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C352C]/30 focus:border-[#5C352C]/50 w-full sm:w-64 transition-all"
              />
              {searchTerm && (
                <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none" aria-label={t('common.clear')}>
                  <MdClose className="w-4 h-4 text-stone-400 hover:text-stone-600" />
                </button>
              )}
            </div>
          </div>

          {(selectedSubcategory || searchTerm) && (
            <div className="mb-5 flex items-center gap-2">
              <span className="text-xs text-stone-400">{t('landing.productsSection.filter')}:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5C352C]/8 text-[#5C352C] rounded-full text-xs font-semibold">
                {selectedSubcategory
                  ? subcategories.find(s => s.id === selectedSubcategory)?.name
                  : `"${searchTerm}"`}
                <button onClick={clearFilters} className="hover:text-[#3D1F18] focus:outline-none" aria-label={t('common.clear')}>
                  <MdClose className="w-3 h-3" />
                </button>
              </span>
              <span className="text-xs text-stone-400">{pagination.total} {t('common.results')}</span>
            </div>
          )}

          {!selectedSubcategory && !searchTerm && (
            <p className="text-xs text-stone-400 mb-6">
              {t('landing.productsSection.showing')} <span className="font-semibold text-stone-600">{allProducts.length}</span> {t('landing.productsSection.of')} <span className="font-semibold text-stone-600">{pagination.total}</span> {t('landing.productsSection.results')}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => <SkeletonProductCard key={i} />)}
            </div>
          ) : allProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {allProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
              {pagination.last_page > 1 && <Pagination />}
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-stone-50 rounded-3xl border border-stone-100">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <FiSearch className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500 font-medium mb-2">{t('landing.productsSection.noProducts')}</p>
              <p className="text-stone-400 text-sm mb-4">{t('landing.productsSection.adjustSearch')}</p>
              <button onClick={clearFilters} className="px-5 py-2 bg-[#5C352C] text-white rounded-xl text-sm font-semibold hover:bg-[#3D1F18] transition-colors">
                {t('common.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-12 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-[#956959] uppercase tracking-widest mb-1">{t('landing.featured.handpicked')}</p>
              <h2 className="font-display text-3xl font-bold text-stone-800">{t('landing.featured.title')}</h2>
            </div>
            <button onClick={() => scrollToSection('products')}
              className="text-sm font-semibold text-[#5C352C] hover:text-[#3D1F18] transition-colors mt-2 sm:mt-0 flex items-center gap-1">
              {t('landing.featured.viewAll')} <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-100">
              <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                <FiPackage className="w-8 h-8 text-stone-300" />
              </div>
              <p className="text-stone-500 font-medium mb-2">{t('landing.featured.noFeatured')}</p>
              <p className="text-stone-400 text-sm mb-4">{t('landing.featured.checkBack')}</p>
              <button onClick={() => scrollToSection('products')} 
                className="px-5 py-2 bg-[#5C352C] text-white rounded-xl text-sm font-semibold hover:bg-[#3D1F18] transition-colors">
                {t('landing.productsSection.browseAll')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* WHY US SECTION */}
      <section id="about" className="py-14 bg-[#3D1F18] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #E9B48A 1px, transparent 0)', backgroundSize: '32px 32px'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">{t('landing.whyUs.ourPromise')}</p>
            <h2 className="font-display text-3xl font-bold text-white">{t('landing.whyUs.title')}</h2>
            <p className="text-stone-400 text-sm mt-2">{t('landing.whyUs.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FiShield className="w-7 h-7" />, title: t('landing.whyUs.quality.title'), desc: t('landing.whyUs.quality.desc') },
              { icon: <FiLock className="w-7 h-7" />, title: t('landing.whyUs.secure.title'), desc: t('landing.whyUs.secure.desc') },
              { icon: <FiTruck className="w-7 h-7" />, title: t('landing.whyUs.delivery.title'), desc: t('landing.whyUs.delivery.desc') },
              { icon: <FiMessageCircle className="w-7 h-7" />, title: t('landing.whyUs.support.title'), desc: t('landing.whyUs.support.desc') },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3 flex justify-center text-amber-400">{item.icon}</div>
                <h3 className="font-semibold text-white text-sm mb-1.5">{item.title}</h3>
                <p className="text-stone-400 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-10 bg-gradient-to-r from-amber-400 to-orange-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-stone-900">{t('landing.cta.title')}</h3>
            <p className="text-stone-700 text-sm mt-0.5">{t('landing.cta.subtitle')}</p>
          </div>
          <Link to="/register"
            className="shrink-0 px-7 py-3 bg-[#3D1F18] text-white rounded-2xl font-bold text-sm hover:bg-[#2C1A14] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 flex items-center gap-2">
            <FiUserPlus className="w-4 h-4" /> {t('landing.cta.button')}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-white pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/U-Connect Logo.png" alt="U-Connect Logo" className="h-7 w-auto brightness-0 invert" />
                <span className="font-display font-bold text-base">U-Connect</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">{t('landing.footer.tagline')}</p>
            </div>
            {[
              { title: t('landing.footer.navigate'), links: [
                {label: t('landing.header.home'), icon: <FiHome className="w-3 h-3" />, action: () => scrollToSection('home')},
                {label: t('landing.header.products'), icon: <FiPackage className="w-3 h-3" />, action: () => scrollToSection('products')},
                {label: t('landing.header.about'), icon: <FiUsers className="w-3 h-3" />, action: () => scrollToSection('about')},
              ]},
              { title: t('landing.footer.support'), links: [
                {label: t('landing.footer.faqs'), icon: <FiMessageCircle className="w-3 h-3" />},
                {label: t('landing.footer.shippingInfo'), icon: <FiTruck className="w-3 h-3" />},
                {label: t('landing.footer.returns'), icon: <FiShield className="w-3 h-3" />},
              ]},
              { title: t('landing.footer.contact'), links: [
                {label: 'support@uconnect.com', icon: <FiMail className="w-3 h-3" />},
                {label: '+1 (555) 123-4567', icon: <FiPhone className="w-3 h-3" />},
                {label: '123 Commerce St', icon: <FiMapPin className="w-3 h-3" />},
              ]},
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-xs text-stone-300 uppercase tracking-widest mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      {link.action
                        ? <button onClick={link.action} className="text-[11px] text-stone-400 hover:text-white transition-colors flex items-center gap-2">
                            {link.icon} {link.label}
                          </button>
                        : <span className="text-[11px] text-stone-400 flex items-center gap-2">
                            {link.icon} {link.label}
                          </span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-800 pt-5 text-center text-[10px] text-stone-500">
            © {new Date().getFullYear()} U-Connect. {t('common.rightsReserved')}
          </div>
        </div>
      </footer>

      {/* STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'DM Sans', system-ui, sans-serif; }

        .shadow-product {
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06);
        }
        .shadow-product-hover {
          box-shadow: 0 10px 30px rgba(92,53,44,0.12), 0 4px 10px rgba(0,0,0,0.06);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .animate-modal-in { animation: modal-in 0.35s cubic-bezier(0.34,1.16,0.64,1) forwards; }

        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
};

export default LandingPage;