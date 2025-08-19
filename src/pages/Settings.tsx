import React, { useState, useRef } from 'react';
import { Edit, DollarSign, ListChecks, Wifi, BookOpen, WashingMachine, Tv, Coffee, Plus, Info, MapPin, User, School, FileImage, Phone, MessageCircle, Send, Map } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { toast } from 'sonner';
import { useSEO } from '../hooks/useSEO';
import { formatCurrency } from '../utils/formatters';

// Icon mapping for amenities
const getAmenityIcon = (name: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Wi-Fi': <Wifi className="w-5 h-5" />,
    'WiFi': <Wifi className="w-5 h-5" />,
    'Wifi': <Wifi className="w-5 h-5" />,
    'Darsxona': <BookOpen className="w-5 h-5" />,
    'O\'quv xonasi': <BookOpen className="w-5 h-5" />,
    'Study Room': <BookOpen className="w-5 h-5" />,
    'Kir yuvish': <WashingMachine className="w-5 h-5" />,
    'Washing Machine': <WashingMachine className="w-5 h-5" />,
    'Laundry': <WashingMachine className="w-5 h-5" />,
    'Dam olish xonasi': <Tv className="w-5 h-5" />,
    'TV': <Tv className="w-5 h-5" />,
    'Television': <Tv className="w-5 h-5" />,
    'Oshxona': <Coffee className="w-5 h-5" />,
    'Kitchen': <Coffee className="w-5 h-5" />,
    'Kafe': <Coffee className="w-5 h-5" />,
  };

  // Try exact match first
  if (iconMap[name]) return iconMap[name];

  // Try partial matches
  const lowerName = name.toLowerCase();
  if (lowerName.includes('wifi') || lowerName.includes('internet')) return <Wifi className="w-5 h-5" />;
  if (lowerName.includes('dars') || lowerName.includes('study') || lowerName.includes('o\'qu')) return <BookOpen className="w-5 h-5" />;
  if (lowerName.includes('kir') || lowerName.includes('wash') || lowerName.includes('laundry')) return <WashingMachine className="w-5 h-5" />;
  if (lowerName.includes('tv') || lowerName.includes('dam') || lowerName.includes('television')) return <Tv className="w-5 h-5" />;
  if (lowerName.includes('oshxona') || lowerName.includes('kitchen') || lowerName.includes('kafe')) return <Coffee className="w-5 h-5" />;

  // Default icon
  return <ListChecks className="w-5 h-5" />;
};

function SectionCard({ icon, title, description, children, onEdit }: { icon: React.ReactNode; title: React.ReactNode; description?: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-gray-100 dark:border-slate-700 relative group transition hover:shadow-2xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-1">
        <span className="p-1.5 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 flex-shrink-0">{icon}</span>
        <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 flex-1 min-w-0">{title}</h2>
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 sm:p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition flex-shrink-0" title="Tahrirlash">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          </button>
        )}
      </div>
      {description && <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{description}</div>}
      {children}
    </div>
  );
}

function EditableInput({ label, value, onChange, disabled, placeholder, helper, fullWidth, style, maxLength }: { label: string; value: string; onChange: (v: string) => void; disabled: boolean; placeholder?: string; helper?: string; fullWidth?: boolean; style?: React.CSSProperties; maxLength?: number }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className={`bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${disabled ? 'cursor-default' : 'cursor-text'}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={style}
        maxLength={maxLength}
      />
      {helper && <span className="text-xs text-gray-400 mt-1">{helper}</span>}
    </div>
  );
}

const Settings: React.FC = () => {
  // SEO
  useSEO('settings');

  // All hooks at the top!
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery<any>({
    queryKey: ['settings'],
    queryFn: apiQueries.getSettings,
    staleTime: 1000 * 60 * 5,
  });

  // Rules uchun alohida query
  const { data: rulesData } = useQuery<any[]>({
    queryKey: ['rules'],
    queryFn: apiQueries.getRules,
    staleTime: 1000 * 60 * 5,
  });

  // Amenities uchun alohida query
  const { data: amenitiesData } = useQuery<any[]>({
    queryKey: ['amenities'],
    queryFn: apiQueries.getAmenities,
    staleTime: 1000 * 60 * 5,
  });

  // Admin profil ma'lumotlarini olish
  const { data: adminProfile } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: apiQueries.getAdminProfile,
    staleTime: 1000 * 60 * 5,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [rules, setRules] = useState<{ id?: number, rule: string }[]>([]);
  const [contactForm, setContactForm] = useState({ phone: '', telegram: '' });
  const [dormLoading, setDormLoading] = useState(false);
  const [editDormCard, setEditDormCard] = useState(false);
  const [editPricesCard, setEditPricesCard] = useState(false);
  const [editDescription, setEditDescription] = useState(false);

  const [dormCardForm, setDormCardForm] = useState({
    name: '', address: '', distance_to_university: '',
  });
  const [pricesCardForm, setPricesCardForm] = useState({
    month_price: '', year_price: '',
  });
  const [descriptionForm, setDescriptionForm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [localAmenities, setLocalAmenities] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState({ lat: 41.2995, lng: 69.2401, address: '' });

  // Telefon raqamini formatlash funksiyasi
  const formatPhoneNumber = (value: string) => {
    // Faqat raqamlarni qoldirish
    const numbers = value.replace(/\D/g, '');

    // Agar bo'sh bo'lsa, bo'sh qaytarish
    if (numbers.length === 0) {
      return '';
    }

    // Agar 998 bilan boshlanmasa, qo'shish
    let formattedNumbers = numbers;
    if (!numbers.startsWith('998')) {
      if (numbers.startsWith('9')) {
        formattedNumbers = '998' + numbers;
      }
    }

    // Formatlash: +998 (XX) XXX XX XX
    if (formattedNumbers.length >= 12) {
      return `+${formattedNumbers.slice(0, 3)} (${formattedNumbers.slice(3, 5)}) ${formattedNumbers.slice(5, 8)} ${formattedNumbers.slice(8, 10)} ${formattedNumbers.slice(10, 12)}`;
    } else if (formattedNumbers.length >= 10) {
      return `+${formattedNumbers.slice(0, 3)} (${formattedNumbers.slice(3, 5)}) ${formattedNumbers.slice(5, 8)} ${formattedNumbers.slice(8, 10)} ${formattedNumbers.slice(10)}`;
    } else if (formattedNumbers.length >= 8) {
      return `+${formattedNumbers.slice(0, 3)} (${formattedNumbers.slice(3, 5)}) ${formattedNumbers.slice(5, 8)} ${formattedNumbers.slice(8)}`;
    } else if (formattedNumbers.length >= 5) {
      return `+${formattedNumbers.slice(0, 3)} (${formattedNumbers.slice(3, 5)}) ${formattedNumbers.slice(5)}`;
    } else if (formattedNumbers.length >= 3) {
      return `+${formattedNumbers.slice(0, 3)} (${formattedNumbers.slice(3)}`;
    } else {
      return `+${formattedNumbers}`;
    }
  };

  // Telefon raqamini tozalash (faqat raqamlar)
  const cleanPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiQueries.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditSection(null);
      toast.success('Sozlamalar muvaffaqiyatli saqlandi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Xatolik yuz berdi!');
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: { rule: string }) => apiQueries.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Qoida muvaffaqiyatli qo\'shildi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Qoida qo\'shishda xatolik yuz berdi!');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { rule: string } }) => apiQueries.updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Qoida muvaffaqiyatli yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Qoida yangilashda xatolik yuz berdi!');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => apiQueries.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Qoida muvaffaqiyatli o\'chirildi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Qoida o\'chirishda xatolik yuz berdi!');
    },
  });

  const updateAmenityMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { name: string; is_active: boolean } }) => apiQueries.updateAmenity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Qulaylik muvaffaqiyatli yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Qulaylik yangilashda xatolik yuz berdi!');
    },
  });

  // Bulk amenities update (optimize API: send only active amenity IDs)
  const bulkUpdateAmenitiesMutation = useMutation({
    mutationFn: (data: { amenities: number[] }) => apiQueries.patchMyDormitory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      toast.success('Qulayliklar muvaffaqiyatli yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || 'Qulayliklarni saqlashda xatolik yuz berdi!');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: { phone: string; telegram: string }) => {
      // FormData yaratish
      const formData = new FormData();
      formData.append('phone', data.phone);
      formData.append('telegram', data.telegram);
      return apiQueries.updateAdminProfile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      setEditSection(null);
      toast.success('Aloqa ma\'lumotlari muvaffaqiyatli yangilandi!');
    },
    onError: (err: any) => {
      toast.error(err?.toString() || err?.message || 'Aloqa ma\'lumotlarini yangilashda xatolik yuz berdi!');
    },
  });

  // All useEffect at the top
  React.useEffect(() => {
    if (settings) {
      setDormCardForm({
        name: settings.name || '',
        address: settings.address || '',
        distance_to_university: settings.distance_to_university ? String(settings.distance_to_university) : '',
      });
      setPricesCardForm({
        month_price: settings.month_price ? String(settings.month_price) : '',
        year_price: settings.year_price ? String(settings.year_price) : '',
      });
      setDescriptionForm(settings.description || '');
    }
  }, [settings]);

  // Rules ma'lumotlarini alohida useEffect da handle qilish
  React.useEffect(() => {
    if (rulesData) {
      // API dan kelgan rules ma'lumotlarini handle qilish
      if (rulesData.length > 0 && typeof rulesData[0] === 'object' && rulesData[0].rule) {
        setRules(rulesData.map((r: any) => ({ id: r.id, rule: r.rule })));
      } else {
        setRules(rulesData.map((r: any) => ({ rule: r })));
      }
    }
  }, [rulesData]);

  // Amenities ma'lumotlarini local state ga yuklash
  React.useEffect(() => {
    if (amenitiesData) {
      setLocalAmenities(amenitiesData);
    }
  }, [amenitiesData]);

  // Contact form ni admin profil ma'lumotlari bilan to'ldirish
  React.useEffect(() => {
    if (adminProfile && !editSection) {
      setContactForm({
        phone: adminProfile.phone ? formatPhoneNumber(adminProfile.phone) : '',
        telegram: adminProfile.telegram || ''
      });
    }
  }, [adminProfile, editSection]);

  // Edit section o'zgarganida rules ni qayta yuklash
  React.useEffect(() => {
    if (editSection === 'rules' && rulesData) {
      // Rules edit mode ga kirganda API dan kelgan ma'lumotlarni qayta yuklash
      if (rulesData.length > 0 && typeof rulesData[0] === 'object' && rulesData[0].rule) {
        setRules(rulesData.map((r: any) => ({ id: r.id, rule: r.rule })));
      } else {
        setRules(rulesData.map((r: any) => ({ rule: r })));
      }
    }
  }, [editSection, rulesData]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  }
  if (error || !settings) {
    return <div className="text-center py-10 text-red-600 dark:text-red-400">Sozlamalarni yuklashda xatolik yuz berdi.</div>;
  }


  // --- RULES STATE ---
  const handleRuleChange = (idx: number, value: string) => {
    setRules(rules => rules.map((r, i) => i === idx ? { ...r, rule: value } : r));
  };
  const handleAddRule = () => {
    setRules(rules => [...rules, { rule: '' }]);
  };

  const handleRemoveRule = async (idx: number) => {
    const rule = rules[idx];
    if (rule.id) {
      // API dan o'chirish
      try {
        await deleteRuleMutation.mutateAsync(rule.id);
      } catch (error) {
        // Error handling is done in mutation
      }
    } else {
      // Local state dan o'chirish (yangi qo'shilgan, hali saqlanmagan)
      setRules(rules => rules.filter((_, i) => i !== idx));
    }
  };
  const handleSaveRules = async () => {
    try {
      for (const rule of rules) {
        if (rule.rule.trim()) {
          if (rule.id) {
            // Mavjud qoidani yangilash
            await updateRuleMutation.mutateAsync({
              id: rule.id,
              data: { rule: rule.rule.trim() }
            });
          } else {
            // Yangi qoida qo'shish
            await createRuleMutation.mutateAsync({ rule: rule.rule.trim() });
          }
        }
      }

      setEditSection(null);
    } catch (err: any) {
      // Error handling is done in the mutation
    }
  };
  // --- AMENITIES STATE ---

  const handleAmenityChange = (amenity: any) => {
    setLocalAmenities(prev =>
      prev.map(item =>
        item.id === amenity.id
          ? { ...item, is_active: !item.is_active }
          : item
      )
    );
  };

  const handleSaveAmenities = async () => {
    try {
      // Faqat o'zgargan amenities larni saqlash (ADMIN uchun granular patch)
      const originalAmenities = amenitiesData || [];
      const changedAmenities = localAmenities.filter(local => {
        const original = originalAmenities.find((orig: any) => orig.id === local.id);
        return original && original.is_active !== local.is_active;
      });

      for (const amenity of changedAmenities) {
        await updateAmenityMutation.mutateAsync({
          id: amenity.id,
          data: {
            name: amenity.name,
            is_active: amenity.is_active
          }
        });
      }

      setEditSection(null);
      toast.success('Qulayliklar muvaffaqiyatli yangilandi!');
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  // Talaba sayti uchun: faol amenities ID larini array ko'rinishida yuborish
  const handleSyncAmenities = async () => {
    try {
      const extractAmenityId = (item: any) => {
        const raw = item?.id ?? item?.amenity ?? item?.amenity_id ?? item?.pk;
        const num = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
        return Number.isFinite(num) ? num : null;
      };

      const activeAmenityIds = Array.from(new Set(
        (localAmenities || [])
          .filter((a: any) => a && (a.is_active === true || a.is_active === 1 || a.is_active === 'true'))
          .map(extractAmenityId)
          .filter((id: number | null): id is number => id !== null)
      ));

      await bulkUpdateAmenitiesMutation.mutateAsync({ amenities: activeAmenityIds });
    } catch (error) {
      // Error handled in mutation
    }
  };
  // --- CONTACT STATE ---
  // Telefon input handler
  const handlePhoneChange = (value: string) => {
    // Foydalanuvchi yozgan matnni to'g'ridan-to'g'ri saqlash
    // Formatlash faqat saqlashda amalga oshiriladi
    setContactForm(f => ({ ...f, phone: value }));
  };

  const handleSaveContact = async () => {
    // Telefon raqamini tozalash
    const cleanedPhone = cleanPhoneNumber(contactForm.phone);

    // Validation
    if (!cleanedPhone && !contactForm.telegram.trim()) {
      toast.error('Kamida bitta aloqa ma\'lumotini kiriting!');
      return;
    }

    // Telefon raqami validatsiyasi
    if (cleanedPhone && cleanedPhone.length < 9) {
      toast.error('Telefon raqami noto\'g\'ri formatda!');
      return;
    }

    try {
      await updateContactMutation.mutateAsync({
        phone: cleanedPhone, // Faqat raqamlarni yuborish
        telegram: contactForm.telegram.trim()
      });

      // Saqlashdan keyin telefon raqamini formatlash
      if (cleanedPhone) {
        setContactForm(f => ({ ...f, phone: formatPhoneNumber(cleanedPhone) }));
      }
    } catch (error) {
      // Error handling is done in mutation
    }
  };

  // --- DORMITORY INFO STATE ---
  const handleDormCardChange = (field: string, value: string) => {
    setDormCardForm(f => ({ ...f, [field]: value }));
  };
  const handlePricesCardChange = (field: string, value: string) => {
    setPricesCardForm(f => ({ ...f, [field]: value }));
  };
  const handleSaveDormCard = async () => {
    setDormLoading(true);
    try {
      const updateData = {
        name: dormCardForm.name,
        address: dormCardForm.address,
        description: settings.description,
        distance_to_university: parseFloat(dormCardForm.distance_to_university) || 0,
        admin: settings.admin?.id,
        university: settings.university?.id,
      };
      await apiQueries.patchMyDormitory(updateData);
      toast.success('Yotoqxona maʼlumotlari yangilandi!');
      setEditDormCard(false);
      // Barcha bog'liq cache larni yangilash
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);
    } catch (err: any) {
      toast.error(err?.toString() || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };
  const handleSavePricesCard = async () => {
    setDormLoading(true);
    try {
      const updateData = {
        month_price: parseFloat(pricesCardForm.month_price) || 0,
        year_price: parseFloat(pricesCardForm.year_price) || 0,
        distance_to_university: settings.distance_to_university || 0,
        admin: settings.admin?.id,
        university: settings.university?.id,
      };
      await apiQueries.patchMyDormitory(updateData);
      toast.success('Narx ma\'lumotlari yangilandi!');
      setEditPricesCard(false);
      // Barcha bog'liq cache larni yangilash
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['monthlyRevenue'] })
      ]);
    } catch (err: any) {
      toast.error(err?.toString() || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    setDormLoading(true);
    try {
      const updateData = {
        name: settings.name,
        address: settings.address,
        description: descriptionForm,
        distance_to_university: settings.distance_to_university || 0,
        admin: settings.admin?.id,
        university: settings.university?.id,
      };
      await apiQueries.patchMyDormitory(updateData);
      toast.success('Tavsif muvaffaqiyatli yangilandi!');
      setEditDescription(false);
      // Barcha bog'liq cache larni yangilash
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      ]);
    } catch (err: any) {
      toast.error(err?.toString() || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const token = sessionStorage.getItem('access');
      if (!token) {
        toast.error('Avtorizatsiya talab qilinadi!');
        return;
      }
      const res = await fetch(`https://joyboryangi.pythonanywhere.com/dormitory_images/${imageId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error('Rasmni o\'chirishda xatolik!');
        return;
      }
      toast.success('Rasm o\'chirildi!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (err) {
      toast.error('Rasmni o\'chirishda xatolik!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="p-4 sm:p-6 max-w-5xl mx-auto w-full"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
        {/* University logo and name */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow p-2">
            <img src="/logoicon.svg" alt="University Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <School className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" /> 
              <span className="truncate">{settings.university?.name}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{settings.university?.address}</div>
          </div>
        </div>
        <div className="flex-1" />
        {/* Admin info */}
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 sm:px-4 py-2 rounded-lg">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">{settings.admin?.username}</span>
          <span className="text-xs text-gray-500 ml-1 sm:ml-2 flex-shrink-0">Admin</span>
        </div>
      </div>


      {/* Google Maps - Doim ko'rinadigan */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <SectionCard
          icon={<Map className="w-8 h-8 text-blue-500" />}
          title={((<span className="text-lg font-bold text-blue-700 dark:text-blue-300">Yotoqxona joylashuvi</span>) as React.ReactNode)}
          description="Xaritada yotoqxona joylashuvini ko'ring va o'zgartiring"
        >
          <div className="space-y-4">
            <GoogleMap
              latitude={mapLocation.lat}
              longitude={mapLocation.lng}
              height="400px"
              showControls={true}
              onLocationSelect={(lat, lng, address) => {
                setMapLocation({ lat, lng, address });
                toast.success(`Yangi joylashuv tanlandi!`, {
                  description: address,
                  duration: 4000,
                });
              }}
            />
            {mapLocation.address && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tanlangan manzil:</strong> {mapLocation.address}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Koordinatalar: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success('Joylashuv saqlandi!');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Joylashuvni saqlash
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-10">
        {/* Dormitory Info Card */}
        <SectionCard
          icon={<Info className="w-8 h-8 text-blue-500" />}
          title={((<span className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300">Yotoqxona haqida</span>) as React.ReactNode)}
          onEdit={() => setEditDormCard(true)}
        >
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 p-4 flex flex-col gap-4 shadow-inner">
            {editDormCard ? (
              <>
                <EditableInput label="Nomi" value={dormCardForm.name} onChange={v => handleDormCardChange('name', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Manzil" value={dormCardForm.address} onChange={v => handleDormCardChange('address', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Universitetgacha masofa (km)" value={dormCardForm.distance_to_university} onChange={v => handleDormCardChange('distance_to_university', v)} disabled={dormLoading} fullWidth />
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base" onClick={handleSaveDormCard} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base" onClick={() => setEditDormCard(false)} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-blue-500" />
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{settings.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="text-gray-700 dark:text-gray-200">{settings.address}</span>
                </div>

                <div className="flex items-center gap-3">
                  <School className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-200">Universitetgacha: {settings.distance_to_university} km</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>
        
        {/* Google Maps */}
        {showMap && (
          <div className="md:col-span-2">
            <SectionCard
              icon={<Map className="w-8 h-8 text-blue-500" />}
              title={((<span className="text-lg font-bold text-blue-700 dark:text-blue-300">Yotoqxona joylashuvi</span>) as React.ReactNode)}
            >
              <div className="space-y-4">
                <GoogleMap
                  latitude={mapLocation.lat}
                  longitude={mapLocation.lng}
                  height="450px"
                  showControls={true}
                  onLocationSelect={(lat, lng, address) => {
                    setMapLocation({ lat, lng, address });
                    toast.success(`Yangi joylashuv tanlandi!`, {
                      description: address,
                      duration: 4000,
                    });
                  }}
                />
                {mapLocation.address && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Tanlangan manzil:</strong> {mapLocation.address}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Koordinatalar: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Bu yerda API ga joylashuvni saqlash logikasini qo'shish mumkin
                      toast.success('Joylashuv saqlandi!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Joylashuvni saqlash
                  </button>
                  <button
                    onClick={() => setShowMap(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
        
        {/* Prices Card */}
        <SectionCard
          icon={<DollarSign className="w-8 h-8 text-green-500" />}
          title={((<span className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">Narx ma'lumotlari</span>) as React.ReactNode)}
          description={editPricesCard ? undefined : "Oylik va yillik narxlar"}
          onEdit={() => setEditPricesCard(true)}
        >
          <div className="rounded-xl bg-gray-50 dark:bg-slate-700/50 p-4 flex flex-col gap-4 border border-gray-100 dark:border-slate-600">
            {editPricesCard ? (
              <>
                <EditableInput label="Oylik narx (so'm)" value={pricesCardForm.month_price} onChange={v => handlePricesCardChange('month_price', v)} disabled={dormLoading} fullWidth placeholder="1200000" />
                <EditableInput label="Yillik narx (so'm)" value={pricesCardForm.year_price} onChange={v => handlePricesCardChange('year_price', v)} disabled={dormLoading} fullWidth placeholder="12000000" />
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base" onClick={handleSavePricesCard} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base" onClick={() => setEditPricesCard(false)} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Oylik narx</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(settings.month_price)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Yillik narx</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(settings.year_price)}</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        {/* Description Card */}
        <SectionCard
          icon={<BookOpen className="w-8 h-8 text-purple-500" />}
          title={((<span className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">Tavsif</span>) as React.ReactNode)}
          description={editDescription ? undefined : "Yotoqxona haqida batafsil ma'lumot"}
          onEdit={() => setEditDescription(true)}
        >
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/30 p-4 flex flex-col gap-4 shadow-inner">
            {editDescription ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Tavsif</label>
                  <textarea
                    className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 min-h-[100px] sm:min-h-[120px] resize-vertical"
                    value={descriptionForm}
                    onChange={e => setDescriptionForm(e.target.value)}
                    disabled={dormLoading}
                    placeholder="Yotoqxona haqida batafsil ma'lumot kiriting..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base" onClick={handleSaveDescription} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base" onClick={() => { setEditDescription(false); setDescriptionForm(settings.description || ''); }} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
                  {settings.description || 'Tavsif kiritilmagan'}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Amenities Section */}
        <SectionCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Qulayliklar"
          description="Yotoqxonada mavjud bo'lgan qulayliklarni belgilang. Tahrirlash uchun 'Tahrirlash' tugmasini bosing."
          onEdit={() => setEditSection(editSection === 'amenities' ? null : 'amenities')}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {localAmenities && localAmenities.length > 0 ? (
              localAmenities.map((item: any) => (
                <div
                  key={item.id}
                  className={`relative p-4 rounded-lg border transition-all duration-200 ${
                    item.is_active
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                  } ${
                    editSection === 'amenities' 
                      ? 'cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600' 
                      : ''
                  }`}
                  onClick={() => editSection === 'amenities' && handleAmenityChange(item)}
                >
                  {/* Status indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    item.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>

                  {/* Content */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.is_active
                        ? 'bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {getAmenityIcon(item.name)}
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className={`font-medium text-sm ${
                        item.is_active
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {item.name}
                      </h3>
                      
                      {/* Status */}
                      <span className={`text-xs ${
                        item.is_active
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <ListChecks className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qulayliklar yuklanmoqda...
                </p>
              </div>
            )}
          </div>
          {editSection === 'amenities' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Qulayliklarni yoqish yoki o'chirish uchun ustiga bosing.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  onClick={handleSaveAmenities}
                  disabled={updateAmenityMutation.status === 'pending'}
                >
                  {updateAmenityMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  onClick={handleSyncAmenities}
                  disabled={bulkUpdateAmenitiesMutation.status === 'pending'}
                >
                  {bulkUpdateAmenitiesMutation.status === 'pending' ? 'Yuborilmoqda...' : 'Talaba sayti'}
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => {
                    setEditSection(null);
                    setLocalAmenities(amenitiesData || []);
                  }}
                  disabled={updateAmenityMutation.status === 'pending' || bulkUpdateAmenitiesMutation.status === 'pending'}
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          )}
        </SectionCard>
        {/* Contact Section - Admin Profile dan */}
        <SectionCard
          icon={<User className="w-6 h-6" />}
          title="Aloqa ma'lumotlari"
          description="Admin profil ma'lumotlaridan olingan aloqa ma'lumotlari"
          onEdit={() => setEditSection(editSection === 'contact' ? null : 'contact')}
        >
          <div className="space-y-4">
            {editSection === 'contact' ? (
              <>
                <EditableInput
                  label="Telefon raqami"
                  value={contactForm.phone}
                  onChange={handlePhoneChange}
                  disabled={false}
                  placeholder="+998 90 123 45 67"
                  fullWidth
                  maxLength={19}
                />
                <EditableInput
                  label="Telegram"
                  value={contactForm.telegram}
                  onChange={v => setContactForm(f => ({ ...f, telegram: v }))}
                  disabled={false}
                  placeholder="@username"
                  fullWidth
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base"
                    onClick={handleSaveContact}
                    disabled={updateContactMutation.status === 'pending'}
                  >
                    {updateContactMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                  <button
                    className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base"
                    onClick={() => {
                      setEditSection(null);
                      // Original ma'lumotlarni qaytarish
                      setContactForm({
                        phone: adminProfile?.phone ? formatPhoneNumber(adminProfile.phone) : '',
                        telegram: adminProfile?.telegram || ''
                      });
                    }}
                    disabled={updateContactMutation.status === 'pending'}
                  >
                    Bekor qilish
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefon raqami</div>
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {adminProfile?.phone ? formatPhoneNumber(adminProfile.phone) : 'Kiritilmagan'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram</div>
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {adminProfile?.telegram || 'Kiritilmagan'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Rules Section (edit-in-place) */}
        <SectionCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Qonun-qoidalar"
          description="Yotoqxonada amal qilinishi shart bo'lgan asosiy qoidalar. Ro'yxatni tahrirlash va yangi qoida qo'shish mumkin."
          onEdit={() => setEditSection(editSection === 'rules' ? null : 'rules')}
        >
          <ul className="list-disc space-y-2 text-gray-700 dark:text-gray-200">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-center gap-2">
                <EditableInput
                  label=""
                  value={rule.rule}
                  onChange={v => handleRuleChange(i, v)}
                  disabled={editSection !== 'rules'}
                  placeholder="Qoida matni"
                  helper={editSection === 'rules' && i === rules.length - 1 ? 'Yangi qoida qo\'shish uchun pastdagi tugmani bosing' : undefined}
                  fullWidth
                />
                {editSection === 'rules' && rules.length > 1 && (
                  <button
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                    title="O'chirish"
                    onClick={() => handleRemoveRule(i)}
                  >
                    <span className="text-red-500 font-bold">×</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          {editSection === 'rules' && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
                onClick={handleAddRule}
              >
                <Plus className="w-4 h-4" /> Yangi qoida qo'shish
              </button>
              <button
                className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base"
                onClick={handleSaveRules}
                disabled={createRuleMutation.status === 'pending'}
              >
                {createRuleMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          )}
        </SectionCard>
      </div>
      {/* Images */}
      <SectionCard
        icon={<FileImage className="w-6 h-6" />}
        title="Yotoqxona suratlari"
        description="Yotoqxona va xonalar haqidagi suratlar."
        onEdit={() => setEditSection(editSection === 'images' ? null : 'images')}
      >
        {/* Rasm yuklash tugmasi faqat tahrirlash rejimida */}
        {editSection === 'images' && (
          <div className="mb-4">
            <button
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-2 flex items-center gap-2 text-sm sm:text-base"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading && (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {isUploading ? 'Yuklanmoqda...' : "+ Rasm qo'shish"}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                const token = sessionStorage.getItem('access');
                if (!token) {
                  toast.error('Avtorizatsiya talab qilinadi!');
                  setIsUploading(false);
                  return;
                }
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch('https://joyboryangi.pythonanywhere.com/dormitory_image_create', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` },
                  body: formData,
                });
                setIsUploading(false);
                if (!res.ok) {
                  toast.error('Rasm yuklashda xatolik!');
                  return;
                }
                toast.success('Rasm muvaffaqiyatli yuklandi!');
                queryClient.invalidateQueries({ queryKey: ['settings'] });
              }}
            />
          </div>
        )}

        {/* Rasmlar slider shaklida */}
        {settings.images && settings.images.length > 0 ? (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}>
              {settings.images.map((img: any, i: number) => (
                <div key={i} className="relative flex-shrink-0 group">
                  <img
                    src={img.image}
                    alt={`Yotoqxona rasmi ${i + 1}`}
                    className="w-full sm:w-64 h-40 sm:h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
                  />
                  {/* O'chirish tugmasi faqat tahrirlash rejimida ko'rinadi */}
                  {editSection === 'images' && (
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      title="Rasmni o'chirish"
                    >
                      <span className="text-lg font-bold">×</span>
                    </button>
                  )}
                  {/* Rasm tartib raqami */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {i + 1} / {settings.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Hozircha rasmlar yuklanmagan</p>
            {editSection !== 'images' && (
              <p className="text-sm mt-1">Rasm yuklash uchun "Tahrirlash" tugmasini bosing</p>
            )}
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
};

export default Settings;