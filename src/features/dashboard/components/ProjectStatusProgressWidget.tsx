import React, { useMemo } from 'react';
import { Project, ProjectStatusConfig, ViewType } from '../../../types';

interface ProjectStatusProgressWidgetProps {
  projects: Project[];
  projectStatusConfig: ProjectStatusConfig[];
  onNavigate: (view: ViewType) => void;
}

export const ProjectStatusProgressWidget: React.FC<ProjectStatusProgressWidgetProps> = ({
  projects,
  projectStatusConfig,
  onNavigate,
}) => {
  const statusOrder = useMemo(
    () =>
      projectStatusConfig
        .map((s) => s.name)
        .filter((name) => name !== 'Selesai' && name !== 'Dibatalkan'),
    [projectStatusConfig]
  );

  const statusCounts = useMemo(() => {
    return statusOrder
      .map((statusName) => {
        const count = projects.filter((p) => p.status === statusName).length;
        const config = projectStatusConfig.find((s) => s.name === statusName);
        return {
          name: statusName,
          count,
          color: config ? config.color : '#64748b',
        };
      })
      .filter((s) => s.count > 0);
  }, [projects, statusOrder, projectStatusConfig]);

  const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg text-[#2A3547] mb-4">
          Progres Acara Pernikahan Pengantin Aktif
        </h3>
        <div className="space-y-3">
          {statusCounts.map((status) => (
            <div key={status.name} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-[#2A3547] font-semibold">{status.name}</span>
                <span className="text-[#5A6A85] font-bold">{status.count}</span>
              </div>
              <div className="w-full bg-[#F4F6F9] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${total > 0 ? (status.count / total) * 100 : 0}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>
            </div>
          ))}

          {statusCounts.length === 0 && (
            <p className="text-center text-sm text-[#5A6A85] py-6">
              Tidak ada acara aktif yang sedang berlangsung.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNavigate(ViewType.CLIENTS)}
        className="p-2 mt-4 text-sm font-semibold text-brand-accent hover:underline self-start rounded-lg hover:bg-brand-accent/10 cursor-pointer"
      >
        Kelola di Manajemen Pengantin &rarr;
      </button>
    </div>
  );
};
