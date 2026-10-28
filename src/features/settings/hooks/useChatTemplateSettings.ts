import React, { useState, useEffect, useCallback } from 'react';
import { Profile, ChatTemplate } from '../../../types';
import { generateUUID } from '../../../utils/uuid';
import { CHAT_TEMPLATES, DEFAULT_BILLING_TEMPLATES } from '../../../constants';
import { settingsService } from '../services/settings.service';
import { validateTemplate } from '../../../services/chatTemplatesOffline';

export function useChatTemplateSettings(
  profile: Profile,
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  showSuccess: (msg: string) => void,
) {
  const [innerTab, setInnerTab] = useState<'chat' | 'billing' | 'share'>('chat');

  // Chat templates
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({ title: '', template: '' });
  const [formError, setFormError] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Billing templates
  const [billingTemplates, setBillingTemplates] = useState<ChatTemplate[]>([]);
  const [billingEditingId, setBillingEditingId] = useState<string | null>(null);
  const [isBillingAddingNew, setIsBillingAddingNew] = useState(false);
  const [billingFormData, setBillingFormData] = useState({ title: '', template: '' });
  const [billingFormError, setBillingFormError] = useState('');
  const [billingPreviewId, setBillingPreviewId] = useState<string | null>(null);
  const [isBillingSaving, setIsBillingSaving] = useState(false);

  useEffect(() => {
    if (profile.chatTemplates && profile.chatTemplates.length > 0) {
      setTemplates(profile.chatTemplates);
    } else {
      setTemplates(CHAT_TEMPLATES);
    }
  }, [profile.chatTemplates]);

  useEffect(() => {
    if (profile.billingTemplates && profile.billingTemplates.length > 0) {
      setBillingTemplates(profile.billingTemplates);
    } else {
      setBillingTemplates(DEFAULT_BILLING_TEMPLATES);
    }
  }, [profile.billingTemplates]);

  // Chat actions
  const persistChatTemplates = useCallback(
    async (updated: ChatTemplate[]) => {
      setIsSaving(true);
      try {
        const updatedProfile = await settingsService.saveChatTemplates(profile.id, updated);
        setProfile(updatedProfile);
        setTemplates(updated);
        showSuccess('Template chat berhasil disimpan!');
      } catch (err: unknown) {
        alert('Gagal menyimpan template: ' + ((err as Error)?.message || 'Coba lagi.'));
      } finally {
        setIsSaving(false);
      }
    },
    [profile.id, setProfile, showSuccess],
  );

  const handleAddNewChat = () => {
    setEditingId(null);
    setFormData({ title: '', template: '' });
    setFormError('');
    setIsAddingNew(true);
  };

  const handleEditChat = (item: ChatTemplate) => {
    setIsAddingNew(false);
    setEditingId(item.id);
    setFormData({ title: item.title, template: item.template });
    setFormError('');
  };

  const handleCancelChatForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ title: '', template: '' });
    setFormError('');
  };

  const handleSaveChatForm = async () => {
    if (!formData.title.trim()) {
      setFormError('Judul template tidak boleh kosong.');
      return;
    }
    const val = validateTemplate({
      id: isAddingNew ? generateUUID() : editingId || '',
      title: formData.title.trim(),
      template: formData.template.trim(),
    });
    if (!val.valid) {
      setFormError(val.errors.join(', '));
      return;
    }
    setFormError('');

    let updated: ChatTemplate[];
    if (isAddingNew) {
      const newItem: ChatTemplate = {
        id: generateUUID(),
        title: formData.title.trim(),
        template: formData.template.trim(),
      };
      updated = [...templates, newItem];
    } else if (editingId) {
      updated = templates.map(t =>
        t.id === editingId
          ? { ...t, title: formData.title.trim(), template: formData.template.trim() }
          : t,
      );
    } else {
      return;
    }

    await persistChatTemplates(updated);
    handleCancelChatForm();
  };

  const handleDeleteChat = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus template ini?')) return;
    const updated = templates.filter(t => t.id !== id);
    await persistChatTemplates(updated);
  };

  const handleResetChatToDefault = async () => {
    if (!window.confirm('Reset semua template chat ke template bawaan sistem?')) return;
    await persistChatTemplates(CHAT_TEMPLATES);
  };

  // Billing actions
  const persistBillingTemplates = useCallback(
    async (updated: ChatTemplate[]) => {
      setIsBillingSaving(true);
      try {
        const updatedProfile = await settingsService.saveBillingTemplates(profile.id, updated);
        setProfile(updatedProfile);
        setBillingTemplates(updated);
        showSuccess('Template tagihan berhasil disimpan!');
      } catch (err: unknown) {
        alert('Gagal menyimpan template: ' + ((err as Error)?.message || 'Coba lagi.'));
      } finally {
        setIsBillingSaving(false);
      }
    },
    [profile.id, setProfile, showSuccess],
  );

  const handleAddNewBilling = () => {
    setBillingEditingId(null);
    setBillingFormData({ title: '', template: '' });
    setBillingFormError('');
    setIsBillingAddingNew(true);
  };

  const handleEditBilling = (item: ChatTemplate) => {
    setIsBillingAddingNew(false);
    setBillingEditingId(item.id);
    setBillingFormData({ title: item.title, template: item.template });
    setBillingFormError('');
  };

  const handleCancelBillingForm = () => {
    setIsBillingAddingNew(false);
    setBillingEditingId(null);
    setBillingFormData({ title: '', template: '' });
    setBillingFormError('');
  };

  const handleSaveBillingForm = async () => {
    if (!billingFormData.title.trim()) {
      setBillingFormError('Judul template tidak boleh kosong.');
      return;
    }
    const val = validateTemplate({
      id: isBillingAddingNew ? generateUUID() : billingEditingId || '',
      title: billingFormData.title.trim(),
      template: billingFormData.template.trim(),
    });
    if (!val.valid) {
      setBillingFormError(val.errors.join(', '));
      return;
    }
    setBillingFormError('');

    let updated: ChatTemplate[];
    if (isBillingAddingNew) {
      const newItem: ChatTemplate = {
        id: generateUUID(),
        title: billingFormData.title.trim(),
        template: billingFormData.template.trim(),
      };
      updated = [...billingTemplates, newItem];
    } else if (billingEditingId) {
      updated = billingTemplates.map(t =>
        t.id === billingEditingId
          ? { ...t, title: billingFormData.title.trim(), template: billingFormData.template.trim() }
          : t,
      );
    } else {
      return;
    }

    await persistBillingTemplates(updated);
    handleCancelBillingForm();
  };

  const handleDeleteBilling = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus template tagihan ini?')) return;
    const updated = billingTemplates.filter(t => t.id !== id);
    await persistBillingTemplates(updated);
  };

  const handleResetBillingToDefault = async () => {
    if (!window.confirm('Reset semua template tagihan ke template bawaan sistem?')) return;
    await persistBillingTemplates(DEFAULT_BILLING_TEMPLATES);
  };

  // Share templates actions
  const handleSaveAllShareTemplates = async () => {
    setIsSaving(true);
    try {
      const updated = await settingsService.saveAllShareTemplates(profile);
      setProfile(updated);
      showSuccess('Semua template share berhasil disimpan!');
    } catch (err: unknown) {
      alert('Gagal menyimpan: ' + ((err as Error)?.message || 'Coba lagi.'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    innerTab,
    setInnerTab,
    templates,
    editingId,
    isAddingNew,
    formData,
    setFormData,
    formError,
    previewId,
    setPreviewId,
    isSaving,
    handleAddNewChat,
    handleEditChat,
    handleCancelChatForm,
    handleSaveChatForm,
    handleDeleteChat,
    handleResetChatToDefault,
    billingTemplates,
    billingEditingId,
    isBillingAddingNew,
    billingFormData,
    setBillingFormData,
    billingFormError,
    billingPreviewId,
    setBillingPreviewId,
    isBillingSaving,
    handleAddNewBilling,
    handleEditBilling,
    handleCancelBillingForm,
    handleSaveBillingForm,
    handleDeleteBilling,
    handleResetBillingToDefault,
    handleSaveAllShareTemplates,
  };
}
