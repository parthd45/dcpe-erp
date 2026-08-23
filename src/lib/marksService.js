import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// 1. Grade Point & Letter Grade Calculator (Autonomous SGBAU)
// ─────────────────────────────────────────────────────────────
export const calculateGrade = (totalMarks) => {
  const total = Math.min(100, Math.max(0, parseFloat(totalMarks) || 0));

  if (total >= 90) return { grade: 'O', point: 10, label: 'Outstanding', status: 'Pass' };
  if (total >= 80) return { grade: 'A+', point: 9, label: 'Excellent', status: 'Pass' };
  if (total >= 70) return { grade: 'A', point: 8, label: 'Very Good', status: 'Pass' };
  if (total >= 60) return { grade: 'B+', point: 7, label: 'Good', status: 'Pass' };
  if (total >= 55) return { grade: 'B', point: 6, label: 'Above Average', status: 'Pass' };
  if (total >= 50) return { grade: 'C', point: 5, label: 'Average', status: 'Pass' };
  if (total >= 40) return { grade: 'P', point: 4, label: 'Pass', status: 'Pass' };
  return { grade: 'F', point: 0, label: 'Fail / Backlog', status: 'Fail' };
};

// ─────────────────────────────────────────────────────────────
// 2. Fetch marks for a subject & semester (for Faculty view)
// ─────────────────────────────────────────────────────────────
export const fetchSubjectMarks = async (subjectId, semester = 'Semester I') => {
  try {
    const { data, error } = await supabase
      .from('student_marks')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('semester', semester);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[DCPE ERP] fetchSubjectMarks error:', err.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────
// 3. Batch save/upsert student marks (from Faculty entry sheet)
// ─────────────────────────────────────────────────────────────
export const saveBatchStudentMarks = async (marksArray) => {
  try {
    const recordsToUpsert = marksArray.map((item) => {
      const internal = Math.min(30, Math.max(0, parseFloat(item.internal) || 0));
      const external = Math.min(70, Math.max(0, parseFloat(item.external) || 0));
      const total = internal + external;
      const gradeResult = calculateGrade(total);

      return {
        student_id: item.studentId,
        subject_id: item.subjectId,
        semester: item.semester || 'Semester I',
        internal_marks: internal,
        external_marks: external,
        total_marks: total,
        grade_point: gradeResult.point,
        letter_grade: gradeResult.grade,
        status: gradeResult.status,
        credits: item.credits || 4,
        updated_by: item.staffId || null,
      };
    });

    const { data, error } = await supabase
      .from('student_marks')
      .upsert(recordsToUpsert, { onConflict: 'student_id,subject_id,semester' })
      .select();

    if (error) throw error;
    return { success: true, count: data?.length || recordsToUpsert.length };
  } catch (err) {
    console.error('[DCPE ERP] saveBatchStudentMarks error:', err.message);
    return { success: false, message: err.message };
  }
};

// ─────────────────────────────────────────────────────────────
// 4. Fetch full Grade Report / Marksheet for a student
// Returns subject-wise marks, credits, grade points & computed SGPA
// ─────────────────────────────────────────────────────────────
export const fetchStudentGradeReport = async (studentId, semester = 'Semester I') => {
  try {
    const { data: marks, error } = await supabase
      .from('student_marks')
      .select(`
        *,
        subjects (
          id,
          code,
          name,
          department_id,
          course
        )
      `)
      .eq('student_id', studentId)
      .eq('semester', semester);

    if (error) throw error;

    if (!marks || marks.length === 0) {
      return null;
    }

    let totalCredits = 0;
    let totalCreditPoints = 0;
    let hasBacklog = false;

    const subjectsMarksheet = marks.map((m) => {
      const credits = parseFloat(m.credits) || 4;
      const gradePoint = parseFloat(m.grade_point) || 0;
      const creditPoints = credits * gradePoint;

      totalCredits += credits;
      totalCreditPoints += creditPoints;
      if (m.letter_grade === 'F') {
        hasBacklog = true;
      }

      return {
        id: m.id,
        code: m.subjects?.code || 'SUB',
        name: m.subjects?.name || 'Subject',
        semester: m.semester,
        internalMarks: m.internal_marks,
        externalMarks: m.external_marks,
        totalMarks: m.total_marks,
        gradePoint: m.grade_point,
        letterGrade: m.letter_grade,
        status: m.status,
        credits: credits,
        creditPoints: creditPoints,
      };
    });

    const sgpa = totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : '0.00';
    const sgpaNum = parseFloat(sgpa);

    let resultClassification = 'PASS';
    if (hasBacklog) {
      resultClassification = 'ATKT / BACKLOG';
    } else if (sgpaNum >= 8.5) {
      resultClassification = 'PASS WITH DISTINCTION';
    } else if (sgpaNum >= 7.0) {
      resultClassification = 'FIRST CLASS';
    } else if (sgpaNum >= 6.0) {
      resultClassification = 'SECOND CLASS';
    } else if (sgpaNum >= 4.0) {
      resultClassification = 'PASS CLASS';
    }

    return {
      semester,
      totalCredits,
      totalCreditPoints,
      sgpa,
      resultClassification,
      hasBacklog,
      subjects: subjectsMarksheet,
    };
  } catch (err) {
    console.error('[DCPE ERP] fetchStudentGradeReport error:', err.message);
    return null;
  }
};
