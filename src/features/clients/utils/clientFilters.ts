import { Client, Project, ClientStatus, PaymentStatus } from '../types';
import { ClientWithSummary } from '../types/clients.types';

export function buildAllClientData(clients: Client[], projects: Project[]): ClientWithSummary[] {
  const projectsByClient = new Map<string, {
    projects: Project[];
    totalValue: number;
    totalPaid: number;
    mostRecentProject: Project | null;
    mostRecentProjectTime: number;
  }>();

  projects.forEach(project => {
    let summary = projectsByClient.get(project.clientId);
    if (!summary) {
      summary = {
        projects: [],
        totalValue: 0,
        totalPaid: 0,
        mostRecentProject: null,
        mostRecentProjectTime: Number.NEGATIVE_INFINITY,
      };
      projectsByClient.set(project.clientId, summary);
    }

    summary.projects.push(project);
    summary.totalValue += project.totalCost;
    summary.totalPaid += project.amountPaid;
    const projectTime = new Date(project.date).getTime();
    if (!summary.mostRecentProject || projectTime > summary.mostRecentProjectTime) {
      summary.mostRecentProject = project;
      summary.mostRecentProjectTime = projectTime;
    }
  });

  return clients.map(client => {
    const summary = projectsByClient.get(client.id);
    const clientProjects = summary?.projects ?? [];
    const mostRecentProject = summary?.mostRecentProject ?? null;
    const totalValue = summary?.totalValue ?? 0;
    const totalPaid = summary?.totalPaid ?? 0;

    return {
      ...client,
      projects: clientProjects,
      totalProjectValue: totalValue,
      balanceDue: totalValue - totalPaid,
      PackageTerbaru: mostRecentProject
        ? `${mostRecentProject.packageName}${mostRecentProject.addOns.length > 0 ? ` + ${mostRecentProject.addOns.length} Add-on` : ''}`
        : 'Belum ada Acara Pernikahan',
      overallPaymentStatus: mostRecentProject ? mostRecentProject.paymentStatus : null,
      mostRecentProject: mostRecentProject,
    };
  });
}

export function filterClientData(
  allClientData: ClientWithSummary[],
  params: {
    searchTerm: string;
    statusFilter: string;
    dateFrom: string;
    dateTo: string;
    monthFilter: string;
  }
): ClientWithSummary[] {
  const { searchTerm, statusFilter, dateFrom, dateTo, monthFilter } = params;

  return allClientData.filter(client => {
    // Search filter
    const searchMatch =
      searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Boolean(client.whatsapp && client.whatsapp.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const statusMatch =
      statusFilter === 'Semua Status' ||
      client.overallPaymentStatus === statusFilter ||
      client.status === statusFilter;

    // Date range filter
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    const dateMatchRange =
      (!from && !to) ||
      client.projects.some(project => {
        const projectDate = project.date ? new Date(project.date) : null;
        const hasValidDate = projectDate && !Number.isNaN(projectDate.getTime());
        if (project.bookingStatus && !hasValidDate) return true;
        return Boolean(hasValidDate && (!from || projectDate >= from) && (!to || projectDate <= to));
      }) ||
      (() => {
        const clientJoinDate = new Date(client.since);
        return (!from || clientJoinDate >= from) && (!to || clientJoinDate <= to);
      })();

    const monthMatch =
      !monthFilter ||
      client.projects.some(project => typeof project.date === 'string' && project.date.startsWith(monthFilter));

    return searchMatch && statusMatch && dateMatchRange && monthMatch;
  });
}

export function computeClientsWithDues(
  allClientData: ClientWithSummary[],
  monthFilter: string
): ClientWithSummary[] {
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  return allClientData
    .flatMap(client => {
      const matchingProjects = monthFilter
        ? client.projects.filter(project => project.date?.slice(0, 7) === monthFilter)
        : client.projects.filter(project => project.date?.slice(0, 7) === currentMonthKey);

      const totalProjectValue = matchingProjects.reduce(
        (sum, project) => sum + (Number(project.totalCost) || 0),
        0
      );
      const balanceDue = matchingProjects.reduce(
        (sum, project) => sum + (Number(project.totalCost) || 0) - (Number(project.amountPaid) || 0),
        0
      );

      if (balanceDue <= 0) return [];

      const mostRecentProject =
        [...matchingProjects].sort((left, right) =>
          (right.date || '').localeCompare(left.date || '')
        )[0] || null;

      return [
        {
          ...client,
          projects: matchingProjects,
          totalProjectValue,
          balanceDue,
          mostRecentProject,
          PackageTerbaru: mostRecentProject?.packageName || 'Belum ada Acara Pernikahan',
          overallPaymentStatus: mostRecentProject?.paymentStatus || null,
        },
      ];
    })
    .sort((a, b) => b.balanceDue - a.balanceDue);
}

export function computeCurrentMonthEvents(allClientData: ClientWithSummary[]): ClientWithSummary[] {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return allClientData
    .flatMap(client =>
      client.projects
        .filter(project => project.date?.slice(0, 7) === currentMonthKey)
        .map(project => ({
          ...client,
          projects: [project],
          totalProjectValue: Number(project.totalCost) || 0,
          balanceDue: Math.max(0, (Number(project.totalCost) || 0) - (Number(project.amountPaid) || 0)),
          PackageTerbaru: project.packageName || 'Belum memilih package',
          overallPaymentStatus: project.paymentStatus || null,
          mostRecentProject: project,
        }))
    )
    .sort((left, right) =>
      (right.mostRecentProject?.date || '').localeCompare(left.mostRecentProject?.date || '')
    );
}

export function computeClientStatusDonutData(clients: Client[]) {
  const statusCounts = clients.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    [ClientStatus.ACTIVE]: '#10b981',
    [ClientStatus.INACTIVE]: '#64748b',
    [ClientStatus.LEAD]: '#3b82f6',
    [ClientStatus.LOST]: '#ef4444',
  };

  return Object.entries(statusCounts).map(([label, value]) => ({
    label,
    value,
    color: statusColors[label] || '#9ca3af',
  }));
}

export function computeNewClientsChartData(clients: Client[]) {
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const data = months.map(month => ({ name: month, count: 0 }));

  clients.forEach(c => {
    const joinDate = new Date(c.since);
    if (joinDate.getFullYear() === currentYear) {
      const monthIndex = joinDate.getMonth();
      data[monthIndex].count += 1;
    }
  });

  return data;
}
