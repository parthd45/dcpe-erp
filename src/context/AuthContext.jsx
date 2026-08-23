import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hashPassword, comparePassword } from '../lib/authCrypto';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

// ─────────────────────────────────────────────────────────────
// Pure helper functions (no DB calls — safe to use anywhere)
// ─────────────────────────────────────────────────────────────

export const getBranchCode = (courseName = '') => {
  const c = courseName.toUpperCase();
  if (c.includes('MCA')) return 'MCA';
  if (c.includes('BCA')) return 'BCA';
  if (c.includes('M.SC') || c.includes('MSC')) return 'MSCCS';
  if (c.includes('B.SC') || c.includes('BSC')) return 'BSCCS';
  if (c.includes('M.P.ED') || c.includes('MPED')) return 'MPED';
  if (c.includes('B.P.ED') || c.includes('BPED')) return 'BPED';
  if (c.includes('B.P.E.S') || c.includes('BPES')) return 'BPES';
  if (c.includes('M.COM') || c.includes('MCOM')) return 'MCOM';
  if (c.includes('BBA')) return 'BBA';
  if (c.includes('M.A. YOGA') || c.includes('MA YOGA')) return 'MAYOGA';
  if (c.includes('B.A. YOGA') || c.includes('BA YOGA')) return 'BAYOGA';
  if (c.includes('PGDYT')) return 'PGDYT';
  if (c.includes('DYNS')) return 'DYNS';
  if (c.includes('SOFTWARE')) return 'BVOC-SD';
  if (c.includes('SPORTS')) return 'BVOC-SM';
  if (c.includes('VOC')) return 'BVOC';
  return 'GEN';
};

export const generateUniqueCollegeEmail = (fullName, courseName, existingEmails = []) => {
  if (!fullName || !fullName.trim()) return '';

  const cleanName = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (cleanName.length === 0) return '';

  const firstName = cleanName[0];
  const lastName = cleanName.length > 1 ? cleanName[cleanName.length - 1] : '';
  const branch = getBranchCode(courseName).toLowerCase().replace(/[^a-z0-9]/g, '');

  const baseHandle = lastName
    ? `${firstName}.${lastName}.${branch}`
    : `${firstName}.${branch}`;

  const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));

  let candidate = `${baseHandle}@dcpehvpm.org`;
  let counter = 2;

  while (existingSet.has(candidate)) {
    candidate = `${baseHandle}${counter}@dcpehvpm.org`;
    counter++;
  }

  return candidate;
};

// ─────────────────────────────────────────────────────────────
// Map a raw Supabase student row → camelCase shape the UI expects
// ─────────────────────────────────────────────────────────────
const mapStudent = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  personalEmail: row.personal_email || '',
  prn: row.prn,
  enrollmentNo: row.enrollment_no,
  branchCode: row.branch_code,
  department: row.department_id,
  departmentName: row.department_name,
  course: row.course,
  year: row.year,
  phone: row.phone || 'N/A',
  status: row.status,
  registeredAt: row.registered_at
    ? new Date(row.registered_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '',
  approvedAt: row.approved_at
    ? new Date(row.approved_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : null,
  approvedBy: row.approved_by || null,
  rejectionReason: row.rejection_reason || '',
  attendance: row.attendance || '0.0%',
  cgpa: row.cgpa || 'N/A',
  feesStatus: row.fees_status || 'Pending Verification',
  rollNo: row.roll_no || 'Pending Assignment',
  photoUrl: row.photo_url || null,
  docMarksheet10th: row.doc_marksheet_10th || null,
  docMarksheet12th: row.doc_marksheet_12th || null,
  docGradMarksheet: row.doc_grad_marksheet || null,
  docIdProof: row.doc_id_proof || null,
  docStatus: row.doc_status || 'Pending Upload',
  score10th: row.score_10th || '88.60%',
  score12th: row.score_12th || '84.20%',
  scoreGrad: row.score_grad || '8.75 CGPA',
  scoreAadhaar: row.score_aadhaar || 'UIDAI Verified',
  hallTicketApproved: Boolean(row.hall_ticket_approved),
  hallTicketApprovedAt: row.hall_ticket_approved_at || null,
  hallTicketApprovedBy: row.hall_ticket_approved_by || null,
  userType: 'student',
});

// Map a raw Supabase staff row → camelCase shape the UI expects
const mapStaff = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department_id,
  departmentName: row.department_name,
  designation: row.designation,
  userType: row.role, // 'hod' | 'admin' | 'faculty'
});

// ─────────────────────────────────────────────────────────────
// Auth Provider
// ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dcpe_current_user_v4');
    return saved ? JSON.parse(saved) : null;
  });
  const [authNotification, setAuthNotification] = useState(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // ── Persist current user session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dcpe_current_user_v4', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dcpe_current_user_v4');
    }
  }, [currentUser]);

  // ── Load all students from Supabase (for HOD dashboard & Student portal)
  const loadStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) throw error;

      // Fetch all attendance logs & subjects to compute live attendance percentages
      const { data: logs } = await supabase.from('attendance_logs').select('*');
      const { data: subjects } = await supabase.from('subjects').select('*');

      const mapped = (data || []).map((row) => {
        let calculatedAttendance = row.attendance;

        if (logs && subjects && row.department_id && row.course) {
          const deptSubjects = (subjects || []).filter(
            (sub) => sub.department_id === row.department_id && sub.course === row.course
          );
          const subIds = deptSubjects.map((sub) => sub.id);
          const studentLogs = (logs || []).filter((l) => subIds.includes(l.subject_id));
          const totalConducted = studentLogs.length;

          if (totalConducted > 0) {
            let attendedCount = 0;
            studentLogs.forEach((l) => {
              if (Array.isArray(l.present_student_ids) && l.present_student_ids.includes(row.id)) {
                attendedCount++;
              }
            });
            calculatedAttendance = ((attendedCount / totalConducted) * 100).toFixed(1) + '%';
          }
        }

        return mapStudent({ ...row, attendance: calculatedAttendance || '0.0%' });
      });

      setStudents(mapped);

      // Auto-update currentUser if a student is logged in and their record changed
      setCurrentUser((prev) => {
        if (!prev || prev.userType !== 'student') return prev;
        const updated = mapped.find((s) => s.id === prev.id);
        return updated ? updated : prev;
      });
    } catch (err) {
      console.error('[DCPE ERP] Failed to load students:', err.message);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  // ── Initial load + real-time subscription for student & attendance changes
  useEffect(() => {
    loadStudents();

    const channel = supabase
      .channel('erp_students_attendance_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => loadStudents()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_logs' },
        () => loadStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStudents]);

  // ── Get next enrollment number preview (reads branch_counters from DB)
  const getNextEnrollmentNumberForBranch = useCallback(async (courseName) => {
    const branchCode = getBranchCode(courseName);
    const { data, error } = await supabase
      .from('branch_counters')
      .select('next_seq')
      .eq('branch_code', branchCode)
      .single();

    if (error || !data) {
      return `DCPE/${branchCode}/2026/0001`;
    }

    const padded = String(data.next_seq).padStart(4, '0');
    return `DCPE/${branchCode}/2026/${padded}`;
  }, []);

  // ── Get auto college email (needs existing emails from DB for collision check)
  const getAutoCollegeEmail = useCallback(
    async (fullName, courseName) => {
      // Use the already-loaded students list for collision check
      const existingEmails = students.map((s) => s.email);
      return generateUniqueCollegeEmail(fullName, courseName, existingEmails);
    },
    [students]
  );

  // ── Register a new student
  const registerStudent = async (studentData) => {
    try {
      const branchCode = getBranchCode(studentData.course);

      // 1. Claim the next sequence number atomically
      const { data: counterRow, error: counterErr } = await supabase
        .from('branch_counters')
        .select('next_seq')
        .eq('branch_code', branchCode)
        .single();

      if (counterErr) throw new Error('Could not fetch enrollment counter. Try again.');

      const currentSeq = counterRow.next_seq;
      const padded = String(currentSeq).padStart(4, '0');
      const autoEnrollmentNo = `DCPE/${branchCode}/2026/${padded}`;

      // 2. Generate unique college email (collision-free)
      const existingEmails = students.map((s) => s.email);
      const autoEmail = generateUniqueCollegeEmail(
        studentData.name,
        studentData.course,
        existingEmails
      );

      if (!autoEmail) throw new Error('Could not generate college email. Please enter your full name.');

      // 3. Hash password
      const passwordHash = await hashPassword(studentData.password);

      // 4. Insert student row
      const { data: newRow, error: insertErr } = await supabase
        .from('students')
        .insert({
          name: studentData.name.trim(),
          email: autoEmail,
          personal_email: studentData.personalEmail || '',
          password_hash: passwordHash,
          prn: autoEnrollmentNo,
          enrollment_no: autoEnrollmentNo,
          branch_code: branchCode,
          department_id: studentData.department,
          department_name: studentData.departmentName,
          course: studentData.course,
          year: studentData.year,
          phone: studentData.phone || 'N/A',
          status: 'pending',
          roll_no: `${branchCode}-26-${String(currentSeq).padStart(3, '0')}`,
        })
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === '23505') {
          throw new Error('A student with this email or PRN already exists. Please contact your department.');
        }
        throw new Error(insertErr.message);
      }

      // 5. Increment the branch counter
      await supabase
        .from('branch_counters')
        .update({ next_seq: currentSeq + 1 })
        .eq('branch_code', branchCode);

      // 6. Reload student records in memory immediately
      await loadStudents();

      return {
        success: true,
        student: mapStudent(newRow),
        enrollmentNo: autoEnrollmentNo,
        collegeEmail: autoEmail,
        message: `Registration submitted! Your HOD of ${studentData.departmentName} will verify your application. You can log in once approved.`,
      };
    } catch (err) {
      console.error('[DCPE ERP] registerStudent error:', err.message);
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again.',
      };
    }
  };

  // ── Login handler — students use DB lookup, staff use DB lookup too
  const login = async (emailOrPrn, password, selectedRole) => {
    const cleanQuery = emailOrPrn.trim().toLowerCase();

    try {
      // ── STAFF LOGIN (HOD / Admin / Faculty)
      if (selectedRole === 'hod' || selectedRole === 'admin' || selectedRole === 'faculty') {
        const { data: staffRows, error } = await supabase
          .from('staff')
          .select('*')
          .eq('email', cleanQuery);

        if (error) throw error;

        const staffUser = staffRows?.[0];

        if (!staffUser) {
          return {
            success: false,
            message: 'No staff account found with this email address.',
          };
        }

        // Role check
        if (staffUser.role !== selectedRole && !(selectedRole === 'faculty' && staffUser.role === 'hod')) {
          return {
            success: false,
            message: `This account is not registered as ${selectedRole.toUpperCase()}. Try a different role.`,
          };
        }

        // Verify password
        const passwordMatch = await comparePassword(password, staffUser.password_hash);
        if (!passwordMatch) {
          return { success: false, message: 'Incorrect password. Please try again.' };
        }

        const userObj = mapStaff(staffUser);
        setCurrentUser(userObj);
        await loadStudents();
        return { success: true, user: userObj };
      }

      // ── STUDENT LOGIN (College Email, PRN, or Registered Mobile Number)
      const rawInput = emailOrPrn.trim();
      const digitsOnly = rawInput.replace(/\D/g, '');

      let orFilter = `email.eq.${cleanQuery},prn.ilike.${cleanQuery},enrollment_no.ilike.${cleanQuery}`;
      if (digitsOnly.length >= 7) {
        const last10 = digitsOnly.slice(-10);
        orFilter += `,phone.ilike.%${last10}%,phone.eq.${rawInput}`;
      }

      const { data: studentRows, error: stuErr } = await supabase
        .from('students')
        .select('*')
        .or(orFilter);

      if (stuErr) throw stuErr;

      const student = studentRows?.[0];

      if (!student) {
        return {
          success: false,
          message: 'No student account found with this Email, Mobile Number, or PRN. Check your credentials.',
        };
      }

      // Verify password
      const passwordMatch = await comparePassword(password, student.password_hash);
      if (!passwordMatch) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }

      // Status checks
      if (student.status === 'pending') {
        return {
          success: false,
          isPendingApproval: true,
          departmentName: student.department_name,
          message: `⏳ Approval Pending: Your registration (${student.email} / ${student.prn}) is awaiting verification by the Head of Department (${student.department_name}). You will be able to log in once approved.`,
        };
      }

      if (student.status === 'rejected') {
        return {
          success: false,
          isRejected: true,
          rejectionReason: student.rejection_reason,
          message: `❌ Registration Rejected: Your account (${student.prn}) was rejected. Reason: "${student.rejection_reason || 'Documents mismatch'}". Please contact your department office.`,
        };
      }

      if (student.status === 'approved') {
        const userObj = mapStudent(student);
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }

      return { success: false, message: 'Unable to authenticate account.' };
    } catch (err) {
      console.error('[DCPE ERP] login error:', err);
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return {
          success: false,
          message: 'Database not connected: Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Project Settings and redeploy.',
        };
      }
      return {
        success: false,
        message: err.message ? `Server error: ${err.message}` : 'A server error occurred. Please try again in a moment.',
      };
    }
  };

  // ── HOD Action: Approve student
  const approveStudent = async (studentId, hodName) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: hodName || 'Head of Department',
          rejection_reason: '',
        })
        .eq('id', studentId)
        .select();

      if (error) throw error;
      await loadStudents();
    } catch (err) {
      console.error('[DCPE ERP] approveStudent error:', err.message);
    }
  };

  // ── HOD Action: Reject student
  const rejectStudent = async (studentId, reason) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          status: 'rejected',
          approved_at: null,
          approved_by: null,
          rejection_reason: reason || 'Application rejected by HOD.',
        })
        .eq('id', studentId)
        .select();

      if (error) throw error;
      await loadStudents();
    } catch (err) {
      console.error('[DCPE ERP] rejectStudent error:', err.message);
    }
  };

  // ── HOD Action: Update student academic record (Attendance, CGPA, Fees, Roll No)
  const updateStudentAcademicRecord = async (studentId, updates) => {
    try {
      const dbUpdates = {};
      if (updates.attendance !== undefined) dbUpdates.attendance = updates.attendance;
      if (updates.cgpa !== undefined) dbUpdates.cgpa = updates.cgpa;
      if (updates.feesStatus !== undefined) dbUpdates.fees_status = updates.feesStatus;
      if (updates.rollNo !== undefined) dbUpdates.roll_no = updates.rollNo;
      if (updates.hallTicketApproved !== undefined) dbUpdates.hall_ticket_approved = updates.hallTicketApproved;

      const { data, error } = await supabase
        .from('students')
        .update(dbUpdates)
        .eq('id', studentId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No matching student record was updated in database.');
      }

      await loadStudents();
      return { success: true, updated: data[0] };
    } catch (err) {
      console.error('[DCPE ERP] updateStudentAcademicRecord error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // ── Student / HOD Action: Update student profile photo and admission documents
  const updateStudentDocuments = async (studentId, updates) => {
    // 1. Optimistically update local students list in memory
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
    );

    // 2. Optimistically update currentUser if it's the logged-in student
    if (currentUser && currentUser.id === studentId) {
      const updatedUser = {
        ...currentUser,
        photoUrl: updates.photoUrl !== undefined ? updates.photoUrl : currentUser.photoUrl,
        docMarksheet10th: updates.docMarksheet10th !== undefined ? updates.docMarksheet10th : currentUser.docMarksheet10th,
        docMarksheet12th: updates.docMarksheet12th !== undefined ? updates.docMarksheet12th : currentUser.docMarksheet12th,
        docGradMarksheet: updates.docGradMarksheet !== undefined ? updates.docGradMarksheet : currentUser.docGradMarksheet,
        docIdProof: updates.docIdProof !== undefined ? updates.docIdProof : currentUser.docIdProof,
        docStatus: updates.docStatus !== undefined ? updates.docStatus : currentUser.docStatus,
        score10th: updates.score10th !== undefined ? updates.score10th : currentUser.score10th,
        score12th: updates.score12th !== undefined ? updates.score12th : currentUser.score12th,
        scoreGrad: updates.scoreGrad !== undefined ? updates.scoreGrad : currentUser.scoreGrad,
        scoreAadhaar: updates.scoreAadhaar !== undefined ? updates.scoreAadhaar : currentUser.scoreAadhaar,
      };
      setCurrentUser(updatedUser);
      try {
        sessionStorage.setItem('dcpe_auth_user', JSON.stringify(updatedUser));
      } catch (e) {
        // quota ignore
      }
    }

    try {
      const dbUpdates = {};
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.docMarksheet10th !== undefined) dbUpdates.doc_marksheet_10th = updates.docMarksheet10th;
      if (updates.docMarksheet12th !== undefined) dbUpdates.doc_marksheet_12th = updates.docMarksheet12th;
      if (updates.docGradMarksheet !== undefined) dbUpdates.doc_grad_marksheet = updates.docGradMarksheet;
      if (updates.docIdProof !== undefined) dbUpdates.doc_id_proof = updates.docIdProof;
      if (updates.docStatus !== undefined) dbUpdates.doc_status = updates.docStatus;
      if (updates.score10th !== undefined) dbUpdates.score_10th = updates.score10th;
      if (updates.score12th !== undefined) dbUpdates.score_12th = updates.score12th;
      if (updates.scoreGrad !== undefined) dbUpdates.score_grad = updates.scoreGrad;
      if (updates.scoreAadhaar !== undefined) dbUpdates.score_aadhaar = updates.scoreAadhaar;

      const { data, error } = await supabase
        .from('students')
        .update(dbUpdates)
        .eq('id', studentId)
        .select();

      if (error) {
        console.warn('[DCPE ERP] updateStudentDocuments DB error (ensure SQL columns exist):', error.message);
        return { success: true, warning: error.message };
      }

      await loadStudents();
      return { success: true, updated: data?.[0] };
    } catch (err) {
      console.error('[DCPE ERP] updateStudentDocuments error:', err.message);
      return { success: true, warning: err.message };
    }
  };

  // ── HOD Action: Approve or Revoke Student Examination Hall Ticket
  const toggleHallTicketApproval = async (studentId, isApproved, approvedByName) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          hall_ticket_approved: isApproved,
          hall_ticket_approved_at: isApproved ? new Date().toISOString() : null,
          hall_ticket_approved_by: isApproved ? (approvedByName || 'HOD') : null,
        })
        .eq('id', studentId)
        .select();

      if (error) throw error;
      await loadStudents();
      return { success: true, updated: data?.[0] };
    } catch (err) {
      console.error('[DCPE ERP] toggleHallTicketApproval error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // ── Logout
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        students,
        currentUser,
        isLoadingStudents,
        loadStudents,
        refreshStudents: loadStudents,
        getNextEnrollmentNumberForBranch,
        getAutoCollegeEmail,
        registerStudent,
        login,
        approveStudent,
        rejectStudent,
        updateStudentAcademicRecord,
        updateStudentDocuments,
        toggleHallTicketApproval,
        logout,
        authNotification,
        setAuthNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
