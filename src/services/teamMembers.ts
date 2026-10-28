import supabase from '../lib/supabaseClient';
import { canonicalizeStorageAssetUrls, compressImage } from './storage';
import { TeamMember, PerformanceNote } from '../types';
import { publicNamePatternsFromSlug } from '../utils/publicRouting';
import { generateUUID } from '../utils/uuid';

const TABLE = 'team_members';

function isMissingTeamMemberColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === 'PGRST204' || error.code === '42703') return true;
  const msg = (error.message || '').toLowerCase();
  const isConstraintViolation =
    msg.includes('violates') ||
    msg.includes('constraint') ||
    msg.includes('not-null') ||
    msg.includes('null value') ||
    msg.includes('duplicate key');
  if (isConstraintViolation) return false;
  return (msg.includes('column') || msg.includes('field')) && (msg.includes('does not exist') || msg.includes('could not find'));
}

export function normalizeTeamMember(row: any): TeamMember {
  return normalize(row);
}

function normalize(row: any): TeamMember {
  row = canonicalizeStorageAssetUrls(row);
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url ?? undefined,
    standardFee: Number(row.standard_fee || 0),
    noRek: row.no_rek ?? undefined,
    bankName: row.bank_name ?? undefined,
    specialization: row.specialization ?? undefined,
    location: row.location ?? row.address ?? undefined,
    emergencyContact: row.emergency_contact ?? undefined,

    rating: Number(row.rating || 0),
    performanceNotes: (row.performance_notes ?? []) as PerformanceNote[],
    portalAccessId: row.portal_access_id,
    category: row.category || 'Tim',
    status: (row.status as 'Aktif' | 'Nonaktif') || 'Aktif',
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

function denormalize(obj: Partial<TeamMember> & { status?: string }): any {
  return {
    ...(obj.name !== undefined ? { name: obj.name } : {}),
    ...(obj.role !== undefined ? { role: obj.role } : {}),
    ...(obj.email !== undefined ? { email: obj.email } : {}),
    ...(obj.phone !== undefined ? { phone: obj.phone } : {}),
    ...(obj.avatarUrl !== undefined ? { avatar_url: obj.avatarUrl } : {}),
    ...(obj.standardFee !== undefined ? { standard_fee: obj.standardFee } : {}),
    ...(obj.noRek !== undefined ? { no_rek: obj.noRek } : {}),
    ...(obj.bankName !== undefined ? { bank_name: obj.bankName } : {}),
    ...(obj.specialization !== undefined ? { specialization: obj.specialization } : {}),
    ...(obj.location !== undefined ? { location: obj.location } : {}),
    ...(obj.emergencyContact !== undefined ? { emergency_contact: obj.emergencyContact } : {}),

    ...(obj.rating !== undefined ? { rating: obj.rating } : {}),
    // ...(obj.performanceNotes !== undefined ? { performance_notes: obj.performanceNotes } : {}),
    ...(obj.portalAccessId !== undefined ? { portal_access_id: obj.portalAccessId } : {}),
    ...(obj.category !== undefined ? { category: obj.category } : {}),
    ...(obj.status !== undefined ? { status: obj.status } : {}),
  };
}

export async function uploadTeamMemberAvatar(file: File): Promise<string> {
  const processedFile = await compressImage(file, 1000, 0.8, 200 * 1024);
  const extension = processedFile.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `team-members/avatars/${generateUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from('gallery-images')
    .upload(path, processedFile, { contentType: processedFile.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('gallery-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function listTeamMembers(options: { limit?: number; offset?: number } = {}): Promise<TeamMember[]> {
  const limit = Math.min(100, options.limit || 50); // Default 50, max 100
  const offset = options.offset || 0;

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(normalize);
}

export async function listTeamMembersPaginated(page: number = 1, limit: number = 10, filters: { search?: string; category?: 'team' | 'employee' | 'vendor' } = {}): Promise<{
  teamMembers: TeamMember[];
  total: number;
  hasMore: boolean;
}> {
  const pageSize = [10, 20, 50].includes(limit) ? limit : 10;
  const safePage = Math.max(1, Math.floor(page) || 1);
  const offset = (safePage - 1) * pageSize;
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' });

  if (filters.category === 'employee') query = query.eq('category', 'Karyawan');
  else if (filters.category === 'vendor') query = query.eq('category', 'Vendor');
  else if (filters.category === 'team') query = query.or('category.is.null,category.not.in.(Vendor,Karyawan)');
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`name.ilike.${term},role.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
  }

  const { data, error, count } = await query
    .order('name', { ascending: true })
    .order('id', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  const teamMembers = (data || []).map(normalize);
  const total = count || 0;

  return {
    teamMembers,
    total,
    hasMore: (safePage * pageSize) < total
  };
}

export async function createTeamMember(payload: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  const body = denormalize(payload);
  const { data, error } = await supabase
    .from(TABLE)
    .insert([body])
    .select('*')
    .single();

  if (error) {
    if (isMissingTeamMemberColumnError(error)) {
      const fallbackBody = { ...body };
      delete fallbackBody.status;
      delete fallbackBody.emergency_contact;
      delete fallbackBody.specialization;
      delete fallbackBody.location;
      const { data: retryData, error: retryErr } = await supabase
        .from(TABLE)
        .insert([fallbackBody])
        .select('*')
        .single();
      if (retryErr) throw retryErr;
      const res = normalize(retryData);
      if (payload.status) res.status = payload.status;
      if (payload.emergencyContact) res.emergencyContact = payload.emergencyContact;
      if (payload.specialization) res.specialization = payload.specialization;
      if (payload.location) res.location = payload.location;
      return res;
    }
    throw error;
  }
  return normalize(data);
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>): Promise<TeamMember> {
  const body = denormalize(patch);
  const { data, error } = await supabase
    .from(TABLE)
    .update(body)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (isMissingTeamMemberColumnError(error)) {
      const fallbackBody = { ...body };
      delete fallbackBody.status;
      delete fallbackBody.emergency_contact;
      delete fallbackBody.specialization;
      delete fallbackBody.location;

      if (Object.keys(fallbackBody).length === 0) {
        const existing = await getTeamMember(id);
        if (existing) {
          return {
            ...existing,
            ...patch,
          };
        }
      }

      const { data: retryData, error: retryErr } = await supabase
        .from(TABLE)
        .update(fallbackBody)
        .eq('id', id)
        .select('*')
        .single();
      if (retryErr) throw retryErr;
      const res = normalize(retryData);
      if (patch.status) res.status = patch.status;
      if (patch.emergencyContact) res.emergencyContact = patch.emergencyContact;
      if (patch.specialization) res.specialization = patch.specialization;
      if (patch.location) res.location = patch.location;
      return res;
    }
    throw error;
  }
  return normalize(data);
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function getTeamMember(id: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return data ? normalize(data) : null;
}

export async function getTeamMemberByPortalAccessId(accessId: string): Promise<TeamMember | null> {
  if (!accessId || !accessId.trim()) return null;
  const cleanId = accessId.trim();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('portal_access_id', cleanId)
    .maybeSingle();
  if (data) return normalize(data);
  if (error) console.warn('[getTeamMemberByPortalAccessId] portal_access_id lookup failed:', error);

  const { data: byId } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', cleanId)
    .maybeSingle();
  if (byId) return normalize(byId);

  const patterns = publicNamePatternsFromSlug(cleanId);
  if (patterns === null) {
    const { data: byName, error: nameError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('name', cleanId)
      .limit(2);
    return nameError || byName?.length !== 1 ? null : normalize(byName[0]);
  }
  if (patterns.length === 0) return null;

  const matches = new Map<string, any>();
  for (const pattern of patterns) {
    const { data: candidates, error: patternError } = await supabase
      .from(TABLE)
      .select('*')
      .ilike('name', pattern)
      .limit(2);
    if (patternError) return null;
    for (const candidate of candidates || []) matches.set(candidate.id, candidate);
    if (matches.size > 1) return null;
  }
  return matches.size === 1 ? normalize([...matches.values()][0]) : null;
}

export const teamMemberService = {
  list: listTeamMembers,
  get: getTeamMember,
  getByPortalAccessId: getTeamMemberByPortalAccessId,
  add: createTeamMember,
  create: createTeamMember,
  update: updateTeamMember,
  delete: deleteTeamMember,
};

