import {
  listTeamMembers,
  listTeamMembersPaginated,
  getTeamMember,
  getTeamMemberByPortalAccessId,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamMemberAvatar,
  normalizeTeamMember,
} from '../../../services/teamMembers';

import {
  listAllTeamPayments,
  listTeamPaymentsByProject,
  upsertTeamPaymentsForProject,
  markTeamPaymentStatus,
  updateTeamPaymentFee,
  updateTeamProjectPayments,
  deleteTeamPaymentsByProject,
  teamProjectPaymentService,
} from '../../../services/teamProjectPayments';

import {
  listTeamPaymentRecords,
  createTeamPaymentRecord,
  updateTeamPaymentRecord,
  deleteTeamPaymentRecord,
} from '../../../services/teamPaymentRecords';

import {
  listAssignmentsByProject,
  upsertAssignmentsForProject,
  deleteAssignmentsByProject,
} from '../../../services/projectTeamAssignments';

export {
  // Members
  listTeamMembers,
  listTeamMembersPaginated,
  getTeamMember,
  getTeamMemberByPortalAccessId,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamMemberAvatar,
  normalizeTeamMember,
  // Project Payments
  listAllTeamPayments,
  listTeamPaymentsByProject,
  upsertTeamPaymentsForProject,
  markTeamPaymentStatus,
  updateTeamPaymentFee,
  updateTeamProjectPayments,
  deleteTeamPaymentsByProject,
  teamProjectPaymentService,
  // Payment Records
  listTeamPaymentRecords,
  createTeamPaymentRecord,
  updateTeamPaymentRecord,
  deleteTeamPaymentRecord,
  // Assignments
  listAssignmentsByProject,
  upsertAssignmentsForProject,
  deleteAssignmentsByProject,
};

export const teamService = {
  // Member CRUD
  listMembers: listTeamMembers,
  listMembersPaginated: listTeamMembersPaginated,
  getMember: getTeamMember,
  getMemberByPortalAccessId: getTeamMemberByPortalAccessId,
  createMember: createTeamMember,
  updateMember: updateTeamMember,
  deleteMember: deleteTeamMember,
  uploadAvatar: uploadTeamMemberAvatar,
  normalizeMember: normalizeTeamMember,

  // Payment operations
  listAllPayments: listAllTeamPayments,
  listPaymentsByProject: listTeamPaymentsByProject,
  upsertPaymentsForProject: upsertTeamPaymentsForProject,
  markPaymentStatus: markTeamPaymentStatus,
  updatePaymentFee: updateTeamPaymentFee,
  updateProjectPayments: updateTeamProjectPayments,
  deletePaymentsByProject: deleteTeamPaymentsByProject,

  // Records / Slips
  listPaymentRecords: listTeamPaymentRecords,
  createPaymentRecord: createTeamPaymentRecord,
  updatePaymentRecord: updateTeamPaymentRecord,
  deletePaymentRecord: deleteTeamPaymentRecord,

  // Assignments
  listAssignments: listAssignmentsByProject,
  upsertAssignments: upsertAssignmentsForProject,
  deleteAssignments: deleteAssignmentsByProject,
};

export default teamService;
