import { supabase } from './supabase';

const STORAGE_KEY = 'dcpe_leave_applications_v1';

const INITIAL_APPLICATIONS = [
  {
    id: 'leave-101',
    studentId: 'stu-1',
    studentName: 'Aarav Deshmukh',
    prn: 'DCPE/MCA/2026/0001',
    rollNo: 'MCA-24-42',
    department: 'cs',
    departmentName: 'Computer Science & Applications',
    course: 'Master of Computer Applications (MCA)',
    type: 'leave',
    category: 'Medical Leave (Fever & Rest)',
    startDate: '2026-02-25',
    endDate: '2026-02-27',
    totalDays: 3,
    reason: 'Suffering from viral flu and doctor advised 3 days complete medical rest.',
    emergencyContact: '+91 98234 11223 (Father)',
    attachmentName: 'Doctor_Medical_Certificate.pdf',
    requiresPrincipal: false,
    stage: 'teacher', // 'teacher' | 'hod' | 'principal' | 'completed' | 'rejected'
    status: 'pending_teacher', // 'pending_teacher' | 'pending_hod' | 'pending_principal' | 'approved' | 'rejected'
    createdAt: '2026-02-23 09:30 AM',
    teacherApproval: null,
    hodApproval: null,
    principalApproval: null,
  },
  {
    id: 'leave-102',
    studentId: 'stu-3',
    studentName: 'Sneha Kulkarni',
    prn: 'DCPE/MCA/2026/0003',
    rollNo: 'MCA-24-12',
    department: 'cs',
    departmentName: 'Computer Science & Applications',
    course: 'Master of Computer Applications (MCA)',
    type: 'leave',
    category: 'National All-India University Sports Camp',
    startDate: '2026-03-01',
    endDate: '2026-03-14',
    totalDays: 14,
    reason: 'Selected to represent Sant Gadge Baba Amravati University in All-India Inter-University Yoga & Gymnastics Championship.',
    emergencyContact: '+91 94221 88990 (Coach Prof. S. Patil)',
    attachmentName: 'AIU_Selection_Letter.pdf',
    requiresPrincipal: true, // >= 10 days rule!
    stage: 'hod', // Teacher already approved, now waiting at HOD!
    status: 'pending_hod',
    createdAt: '2026-02-21 11:15 AM',
    teacherApproval: {
      approved: true,
      reviewedBy: 'Prof. S. Sharma',
      reviewedAt: '2026-02-22 03:30 PM',
      remarks: 'Verified AIU selection order. Highly recommended for special sports leave exemption.',
    },
    hodApproval: null,
    principalApproval: null,
  },
  {
    id: 'leave-103',
    studentId: 'stu-4',
    studentName: 'Vikram Joshi',
    prn: 'DCPE/MCA/2026/0004',
    rollNo: 'MCA-24-05',
    department: 'cs',
    departmentName: 'Computer Science & Applications',
    course: 'Master of Computer Applications (MCA)',
    type: 'grievance',
    category: 'Computer Lab GPU Server Downtime',
    startDate: '2026-02-23',
    endDate: '2026-02-23',
    totalDays: 1,
    reason: 'Deep Learning GPU workstations in Lab 4 are shutting down intermittently during model training experiments.',
    emergencyContact: '+91 97654 32109',
    attachmentName: 'Lab_Error_Screenshot.png',
    requiresPrincipal: false,
    stage: 'teacher',
    status: 'pending_teacher',
    createdAt: '2026-02-23 08:45 AM',
    teacherApproval: null,
    hodApproval: null,
    principalApproval: null,
  },
];

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_APPLICATIONS;
  }
}

function saveLocalApplications(apps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save leave applications locally:', err);
  }
}

/**
 * Submit a new Leave Application or Grievance
 */
export async function submitLeaveApplication(payload) {
  const all = getLocalApplications();
  const totalDays = Math.max(1, parseInt(payload.totalDays) || 1);
  const requiresPrincipal = totalDays >= 10 || payload.isEscalatedGrievance === true;

  const newApp = {
    id: `leave-${Date.now()}`,
    studentId: payload.studentId,
    studentName: payload.studentName,
    prn: payload.prn,
    rollNo: payload.rollNo || 'MCA-24-42',
    department: payload.department || 'cs',
    departmentName: payload.departmentName || 'Computer Science & Applications',
    course: payload.course || 'MCA',
    type: payload.type || 'leave', // 'leave' | 'grievance'
    category: payload.category || 'General Leave',
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalDays,
    reason: payload.reason,
    emergencyContact: payload.emergencyContact || '+91 98765 43210',
    attachmentName: payload.attachmentName || null,
    requiresPrincipal,
    stage: 'teacher', // Starts with teacher
    status: 'pending_teacher',
    createdAt: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    teacherApproval: null,
    hodApproval: null,
    principalApproval: null,
  };

  const updated = [newApp, ...all];
  saveLocalApplications(updated);

  // Attempt sync with Supabase if table exists
  try {
    await supabase.from('student_leaves').insert({
      id: newApp.id,
      student_id: newApp.studentId,
      student_name: newApp.studentName,
      prn: newApp.prn,
      department: newApp.department,
      course: newApp.course,
      type: newApp.type,
      category: newApp.category,
      start_date: newApp.startDate,
      end_date: newApp.endDate,
      total_days: newApp.totalDays,
      reason: newApp.reason,
      requires_principal: newApp.requiresPrincipal,
      status: newApp.status,
      data_json: newApp,
    });
  } catch (e) {
    // Non-blocking
  }

  return { success: true, application: newApp };
}

/**
 * Fetch all applications submitted by a student
 */
export async function fetchStudentApplications(studentId, studentPrn) {
  const all = getLocalApplications();
  return all.filter(
    (a) => a.studentId === studentId || (studentPrn && a.prn === studentPrn)
  );
}

/**
 * Fetch applications awaiting Faculty (Teacher) review
 */
export async function fetchTeacherPendingApplications(department = 'cs') {
  const all = getLocalApplications();
  return all.filter(
    (a) =>
      a.status === 'pending_teacher' &&
      (department === 'admin' || a.department === department)
  );
}

/**
 * Fetch applications awaiting HOD review (Approved by Teacher)
 */
export async function fetchHODPendingApplications(department = 'cs') {
  const all = getLocalApplications();
  return all.filter(
    (a) =>
      a.status === 'pending_hod' &&
      (department === 'admin' || a.department === department)
  );
}

/**
 * Fetch applications awaiting Principal / Admin Executive Sanction (10+ days leaves)
 */
export async function fetchPrincipalPendingApplications() {
  const all = getLocalApplications();
  return all.filter((a) => a.status === 'pending_principal');
}

/**
 * Fetch all leaves across institution for Admin view
 */
export async function fetchAllInstitutionalLeaves() {
  return getLocalApplications();
}

/**
 * Review an application at any stage: Teacher, HOD, or Principal
 */
export async function reviewLeaveApplication({
  applicationId,
  stage, // 'teacher' | 'hod' | 'principal'
  decision, // 'approve' | 'reject'
  reviewerName,
  remarks = '',
}) {
  const all = getLocalApplications();
  const index = all.findIndex((a) => a.id === applicationId);

  if (index === -1) {
    return { success: false, message: 'Application not found.' };
  }

  const app = { ...all[index] };
  const now = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (decision === 'reject') {
    app.status = 'rejected';
    app.stage = 'rejected';
    app.rejectionStage = stage.toUpperCase();
    app.rejectionReason = remarks || `Rejected by ${reviewerName} (${stage.toUpperCase()})`;
    app.rejectedBy = reviewerName;
    app.rejectedAt = now;
  } else if (stage === 'teacher') {
    // Teacher Approved -> Moves to HOD
    app.teacherApproval = {
      approved: true,
      reviewedBy: reviewerName || 'Class Faculty Mentor',
      reviewedAt: now,
      remarks: remarks || 'Endorsed and forwarded to Head of Department.',
    };
    app.stage = 'hod';
    app.status = 'pending_hod';
  } else if (stage === 'hod') {
    app.hodApproval = {
      approved: true,
      reviewedBy: reviewerName || 'Head of Department',
      reviewedAt: now,
      remarks: remarks || 'Recommended by Department HOD.',
    };

    // Rule Check: If 10+ days, it MUST go to Principal/Admin!
    if (app.requiresPrincipal || app.totalDays >= 10) {
      app.stage = 'principal';
      app.status = 'pending_principal';
    } else {
      // Normal < 10 days leave completes with HOD approval
      app.stage = 'completed';
      app.status = 'approved';
      app.sanctionedAt = now;
      app.sanctionNumber = `DCPE/SANCTION/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    }
  } else if (stage === 'principal') {
    // Principal/Admin Final Sanction
    app.principalApproval = {
      approved: true,
      reviewedBy: reviewerName || 'Principal / Registrar DCPE',
      reviewedAt: now,
      remarks: remarks || 'Executive institutional sanction granted for extended leave.',
    };
    app.stage = 'completed';
    app.status = 'approved';
    app.sanctionedAt = now;
    app.sanctionNumber = `DCPE/SANCTION/2026/${Math.floor(1000 + Math.random() * 9000)}`;
  }

  all[index] = app;
  saveLocalApplications(all);

  // Sync with Supabase
  try {
    await supabase
      .from('student_leaves')
      .update({
        status: app.status,
        stage: app.stage,
        data_json: app,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);
  } catch (e) {
    // Non-blocking
  }

  return { success: true, application: app };
}
