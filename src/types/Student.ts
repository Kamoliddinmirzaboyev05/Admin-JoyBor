export type PaymentStatus = 'paid' | 'unpaid';

export interface Student {
  id: string;
  avatar?: string;
  fullName: string;
  faculty: 'Informatika' | 'Iqtisodiyot' | 'Muhandislik' | 'Matematika' | 'Fizika' | 'Kimyo';
  group: string;
  room: string;
  phone: string;
  paymentStatus: PaymentStatus;
  joinedAt: string; // ISO date
  birthDate: string; // ISO date
  address: string;
  password: string;
  region: string; // Viloyat yoki shahar
  district: string; // Tuman yoki shaharcha
  passport: string; // Passport ma'lumoti
  isPrivileged: boolean; // Imtiyozli yoki yo'q
  privilegeShare?: number; // Imtiyoz ulushi (foiz)
  direction: string; // Yo'nalish
  floor: string; // Qavat
} 