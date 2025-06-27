import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import DataTable from '../components/UI/DataTable';
import { CreditCard, Plus, X } from 'lucide-react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';

const Payments: React.FC = () => {
  const { payments, students, addPayment } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    month: '',
    status: 'paid',
    paymentDate: '',
    transactionId: '',
  });
  const [error, setError] = useState('');

  const columns = [
    { key: 'studentName', title: 'Talaba', sortable: true },
    { key: 'amount', title: 'Miqdor', sortable: true, render: (v: number) => v.toLocaleString() + ' so‘m' },
    { key: 'month', title: 'Oy', sortable: true },
    { key: 'status', title: 'Holat', sortable: true, render: (v: string) => (
      <span className={
        v === 'paid' ? 'text-green-600 font-semibold' : v === 'pending' ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'
      }>
        {v === 'paid' ? 'To‘langan' : v === 'pending' ? 'Kutilmoqda' : 'Kechikkan'}
      </span>
    ) },
    { key: 'paymentDate', title: 'To‘lov sanasi', sortable: true, render: (v: string) => new Date(v).toLocaleDateString('uz-UZ') },
    { key: 'transactionId', title: 'Tranzaksiya ID', sortable: false },
  ];

  const handleOpen = () => {
    setForm({ studentId: '', amount: '', month: '', status: 'paid', paymentDate: '', transactionId: '' });
    setError('');
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (option: any) => {
    setForm({ ...form, studentId: option ? option.value : '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.month || !form.status || !form.paymentDate) {
      setError('Barcha maydonlarni to‘ldiring!');
      return;
    }
    addPayment({
      studentId: form.studentId,
      studentName: students.find(s => s.id === form.studentId)?.firstName + ' ' + students.find(s => s.id === form.studentId)?.lastName,
      amount: Number(form.amount),
      month: form.month,
      status: form.status as any,
      paymentDate: form.paymentDate,
      transactionId: form.transactionId,
    });
    setShowModal(false);
  };

  const studentOptions = students.map(s => ({ value: s.id, label: s.firstName + ' ' + s.lastName }));

  // react-select custom styles for dark mode
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'var(--tw-bg-opacity,1) #fff',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : undefined,
      minHeight: 40,
      fontSize: 15,
      ...(document.documentElement.classList.contains('dark') && {
        backgroundColor: '#1f2937',
        color: '#fff',
        borderColor: state.isFocused ? '#60a5fa' : '#374151',
      })
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (document.documentElement.classList.contains('dark') ? '#2563eb' : '#3b82f6')
        : state.isFocused
        ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e0e7ef')
        : 'transparent',
      color: state.isSelected || document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">To‘lovlar</h1>
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow transition-colors"
        >
          <Plus className="w-5 h-5" />
          To‘lov qo‘shish
        </button>
      </div>
      <DataTable
        data={payments}
        columns={columns}
        searchable={true}
        filterable={false}
        pagination={true}
        pageSize={8}
      />

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md relative"
            >
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yangi to‘lov qo‘shish</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Talaba</label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.find(opt => opt.value === form.studentId) || null}
                    onChange={handleSelectChange}
                    isClearable
                    placeholder="Talabani tanlang..."
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Miqdor (so‘m)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Oy</label>
                  <input
                    type="text"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="2024-12"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Holat</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="paid">To‘langan</option>
                    <option value="pending">Kutilmoqda</option>
                    <option value="overdue">Kechikkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To‘lov sanasi</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={form.paymentDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tranzaksiya ID (ixtiyoriy)</label>
                  <input
                    type="text"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
                >
                  Qo‘shish
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments; 