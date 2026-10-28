import React, { useState } from 'react';
import { Profile, Project, ProjectStatusConfig, SubStatusConfig } from '../../../types';
import { generateUUID } from '../../../utils/uuid';
import { settingsService } from '../services/settings.service';
import { DEFAULT_PROJECT_STATUS_SUGGESTIONS } from '../../../constants';
import { ProjectStatusFormData } from '../types/settings.types';

const initialStatusFormState: ProjectStatusFormData = {
  name: '',
  color: '#64748b',
  note: '',
  defaultProgress: undefined,
  subStatuses: [],
};

export function useProjectStatusSettings(
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  projects: Project[],
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatusConfig | null>(null);
  const [form, setForm] = useState<ProjectStatusFormData>(initialStatusFormState);

  const handleOpenModal = (mode: 'add' | 'edit', status?: ProjectStatusConfig) => {
    setModalMode(mode);
    if (mode === 'edit' && status) {
      setSelectedStatus(status);
      setForm({
        name: status.name,
        color: status.color,
        note: status.note,
        defaultProgress: status.defaultProgress,
        subStatuses: [...status.subStatuses],
      });
    } else {
      setSelectedStatus(null);
      setForm(initialStatusFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'defaultProgress') {
      const num = value === '' ? undefined : Math.max(0, Math.min(100, Math.round(Number(value))));
      setForm(prev => ({ ...prev, [name]: num }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubStatusChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSubStatuses = [...form.subStatuses];
    newSubStatuses[index] = { ...newSubStatuses[index], [name]: value };
    setForm(prev => ({ ...prev, subStatuses: newSubStatuses }));
  };

  const addSubStatus = () => {
    setForm(prev => ({
      ...prev,
      subStatuses: [...prev.subStatuses, { name: '', note: '' }],
    }));
  };

  const removeSubStatus = (index: number) => {
    const newSubStatuses = [...form.subStatuses];
    newSubStatuses.splice(index, 1);
    setForm(prev => ({ ...prev, subStatuses: newSubStatuses }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const config = profile.projectStatusConfig || [];

    try {
      if (modalMode === 'add') {
        const newStatus: ProjectStatusConfig = {
          id: generateUUID(),
          ...form,
          subStatuses: form.subStatuses.filter(s => s.name.trim() !== ''),
        };
        const newConfig = [...config, newStatus];
        setProfile(prev => ({ ...prev, projectStatusConfig: newConfig }));
        try {
          await settingsService.saveProjectStatusConfig(profile.id, newConfig);
        } catch (err: unknown) {
          console.error('[useProjectStatusSettings] Save status failed:', err);
          setProfile(prev => ({ ...prev, projectStatusConfig: config }));
          alert('Gagal menyimpan Progres Acara Pernikahan: ' + ((err as Error)?.message || 'Coba lagi.'));
        }
      } else if (selectedStatus) {
        const updatedConfig = config.map(s =>
          s.id === selectedStatus.id
            ? {
                ...s,
                ...form,
                subStatuses: form.subStatuses.filter(sub => sub.name.trim() !== ''),
              }
            : s,
        );
        setProfile(prev => ({ ...prev, projectStatusConfig: updatedConfig }));
        try {
          await settingsService.saveProjectStatusConfig(profile.id, updatedConfig);
        } catch (err: unknown) {
          console.error('[useProjectStatusSettings] Update status failed:', err);
          setProfile(prev => ({ ...prev, projectStatusConfig: config }));
          alert('Gagal mengupdate Progres Acara Pernikahan: ' + ((err as Error)?.message || 'Coba lagi.'));
        }
      }
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (statusId: string) => {
    if (isDeleting) return;
    const config = profile.projectStatusConfig || [];
    const status = config.find(s => s.id === statusId);
    if (!status) return;

    const isUsed = projects.some(p => p.status === status.name);
    if (isUsed) {
      alert(`Status "${status.name}" tidak dapat dihapus karena sedang digunakan oleh Acara Pernikahan.`);
      return;
    }

    if (window.confirm(`Yakin ingin menghapus status "${status.name}"?`)) {
      const newConfig = config.filter(s => s.id !== statusId);
      setProfile(prev => ({ ...prev, projectStatusConfig: newConfig }));
      setIsDeleting(true);
      try {
        await settingsService.saveProjectStatusConfig(profile.id, newConfig);
      } catch (err: unknown) {
        console.error('[useProjectStatusSettings] Delete status failed:', err);
        setProfile(prev => ({ ...prev, projectStatusConfig: config }));
        alert('Gagal menghapus Progres Acara Pernikahan: ' + ((err as Error)?.message || 'Coba lagi.'));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAddDefaultStatuses = async () => {
    const current = profile.projectStatusConfig || [];
    const existingNames = new Set(current.map(s => s.name));
    const toAdd = DEFAULT_PROJECT_STATUS_SUGGESTIONS.filter(s => !existingNames.has(s.name)).map(s => ({
      id: generateUUID(),
      name: s.name,
      color: s.color,
      defaultProgress: s.defaultProgress,
      note: s.description,
      subStatuses: (s.subStatuses || []).map(sub => ({ name: sub.name, note: sub.note })),
    }));

    if (toAdd.length === 0) return;
    const newConfig = [...current, ...toAdd];
    setProfile(prev => ({ ...prev, projectStatusConfig: newConfig }));
    try {
      await settingsService.saveProjectStatusConfig(profile.id, newConfig);
    } catch (err: unknown) {
      console.error('[useProjectStatusSettings] Add default statuses failed:', err);
      alert('Gagal menambah status default: ' + ((err as Error)?.message || 'Coba lagi.'));
    }
  };

  return {
    isModalOpen,
    modalMode,
    selectedStatus,
    form,
    isSubmitting,
    isDeleting,
    handleOpenModal,
    handleCloseModal,
    handleFormChange,
    handleSubStatusChange,
    addSubStatus,
    removeSubStatus,
    handleSubmit,
    handleDelete,
    handleAddDefaultStatuses,
  };
}
