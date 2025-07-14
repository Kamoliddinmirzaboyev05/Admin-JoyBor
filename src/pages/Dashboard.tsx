import React from 'react';
import { Users, Building, CreditCard, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '../stores/useAppStore';
import StatsCard from '../components/UI/StatsCard';
import { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const { students, rooms, payments, applications } = useAppStore();
  const [loading, setLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Show only loading bar and spinner until data is loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === 'male').length;
  const femaleStudents = students.filter(s => s.gender === 'female').length;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const fullRooms = rooms.filter(r => r.status === 'full').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const approvedApplications = applications.filter(a => a.status === 'approved').length;
  const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
  const allApplications = applications.length;

  const monthlyRevenue = [
    { month: 'Yan', revenue: 25000000 },
    { month: 'Fev', revenue: 28000000 },
    { month: 'Mar', revenue: 32000000 },
    { month: 'Apr', revenue: 29000000 },
    { month: 'May', revenue: 35000000 },
    { month: 'Iyun', revenue: 38000000 },
  ];

  const roomStatus = [  
    { name: "Bo'sh", value: availableRooms, color: '#10b981' },
    { name: "To'la", value: rooms.filter(r => r.status === 'full').length, color: '#f59e0b' },
    { name: "To'lmagan", value: rooms.filter(r => r.status === 'maintenance').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yotoqxona boshqaruvi umumiy ko'rinishi
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Oxirgi yangilanish: {new Date().toLocaleString('uz-UZ')}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="w-full flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          <StatsCard
            title="Talabalar"
            value={totalStudents}
            change={undefined}
            changeType="neutral"
            icon={Users}
            color="primary"
            trend={undefined}
            subStats={[
              { label: 'Jami', value: totalStudents },
              { label: 'Yigitlar', value: maleStudents },
              { label: 'Qizlar', value: femaleStudents },
            ]}
          />
          <StatsCard
            title="Xonalar"
            value={totalRooms}
            change={`Bo'sh: ${availableRooms}`}
            changeType="neutral"
            icon={Building}
            color="secondary"
            trend={undefined}
            subStats={[
              { label: "Bo'sh", value: availableRooms },
              { label: "To'la", value: fullRooms },
              { label: "To'lmagan", value: maintenanceRooms },
            ]}
          />
          <StatsCard
            title="To'lovlar"
            value={`${(totalPaymentsAmount / 1000000).toFixed(1)}M so'm`}
            change={`To'langan: ${(totalPaymentsAmount / 1000000).toFixed(1)}M`}
            changeType="increase"
            icon={CreditCard}
            color="accent"
            trend={undefined}
            subStats={[
              { label: 'To\'langan', value: totalPaymentsAmount },
              { label: 'Kutilmoqda', value: 0 },
              { label: 'Kechikkan', value: 0 },
            ]}
          />
          <StatsCard
            title="Arizalar"
            value={allApplications}
            change={`Kutilmoqda: ${pendingApplications}`}
            changeType="neutral"
            icon={FileText}
            color="warning"
            trend={undefined}
            subStats={[
              { label: 'Kutilmoqda', value: pendingApplications },
              { label: 'Tasdiqlangan', value: approvedApplications },
              { label: 'Rad etilgan', value: rejectedApplications },
            ]}
          />
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Oylik Daromad
            </h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +15.3%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M so'm`, 'Daromad']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Room Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Xonalar Holati
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {roomStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{ 
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {roomStatus.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-7xl mx-auto">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tezkor Amallar
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <Users className="w-5 h-5" />
              <span>Yangi talaba qo'shish</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors">
              <Building className="w-5 h-5" />
              <span>Xona tayinlash</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors">
              <CreditCard className="w-5 h-5" />
              <span>To'lov qo'shish</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            So'nggi Faoliyat
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  To'lov tasdiqlandi
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Akmal Karimov - 850,000 so'm
                </p>
                <p className="text-xs text-gray-400">2 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Yangi ariza
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Malika Tursunova - Xona almashtirish
                </p>
                <p className="text-xs text-gray-400">15 daqiqa oldin</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  To'lov kechikishi
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  3 ta talaba qarzdor
                </p>
                <p className="text-xs text-gray-400">1 soat oldin</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Bugungi Vazifalar
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Arizalarni ko'rib chiqish
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pendingApplications} ta kutilmoqda
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Qarzdorlarni eslatish
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {0} ta qarzdor
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Building className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Xonalarni tekshirish
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2 ta ta'mir kutilmoqda
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;