import React, { useState, useEffect } from 'react';
// import { useAppStore } from '../stores/useAppStore';
import DataTable from '../components/UI/DataTable';
import { CreditCard, Plus, X, Wallet, Calendar } from 'lucide-react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '../index.css';
import { toast } from 'sonner';
// import NProgress from 'nprogress';
import { useQuery } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { useLocation } from 'react-router-dom';

const Payments: React.FC = () => {
  // const { students, addPayment } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    validUntil: '',
    paymentType: '',
    comment: '',
  });
  const [error, setError] = useState('');
  const location = useLocation();

  // React Query bilan payments ma'lumotlarini olish
  const { 
    data: payments = [], 
    isLoading, 
    error: fetchError, 
    refetch 
  } = useQuery({
    queryKey: ['payments'],
    queryFn: apiQueries.getPayments,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // React Query bilan students ma'lumotlarini olish
  const { 
    data: students = [], 
    isLoading: studentsLoading 
  } = useQuery({
    queryKey: ['students'],
    queryFn: apiQueries.getStudents,
    staleTime: 1000 * 60 * 10, // 10 daqiqa cache
  });

  useEffect(() => {
    if (location.state && (location.state as any).openAddPaymentModal) {
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const columns = [
    {
      key: 'student',
      title: 'Talaba',
      render: (_: unknown, row: Record<string, unknown>) => row.student && typeof row.student === 'object' ? `${(row.student as Record<string, unknown>).name as string} ${(row.student as Record<string, unknown>).last_name as string}` : '-',
      sortable: true,
    },
    {
      key: 'amount',
      title: 'Miqdor',
      render: (v: unknown) => typeof v === 'number' ? v.toLocaleString() + ' so\u2018m' : '-',
      sortable: true,
    },
    {
      key: 'paid_date',
      title: 'To\u2018lov sanasi',
      render: (v: unknown) => typeof v === 'string' ? (v ? new Date(v).toLocaleDateString('uz-UZ') : '-') : '-',
      sortable: true,
    },
    {
      key: 'method',
      title: 'To\u2018lov turi',
      render: (v: unknown) => typeof v === 'string' ? v : '-',
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      render: (v: unknown) => typeof v === 'string' ? v : '-',
      sortable: true,
    },
    {
      key: 'comment',
      title: 'Izoh',
      render: (v: unknown) => typeof v === 'string' ? v : '-',
      sortable: false,
    },
  ];

  const handleOpen = () => {
    setForm({ studentId: '', amount: '', validUntil: '', paymentType: '', comment: '' });
    setError('');
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (opt: { value: string; label: string } | null) => {
    setForm({ ...form, studentId: opt ? opt.value : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.validUntil || !form.paymentType) {
      setError('Barcha maydonlarni to\u2018ldiring!');
      toast.error('Barcha maydonlarni to\u2018ldiring!');
      return;
    }
    setError('');
    try {
      await apiQueries.createPayment({
        student: Number(form.studentId),
        amount: Number(form.amount),
        valid_until: form.validUntil,
        method: form.paymentType === 'cash' ? 'Cash' : 'Card',
        status: 'APPROVED',
        comment: form.comment,
      });
      toast.success('To\u2018lov muvaffaqiyatli qo\u2018shildi!');
      // Yangilash uchun refetch chaqirish
      refetch();
      setShowModal(false);
    } catch (err: unknown) {
      setError('To\u2018lovni yaratishda xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik'));
      toast.error('To\u2018lovni yaratishda xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik'));
    }
  };

  const studentOptions = students.map((s: any) => ({ value: String(s.id), label: `${s.name} ${s.last_name}` }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
      borderColor: state.isFocused ? (document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6') : (document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db'),
      boxShadow: state.isFocused ? `0 0 0 2px ${document.documentElement.classList.contains('dark') ? '#60a5fa' : '#3b82f6'}` : undefined,
      minHeight: 40,
      fontSize: 15,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (base: any) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    singleValue: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#111827',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholder: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center py-10 text-red-600 dark:text-red-400">
        Ma'lumotlarni yuklashda xatolik yuz berdi. 
        <button 
          onClick={() => refetch()} 
          className="ml-2 text-blue-600 hover:underline"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">To'lovlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yotoqxona to'lovlari boshqaruvi
          </p>
        </div>
        <div className="ml-auto flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Yangilash
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>To'lov qo'shish</span>
          </button>
        </div>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={10}
      />

      {/* Modal for adding payment */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Yangi to‘lov qo‘shish</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Talaba</label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.find(opt => opt.value === Number(form.studentId)) || null}
                    onChange={handleSelectChange}
                    isClearable
                    placeholder="Talabani tanlang..."
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Miqdor (so‘m)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    min={0}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">To‘lov amal qilish sanasi</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={form.validUntil ? new Date(form.validUntil) : null}
                      onChange={date => setForm(f => ({ ...f, validUntil: date ? date.toISOString().slice(0, 10) : '' }))}
                      format="yyyy-MM-dd"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          placeholder: 'Sanani tanlang',
                          InputProps: {
                            startAdornment: (
                              <span className="pl-2 pr-2 flex items-center">
                                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                              </span>
                            ),
                            className: 'rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-11 text-base',
                            style: { paddingLeft: 0, height: '44px', fontSize: '1rem' },
                          },
                          InputLabelProps: {
                            shrink: true,
                            className: 'text-gray-900 dark:text-gray-200',
                          },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0.5rem',
                              backgroundColor: 'var(--mui-bg, #fff)',
                              color: 'var(--mui-text, #111827)',
                              minHeight: '44px',
                              fontSize: '1rem',
                              padding: 0,
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'var(--mui-border, #d1d5db)',
                            },
                            '& .MuiInputBase-input': {
                              color: 'var(--mui-text, #111827)',
                              backgroundColor: 'transparent',
                              minHeight: '44px',
                              fontSize: '1rem',
                              padding: 0,
                            },
                            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2563eb',
                            },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#2563eb',
                            },
                            '& .MuiOutlinedInput-root.Mui-focused': {
                              boxShadow: '0 0 0 2px #2563eb33',
                            },
                            // Dark mode overrides
                            '@media (prefers-color-scheme: dark)': {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1f2937',
                                color: '#fff',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#374151',
                              },
                              '& .MuiInputBase-input': {
                                color: '#fff',
                              },
                            },
                          },
                        },
                        popper: {
                          sx: {
                            '& .MuiPaper-root': {
                              backgroundColor: 'var(--mui-bg, #fff)',
                              color: 'var(--mui-text, #111827)',
                              borderRadius: '0.75rem',
                              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                              border: '1px solid var(--mui-border, #d1d5db)',
                              minWidth: '280px',
                            },
                            '& .MuiPickersDay-root': {
                              fontSize: '1rem',
                              borderRadius: '0.5rem',
                              color: '#111827',
                            },
                            '& .MuiPickersDay-root.Mui-selected': {
                              backgroundColor: '#2563eb',
                              color: '#fff',
                            },
                            '& .MuiPickersDay-root:focus': {
                              outline: '2px solid #2563eb',
                            },
                            '& .MuiPickersDay-root:hover': {
                              backgroundColor: '#2563eb22',
                            },
                            '& .MuiPickersCalendarHeader-label': {
                              fontWeight: 600,
                              fontSize: '1rem',
                            },
                            // Dark mode overrides
                            '@media (prefers-color-scheme: dark)': {
                              '& .MuiPaper-root': {
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                border: '1px solid #374151',
                              },
                              '& .MuiPickersDay-root': {
                                color: '#e5e7eb',
                              },
                              '& .MuiPickersDay-root.Mui-selected': {
                                backgroundColor: '#2563eb',
                                color: '#fff',
                              },
                              '& .MuiPickersDay-root:focus': {
                                outline: '2px solid #2563eb',
                              },
                              '& .MuiPickersDay-root:hover': {
                                backgroundColor: '#2563eb44',
                              },
                              '& .MuiPickersCalendarHeader-label': {
                                color: '#fff',
                              },
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">To‘lov turi</label>
                  <div className="flex gap-4 mt-2">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer select-none shadow-sm focus-within:ring-2 focus-within:ring-primary-500 ${form.paymentType === 'cash' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}` }>
                      <Wallet className={`w-5 h-5 ${form.paymentType === 'cash' ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
                      <input
                        type="radio"
                        name="paymentType"
                        value="cash"
                        checked={form.paymentType === 'cash'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${form.paymentType === 'cash' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>Naqd</span>
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer select-none shadow-sm focus-within:ring-2 focus-within:ring-primary-500 ${form.paymentType === 'card' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}` }>
                      <CreditCard className={`w-5 h-5 ${form.paymentType === 'card' ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
                      <input
                        type="radio"
                        name="paymentType"
                        value="card"
                        checked={form.paymentType === 'card'}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${form.paymentType === 'card' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200'}`}>Karta</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Izoh</label>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                    placeholder="Izoh..."
                  />
                </div>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors text-lg mt-2 shadow"
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