import React from 'react';
import { Share2 } from 'lucide-react';
import { MessageSquareIcon, DollarSignIcon } from '../../../../constants';
import { TemplateCrudSection } from '../TemplateCrudSection';
import { ShareTemplateItem } from '../ShareTemplateItem';
import { useChatTemplateSettings } from '../../hooks/useChatTemplateSettings';
import {
  VARIABLE_CHIPS,
  BILLING_VARIABLE_CHIPS,
  SHARE_TEMPLATE_CONFIGS,
} from '../../constants/settings.constants';
import { Profile } from '../../../../types';

export interface ChatTemplatesTabProps {
  chatHook: ReturnType<typeof useChatTemplateSettings>;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  showSuccess: (msg: string) => void;
}

export const ChatTemplatesTab: React.FC<ChatTemplatesTabProps> = ({
  chatHook,
  profile,
  setProfile,
  showSuccess,
}) => {
  const {
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
  } = chatHook;

  const handleInsertChatVar = (varName: string) => {
    const el = document.getElementById('ct-body') as HTMLTextAreaElement | null;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const cur = formData.template;
      setFormData(prev => ({
        ...prev,
        template: cur.substring(0, start) + varName + cur.substring(end),
      }));
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + varName.length, start + varName.length);
      }, 50);
    } else {
      setFormData(prev => ({ ...prev, template: prev.template + varName }));
    }
  };

  const handleInsertBillingVar = (varName: string) => {
    const el = document.getElementById('bt-body') as HTMLTextAreaElement | null;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const cur = billingFormData.template;
      setBillingFormData(prev => ({
        ...prev,
        template: cur.substring(0, start) + varName + cur.substring(end),
      }));
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + varName.length, start + varName.length);
      }, 50);
    } else {
      setBillingFormData(prev => ({ ...prev, template: prev.template + varName }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-brand-border">
        <button
          type="button"
          onClick={() => setInnerTab('chat')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            innerTab === 'chat'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg/50'
          }`}
        >
          <MessageSquareIcon className="w-4 h-4" />
          Template Chat Acara
          <span className="text-xs bg-brand-bg px-2 py-0.5 rounded-full text-brand-text-secondary border border-brand-border">
            {templates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setInnerTab('billing')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            innerTab === 'billing'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg/50'
          }`}
        >
          <DollarSignIcon className="w-4 h-4" />
          Template Tagihan
          <span className="text-xs bg-brand-bg px-2 py-0.5 rounded-full text-brand-text-secondary border border-brand-border">
            {billingTemplates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setInnerTab('share')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
            innerTab === 'share'
              ? 'border-brand-accent text-brand-accent bg-brand-accent/5'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg/50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Template Share
          <span className="text-xs bg-brand-bg px-2 py-0.5 rounded-full text-brand-text-secondary border border-brand-border">
            {SHARE_TEMPLATE_CONFIGS.length}
          </span>
        </button>
      </div>

      {/* Sub-tab 1: Chat Templates */}
      {innerTab === 'chat' && (
        <TemplateCrudSection
          title="Template Chat Acara Pernikahan"
          subtitle="Pesan WhatsApp yang dikirim dari dialog chat per acara di halaman Acara Pernikahan."
          icon={<MessageSquareIcon className="w-6 h-6 text-brand-accent" />}
          accentClass="bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
          chipClass="bg-brand-accent/10 text-brand-accent border-brand-accent/20 hover:bg-brand-accent/20"
          templates={templates}
          variableChips={VARIABLE_CHIPS}
          editingId={editingId}
          isAddingNew={isAddingNew}
          formData={formData}
          formError={formError}
          isSaving={isSaving}
          previewId={previewId}
          onAddNew={handleAddNewChat}
          onEdit={handleEditChat}
          onDelete={handleDeleteChat}
          onSave={handleSaveChatForm}
          onCancel={handleCancelChatForm}
          onReset={handleResetChatToDefault}
          onPreviewToggle={id => setPreviewId(p => (p === id ? null : id))}
          onFormChange={(field, val) => setFormData(p => ({ ...p, [field]: val }))}
          onInsertVar={handleInsertChatVar}
          textareaId="ct-body"
        />
      )}

      {/* Sub-tab 2: Billing Templates */}
      {innerTab === 'billing' && (
        <TemplateCrudSection
          title="Template Tagihan & Sisa Pembayaran"
          subtitle="Template pesan WhatsApp penagihan yang dikirim dari dialog Tagihan di halaman Pengantin."
          icon={<DollarSignIcon className="w-6 h-6 text-brand-accent" />}
          accentClass="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          chipClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
          templates={billingTemplates}
          variableChips={BILLING_VARIABLE_CHIPS}
          editingId={billingEditingId}
          isAddingNew={isBillingAddingNew}
          formData={billingFormData}
          formError={billingFormError}
          isSaving={isBillingSaving}
          previewId={billingPreviewId}
          onAddNew={handleAddNewBilling}
          onEdit={handleEditBilling}
          onDelete={handleDeleteBilling}
          onSave={handleSaveBillingForm}
          onCancel={handleCancelBillingForm}
          onReset={handleResetBillingToDefault}
          onPreviewToggle={id => setBillingPreviewId(p => (p === id ? null : id))}
          onFormChange={(field, val) => setBillingFormData(p => ({ ...p, [field]: val }))}
          onInsertVar={handleInsertBillingVar}
          textareaId="bt-body"
        />
      )}

      {/* Sub-tab 3: Share Templates */}
      {innerTab === 'share' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-bg/50 p-4 rounded-2xl border border-brand-border">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/10">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-text-light">
                  Template Share WhatsApp Terpadu
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1 max-w-md">
                  Kelola template pesan saat membagikan invoice, tanda terima, katalog, form booking, dan link portal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveAllShareTemplates}
              disabled={isSaving}
              className="button-primary py-3 px-6 rounded-xl font-bold shadow-lg shadow-brand-accent/20 w-full sm:w-auto"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {SHARE_TEMPLATE_CONFIGS.map(config => (
              <ShareTemplateItem
                key={config.key}
                config={config}
                stringValue={
                  typeof profile[config.key] === 'string'
                    ? (profile[config.key] as string)
                    : ''
                }
                onProfileUpdate={(key, val) =>
                  setProfile(p => ({ ...p, [key]: val }))
                }
                onReset={() =>
                  setProfile(p => ({ ...p, [config.key]: config.defaultValue }))
                }
                showSuccess={showSuccess}
              />
            ))}
          </div>

          <div className="flex justify-end pt-8 border-t border-brand-border">
            <button
              type="button"
              onClick={handleSaveAllShareTemplates}
              disabled={isSaving}
              className="button-primary py-4 px-10 rounded-2xl font-bold text-lg shadow-xl shadow-brand-accent/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Semua Template Share'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
