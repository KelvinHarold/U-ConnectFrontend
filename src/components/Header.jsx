// src/components/Header.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { confirmAlert } from '../utils/sweetAlertHelper';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  Store,
  ShoppingBag,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  Clock,
  LayoutDashboard
} from "lucide-react";
import NotificationBell from "../components/NotificationBell";
import HelpSupportModal from "../components/HelpSupportModal";

const Header = ({ toggleSidebar, isMobile }) => {
  const { user, role, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirmAlert({
      title: t('header.logoutConfirm'),
      text: '',
      icon: 'question',
      confirmButtonText: t('header.logout'),
      cancelButtonText: t('common.cancel'),
    });
    if (confirmed) {
      logout();
      navigate("/");
    }
  };

  const getDashboardLink = () => {
    switch (role) {
      case "admin": return "/admin/dashboard";
      case "seller": return "/seller/dashboard";
      case "buyer": return "/buyer/dashboard";
      default: return "/dashboard";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "admin": return <Shield className="w-3 h-3" />;
      case "seller": return <Store className="w-3 h-3" />;
      case "buyer": return <ShoppingBag className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin": return "bg-purple-50 text-purple-600";
      case "seller": return "bg-blue-50 text-blue-600";
      case "buyer": return "bg-emerald-50 text-emerald-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin": return t('header.roles.admin');
      case "seller": return t('header.roles.seller');
      case "buyer": return t('header.roles.buyer');
      default: return role;
    }
  };

  const getProfilePictureUrl = () => {
    if (user?.profile_photo) {
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      baseUrl = baseUrl.replace(/\/api$/, '');
      baseUrl = baseUrl.replace(/\/$/, '');
      return `${baseUrl}/storage/${user.profile_photo}`;
    }
    return null;
  };

  const profilePicture = getProfilePictureUrl();

  const formatDate = (date) => {
    const locale = t('common.locale') === 'sw' ? 'sw-TZ' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Left Section */}
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#5C352C] transition-colors"
                  aria-label={t('header.toggleMenu')}
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
             {/* <div className="flex items-center gap-2">
  <img src="/U-Connect Logo.png" alt="Logo" className="w-7 h-7" />
  <span className="font-semibold text-gray-800 text-sm hidden sm:inline">
    U-Connect
  </span>
</div> */}
            </div>

            {/* Center Section - Date & Time (Desktop only) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50">
                <Clock className="w-3.5 h-3.5 text-[#5C352C]" />
                <span className="text-xs text-gray-500">{formatDate(currentDateTime)}</span>
                <span className="text-xs font-mono font-medium text-gray-700">{formatTime(currentDateTime)}</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  aria-label={t('header.profileMenu')}
                  aria-expanded={isDropdownOpen}
                >
                  {/* Profile Picture */}
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#5C352C]/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5C352C] to-[#7A4B3E] flex items-center justify-center text-white text-xs font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  {/* User Info beside profile picture - Visible on both desktop and mobile */}
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-800 max-w-[100px] truncate">
                      {user?.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {getRoleIcon()}
                      <span className={`text-[10px] font-medium capitalize px-1.5 py-0.5 rounded-full ${getRoleColor()}`}>
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {profilePicture ? (
                          <img src={profilePicture} alt={user?.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#5C352C] flex items-center justify-center text-white text-sm font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{t('header.myProfile')}</span>
                      </Link>
                      
                      {/* Help & Support - Opens Modal */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsHelpModalOpen(true);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        <span>{t('header.helpSupport')}</span>
                      </button>
                      
                      {role === 'seller' && (
                        <Link to="/seller/subscription" onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>{t('header.subscription')}</span>
                        </Link>
                      )}
                      
                      {role === 'admin' && (
                        <Link to="/admin/subscriptions" onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>{t('header.subscriptions')}</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <div className="py-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>{t('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Date & Time Bar only (user info now in header) */}
        <div className="md:hidden px-4 py-1 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-3 h-3 text-[#5C352C]" />
            <span className="text-[10px] text-gray-500">{formatDate(currentDateTime)}</span>
            <span className="text-[10px] font-mono font-medium text-gray-700">{formatTime(currentDateTime)}</span>
          </div>
        </div>
      </header>

      {/* Help & Support Modal */}
      <HelpSupportModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
      />
    </>
  );
};

export default Header;