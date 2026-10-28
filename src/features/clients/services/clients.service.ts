import {
  listClients,
  listClientsPaginated,
  getClient,
  getClientByPortalAccessId,
  createClient,
  updateClient,
  deleteClient,
  uploadClientAvatar,
  syncClientStatusFromProjects,
  normalizeClient,
  clientService as baseClientService,
} from '../../../services/clients';
import { deleteProject, updateProject } from '../../../services/projects';
import { updateTransaction } from '../../../services/transactions';
import type { Client } from '../types';

export {
  listClients,
  listClientsPaginated,
  getClient,
  getClientByPortalAccessId,
  createClient,
  updateClient,
  deleteClient,
  uploadClientAvatar,
  syncClientStatusFromProjects,
  normalizeClient,
};

export const clientsService = {
  ...baseClientService,
  deleteProjectRow: deleteProject,
  updateProjectRow: updateProject,
  updateTransactionRow: updateTransaction,
};

export default clientsService;
