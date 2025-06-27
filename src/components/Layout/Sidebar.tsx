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
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Talabalar', href: '/students', icon: Users },
  { name: 'To\'lovlar', href: '/payments', icon: CreditCard },
  { name: 'Yotoqxona', href: '/rooms', icon: Building },
  { name: 'Arizalar', href: '/applications', icon: FileText },
  { name: 'Hisobotlar', href: '/reports', icon: BarChart3 },
  { name: 'Sozlamalar', href: '/settings', icon: Settings },
  { name: 'Profil', href: '/profile', icon: User },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? '4rem' : '16rem',
          x: 0,
        }}
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${!sidebarCollapsed ? 'block' : 'hidden'}
        lg:block`
        }
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 z-40 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Navigation */}
        <nav className="mt-8 px-3">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      {item.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-3 right-3"
          >
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TTU</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
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
      </motion.div>
    </>
  );
};

export default Sidebar;