import React, { useState, useEffect } from "react";
import DataTable from "../components/UI/DataTable";
import { CreditCard, Plus, X, Wallet, Eye, Edit } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../index.css";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiQueries } from "../data/api";
import { useLocation } from "react-router-dom";

const Payments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    validUntil: "",
    paymentType: "",
    comment: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // React Query bilan payments ma'lumotlarini olish
  const {
    data: payments = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ["payments"],
    queryFn: apiQueries.getPayments,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
  });

  // React Query bilan students ma'lumotlarini olish
  const {
    data: students = []
  } = useQuery({
    queryKey: ["students"],
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
      key: "student",
      title: "Talaba",
      render: (_: unknown, row: Record<string, unknown>) => row.student && typeof row.student === "object" ? `${(row.student as Record<string, unknown>).name as string} ${(row.student as Record<string, unknown>).last_name as string}` : "-",
      sortable: true,
    },
    {
      key: "amount",
      title: "Miqdor",
      render: (v: unknown) => typeof v === "number" ? v.toLocaleString() + " som" : "-",
      sortable: true,
    },
    {
      key: "paid_date",
      title: "Tolov sanasi",
      render: (v: unknown) => typeof v === "string" ? (v ? new Date(v).toLocaleDateString("uz-UZ") : "-") : "-",
      sortable: true,
    },
    {
      key: "method",
      title: "Tolov turi",
      render: (v: unknown) => {
        if (typeof v === "string") {
          return v.toLowerCase() === "cash" ? "Naqd" : v.toLowerCase() === "card" ? "Karta orqali" : v;
        }
        return "-";
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Amallar",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Korish"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Tahrirlash"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  const handleOpen = () => {
    setForm({ studentId: "", amount: "", validUntil: "", paymentType: "", comment: "" });
    setError("");
    setIsEditMode(false);
    setSelectedPayment(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedPayment(null);
  };

  const handleView = (payment: Record<string, unknown>) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleEdit = (payment: Record<string, unknown>) => {
    setSelectedPayment(payment);
    setIsEditMode(true);

    // Form malumotlarini toldirish
    const student = payment.student as Record<string, unknown>;
    setForm({
      studentId: student?.id ? String(student.id) : "",
      amount: payment.amount ? String(payment.amount) : "",
      validUntil: payment.valid_until ? String(payment.valid_until) : "",
      paymentType: payment.method === "Cash" ? "cash" : "card",
      comment: payment.comment ? String(payment.comment) : "",
    });

    setError("");
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (opt: { value: string; label: string } | null) => {
    setForm({ ...form, studentId: opt ? opt.value : "" });
  };

  // Raqamni formatlash funksiyasi
  const formatNumber = (value: string) => {
    // Faqat raqamlarni qoldirish
    const numericValue = value.replace(/[^\d]/g, "");
    // Raqamni formatlash (1000 -> 1,000)
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Formatni olib tashlash funksiyasi
  const unformatNumber = (value: string) => {
    return value.replace(/,/g, "");
  };

  // Amount input uchun maxsus handler
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const unformattedValue = unformatNumber(rawValue);
    const formattedValue = formatNumber(unformattedValue);

    setForm({ ...form, amount: unformattedValue });
    e.target.value = formattedValue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.amount || !form.validUntil || !form.paymentType) {
      setError("Barcha maydonlarni toldiring!");
      toast.error("Barcha maydonlarni toldiring!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isEditMode && selectedPayment) {
        // Tahrirlash - updatePayment funksiyasi mavjud emas, shuning uchun createPayment ishlatamiz
        await apiQueries.createPayment({
          student: Number(form.studentId),
          amount: Number(form.amount),
          valid_until: form.validUntil,
          method: form.paymentType === "cash" ? "Cash" : "Card",
          status: "APPROVED",
          comment: form.comment,
        });
        toast.success("Tolov muvaffaqiyatli yangilandi!");
      } else {
        // Yangi qoshish
        await apiQueries.createPayment({
          student: Number(form.studentId),
          amount: Number(form.amount),
          valid_until: form.validUntil,
          method: form.paymentType === "cash" ? "Cash" : "Card",
          status: "APPROVED",
          comment: form.comment,
        });
        toast.success("Tolov muvaffaqiyatli qoshildi!");
      }
      refetch();
      setShowModal(false);
    } catch (err: unknown) {
      const errorMessage = isEditMode ? "Tolovni yangilashda xatolik: " : "Tolovni yaratishda xatolik: ";
      setError(errorMessage + (err instanceof Error ? err.message : "Nomalum xatolik"));
      toast.error(errorMessage + (err instanceof Error ? err.message : "Nomalum xatolik"));
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = students.map((s: any) => ({ value: String(s.id), label: `${s.name} ${s.last_name}` }));

  // Export handler for DataTable
  const handleExportPayments = async () => {
    try {
      const token = sessionStorage.getItem("access");
      if (!token) {
        toast.error("Avtorizatsiya talab qilinadi!");
        return;
      }
      const response = await fetch("https://joyboryangi.pythonanywhere.com/export-payment/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json",
        },
      });
      if (!response.ok) {
        toast.error("Export xatolik yuz berdi!");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tolovlar_royxati_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Tolovlar royxati muvaffaqiyatli yuklandi!");
    } catch (error) {
      toast.error("Export xatolik yuz berdi!");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#111827",
      borderColor: state.isFocused ? (document.documentElement.classList.contains("dark") ? "#60a5fa" : "#3b82f6") : (document.documentElement.classList.contains("dark") ? "#374151" : "#d1d5db"),
      boxShadow: state.isFocused ? `0 0 0 2px ${document.documentElement.classList.contains("dark") ? "#60a5fa" : "#3b82f6"}` : undefined,
      minHeight: 40,
      fontSize: 15,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (base: any) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains("dark") ? "#1f2937" : "#fff",
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#111827",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    singleValue: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#111827",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#fff" : "#111827",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    placeholder: (base: any) => ({
      ...base,
      color: document.documentElement.classList.contains("dark") ? "#d1d5db" : "#6b7280",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (document.documentElement.classList.contains("dark") ? "#2563eb" : "#3b82f6")
        : state.isFocused
          ? (document.documentElement.classList.contains("dark") ? "#374151" : "#e0e7ef")
          : "transparent",
      color: state.isSelected || document.documentElement.classList.contains("dark") ? "#fff" : "#111827",
      cursor: "pointer",
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
        Malumotlarni yuklashda xatolik yuz berdi.
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
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-3 sm:gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tolovlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Yotoqxona tolovlari boshqaruvi
          </p>
        </div>
        <div className="sm:ml-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-3 sm:mt-0">
          <button
            onClick={() => refetch()}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Yangilash
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tolov qoshish</span>
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
        onExport={handleExportPayments}
      />

      {/* Modal for adding/editing payment */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 sm:p-8 w-full max-w-md relative flex flex-col gap-4 sm:gap-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-6">
                {isEditMode ? "Tolovni tahrirlash" : "Yangi tolov qoshish"}
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 pb-6 sm:pb-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Talaba</label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.find((opt: { value: string; label: string }) => opt.value === form.studentId) || null}
                    onChange={handleSelectChange}
                    isClearable
                    placeholder="Talabani tanlang..."
                    styles={selectStyles}
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Miqdor (som)</label>
                  <input
                    type="text"
                    name="amount"
                    value={formatNumber(form.amount)}
                    onChange={handleAmountChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Tolov amal qilish sanasi</label>
                  <div className="flex w-full min-w-0">
                    <div className="relative w-full min-w-0 block">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1zm10 4V6H7v.01H5V20h14V6h-2zm-7 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z" />
                        </svg>
                      </span>
                      <DatePicker
                        selected={form.validUntil ? new Date(form.validUntil) : null}
                        onChange={(date: Date | null) => setForm(f => ({ ...f, validUntil: date ? date.toISOString().slice(0, 10) : "" }))}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="YYYY-MM-DD"
                        className="w-full min-w-0 block pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-11 text-base"
                        calendarClassName="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white !border !border-gray-300 dark:!border-gray-700 !rounded-xl"
                        dayClassName={(date: Date) =>
                          `!rounded-md !font-normal ${date && form.validUntil && date.toISOString().slice(0, 10) === form.validUntil ? "!bg-primary-600 !text-white" : "!text-gray-900 dark:!text-gray-100"} hover:!bg-primary-100 dark:hover:!bg-primary-900/30`
                        }
                        popperClassName="z-50"
                        showPopperArrow={false}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">Tolov turi</label>
                  <div className="flex gap-4 mt-2">
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer select-none shadow-sm focus-within:ring-2 focus-within:ring-primary-500 ${form.paymentType === "cash" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/30" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
                      <Wallet className={`w-5 h-5 ${form.paymentType === "cash" ? "text-primary-600" : "text-gray-400 dark:text-gray-500"}`} />
                      <input
                        type="radio"
                        name="paymentType"
                        value="cash"
                        checked={form.paymentType === "cash"}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${form.paymentType === "cash" ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-200"}`}>Naqd</span>
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors cursor-pointer select-none shadow-sm focus-within:ring-2 focus-within:ring-primary-500 ${form.paymentType === "card" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/30" : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
                      <CreditCard className={`w-5 h-5 ${form.paymentType === "card" ? "text-primary-600" : "text-gray-400 dark:text-gray-500"}`} />
                      <input
                        type="radio"
                        name="paymentType"
                        value="card"
                        checked={form.paymentType === "card"}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${form.paymentType === "card" ? "text-primary-700 dark:text-primary-300" : "text-gray-700 dark:text-gray-200"}`}>Karta</span>
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
                  className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors text-lg mt-2 shadow disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      {isEditMode ? "Yangilanmoqda..." : "Qoshilmoqda..."}
                    </span>
                  ) : (
                    isEditMode ? "Yangilash" : "Qoshish"
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">Tolov malumotlari</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Talaba</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedPayment.student && typeof selectedPayment.student === "object"
                      ? `${(selectedPayment.student as any).name} ${(selectedPayment.student as any).last_name}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Miqdor</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {typeof selectedPayment.amount === "number" ? selectedPayment.amount.toLocaleString() + " som" : "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tolov sanasi</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedPayment.paid_date ? new Date(selectedPayment.paid_date as string).toLocaleDateString("uz-UZ") : "-"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tolov turi</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedPayment.method === "Cash" ? "Naqd" : selectedPayment.method === "Card" ? "Karta orqali" : selectedPayment.method}
                  </p>
                </div>

                {selectedPayment.comment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Izoh</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedPayment.comment as string}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;