import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// 1. Fetch subjects assigned to a faculty staff member
// ─────────────────────────────────────────────────────────────
export const fetchFacultyAssignedSubjects = async (facultyId) => {
  try {
    const { data, error } = await supabase
      .from('faculty_subjects')
      .select(`
        subject_id,
        subjects (
          id,
          code,
          name,
          department_id,
          course
        )
      `)
      .eq('faculty_id', facultyId);

    if (error) throw error;
    return (data || []).map((item) => item.subjects).filter(Boolean);
  } catch (err) {
    console.error('[DCPE ERP] fetchFacultyAssignedSubjects error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 2. Fetch students enrolled in a subject's department & course
// ─────────────────────────────────────────────────────────────
export const fetchSubjectStudents = async (departmentId, course) => {
  try {
    let query = supabase
      .from('students')
      .select('*')
      .eq('status', 'approved');

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (course) {
      query = query.eq('course', course);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      prn: row.prn,
      rollNo: row.roll_no || 'Unassigned',
      email: row.email,
      course: row.course,
      departmentId: row.department_id,
    }));
  } catch (err) {
    console.error('[DCPE ERP] fetchSubjectStudents error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 3. Submit a new lecture attendance sheet & sync student records
// ─────────────────────────────────────────────────────────────
export const syncStudentAttendance = async (studentId, departmentId, course) => {
  try {
    const stats = await calculateStudentAttendanceStats(studentId, departmentId, course);
    if (stats && stats.overallPercentage !== null) {
      await supabase
        .from('students')
        .update({ attendance: stats.overallPercentage })
        .eq('id', studentId);
      return stats.overallPercentage;
    }
  } catch (err) {
    console.error('[DCPE ERP] syncStudentAttendance error:', err);
  }
  return '0.0%';
};

export const submitAttendanceSheet = async ({
  subjectId,
  facultyId,
  lectureDate,
  topic,
  presentStudentIds,
  totalStudentsCount,
}) => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        subject_id: subjectId,
        faculty_id: facultyId,
        lecture_date: lectureDate || new Date().toISOString().split('T')[0],
        topic: topic.trim(),
        present_student_ids: presentStudentIds,
        total_students_count: totalStudentsCount,
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch subject details to get department_id and course
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('department_id, course')
      .eq('id', subjectId)
      .single();

    if (subjectData) {
      // Get all approved students in this department and course
      const { data: stuList } = await supabase
        .from('students')
        .select('id')
        .eq('department_id', subjectData.department_id)
        .eq('course', subjectData.course);

      if (stuList && stuList.length > 0) {
        for (const s of stuList) {
          await syncStudentAttendance(s.id, subjectData.department_id, subjectData.course);
        }
      }
    }

    return { success: true, log: data };
  } catch (err) {
    console.error('[DCPE ERP] submitAttendanceSheet error:', err.message);
    return { success: false, message: err.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 4. Fetch past lecture history for a subject
// ─────────────────────────────────────────────────────────────
export const fetchSubjectLectureLogs = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[DCPE ERP] fetchSubjectLectureLogs error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 5. Mathematically calculate attendance stats for a student
// Returns: { overallPercentage, totalAttended, totalConducted, subjectBreakdown }
// ─────────────────────────────────────────────────────────────
export const calculateStudentAttendanceStats = async (studentId, departmentId, course) => {
  try {
    // Get all subjects for this student's department & course
    const { data: deptSubjects, error: subErr } = await supabase
      .from('subjects')
      .select('*')
      .eq('department_id', departmentId)
      .eq('course', course);

    if (subErr) throw subErr;

    if (!deptSubjects || deptSubjects.length === 0) {
      return null;
    }

    const subjectIds = deptSubjects.map((s) => s.id);

    // Get all attendance logs for these subjects
    const { data: logs, error: logErr } = await supabase
      .from('attendance_logs')
      .select('*')
      .in('subject_id', subjectIds);

    if (logErr) throw logErr;

    let grandTotalConducted = 0;
    let grandTotalAttended = 0;

    const subjectBreakdown = deptSubjects.map((sub) => {
      const subLogs = (logs || []).filter((l) => l.subject_id === sub.id);
      const totalConducted = subLogs.length;

      let attendedCount = 0;
      subLogs.forEach((l) => {
        if (l.present_student_ids && l.present_student_ids.includes(studentId)) {
          attendedCount++;
        }
      });

      grandTotalConducted += totalConducted;
      grandTotalAttended += attendedCount;

      const percentage =
        totalConducted > 0
          ? ((attendedCount / totalConducted) * 100).toFixed(1) + '%'
          : 'N/A';

      return {
        subjectId: sub.id,
        code: sub.code,
        name: sub.name,
        totalConducted,
        attendedCount,
        percentage,
        percentageNum: totalConducted > 0 ? (attendedCount / totalConducted) * 100 : 0,
      };
    });

    const overallPercentageNum =
      grandTotalConducted > 0
        ? (grandTotalAttended / grandTotalConducted) * 100
        : 0;

    const overallPercentage =
      grandTotalConducted > 0
        ? overallPercentageNum.toFixed(1) + '%'
        : null;

    return {
      overallPercentage,
      overallPercentageNum,
      grandTotalConducted,
      grandTotalAttended,
      subjectBreakdown,
    };
  } catch (err) {
    console.error('[DCPE ERP] calculateStudentAttendanceStats error:', err.message);
    return null;
  }
};
