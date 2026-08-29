import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, CheckCircle2, XCircle, Clock, Search,
  ShieldCheck, LogOut, UserCheck, Megaphone,
  GraduationCap, Send, Trash2, Globe, Building2, AlertCircle,
  Edit3, Award, CreditCard, TrendingUp, Save, FileCheck, FileBadge,
  Briefcase, RefreshCw, Calendar, Plus, Edit, BookOpen, MapPin, User
} from 'lucide-react';
import {
  fetchStaffNotices, postNotice, archiveNotice, subscribeToNotices
} from '../../lib/noticesService';
import {
  fetchHODPendingApplications,
  reviewLeaveApplication
} from '../../lib/leaveService';
import { getTimetable, saveTimetable } from '../../lib/timetableService';
import StudentManager from './StudentManager';
import PlacementManager from './PlacementManager';
import { DocumentVerificationModal } from './StudentDocumentModals';
import QRScannerModal from './QRScannerModal';
import { ExamSeatingMatrixModal } from './ExamSeatingMatrixModal';
import './Dashboard.css';

const TAG_OPTIONS = [
  { value: 'exam',      label: '📋 Examination', tagLabel: 'Examination' },
  { value: 'urgent',    label: '🚨 Urgent',       tagLabel: 'Urgent' },
  { value: 'placement', label: '💼 Placement',    tagLabel: 'Placement' },
  { value: 'event',     label: '🎉 Event',        tagLabel: 'Event' },
  { value: 'sports',    label: '🏅 Sports',       tagLabel: 'Sports' },
  { value: 'general',   label: '📌 General',      tagLabel: 'General' },
];

const DEFAULT_SCHEDULE_FALLBACK = {
  Monday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Lab 4 (CS Building)', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea & Refreshment Break', faculty: '-', room: 'Campus Cafeteria', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-505P', subject: 'AI & Data Science Laboratory', faculty: 'Prof. S. Sharma', room: 'Advanced Computing Lab 2', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 03:15 PM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '03:15 PM - 04:15 PM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
  ],
  Tuesday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea & Refreshment Break', faculty: '-', room: 'Campus Cafeteria', type: 'Break' },
    { time: '11:30 AM - 12:30 PM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '12:30 PM - 01:30 PM', code: 'MCA-506S', subject: 'Research Seminar & Case Study', faculty: 'Prof. R. Deshmukh', room: 'Seminar Hall 1', type: 'Seminar' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 04:15 PM', code: 'MCA-507P', subject: 'Cloud Computing Practical Lab', faculty: 'Prof. S. Sharma', room: 'Lab 4 (CS Building)', type: 'Lab' },
  ],
  Wednesday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-508P', subject: 'Full Stack Web Engineering Lab', faculty: 'Dr. Ananya Roy', room: 'Web Tech Lab', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 03:15 PM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '03:15 PM - 04:15 PM', code: 'MCA-509E', subject: 'Sports Analytics & Biometrics (Elective)', faculty: 'Prof. Kulkarni', room: 'Sports AV Room', type: 'Elective' },
  ],
  Thursday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-504', subject: 'Software Architecture & Design', faculty: 'Prof. R. Deshmukh', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-503', subject: 'Advanced Database Systems', faculty: 'Dr. Ananya Roy', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:30 PM', code: 'MCA-510P', subject: 'DBMS Implementation & SQL Tuning', faculty: 'Dr. Ananya Roy', room: 'Lab 2', type: 'Lab' },
    { time: '01:30 PM - 02:15 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:15 PM - 04:15 PM', code: 'PROJECT', subject: 'Industry Major Project Mentorship', faculty: 'Dr. V. M. Thakare', room: 'Innovation Lab', type: 'Project' },
  ],
  Friday: [
    { time: '09:00 AM - 10:00 AM', code: 'MCA-501', subject: 'Cloud Computing & Virtualization', faculty: 'Prof. S. Sharma', room: 'Room 204', type: 'Theory' },
    { time: '10:00 AM - 11:00 AM', code: 'MCA-502', subject: 'Machine Learning & Neural Networks', faculty: 'Dr. V. M. Thakare', room: 'Room 204', type: 'Theory' },
    { time: '11:00 AM - 11:30 AM', code: 'RECESS', subject: 'Tea Break', faculty: '-', room: '-', type: 'Break' },
    { time: '11:30 AM - 01:00 PM', code: 'SPORTS', subject: 'Compulsory Physical Education & Yoga', faculty: 'Prof. S. Patil', room: 'Main Gymnasium Ground', type: 'Sports' },
    { time: '01:00 PM - 02:00 PM', code: 'LUNCH', subject: 'Lunch Recess', faculty: '-', room: '-', type: 'Break' },
    { time: '02:00 PM - 04:00 PM', code: 'PLACEMENT', subject: 'Placement Preparation & Mock Aptitude', faculty: 'T&P Cell Officers', room: 'Auditorium', type: 'Placement' },
  ],
  Saturday: [
    { time: '09:00 AM - 11:00 AM', code: 'MCA-511E', subject: 'Expert Guest Lecture / Tech Talk', faculty: 'Industry Guest Speaker', room: 'Main AV Hall', type: 'Seminar' },
    { time: '11:00 AM - 01:00 PM', code: 'LIBRARY', subject: 'Self-Study, Research & Library Hours', faculty: 'Librarian In-charge', room: 'Central Library', type: 'Study' },
  ],
};

export default function HODDashboard({ onBackToHome }) {
  const {
    currentUser,
    students,
    refreshStudents,
    approveStudent,
    rejectStudent,
    updateStudentAcademicRecord,
    updateStudentDocuments,
    logout
  } = useAuth();

  // ── Seating Matrix Modal state
  const [showSeatingMatrixModal, setShowSeatingMatrixModal] = useState(false);

  // ── Student approval state
  const [filterStatus, setFilterStatus] = useState('all');
  const [deptScope, setDeptScope] = useState('all'); // 'all' | 'mine' | specific dept_id
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalStudent, setRejectModalStudent] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isRefreshingStudents, setIsRefreshingStudents] = useState(false);

  const handleRefreshRecords = async () => {
    setIsRefreshingStudents(true);
    if (refreshStudents) await refreshStudents();
    setIsRefreshingStudents(false);
  };

  useEffect(() => {
    if (refreshStudents) refreshStudents();
  }, [refreshStudents]);

  // Document verification modal state
  const [verificationStudent, setVerificationStudent] = useState(null);

  // ── Student Academic Record Edit Modal state
  const [editModalStudent, setEditModalStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    attendance: '90.0%',
    cgpa: '8.50',
    feesStatus: 'Paid',
    rollNo: '',
    hallTicketApproved: false,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ── Tab switcher
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'notices' | 'manage' | 'placement' | 'leaves' | 'timetable'
  const [selectedForManageId, setSelectedForManageId] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // ── HOD Timetable Management States
  const [timetableCourse, setTimetableCourse] = useState('MCA');
  const [timetableDay, setTimetableDay] = useState('Monday');
  const [timetableLectures, setTimetableLectures] = useState([]);
  const [isSavingTimetable, setIsSavingTimetable] = useState(false);
  const [timetableSaveStatus, setTimetableSaveStatus] = useState(null);
  const [editingLectureIdx, setEditingLectureIdx] = useState(null);
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  
  const [lectureForm, setLectureForm] = useState({
    time: '09:00 AM - 10:00 AM',
    code: '',
    subject: '',
    faculty: '',
    room: '',
    type: 'Theory',
  });

  // ── HOD Leaves state
  const [hodLeaves, setHodLeaves] = useState([]);
  const [hodLeavesLoading, setHodLeavesLoading] = useState(false);
  const [hodLeaveToast, setHodLeaveToast] = useState(null);

  // Document Viewer Modal
  const [viewProofUrl, setViewProofUrl] = useState(null);
  const [viewProofName, setViewProofName] = useState('');

  const loadHodLeaves = async () => {
    setHodLeavesLoading(true);
    const list = await fetchHODPendingApplications(currentUser?.department || 'cs');
    setHodLeaves(list);
    setHodLeavesLoading(false);
  };

  useEffect(() => {
    loadHodLeaves();
  }, [currentUser]);

  // Load HOD Timetable
  useEffect(() => {
    async function loadTimetable() {
      if (!currentUser?.department) return;
      try {
        const res = await getTimetable(currentUser.department, timetableCourse, timetableDay);
        if (res && Array.isArray(res)) {
          setTimetableLectures(res);
        } else {
          // Pre-fill fallback if MCA
          if (currentUser.department === 'cs' && timetableCourse === 'MCA') {
            setTimetableLectures(DEFAULT_SCHEDULE_FALLBACK[timetableDay] || []);
          } else {
            setTimetableLectures([]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (activeTab === 'timetable') {
      loadTimetable();
    }
  }, [timetableCourse, timetableDay, activeTab, currentUser]);

  const handleSaveTimetable = async () => {
    if (!currentUser?.department) return;
    setIsSavingTimetable(true);
    setTimetableSaveStatus(null);

    const res = await saveTimetable(
      currentUser.department,
      timetableCourse,
      timetableDay,
      timetableLectures
    );
    setIsSavingTimetable(false);
    if (res.success) {
      setTimetableSaveStatus({ type: 'success', text: '✅ Timetable day schedule saved successfully!' });
      setTimeout(() => setTimetableSaveStatus(null), 4000);
    } else {
      setTimetableSaveStatus({ type: 'error', text: `Failed to save: ${res.message}` });
    }
  };

  const handleAddLecture = () => {
    setEditingLectureIdx(null);
    setLectureForm({
      time: '09:00 AM - 10:00 AM',
      code: '',
      subject: '',
      faculty: '',
      room: '',
      type: 'Theory',
    });
    setShowAddLectureModal(true);
  };

  const handleEditLecture = (idx) => {
    const lecture = timetableLectures[idx];
    setEditingLectureIdx(idx);
    setLectureForm({ ...lecture });
    setShowAddLectureModal(true);
  };

  const handleDeleteLecture = (idx) => {
    setTimetableLectures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLectureFormSubmit = (e) => {
    e.preventDefault();
    if (editingLectureIdx !== null) {
      // Update
      setTimetableLectures(prev => prev.map((item, idx) => idx === editingLectureIdx ? lectureForm : item));
    } else {
      // Create new
      setTimetableLectures(prev => [...prev, lectureForm]);
    }
    setShowAddLectureModal(false);
    setEditingLectureIdx(null);
  };

  // Attendance Warning Letter State
  const [warningStudent, setWarningStudent] = useState(null);

  // Export student list to Excel/CSV
  const handleExportStudentsCSV = () => {
    const headers = [
      'Student Name',
      'PRN',
      'Roll Number',
      'Email',
      'Course',
      'Year',
      'Department',
      'Attendance',
      'CGPA',
      'Fees Status',
      'Registration Status'
    ];

    const rows = filteredList.map(s => [
      s.name,
      s.prn,
      s.rollNo || 'Pending',
      s.email,
      s.course,
      s.year,
      s.departmentName,
      s.attendance || '0.0%',
      s.cgpa || 'N/A',
      s.feesStatus || 'Pending',
      s.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DCPE_Student_Roster_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHodReview = async (appId, decision) => {
    const app = hodLeaves.find((a) => a.id === appId);
    const isLong = app && (app.requiresPrincipal || app.totalDays >= 10);

    const remarks = decision === 'approve'
      ? (isLong
          ? 'Endorsed by HOD. Forwarded to Principal / Registrar for executive sanction (10+ days).'
          : 'Verified and officially sanctioned by Head of Department.')
      : 'Application rejected by Head of Department.';

    const res = await reviewLeaveApplication({
      applicationId: appId,
      stage: 'hod',
      decision,
      reviewerName: currentUser.name || 'Head of Department',
      remarks,
    });

    if (res.success) {
      const parentEmail = `parent.${app?.studentName?.toLowerCase()?.replace(/\s+/g, '') || 'guardian'}@gmail.com`;
      setHodLeaveToast({
        type: 'success',
        text: (decision === 'approve'
          ? (isLong
              ? '⚠️ 10+ Days Leave: Endorsed and forwarded to Principal!'
              : '✅ Leave officially sanctioned and approved!')
          : '❌ Application rejected.') + ` 📧 Guardian Email Alert sent to: ${parentEmail} ✓`,
      });
      await loadHodLeaves();
      setTimeout(() => setHodLeaveToast(null), 7000);
    }
  };

  const handleOpenManager = (student) => {
    setSelectedForManageId(student.id);
    setActiveTab('manage');
  };

  // ── Notice publisher state
  const [myNotices, setMyNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    body: '',
    tag: 'general',
    scope: 'department',
  });
  const [isPosting, setIsPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);

  if (!currentUser) return null;

  // ── Dept filtering for student table
  const safeStudents = students || [];
  const deptStudents = deptScope === 'all'
    ? safeStudents
    : deptScope === 'mine'
      ? safeStudents.filter((s) => s.department === currentUser?.department)
      : safeStudents.filter((s) => s.department === deptScope);

  const pendingCount  = deptStudents.filter((s) => s.status === 'pending').length;
  const approvedCount = deptStudents.filter((s) => s.status === 'approved').length;
  const rejectedCount = deptStudents.filter((s) => s.status === 'rejected').length;

  const totalCollegePending = safeStudents.filter((s) => s.status === 'pending').length;
  const otherDeptsPending = totalCollegePending - (safeStudents.filter((s) => s.department === currentUser?.department && s.status === 'pending').length);

  const filteredList = deptStudents.filter((s) => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ── Load HOD's own notices
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const load = async () => {
      const data = await fetchStaffNotices(currentUser.id);
      setMyNotices(data);
      setNoticesLoading(false);
    };
    load();

    const unsubscribe = subscribeToNotices(() => load());
    return unsubscribe;
  }, [currentUser.id]);

  // ── Student approval handlers
  const handleApprove = async (student) => {
    setIsActionPending(true);
    await approveStudent(student.id, currentUser.name);
    setIsActionPending(false);
    setActionSuccessToast(`✅ Student ${student.name} (${student.prn}) has been APPROVED! They can now log into their student dashboard.`);
    setTimeout(() => setActionSuccessToast(null), 5000);
  };

  const handleOpenReject = (student) => {
    setRejectModalStudent(student);
    setRejectReason('Enrollment documents / PRN not verified in the department admission register.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalStudent) return;
    setIsActionPending(true);
    await rejectStudent(rejectModalStudent.id, rejectReason);
    setIsActionPending(false);
    setActionSuccessToast(`❌ Registration for ${rejectModalStudent.name} has been REJECTED.`);
    setRejectModalStudent(null);
    setRejectReason('');
    setTimeout(() => setActionSuccessToast(null), 5000);
  };

  // ── Student Academic Record Edit Handlers
  const handleOpenEdit = (student) => {
    setEditModalStudent(student);
    setEditForm({
      attendance: student.attendance || '90.0%',
      cgpa: student.cgpa || '8.50',
      feesStatus: student.feesStatus || 'Paid',
      rollNo: student.rollNo || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModalStudent) return;
    setIsSavingEdit(true);
    const res = await updateStudentAcademicRecord(editModalStudent.id, editForm);
    setIsSavingEdit(false);

    if (res.success) {
      setActionSuccessToast(`✅ Academic & Fee records for ${editModalStudent.name} (${editModalStudent.prn}) updated successfully!`);
      setEditModalStudent(null);
      setTimeout(() => setActionSuccessToast(null), 5000);
    } else {
      setActionSuccessToast(`❌ Failed to update academic record: ${res.message}`);
      setTimeout(() => setActionSuccessToast(null), 5000);
    }
  };

  // ── Notice publisher handlers
  const handleNoticeChange = (e) => {
    setNoticeForm({ ...noticeForm, [e.target.name]: e.target.value });
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setPostResult(null);

    if (!noticeForm.title.trim() || !noticeForm.body.trim()) {
      setPostResult({ type: 'error', text: 'Please fill in both the title and body.' });
      return;
    }

    setIsPosting(true);
    const tagObj = TAG_OPTIONS.find((t) => t.value === noticeForm.tag);
    const res = await postNotice(
      currentUser.id,
      currentUser.department,
      noticeForm.title,
      noticeForm.body,
      noticeForm.tag,
      tagObj?.tagLabel || 'General',
      noticeForm.scope,
    );
    setIsPosting(false);

    if (res.success) {
      setNoticeForm({ title: '', body: '', tag: 'general', scope: 'department' });
      setPostResult({ type: 'success', text: '📢 Notice published! It is now live on the landing page and student dashboards.' });
      setTimeout(() => setPostResult(null), 5000);
    } else {
      setPostResult({ type: 'error', text: res.message || 'Failed to post notice.' });
    }
  };

  const handleArchive = async (noticeId) => {
    await archiveNotice(noticeId);
  };

  return (
    <div className="dashboard-container">
      <div className="container">

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="user-avatar-badge hod">HOD</div>
            <div className="user-meta">
              <h2>{currentUser.name}</h2>
              <p>
                {currentUser.designation} • <strong>{currentUser.departmentName}</strong>
              </p>
              <div className="user-role-tag hod">
                <ShieldCheck size={12} />
                Head of Department Portal
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-outline-dark btn-sm" onClick={onBackToHome}>
              College Website
            </button>
            <button className="btn btn-primary btn-sm" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Action Toast Alert */}
        {actionSuccessToast && (
          <div className="alert-message success" style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={20} />
            <div>{actionSuccessToast}</div>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon purple"><Users size={24} /></div>
            <div className="kpi-details">
              <span>Total Department Students</span>
              <h3>{deptStudents.length}</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #d97706' }}>
            <div className="kpi-icon warning"><Clock size={24} /></div>
            <div className="kpi-details">
              <span>Pending Approvals</span>
              <h3 style={{ color: '#d97706' }}>{pendingCount}</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #059669' }}>
            <div className="kpi-icon success"><CheckCircle2 size={24} /></div>
            <div className="kpi-details">
              <span>Approved &amp; Active</span>
              <h3 style={{ color: '#059669' }}>{approvedCount}</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div className="kpi-icon primary"><XCircle size={24} /></div>
            <div className="kpi-details">
              <span>Rejected / Incomplete</span>
              <h3 style={{ color: '#dc2626' }}>{rejectedCount}</h3>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="hod-tab-bar">
          <button
            className={`hod-tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <UserCheck size={16} />
            Student Approvals
            {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
          </button>

          <button
            className={`hod-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <GraduationCap size={16} />
            Academic &amp; Fee Manager Page
          </button>

          <button
            className={`hod-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <Megaphone size={16} />
            Post Notices
            {myNotices.length > 0 && (
              <span className="tab-badge" style={{ background: '#059669' }}>
                {myNotices.length}
              </span>
            )}
          </button>

          <button
            className={`hod-tab-btn ${activeTab === 'placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('placement')}
          >
            <Briefcase size={16} />
            T&amp;P Placements
          </button>

          <button
            className={`hod-tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Clock size={16} />
            Leaves &amp; Grievances
            {hodLeaves.length > 0 && (
              <span className="tab-badge" style={{ background: '#d97706' }}>
                {hodLeaves.length}
              </span>
            )}
          </button>

          <button
            className={`hod-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`}
            onClick={() => setActiveTab('timetable')}
          >
            <Calendar size={16} />
            Department Timetables
          </button>

          <button
            className={`hod-tab-btn ${showSeatingMatrixModal ? 'active' : ''}`}
            onClick={() => setShowSeatingMatrixModal(true)}
          >
            <Building2 size={16} />
            Exam Seating Matrix 🪑
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 1: Student Approval Portal            */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'approvals' && (
          <div className="dashboard-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div className="panel-title">
                  <UserCheck size={22} color="var(--primary)" />
                  Student Registration Verification &amp; Approvals
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Review and approve newly registered students before granting ERP login access
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Department Selector */}
                <select
                  className="form-select"
                  style={{ width: 'auto', fontSize: '12px', padding: '6px 12px', fontWeight: 600 }}
                  value={deptScope}
                  onChange={(e) => setDeptScope(e.target.value)}
                >
                  <option value="all">🏫 All College Departments ({students.length})</option>
                  <option value="mine">📌 My Department ({students.filter((s) => s.department === currentUser.department).length})</option>
                  <option value="cs">💻 P.G. Dept. of Computer Science &amp; Tech</option>
                  <option value="science">🔬 Department of Science (BCA)</option>
                  <option value="phy-ed">🏅 Dept. of Physical Education (B.P.Ed)</option>
                  <option value="commerce">📊 Department of Commerce (BBA)</option>
                  <option value="yoga">🧘 Department of Yoga &amp; Naturopathy</option>
                  <option value="vocational">🛠️ Dept. of Vocational &amp; Skill Ed</option>
                </select>

                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #10b981', color: '#047857', background: '#ecfdf5' }}
                  onClick={() => setShowQRScanner(true)}
                  title="Open webcam QR Code scanner to verify student admit status"
                >
                  🛡️ Scan Gatepass QR
                </button>

                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  onClick={handleRefreshRecords}
                  disabled={isRefreshingStudents}
                  title="Reload students from database"
                >
                  <RefreshCw size={14} className={isRefreshingStudents ? 'spin-anim' : ''} />
                  {isRefreshingStudents ? 'Refreshing...' : 'Refresh 🔄'}
                </button>
              </div>
            </div>

            {/* Other Departments Pending Notification */}
            {otherDeptsPending > 0 && deptScope === 'mine' && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#92400e',
                }}
              >
                <span>
                  💡 <strong>Cross-Department Notice:</strong> There are <strong>{otherDeptsPending} student(s)</strong> awaiting approval in other college departments (e.g. Science / Physical Ed).
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => setDeptScope('all')}
                >
                  View All Departments →
                </button>
              </div>
            )}

            {/* Filter Tabs & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all',      label: `All (${deptStudents.length})` },
                  { key: 'pending',  label: `Pending (${pendingCount})` },
                  { key: 'approved', label: `Approved (${approvedCount})` },
                  { key: 'rejected', label: `Rejected (${rejectedCount})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`btn btn-sm ${filterStatus === f.key ? 'btn-primary' : 'btn-white'}`}
                    onClick={() => setFilterStatus(f.key)}
                    style={{ position: 'relative' }}
                  >
                    {f.label}
                    {f.key === 'pending' && pendingCount > 0 && (
                      <span style={{ width: 8, height: 8, background: '#d97706', borderRadius: '50%', display: 'inline-block', marginLeft: 4 }} />
                    )}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '240px' }}>
                <div className="form-input-wrap" style={{ flex: 1 }}>
                  <span className="form-input-icon"><Search size={16} /></span>
                  <input
                    type="text"
                    placeholder="Search by Student Name, PRN, Email, or Course..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', height: '42px', padding: '0 16px', borderRadius: '10px' }}
                  onClick={handleExportStudentsCSV}
                  title="Export filtered student list to CSV file"
                >
                  📥 Export (CSV)
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>PRN &amp; Roll No</th>
                    <th>Course &amp; Year</th>
                    <th>Academic &amp; Fee Status</th>
                    <th>Contact Details</th>
                    <th>HOD Status</th>
                    <th style={{ textAlign: 'center' }}>Approval &amp; Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        No student registration records found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                style={{ width: 34, height: 34, borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)', flexShrink: 0 }}
                              />
                            ) : (
                              <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0 }}>
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <strong style={{ color: 'var(--text-heading)', display: 'block', lineHeight: 1.2 }}>{student.name}</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.departmentName}</span>
                                <span>•</span>
                                <button
                                  type="button"
                                  style={{
                                    fontSize: '11px',
                                    color: '#059669',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                  }}
                                  onClick={() => setVerificationStudent(student)}
                                  title="Inspect and verify student admission documents & photo"
                                >
                                  <FileCheck size={12} />
                                  Docs: {student.docStatus === 'Verified ✓' ? 'Verified ✓' : 'Inspect'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code style={{ background: 'var(--bg-body)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-block', marginBottom: '3px' }}>
                            {student.prn}
                          </code>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Roll: <strong style={{ color: 'var(--text-heading)' }}>{student.rollNo || 'Pending Assignment'}</strong>
                          </div>
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: '13px' }}>{student.course}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{student.year}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Attendance:</span>{' '}
                              <strong style={{ color: parseFloat(student.attendance) >= 75 ? '#059669' : '#d97706' }}>
                                {student.attendance || '0.0%'}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>CGPA:</span>{' '}
                              <strong style={{ color: 'var(--text-heading)' }}>{student.cgpa || 'N/A'}</strong>
                            </div>
                            <div>
                              <span
                                className={`status-pill ${
                                  student.feesStatus?.toLowerCase().includes('paid') && !student.feesStatus?.toLowerCase().includes('unpaid')
                                    ? 'approved'
                                    : 'pending'
                                }`}
                                style={{ fontSize: '10px', padding: '1px 6px' }}
                              >
                                Fee: {student.feesStatus || 'Pending'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>{student.email}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.phone}</div>
                        </td>
                        <td>
                          <span className={`status-pill ${student.status}`}>
                            {student.status === 'approved' && <CheckCircle2 size={12} />}
                            {student.status === 'pending'  && <Clock size={12} />}
                            {student.status === 'rejected' && <XCircle size={12} />}
                            {student.status}
                          </span>
                          {student.approvedBy && (
                            <div style={{ fontSize: '10px', color: '#047857', marginTop: '2px' }}>By {student.approvedBy}</div>
                          )}
                          {student.rejectionReason && (
                            <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: '2px' }}>Note: {student.rejectionReason}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {student.status === 'pending' && (
                            <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                              <button
                                className="btn-table-action btn-table-approve"
                                onClick={() => handleApprove(student)}
                                disabled={isActionPending}
                              >
                                <CheckCircle2 size={13} />
                                {isActionPending ? '...' : 'Approve'}
                              </button>
                              <button
                                className="btn-table-action btn-table-reject"
                                onClick={() => handleOpenReject(student)}
                                disabled={isActionPending}
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                          )}
                          {student.status === 'approved' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#059669' }}
                                onClick={() => setVerificationStudent(student)}
                                title="Inspect real uploaded admission certificates & documents"
                              >
                                <FileBadge size={13} />
                                Inspect Docs
                              </button>
                               <button
                                 className="btn btn-outline-dark btn-sm"
                                 style={{ fontSize: '11px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                 onClick={() => handleOpenManager(student)}
                                 title="Open Dedicated Student Academic & Fee Manager Page"
                               >
                                 <Edit3 size={12} />
                                 Manage Record
                               </button>
                               {parseFloat(student.attendance || '0') < 75 && (
                                 <button
                                   className="btn btn-outline-dark btn-sm"
                                   style={{ fontSize: '11px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb' }}
                                   onClick={() => setWarningStudent(student)}
                                   title="Print Official Attendance shortage warning letter for this student"
                                 >
                                   ⚠️ Warning Letter
                                 </button>
                               )}
                             </div>
                          )}
                          {student.status === 'rejected' && (
                            <button
                              className="btn btn-outline-dark btn-sm"
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                              onClick={() => handleApprove(student)}
                            >
                              Re-Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 2: Dedicated Student Manager Page     */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'manage' && (
          <StudentManager
            students={deptStudents}
            onUpdateStudent={updateStudentAcademicRecord}
            onBackToTable={() => setActiveTab('approvals')}
            initialSelectedId={selectedForManageId}
          />
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 3: Notice Publisher                   */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'notices' && (
          <div>
            {/* Compose Form */}
            <div className="dashboard-panel" style={{ marginBottom: '24px' }}>
              <div className="panel-header">
                <div className="panel-title">
                  <Megaphone size={22} color="var(--primary)" />
                  Compose &amp; Publish Notice
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Published notices appear live on the college landing page and student dashboards
                </div>
              </div>

              {postResult && (
                <div className={`alert-message ${postResult.type}`} style={{ marginBottom: '20px' }}>
                  {postResult.type === 'success'
                    ? <CheckCircle2 size={20} />
                    : <AlertCircle size={20} />}
                  <div>{postResult.text}</div>
                </div>
              )}

              <form onSubmit={handlePostNotice}>
                <div className="notice-compose-area">
                  {/* Title */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Notice Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      placeholder="e.g. Internal Assessment Timetable Released"
                      value={noticeForm.title}
                      onChange={handleNoticeChange}
                      required
                    />
                  </div>

                  {/* Body */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Notice Body *</label>
                    <textarea
                      name="body"
                      className="form-input"
                      style={{ height: '100px', resize: 'vertical' }}
                      placeholder="Full notice details — students will read this..."
                      value={noticeForm.body}
                      onChange={handleNoticeChange}
                      required
                    />
                  </div>

                  {/* Tag + Scope */}
                  <div className="notice-tag-select-grid">
                    <div className="form-group">
                      <label className="form-label">Category / Tag</label>
                      <div className="form-input-wrap">
                        <select name="tag" className="form-select" value={noticeForm.tag} onChange={handleNoticeChange}>
                          {TAG_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Audience / Scope</label>
                      <div className="form-input-wrap">
                        <select name="scope" className="form-select" value={noticeForm.scope} onChange={handleNoticeChange}>
                          <option value="department">🏛 My Department Only</option>
                          <option value="college">🌐 College-Wide (All Students)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPosting}
                    style={{ padding: '12px 28px' }}
                  >
                    <Send size={16} />
                    {isPosting ? 'Publishing...' : 'Publish Notice'}
                  </button>
                </div>
              </form>
            </div>

            {/* My Published Notices */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <GraduationCap size={20} color="var(--primary)" />
                  Your Published Notices
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {myNotices.length} active notice{myNotices.length !== 1 ? 's' : ''}
                </span>
              </div>

              {noticesLoading ? (
                <div className="hod-notice-list">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div className="hod-notice-card" key={i}>
                      <div style={{ flex: 1 }}>
                        <div className="skeleton-box" style={{ height: 14, width: '60%', borderRadius: 4, marginBottom: 8 }} />
                        <div className="skeleton-box" style={{ height: 11, width: '80%', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : myNotices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Megaphone size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <p>No notices published yet. Use the form above to post your first notice!</p>
                </div>
              ) : (
                <div className="hod-notice-list">
                  {myNotices.map((notice) => (
                    <div className="hod-notice-card" key={notice.id}>
                      <div className="hod-notice-card-body">
                        <div className="hod-notice-card-title">{notice.title}</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>
                          {notice.body.length > 120 ? notice.body.slice(0, 120) + '...' : notice.body}
                        </p>
                        <div className="hod-notice-card-meta">
                          <span className={`notice-tag ${notice.tag}`}>{notice.tagLabel}</span>
                          {notice.scope === 'college'
                            ? <span style={{ fontSize: '11px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}><Globe size={11} /> College-Wide</span>
                            : <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={11} /> Dept Only</span>
                          }
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notice.day} {notice.month}</span>
                        </div>
                      </div>
                      <button
                        className="btn-archive"
                        onClick={() => handleArchive(notice.id)}
                        title="Archive this notice"
                      >
                        <Trash2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Archive
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 4: Training & Placement (T&P) Console */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'placement' && (
          <PlacementManager />
        )}

        {/* Rejection Modal */}
        {rejectModalStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px', color: '#dc2626' }}>
                Reject Student Registration
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                You are rejecting the registration of <strong>{rejectModalStudent.name}</strong> (PRN: {rejectModalStudent.prn}). The student will see this reason when trying to log in.
              </p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Rejection Reason / Note *</label>
                <textarea
                  rows="3"
                  className="form-input"
                  style={{ height: 'auto' }}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify why the registration is rejected..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-outline-dark btn-sm" onClick={() => setRejectModalStudent(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" style={{ background: '#dc2626' }} onClick={handleConfirmReject}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Academic & Fees Record Modal ── */}
        {editModalStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '520px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Edit3 size={22} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                    Edit Academic &amp; Fee Record
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <strong>{editModalStudent.name}</strong> • PRN: <code>{editModalStudent.prn}</code>
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  
                  {/* Roll Number */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} color="var(--primary)" /> College Roll Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. MCA-26-042"
                      value={editForm.rollNo}
                      onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                    />
                  </div>

                  {/* Attendance % */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={14} color="#059669" /> Overall Attendance %
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 91.5%"
                      value={editForm.attendance}
                      onChange={(e) => setEditForm({ ...editForm, attendance: e.target.value })}
                    />
                  </div>

                  {/* CGPA */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={14} color="#7c3aed" /> Cumulative CGPA
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 8.75 or N/A"
                      value={editForm.cgpa}
                      onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    />
                  </div>

                  {/* Semester Fee Status */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CreditCard size={14} color="#2563eb" /> Semester Fee Status
                    </label>
                    <select
                      className="form-select"
                      value={editForm.feesStatus}
                      onChange={(e) => setEditForm({ ...editForm, feesStatus: e.target.value })}
                    >
                      <option value="Paid ✓">Paid ✓</option>
                      <option value="Partial (50% Paid)">Partial (50% Paid)</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Unpaid Surcharge">Unpaid Surcharge</option>
                    </select>
                  </div>

                </div>

                {/* Hall Ticket Clearance Checkbox */}
                <div
                  style={{
                    background: editForm.hallTicketApproved ? '#ecfdf5' : '#fffbeb',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: editForm.hallTicketApproved ? '1px solid #a7f3d0' : '1px solid #fde68a',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', color: 'var(--text-heading)' }}>
                    <input
                      type="checkbox"
                      checked={editForm.hallTicketApproved}
                      onChange={(e) => setEditForm({ ...editForm, hallTicketApproved: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#059669', cursor: 'pointer' }}
                    />
                    Authorize Examination Hall Ticket Download
                  </label>
                  <span className={`status-pill ${editForm.hallTicketApproved ? 'approved' : 'pending'}`} style={{ fontSize: '10px' }}>
                    {editForm.hallTicketApproved ? 'Authorized ✓' : 'Locked'}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  💡 <strong>Live Update Notice:</strong> Changes saved here will be immediately reflected on the student's personal portal upon saving!
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setEditModalStudent(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingEdit}>
                    <Save size={14} />
                    {isSavingEdit ? 'Saving Changes...' : 'Save Academic Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 5: Student Leaves & Grievances         */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'leaves' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Clock size={22} color="var(--primary)" />
                  Level-2 HOD Endorsements: Student Leaves &amp; Grievance Applications
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Review teacher-endorsed applications. Approving leaves &lt;10 days sanctions them immediately; leaves of 10+ days automatically route to the <strong>Principal / Registrar</strong> for final executive sanction.
                </p>
              </div>
              <button className="btn btn-white btn-sm" onClick={loadHodLeaves}>
                Refresh List
              </button>
            </div>

            {hodLeaveToast && (
              <div className={`alert-message ${hodLeaveToast.type}`} style={{ marginBottom: '16px' }}>
                {hodLeaveToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{hodLeaveToast.text}</div>
              </div>
            )}

            {hodLeavesLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading pending HOD applications...
              </div>
            ) : hodLeaves.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-body)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                <CheckCircle2 size={40} color="#059669" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', margin: '0 0 4px' }}>All Clear! No Pending HOD Endorsements</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  There are currently no student applications awaiting department HOD endorsement.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {hodLeaves.map((app) => {
                  const isLong = app.requiresPrincipal || app.totalDays >= 10;
                  return (
                    <div
                      key={app.id}
                      style={{
                        background: 'white',
                        border: isLong ? '1px solid #fecaca' : '1px solid var(--border-light)',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: app.type === 'leave' ? '#e0e7ff' : '#fef3c7',
                                color: app.type === 'leave' ? '#3730a3' : '#92400e',
                              }}
                            >
                              {app.type === 'leave' ? '🏖️ Leave Application' : '📢 Grievance / Complaint'}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Submitted {app.createdAt}
                            </span>
                            {isLong ? (
                              <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px' }}>
                                ⚠️ 10+ Days Leave (Principal Final Sanction Required)
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px' }}>
                                Standard &lt; 10 Days (Finalized by HOD)
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px' }}>
                            {app.studentName} <code style={{ fontSize: '12px', fontWeight: 600 }}>({app.prn} • Roll {app.rollNo})</code>
                          </h4>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            <strong>{app.course}</strong> • Category: <strong>{app.category}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                            {app.totalDays} Day(s)
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {app.startDate} to {app.endDate}
                          </div>
                        </div>
                      </div>

                      {/* Teacher Endorsement Badge */}
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#065f46', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                        <div>
                          <strong>Level-1 Teacher Verified:</strong> {app.teacherApproval?.reviewedBy || 'Faculty Class Mentor'} on {app.teacherApproval?.reviewedAt || 'Earlier'}
                          <div style={{ fontSize: '11px', color: '#047857' }}>
                            "{app.teacherApproval?.remarks || 'Recommended by Faculty'}"
                          </div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-body)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Reason:</strong> {app.reason}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '6px' }}>
                          <span>Emergency Contact: <strong>{app.emergencyContact}</strong></span>
                          {app.attachmentName && (
                            app.attachmentUrl ? (
                              <button
                                type="button"
                                onClick={() => { setViewProofUrl(app.attachmentUrl); setViewProofName(app.attachmentName); }}
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                📎 View Proof
                              </button>
                            ) : (
                              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                📎 Proof: {app.attachmentName}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-white btn-sm"
                          style={{ color: '#b91c1c', border: '1px solid #fecaca' }}
                          onClick={() => handleHodReview(app.id, 'reject')}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isLong ? 'linear-gradient(135deg, #b91c1c, #991b1b)' : undefined }}
                          onClick={() => handleHodReview(app.id, 'approve')}
                        >
                          <CheckCircle2 size={15} />
                          {isLong ? 'Approve & Forward to Principal (10+ Days) →' : 'Approve & Sanction Leave ✓'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 6: Department Timetable Editor        */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'timetable' && (
          <div className="dashboard-panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div className="panel-title">
                  <Calendar size={22} color="var(--primary)" />
                  Department Timetable Scheduler
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Manage, reschedule, and edit the live timetable for your department's courses
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={handleAddLecture}>
                  <Plus size={16} /> Add Lecture / Event
                </button>
              </div>
            </div>

            {/* Course & Day Selectors */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Course</span>
                <select className="form-select" style={{ width: '160px', padding: '8px 12px' }} value={timetableCourse} onChange={(e) => setTimetableCourse(e.target.value)}>
                  <option value="MCA">MCA (Comp. Sci.)</option>
                  <option value="BCA">BCA (Comp. Sci.)</option>
                  <option value="BSC">B.Sc (Comp. Sci.)</option>
                  <option value="BPED">B.P.Ed (Physical Ed)</option>
                  <option value="BBA">BBA (Commerce)</option>
                  <option value="VOC">B.Voc (Software Dev)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Day</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTimetableDay(d)}
                      className={`btn btn-sm ${timetableDay === d ? 'btn-primary' : 'btn-white'}`}
                      style={{ padding: '6px 12px', borderRadius: '6px' }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {timetableSaveStatus && (
              <div className={`alert-message ${timetableSaveStatus.type}`} style={{ marginBottom: '16px' }}>
                {timetableSaveStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{timetableSaveStatus.text}</div>
              </div>
            )}

            {/* Timetable List Grid */}
            <div className="table-responsive" style={{ border: '1px solid var(--border-light)', borderRadius: '12px' }}>
              <table className="custom-table" style={{ background: 'white' }}>
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Code</th>
                    <th>Subject Name</th>
                    <th>Faculty In-Charge</th>
                    <th>Room / Lab</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetableLectures.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No lectures scheduled for {timetableDay} on this course. Click "Add Lecture" to set one up.
                      </td>
                    </tr>
                  ) : (
                    timetableLectures.map((lec, idx) => (
                      <tr key={idx} style={{ background: lec.type === 'Break' ? '#f8fafc' : undefined }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-heading)' }}>
                            <Clock size={14} color="var(--primary)" />
                            {lec.time}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            background: lec.type === 'Break' ? '#e2e8f0' : 'var(--primary-50)',
                            color: lec.type === 'Break' ? '#475569' : 'var(--primary)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {lec.code || 'BREAK'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{lec.subject}</td>
                        <td>{lec.faculty || '-'}</td>
                        <td>
                          {lec.room ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <MapPin size={12} />
                              {lec.room}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          <span className={`status-pill ${
                            lec.type === 'Theory' ? 'approved' :
                            lec.type === 'Lab' ? 'pending' : 'completed'
                          }`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                            {lec.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button className="action-btn" type="button" onClick={() => handleEditLecture(idx)} title="Edit Lecture" style={{ color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer' }}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn" type="button" onClick={() => handleDeleteLecture(idx)} title="Delete Lecture" style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={async () => {
                  if (confirm('Discard changes and reload original timetable?')) {
                    const res = await getTimetable(currentUser.department, timetableCourse, timetableDay);
                    setTimetableLectures(res || (currentUser.department === 'cs' && timetableCourse === 'MCA' ? DEFAULT_SCHEDULE_FALLBACK[timetableDay] : []));
                  }
                }}
              >
                Reset Changes
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveTimetable}
                disabled={isSavingTimetable}
              >
                <Save size={15} /> {isSavingTimetable ? 'Saving Schedule...' : 'Save Timetable Changes ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── Add / Edit Lecture Modal ── */}
        {showAddLectureModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <Calendar size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  {editingLectureIdx !== null ? 'Modify Lecture Slot' : 'Schedule New Lecture / Slot'}
                </h3>
              </div>

              <form onSubmit={handleLectureFormSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Time Slot *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 09:00 AM - 10:00 AM"
                      value={lectureForm.time}
                      onChange={(e) => setLectureForm({ ...lectureForm, time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={lectureForm.type}
                      onChange={(e) => setLectureForm({ ...lectureForm, type: e.target.value })}
                    >
                      <option value="Theory">Theory Lecture</option>
                      <option value="Lab">Practical Lab</option>
                      <option value="Seminar">Research Seminar</option>
                      <option value="Break">Recess / Break</option>
                      <option value="Elective">Elective / Options</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Subject Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. MCA-501"
                      value={lectureForm.code}
                      onChange={(e) => setLectureForm({ ...lectureForm, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject / Slot Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cloud Computing"
                      value={lectureForm.subject}
                      onChange={(e) => setLectureForm({ ...lectureForm, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Faculty Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Prof. S. Sharma"
                      value={lectureForm.faculty}
                      onChange={(e) => setLectureForm({ ...lectureForm, faculty: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room / Laboratory</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lab 4 / Room 204"
                      value={lectureForm.room}
                      onChange={(e) => setLectureForm({ ...lectureForm, room: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => setShowAddLectureModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingLectureIdx !== null ? 'Apply Changes ✓' : 'Add to Schedule +'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Document Verification & Inspection Modal ── */}
        {verificationStudent && (
          <DocumentVerificationModal
            student={verificationStudent}
            onUpdateStatus={updateStudentDocuments}
            onClose={() => setVerificationStudent(null)}
          />
        )}

        {/* ── Attendance Warning Letter Printable Modal ── */}
        {warningStudent && (
          <div
            className="no-print-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              overflowY: 'auto'
            }}
            onClick={() => setWarningStudent(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '720px',
                width: '100%',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Action Bar (Hidden during print) */}
              <div
                className="no-print"
                style={{
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
                  <AlertCircle size={18} color="#b45309" />
                  Official Attendance Shortage Warning Letter Preview
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => {
                      const email = `parent.${warningStudent.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
                      alert(`📧 Parents Email Alert: Attendance warning PDF letter successfully dispatched to ${email} ✓`);
                    }}
                    style={{ borderColor: '#b45309', color: '#b45309' }}
                  >
                    📧 Email Parent
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => window.print()}
                    style={{ background: '#b45309', border: 'none' }}
                  >
                    <Printer size={15} /> Print / Save Letter PDF
                  </button>
                  <button className="btn btn-white btn-sm" onClick={() => setWarningStudent(null)}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Letter Document Container */}
              <div style={{ padding: '36px', overflowY: 'auto', flex: 1, background: '#f1f5f9' }}>
                <div
                  id="printable-warning-letter"
                  style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    padding: '48px',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#0f172a',
                    lineHeight: '1.6',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #printable-warning-letter, #printable-warning-letter * {
                        visibility: visible !important;
                      }
                      #printable-warning-letter {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        border: none !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                      }
                      .no-print-backdrop {
                        background: none !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                      }
                    }
                  `}</style>
                  {/* Institution Letterhead Banner */}
                  <div style={{ textAlign: 'center', borderBottom: '2px double #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '0.12em', color: '#1e3a8a' }}>
                      SHREE HANUMAN VYAYAM PRASARAK MANDAL'S
                    </h4>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e3b8b', margin: '4px 0' }}>
                      DEGREE COLLEGE OF PHYSICAL EDUCATION
                    </h2>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      HVPM Campus, Amravati, Maharashtra - 444605
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Autonomous College | Affiliated to Sant Gadge Baba Amravati University
                    </div>
                  </div>

                  {/* Ref & Date info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
                    <div>
                      <strong>Ref No:</strong> DCPE/ESTD/ATTN-WARN/{new Date().getFullYear()}/{warningStudent.prn.slice(-4)}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Addressee Info */}
                  <div style={{ marginBottom: '24px', fontSize: '14px' }}>
                    <div>To,</div>
                    <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{warningStudent.name}</div>
                    <div>PRN: {warningStudent.prn} | Roll No: {warningStudent.rollNo || 'Pending'}</div>
                    <div>Program: {warningStudent.course} ({warningStudent.year})</div>
                    <div>Department of {currentUser.departmentName || 'Computer Science & Technology'}</div>
                  </div>

                  {/* Subject Line */}
                  <div style={{ marginBottom: '20px', fontSize: '15px', textDecoration: 'underline', fontWeight: 700 }}>
                    Subject: WARNING LETTER REGARDING CRITICAL ATTENDANCE SHORTAGE
                  </div>

                  {/* Letter Body */}
                  <div style={{ fontSize: '14px', textAlign: 'justify', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '14px' }}>Dear Student,</p>
                    <p style={{ marginBottom: '14px' }}>
                      This is an official notice to inform you that your current cumulative attendance in the ongoing term is recorded at{' '}
                      <strong style={{ color: '#b91c1c', textDecoration: 'underline' }}>{warningStudent.attendance || '0%'}</strong>. This falls critically below the mandatory minimum of{' '}
                      <strong>75%</strong> attendance required under university regulations and institute guidelines to be eligible to appear for the end-semester examinations.
                    </p>
                    <p style={{ marginBottom: '14px' }}>
                      Please be advised that regular attendance in theory classes and practical sessions is essential for your academic progress and is a prerequisite for permission to sit for exam panels. If your attendance does not improve immediately, the college administration reserves the right to bar your name from university exam registrations and lock your hall ticket.
                    </p>
                    <p style={{ marginBottom: '14px' }}>
                      You are hereby directed to meet with the Head of Department (HOD) immediately upon receipt of this letter to submit a written explanation for your absences, along with medical or official documents supporting your leave if applicable.
                    </p>
                    <p>We trust you will give this matter your immediate attention and work to restore your attendance to the required compliance level.</p>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', fontSize: '14px' }}>
                    <div style={{ textAlign: 'center', width: '200px' }}>
                      <div style={{ height: '40px' }}></div>
                      <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontWeight: 700 }}>
                        Class Coordinator
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Dept. of {currentUser.departmentName || 'Computer Science'}</div>
                    </div>
                    <div style={{ textAlign: 'center', width: '200px' }}>
                      <div style={{ height: '40px', fontFamily: '"Brush Script MT", cursive', fontSize: '20px', color: '#1e3b8b' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontWeight: 700 }}>
                        Head of Department (HOD)
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Official Seal &amp; Authority</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Document Viewer Modal ── */}
        {viewProofUrl && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={() => setViewProofUrl(null)}
          >
            <div
              style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', maxWidth: '860px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📎</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{viewProofName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Student Uploaded Document Proof</div>
                  </div>
                </div>
                <button
                  onClick={() => setViewProofUrl(null)}
                  style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: '13px' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Document Viewer */}
              <div style={{ flex: 1, overflow: 'auto', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                {viewProofUrl.startsWith('data:image') ? (
                  <img
                    src={viewProofUrl}
                    alt={viewProofName}
                    style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px' }}
                  />
                ) : viewProofUrl.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewProofUrl}
                    title={viewProofName}
                    style={{ width: '100%', height: '75vh', border: 'none' }}
                  />
                ) : (
                  <div style={{ color: 'white', textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>{viewProofName}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Preview not available for this file type.</div>
                    <a
                      href={viewProofUrl}
                      download={viewProofName}
                      style={{ display: 'inline-block', marginTop: '16px', background: '#2563eb', color: 'white', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}
                    >
                      Download to View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Secure Exam Gatepass QR Scanner Modal ── */}
        {showQRScanner && (
          <QRScannerModal
            students={deptStudents}
            onClose={() => setShowQRScanner(false)}
          />
        )}

        {/* ── Exam Hall Seating Matrix Modal ── */}
        {showSeatingMatrixModal && (
          <ExamSeatingMatrixModal
            currentUser={currentUser}
            onClose={() => setShowSeatingMatrixModal(false)}
          />
        )}

      </div>
    </div>
  );
}
