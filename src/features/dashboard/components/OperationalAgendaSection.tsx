import React from 'react';
import { ViewType, NavigationAction, ProjectStatusConfig, Project } from '../../../types';
import { CalendarIcon } from '../../../constants';
import { UpcomingEventItem, PendingTaskItem } from '../types';
import { UpcomingEventsWidget } from './UpcomingEventsWidget';
import { ProjectStatusProgressWidget } from './ProjectStatusProgressWidget';
import { PendingTasksWidget } from './PendingTasksWidget';

interface OperationalAgendaSectionProps {
  events: UpcomingEventItem[];
  projects: Project[];
  pendingTasks: PendingTaskItem[];
  projectStatusConfig: ProjectStatusConfig[];
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
  onOpenAllTasksModal: () => void;
}

export const OperationalAgendaSection: React.FC<OperationalAgendaSectionProps> = ({
  events,
  projects,
  pendingTasks,
  projectStatusConfig,
  onNavigate,
  onOpenAllTasksModal,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-brand-accent" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">
          Operasional & Agenda
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="col-span-1 xl:col-span-7">
          <UpcomingEventsWidget
            events={events}
            projectStatusConfig={projectStatusConfig}
            onNavigate={onNavigate}
          />
        </div>
        <div className="col-span-1 xl:col-span-5 flex flex-col gap-5">
          <ProjectStatusProgressWidget
            projects={projects}
            projectStatusConfig={projectStatusConfig}
            onNavigate={onNavigate}
          />
          {pendingTasks.length > 0 && (
            <PendingTasksWidget
              tasks={pendingTasks}
              onNavigate={onNavigate}
              onOpenAllTasksModal={onOpenAllTasksModal}
            />
          )}
        </div>
      </div>
    </div>
  );
};
