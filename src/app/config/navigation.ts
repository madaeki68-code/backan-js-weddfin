import React from 'react';
import { ViewType } from '../../types';
import { Link as LinkIcon } from 'lucide-react';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  PackageIcon,
  BriefcaseIcon,
  SettingsIcon,
  TargetIcon,
  ClipboardListIcon,
  FileTextIcon,
  ChartPieIcon,
  LightbulbIcon,
  ImageIcon,
  UserCircleIcon,
} from '../../constants';

export interface NavSubItem {
  view: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  view?: ViewType;
  items?: NavSubItem[];
  section?: string;
  permission?: string;
}

/**
 * Navigation configuration for Attera Visual Application Shell
 * 1. BERANDA: Dashboard, Kalender
 * 2. BISNIS & OPERASIONAL: Calon Pengantin, Data Pengantin, Tim & Vendor
 * 3. KEUANGAN: Keuangan (Arus Kas, Pembayaran & Invoice)
 * 4. PRODUK & KATALOG: Paket & Layanan, Promo & Katalog, Pricelist Publik
 * 5. PENGATURAN: Profil Vendor, Link Publik, Pengaturan Sistem
 */
export const NAV_MENUS: NavMenuItem[] = [
  // BERANDA
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    view: ViewType.DASHBOARD,
    section: 'Beranda',
  },
  {
    id: 'kalender',
    label: 'Kalender',
    icon: CalendarIcon,
    view: ViewType.CALENDAR,
  },
  // BISNIS & OPERASIONAL
  {
    id: 'calon_pengantin',
    label: 'Calon Pengantin',
    icon: TargetIcon,
    section: 'Bisnis & Operasional',
    items: [
      { view: ViewType["Calon Pengantin"], label: 'Calon Pengantin', icon: TargetIcon },
      { view: ViewType.BOOKING, label: 'Data Booking', icon: ClipboardListIcon },
      { view: ViewType.CLIENT_REPORTS, label: 'KPI & Testimoni', icon: ChartPieIcon },
    ],
  },
  {
    id: 'clients',
    label: 'Data Pengantin',
    icon: UsersIcon,
    view: ViewType.CLIENTS,
  },
  {
    id: 'tim',
    label: 'Tim & Vendor',
    icon: BriefcaseIcon,
    view: ViewType.TEAM,
  },
  // KEUANGAN
  {
    id: 'keuangan',
    label: 'Keuangan',
    icon: DollarSignIcon,
    section: 'Keuangan',
    items: [
      { view: ViewType.FINANCE, label: 'Arus Kas', icon: DollarSignIcon },
      { view: ViewType.INVOICES, label: 'Pembayaran & Invoice', icon: FileTextIcon },
    ],
  },
  // PRODUK & KATALOG
  {
    id: 'produk',
    label: 'Produk & Katalog',
    icon: PackageIcon,
    section: 'Produk & Katalog',
    items: [
      { view: ViewType.PACKAGES, label: 'Paket & Layanan', icon: PackageIcon },
      { view: ViewType.PROMO_CODES, label: 'Promo & Katalog', icon: LightbulbIcon },
      { view: ViewType.GALLERY, label: 'Pricelist Publik', icon: ImageIcon },
    ],
  },
  // PENGATURAN
  {
    id: 'pengaturan',
    label: 'Pengaturan',
    icon: SettingsIcon,
    section: 'Pengaturan',
    items: [
      { view: ViewType.VENDOR_PROFILE, label: 'Profil Vendor', icon: UserCircleIcon },
      { view: ViewType.BIO_LINKS, label: 'Link Publik', icon: LinkIcon },
      { view: ViewType.SETTINGS, label: 'Pengaturan Sistem', icon: SettingsIcon },
    ],
  },
];

export function findActiveGroupId(activeView: ViewType): string | null {
  for (const menu of NAV_MENUS) {
    if (menu.view === activeView) {
      return menu.id;
    }
    if (menu.items?.some(sub => sub.view === activeView)) {
      return menu.id;
    }
  }
  return null;
}
