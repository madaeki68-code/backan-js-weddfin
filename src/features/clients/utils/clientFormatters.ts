import { INDONESIA_CITIES } from '../constants';
import { formatCurrency } from '../../../utils/currency';

export { formatCurrency };

export const formatRupiah = (amount: number): string =>
  `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(Number(amount) || 0))}`;

export const formatMonthLabel = (key: string): string => {
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return '';
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export const formatMonthKeyLabel = (key: string): string => formatMonthLabel(key);

export const toLocalDateString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const monthKeyToRange = (key: string): [string, string] => {
  if (!key) return ['', ''];
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return ['', ''];
  return [toLocalDateString(new Date(year, month - 1, 1)), toLocalDateString(new Date(year, month, 0))];
};

export const extractCityFromAddress = (address: string): string => {
  if (!address || !address.trim()) return 'Lainnya';

  const addr = address.trim();

  // Direct check for recognized cities in Indonesia
  for (const city of INDONESIA_CITIES) {
    const regex = new RegExp(`(^|[^a-zA-Z])${city}([^a-zA-Z]|$)`, 'i');
    if (regex.test(addr)) {
      return city;
    }
  }

  // Try to match patterns like "Kota Jakarta", "Kabupaten Bandung", etc.
  const cityPattern = addr.match(/(?:kota|kabupaten|kab\.?)\s+([a-zA-Z\s]+)/i);
  if (cityPattern && cityPattern[1]) {
    return cityPattern[1]
      .trim()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // Split by comma and get the most meaningful part
  const parts = addr.split(',').map(p => p.trim()).filter(p => p.length > 0);

  if (parts.length === 0) return 'Lainnya';

  const locationKeywords = [
    'jalan', 'jl', 'jln', 'no', 'nomor', 'rt', 'rw', 'kecamatan', 'kec',
    'kelurahan', 'kel', 'desa', 'provinsi', 'prov', 'daerah khusus', 'ibukota',
    'khusus', 'dki', 'dk', 'gedung', 'hotel', 'hall'
  ];

  const meaningfulParts = parts.filter(p => {
    const lowerP = p.toLowerCase();
    if (locationKeywords.some(kw => lowerP.includes(kw))) return false;
    if (/^\d+$/.test(p)) return false;
    if (p.length < 3) return false;
    if (/^\d+[a-zA-Z]?$/.test(p)) return false;
    return true;
  });

  if (meaningfulParts.length > 0) {
    const city = meaningfulParts[meaningfulParts.length - 1];
    return city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const lastPart = parts[parts.length - 1];
  return lastPart.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};
