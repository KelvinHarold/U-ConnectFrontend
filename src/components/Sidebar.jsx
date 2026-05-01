// src/components/Sidebar.jsx
import React, { useContext, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { CartContext } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext";
import { confirmAlert } from "../utils/sweetAlertHelper";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  FileText,
  LogOut,
  ShoppingCart,
  Store,
  BarChart3,
  Tag,
  Star,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  History,
  ClipboardList,
  FolderTree,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  CreditCard,
  MessageSquare
} from "lucide-react";

const Sidebar = ({ isMobile, closeSidebar }) => {
  const { role, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { t, language } = useLanguage(); // Add language to debug
  const location = useLocation();
  
  const [openDropdowns, setOpenDropdowns] = useState({
    reports: false,
    inventory: false
  });
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Debug log to check if translations are loading
  useEffect(() => {
    console.log("Current language:", language);
    console.log("Test translation - dashboard:", t('sidebar.admin.dashboard'));
  }, [language, t]);

  useEffect(() => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarCollapse', { 
      detail: { collapsed: isCollapsed } 
    }));
  }, [isCollapsed]);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Create links inside the component so they update when language changes
  const adminLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: t('sidebar.admin.dashboard') },
    { to: "/admin/users", icon: Users, label: t('sidebar.admin.users') },
    { to: "/admin/products", icon: Package, label: t('sidebar.admin.products') },
    { to: "/admin/orders", icon: ShoppingBag, label: t('sidebar.admin.orders') },
    { to: "/admin/categories", icon: Tag, label: t('sidebar.admin.categories') },
    { 
      label: t('sidebar.admin.reports'), 
      icon: FileText, 
      isDropdown: true,
      dropdownName: "reports",
      submenus: [
        { to: "/admin/reports/sales", icon: DollarSign, label: t('sidebar.admin.salesReports') },
        { to: "/admin/reports/sellers", icon: TrendingUp, label: t('sidebar.admin.sellersReports') },
        { to: "/admin/reports/products", icon: Package, label: t('sidebar.admin.productsReports') },
        { to: "/admin/reports/users", icon: Activity, label: t('sidebar.admin.usersReports') }
      ]
    },
    { to: "/admin/issue-reports", icon: AlertTriangle, label: t('sidebar.admin.disputes') },
    { to: "/admin/announcements", icon: Bell, label: t('sidebar.admin.announcements') },
  ];

  const buyerLinks = [
    { to: "/buyer/shop/products", icon: Package, label: t('sidebar.buyer.products') },
    { to: "/buyer/shop/categories", icon: Tag, label: t('sidebar.buyer.categories') },
    { to: "/buyer/shop/sellers", icon: Store, label: t('sidebar.buyer.sellers') },
    { to: "/buyer/cart", icon: ShoppingCart, label: t('sidebar.buyer.cart'), customBadge: "cart" },
    { to: "/buyer/orders", icon: ShoppingBag, label: t('sidebar.buyer.orders') },
    { to: "/buyer/reports", icon: AlertTriangle, label: t('sidebar.buyer.reports') },
    { to: "/buyer/announcements", icon: Bell, label: t('sidebar.buyer.announcements') },
  ];

  const sellerLinks = [
    { to: "/seller/dashboard", icon: LayoutDashboard, label: t('sidebar.seller.dashboard') },
    { to: "/seller/products", icon: Package, label: t('sidebar.seller.products') },
    { to: "/seller/categories", icon: FolderTree, label: t('sidebar.seller.categories') },
    { to: "/seller/orders", icon: ShoppingBag, label: t('sidebar.seller.orders') },
    { 
      label: t('sidebar.seller.inventory'), 
      icon: ClipboardList, 
      isDropdown: true,
      dropdownName: "inventory",
      submenus: [
        { to: "/seller/inventory/summary", icon: BarChart3, label: t('sidebar.seller.inventorySummary') },
        { to: "/seller/inventory/low-stock", icon: AlertTriangle, label: t('sidebar.seller.lowStock') },
        { to: "/seller/inventory/out-of-stock", icon: AlertTriangle, label: t('sidebar.seller.outOfStock') },
        { to: "/seller/inventory/logs", icon: History, label: t('sidebar.seller.inventoryLogs') },
        { to: "/seller/inventory/bulk-update", icon: Package, label: t('sidebar.seller.bulkUpdate') }
      ]
    },
    { to: "/seller/reports", icon: AlertTriangle, label: t('sidebar.seller.reports') },
    { to: "/seller/announcements", icon: Bell, label: t('sidebar.seller.announcements') },
    { to: "/seller/subscription", icon: CreditCard, label: t('sidebar.seller.subscription') },
  ];

  const getLinks = () => {
    switch(role) {
      case 'admin': return adminLinks;
      case 'seller': return sellerLinks;
      case 'buyer': return buyerLinks;
      default: return [];
    }
  };

  const links = getLinks();

  const getRoleLabel = () => {
    switch(role) {
      case 'admin': return t('sidebar.roles.admin');
      case 'seller': return t('sidebar.roles.seller');
      case 'buyer': return t('sidebar.roles.buyer');
      default: return role;
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmAlert({
      title: t('sidebar.logoutConfirm'),
      text: '',
      icon: 'question',
      confirmButtonText: t('sidebar.logout'),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      logout();
    }
  };

  return (
    <aside className={`
      bg-[#1A0F0C] text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out
      ${isMobile ? 'w-64 h-full' : (isCollapsed ? 'w-20' : 'w-64')}
      ${!isMobile && 'h-screen'}
    `}>
      {/* Logo Area */}
      <div className="p-4 border-b border-[#5C352C]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/U-Connect Logo.png" alt="Logo" className="w-7 h-7 flex-shrink-0" />
            {(!isMobile && !isCollapsed) && (
              <div className="transition-opacity duration-300">
                <h2 className="font-bold text-base">U-Connect</h2>
                <p className="text-[10px] text-[#E9B48A] capitalize mt-0.5">{getRoleLabel()}</p>
              </div>
            )}
            {isMobile && (
              <div>
                <h2 className="font-bold text-base">U-Connect</h2>
                <p className="text-[10px] text-[#E9B48A] capitalize mt-0.5">{getRoleLabel()}</p>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-lg bg-[#5C352C]/50 hover:bg-[#5C352C] transition-all duration-200 text-white"
              title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-3.5 h-3.5" />
              ) : (
                <PanelLeftClose className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 gap-0.5 px-2">
          {links.map((link, index) => (
            <div key={index}>
              {link.isDropdown ? (
                <div className="w-full">
                  <button
                    onClick={() => toggleDropdown(link.dropdownName)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[#E9B48A] hover:bg-[#5C352C]/30 hover:text-white transition-all duration-200 group"
                    title={(!isMobile && isCollapsed) ? link.label : ""}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 transition-transform group-hover:scale-105 flex-shrink-0" />
                      {(!isMobile && !isCollapsed) && (
                        <span className="text-xs font-medium whitespace-nowrap">{link.label}</span>
                      )}
                      {isMobile && (
                        <span className="text-xs font-medium">{link.label}</span>
                      )}
                    </div>
                    {(!isMobile && !isCollapsed) && (
                      <div className="transition-transform duration-300">
                        {openDropdowns[link.dropdownName] ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}
                  </button>
                  
                  <div
                    className={`
                      ml-6 mt-0.5 grid grid-cols-1 gap-0.5 overflow-hidden transition-all duration-300 ease-in-out
                      ${(!isMobile && isCollapsed) ? 'hidden' : ''}
                      ${openDropdowns[link.dropdownName] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    {link.submenus.map((submenu) => (
                      <NavLink
                        key={submenu.to}
                        to={submenu.to}
                        onClick={() => {
                          if (isMobile && closeSidebar) closeSidebar();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs ${
                            isActive
                              ? "bg-[#5C352C] text-white shadow-sm"
                              : "text-[#E9B48A]/80 hover:bg-[#5C352C]/30 hover:text-white hover:translate-x-0.5"
                          }`
                        }
                        title={(!isMobile && isCollapsed) ? submenu.label : ""}
                      >
                        <submenu.icon className="w-3.5 h-3.5 transition-transform flex-shrink-0" />
                        {(!isMobile && !isCollapsed) && (
                          <span className="text-xs whitespace-nowrap">{submenu.label}</span>
                        )}
                        {isMobile && (
                          <span className="text-xs">{submenu.label}</span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  to={link.to}
                  onClick={() => {
                    if (isMobile && closeSidebar) closeSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                      isActive
                        ? "bg-[#5C352C] text-white shadow-sm"
                        : "text-[#E9B48A] hover:bg-[#5C352C]/30 hover:text-white hover:translate-x-0.5"
                    }`
                  }
                  title={(!isMobile && isCollapsed) ? link.label : ""}
                >
                  <link.icon className="w-4 h-4 transition-transform group-hover:scale-105 flex-shrink-0" />
                  {(!isMobile && !isCollapsed) && (
                    <span className="text-xs font-medium whitespace-nowrap flex-1">{link.label}</span>
                  )}
                  {isMobile && (
                    <span className="text-xs font-medium flex-1">{link.label}</span>
                  )}
                  
                  {/* Cart Badge */}
                  {link.customBadge === "cart" && cartCount > 0 && (
                    <span className={`bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center
                      ${(!isMobile && isCollapsed) ? 'absolute top-1 right-2 w-4 h-4 text-[9px]' : 'px-1.5 py-0.5 ml-auto'}
                    `}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-[#5C352C]/30 bg-[#1A0F0C] sticky bottom-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[#E9B48A] hover:bg-[#5C352C]/30 hover:text-white transition-all duration-200 group"
          title={(!isMobile && isCollapsed) ? t('sidebar.logout') : ""}
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:scale-105 flex-shrink-0" />
          {(!isMobile && !isCollapsed) && (
            <span className="text-xs font-medium whitespace-nowrap">{t('sidebar.logout')}</span>
          )}
          {isMobile && (
            <span className="text-xs font-medium">{t('sidebar.logout')}</span>
          )}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #5C352C20;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5C352C;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #956959;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;