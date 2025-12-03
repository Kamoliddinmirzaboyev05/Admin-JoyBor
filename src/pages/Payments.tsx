import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "../components/UI/DataTable";
import { CreditCard, Plus, X, Wallet, Eye, Edit, Calendar } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../index.css";
import { toast } from "sonner";
import { useLocation, Link } from "react-router-dom";
import { formatCurrency, formatCurrencyDetailed } from "../utils/formatters";

// Type definitions
interface Student extends Record<string, unknown> {
  id: number;
  name: string;
  last_name: string;
}

interface Payment extends Record<string, unknown> {
  id: number;
  student: Student;
  amount: number;
  paid_date: string;
  valid_until: string;
  method: "Cash" | "Card";
  status: string;
  comment?: string;
}

const Payments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Filter states
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [amountRangeFilter, setAmountRangeFilter] = useState("");

  // Dark mode holatini kuzatish
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // MutationObserver bilan dark mode o'zgarishlarini kuzatish
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Demo payments ma'lumotlari (API vaqtincha o'chirilgan)
  const payments: Payment[] = useMemo(() => [
    {
      id: 1,
      student: { id: 1, name: 'Alisher', last_name: 'Valiyev' },
      amount: 350000,
      paid_date: '2024-01-15',
      valid_until: '2024-02-15',
      method: 'Cash',
      status: 'paid',
      comment: 'Oylik to\'lov'
    },
    {
      id: 2,
      student: { id: 2, name: 'Dilnoza', last_name: 'Karimova' },
      amount: 350000,
      paid_date: '2024-01-14',
      valid_until: '2024-02-14',
      method: 'Card',
      status: 'paid',
      comment: 'Oylik to\'lov'
    },
    {
      id: 3,
      student: { id: 3, name: 'Sardor', last_name: 'Toshmatov' },
      amount: 350000,
      paid_date: '2024-01-13',
      valid_until: '2024-02-13',
      method: 'Cash',
      status: 'pending',
      comment: 'Oylik to\'lov'
    },
  ], []);
  const isLoading = false;
  const fetchError = null;
  const refetch = useCallback(() => Promise.resolve(), []);

  // Demo students ma'lumotlari
  const students: Student[] = useMemo(() => [
    { id: 1, name: 'Alisher', last_name: 'Valiyev' },
    { id: 2, name: 'Dilnoza', last_name: 'Karimova' },
    { id: 3, name: 'Sardor', last_name: 'Toshmatov' },
  ], []);
  const studentsLoading = false;

  useEffect(() => {
    if (location.state && (location.state as { openAddPaymentModal?: boolean }).openAddPaymentModal) {
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Listen for global payment updates
  useEffect(() => {
    const handlePaymentUpdate = () => {
      refetch();
    };
    
    const handleStudentUpdate = () => {
      refetch(); // Demo rejimda faqat refetch qilamiz
    };

    window.addEventListener('payment-updated', handlePaymentUpdate);
    window.addEventListener('student-updated', handleStudentUpdate);

    return () => {
      window.removeEventListener('payment-updated', handlePaymentUpdate);
      window.removeEventListener('student-updated', handleStudentUpdate);
    };
  }, [refetch]);

  const columns = [
    {
      key: "student",
      title: "Talaba",
      render: (_: unknown, row: Record<string, unknown>): React.ReactNode => {
        if (row.student && typeof row.student === "object") {
          const student = row.student as { id: number; name: string; last_name: string };
          return (
            <Link
              to={`/studentprofile/${student.id}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {`${student.last_name} ${student.name}`}
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
      render: (amount: unknown): React.ReactNode => {
        return typeof amount === "number" ? formatCurrency(amount) : "-";
      },
      sortable: true,
    },
    {
      key: "paid_date",
      title: "To'lov sanasi",
      render: (date: unknown): React.ReactNode => {
        return typeof date === "string" && date ? new Date(date).toLocaleDateString("uz-UZ") : "-";
      },
      sortable: true,
    },
    {
      key: "method",
      title: "To'lov turi",
      render: (method: unknown): React.ReactNode => {
        if (typeof method === "string") {
          return method.toLowerCase() === "cash" ? "Naqd" : method.toLowerCase() === "card" ? "Karta orqali" : method;
        }
        return "-";
      },
      sortable: true,
    },
    {
      key: "actions",
      title: "Amallar",
      render: (_: unknown, row: Record<string, unknown>): React.ReactNode => {
        // Type assertion to Payment for our handlers
        const payment = row as Payment;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(payment)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Ko'rish"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(payment)}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Tahrirlash"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        );
      },
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

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditMode(true);

    // Sanani to'g'ri formatda o'rnatish
    let validUntilDate = "";
    if (payment.valid_until) {
      try {
        const date = new Date(payment.valid_until);
        if (!isNaN(date.getTime())) {
          validUntilDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch {
        validUntilDate = String(payment.valid_until);
      }
    }

    setForm({
      studentId: payment.student?.id ? String(payment.student.id) : "",
      amount: payment.amount ? String(payment.amount) : "",
      validUntil: validUntilDate,
      paymentType: payment.method?.toLowerCase() === "cash" ? "cash" : "card",
      comment: payment.comment || "",
    });

    setError("");
    setShowModal(true);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback((opt: { value: string; label: string } | null) => {
    setForm(prev => ({ ...prev, studentId: opt ? opt.value : "" }));
  }, []);

  // Raqamni formatlash funksiyasi
  const formatNumber = useCallback((value: string) => {
    if (!value) return "";
    // Faqat raqamlarni qoldirish
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    // Raqamni formatlash (1000 -> 1,000)
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  // Formatni olib tashlash funksiyasi
  const unformatNumber = useCallback((value: string) => {
    return value.replace(/[^\d]/g, "");
  }, []);

  // Amount input uchun maxsus handler
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const unformattedValue = unformatNumber(rawValue);

    // Maksimal qiymat tekshiruvi (100 million som)
    const numericValue = Number(unformattedValue);
    if (numericValue > 100000000) {
      toast.error("Maksimal summa 100,000,000 som bo'lishi mumkin");
      return;
    }

    setForm(prev => ({ ...prev, amount: unformattedValue }));

    // Input qiymatini formatlangan holda ko'rsatish
    e.target.value = formatNumber(unformattedValue);
  }, [formatNumber, unformatNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation - yaxshilangan
    const errors: string[] = [];

    if (!form.studentId.trim()) {
      errors.push("Talabani tanlang");
    }

    if (!form.amount.trim()) {
      errors.push("To'lov miqdorini kiriting");
    } else {
      const amount = Number(form.amount);
      if (isNaN(amount)) {
        errors.push("To'lov miqdori faqat raqam bo'lishi kerak");
      } else if (amount <= 0) {
        errors.push("To'lov miqdori 0 dan katta bo'lishi kerak");
      } else if (amount < 100000) {
        errors.push("Minimal to'lov miqdori 100,000 som bo'lishi kerak");
      } else if (amount > 100000000) {
        errors.push("Maksimal to'lov miqdori 100,000,000 som bo'lishi mumkin");
      }
    }

    if (!form.validUntil.trim()) {
      errors.push("To'lov amal qilish sanasini tanlang");
    } else {
      const selectedDate = new Date(form.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push("To'lov sanasi bugungi kundan kechroq bo'lishi kerak");
      }
    }

    if (!form.paymentType.trim()) {
      errors.push("To'lov turini tanlang");
    }

    if (errors.length > 0) {
      const errorMessage = errors.join(". ");
      setError(errorMessage);
      toast.error(errorMessage);
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

        const response = await fetch(`https://joyborv1.pythonanywhere.com/payments/${selectedPayment.id}/`, {
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

        // Force immediate refetch
        await refetch();
        // Emit global event
        window.dispatchEvent(new CustomEvent('payment-updated', { detail: { action: 'updated', id: selectedPayment.id } }));
      } else {
        // Yangi qoshish - Demo rejimda
        toast.success("To'lov muvaffaqiyatli qo'shildi!");

        // Yangi tolov uchun ham form va modallarni yopish
        setShowModal(false);
        setIsEditMode(false);
        setSelectedPayment(null);

        // Force immediate refetch
        await refetch();
        // Emit global event
        window.dispatchEvent(new CustomEvent('payment-updated', { detail: { action: 'created' } }));
      }
    } catch (err: unknown) {
      console.error("Payment operation error:", err);

      const errorMessage = isEditMode ? "To'lovni yangilashda xatolik: " : "To'lovni yaratishda xatolik: ";
      let fullErrorMessage = errorMessage;

      if (err instanceof Error) {
        fullErrorMessage += err.message;
      } else if (typeof err === 'string') {
        fullErrorMessage += err;
      } else {
        fullErrorMessage += "Noma'lum xatolik yuz berdi";
      }

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

  // Student options - optimizatsiya qilingan
  const studentOptions = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students
      .filter((s: Student) => s.id && s.name && s.last_name)
      .map((s: Student) => ({
        value: String(s.id),
        label: `${s.last_name} ${s.name}` // Familiya birinchi
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'uz')); // Alifbo tartibida
  }, [students]);

  // Filter payments based on selected filters - optimizatsiya qilingan
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];

    return payments.filter((payment: Payment) => {
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
          case "today": {
            const paymentToday = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
            if (paymentToday.getTime() !== today.getTime()) return false;
            break;
          }
          case "week": {
            const weekAgo = new Date(today.getTime());
            weekAgo.setDate(today.getDate() - 7);
            if (paymentDate < weekAgo) return false;
            break;
          }
          case "month": {
            const monthAgo = new Date(today.getTime());
            monthAgo.setMonth(today.getMonth() - 1);
            if (paymentDate < monthAgo) return false;
            break;
          }
          case "year": {
            const yearAgo = new Date(today.getTime());
            yearAgo.setFullYear(today.getFullYear() - 1);
            if (paymentDate < yearAgo) return false;
            break;
          }
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
  }, [payments, paymentMethodFilter, dateRangeFilter, amountRangeFilter]);

  // Export handler for DataTable
  const handleExportPayments = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("access");
      if (!token) {
        toast.error("Avtorizatsiya talab qilinadi!");
        return;
      }

      toast.info("Export boshlanmoqda...");

      const response = await fetch("https://joyborv1.pythonanywhere.com/export-payment/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export error:", errorText);
        toast.error(`Export xatolik: ${response.status} ${response.statusText}`);
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
      console.error("Export error:", error);
      toast.error("Export xatolik yuz berdi!");
    }
  }, []);

  // React Select uchun dinamik styles
  const selectStyles = useMemo(() => ({
    control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      color: isDarkMode ? "#fff" : "#111827",
      borderColor: state.isFocused
        ? (isDarkMode ? "#60a5fa" : "#3b82f6")
        : (isDarkMode ? "#374151" : "#d1d5db"),
      boxShadow: state.isFocused
        ? `0 0 0 2px ${isDarkMode ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
        : "none",
      minHeight: 42,
      fontSize: 14,
      borderRadius: 8,
      transition: "all 0.2s ease",
      '&:hover': {
        borderColor: isDarkMode ? "#4b5563" : "#9ca3af"
      }
    }),
    menu: (base: Record<string, unknown>) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      color: isDarkMode ? "#fff" : "#111827",
      borderRadius: 8,
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      boxShadow: isDarkMode
        ? "0 10px 25px rgba(0, 0, 0, 0.3)"
        : "0 10px 25px rgba(0, 0, 0, 0.1)",
      zIndex: 9999
    }),
    menuList: (base: Record<string, unknown>) => ({
      ...base,
      padding: 4
    }),
    singleValue: (base: Record<string, unknown>) => ({
      ...base,
      color: isDarkMode ? "#fff" : "#111827",
    }),
    input: (base: Record<string, unknown>) => ({
      ...base,
      color: isDarkMode ? "#fff" : "#111827",
    }),
    placeholder: (base: Record<string, unknown>) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
    option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (isDarkMode ? "#2563eb" : "#3b82f6")
        : state.isFocused
          ? (isDarkMode ? "#374151" : "#f3f4f6")
          : "transparent",
      color: state.isSelected
        ? "#fff"
        : (isDarkMode ? "#e5e7eb" : "#111827"),
      cursor: "pointer",
      borderRadius: 6,
      margin: "2px 0",
      padding: "8px 12px",
      transition: "all 0.15s ease",
      '&:active': {
        backgroundColor: isDarkMode ? "#1d4ed8" : "#2563eb"
      }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base: Record<string, unknown>) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      '&:hover': {
        color: isDarkMode ? "#60a5fa" : "#3b82f6"
      }
    }),
    clearIndicator: (base: Record<string, unknown>) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      '&:hover': {
        color: isDarkMode ? "#ef4444" : "#dc2626"
      }
    })
  }), [isDarkMode]);

  if (isLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
          <p className="text-gray-600 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</p>
        </div>
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
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg relative flex flex-col gap-4 sm:gap-6 max-h-[95vh] overflow-y-auto"
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 pb-6 sm:pb-8">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    Talaba
                    {form.studentId && studentOptions.length > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400 ml-2">✓</span>
                    )}
                  </label>
                  <Select
                    options={studentOptions}
                    value={studentOptions.filter((opt: { value: string; label: string }) => opt.value === form.studentId)[0] || null}
                    onChange={handleSelectChange}
                    isClearable={!isEditMode}
                    placeholder={studentsLoading ? "Talabalar yuklanmoqda..." : "Talabani qidiring yoki tanlang..."}
                    styles={selectStyles}
                    classNamePrefix="react-select"
                    isDisabled={isEditMode || studentsLoading}
                    isLoading={studentsLoading}
                    isSearchable={true}
                    noOptionsMessage={() => "Talaba topilmadi"}
                    loadingMessage={() => "Yuklanmoqda..."}
                  />
                  {isEditMode && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">⚠️ Eslatma:</span>
                      </div>
                      <p className="mt-1">Tahrirlash rejimida talabani o'zgartirib bo'lmaydi. Agar boshqa talabaga o'tkazish kerak bo'lsa, yangi to'lov yarating.</p>
                    </div>
                  )}
                  {!isEditMode && studentOptions.length === 0 && !studentsLoading && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      Talabalar ro'yxati bo'sh yoki yuklanmadi. Iltimos, sahifani yangilang.
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    To'lov miqdori (som)
                    {form.amount && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-2">
                        = {formatCurrency(Number(form.amount))}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none z-10">
                      <span className="text-sm font-medium">UZS</span>
                    </span>
                    <input
                      type="text"
                      name="amount"
                      value={formatNumber(form.amount)}
                      onChange={handleAmountChange}
                      className="w-full pl-12 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-right"
                      required
                      placeholder="1,200,000"
                      autoComplete="off"
                    />
                  </div>
                  {isEditMode && selectedPayment && form.amount && Number(form.amount) !== selectedPayment.amount && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span>Avvalgi:</span>
                        <span className="font-medium">{selectedPayment.amount ? formatCurrency(selectedPayment.amount) : '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Yangi:</span>
                        <span className="font-medium">{formatCurrency(Number(form.amount))}</span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimal: 100,000 som • Maksimal: 100,000,000 som
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-200">
                    To'lov amal qilish sanasi
                    {isEditMode && selectedPayment?.valid_until && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        (Avvalgi: {selectedPayment.valid_until ? new Date(selectedPayment.valid_until).toLocaleDateString("uz-UZ") : '-'})
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 pointer-events-none z-10">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <DatePicker
                      selected={form.validUntil ? new Date(form.validUntil) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          // Tanlangan sanani tekshirish
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          if (date < today) {
                            toast.error("To'lov sanasi bugungi kundan kechroq bo'lishi kerak");
                            return;
                          }
                        }
                        setForm(f => ({ ...f, validUntil: date ? date.toISOString().slice(0, 10) : "" }));
                      }}
                      dateFormat="dd.MM.yyyy"
                      placeholderText="Sanani tanlang..."
                      minDate={new Date()} // Bugungi kundan oldingi sanalarni tanlash mumkin emas
                      className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      calendarClassName="shadow-xl border border-gray-200 dark:border-gray-700"
                      dayClassName={(date: Date) => {
                        const isSelected = form.validUntil && date.toISOString().slice(0, 10) === form.validUntil;
                        const isToday = date.toDateString() === new Date().toDateString();

                        let classes = "rounded-lg mx-1 transition-all duration-150 ";

                        if (isSelected) {
                          classes += "!bg-primary-600 !text-white font-semibold shadow-md";
                        } else if (isToday) {
                          classes += "!bg-primary-100 dark:!bg-primary-900/30 !text-primary-600 dark:!text-primary-400 font-medium";
                        } else {
                          classes += "!text-gray-700 dark:!text-gray-300 hover:!bg-primary-50 dark:hover:!bg-primary-900/20";
                        }

                        return classes;
                      }}
                      popperClassName="z-[9999]"
                      showPopperArrow={false}
                      popperPlacement="bottom-start"
                    />
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
                        {selectedPayment.student
                          ? `${selectedPayment.student.name?.[0] || ""}${selectedPayment.student.last_name?.[0] || ""}`
                          : "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Talaba</p>
                      <Link
                        to={`/studentprofile/${selectedPayment.student?.id || ''}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {selectedPayment.student
                          ? `${selectedPayment.student.name || ''} ${selectedPayment.student.last_name || ''}`
                          : "-"}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To'lov miqdori</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedPayment.amount ? formatCurrencyDetailed(selectedPayment.amount) : "-"}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To'lov sanasi</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPayment.paid_date ? new Date(selectedPayment.paid_date).toLocaleDateString("uz-UZ") : "-"}
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
                    <p className="text-gray-900 dark:text-white">{selectedPayment.comment || '-'}</p>
                  </div>
                )}

                {/* Valid until */}
                {selectedPayment.valid_until && (
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Amal qilish muddati</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedPayment.valid_until ? new Date(selectedPayment.valid_until).toLocaleDateString("uz-UZ") : '-'}
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