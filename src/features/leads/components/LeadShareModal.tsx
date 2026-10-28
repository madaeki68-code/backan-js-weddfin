import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../../../shared/ui/Modal';
import { Lead, Profile, Gallery, ContactChannel } from '../../../types';
import { buildPackageRegionOptions } from '../../../utils/packageRegions';
import { buildPublicShareUrl, getGalleryPublicRouteId, toPublicNameSlug } from '../../../utils/publicRouting';
import { cleanPhoneNumber, WhatsappIcon, DEFAULT_PACKAGE_SHARE_TEMPLATE, DEFAULT_BOOKING_FORM_TEMPLATE } from '../../../constants';
import { Package as PackageIconLucide, LinkIcon, CameraIcon, FileTextIcon, PhoneIncomingIcon, Share2Icon, LightbulbIcon } from 'lucide-react';
import { upsertProfile } from '../../../services/profile';
import { listGalleries } from '../../../services/galleries';

export interface LeadShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  type: 'package' | 'booking';
  userProfile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  showNotification: (msg: string) => void;
  publicPackagesUrl: string;
  publicBookingFormUrl: string;
}

export const LeadShareModal: React.FC<LeadShareModalProps> = ({
  isOpen,
  onClose,
  lead,
  type,
  userProfile,
  setProfile,
  showNotification,
  publicPackagesUrl,
  publicBookingFormUrl,
}) => {
  const [packageSource, setPackageSource] = useState<'public-packages' | 'gallery'>('public-packages');
  const regions = useMemo(() => buildPackageRegionOptions(), []);
  const initialRegion = regions[0]?.value || 'jabodetabek';
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');

  const initialBookingRegion = regions[0]?.value || 'jabodetabek';
  const [selectedBookingRegion, setSelectedBookingRegion] = useState<string>(initialBookingRegion);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !lead) return;
    (async () => {
      try {
        const list = await listGalleries();
        const listToUse = Array.isArray(list) ? list : [];
        setGalleries(listToUse);

        if (listToUse.length > 0) {
          const leadLoc = (lead.location || '').toLowerCase().trim();
          const matched = leadLoc
            ? listToUse.find(g =>
                (g.region && g.region.toLowerCase().includes(leadLoc)) ||
                (g.region && leadLoc.includes(g.region.toLowerCase())) ||
                g.title.toLowerCase().includes(leadLoc)
              )
            : null;
          setSelectedGalleryId(matched ? matched.id : listToUse[0].id);
        }
      } catch (e) {
        console.warn('Failed to load galleries for share modal', e);
      }
    })();
  }, [isOpen, lead?.location]);

  const selectedGallery = useMemo(() => galleries.find(g => g.id === selectedGalleryId) || null, [galleries, selectedGalleryId]);

  const buildPublicPackageLinkForRegion = (regValue?: string) => {
    if (!lead) return '';
    const slug = toPublicNameSlug(lead.name || '');
    const shortId = (lead.id || '').slice(0, 8);
    const params = new URLSearchParams();
    if (regValue) {
      params.set('region', regValue);
    }
    params.set('lid', shortId);
    params.set('leadName', slug);
    return `${publicPackagesUrl}?${params.toString()}`;
  };

  const selectedPublicPackageLink = useMemo(() => {
    if (!lead) return '';
    return buildPublicPackageLinkForRegion(selectedRegion);
  }, [publicPackagesUrl, selectedRegion, lead?.id, lead?.name]);

  const selectedGalleryLink = useMemo(() => {
    if (!lead) return '';
    const slug = toPublicNameSlug(lead.name || '');
    const shortId = (lead.id || '').slice(0, 8);
    if (!selectedGallery) {
      return `${publicPackagesUrl}?lid=${encodeURIComponent(shortId)}&leadName=${encodeURIComponent(slug)}`;
    }
    const routeId = getGalleryPublicRouteId(selectedGallery, galleries);
    return buildPublicShareUrl('gallery', routeId, { query: { lid: shortId, leadName: slug } });
  }, [selectedGallery, galleries, lead?.id, lead?.name, publicPackagesUrl]);

  const activePackageLink = packageSource === 'public-packages' ? selectedPublicPackageLink : selectedGalleryLink;

  const buildBookingUrlForRegion = (region: string) => {
    if (!lead) return '';
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    params.set('lid', (lead.id || '').slice(0, 8));
    params.set('leadName', toPublicNameSlug(lead.name || ''));
    return `${publicBookingFormUrl}?${params.toString()}`;
  };

  const bookingUrlWithName = useMemo(() => {
    if (!lead) return '';
    return buildBookingUrlForRegion(selectedBookingRegion);
  }, [publicBookingFormUrl, lead?.id, lead?.name, selectedBookingRegion]);

  const defaultBookingUrl = useMemo(() => {
    if (!lead) return '';
    return buildBookingUrlForRegion(initialBookingRegion);
  }, [
    publicBookingFormUrl, lead?.id, lead?.name, initialBookingRegion,
  ]);

  useEffect(() => {
    if (!isOpen || !lead) return;
    let template = '';
    if (type === 'package') {
      const saved = userProfile.packageShareTemplate?.trim();
      const raw = !saved || saved === 'Halo {leadName}!' ? DEFAULT_PACKAGE_SHARE_TEMPLATE : saved;
      template = raw
        .replace('{leadName}', lead.name || '')
        .replace('{companyName}', userProfile.companyName || '')
        .replace('{packageLink}', activePackageLink);
    } else {
      const saved = userProfile.bookingFormTemplate?.trim();
      const raw = !saved || saved === 'Halo {leadName}!' ? DEFAULT_BOOKING_FORM_TEMPLATE : saved;
      template = raw
        .replace('{leadName}', lead.name || '')
        .replace('{companyName}', userProfile.companyName || '')
        .replace('{bookingFormLink}', defaultBookingUrl);
    }
    setMessage(template);
  }, [isOpen, type, lead?.name, userProfile.packageShareTemplate, userProfile.bookingFormTemplate, userProfile.companyName, activePackageLink, defaultBookingUrl]);

  const handleBookingRegionSelect = (region: string) => {
    const newLink = buildBookingUrlForRegion(region);
    setSelectedBookingRegion(region);
    if (message.includes(bookingUrlWithName)) {
      setMessage(prev => prev.replace(bookingUrlWithName, newLink));
    } else if (message.includes('{bookingFormLink}')) {
      setMessage(prev => prev.replace('{bookingFormLink}', newLink));
    } else {
      setMessage(prev => (prev ? `${prev}\n\n${newLink}` : newLink));
    }
  };

  const handleSwitchSource = (newSource: 'public-packages' | 'gallery') => {
    const oldLink = activePackageLink;
    const newLink = newSource === 'public-packages' ? selectedPublicPackageLink : selectedGalleryLink;
    setPackageSource(newSource);
    if (oldLink && newLink && oldLink !== newLink) {
      if (message.includes(oldLink)) {
        setMessage(prev => prev.replace(oldLink, newLink));
      } else if (message.includes('{packageLink}')) {
        setMessage(prev => prev.replace('{packageLink}', newLink));
      }
    }
  };

  const handleSelectRegion = (regValue: string) => {
    const oldLink = selectedPublicPackageLink;
    setSelectedRegion(regValue);
    const newLink = buildPublicPackageLinkForRegion(regValue);
    if (packageSource === 'public-packages') {
      if (oldLink && message.includes(oldLink)) {
        setMessage(prev => prev.replace(oldLink, newLink));
      } else if (message.includes('{packageLink}')) {
        setMessage(prev => prev.replace('{packageLink}', newLink));
      }
    }
  };

  const handleGalleryChange = (newGalleryId: string) => {
    if (!lead) return;
    const previousLink = selectedGalleryLink;
    setSelectedGalleryId(newGalleryId);
    const newGallery = galleries.find(g => g.id === newGalleryId);
    if (newGallery) {
      const newRouteId = getGalleryPublicRouteId(newGallery, galleries);
      const newLink = buildPublicShareUrl('gallery', newRouteId, { query: { lid: (lead.id || '').slice(0, 8), leadName: toPublicNameSlug(lead.name || '') } });
      if (previousLink && message.includes(previousLink)) {
        setMessage(prev => prev.replace(previousLink, newLink));
      } else if (message.includes('{packageLink}')) {
        setMessage(prev => prev.replace('{packageLink}', newLink));
      } else {
        setMessage(prev => (prev ? `${prev}\n\n${newLink}` : newLink));
      }
    }
  };

  const handleShareToWhatsApp = () => {
    if (!lead) return;
    if (!lead.whatsapp) { showNotification('Nomor WhatsApp untuk Calon Pengantin ini tidak tersedia.'); return; }
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber(lead.whatsapp)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveTemplate = async () => {
    if (!lead) return;
    let rawTemplate = message;
    try {
      if (type === 'package') {
        rawTemplate = message
          .replace(new RegExp(lead.name, 'g'), '{leadName}')
          .replace(new RegExp(userProfile.companyName, 'g'), '{companyName}');
        if (activePackageLink) {
          rawTemplate = rawTemplate.replace(new RegExp(activePackageLink, 'g'), '{packageLink}');
        }
        setProfile(prev => ({ ...prev, packageShareTemplate: rawTemplate }));
        await upsertProfile({ id: userProfile.id, packageShareTemplate: rawTemplate });
      } else {
        rawTemplate = message
          .replace(new RegExp(lead.name, 'g'), '{leadName}')
          .replace(new RegExp(userProfile.companyName, 'g'), '{companyName}')
          .replace(new RegExp(bookingUrlWithName, 'g'), '{bookingFormLink}');
        setProfile(prev => ({ ...prev, bookingFormTemplate: rawTemplate }));
        await upsertProfile({ id: userProfile.id, bookingFormTemplate: rawTemplate });
      }
      showNotification('Template berhasil disimpan!');
    } catch (err) {
      console.warn('[Supabase] upsert profile template failed', err);
      showNotification('Gagal menyimpan template. Coba lagi.');
    }
  };

  if (!lead) return null;

  const modalTitle = type === 'package' ? `Bagikan Package ke ${lead.name}` : `Kirim Form Booking ke ${lead.name}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <div className="space-y-4">
        {type === 'package' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 p-1 bg-[#F4F6F9] rounded-xl border border-[#EAEFF4]">
              <button
                type="button"
                onClick={() => handleSwitchSource('public-packages')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  packageSource === 'public-packages'
                    ? 'bg-white text-[#5D87FF] shadow-xs'
                    : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                <PackageIconLucide className="w-3.5 h-3.5" />
                <span>Paket Publik</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSource('gallery')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  packageSource === 'gallery'
                    ? 'bg-white text-[#5D87FF] shadow-xs'
                    : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Pricelist Upload</span>
              </button>
            </div>

            {packageSource === 'public-packages' && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {regions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => handleSelectRegion(r.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center truncate ${
                        selectedRegion === r.value
                          ? 'bg-[#5D87FF] text-white shadow-xs'
                          : 'bg-white text-[#5A6A85] hover:bg-slate-100 border border-[#EAEFF4]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {packageSource === 'gallery' && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#1E3A8A] inline-flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-[#3563E9]" />
                    Pricelist
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Tersambung ke Lead ID
                  </span>
                </div>

                {galleries.length > 0 ? (
                  <select
                    value={selectedGalleryId}
                    onChange={(e) => handleGalleryChange(e.target.value)}
                    className="input-field w-full text-xs sm:text-sm bg-white"
                  >
                    {galleries.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.title} {g.region ? `• ${g.region}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <p className="font-semibold">Belum ada Pricelist di menu Pricelist Upload.</p>
                    <p className="mt-0.5 text-[11px] text-amber-700">
                      Silakan gunakan tab <strong>Katalog Paket Publik</strong> di atas untuk membagikan tautan paket per wilayah.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {type === 'booking' && (
          <div className="p-3 bg-brand-bg rounded-lg border border-brand-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-brand-text-light inline-flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-[#3563E9]" />
                Link Formulir Booking per Wilayah
              </span>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(bookingUrlWithName); showNotification('Link Booking disalin'); }}
                className="button-secondary text-xs py-1 px-2.5 cursor-pointer"
              >
                Salin Link
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {regions.map(region => (
                <button
                  key={region.value}
                  type="button"
                  onClick={() => handleBookingRegionSelect(region.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedBookingRegion === region.value
                      ? 'bg-[#3563E9] text-white shadow-xs'
                      : 'bg-white text-brand-text-secondary border border-brand-border hover:bg-slate-100'
                  }`}
                >
                  {region.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-brand-text-secondary font-mono break-all bg-white/70 p-1.5 rounded-lg border border-slate-100">
              {bookingUrlWithName}
            </p>
          </div>
        )}

        <div className="input-group">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={9}
            className="input-field w-full text-xs sm:text-sm"
            placeholder=" "
          ></textarea>
          <label className="input-label">Pesan WhatsApp</label>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-3 border-t border-brand-border sticky bottom-0 bg-brand-surface">
          <button onClick={handleSaveTemplate} className="button-secondary w-full sm:w-auto text-xs sm:text-sm cursor-pointer">
            Simpan Template Ini
          </button>
          <button onClick={handleShareToWhatsApp} className="btn-box-wa share-wa-labeled-button inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer">
            <WhatsappIcon className="w-4 h-4 flex-shrink-0 text-white" />
            Bagikan ke WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
};
