import supabase from '../../../lib/supabaseClient';
import { DashboardTotals } from '../types';
import { EMPTY_DASHBOARD_TOTALS } from '../constants';

export const dashboardService = {
  /**
   * Fetch aggregated dashboard statistics from Supabase RPC
   */
  async getDashboardStats(): Promise<DashboardTotals> {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) {
        console.warn('[DashboardService] Failed to fetch dashboard stats RPC:', error.message);
        return EMPTY_DASHBOARD_TOTALS;
      }

      const stats = (data || {}) as Record<string, unknown>;
      return {
        projects: Number(stats.projects || 0),
        activeProjects: Number(stats.activeProjects || 0),
        clients: Number(stats.clients || 0),
        activeClients: Number(stats.activeClients || 0),
        leads: Number(stats.leads || 0),
        discussionLeads: Number(stats.discussionLeads || 0),
        followUpLeads: Number(stats.followUpLeads || 0),
        teamMembers: Number(stats.teamMembers || 0),
        transactions: Number(stats.transactions || 0),
        revenue: Number(stats.revenue || 0),
        expense: Number(stats.expense || 0),
      };
    } catch (err) {
      console.error('[DashboardService] Error in getDashboardStats:', err);
      return EMPTY_DASHBOARD_TOTALS;
    }
  },
};
