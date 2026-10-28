import React from 'react';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { Trash2Icon, DEFAULT_BRIEFING_TEMPLATE, DEFAULT_TERMS_AND_CONDITIONS } from '../../../../constants';
import ToggleSwitch from '../../../../shared/ui/ToggleSwitch';
import { TemplateEditor } from '../TemplateEditor';
import { useSettingsProfile } from '../../hooks/useSettingsProfile';
import { BACKGROUND_IMAGE_CONFIG } from '../../constants/settings.constants';
import { Profile } from '../../../../types';
import { TemplateSettingKey } from '../../types/settings.types';

export interface BusinessProfileTabProps {
  profileHook: ReturnType<typeof useSettingsProfile>;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  onSaveTemplate: (key: TemplateSettingKey, value: string) => Promise<void>;
}

export const BusinessProfileTab: React.FC<BusinessProfileTabProps> = ({
  profileHook,
  profile,
  setProfile,
  onSaveTemplate,
}) => {
  const {
    localProfile,
    isSaving,
    saveError,
    showSuccess,
    uploadingBackground,
    failedBackgroundPreviews,
    setFailedBackgroundPreviews,
    settingsSaving,
    handleInputChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSignatureChange,
    handleRemoveSignature,
    handleBackgroundUpload,
    handleRemoveBackground,
    handleNotificationChange,
    handleTwoFactorChange,
    handleProfileSubmit,
  } = profileHook;

  return (
    <form onSubmit={handleProfileSubmit} className="form-compact form-compact--ios-scale">
      <div className="space-y-4 md:space-y-6">
        {/* Informasi Publik */}
        <section className="rounded-2xl border border-brand-accent/25 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          <h3 className="mb-4 border-b border-brand-accent/25 pb-3 text-sm font-semibold text-brand-text-primary md:text-lg">
            Informasi Publik
          </h3>
          <div className="space-y-4 md:space-y-5 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="input-group">
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={localProfile.fullName || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="fullName" className="input-label">
                  Nama Owner
                </label>
              </div>
              <div className="input-group">
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={localProfile.companyName || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="companyName" className="input-label">
                  Nama Perusahaan
                </label>
              </div>
              <div className="input-group">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={localProfile.email || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="email" className="input-label">
                  Email
                </label>
              </div>
              <div className="input-group">
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={localProfile.phone || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="phone" className="input-label">
                  Telepon Utama
                </label>
              </div>
              <div className="input-group">
                <input
                  id="secondaryPhone"
                  type="tel"
                  name="secondaryPhone"
                  value={localProfile.secondaryPhone || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="secondaryPhone" className="input-label">
                  Kontak Tambahan (Opsional)
                </label>
              </div>
              <div className="input-group">
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={localProfile.website || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="website" className="input-label">
                  Website
                </label>
              </div>
            </div>
            <div className="input-group">
              <input
                id="address"
                type="text"
                name="address"
                value={localProfile.address || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="address" className="input-label">
                Alamat
              </label>
            </div>
            <div className="input-group">
              <input
                id="bankAccount"
                type="text"
                name="bankAccount"
                value={localProfile.bankAccount || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="bankAccount" className="input-label">
                Rekening Bank
              </label>
            </div>
            <div className="input-group">
              <input
                id="authorizedSigner"
                type="text"
                name="authorizedSigner"
                value={localProfile.authorizedSigner || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="authorizedSigner" className="input-label">
                Nama Penanggung Jawab Tanda Tangan
              </label>
            </div>
            <div className="input-group">
              <input
                id="idNumber"
                type="text"
                name="idNumber"
                value={localProfile.idNumber || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="idNumber" className="input-label">
                No. KTP Penanggung Jawab
              </label>
            </div>
            <div className="input-group">
              <textarea
                id="bio"
                name="bio"
                value={localProfile.bio || ''}
                onChange={handleInputChange}
                className="input-field"
                placeholder=" "
                rows={3}
              ></textarea>
              <label htmlFor="bio" className="input-label">
                Bio Perusahaan
              </label>
            </div>
            <div>
              <div className="input-group">
                <textarea
                  id="briefingTemplate"
                  name="briefingTemplate"
                  value={localProfile.briefingTemplate || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                  rows={3}
                ></textarea>
                <label htmlFor="briefingTemplate" className="input-label">
                  Template Pesan Briefing Tim
                </label>
              </div>
              <p className="text-xs text-brand-text-secondary mt-1">
                Ditambahkan di akhir pesan saat membagikan briefing Acara Pernikahan ke tim via WhatsApp.
              </p>
              <button
                type="button"
                onClick={() =>
                  setProfile(p => ({ ...p, briefingTemplate: DEFAULT_BRIEFING_TEMPLATE }))
                }
                className="text-xs text-brand-accent hover:underline mt-2"
              >
                + Gunakan contoh
              </button>
            </div>
          </div>
        </section>

        {/* Akun Media Sosial */}
        <section className="rounded-2xl border border-brand-accent/25 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          <h3 className="mb-3 border-b border-brand-accent/25 pb-3 text-sm font-semibold text-brand-text-primary md:text-lg">
            Akun Media Sosial
          </h3>
          <p className="text-xs text-brand-text-secondary max-w-2xl mx-auto mb-4">
            Tautan media sosial ini akan tampil di bagian bawah katalog pricelist &amp; paket publik
            (http://localhost:3000). Anda dapat memasukkan username (misal: <code>@namapengguna</code>)
            atau tautan URL lengkap.
          </p>
          <div className="space-y-3 md:space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="input-group">
                <input
                  id="tiktok"
                  type="text"
                  name="tiktok"
                  value={localProfile.tiktok || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="tiktok" className="input-label">
                  TikTok (@username atau URL)
                </label>
              </div>
              <div className="input-group">
                <input
                  id="instagram"
                  type="text"
                  name="instagram"
                  value={localProfile.instagram || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="instagram" className="input-label">
                  Instagram (@username atau URL)
                </label>
              </div>
              <div className="input-group">
                <input
                  id="facebook"
                  type="text"
                  name="facebook"
                  value={localProfile.facebook || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="facebook" className="input-label">
                  Facebook (Username / Halaman / URL)
                </label>
              </div>
              <div className="input-group">
                <input
                  id="youtube"
                  type="text"
                  name="youtube"
                  value={localProfile.youtube || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder=" "
                />
                <label htmlFor="youtube" className="input-label">
                  YouTube (@channel atau URL)
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Branding & Kustomisasi */}
        <section className="rounded-2xl border border-brand-accent/25 bg-white p-4 shadow-sm sm:p-5 md:p-6">
          <h3 className="mb-4 border-b border-brand-accent/25 pb-3 text-sm font-semibold text-brand-text-primary md:text-lg">
            Branding & Kustomisasi
          </h3>
          <div
            className="space-y-4 md:space-y-5 max-w-2xl mx-auto rounded-xl border border-brand-accent/25 p-3 sm:p-4 md:p-5"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, white)' }}
          >
            <p className="text-[11px] md:text-xs text-brand-text-secondary">
              Unggah atau hapus logo dan tanda tangan, lalu simpan perubahan satu kali untuk menerapkannya.
            </p>
            <div>
              <label htmlFor="logoUpload" className="text-xs md:text-sm font-medium text-brand-text-secondary">
                Logo Perusahaan (u/ Invoice)
              </label>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0">
                  {localProfile.logoBase64 && localProfile.logoBase64 !== '' ? (
                    <img
                      src={localProfile.logoBase64}
                      alt="Pratinjau logo"
                      className="h-12 w-12 md:h-16 md:w-16 object-contain rounded-md bg-brand-bg p-1 border border-brand-border"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-md bg-brand-bg border border-brand-border flex items-center justify-center text-[10px] md:text-xs text-brand-text-secondary">
                      No Logo
                    </div>
                  )}
                  {localProfile.logoBase64 && localProfile.logoBase64 !== '' && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      title="Hapus Logo"
                      aria-label="Hapus Logo"
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  id="logoUpload"
                  type="file"
                  name="logoBase64"
                  onChange={handleLogoChange}
                  className="block w-full text-xs md:text-sm text-brand-text-secondary file:mr-2 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-brand-accent/10 file:text-brand-accent hover:file:bg-brand-accent/20 cursor-pointer"
                  accept="image/png, image/jpeg, image/svg+xml"
                />
              </div>
            </div>
            <div>
              <label htmlFor="signatureUpload" className="text-xs md:text-sm font-medium text-brand-text-secondary">
                Tanda Tangan (TTD) - untuk Invoice, Kontrak, Pembayaran tim
              </label>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0">
                  {localProfile.signatureBase64 && localProfile.signatureBase64 !== '' ? (
                    <img
                      src={localProfile.signatureBase64}
                      alt="Pratinjau tanda tangan"
                      className="h-16 w-24 md:h-20 md:w-32 object-contain rounded-md bg-white p-1 border border-brand-border"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-16 w-24 md:h-20 md:w-32 rounded-md bg-brand-bg border border-brand-border flex items-center justify-center text-[10px] md:text-xs text-brand-text-secondary text-center px-1">
                      Belum Upload TTD
                    </div>
                  )}
                  {localProfile.signatureBase64 && localProfile.signatureBase64 !== '' && (
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      title="Hapus Tanda Tangan"
                      aria-label="Hapus Tanda Tangan"
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    id="signatureUpload"
                    type="file"
                    name="signatureBase64"
                    onChange={handleSignatureChange}
                    className="block w-full text-xs md:text-sm text-brand-text-secondary file:mr-2 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-brand-accent/10 file:text-brand-accent hover:file:bg-brand-accent/20 cursor-pointer"
                    accept="image/png, image/jpeg, image/webp"
                  />
                  <p className="text-[10px] md:text-xs text-brand-text-secondary">
                    Upload gambar TTD Anda. TTD ini akan otomatis digunakan saat menandatangani invoice, kontrak, dan pembayaran tim.
                  </p>
                </div>
              </div>
            </div>

            {/* Background Detail */}
            <div className="border-t border-brand-border/50 pt-4 md:pt-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <label className="text-xs md:text-sm font-medium text-brand-text-secondary">
                    Background Detail
                  </label>
                  <p className="text-[10px] md:text-xs text-brand-text-secondary mt-1">
                    Gambar ini digunakan pada detail pengantin dan detail acara.
                  </p>
                </div>
                <span className="text-[10px] text-brand-accent font-semibold">Supabase Storage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {BACKGROUND_IMAGE_CONFIG.map(({ key, label }) => {
                  const imageUrl = profile.publicPageConfig?.backgroundImages?.[key];
                  const isUploading = uploadingBackground === key;
                  return (
                    <div key={key} className="rounded-xl border border-brand-border bg-brand-bg/40 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-brand-text-primary">{label}</span>
                        {imageUrl && (
                          <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan</span>
                        )}
                      </div>
                      {imageUrl && failedBackgroundPreviews[key] !== imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${label} background`}
                          className="w-full h-24 object-cover rounded-lg border border-brand-border mb-2"
                          loading="lazy"
                          decoding="async"
                          onError={() =>
                            setFailedBackgroundPreviews(prev => ({ ...prev, [key]: imageUrl }))
                          }
                        />
                      ) : imageUrl ? (
                        <div className="mb-2 flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 text-center text-[10px] text-amber-700">
                          File tersimpan tetapi gambar tidak dapat dimuat. Hapus lalu unggah ulang.
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-lg border border-dashed border-brand-border flex items-center justify-center text-[10px] text-brand-text-secondary mb-2">
                          Default digunakan
                        </div>
                      )}
                      <label className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-brand-accent/10 text-brand-accent text-xs font-semibold cursor-pointer hover:bg-brand-accent/20 transition-colors">
                        {isUploading ? (
                          <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        {isUploading ? 'Mengunggah...' : imageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={e => handleBackgroundUpload(e, key)}
                          disabled={isUploading}
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => void handleRemoveBackground(key, imageUrl)}
                          disabled={isUploading}
                          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUploading ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2Icon className="h-3.5 w-3.5" />
                          )}
                          Hapus Gambar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warna Aksen Merek */}
            <div>
              <label htmlFor="brandColor" className="text-xs md:text-sm font-medium text-brand-text-secondary">
                Warna Aksen Merek
              </label>
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                <div className="relative flex-shrink-0">
                  <input
                    id="brandColor"
                    type="color"
                    name="brandColor"
                    value={localProfile.brandColor || '#3b82f6'}
                    onChange={handleInputChange}
                    className="w-12 h-8 md:w-16 md:h-10 p-1 bg-brand-bg border border-brand-border rounded-md cursor-pointer"
                  />
                </div>
                <p className="text-xs md:text-sm text-brand-text-secondary">
                  Pilih warna yang mewakili merek Anda. Warna ini akan diterapkan di seluruh aplikasi, portal pengantin, dan dokumen.
                </p>
              </div>
            </div>

            {/* Syarat & Ketentuan Invoice */}
            <div className="p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/20">
              <div className="mb-2.5 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">Khusus Dokumen Invoice:</span> Syarat & ketentuan di bawah ini dicetak khusus pada lembar dokumen Invoice klien. Untuk syarat & ketentuan katalog pemesanan paket, dikelola di halaman <strong>Input Package → Syarat</strong>.
              </div>
              <TemplateEditor
                id="termsAndConditions"
                label="Syarat & Ketentuan (u/ Invoice)"
                value={profile.termsAndConditions || ''}
                rows={15}
                defaultValue={DEFAULT_TERMS_AND_CONDITIONS}
                onSave={value => onSaveTemplate('termsAndConditions', value)}
                isSaving={isSaving}
              />
            </div>
          </div>
        </section>

        {/* Notifikasi */}
        <h3 className="text-sm md:text-lg font-semibold text-brand-text-light border-b border-gray-700/50 pb-2 md:pb-3 mt-6 md:mt-8">
          Notifikasi
        </h3>
        <div className="space-y-3 md:space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center gap-3">
            <label htmlFor="notif-newProject" className="text-xs md:text-sm">
              Acara Pernikahan Baru Dibuat
            </label>
            <ToggleSwitch
              id="notif-newProject"
              enabled={!!profile.notificationSettings?.newProject}
              onChange={() => handleNotificationChange('newProject')}
              disabled={settingsSaving !== null}
            />
          </div>
          <div className="flex justify-between items-center gap-3">
            <label htmlFor="notif-paymentConfirmation" className="text-xs md:text-sm">
              Konfirmasi Pembayaran Diterima
            </label>
            <ToggleSwitch
              id="notif-paymentConfirmation"
              enabled={!!profile.notificationSettings?.paymentConfirmation}
              onChange={() => handleNotificationChange('paymentConfirmation')}
              disabled={settingsSaving !== null}
            />
          </div>
          <div className="flex justify-between items-center gap-3">
            <label htmlFor="notif-deadlineReminder" className="text-xs md:text-sm">
              Pengingat Deadline Acara Pernikahan
            </label>
            <ToggleSwitch
              id="notif-deadlineReminder"
              enabled={!!profile.notificationSettings?.deadlineReminder}
              onChange={() => handleNotificationChange('deadlineReminder')}
              disabled={settingsSaving !== null}
            />
          </div>
        </div>

        {/* Keamanan */}
        <h3 className="text-sm md:text-lg font-semibold text-brand-text-light border-b border-gray-700/50 pb-2 md:pb-3 mt-6 md:mt-8">
          Keamanan
        </h3>
        <div className="space-y-3 md:space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center gap-3">
            <label htmlFor="security-2fa" className="text-xs md:text-sm">
              Autentikasi Dua Faktor (2FA)
            </label>
            <ToggleSwitch
              id="security-2fa"
              enabled={!!profile.securitySettings?.twoFactorEnabled}
              onChange={handleTwoFactorChange}
              disabled={settingsSaving !== null}
            />
          </div>
        </div>

        {saveError && (
          <div className="p-4 rounded-lg bg-red-100 border border-red-600/30 text-red-800 text-sm">
            {saveError}
          </div>
        )}

        <div className="text-right mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700/50">
          <button type="submit" className="button-primary relative w-full md:w-auto" disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            {showSuccess && (
              <span className="absolute -right-4 -top-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full animate-fade-in-out">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
