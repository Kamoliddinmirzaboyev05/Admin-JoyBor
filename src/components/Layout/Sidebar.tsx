import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building,
  FileText,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Talabalar', href: '/students', icon: Users },
  { name: 'To\'lovlar', href: '/payments', icon: CreditCard },
  { name: 'Yotoqxona', href: '/rooms', icon: Building },
  { name: 'Arizalar', href: '/applications', icon: FileText },
  { name: 'Hisobotlar', href: '/reports', icon: BarChart3 },
  { name: 'Sozlamalar', href: '/settings', icon: Settings },
];

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  // Mobil uchun
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  React.useEffect(() => {
    const handleResize = () => setMobileOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobil va desktop uchun alohida toggle
  const handleSidebarToggle = () => {
    if (isMobile) setMobileOpen((v) => !v);
    else toggleSidebar();
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile) setMobileOpen(false);
  };

  // Sidebar content
  const sidebarContent = (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed && !mobileOpen ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
      }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.7 }}
      className="h-full flex flex-col bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 rounded-r-2xl shadow-2xl overflow-hidden relative transition-all duration-300"
      style={{
        minWidth: sidebarCollapsed && !mobileOpen ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        maxWidth: sidebarCollapsed && !mobileOpen ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
      }}
    >
      {/* Navigation */}
      <nav className="mt-10 px-3 flex-1">
        <ul className="space-y-2">
          {navigation.map((item, idx) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name} className="relative flex items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {(!sidebarCollapsed || mobileOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isActive && !sidebarCollapsed && !mobileOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
                {/* Tooltip for collapsed state (desktop) */}
                {sidebarCollapsed && !mobileOpen && (
                  <div className="absolute left-20 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {(!sidebarCollapsed || mobileOpen) && (
          <motion.div
            key="sidebar-footer"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="mt-auto mb-5 px-3"
          >
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-900/40 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TTU</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    Toshkent TTU
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yotoqxona #1
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );

  return (
    <>
      {/* Navbarga handleSidebarToggle propini uzataman */}
      <Navbar handleSidebarToggle={handleSidebarToggle} />
      {/* Mobile sidebar & backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="sidebar-mobile"
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full"
              style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH, maxWidth: SIDEBAR_WIDTH }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-16 left-0 z-30 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;