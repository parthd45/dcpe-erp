import { supabase } from './supabase';

// Fallback initial placement drives for DCPE students
const INITIAL_DRIVES = [
  {
    id: 'drive-tcs-01',
    companyName: 'Tata Consultancy Services (TCS)',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'System Engineer & Full-Stack Cloud Developer',
    jobType: 'Full-Time Campus Drive',
    packageCtc: '₹7.50 - ₹9.00 LPA',
    location: 'Pune / Mumbai / Bengaluru',
    eligibleDepartments: ['Computer Science & IT', 'Engineering & Tech'],
    eligibleCourses: ['MCA', 'B.Tech', 'BCA', 'M.Sc (CS)'],
    minCgpa: 6.50,
    minAttendance: 75.0,
    driveDate: '2026-09-15',
    deadline: '2026-09-08',
    jobDescription: 'Design, develop, and deploy enterprise-grade microservices and modern cloud applications. Candidate must possess strong problem-solving and Java/Python skills.',
    selectionRounds: 'National Qualifier Test (NQT) -> Technical Interview -> HR Discussion',
    status: 'Active',
    openings: 25,
  },
  {
    id: 'drive-sai-02',
    companyName: 'Sports Authority of India (SAI)',
    companyLogo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Assistant Athletic Director & Sports Performance Coach',
    jobType: 'Sports Officer & Coach',
    packageCtc: '₹8.40 LPA (Govt Pay Band 2)',
    location: 'Amravati / New Delhi / SAI Regional Centers',
    eligibleDepartments: ['Physical Education', 'Sports Science', 'Yoga & Wellness'],
    eligibleCourses: ['B.P.Ed', 'M.P.Ed', 'B.Sc (Physical Education)', 'PG Diploma in Sports Coaching'],
    minCgpa: 6.00,
    minAttendance: 80.0,
    driveDate: '2026-09-22',
    deadline: '2026-09-12',
    jobDescription: 'Formulate athlete training regimes, physical conditioning assessments, national fitness protocol benchmarking, and academy operations management.',
    selectionRounds: 'Physical Fitness Test -> Practical Coaching Demonstration -> Board Interview',
    status: 'Active',
    openings: 12,
  },
  {
    id: 'drive-decathlon-03',
    companyName: 'Decathlon Sports India',
    companyLogo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Sports Operations Lead & Athletic Product Specialist',
    jobType: 'Full-Time Campus Drive',
    packageCtc: '₹6.20 LPA + Performance Bonus',
    location: 'Nagpur / Pune / Hyderabad',
    eligibleDepartments: ['Physical Education', 'Computer Science & IT', 'Yoga & Wellness'],
    eligibleCourses: ['B.P.Ed', 'M.P.Ed', 'BCA', 'MCA', 'B.Sc (Sports)'],
    minCgpa: 5.50,
    minAttendance: 70.0,
    driveDate: '2026-09-28',
    deadline: '2026-09-18',
    jobDescription: 'Lead omnichannel sports retail campaigns, manage customer sports communities, organize athletic workshops, and oversee supply logistics.',
    selectionRounds: 'Group Discussion -> Sport Skill Test -> Personal Interview',
    status: 'Active',
    openings: 18,
  },
  {
    id: 'drive-infosys-04',
    companyName: 'Infosys Limited',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Specialist Programmer (Power Programmer)',
    jobType: 'Full-Time Campus Drive',
    packageCtc: '₹9.50 LPA',
    location: 'Pune / Hyderabad / Mysuru',
    eligibleDepartments: ['Computer Science & IT'],
    eligibleCourses: ['MCA', 'B.Tech'],
    minCgpa: 7.50,
    minAttendance: 75.0,
    driveDate: '2026-10-05',
    deadline: '2026-09-25',
    jobDescription: 'High-impact coding role solving complex algorithmic problems, building scalable backend APIs, AI/ML integrations, and next-gen web platforms.',
    selectionRounds: 'HackWithInfy Coding Round -> Technical Deep-Dive Interview -> HR',
    status: 'Active',
    openings: 15,
  },
  {
    id: 'drive-cultfit-05',
    companyName: 'Cult.fit Healthcare & Sports',
    companyLogo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior Strength & Conditioning Specialist',
    jobType: 'Full-Time Campus Drive',
    packageCtc: '₹5.80 LPA + Free Center Pass',
    location: 'Mumbai / Pune / Bengaluru',
    eligibleDepartments: ['Physical Education', 'Yoga & Wellness'],
    eligibleCourses: ['B.P.Ed', 'M.P.Ed', 'B.Sc (Physical Education)'],
    minCgpa: 5.50,
    minAttendance: 75.0,
    driveDate: '2026-10-10',
    deadline: '2026-09-30',
    jobDescription: 'Design personalized workout programming, group athletic training sessions, injury prevention drills, and biomechanical posture analysis.',
    selectionRounds: 'Movement Screening -> Practical Demo Session -> Culture Fit Interview',
    status: 'Active',
    openings: 8,
  },
];

const LOCAL_STORAGE_KEY_DRIVES = 'dcpe_placement_drives';
const LOCAL_STORAGE_KEY_APPS = 'dcpe_placement_applications';

function getLocalDrives() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_DRIVES);
    return raw ? JSON.parse(raw) : INITIAL_DRIVES;
  } catch {
    return INITIAL_DRIVES;
  }
}

function saveLocalDrives(drives) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_DRIVES, JSON.stringify(drives));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_APPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalApplications(apps) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// ── Fetch Placement Drives
export async function fetchPlacementDrives() {
  try {
    const { data, error } = await supabase
      .from('placement_drives')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalDrives();
    }

    return data.map((d) => ({
      id: d.id,
      companyName: d.company_name,
      companyLogo: d.company_logo || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
      jobTitle: d.job_title,
      jobType: d.job_type,
      packageCtc: d.package_ctc,
      location: d.location,
      eligibleDepartments: d.eligible_departments || [],
      eligibleCourses: d.eligible_courses || [],
      minCgpa: Number(d.min_cgpa) || 6.0,
      minAttendance: Number(d.min_attendance) || 75.0,
      driveDate: d.drive_date,
      deadline: d.deadline,
      jobDescription: d.job_description,
      selectionRounds: d.selection_rounds,
      status: d.status || 'Active',
      openings: 15,
    }));
  } catch (err) {
    console.warn('[PlacementService] Using local fallback drives:', err);
    return getLocalDrives();
  }
}

// ── Student: Apply for Placement Drive
export async function applyForPlacementDrive(drive, student) {
  const newApp = {
    id: 'app-' + Date.now(),
    driveId: drive.id,
    companyName: drive.companyName,
    jobTitle: drive.jobTitle,
    packageCtc: drive.packageCtc,
    studentId: student.id,
    studentName: student.name,
    studentPrn: student.prn,
    studentEmail: student.email,
    studentCourse: student.course,
    studentCgpa: student.cgpa || '8.50',
    appliedAt: new Date().toISOString(),
    applicationStatus: 'Applied',
    tpoRemarks: 'Application submitted successfully. Awaiting initial screening.',
  };

  // Local sync
  const currentApps = getLocalApplications();
  const alreadyApplied = currentApps.some((a) => a.driveId === drive.id && a.studentId === student.id);
  if (alreadyApplied) {
    return { success: false, message: 'You have already applied for this campus drive.' };
  }

  const updatedApps = [newApp, ...currentApps];
  saveLocalApplications(updatedApps);

  // Supabase sync
  try {
    await supabase.from('placement_applications').insert({
      drive_id: drive.id,
      student_id: student.id,
      student_name: student.name,
      student_prn: student.prn,
      student_email: student.email,
      student_course: student.course,
      student_cgpa: student.cgpa || '8.50',
      application_status: 'Applied',
      tpo_remarks: 'Application submitted successfully. Awaiting initial screening.',
    });
  } catch (err) {
    console.warn('[PlacementService] Supabase insert note:', err.message);
  }

  return { success: true, application: newApp };
}

// ── Student: Fetch My Applications
export async function fetchStudentApplications(studentId) {
  try {
    const { data, error } = await supabase
      .from('placement_applications')
      .select('*')
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((a) => ({
        id: a.id,
        driveId: a.drive_id,
        companyName: a.company_name || 'Campus Recruiter',
        jobTitle: a.job_title || 'Position',
        packageCtc: a.package_ctc,
        studentId: a.student_id,
        studentName: a.student_name,
        studentPrn: a.student_prn,
        studentEmail: a.student_email,
        studentCourse: a.student_course,
        studentCgpa: a.student_cgpa,
        appliedAt: a.applied_at,
        applicationStatus: a.application_status,
        tpoRemarks: a.tpo_remarks,
      }));
    }
  } catch (e) {
    // fallback
  }

  const local = getLocalApplications();
  return local.filter((a) => a.studentId === studentId);
}

// ── TPO / HOD: Fetch All Applications
export async function fetchAllApplications() {
  try {
    const { data, error } = await supabase
      .from('placement_applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((a) => ({
        id: a.id,
        driveId: a.drive_id,
        companyName: a.company_name || 'Campus Recruiter',
        jobTitle: a.job_title || 'Position',
        studentId: a.student_id,
        studentName: a.student_name,
        studentPrn: a.student_prn,
        studentEmail: a.student_email,
        studentCourse: a.student_course,
        studentCgpa: a.student_cgpa,
        appliedAt: a.applied_at,
        applicationStatus: a.application_status,
        tpoRemarks: a.tpo_remarks,
      }));
    }
  } catch (e) {
    // fallback
  }

  return getLocalApplications();
}

// ── TPO / HOD: Update Application Hiring Status
export async function updateApplicationStatus(applicationId, newStatus, remarks) {
  const local = getLocalApplications();
  const updated = local.map((a) =>
    a.id === applicationId
      ? { ...a, applicationStatus: newStatus, tpoRemarks: remarks || a.tpoRemarks }
      : a
  );
  saveLocalApplications(updated);

  try {
    await supabase
      .from('placement_applications')
      .update({
        application_status: newStatus,
        tpo_remarks: remarks,
      })
      .eq('id', applicationId);
  } catch (e) {
    console.warn('DB update application error:', e);
  }

  return { success: true };
}

// ── TPO / HOD: Create Placement Drive
export async function createPlacementDrive(driveData) {
  const newDrive = {
    id: 'drive-' + Date.now(),
    ...driveData,
    status: 'Active',
    created_at: new Date().toISOString(),
  };

  const currentDrives = getLocalDrives();
  const updated = [newDrive, ...currentDrives];
  saveLocalDrives(updated);

  try {
    await supabase.from('placement_drives').insert({
      company_name: driveData.companyName,
      company_logo: driveData.companyLogo,
      job_title: driveData.jobTitle,
      job_type: driveData.jobType,
      package_ctc: driveData.packageCtc,
      location: driveData.location,
      eligible_departments: driveData.eligibleDepartments,
      eligible_courses: driveData.eligibleCourses,
      min_cgpa: driveData.minCgpa,
      min_attendance: driveData.minAttendance,
      drive_date: driveData.driveDate,
      deadline: driveData.deadline,
      job_description: driveData.jobDescription,
      selection_rounds: driveData.selectionRounds,
      status: 'Active',
    });
  } catch (e) {
    console.warn('Supabase insert placement drive error:', e);
  }

  return { success: true, drive: newDrive };
}
