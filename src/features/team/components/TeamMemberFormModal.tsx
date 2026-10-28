import React, { useState } from 'react';
import { Upload, Users as UsersIcon, MapPin, Briefcase, Phone, Mail, ShieldCheck } from 'lucide-react';
import Modal from '../../../shared/ui/Modal';
import RupiahInput from '../../../shared/form/RupiahInput';
import { uploadTeamMemberAvatar } from '../../../services/teamMembers';
import { TeamMemberFormData, TeamMemberStatus, TeamMemberCategory } from '../types';
import { TEAM_SPECIALIZATIONS, TEAM_CATEGORIES, TEAM_STATUSES } from '../constants';

export interface TeamMemberFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    formMode: 'add' | 'edit';
    formData: TeamMemberFormData;
    setFormData: React.Dispatch<React.SetStateAction<TeamMemberFormData>>;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({
    isOpen,
    onClose,
    formMode,
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
}) => {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [isCustomSpecialization, setIsCustomSpecialization] = useState(
        Boolean(formData.specialization && !TEAM_SPECIALIZATIONS.includes(formData.specialization as any))
    );

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'standardFee' ? Number(value) : value,
        }));
    };

    const handleSpecializationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Lainnya') {
            setIsCustomSpecialization(true);
            setFormData(prev => ({ ...prev, specialization: '' }));
        } else {
            setIsCustomSpecialization(false);
            setFormData(prev => ({ ...prev, specialization: val }));
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const file = input.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAvatarError('Pilih file gambar yang valid.');
            input.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError('Ukuran foto maksimal 5 MB.');
            input.value = '';
            return;
        }

        setAvatarError('');
        setIsUploadingAvatar(true);
        try {
            const avatarUrl = await uploadTeamMemberAvatar(file);
            setFormData(prev => ({ ...prev, avatarUrl }));
        } catch (error) {
            console.error('[TeamMemberForm] Avatar upload failed:', error);
            setAvatarError('Foto gagal diunggah. Periksa koneksi lalu coba lagi.');
        } finally {
            setIsUploadingAvatar(false);
            input.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (isUploadingAvatar) {
            e.preventDefault();
            setAvatarError('Tunggu sampai foto selesai diunggah.');
            return;
        }
        onSubmit(e);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={formMode === 'add' ? 'Tambah Anggota Tim / Vendor' : 'Edit Anggota Tim / Vendor'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
                <div className="hidden sm:block grad-brand border border-transparent rounded-lg p-3.5 mb-2">
                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        Informasi Anggota & Spesialisasi
                    </h4>
                    <p className="text-xs text-white/90">
                        Kelola data lengkap tim internal, karyawan, atau vendor eksternal termasuk peran, keahlian khusus, kontak, dan nomor rekening pembayaran.
                    </p>
                </div>

                {/* Foto Profil & Data Pokok */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 flex items-center gap-1.5">
                        <UsersIcon className="w-3.5 h-3.5 text-brand-accent" />
                        Data Pribadi
                    </h5>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-brand-border bg-brand-bg flex items-center justify-center text-xl font-bold text-brand-text-secondary">
                            {formData.avatarUrl ? (
                                <img
                                    src={formData.avatarUrl}
                                    alt="Foto profil"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                formData.name?.charAt(0).toUpperCase() || '?'
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="team-member-avatar"
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold ${
                                    isUploadingAvatar ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-brand-input'
                                }`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {isUploadingAvatar
                                    ? 'Mengunggah...'
                                    : formData.avatarUrl
                                    ? 'Ganti Foto'
                                    : 'Unggah Foto'}
                            </label>
                            <input
                                id="team-member-avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={isUploadingAvatar}
                                className="sr-only"
                            />
                            <p className="text-[11px] text-brand-text-secondary mt-1">
                                JPG, PNG, atau WebP. Maksimal 5 MB.
                            </p>
                            {avatarError && <p role="alert" className="text-xs text-red-600 mt-1">{avatarError}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="input-group">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="name" className="input-label">Nama Lengkap</label>
                        </div>

                        <div className="input-group">
                            <input
                                type="text"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="role" className="input-label">Jabatan / Peran</label>
                        </div>
                    </div>
                </div>

                {/* Spesialisasi & Kategori & Status */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-brand-accent" />
                        Keahlian & Status
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Kategori */}
                        <div className="input-group">
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="input-field"
                            >
                                {TEAM_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'Tim' ? 'Tim Internal' : cat === 'Karyawan' ? 'Karyawan' : 'Vendor Eksternal'}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="category" className="input-label">Kategori</label>
                        </div>

                        {/* Status Aktif / Nonaktif */}
                        <div className="input-group">
                            <select
                                id="status"
                                name="status"
                                value={formData.status || 'Aktif'}
                                onChange={handleFormChange}
                                className="input-field"
                            >
                                {TEAM_STATUSES.map(st => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                            <label htmlFor="status" className="input-label">Status Anggota</label>
                        </div>

                        {/* Spesialisasi Dropdown */}
                        <div className="input-group">
                            <select
                                id="specializationSelect"
                                value={isCustomSpecialization ? 'Lainnya' : (formData.specialization || 'Makeup Artist')}
                                onChange={handleSpecializationSelect}
                                className="input-field"
                            >
                                {TEAM_SPECIALIZATIONS.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <label htmlFor="specializationSelect" className="input-label">Spesialisasi</label>
                        </div>
                    </div>

                    {isCustomSpecialization && (
                        <div className="mt-2 input-group">
                            <input
                                type="text"
                                id="specialization"
                                name="specialization"
                                value={formData.specialization || ''}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="specialization" className="input-label">Tulis Spesialisasi Khusus</label>
                        </div>
                    )}
                </div>

                {/* Kontak & Alamat */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-accent" />
                        Kontak & Alamat
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="input-group">
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                                required
                            />
                            <label htmlFor="phone" className="input-label">Nomor Telepon / WhatsApp</label>
                        </div>

                        <div className="input-group">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="email" className="input-label">Email (Opsional)</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="input-group">
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="location" className="input-label">Alamat / Domisili</label>
                        </div>

                        <div className="input-group">
                            <input
                                type="text"
                                id="emergencyContact"
                                name="emergencyContact"
                                value={formData.emergencyContact || ''}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="emergencyContact" className="input-label">Kontak Darurat (Opsional)</label>
                        </div>
                    </div>
                </div>

                {/* Informasi Pembayaran */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                        Informasi Honor & Rekening
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="input-group sm:col-span-1">
                            <RupiahInput
                                id="standardFee"
                                value={formData.standardFee.toString()}
                                onChange={(raw) => setFormData(prev => ({ ...prev, standardFee: Number(raw) }))}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="standardFee" className="input-label">
                                {formData.category === 'Karyawan' ? 'Gaji Bulanan' : 'Honor Standar'}
                            </label>
                        </div>

                        <div className="input-group sm:col-span-1">
                            <input
                                type="text"
                                id="bankName"
                                name="bankName"
                                value={formData.bankName || ''}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="bankName" className="input-label">Nama Bank</label>
                        </div>

                        <div className="input-group sm:col-span-1">
                            <input
                                type="text"
                                id="noRek"
                                name="noRek"
                                value={formData.noRek || ''}
                                onChange={handleFormChange}
                                className="input-field"
                                placeholder=" "
                            />
                            <label htmlFor="noRek" className="input-label">Nomor Rekening</label>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-brand-border sticky bottom-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="button-secondary w-full sm:w-auto px-4 py-2 text-xs"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="button-primary w-full sm:w-auto px-5 py-2 text-xs"
                    >
                        {isSubmitting ? 'Menyimpan...' : formMode === 'add' ? 'Simpan Anggota' : 'Perbarui Anggota'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TeamMemberFormModal;
