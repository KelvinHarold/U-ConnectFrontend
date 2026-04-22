// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import { NotificationProvider } from "./contexts/NotificationContext"; 
import { CartProvider } from "./contexts/CartContext";
import LandingPage from "./pages/LandingPage";

import { LanguageProvider } from './contexts/LanguageContext';

// Admin Pages
import AdminDashboard from "./pages/admin/admindashboard/AdminDashboard";
import UserManagement from "./pages/admin/users/UserManagement";
import UserDetails from "./pages/admin/users/UserDetails";
import EditUser from "./pages/admin/users/EditUser";
import ProductManagement from "./pages/admin/products/ProductManagement";
import AdminProductDetails from "./pages/admin/products/ProductDetails";
import AdminEditProduct from "./pages/admin/products/EditProduct";
import OrderManagement from "./pages/admin/orders/OrderManagement";
import OrderDetails from "./pages/admin/orders/OrderDetails";
import CategoryManagement from "./pages/admin/categories/CategoryManagement";
import CategoryDetails from "./pages/admin/categories/CategoryDetails";
import SalesReport from "./pages/admin/reports/SalesReport";
import SellerPerformance from "./pages/admin/reports/SellerPerformance";
import ProductPerformance from "./pages/admin/reports/ProductPerformance";
import UserActivity from "./pages/admin/reports/UserActivity";
import AdminReports from "./pages/admin/AdminReports";
import AdminSubscriptions from "./pages/admin/subscriptions/AdminSubscriptions";

// Seller Pages
import SellerDashboard from "./pages/seller/sellerDashboard/SellerDashboard";
import SellerProductsList from "./pages/seller/products/SellerProducts";
import AddProduct from "./pages/seller/products/AddProduct";
import SellerProductDetails from "./pages/seller/products/ProductDetails";
import SellerEditProduct from "./pages/seller/products/EditProduct";

// Seller Orders
import SellerOrders from "./pages/seller/orders/SellerOrders";
import SellerOrderDetails from "./pages/seller/orders/OrderDetails";

// Seller Inventory
import InventorySummary from "./pages/seller/inventory/InventorySummary";
import InventoryLogs from "./pages/seller/inventory/InventoryLogs";
import BulkStockUpdate from "./pages/seller/inventory/BulkStockUpdate";
import LowStockProducts from "./pages/seller/inventory/LowStockProducts";
import OutOfStockProducts from "./pages/seller/inventory/OutOfStockProducts";

// Seller Categories
import SellerCategories from './pages/seller/categories/SellerCategories';
import SellerSubcategories from './pages/seller/categories/SellerSubcategories';
import SellerCategoryProducts from './pages/seller/categories/SellerCategoryProducts';

// Seller Subscription
import SellerSubscription from "./pages/seller/subscription/SellerSubscription";

// Buyer Pages
// import BuyerDashboard from "./pages/buyer/buyerDashboard/BuyerDashboard";

// Cart Routes
import Cart from "./pages/buyer/cart/Cart";
import BuyerOrders from "./pages/buyer/orders/BuyerOrders";
import BuyerOrderDetails from "./pages/buyer/orders/BuyerOrderDetails";
import OrderTracking from "./pages/buyer/orders/OrderTracking";

// Shop Routes (Buyer)
import ShopProducts from "./pages/buyer/shop/Products";
import BuyerProductDetails from "./pages/buyer/shop/ProductDetails";
import SellersList from "./pages/buyer/shop/Sellers";
import SellerShopProducts from "./pages/buyer/shop/SellerProducts";
import FeaturedProductsList from "./pages/buyer/shop/FeaturedProducts";
import CategoryProducts from './pages/buyer/shop/CategoryProducts';
import CategoriesList from './pages/buyer/shop/Categories';
import Subcategories from './pages/buyer/shop/Subcategories';

// announcement
import AnnouncementManagement from "./pages/admin/announcements/AnnouncementManagement";
import BuyerAnnouncements from "./pages/buyer/announcements/BuyerAnnouncements";
import SellerAnnouncements from "./pages/seller/announcements/SellerAnnouncements";
import IssueReports from "./pages/common/IssueReports";

import { ToastProvider } from './contexts/ToastContext';


import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
       <LanguageProvider>
          <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>       <Routes>
          {/* Root "/" redirects based on role or default to login */}
                <Route path="/" element={<LandingPage />} />
          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "seller", "buyer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
  path="/admin/announcements"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AnnouncementManagement />
    </ProtectedRoute>
  }
/>
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminEditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CategoryDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/sales"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/sellers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SellerPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProductPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issue-reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSubscriptions />
              </ProtectedRoute>
            }
          />

          {/* ==================== SELLER ROUTES ==================== */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/add"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerEditProduct />
              </ProtectedRoute>
            }
          />

          <Route
  path="/seller/categories"
  element={
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerCategories />
    </ProtectedRoute>
  }
/>
<Route
  path="/seller/categories/:id/subcategories"
  element={
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerSubcategories />
    </ProtectedRoute>
  }
/>
<Route
  path="/seller/categories/:id/products"
  element={
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerCategoryProducts />
    </ProtectedRoute>
  }
/>

<Route
  path="/seller/announcements"
  element={
    <ProtectedRoute allowedRoles={["seller"]}>
      <SellerAnnouncements />
    </ProtectedRoute>
  }
/>
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/summary"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <InventorySummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/low-stock"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <LowStockProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/out-of-stock"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <OutOfStockProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/logs"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <InventoryLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory/bulk-update"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <BulkStockUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/reports"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <IssueReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/subscription"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerSubscription />
              </ProtectedRoute>
            }
          />

          {/* ==================== BUYER ROUTES ==================== */}
          {/* <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          /> */}

          {/* Buyer Shop Routes */}
          <Route
            path="/buyer/shop/products"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <ShopProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/products/:id"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/sellers"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <SellersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/sellers/:id/products"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <SellerShopProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/featured"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <FeaturedProductsList />
              </ProtectedRoute>
            }
          />

          {/* Buyer Categories Routes - Hierarchical */}
          <Route
            path="/buyer/shop/categories"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CategoriesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/categories/:id/subcategories"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <Subcategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/shop/categories/:id/products"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CategoryProducts />
              </ProtectedRoute>
            }
          />

          <Route
  path="/buyer/announcements"
  element={
    <ProtectedRoute allowedRoles={["buyer"]}>
      <BuyerAnnouncements />
    </ProtectedRoute>
  }
/>

          {/* Buyer Cart & Orders Routes */}
          <Route
            path="/buyer/cart"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerOrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders/:id/track"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/reports"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <IssueReports />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for unmatched URLs */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </NotificationProvider>
        </CartProvider>
      </AuthProvider>
      </ToastProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;