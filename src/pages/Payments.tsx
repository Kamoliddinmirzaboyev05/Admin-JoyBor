import React, { useState, useEffect } from "react";
import DataTable from "../components/UI/DataTable";
import { CreditCard, Plus, X, Wallet, Eye, Edit, Filter } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../index.css";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiQueries } from "../data/api";
import { useLocation, Link } from "react-router-dom";
import { formatCurrency, formatCurrencyDetailed } from "../utils/formatters";
import { invalidatePaymentCaches } from "../utils/cacheUtils";
import { useGlobalEvents } from "../utils/globalEvents";

const Payments: React.FC = () => {
  const queryClient = useQueryClient();
  const { emitPaymentUpdate, subscribe } = useGlobalEvents();
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

  // Filter states
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [amountRangeFilter, setAmountRangeFilter] = useState("");

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

  // Listen for global payment updates
  useEffect(() => {
    const unsubscribePayment = subscribe('payment-updated', () => {
      refetch();
    });

    // Listen for student updates to refresh student list
    const unsubscribeStudent = subscribe('student-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    });

    return () => {
      unsubscribePayment();
      unsubscribeStudent();
    };
  }, [subscribe, refetch, queryClient]);

  const columns = [
    {
      key: "student",
      title: "Talaba",
      render: (_: unknown, row: Record<string, unknown>) => {
        if (row.student && typeof row.student === "object") {
          const student = row.student as Record<string, unknown>;
          return (
            <Link
              to={`/studentprofile/${student.id}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {`${student.last_name as string} ${student.name as string}`}
            </Link>
          );
        }
        return "-";
      },
      sortable: true,
    },
    {
      key: "amount",
      title: "Miqdor",
      render: (v: unknown) => typeof v === "number" ? formatCurrency(v) : "-",
      sortable: true,
    },
    {
      key: "paid_date",
      title: "To'lov sanasi",
      render: (v: unknown) => typeof v === "string" ? (v ? new Date(v).toLocaleDateString("uz-UZ") : "-") : "-",
      sortable: true,
    },
    {
      key: "method",
      title: "To'lov turi",
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

    // Form malumotlarini toldirish - to'liq ma'lumotlar bilan
    const student = payment.student as Record<string, unknown>;

    // Sanani to'g'ri formatda o'rnatish
    let validUntilDate = "";
    if (payment.valid_until) {
      try {
        const date = new Date(payment.valid_until as string);
        if (!isNaN(date.getTime())) {
          validUntilDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (e) {
        validUntilDate = String(payment.valid_until);
      }
    }

    setForm({
      studentId: student?.id ? String(student.id) : "",
      amount: payment.amount ? String(payment.amount) : "",
      validUntil: validUntilDate,
      paymentType: (payment.method as string)?.toLowerCase() === "cash" ? "cash" : "card",
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
        // Tahrirlash - haqiqiy update API endpoint ishlatish
        const updateData = {
          student: Number(form.studentId),
          amount: Number(form.amount),
          valid_until: form.validUntil,
          method: form.paymentType === "cash" ? "Cash" : "Card",
          status: selectedPayment.status || "APPROVED", // Mavjud statusni saqlash
          comment: form.comment || "",
        };

        // PATCH request for updating existing payment
        const token = sessionStorage.getItem("access");
        if (!token) {
          throw new Error("Avtorizatsiya talab qilinadi");
        }

        const response = await fetch(`https://joyboryangi.pythonanywhere.com/payments/${selectedPayment.id}/`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }

          // Xatolik turini aniqlash
          if (response.status === 404) {
            throw new Error("To'lov topilmadi yoki o'chirilgan");
          } else if (response.status === 403) {
            throw new Error("To'lovni tahrirlash uchun ruxsat yo'q");
          } else if (response.status === 400) {
            const fieldErrors = [];
            if (errorData.student) fieldErrors.push(`Talaba: ${errorData.student}`);
            if (errorData.amount) fieldErrors.push(`Miqdor: ${errorData.amount}`);
            if (errorData.valid_until) fieldErrors.push(`Sana: ${errorData.valid_until}`);
            if (errorData.method) fieldErrors.push(`To'lov turi: ${errorData.method}`);

            if (fieldErrors.length > 0) {
              throw new Error(fieldErrors.join(', '));
            }
          }

          throw new Error(errorData.detail || errorData.message || "To'lovni yangilashda xatolik");
        }

        // Muvaffaqiyatli yangilanganini tekshirish
        await response.json(); // Response ni consume qilish
        toast.success(`To'lov #${selectedPayment.id} muvaffaqiyatli yangilandi!`);

        // Form va modallarni yopish
        setShowModal(false);
        setIsEditMode(false);
        setSelectedPayment(null);

        // Barcha bog'liq cache larni yangilash
        await invalidatePaymentCaches(queryClient);
        // Force immediate refetch
        await refetch();
        // Emit global event
        emitPaymentUpdate({ action: 'updated', id: selectedPayment.id });
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
        toast.success("To'lov muvaffaqiyatli qo'shildi!");

        // Yangi tolov uchun ham form va modallarni yopish
        setShowModal(false);
        setIsEditMode(false);
        setSelectedPayment(null);

        // Barcha bog'liq cache larni yangilash
        await invalidatePaymentCaches(queryClient);
        // Force immediate refetch
        await refetch();
        // Emit global event
        emitPaymentUpdate({ action: 'created' });
      }
    } catch (err: unknown) {
      const errorMessage = isEditMode ? "To'lovni yangilashda xatolik: " : "To'lovni yaratishda xatolik: ";
      const fullErrorMessage = errorMessage + (err instanceof Error ? err.message : "Noma'lum xatolik");

      setError(fullErrorMessage);
      toast.error(fullErrorMessage);

      // Agar 404 yoki 403 xatolik bo'lsa, modallarni yopish
      if (err instanceof Error && (err.message.includes("topilmadi") || err.message.includes("ruxsat yo'q"))) {
        setTimeout(() => {
          setShowModal(false);
          setIsEditMode(false);
          setSelectedPayment(null);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = students.map((s: any) => ({ value: String(s.id), label: `${s.name} ${s.last_name}` }));

  // Filter payments based on selected filters
  const filteredPayments = payments.filter((payment: any) => {
    // Payment method filter
    if (paymentMethodFilter) {
      const method = payment.method?.toLowerCase();
      if (paymentMethodFilter === "cash" && method !== "cash") return false;
      if (paymentMethodFilter === "card" && method !== "card") return false;
    }

    // Date range filter
    if (dateRangeFilter && payment.paid_date) {
      const paymentDate = new Date(payment.paid_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateRangeFilter) {
        case "today":
          const paymentToday = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
          if (paymentToday.getTime() !== today.getTime()) return false;
          break;
        case "week":
          const weekAgo = new Date(today.getTime());
          weekAgo.setDate(today.getDate() - 7);
          if (paymentDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(today.getTime());
          monthAgo.setMonth(today.getMonth() - 1);
          if (paymentDate < monthAgo) return false;
          break;
        case "year":
          const yearAgo = new Date(today.getTime());
          yearAgo.setFullYear(today.getFullYear() - 1);
          if (paymentDate < yearAgo) return false;
          break;
      }
    }

    // Amount range filter
    if (amountRangeFilter && payment.amount) {
      const amount = Number(payment.amount);
      switch (amountRangeFilter) {
        case "low":
          if (amount >= 1000000) return false;
          break;
        case "medium":
          if (amount < 1000000 || amount >= 5000000) return false;
          break;
        case "high":
          if (amount < 5000000) return false;
          break;
      }
    }

    return true;
  });

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
      link.download = `tolovlar_ro'yxati_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("To'lovlar ro'yxati muvaffaqiyatli yuklandi!");
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
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-3 sm:gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg flex items-center justify-center mb-2 sm:mb-0">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">To'lovlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Yotoqxona to'lovlari boshqaruvi
          </p>
        </div>
        <div className="sm:ml-auto">
          <button
            onClick={handleOpen}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>To'lov qo'shish</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filterlar:</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Payment method filter */}
          <div className="min-w-[150px]">
            <Select
              options={[
                { value: "cash", label: "Naqd" },
                { value: "card", label: "Karta orqali" },
              ]}
              value={paymentMethodFilter ? {
                value: paymentMethodFilter, label:
                  paymentMethodFilter === "cash" ? "Naqd" : "Karta orqali"
              } : null}
              onChange={(opt) => setPaymentMethodFilter(opt ? opt.value : "")}
              isClearable
              placeholder="To'lov turi"
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>

          {/* Date range filter */}
          <div className="min-w-[150px]">
            <Select
              options={[
                { value: "today", label: "Bugun" },
                { value: "week", label: "Bu hafta" },
                { value: "month", label: "Bu oy" },
                { value: "year", label: "Bu yil" },
              ]}
              value={dateRangeFilter ? {
                value: dateRangeFilter, label:
                  dateRangeFilter === "today" ? "Bugun" :
                    dateRangeFilter === "week" ? "Bu hafta" :
                      dateRangeFilter === "month" ? "Bu oy" : "Bu yil"
              } : null}
              onChange={(opt) => setDateRangeFilter(opt ? opt.value : "")}
              isClearable
              placeholder="Sana oralig'i"
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>

          {/* Amount range filter */}
          <div className="min-w-[150px]">
            <Select
              options={[
                { value: "low", label: "1M gacha" },
                { value: "medium", label: "1M - 5M" },
                { value: "high", label: "5M dan yuqori" },
              ]}
              value={amountRangeFilter ? {
                value: amountRangeFilter, label:
                  amountRangeFilter === "low" ? "1M gacha" :
                    amountRangeFilter === "medium" ? "1M - 5M" : "5M dan yuqori"
              } : null}
              onChange={(opt) => setAmountRangeFilter(opt ? opt.value : "")}
              isClearable
              placeholder="Summa oralig'i"
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>

          {/* Clear all filters button */}
          {(paymentMethodFilter || dateRangeFilter || amountRangeFilter) && (
            <button
              onClick={() => {
                setPaymentMethodFilter("");
                setDateRangeFilter("");
                setAmountRangeFilter("");
              }}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Filterlarni tozalash
            </button>
          )}
        </div>

        {/* Filter results info */}
        {(paymentMethodFilter || dateRangeFilter || amountRangeFilter) && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPayments.length} ta to'lov topildi ({payments.length} tadan)
          </div>
        )}
      </div>

      <DataTable
        data={filteredPayments}
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
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? "To'lovni tahrirlash" : "Yangi to'lov qo'shish"}
                </h2>
                {isEditMode && selectedPayment && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Faqat summa, sana, to'lov turi va izohni o'zgartirishingiz mumkin
                    </div>
                  </div>
                )}
              </div>
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
                    isDisabled={isEditMode} // Tahrirlash rejimida talabani o'zgartirishga ruxsat bermaslik
                  />
                  {isEditMode && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      ⚠️ Tahrirlash rejimida talabani o'zgartirib bo'lmaydi. Agar boshqa talabaga o'tkazish kerak bo'lsa, yangi to'lov yarating va eskisini o'chiring.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    Miqdor (som)
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {form.amount && formatCurrency(Number(form.amount))}
                    </span>
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formatNumber(form.amount)}
                    onChange={handleAmountChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="Miqdorni kiriting (masalan: 1,200,000)"
                  />
                  {isEditMode && selectedPayment && form.amount && Number(form.amount) !== selectedPayment.amount && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Avvalgi summa: {formatCurrency(selectedPayment.amount)} → Yangi: {formatCurrency(Number(form.amount))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    To'lov amal qilish sanasi
                    {isEditMode && selectedPayment?.valid_until && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Avvalgi: {new Date(selectedPayment.valid_until as string).toLocaleDateString("uz-UZ")})
                      </span>
                    )}
                  </label>
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
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    To'lov turi
                    {isEditMode && selectedPayment?.method && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Avvalgi: {selectedPayment.method === "Cash" ? "Naqd" : "Karta orqali"})
                      </span>
                    )}
                  </label>
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
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 px-6 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors shadow disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        {isEditMode ? "Yangilanmoqda..." : "Qo'shilmoqda..."}
                      </span>
                    ) : (
                      isEditMode ? "Yangilash" : "Qo'shish"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"></div>

              {/* Close button */}
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="relative text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">To'lov ma'lumotlari</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">ID: #{selectedPayment.id}</p>
              </div>

              {/* Content */}
              <div className="relative space-y-6">
                {/* Student info */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedPayment.student && typeof selectedPayment.student === "object"
                          ? `${((selectedPayment.student as any).name as string)[0]}${((selectedPayment.student as any).last_name as string)[0]}`
                          : "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Talaba</p>
                      <Link
                        to={`/studentprofile/${(selectedPayment.student as any)?.id}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {selectedPayment.student && typeof selectedPayment.student === "object"
                          ? `${(selectedPayment.student as any).name} ${(selectedPayment.student as any).last_name}`
                          : "-"}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To'lov miqdori</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof selectedPayment.amount === "number" ? formatCurrencyDetailed(selectedPayment.amount) : "-"}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To'lov sanasi</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPayment.paid_date ? new Date(selectedPayment.paid_date as string).toLocaleDateString("uz-UZ") : "-"}
                    </p>
                  </div>

                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To'lov turi</p>
                    <div className="flex items-center gap-2">
                      {selectedPayment.method === "Cash" ? (
                        <Wallet className="w-4 h-4 text-green-600" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedPayment.method === "Cash" ? "Naqd" : selectedPayment.method === "Card" ? "Karta orqali" : selectedPayment.method}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {selectedPayment.comment && (
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Izoh</p>
                    <p className="text-gray-900 dark:text-white">{selectedPayment.comment as string}</p>
                  </div>
                )}

                {/* Valid until */}
                {selectedPayment.valid_until && (
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amal qilish muddati</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedPayment.valid_until as string).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="relative mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payments;