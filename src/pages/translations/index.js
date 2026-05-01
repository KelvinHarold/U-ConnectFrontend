// src/translations/index.js
import { commonTranslations } from './common';
import { landingTranslations } from './landing';
import { loginTranslations } from './login';
import { registerTranslations } from './register';
import { headerTranslations } from './headerTranslations';
import { footerTranslations } from './footerTranslations';
import { helpSupportTranslations } from './helpSupportTranslations';
import { sidebarTranslations } from './sidebarTranslations';

// Buyer translations
import { buyerDashboardTranslations } from './buyer/buyerDashboard';
import { productsTranslations } from './buyer/products';
import { productDetailsTranslations } from './buyer/productDetails';
import { categoriesTranslations } from './buyer/categories';
import { subcategoriesTranslations } from './buyer/subcategories';
import { categoryProductsTranslations } from './buyer/categoryProducts';
import { sellersTranslations } from './buyer/sellers';
import { sellerProductsTranslations as buyerSellerProductsTranslations } from './buyer/sellerProducts';
import { cartTranslations } from './buyer/cartTranslations';
import { orderDetailsTranslations } from './buyer/orderDetailsTranslations';
import { ordersTranslations } from './buyer/ordersTranslations';
import { orderTrackingTranslations } from './buyer/orderTrackingTranslations';
import { announcementsTranslations } from './buyer/announcementsTranslations';
import { issueReportsTranslations } from './buyer/issueReportsTranslations';

// Seller translations
import { sellerDashboardTranslations } from './sellers/sellerdashboard';
import { sellerProductsTranslations } from './sellers/sellerProducts';
import { sellerProductDetailsTranslations } from './sellers/sellerProductDetails';
import { sellerEditProductTranslations } from './sellers/sellerEditProduct';
import { sellerAddProductTranslations } from './sellers/sellerAddProduct';
import { sellerCategoriesTranslations } from './sellers/sellerCategories';
import { sellerCategoryProductsTranslations } from './sellers/sellerCategoryProducts';
import { sellerSubcategoriesTranslations } from './sellers/sellerSubcategories';
import { sellerOrderDetailsTranslations } from './sellers/sellerOrderDetails';
import { sellerOrdersTranslations } from './sellers/sellerOrders';
import { sellerSubscriptionTranslations } from './sellers/sellerSubscription';
import { sellerAnnouncementsTranslations } from './sellers/sellerAnnouncements';
import { sellerBulkStockTranslations } from './sellers/sellerBulkStock';
import { sellerInventoryLogsTranslations } from './sellers/sellerInventoryLogs';
import { sellerInventorySummaryTranslations } from './sellers/sellerInventorySummary';
import { sellerLowStockProductsTranslations } from './sellers/sellerLowStockProducts';
import { sellerOutOfStockProductsTranslations } from './sellers/sellerOutOfStockProducts';

export const translations = {
  en: {
    ...commonTranslations.en,
    common: commonTranslations.en,
    header: headerTranslations.en,
    footer: footerTranslations.en,
    helpSupport: helpSupportTranslations.en,
    sidebar: sidebarTranslations.en,
    landing: landingTranslations.en,
    login: loginTranslations.en,
    register: registerTranslations.en,
    buyer: {
      dashboard: buyerDashboardTranslations.en,
      products: productsTranslations.en,
      productDetails: productDetailsTranslations.en,
      categories: categoriesTranslations.en,
      subcategories: subcategoriesTranslations.en,
      categoryProducts: categoryProductsTranslations.en,
      sellers: sellersTranslations.en,
      sellerProducts: buyerSellerProductsTranslations.en,
      cart: cartTranslations.en,
      orderDetails: orderDetailsTranslations.en,
      orders: ordersTranslations.en,
      orderTracking: orderTrackingTranslations.en,
      announcements: announcementsTranslations.en,
      issueReports: issueReportsTranslations.en,
    },
    seller: {
      dashboard: sellerDashboardTranslations.en,
      products: sellerProductsTranslations.en,
      productDetails: sellerProductDetailsTranslations.en,
      editProduct: sellerEditProductTranslations.en,
      addProduct: sellerAddProductTranslations.en,
      categories: sellerCategoriesTranslations.en,
      categoryProducts: sellerCategoryProductsTranslations.en,
      subcategories: sellerSubcategoriesTranslations.en,
      orders: sellerOrdersTranslations.en,
      orderDetails: sellerOrderDetailsTranslations.en,
      subscription: sellerSubscriptionTranslations.en,
      announcements: sellerAnnouncementsTranslations.en,
      bulkStock: sellerBulkStockTranslations.en,
      inventoryLogs: sellerInventoryLogsTranslations.en,
      inventorySummary: sellerInventorySummaryTranslations.en,
      lowStockProducts: sellerLowStockProductsTranslations.en,
      outOfStockProducts: sellerOutOfStockProductsTranslations.en,
    }
  },

  sw: {
    ...commonTranslations.sw,
    common: commonTranslations.sw,
    header: headerTranslations.sw,
    footer: footerTranslations.sw,
    helpSupport: helpSupportTranslations.sw,
    sidebar: sidebarTranslations.sw,
    landing: landingTranslations.sw,
    login: loginTranslations.sw,
    register: registerTranslations.sw,
    buyer: {
      dashboard: buyerDashboardTranslations.sw,
      products: productsTranslations.sw,
      productDetails: productDetailsTranslations.sw,
      categories: categoriesTranslations.sw,
      subcategories: subcategoriesTranslations.sw,
      categoryProducts: categoryProductsTranslations.sw,
      sellers: sellersTranslations.sw,
      sellerProducts: buyerSellerProductsTranslations.sw,
      cart: cartTranslations.sw,
      orderDetails: orderDetailsTranslations.sw,
      orders: ordersTranslations.sw,
      orderTracking: orderTrackingTranslations.sw,
      announcements: announcementsTranslations.sw,
      issueReports: issueReportsTranslations.sw,
    },
    seller: {
      dashboard: sellerDashboardTranslations.sw,
      products: sellerProductsTranslations.sw,
      productDetails: sellerProductDetailsTranslations.sw,
      editProduct: sellerEditProductTranslations.sw,
      addProduct: sellerAddProductTranslations.sw,
      categories: sellerCategoriesTranslations.sw,
      categoryProducts: sellerCategoryProductsTranslations.sw,
      subcategories: sellerSubcategoriesTranslations.sw,
      orders: sellerOrdersTranslations.sw,
      orderDetails: sellerOrderDetailsTranslations.sw,
      subscription: sellerSubscriptionTranslations.sw,
      announcements: sellerAnnouncementsTranslations.sw,
      bulkStock: sellerBulkStockTranslations.sw,
      inventoryLogs: sellerInventoryLogsTranslations.sw,
      inventorySummary: sellerInventorySummaryTranslations.sw,
      lowStockProducts: sellerLowStockProductsTranslations.sw,
      outOfStockProducts: sellerOutOfStockProductsTranslations.sw,
    }
  }
};

export const getTranslation = (lang, path) => {
  const keys = path.split('.');
  let result = translations[lang];

  for (const key of keys) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      console.warn(`Translation missing: ${path} in ${lang}`);
      return path;
    }
  }

  return result;
};

// Helper function specifically for seller translations
export const getSellerTranslation = (lang, key) => {
  return getTranslation(lang, `seller.${key}`);
};

// Helper function specifically for buyer translations
export const getBuyerTranslation = (lang, key) => {
  return getTranslation(lang, `buyer.${key}`);
};

export default translations;