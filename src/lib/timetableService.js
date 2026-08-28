import { supabase } from './supabase';

/**
 * Fetch the timetable for a specific department, course, and day.
 * Returns null or empty array if not found, allowing fallbacks.
 */
export async function getTimetable(departmentId, course, day) {
  try {
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('department_id', departmentId)
      .eq('course', course)
      .eq('day', day)
      .maybeSingle();

    if (error) throw error;
    return data ? data.schedule : null;
  } catch (err) {
    console.error('[DCPE ERP] Error getting timetable:', err.message);
    // Return localStorage backup if available
    try {
      const local = localStorage.getItem(`timetable_${departmentId}_${course}_${day}`);
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  }
}

/**
 * Save / Update a timetable day schedule
 */
export async function saveTimetable(departmentId, course, day, schedule) {
  try {
    // Save to local storage first as backup
    localStorage.setItem(`timetable_${departmentId}_${course}_${day}`, JSON.stringify(schedule));

    const { data, error } = await supabase
      .from('timetables')
      .upsert({
        department_id: departmentId,
        course,
        day,
        schedule,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'department_id,course,day'
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[DCPE ERP] Error saving timetable:', err.message);
    return { success: false, message: err.message };
  }
}
