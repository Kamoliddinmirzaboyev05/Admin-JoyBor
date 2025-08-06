import React, { useState, useRef } from 'react';
import { Edit, DollarSign, ListChecks, Wifi, BookOpen, WashingMachine, Tv, Coffee, Plus, Info, MapPin, User, School, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';
import { toast } from 'sonner';
import { useSEO } from '../hooks/useSEO';

const allAmenities = [
  { key: 'Wifi', icon: <Wifi className="w-6 h-6" />, name: 'Wi-Fi', description: 'Tez va bepul internet' },
  { key: 'BookOpen', icon: <BookOpen className="w-6 h-6" />, name: 'Darsxona', description: '24/7 ochiq o\'quv xonasi' },
  { key: 'WashingMachine', icon: <WashingMachine className="w-6 h-6" />, name: 'Kir yuvish mashinasi', description: 'Bepul kir yuvish xizmati' },
  { key: 'Tv', icon: <Tv className="w-6 h-6" />, name: 'Dam olish xonasi', description: 'Televizor va o\'yinlar' },
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
        className={`bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${disabled ? 'cursor-default' : 'cursor-text'}`}
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [rules, setRules] = useState<{ id?: number, rule: string }[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [contact, setContact] = useState<{ phone: string; telegram: string }>({ phone: '', telegram: '' });
  const [dormLoading, setDormLoading] = useState(false);
  const [editDormCard, setEditDormCard] = useState(false);
  const [editPricesCard, setEditPricesCard] = useState(false);

  const [dormCardForm, setDormCardForm] = useState({
    name: '', address: '', description: '', distance_to_university: '',
  });
  const [pricesCardForm, setPricesCardForm] = useState({
    month_price: '', year_price: '', distance_to_university: '',
  });
  const [isUploading, setIsUploading] = useState(false);

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

  // All useEffect at the top
  React.useEffect(() => {
    if (settings) {
      setDormCardForm({
        name: settings.name || '',
        address: settings.address || '',
        description: settings.description || '',
        distance_to_university: settings.distance_to_university ? String(settings.distance_to_university) : '',
      });
      setPricesCardForm({
        month_price: settings.month_price ? String(settings.month_price) : '',
        year_price: settings.year_price ? String(settings.year_price) : '',
        distance_to_university: settings.distance_to_university ? String(settings.distance_to_university) : '',
      });
      setAmenities(settings.amenities || []);
      setContact(settings.contact || { phone: '', telegram: '' });
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
  const handleAmenityChange = (key: string) => {
    setAmenities(amenities => amenities.includes(key)
      ? amenities.filter(k => k !== key)
      : [...amenities, key]);
  };
  const handleSaveAmenities = () => {
    updateSettingsMutation.mutate({ ...settings, amenities });
  };
  // --- CONTACT STATE ---
  const handleContactChange = (field: 'phone' | 'email' | 'address' | 'telegram', value: string) => {
    setContact(contact => ({ ...contact, [field]: value }));
  };
  const handleSaveContact = () => {
    updateSettingsMutation.mutate({ ...settings, contact });
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
        description: dormCardForm.description,
        distance_to_university: parseFloat(dormCardForm.distance_to_university) || 0,
        admin: settings.admin?.id,
        university: settings.university?.id,
      };
      await apiQueries.patchMyDormitory(updateData);
      toast.success('Yotoqxona maʼlumotlari yangilandi!');
      setEditDormCard(false);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
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
        distance_to_university: parseFloat(pricesCardForm.distance_to_university) || 0,
        admin: settings.admin?.id,
        university: settings.university?.id,
      };
      await apiQueries.patchMyDormitory(updateData);
      toast.success('Narx ma\'lumotlari yangilandi!');
      setEditPricesCard(false);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
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
      className="p-6 max-w-5xl mx-auto w-full"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
        {/* University logo and name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow p-2">
            <img src="/logoicon.svg" alt="University Logo" className="w-full h-full object-contain" />
          </div>
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
                <EditableInput label="Universitetgacha masofa (km)" value={dormCardForm.distance_to_university} onChange={v => handleDormCardChange('distance_to_university', v)} disabled={dormLoading} fullWidth />
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
                  <School className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-200">Universitetgacha: {settings.distance_to_university} km</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>
        {/* Prices Card */}
        <SectionCard
          icon={<DollarSign className="w-8 h-8 text-green-500" />}
          title={((<span className="text-lg font-bold text-green-700 dark:text-green-300">Narx ma'lumotlari</span>) as React.ReactNode)}
          description={editPricesCard ? undefined : "Oylik va yillik narxlar"}
          onEdit={() => setEditPricesCard(true)}
        >
          <div className="rounded-xl bg-gray-50 dark:bg-slate-700/50 p-4 flex flex-col gap-4 border border-gray-100 dark:border-slate-600">
            {editPricesCard ? (
              <>
                <EditableInput label="Oylik narx (so'm)" value={pricesCardForm.month_price} onChange={v => handlePricesCardChange('month_price', v)} disabled={dormLoading} fullWidth placeholder="500000" />
                <EditableInput label="Yillik narx (so'm)" value={pricesCardForm.year_price} onChange={v => handlePricesCardChange('year_price', v)} disabled={dormLoading} fullWidth placeholder="5000000" />
                <div className="flex gap-2 mt-4">
                  <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSavePricesCard} disabled={dormLoading}>{dormLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
                  <button className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition" onClick={() => setEditPricesCard(false)} disabled={dormLoading}>Bekor qilish</button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Oylik narx</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{settings.month_price?.toLocaleString()} so'm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Yillik narx</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{settings.year_price?.toLocaleString()} so'm</span>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
        {/* Amenities Section (edit-in-place) */}
        <SectionCard
          icon={<ListChecks className="w-6 h-6" />}
          title="Qulayliklar"
          description="Yotoqxonada mavjud bo'lgan qulayliklarni belgilang. Tahrirlash uchun 'Tahrirlash' tugmasini bosing."
          onEdit={() => setEditSection(editSection === 'amenities' ? null : 'amenities')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allAmenities.map((item) => (
              <label key={item.key} className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenities.includes(item.key)}
                  onChange={() => handleAmenityChange(item.key)}
                  className="h-5 w-5 text-blue-600 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 transition"
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
          description="Yotoqxonada amal qilinishi shart bo'lgan asosiy qoidalar. Ro'yxatni tahrirlash va yangi qoida qo'shish mumkin."
          onEdit={() => setEditSection(editSection === 'rules' ? null : 'rules')}
        >
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-200">
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
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={handleAddRule}
              >
                <Plus className="w-4 h-4" /> Yangi qoida qo'shish
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={handleSaveRules}
                disabled={createRuleMutation.status === 'pending'}
              >
                {createRuleMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          )}
        </SectionCard>
        {/* Contact Section */}
        <SectionCard
          icon={<User className="w-6 h-6" />}
          title="Aloqa ma'lumotlari"
          description="Yotoqxona bilan bog'lanish uchun aloqa ma'lumotlari"
          onEdit={() => setEditSection(editSection === 'contact' ? null : 'contact')}
        >
          <div className="space-y-4">
            <EditableInput
              label="Telefon raqami"
              value={contact.phone}
              onChange={v => handleContactChange('phone', v)}
              disabled={editSection !== 'contact'}
              placeholder="+998 90 123 45 67"
              fullWidth
            />
            <EditableInput
              label="Telegram manzili"
              value={contact.telegram}
              onChange={v => handleContactChange('telegram', v)}
              disabled={editSection !== 'contact'}
              placeholder="@yotoqxona_admin"
              fullWidth
            />
          </div>
          {editSection === 'contact' && (
            <button
              className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              onClick={handleSaveContact}
              disabled={updateSettingsMutation.status === 'pending'}
            >
              {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {settings.images && settings.images.length > 0 ? (
            settings.images.map((img: any, i: number) => (
              <div key={i} className="relative group">
                <img
                  src={img.image}
                  alt={`Yotoqxona rasmi ${i + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Rasmni o'chirish"
                >
                  <span className="text-sm">×</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
              Hozircha rasmlar yuklanmagan
            </div>
          )}
        </div>
      </SectionCard>
    </motion.div>
  );
};

export default Settings;