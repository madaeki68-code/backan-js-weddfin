import { ClientTabType, ExtraChargeTemplate } from '../types';

export const DEFAULT_CLIENT_TAB: ClientTabType = 'this-month';

export const CLIENT_STATUS_FILTER_OPTIONS = [
  'Semua Status',
  'Aktif',
  'Non-Aktif',
  'Lunas',
  'DP Terbayar',
  'Belum Bayar',
];

export const INDONESIA_CITIES = [
  'Serang', 'Pandeglang', 'Cilegon', 'Lebak', 'Rangkasbitung', 'Tangerang', 'Tangerang Selatan', 'Tangsel',
  'Jakarta', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara',
  'Bogor', 'Depok', 'Bekasi', 'Karawang', 'Bandung', 'Bandung Barat', 'Cimahi',
  'Sukabumi', 'Cianjur', 'Purwakarta', 'Subang', 'Indramayu', 'Cirebon', 'Kuningan',
  'Majalengka', 'Sumedang', 'Garut', 'Tasikmalaya', 'Ciamis', 'Pangandaran', 'Banjar',
  'Semarang', 'Surakarta', 'Solo', 'Yogyakarta', 'Jogja', 'Surabaya', 'Malang',
  'Denpasar', 'Medan', 'Palembang', 'Bandar Lampung', 'Lampung'
];

export const DEFAULT_CHARGE_TEMPLATES: ExtraChargeTemplate[] = [
  // Overtime
  { name: 'Overtime Kru (1 Jam)', category: 'Overtime & Jam Tambahan', defaultAmount: 500000 },
  { name: 'Overtime Kru (2 Jam)', category: 'Overtime & Jam Tambahan', defaultAmount: 900000 },
  { name: 'Overtime Acara (Per Jam)', category: 'Overtime & Jam Tambahan', defaultAmount: 350000 },
  { name: 'Overtime Standby / Jeda Waktu', category: 'Overtime & Jam Tambahan', defaultAmount: 250000 },

  // Dokumentasi & Personil Ekstra
  { name: 'Drone Aerial 4K / Pilot Drone', category: 'Dokumentasi & Personil', defaultAmount: 1200000 },
  { name: 'Same Day Edit (SDE) Video Teaser', category: 'Dokumentasi & Personil', defaultAmount: 1500000 },
  { name: 'Fotografer Tambahan (1 Orang)', category: 'Dokumentasi & Personil', defaultAmount: 750000 },
  { name: 'Videografer Tambahan (1 Orang)', category: 'Dokumentasi & Personil', defaultAmount: 850000 },
  { name: 'Lighting Setup & Gear Tambahan', category: 'Dokumentasi & Personil', defaultAmount: 500000 },

  // Cetak & Merchandise
  { name: 'Upgrade Cetak Album 20x30 Exclusive & Box', category: 'Cetak & Album', defaultAmount: 600000 },
  { name: 'Cetak Kanvas 24R + Frame Minimalis', category: 'Cetak & Album', defaultAmount: 450000 },
  { name: 'USB Flashdisk Kayu Exclusive & Box', category: 'Cetak & Album', defaultAmount: 250000 },
  { name: 'Mini Album Parents (2 Buku)', category: 'Cetak & Album', defaultAmount: 500000 },
  { name: 'Cetak Pembesaran 16R + Bingkai', category: 'Cetak & Album', defaultAmount: 200000 },

  // Layanan & Operasional
  { name: 'Live Streaming Acara (IG / YouTube)', category: 'Layanan & Operasional', defaultAmount: 1500000 },
  { name: 'Transport & Akomodasi Luar Kota', category: 'Layanan & Operasional', defaultAmount: 500000 },
  { name: 'Biaya Izin Lokasi / Venue Charge', category: 'Layanan & Operasional', defaultAmount: 300000 },
  { name: 'Fast Editing / Express Delivery (3 Hari)', category: 'Layanan & Operasional', defaultAmount: 750000 },

  // Bonus / Complimentary (Rp 0)
  { name: 'Bonus Overtime 1 Jam (Free)', category: 'Bonus / Free (Rp 0)', defaultAmount: 0, badge: 'Rp 0' },
  { name: 'Bonus Cetak Foto Mini Frame (Free)', category: 'Bonus / Free (Rp 0)', defaultAmount: 0, badge: 'Rp 0' },
  { name: 'Bonus Flashdisk Tambahan (Free)', category: 'Bonus / Free (Rp 0)', defaultAmount: 0, badge: 'Rp 0' },
  { name: 'Complimentary Raw Files Access (Free)', category: 'Bonus / Free (Rp 0)', defaultAmount: 0, badge: 'Rp 0' },
];

export const POPULAR_PRESET_CHIPS: { label: string; name: string; amount: number; isFree?: boolean }[] = [
  { label: 'Overtime 1 Jam', name: 'Overtime Kru (1 Jam)', amount: 500000 },
  { label: 'Drone 4K', name: 'Drone Aerial 4K / Pilot Drone', amount: 1200000 },
  { label: 'SDE Video', name: 'Same Day Edit (SDE) Video Teaser', amount: 1500000 },
  { label: 'Upgrade Album', name: 'Upgrade Cetak Album 20x30 Exclusive & Box', amount: 600000 },
  { label: 'Bonus Overtime (Rp 0)', name: 'Bonus Overtime 1 Jam (Free)', amount: 0, isFree: true },
  { label: 'Bonus Cetak (Rp 0)', name: 'Bonus Cetak Foto Mini Frame (Free)', amount: 0, isFree: true },
];
