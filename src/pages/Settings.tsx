import React, { useState, useRef } from 'react';
import { Edit, DollarSign, ListChecks, Wifi, BookOpen, WashingMachine, Tv, Coffee, Plus, Info, MapPin, User, School, FileImage, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSEO } from '../hooks/useSEO';
import { formatCurrency } from '../utils/formatters';
import api from '../data/api';

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

  // Demo: queryClient o'chirilgan
  
  // Fetch dormitory settings from API
  const [settings, setSettings] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('access');
        const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Sozlamalarni yuklashda xatolik');
        }
        
        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
        console.error('Settings fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Fetch all amenities from API
  const [allAmenities, setAllAmenities] = React.useState<Array<{ id: number; name: string; is_active: boolean }>>([]);
  const [amenitiesLoading, setAmenitiesLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAmenities = async () => {
      setAmenitiesLoading(true);
      try {
        const data = await api.getAmenities();
        // API paginated formatda qaytaradi: { count, next, previous, results }
        const amenitiesList = data?.results || data || [];
        setAllAmenities(Array.isArray(amenitiesList) ? amenitiesList : []);
      } catch (err) {
        console.error('Amenities fetch error:', err);
        toast.error('Qulayliklarni yuklashda xatolik');
      } finally {
        setAmenitiesLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  // Get rules from settings
  const rulesData = React.useMemo(() => settings?.rules || [], [settings]);

  // Demo admin profil ma'lumotlari
  const adminProfile = React.useMemo(() => ({
    id: 1,
    username: 'superadmin',
    first_name: 'Admin',
    last_name: 'Adminov',
    email: 'admin@joybor.uz',
    phone: '+998901234567',
    telegram: '@joyboradmin',
    bio: 'Yotoqxona administratori',
    avatar: null,
  }), []);
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
  const [localAmenities, setLocalAmenities] = useState<Array<{ id: number; name: string; is_active: boolean }>>([]);

  // Type definition for amenity
  type Amenity = { id: number; name: string; is_active: boolean };

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

  // Demo: Barcha mutation lar o'chirilgan

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
  // Barcha qulayliklarni ko'rsatish, yotoqxonada mavjud bo'lganlarini belgilash
  React.useEffect(() => {
    if (allAmenities.length > 0 && settings) {
      const dormitoryAmenityIds = settings.amenities?.map((a: { id?: number } | number) => (typeof a === 'object' ? a.id : a)) || [];
      
      // Barcha qulayliklarni ko'rsatish, yotoqxonada mavjud bo'lganlarini is_active = true qilish
      const mappedAmenities = allAmenities.map(amenity => ({
        ...amenity,
        is_active: dormitoryAmenityIds.includes(amenity.id)
      }));
      
      setLocalAmenities(mappedAmenities);
    }
  }, [allAmenities, settings]);

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
    const ruleToRemove = rules[idx];
    
    // Agar rule ID ga ega bo'lsa, API dan o'chirish
    if (ruleToRemove.id) {
      try {
        await api.deleteRule(ruleToRemove.id);
        toast.success('Qoida o\'chirildi!');
      } catch {
        toast.error('Qoidani o\'chirishda xatolik!');
        return;
      }
    }
    
    // Local state dan o'chirish
    setRules(rules => rules.filter((_, i) => i !== idx));
  };
  
  const handleSaveRules = async () => {
    setDormLoading(true);
    try {
      // Har bir qoidani saqlash yoki yangilash
      for (const rule of rules) {
        if (!rule.rule.trim()) continue; // Bo'sh qoidalarni o'tkazib yuborish
        
        if (rule.id) {
          // Mavjud qoidani yangilash
          await api.updateRule(rule.id, { rule: rule.rule });
        } else {
          // Yangi qoida qo'shish
          await api.createRule({ rule: rule.rule });
        }
      }
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Qoidalar saqlandi!');
      setEditSection(null);
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };
  // --- AMENITIES STATE ---

  const handleAmenityChange = (amenity: Amenity) => {
    setLocalAmenities(prev =>
      prev.map(item =>
        item.id === amenity.id
          ? { ...item, is_active: !item.is_active }
          : item
      )
    );
  };

  const handleSaveAmenities = async () => {
    setDormLoading(true);
    try {
      // Faqat faol (tanlangan) qulayliklar ID larini olish
      const selectedAmenityIds = localAmenities
        .filter(a => a.is_active)
        .map(a => a.id);

      const updateData = {
        name: settings.name || '',
        address: settings.address || '',
        distance_to_university: settings.distance_to_university || 0,
        description: settings.description || '',
        month_price: settings.month_price || 0,
        year_price: settings.year_price || 0,
        latitude: settings.latitude || 0,
        longitude: settings.longitude || 0,
        rating: settings.rating || 5,
        is_active: settings.is_active !== undefined ? settings.is_active : true,
        university: settings.university?.id || settings.university || 0,
        admin: settings.admin?.id || settings.admin || 0,
        amenities: selectedAmenityIds
      };
      
      await api.updateMyDormitory(updateData);
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Qulayliklar saqlandi!');
      setEditSection(null);
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
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

    setDormLoading(true);
    try {
      // Admin profil ma'lumotlarini yangilash
      const updateData: any = {};
      if (cleanedPhone) updateData.phone = cleanedPhone;
      if (contactForm.telegram.trim()) updateData.telegram = contactForm.telegram;
      
      await api.updateAdminProfile(updateData);
      
      toast.success('Aloqa ma\'lumotlari saqlandi!');
      setEditSection(null);
      
      // Saqlashdan keyin telefon raqamini formatlash
      if (cleanedPhone) {
        setContactForm(f => ({ ...f, phone: formatPhoneNumber(cleanedPhone) }));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
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
        distance_to_university: dormCardForm.distance_to_university ? parseFloat(dormCardForm.distance_to_university) : 0,
        description: settings.description || '',
        month_price: settings.month_price || 0,
        year_price: settings.year_price || 0,
        latitude: settings.latitude || 0,
        longitude: settings.longitude || 0,
        rating: settings.rating || 5,
        is_active: settings.is_active !== undefined ? settings.is_active : true,
        university: settings.university?.id || settings.university || 0,
        admin: settings.admin?.id || settings.admin || 0,
        amenities: settings.amenities?.map((a: { id?: number } | number) => (typeof a === 'object' ? a.id : a)) || []
      };
      
      await api.updateMyDormitory(updateData);
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Yotoqxona maʼlumotlari yangilandi!');
      setEditDormCard(false);
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };
  const handleSavePricesCard = async () => {
    setDormLoading(true);
    try {
      const updateData = {
        name: settings.name || '',
        address: settings.address || '',
        distance_to_university: settings.distance_to_university || 0,
        description: settings.description || '',
        month_price: pricesCardForm.month_price ? parseFloat(pricesCardForm.month_price) : 0,
        year_price: pricesCardForm.year_price ? parseFloat(pricesCardForm.year_price) : 0,
        latitude: settings.latitude || 0,
        longitude: settings.longitude || 0,
        rating: settings.rating || 5,
        is_active: settings.is_active !== undefined ? settings.is_active : true,
        university: settings.university?.id || settings.university || 0,
        admin: settings.admin?.id || settings.admin || 0,
        amenities: settings.amenities?.map((a: { id?: number } | number) => (typeof a === 'object' ? a.id : a)) || []
      };
      
      await api.updateMyDormitory(updateData);
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Narx ma\'lumotlari yangilandi!');
      setEditPricesCard(false);
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    setDormLoading(true);
    try {
      const updateData = {
        name: settings.name || '',
        address: settings.address || '',
        distance_to_university: settings.distance_to_university || 0,
        description: descriptionForm,
        month_price: settings.month_price || 0,
        year_price: settings.year_price || 0,
        latitude: settings.latitude || 0,
        longitude: settings.longitude || 0,
        rating: settings.rating || 5,
        is_active: settings.is_active !== undefined ? settings.is_active : true,
        university: settings.university?.id || settings.university || 0,
        admin: settings.admin?.id || settings.admin || 0,
        amenities: settings.amenities?.map((a: { id?: number } | number) => (typeof a === 'object' ? a.id : a)) || []
      };
      
      await api.updateMyDormitory(updateData);
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Tavsif muvaffaqiyatli yangilandi!');
      setEditDescription(false);
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi!');
    } finally {
      setDormLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.deleteDormitoryImage(imageId);
      
      // Yangilangan ma'lumotlarni qayta yuklash
      const token = sessionStorage.getItem('access');
      const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setSettings(data);
      
      toast.success('Rasm o\'chirildi!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Rasmni o\'chirishda xatolik!';
      toast.error(errorMessage);
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
              <span className="truncate">{settings.university_name || 'Universitet'}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{settings.address || ''}</div>
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




      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-10">
        {/* Dormitory Info Card */}
        <SectionCard
          icon={<Info className="w-8 h-8 text-blue-600" />}
          title={((<span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Yotoqxona haqida</span>) as React.ReactNode)}
          onEdit={() => setEditDormCard(true)}
        >
          <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4 flex flex-col gap-4 border border-gray-200 dark:border-slate-600">
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
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Nomi</div>
                    <span className="font-semibold text-gray-900 dark:text-white">{settings.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Manzil</div>
                    <span className="text-gray-900 dark:text-white">{settings.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <School className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Universitetgacha masofa</div>
                    <span className="text-gray-900 dark:text-white">{settings.distance_to_university} km</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionCard>
        

        
        {/* Prices Card */}
        <SectionCard
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
          title={((<span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Narx ma'lumotlari</span>) as React.ReactNode)}
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
          icon={<BookOpen className="w-8 h-8 text-purple-600" />}
          title={((<span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Tavsif</span>) as React.ReactNode)}
          description={editDescription ? undefined : "Yotoqxona haqida batafsil ma'lumot"}
          onEdit={() => setEditDescription(true)}
        >
          <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4 flex flex-col gap-4 border border-gray-200 dark:border-slate-600">
            {editDescription ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Tavsif</label>
                  <textarea
                    className="bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 min-h-[120px] max-h-[300px] resize-y"
                    value={descriptionForm}
                    onChange={e => setDescriptionForm(e.target.value)}
                    disabled={dormLoading}
                    placeholder="Yotoqxona haqida batafsil ma'lumot kiriting..."
                    maxLength={1000}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base" onClick={handleSaveDescription} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm sm:text-base" onClick={() => { setEditDescription(false); setDescriptionForm(settings.description || ''); }} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg max-h-[200px] overflow-y-auto">
                <div className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap break-words">
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
              localAmenities.map((item: Amenity) => (
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
            ) : amenitiesLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qulayliklar yuklanmoqda...
                </p>
              </div>
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <ListChecks className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qulayliklar topilmadi
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={handleSaveAmenities}
                >
                  Saqlash
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={() => {
                    setEditSection(null);
                    // Bekor qilganda asl holatga qaytarish
                    if (allAmenities.length > 0 && settings) {
                      const dormitoryAmenityIds = settings.amenities?.map((a: unknown) => a.id || a) || [];
                      const mappedAmenities = allAmenities.map(amenity => ({
                        ...amenity,
                        is_active: dormitoryAmenityIds.includes(amenity.id)
                      }));
                      setLocalAmenities(mappedAmenities);
                    }
                  }}
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
                    className="px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition text-sm sm:text-base"
                    onClick={handleSaveContact}
                  >
                    Saqlash
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
                  >
                    Bekor qilish
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Telefon raqami</div>
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {adminProfile?.phone ? formatPhoneNumber(adminProfile.phone) : 'Kiritilmagan'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  <Send className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Telegram</div>
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
              >
                Saqlash
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
                
                try {
                  const formData = new FormData();
                  formData.append('image', file);
                  
                  await api.uploadDormitoryImage(formData);
                  
                  // Yangilangan ma'lumotlarni qayta yuklash
                  const token = sessionStorage.getItem('access');
                  const response = await fetch('https://joyborv1.pythonanywhere.com/api/admin/my-dormitory/', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  const data = await response.json();
                  setSettings(data);
                  
                  toast.success('Rasm muvaffaqiyatli yuklandi!');
                } catch (err: unknown) {
                  const errorMessage = err?.message || 'Rasm yuklashda xatolik!';
                  toast.error(errorMessage);
                } finally {
                  setIsUploading(false);
                  // Input ni tozalash
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }
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
              {settings.images.map((img: { id: number; image: string }, i: number) => (
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