import React, { useState, useRef } from 'react';
import { Edit, Image as ImageIcon, DollarSign, ListChecks, Plus, Wifi, BookOpen, WashingMachine, Tv, Coffee, MapPin, Info, FileImage, Loader2, User, School, Map, Layers, Users as UsersIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { toast } from 'sonner';

const allAmenities = [
  { key: 'Wifi', icon: <Wifi className="w-6 h-6" />, name: 'Wi-Fi', description: 'Tez va bepul internet' },
  { key: 'BookOpen', icon: <BookOpen className="w-6 h-6" />, name: 'Darsxona', description: '24/7 ochiq o‘quv xonasi' },
  { key: 'WashingMachine', icon: <WashingMachine className="w-6 h-6" />, name: 'Kir yuvish mashinasi', description: 'Bepul kir yuvish xizmati' },
  { key: 'Tv', icon: <Tv className="w-6 h-6" />, name: 'Dam olish xonasi', description: 'Televizor va o‘yinlar' },
  { key: 'Coffee', icon: <Coffee className="w-6 h-6" />, name: 'Kichik oshxona', description: 'Choy va yengil taomlar uchun' },
];

function SectionCard({ icon, title, description, children, onEdit }: { icon: React.ReactNode; title: React.ReactNode; description?: string; children: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-gray-100 dark:border-slate-700 relative group transition hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-1">
        <span className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">{icon}</span>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        {onEdit && (
          <button onClick={onEdit} className="ml-auto p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition" title="Tahrirlash">
            <Edit className="w-5 h-5 text-blue-500" />
          </button>
        )}
      </div>
      {description && <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</div>}
      {children}
    </div>
  );
}

function EditableInput({ label, value, onChange, disabled, placeholder, helper, fullWidth, style }: { label: string; value: string; onChange: (v: string) => void; disabled: boolean; placeholder?: string; helper?: string; fullWidth?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</label>
      <input
        className={`bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 ${disabled ? 'cursor-default' : 'cursor-text'}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={style}
      />
      {helper && <span className="text-xs text-gray-400 mt-1">{helper}</span>}
    </div>
  );
}

const Settings: React.FC = () => {
  // All hooks at the top!
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: apiQueries.getSettings,
    staleTime: 1000 * 60 * 5,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [prices, setPrices] = useState<{ type: string; price: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(allAmenities.map(a => a.key));
  const [editImages, setEditImages] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rules, setRules] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [contact, setContact] = useState<{ phone: string; email: string; address: string }>({ phone: '', email: '', address: '' });
  const [dormImages, setDormImages] = useState<{ url: string; caption: string }[]>([]);
  const [editDorm, setEditDorm] = useState(false);
  const [dormForm, setDormForm] = useState({
    name: '', address: '', description: '', month_price: '', year_price: '', latitude: '', longitude: '', images: [] as File[],
  });
  const [dormLoading, setDormLoading] = useState(false);
  const [editDormCard, setEditDormCard] = useState(false);
  const [editPricesCard, setEditPricesCard] = useState(false);
  const [dormCardForm, setDormCardForm] = useState({
    name: '', address: '', description: '', latitude: '', longitude: '',
  });
  const [pricesCardForm, setPricesCardForm] = useState({
    month_price: '', year_price: '', total_capacity: '', available_capacity: '', total_rooms: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiQueries.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setEditSection(null);
      setNotif({ type: 'success', message: 'Sozlamalar muvaffaqiyatli saqlandi!' });
    },
    onError: (err: any) => {
      setNotif({ type: 'error', message: err?.toString() || 'Xatolik yuz berdi!' });
    },
  });

  // All useEffect at the top
  React.useEffect(() => {
    if (settings) {
      setDormForm({
        name: settings.name || '',
        address: settings.address || '',
        description: settings.description || '',
        month_price: settings.month_price ? String(settings.month_price) : '',
        year_price: settings.year_price ? String(settings.year_price) : '',
        latitude: settings.latitude ? String(settings.latitude) : '',
        longitude: settings.longitude ? String(settings.longitude) : '',
        images: [],
      });
      setDormCardForm({
        name: settings.name || '',
        address: settings.address || '',
        description: settings.description || '',
        latitude: settings.latitude ? String(settings.latitude) : '',
        longitude: settings.longitude ? String(settings.longitude) : '',
      });
      setPricesCardForm({
        month_price: settings.month_price ? String(settings.month_price) : '',
        year_price: settings.year_price ? String(settings.year_price) : '',
        total_capacity: settings.total_capacity ? String(settings.total_capacity) : '',
        available_capacity: settings.available_capacity ? String(settings.available_capacity) : '',
        total_rooms: settings.total_rooms ? String(settings.total_rooms) : '',
      });
      setPrices(settings.prices || []);
      setRules(settings.rules || []);
      setAmenities(settings.amenities || []);
      setContact(settings.contact || { phone: '', email: '', address: '' });
      setDormImages((settings.dormImages || []).map((img: any) => typeof img === 'string' ? { url: img, caption: '' } : img));
    }
  }, [settings]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  }
  if (error || !settings) {
    return <div className="text-center py-10 text-red-600 dark:text-red-400">Sozlamalarni yuklashda xatolik yuz berdi.</div>;
  }

  // --- PRICES HANDLERS ---
  const handlePriceChange = (idx: number, field: 'type' | 'price', value: string) => {
    setPrices(prices => prices.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleAddPrice = () => {
    setPrices(prices => [...prices, { type: '', price: '' }]);
  };
  const handleRemovePrice = (idx: number) => {
    setPrices(prices => prices.filter((_, i) => i !== idx));
  };

  const handleSavePrices = () => {
    updateSettingsMutation.mutate({ ...settings, prices });
  };
  // --- RULES STATE ---
  const handleRuleChange = (idx: number, value: string) => {
    setRules(rules => rules.map((r, i) => i === idx ? value : r));
  };
  const handleAddRule = () => {
    setRules(rules => [...rules, '']);
  };
  const handleRemoveRule = (idx: number) => {
    setRules(rules => rules.filter((_, i) => i !== idx));
  };
  const handleSaveRules = () => {
    updateSettingsMutation.mutate({ ...settings, rules });
  };
  // --- AMENITIES STATE ---
  const handleAmenityChange = (key: string) => {
    setAmenities(amenities => amenities.includes(key)
      ? amenities.filter(k => k !== key)
      : [...amenities, key]);
  };
  const handleSaveAmenities = () => {
    updateSettingsMutation.mutate({ ...settings, amenities });
  };
  // --- CONTACT STATE ---
  const handleContactChange = (field: 'phone' | 'email' | 'address', value: string) => {
    setContact(contact => ({ ...contact, [field]: value }));
  };
  const handleSaveContact = () => {
    updateSettingsMutation.mutate({ ...settings, contact });
  };
  // --- IMAGES STATE ---
  const handleImageCaptionChange = (idx: number, value: string) => {
    setDormImages(images => images.map((img, i) => i === idx ? { ...img, caption: value } : img));
  };
  const handleRemoveImage = (idx: number) => {
    setDormImages(images => images.filter((_, i) => i !== idx));
  };
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDormImages(images => [...images, { url: ev.target?.result as string, caption: '' }]);
    };
    reader.readAsDataURL(file);
  };
  const handleSaveImages = () => {
    updateSettingsMutation.mutate({ ...settings, dormImages });
    setEditImages(false);
  };

  // --- DORMITORY INFO STATE ---
  const handleDormFormChange = (field: string, value: string) => {
    setDormForm(f => ({ ...f, [field]: value }));
  };
  const handleDormImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDormForm(f => ({ ...f, images: Array.from(files) }));
    }
  };
  const handleSaveDorm = async () => {
    setDormLoading(true);
    try {
      // Prepare form data for PATCH
      const formData = new FormData();
      formData.append('name', dormForm.name);
      formData.append('address', dormForm.address);
      formData.append('description', dormForm.description);
      formData.append('month_price', dormForm.month_price);
      formData.append('year_price', dormForm.year_price);
      formData.append('latitude', dormForm.latitude);
      formData.append('longitude', dormForm.longitude);
      if (dormForm.images.length > 0) {
        dormForm.images.forEach((img, i) => formData.append('images', img));
      }
      // Get admin and university from settings if available
      if (settings?.admin) formData.append('admin', String(settings.admin));
      if (settings?.university) formData.append('university', String(settings.university));
      await apiQueries.patchMyDormitory(formData);
      setNotif({ type: 'success', message: 'Yotoqxona maʼlumotlari yangilandi!' });
      setEditDorm(false);
      // Optionally refetch settings
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (err: any) {
      setNotif({ type: 'error', message: err?.toString() || 'Xatolik yuz berdi!' });
    } finally {
      setDormLoading(false);
    }
  };

  // Add state for editing dormitory info and prices
  const handleDormCardChange = (field: string, value: string) => {
    setDormCardForm(f => ({ ...f, [field]: value }));
  };
  const handlePricesCardChange = (field: string, value: string) => {
    setPricesCardForm(f => ({ ...f, [field]: value }));
  };
  const handleSaveDormCard = async () => {
    setDormLoading(true);
    try {
      await apiQueries.patchMyDormitory({
        name: dormCardForm.name,
        address: dormCardForm.address,
        description: dormCardForm.description,
        latitude: dormCardForm.latitude,
        longitude: dormCardForm.longitude,
        admin: settings.admin?.id,
        university: settings.university?.id,
      });
      setNotif({ type: 'success', message: 'Yotoqxona maʼlumotlari yangilandi!' });
      setEditDormCard(false);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (err: any) {
      setNotif({ type: 'error', message: err?.toString() || 'Xatolik yuz berdi!' });
    } finally {
      setDormLoading(false);
    }
  };
  const handleSavePricesCard = async () => {
    setDormLoading(true);
    try {
      await apiQueries.patchMyDormitory({
        month_price: pricesCardForm.month_price,
        year_price: pricesCardForm.year_price,
        total_capacity: pricesCardForm.total_capacity,
        available_capacity: pricesCardForm.available_capacity,
        total_rooms: pricesCardForm.total_rooms,
        admin: settings.admin?.id,
        university: settings.university?.id,
      });
      setNotif({ type: 'success', message: 'Narx va sig‘im maʼlumotlari yangilandi!' });
      setEditPricesCard(false);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    } catch (err: any) {
      setNotif({ type: 'error', message: err?.toString() || 'Xatolik yuz berdi!' });
    } finally {
      setDormLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const token = localStorage.getItem('access');
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
      className="p-6 max-w-5xl mx-auto w-full"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
        {/* University logo and name */}
        <div className="flex items-center gap-4">
          {settings.university?.logo && (
            <img src={settings.university.logo} alt="University Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow" />
          )}
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><School className="w-5 h-5 text-blue-500" /> {settings.university?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{settings.university?.address}</div>
          </div>
        </div>
        <div className="flex-1" />
        {/* Admin info */}
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
          <User className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-100">{settings.admin?.username}</span>
          <span className="text-xs text-gray-500 ml-2">Admin</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Dormitory Info Card */}
        <SectionCard
          icon={<Info className="w-8 h-8 text-blue-500" />}
          title={((<span className="text-lg font-bold text-blue-700 dark:text-blue-300">Yotoqxona haqida</span>) as React.ReactNode)}
          description={editDormCard ? undefined : settings.description}
          onEdit={() => setEditDormCard(true)}
        >
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 p-4 flex flex-col gap-4 shadow-inner">
            {editDormCard ? (
              <>
                <EditableInput label="Nomi" value={dormCardForm.name} onChange={v => handleDormCardChange('name', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Manzil" value={dormCardForm.address} onChange={v => handleDormCardChange('address', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Tavsif" value={dormCardForm.description} onChange={v => handleDormCardChange('description', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Latitude" value={dormCardForm.latitude} onChange={v => handleDormCardChange('latitude', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Longitude" value={dormCardForm.longitude} onChange={v => handleDormCardChange('longitude', v)} disabled={dormLoading} fullWidth />
                <div className="flex gap-2 mt-2">
                  <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSaveDormCard} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition" onClick={() => setEditDormCard(false)} disabled={dormLoading}>Bekor qilish</button>
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
                  <Map className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-200">{settings.latitude}, {settings.longitude}</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>
        {/* Prices & Capacity Card */}
        <SectionCard
          icon={<DollarSign className="w-8 h-8 text-green-500" />}
          title={((<span className="text-lg font-bold text-green-700 dark:text-green-300">Narx va sig‘im</span>) as React.ReactNode)}
          description={editPricesCard ? undefined : "Oylik va yillik narxlar, umumiy va bo‘sh o‘rinlar, xonalar soni"}
          onEdit={() => setEditPricesCard(true)}
        >
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/40 dark:to-blue-900/30 p-4 flex flex-col gap-4 shadow-inner">
            {editPricesCard ? (
              <>
                <EditableInput label="Oylik narx" value={pricesCardForm.month_price} onChange={v => handlePricesCardChange('month_price', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Yillik narx" value={pricesCardForm.year_price} onChange={v => handlePricesCardChange('year_price', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Umumiy sig‘im" value={pricesCardForm.total_capacity} onChange={v => handlePricesCardChange('total_capacity', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Bo‘sh o‘rinlar" value={pricesCardForm.available_capacity} onChange={v => handlePricesCardChange('available_capacity', v)} disabled={dormLoading} fullWidth />
                <EditableInput label="Xonalar soni" value={pricesCardForm.total_rooms} onChange={v => handlePricesCardChange('total_rooms', v)} disabled={dormLoading} fullWidth />
                <div className="flex gap-2 mt-2">
                  <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSavePricesCard} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition" onClick={() => setEditPricesCard(false)} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Oylik narx:</span>
                  <span className="text-gray-700 dark:text-gray-200">{settings.month_price?.toLocaleString()} so‘m</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Yillik narx:</span>
                  <span className="text-gray-700 dark:text-gray-200">{settings.year_price?.toLocaleString()} so‘m</span>
                </div>
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Umumiy sig‘im:</span>
                  <span className="text-gray-700 dark:text-gray-200">{settings.total_capacity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Bo‘sh o‘rinlar:</span>
                  <span className="text-gray-700 dark:text-gray-200">{settings.available_capacity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold">Xonalar soni:</span>
                  <span className="text-gray-700 dark:text-gray-200">{settings.total_rooms}</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        {/* Amenities Section (edit-in-place) */}
        <SectionCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Qulayliklar"
          description="Yotoqxonada mavjud bo‘lgan qulayliklarni belgilang. Tahrirlash uchun 'Tahrirlash' tugmasini bosing."
          onEdit={() => setEditSection(editSection === 'amenities' ? null : 'amenities')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allAmenities.map((item) => (
              <label key={item.key} className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenities.includes(item.key)}
                  onChange={() => handleAmenityChange(item.key)}
                  className="form-checkbox h-5 w-5 text-blue-600 transition"
                  disabled={editSection !== 'amenities'}
                />
                <span className="text-blue-600 dark:text-blue-200">{item.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
          {editSection === 'amenities' && (
            <button className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSaveAmenities} disabled={updateSettingsMutation.status === 'pending'}>
              {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          )}
        </SectionCard>
        {/* Rules Section (edit-in-place) */}
        <SectionCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Qonun-qoidalar"
          description="Yotoqxonada amal qilinishi shart bo‘lgan asosiy qoidalar. Ro‘yxatni tahrirlash va yangi qoida qo‘shish mumkin."
          onEdit={() => setEditSection(editSection === 'rules' ? null : 'rules')}
        >
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-200">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-center gap-2">
                <EditableInput
                  label=""
                  value={rule}
                  onChange={v => handleRuleChange(i, v)}
                  disabled={editSection !== 'rules'}
                  placeholder="Qoida matni"
                  helper={editSection === 'rules' && i === rules.length - 1 ? 'Yangi qoida qo‘shish uchun pastdagi tugmani bosing' : undefined}
                  fullWidth
                />
                {editSection === 'rules' && rules.length > 1 && (
                  <button
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                    title="O‘chirish"
                    onClick={() => handleRemoveRule(i)}
                  >
                    <span className="text-red-500 font-bold">×</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
          {editSection === 'rules' && (
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={handleAddRule}
              >
                <Plus className="w-4 h-4" /> Yangi qoida qo‘shish
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={handleSaveRules}
                disabled={updateSettingsMutation.status === 'pending'}
              >
                {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
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
      >
        <div className="mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-2 flex items-center gap-2"
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
              const token = localStorage.getItem('access');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {settings.images && settings.images.length > 0 ? (
            settings.images.map((img: any, i: number) => (
              <div key={img.id || i} className="relative group flex flex-col items-center">
                <img
                  src={img.image}
                  alt={`Yotoqxona rasm ${i + 1}`}
                  className="w-full h-40 object-cover rounded-lg shadow border border-gray-200 dark:border-slate-700"
                />
                <button
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition-opacity opacity-80 hover:opacity-100"
                  title="Rasmni o'chirish"
                  onClick={() => setDeleteImageId(img.id)}
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-400 dark:text-gray-500 col-span-full">Rasmlar mavjud emas</div>
          )}
        </div>
        {/* Delete confirmation modal */}
        {deleteImageId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center">
              <div className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Rasmni o'chirish</div>
              <div className="mb-6 text-gray-700 dark:text-gray-300">Rostdan ham ushbu rasmni o'chirmoqchimisiz?</div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteImageId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteImage(deleteImageId);
                    setDeleteImageId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
      {/* DORMITORY EDIT MODAL */}
      {editDorm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2" onClick={() => setEditDorm(false)}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setEditDorm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-transparent rounded-full p-1 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Yotoqxona maʼlumotlarini tahrirlash</h2>
            <div className="flex flex-col gap-4">
              <EditableInput label="Nomi" value={dormForm.name} onChange={v => handleDormFormChange('name', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Manzil" value={dormForm.address} onChange={v => handleDormFormChange('address', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Tavsif" value={dormForm.description} onChange={v => handleDormFormChange('description', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Oylik narx" value={dormForm.month_price} onChange={v => handleDormFormChange('month_price', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Yillik narx" value={dormForm.year_price} onChange={v => handleDormFormChange('year_price', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Latitude" value={dormForm.latitude} onChange={v => handleDormFormChange('latitude', v)} disabled={dormLoading} fullWidth />
              <EditableInput label="Longitude" value={dormForm.longitude} onChange={v => handleDormFormChange('longitude', v)} disabled={dormLoading} fullWidth />
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Rasmlar</label>
                <input type="file" multiple accept="image/*" onChange={handleDormImageChange} disabled={dormLoading} className="block w-full text-sm text-gray-700 dark:text-gray-200" />
              </div>
            </div>
            <button
              onClick={handleSaveDorm}
              className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors text-lg mt-2 shadow disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={dormLoading}
            >
              {dormLoading ? (<><Loader2 className="animate-spin w-5 h-5" /> Saqlanmoqda...</>) : 'Saqlash'}
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Settings; 