import React from 'react';
import { ContactChannel, Lead } from '../../../types';
import {
  WhatsappIcon,
  CameraIcon,
  FileTextIcon,
  PhoneIncomingIcon,
  Share2Icon,
  LightbulbIcon,
} from '../../../constants';
import { toPublicNameSlug } from '../../../utils/publicRouting';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getContactChannelIcon = (channel: ContactChannel): React.ReactElement => {
  const iconProps = { className: 'w-4 h-4' };
  switch (channel) {
    case ContactChannel.WHATSAPP:
      return React.createElement(WhatsappIcon, iconProps);
    case ContactChannel.INSTAGRAM:
      return React.createElement(CameraIcon, iconProps);
    case ContactChannel.WEBSITE:
      return React.createElement(FileTextIcon, iconProps);
    case ContactChannel.PHONE:
      return React.createElement(PhoneIncomingIcon, iconProps);
    case ContactChannel.REFERRAL:
      return React.createElement(Share2Icon, iconProps);
    case ContactChannel.SUGGESTION_FORM:
      return React.createElement(WhatsappIcon, iconProps);
    default:
      return React.createElement(LightbulbIcon, iconProps);
  }
};

export const getDaysSince = (dateString?: string): string => {
  if (!dateString) return '';
  const leadDate = new Date(dateString);
  if (isNaN(leadDate.getTime())) return '';
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - leadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Hari ini';
  if (diffDays === 2) return 'Kemarin';
  return `${diffDays} hari lalu`;
};

export const getInitials = (name?: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const buildPublicPackageLinkForRegion = (
  baseUrl: string,
  lead: Pick<Lead, 'id' | 'name'>,
  regionValue?: string
): string => {
  const slug = toPublicNameSlug(lead.name);
  const shortId = lead.id.slice(0, 8);
  const params = new URLSearchParams();
  if (regionValue) {
    params.set('region', regionValue);
  }
  params.set('lid', shortId);
  params.set('leadName', slug);
  return `${baseUrl}?${params.toString()}`;
};

export const buildBookingUrlForRegion = (
  baseUrl: string,
  lead: Pick<Lead, 'id' | 'name'>,
  region?: string
): string => {
  const params = new URLSearchParams();
  if (region) params.set('region', region);
  params.set('lid', lead.id.slice(0, 8));
  params.set('leadName', toPublicNameSlug(lead.name));
  return `${baseUrl}?${params.toString()}`;
};
