import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Mail, Smartphone, Settings, Save, X, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  category: 'system' | 'booking' | 'payment' | 'maintenance' | 'general';
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'new_booking',
      title: 'Yangi bronlash',
      description: 'Yangi bronlash qilinganda bildirishnoma olish',
      email: true,
      push: true,
      sms: false,
      category: 'booking'
    },
    {
      id: 'booking_cancelled',
      title: 'Bronlash bekor qilindi',
      description: 'Bronlash bekor qilinganda bildirishnoma olish',
      email: true,
      push: true,
      sms: true,
      category: 'booking'
    },
    {
      id: 'payment_received',
      title: 'To\'lov qabul qilindi',
      description: 'To\'lov qabul qilinganda bildirishnoma olish',
      email: true,
      push: true,
      sms: false,
      category: 'payment'
    },
    {
      id: 'payment_failed',
      title: 'To\'lov amalga oshmadi',
      description: 'To\'lov amalga oshmaganida bildirishnoma olish',
      email: true,
      push: true,
      sms: true,
      category: 'payment'
    },
    {
      id: 'maintenance_scheduled',
      title: 'Texnik xizmat rejalashtirildi',
      description: 'Texnik xizmat rejalashtirilganda bildirishnoma olish',
      email: true,
      push: true,
      sms: false,
      category: 'maintenance'
    },
    {
      id: 'system_update',
      title: 'Tizim yangilandi',
      description: 'Tizim yangilanganda bildirishnoma olish',
      email: false,
      push: true,
      sms: false,
      category: 'system'
    },
    {
      id: 'general_announcement',
      title: 'Umumiy e\'lonlar',
      description: 'Umumiy e\'lonlar haqida bildirishnoma olish',
      email: true,
      push: true,
      sms: false,
      category: 'general'
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    enableNotifications: true,
    enableEmail: true,
    enablePush: true,
    enableSMS: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handlePreferenceChange = (id: string, type: 'email' | 'push' | 'sms', value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, [type]: value } : pref
      )
    );
  };

  const handleGlobalSettingChange = (key: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    setGlobalSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save preferences to localStorage or API
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      localStorage.setItem('notificationGlobalSettings', JSON.stringify(globalSettings));
      
      toast.success('Bildirishnoma sozlamalari saqlandi!');
      onClose();
    } catch (error) {
      toast.error('Sozlamalarni saqlashda xatolik yuz berdi!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences([
      {
        id: 'new_booking',
        title: 'Yangi bronlash',
        description: 'Yangi bronlash qilinganda bildirishnoma olish',
        email: true,
        push: true,
        sms: false,
        category: 'booking'
      },
      {
        id: 'booking_cancelled',
        title: 'Bronlash bekor qilindi',
        description: 'Bronlash bekor qilinganda bildirishnoma olish',
        email: true,
        push: true,
        sms: true,
        category: 'booking'
      },
      {
        id: 'payment_received',
        title: 'To\'lov qabul qilindi',
        description: 'To\'lov qabul qilinganda bildirishnoma olish',
        email: true,
        push: true,
        sms: false,
        category: 'payment'
      },
      {
        id: 'payment_failed',
        title: 'To\'lov amalga oshmadi',
        description: 'To\'lov amalga oshmaganida bildirishnoma olish',
        email: true,
        push: true,
        sms: true,
        category: 'payment'
      },
      {
        id: 'maintenance_scheduled',
        title: 'Texnik xizmat rejalashtirildi',
        description: 'Texnik xizmat rejalashtirilganda bildirishnoma olish',
        email: true,
        push: true,
        sms: false,
        category: 'maintenance'
      },
      {
        id: 'system_update',
        title: 'Tizim yangilandi',
        description: 'Tizim yangilanganda bildirishnoma olish',
        email: false,
        push: true,
        sms: false,
        category: 'system'
      },
      {
        id: 'general_announcement',
        title: 'Umumiy e\'lonlar',
        description: 'Umumiy e\'lonlar haqida bildirishnoma olish',
        email: true,
        push: true,
        sms: false,
        category: 'general'
      }
    ]);
    
    setGlobalSettings({
      enableNotifications: true,
      enableEmail: true,
      enablePush: true,
      enableSMS: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      soundEnabled: true,
      vibrationEnabled: true
    });
    
    toast.success('Sozlamalar tiklandi!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case 'payment':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'maintenance':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'system':
        return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>;
      case 'general':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'booking':
        return 'Bronlash';
      case 'payment':
        return 'To\'lov';
      case 'maintenance':
        return 'Texnik xizmat';
      case 'system':
        return 'Tizim';
      case 'general':
        return 'Umumiy';
      default:
        return 'Boshqa';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bildirishnoma sozlamalari
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bildirishnomalar va xabarlar sozlamalari
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Global Settings */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Umumiy sozlamalar
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Bildirishnomalar</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Barcha bildirishnomalarni yoqish/o'chirish</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={globalSettings.enableNotifications}
                      onChange={(e) => handleGlobalSettingChange('enableNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Notification Types */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Email bildirishnomalar</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.enableEmail}
                        onChange={(e) => handleGlobalSettingChange('enableEmail', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Push bildirishnomalar</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.enablePush}
                        onChange={(e) => handleGlobalSettingChange('enablePush', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">SMS bildirishnomalar</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.enableSMS}
                        onChange={(e) => handleGlobalSettingChange('enableSMS', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">Sokin vaqt</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.quietHours.enabled}
                        onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {globalSettings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Boshlash vaqti
                        </label>
                        <input
                          type="time"
                          value={globalSettings.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tugash vaqti
                        </label>
                        <input
                          type="time"
                          value={globalSettings.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sound and Vibration */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Ovoz</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.soundEnabled}
                        onChange={(e) => handleGlobalSettingChange('soundEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Titrash</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={globalSettings.vibrationEnabled}
                        onChange={(e) => handleGlobalSettingChange('vibrationEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specific Preferences */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Maxsus sozlamalar
            </h3>
            
            <div className="space-y-4">
              {preferences.map((preference) => (
                <div key={preference.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(preference.category)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {preference.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preference.description}
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {getCategoryName(preference.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">Email</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.email}
                          onChange={(e) => handlePreferenceChange(preference.id, 'email', e.target.checked)}
                          disabled={!globalSettings.enableEmail}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">Push</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.push}
                          onChange={(e) => handlePreferenceChange(preference.id, 'push', e.target.checked)}
                          disabled={!globalSettings.enablePush}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">SMS</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preference.sms}
                          onChange={(e) => handlePreferenceChange(preference.id, 'sms', e.target.checked)}
                          disabled={!globalSettings.enableSMS}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Tiklash
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettings; 