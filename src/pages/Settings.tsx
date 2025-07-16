import React, { useState } from 'react';
import { Edit, Image as ImageIcon, DollarSign, ListChecks, Plus, Wifi, BookOpen, WashingMachine, Tv, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQueries } from '../data/api';

const allAmenities = [
  { key: 'Wifi', icon: <Wifi className="w-6 h-6" />, name: 'Wi-Fi', description: 'Tez va bepul internet' },
  { key: 'BookOpen', icon: <BookOpen className="w-6 h-6" />, name: 'Darsxona', description: '24/7 ochiq o‘quv xonasi' },
  { key: 'WashingMachine', icon: <WashingMachine className="w-6 h-6" />, name: 'Kir yuvish mashinasi', description: 'Bepul kir yuvish xizmati' },
  { key: 'Tv', icon: <Tv className="w-6 h-6" />, name: 'Dam olish xonasi', description: 'Televizor va o‘yinlar' },
  { key: 'Coffee', icon: <Coffee className="w-6 h-6" />, name: 'Kichik oshxona', description: 'Choy va yengil taomlar uchun' },
];

function SectionCard({ icon, title, description, children, onEdit }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode; onEdit?: () => void }) {
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
  const queryClient = useQueryClient();
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: apiQueries.getSettings,
    staleTime: 1000 * 60 * 5,
  });
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div></div>;
  if (error || !settings) return <div className="text-center py-10 text-red-600 dark:text-red-400">Sozlamalarni yuklashda xatolik yuz berdi.</div>;

  // --- PRICES STATE ---
  const [editSection, setEditSection] = useState<string | null>(null);
  const [prices, setPrices] = useState<{ type: string; price: string }[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(allAmenities.map(a => a.key));
  const [editImages, setEditImages] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setPrices(settings.prices || []);
    }
  }, [settings]);

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

  // --- PRICES SAVE ---
  // --- NOTIFICATION STATE ---
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
  const handleSavePrices = () => {
    updateSettingsMutation.mutate({ ...settings, prices });
  };

  // --- RULES STATE ---
  const [rules, setRules] = useState<string[]>([]);
  React.useEffect(() => {
    if (settings) {
      setRules(settings.rules || []);
    }
  }, [settings]);

  // --- RULES HANDLERS ---
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
  const [amenities, setAmenities] = useState<string[]>([]);
  React.useEffect(() => {
    if (settings) {
      setAmenities(settings.amenities || []);
    }
  }, [settings]);
  const handleAmenityChange = (key: string) => {
    setAmenities(amenities => amenities.includes(key)
      ? amenities.filter(k => k !== key)
      : [...amenities, key]);
  };
  const handleSaveAmenities = () => {
    updateSettingsMutation.mutate({ ...settings, amenities });
  };

  // --- CONTACT STATE ---
  const [contact, setContact] = useState<{ phone: string; email: string; address: string }>({ phone: '', email: '', address: '' });
  React.useEffect(() => {
    if (settings) {
      setContact(settings.contact || { phone: '', email: '', address: '' });
    }
  }, [settings]);
  const handleContactChange = (field: 'phone' | 'email' | 'address', value: string) => {
    setContact(contact => ({ ...contact, [field]: value }));
  };
  const handleSaveContact = () => {
    updateSettingsMutation.mutate({ ...settings, contact });
  };

  // --- IMAGES STATE ---
  const [dormImages, setDormImages] = useState<{ url: string; caption: string }[]>([]);
  React.useEffect(() => {
    if (settings) {
      setDormImages((settings.dormImages || []).map((img: any) => typeof img === 'string' ? { url: img, caption: '' } : img));
    }
  }, [settings]);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="p-6 max-w-6xl mx-auto w-full"
    >
      <h1 className="text-3xl font-extrabold mb-10 text-gray-900 dark:text-white text-center tracking-tight">Yotoqxona Sozlamalari</h1>
      {notif && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-center font-semibold ${notif.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
          {notif.message}
          <button className="ml-4 text-xs underline" onClick={() => setNotif(null)}>Yopish</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <SectionCard
          icon={<ImageIcon className="w-6 h-6" />}
          title="Yotoqxona suratlari"
          description="Yotoqxona va xonalar haqidagi suratlar. Suratlarni tahrirlash va har biriga izoh qo‘shish mumkin."
          onEdit={() => setEditImages(!editImages)}
        >
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dormImages.map((img, i) => (
              <div key={i} className="relative group flex flex-col items-center">
                <img src={img.url} alt={`Yotoqxona ${i+1}`} className="w-40 h-28 object-cover rounded-lg shadow border border-gray-200 dark:border-slate-700" />
                {editImages && (
                  <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700" onClick={() => handleRemoveImage(i)} title="O‘chirish"><span className="text-lg">×</span></button>
                )}
                {editImages && (
                  <input type="text" className="mt-2 w-36 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs" placeholder="Rasm tavsifi (ixtiyoriy)" value={img.caption} onChange={e => handleImageCaptionChange(i, e.target.value)} />
                )}
              </div>
            ))}
            {editImages && (
              <label className="w-40 h-28 flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                <span className="text-blue-500"><Plus className="w-8 h-8" /></span>
                <span className="text-xs mt-2">Yangi rasm qo‘shish</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAddImage} />
              </label>
            )}
          </div>
          {editImages && (
            <button className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSaveImages} disabled={updateSettingsMutation.status === 'pending'}>
              {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          )}
        </SectionCard>
        {/* Prices */}
        <SectionCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Narxlar"
          description="Yotoqxonadagi xonalar va ularning oylik narxlari. Narxlarni tahrirlash uchun 'Tahrirlash' tugmasini bosing."
          onEdit={() => setEditSection(editSection === 'prices' ? null : 'prices')}
        >
          <div className="overflow-x-auto">
            <table className="w-full bg-transparent rounded-lg table-fixed">
              <colgroup>
                <col style={{ width: '40%' }} />
                <col style={{ width: '40%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Xona turi</th>
                  <th className="py-2 px-4 text-left text-gray-600 dark:text-gray-300">Narxi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prices.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-slate-700">
                    <td className="py-2 px-4">
                      <EditableInput
                        label=""
                        value={row.type}
                        onChange={v => handlePriceChange(i, 'type', v)}
                        disabled={editSection !== 'prices'}
                        placeholder="Xona turi (masalan, Oddiy)"
                        style={{ maxWidth: '200px' }}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <EditableInput
                        label=""
                        value={row.price}
                        onChange={v => handlePriceChange(i, 'price', v)}
                        disabled={editSection !== 'prices'}
                        placeholder="Narxi (masalan, 300 000 so‘m/oy)"
                        style={{ maxWidth: '200px' }}
                      />
                    </td>
                    <td className="py-2 px-2">
                      {editSection === 'prices' && prices.length > 1 && (
                        <button
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                          title="O‘chirish"
                          onClick={() => handleRemovePrice(i)}
                        >
                          <span className="text-red-500 font-bold">×</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editSection === 'prices' && (
            <div className="flex gap-2 mt-4">
              <button
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={handleAddPrice}
              >
                <Plus className="w-4 h-4" /> Yangi narx qo‘shish
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={handleSavePrices}
                disabled={updateSettingsMutation.status === 'pending'}
              >
                {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          )}
        </SectionCard>
        {/* Rules */}
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
        {/* Amenities section */}
        <SectionCard
          icon={<Wifi className="w-6 h-6" />}
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
        {/* Contact */}
        <SectionCard
          icon={<Plus className="w-6 h-6" />}
          title="Bog‘lanish"
          description="Yotoqxona ma’muriyati bilan bog‘lanish uchun telefon, email va manzil. Tahrirlash uchun 'Tahrirlash' tugmasini bosing."
          onEdit={() => setEditSection(editSection === 'contact' ? null : 'contact')}
        >
          <div className="grid grid-cols-1 gap-4 text-gray-700 dark:text-gray-200">
            <EditableInput label="Telefon" value={contact.phone} onChange={v => handleContactChange('phone', v)} disabled={editSection !== 'contact'} placeholder="Telefon raqami" />
            <EditableInput label="Email" value={contact.email} onChange={v => handleContactChange('email', v)} disabled={editSection !== 'contact'} placeholder="Email manzili" />
            <EditableInput label="Manzil" value={contact.address} onChange={v => handleContactChange('address', v)} disabled={editSection !== 'contact'} placeholder="Manzil" />
          </div>
          {editSection === 'contact' && (
            <button className="mt-4 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSaveContact} disabled={updateSettingsMutation.status === 'pending'}>
              {updateSettingsMutation.status === 'pending' ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
};

export default Settings; 