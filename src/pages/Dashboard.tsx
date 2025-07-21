import React from 'react';
import { Users, Building2, CreditCard, FileText, AlertTriangle, CheckCircle2, Clock4, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '../stores/useAppStore';
import StatsCard from '../components/UI/StatsCard';
import { useEffect, useState } from 'react';
import { get, del, put, apiQueries, post } from '../data/api';
import { useNavigate } from 'react-router-dom';
import { link } from '../data/config';
import { useQuery } from '@tanstack/react-query';

function formatSum(sum: number) {
  return sum.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState<{ id: number; description: string; status: string }[]>([]);
  const [todoLoading, setTodoLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // React Query bilan dashboard ma'lumotlarini olish
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading 
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiQueries.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // React Query bilan monthly revenue ma'lumotlarini olish
  const { 
    data: monthlyRevenue = [], 
    isLoading: monthlyRevenueLoading 
  } = useQuery({
    queryKey: ['monthlyRevenue'],
    queryFn: () => get(`${link}/monthly_revenue/`),
    staleTime: 1000 * 60 * 10, // 10 daqiqa cache
  });

  // React Query bilan recent activities ma'lumotlarini olish
  const { 
    data: recentActivities = [], 
    isLoading: recentActivitiesLoading 
  } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const res = await get(`${link}/recent_activity/`);
      return Array.isArray(res.activities) ? res.activities : [];
    },
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // Fetch todos from backend
  const fetchTodos = async () => {
    setTodoLoading(true);
    try {
      const res = await get(`${link}/tasks/`);
      setTodos(Array.isArray(res) ? res.map((t: any) => ({ id: t.id, description: t.description, status: t.status })) : []);
    } catch {
      setTodos([]);
    } finally {
      setTodoLoading(false);
    }
  };
  useEffect(() => { fetchTodos(); }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodoLoading(true);
      try {
        await post(`${link}/tasks/`, { title: 'Vazifa', description: newTodo.trim(), status: 'PENDING' });
        setNewTodo('');
        setTodoModalOpen(false);
        fetchTodos();
      } catch (err) {
        alert('Vazifa qo‘shishda xatolik: ' + (err?.toString() || 'Noto‘g‘ri so‘rov')); // show user-friendly error
      } finally {
        setTodoLoading(false);
      }
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setTodoLoading(true);
    try {
      await del(`${link}/tasks/${id}/`);
      fetchTodos();
    } finally {
      setTodoLoading(false);
    }
  };

  const handleEditTodo = (id: number, description: string) => {
    setEditId(id);
    setEditValue(description);
  };

  const handleEditSave = async (id: number) => {
    setTodoLoading(true);
    try {
      await put(`${link}/tasks/${id}/`, { title: 'Vazifa', description: editValue, status: 'PENDING' });
      setEditId(null);
      setEditValue('');
      fetchTodos();
    } finally {
      setTodoLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditValue('');
  };

  const handleToggleTodoStatus = async (todo: { id: number; status: string; description: string }) => {
    setTodoLoading(true);
    try {
      await put(`${link}/tasks/${todo.id}/`, {
        title: 'Vazifa',
        description: todo.description,
        status: todo.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
      });
      fetchTodos();
    } finally {
      setTodoLoading(false);
    }
  };

  // Show only loading bar and spinner until data is loaded
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // Use real dashboard data
  const students = dashboardData?.students || { total: 0, male: 0, female: 0 };
  const rooms = dashboardData?.rooms || { total_available: 0, male_rooms: 0, female_rooms: 0 };
  const payments = dashboardData?.payments || { debtor_students_count: 0, non_debtor_students_count: 0, total_payment: 0 };
  const applications = dashboardData?.applications || { total: 0, approved: 0, rejected: 0 };
  const recentApplications = dashboardData?.recent_applications || [];

  // Add this helper for Uzbek month names:
  const uzMonths = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  function formatMonth(monthStr: string) {
    // monthStr: '2025-07'
    const [year, month] = monthStr.split('-');
    const m = parseInt(month, 10);
    return `${uzMonths[m - 1]} ${year}`;
  }

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
            value={students.total}
            change={undefined}
            changeType="neutral"
            icon={Users}
            color="primary"
            trend={undefined}
            subStats={[
              { label: 'Jami', value: students.total },
              { label: 'Yigitlar', value: students.male },
              { label: 'Qizlar', value: students.female },
            ]}
          />
          <StatsCard
            title="Xonalar"
            value={rooms.total_available}
            change={`Yigitlar: ${rooms.male_rooms}, Qizlar: ${rooms.female_rooms}`}
            changeType="neutral"
            icon={Building2}
            color="secondary"
            trend={undefined}
            subStats={[
              { label: "Jami bo'sh", value: rooms.total_available },
              { label: "Yigitlar", value: rooms.male_rooms },
              { label: "Qizlar", value: rooms.female_rooms },
            ]}
          />
          <StatsCard
            title="To'lovlar"
            value={`${(payments.total_payment / 1000000).toFixed(1)}M so'm`}
            change={`Qarzdor: ${payments.debtor_students_count}, To'lagan: ${payments.non_debtor_students_count}`}
            changeType="increase"
            icon={CreditCard}
            color="accent"
            trend={undefined}
            subStats={[
              { label: 'Qarzdor', value: payments.debtor_students_count },
              { label: 'To\'lagan', value: payments.non_debtor_students_count },
              { label: 'Jami', value: formatSum(payments.total_payment) },
            ]}
          />
          <StatsCard
            title="Arizalar"
            value={applications.total}
            change={`Tasdiqlangan: ${applications.approved}, Rad etilgan: ${applications.rejected}`}
            changeType="neutral"
            icon={FileText}
            color="warning"
            trend={undefined}
            subStats={[
              { label: 'Tasdiqlangan', value: applications.approved },
              { label: 'Rad etilgan', value: applications.rejected },
              { label: 'Jami', value: applications.total },
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
          </div>
          {monthlyRevenueLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
            </div>
          ) : monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              Analitik ma'lumotlar mavjud emas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={formatMonth}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value as number).toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm`, 'Daromad']}
                  labelFormatter={formatMonth}
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
          )}
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
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Jami bo'sh", value: rooms.total_available },
                    { name: 'Yigitlar uchun', value: rooms.male_rooms },
                    { name: 'Qizlar uchun', value: rooms.female_rooms },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell key="empty" fill="#3b82f6" />
                  <Cell key="male" fill="#10b981" />
                  <Cell key="female" fill="#f472b6" />
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}`, name]}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#3b82f6' }}></span>
              <span className="text-sm">Jami bo'sh</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#10b981' }}></span>
              <span className="text-sm">Yigitlar uchun</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#f472b6' }}></span>
              <span className="text-sm">Qizlar uchun</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700 min-w-0 flex-1"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Tezkor Amallar
          </h3>
          <div className="space-y-3">
            <button
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              onClick={() => navigate('/students', { state: { openAddModal: true } })}
            >
              <Users className="w-5 h-5" />
              <span>Yangi talaba qo'shish</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 transition-colors"
              onClick={() => navigate('/rooms', { state: { openAddRoomModal: true } })}
            >
              <Building2 className="w-5 h-5" />
              <span>Xona tayinlash</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-colors"
              onClick={() => navigate('/payments', { state: { openAddPaymentModal: true } })}
            >
              <CreditCard className="w-5 h-5" />
              <span>To'lov qo'shish</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Activity Card (move above grid on mobile, first on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700 mb-8 md:mb-0 md:col-span-1 min-w-0"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock4 className="w-5 h-5 text-primary-500" /> So'nggi Faoliyat
          </h3>
          <div className="space-y-4">
            {recentActivitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-gray-400 dark:text-gray-500 text-center py-4">Ma'lumot yo'q</div>
            ) : (recentActivities.slice(0, 3)).map((activity: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  activity.type === 'payment_approved' ? 'bg-green-100 dark:bg-green-900/20' :
                  activity.type === 'debt' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  activity.type === 'new_student' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-gray-100 dark:bg-gray-800/40'
                }`}>
                  {activity.type === 'payment_approved' && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {activity.type === 'debt' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                  {activity.type === 'new_student' && <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {!['payment_approved','debt','new_student'].includes(activity.type) && <FileText className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.desc}</div>
                  <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 border border-gray-200 dark:border-gray-700 relative min-w-0 flex-1"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
            Bugungi Vazifalar
            <button
              className="ml-2 p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              onClick={() => setTodoModalOpen(true)}
              title="Vazifa qo'shish"
            >
              <Plus className="w-5 h-5" />
            </button>
          </h3>
          {/* Zamonaviy modal */}
          {todoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setTodoModalOpen(false)}>
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fadeIn"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded transition-colors"
                  onClick={() => setTodoModalOpen(false)}
                >
                  <X size={22} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yangi vazifa qo'shish</h2>
                <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Vazifa matni..."
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    disabled={todoLoading}
                  >
                    {todoLoading ? 'Yuklanmoqda...' : `Qo'shish`}
                  </button>
                </form>
              </div>
            </div>
          )}
          <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
            {todoLoading ? (
              <div className="flex items-center justify-center py-6">
                <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              </div>
            ) : todos.length > 0 ? todos.map((todo) => (
              <div key={todo.id} className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200">
                {/* Custom round checkbox */}
                <button
                  type="button"
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400 ${todo.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'}`}
                  onClick={() => handleToggleTodoStatus(todo)}
                  aria-label="Bajarildi deb belgilash"
                  style={{ minWidth: 24, minHeight: 24 }}
                >
                  {todo.status === 'COMPLETED' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
                <CheckCircle2 className={`w-4 h-4 ${todo.status === 'COMPLETED' ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`} />
                {editId === todo.id ? (
                  <>
                    <input
                      className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="p-1 rounded bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleEditSave(todo.id)}
                      title="Saqlash"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      onClick={handleEditCancel}
                      title="Bekor qilish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 ${todo.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>{todo.description}</span>
                    <button
                      className="p-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                      onClick={() => handleEditTodo(todo.id, todo.description)}
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeleteTodo(todo.id)}
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )) : (
              <div className="text-gray-400 dark:text-gray-500 text-center py-4">Vazifalar yo'q</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;