import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// Fetch notices from DB
// departmentId: if provided, fetches dept-specific + college-wide
//               if null, fetches only college-wide (for landing page)
// ─────────────────────────────────────────────────────────────
export const fetchNotices = async (limit = 10, departmentId = null) => {
  try {
    let query = supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // If dept specified: show college-wide + that dept's notices
    if (departmentId) {
      query = query.or(`scope.eq.college,department_id.eq.${departmentId}`);
    } else {
      // Landing page: show all active notices (college-wide + any dept)
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapNotice);
  } catch (err) {
    console.error('[DCPE ERP] fetchNotices error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// Post a new notice (called by HOD)
// ─────────────────────────────────────────────────────────────
export const postNotice = async (staffId, staffDeptId, title, body, tag, tagLabel, scope) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: title.trim(),
        body: body.trim(),
        tag,
        tag_label: tagLabel,
        scope,
        department_id: scope === 'department' ? staffDeptId : null,
        posted_by: staffId,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, notice: mapNotice(data) };
  } catch (err) {
    console.error('[DCPE ERP] postNotice error:', err.message);
    return { success: false, message: err.message };
  }
};

// ─────────────────────────────────────────────────────────────
// Fetch notices posted by a specific staff member (HOD's own notices)
// ─────────────────────────────────────────────────────────────
export const fetchStaffNotices = async (staffId) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('posted_by', staffId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapNotice);
  } catch (err) {
    console.error('[DCPE ERP] fetchStaffNotices error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// Archive (soft-delete) a notice — only by the poster
// ─────────────────────────────────────────────────────────────
export const archiveNotice = async (noticeId) => {
  try {
    const { error } = await supabase
      .from('notices')
      .update({ is_active: false })
      .eq('id', noticeId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[DCPE ERP] archiveNotice error:', err.message);
    return { success: false, message: err.message };
  }
};

// ─────────────────────────────────────────────────────────────
// Real-time subscription to notices table changes
// callback: called whenever any notice is inserted/updated/deleted
// ─────────────────────────────────────────────────────────────
export const subscribeToNotices = (callback) => {
  const channel = supabase
    .channel('notices_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notices' },
      callback
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};

// ─────────────────────────────────────────────────────────────
// Map DB row → UI shape
// ─────────────────────────────────────────────────────────────
const mapNotice = (row) => {
  const date = new Date(row.created_at);
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tag: row.tag || 'general',
    tagLabel: row.tag_label || 'General',
    scope: row.scope || 'college',
    departmentId: row.department_id,
    postedBy: row.posted_by,
    isActive: row.is_active,
    createdAt: row.created_at,
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleString('en-IN', { month: 'short' }),
  };
};
