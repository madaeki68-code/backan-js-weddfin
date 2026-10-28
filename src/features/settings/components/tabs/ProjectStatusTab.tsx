import React from 'react';
import { PencilIcon, PlusIcon, Trash2Icon } from '../../../../constants';
import { ProjectStatusModal } from '../ProjectStatusModal';
import { useProjectStatusSettings } from '../../hooks/useProjectStatusSettings';
import { Profile } from '../../../../types';

export interface ProjectStatusTabProps {
  statusHook: ReturnType<typeof useProjectStatusSettings>;
  profile: Profile;
}

export const ProjectStatusTab: React.FC<ProjectStatusTabProps> = ({ statusHook, profile }) => {
  const {
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
  } = statusHook;

  const config = profile.projectStatusConfig || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h3 className="text-sm md:text-lg font-semibold text-brand-text-light">
          Manajemen Progres Acara Pernikahan Pengantin
        </h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAddDefaultStatuses}
            className="button-secondary inline-flex items-center gap-1.5 text-xs px-3 py-2 md:text-sm md:px-4 md:py-2.5"
          >
            + Tambah dari saran default
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal('add')}
            className="button-primary inline-flex items-center gap-1.5 w-full sm:w-auto text-xs px-3 py-2 md:text-sm md:px-4 md:py-2.5"
          >
            <PlusIcon className="w-4 h-4 md:w-5 md:h-5" /> Tambah Status
          </button>
        </div>
      </div>

      <div className="space-y-2 md:space-y-4">
        {config.map(status => (
          <div key={status.id} className="px-2.5 py-2 sm:p-3 md:p-4 bg-brand-bg rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 md:gap-3">
                <span
                  className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: status.color }}
                ></span>
                <span className="font-semibold text-sm md:text-base text-brand-text-light leading-tight">
                  {status.name}
                </span>
                {status.defaultProgress !== undefined && (
                  <span className="text-[10px] md:text-xs text-brand-text-secondary bg-white/70 px-1.5 py-0.5 rounded border border-brand-border">
                    {status.defaultProgress}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal('edit', status)}
                  disabled={isSubmitting || isDeleting}
                  title="Edit Status"
                  aria-label="Edit Status"
                  className="p-1 md:p-2 !min-h-0 !h-auto text-brand-text-secondary hover:bg-brand-input rounded-full disabled:opacity-50"
                >
                  <PencilIcon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(status.id)}
                  disabled={isSubmitting || isDeleting}
                  title="Hapus Status"
                  aria-label="Hapus Status"
                  className="p-1 md:p-2 !min-h-0 !h-auto text-brand-text-secondary hover:bg-brand-input rounded-full disabled:opacity-50"
                >
                  <Trash2Icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
            {status.subStatuses && status.subStatuses.length > 0 && (
              <div className="mt-1.5 md:mt-3 pt-1.5 md:pt-3 border-t border-brand-border/50 pl-4 md:pl-7 space-y-1 md:space-y-2">
                {status.subStatuses.map((sub, index) => (
                  <div key={index}>
                    <p className="text-xs md:text-sm font-medium text-brand-text-primary leading-tight">
                      {sub.name}
                    </p>
                    {sub.note && (
                      <p className="text-[10px] md:text-xs text-brand-text-secondary leading-tight">
                        {sub.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <ProjectStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modalMode={modalMode}
        selectedStatus={selectedStatus}
        form={form}
        isSubmitting={isSubmitting}
        onFormChange={handleFormChange}
        onSubStatusChange={handleSubStatusChange}
        onAddSubStatus={addSubStatus}
        onRemoveSubStatus={removeSubStatus}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
