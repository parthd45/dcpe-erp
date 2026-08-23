import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users, CheckCircle2, XCircle, Clock, Search,
  ShieldCheck, LogOut, UserCheck, Megaphone,
  GraduationCap, Send, Trash2, Globe, Building2, AlertCircle,
  Edit3, Award, CreditCard, TrendingUp, Save, FileCheck, FileBadge,
  Briefcase
} from 'lucide-react';
import {
  fetchStaffNotices, postNotice, archiveNotice, subscribeToNotices
} from '../../lib/noticesService';
import {
  fetchHODPendingApplications,
  reviewLeaveApplication
} from '../../lib/leaveService';
import StudentManager from './StudentManager';
import PlacementManager from './PlacementManager';
import { DocumentVerificationModal } from './StudentDocumentModals';
import './Dashboard.css';

const TAG_OPTIONS = [
  { value: 'exam',      label: '📋 Examination', tagLabel: 'Examination' },
  { value: 'urgent',    label: '🚨 Urgent',       tagLabel: 'Urgent' },
  { value: 'placement', label: '💼 Placement',    tagLabel: 'Placement' },
  { value: 'event',     label: '🎉 Event',        tagLabel: 'Event' },
  { value: 'sports',    label: '🏅 Sports',       tagLabel: 'Sports' },
  { value: 'general',   label: '📌 General',      tagLabel: 'General' },
];

export default function HODDashboard({ onBackToHome }) {
  const {
    currentUser,
    students,
    approveStudent,
    rejectStudent,
    updateStudentAcademicRecord,
    updateStudentDocuments,
    logout
  } = useAuth();

  // ── Student approval state
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalStudent, setRejectModalStudent] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState(null);
  const [isActionPending, setIsActionPending] = useState(false);

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
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' | 'notices' | 'manage' | 'placement' | 'leaves'
  const [selectedForManageId, setSelectedForManageId] = useState(null);

  // ── HOD Leaves state
  const [hodLeaves, setHodLeaves] = useState([]);
  const [hodLeavesLoading, setHodLeavesLoading] = useState(false);
  const [hodLeaveToast, setHodLeaveToast] = useState(null);

  const loadHodLeaves = async () => {
    setHodLeavesLoading(true);
    const list = await fetchHODPendingApplications(currentUser?.department || 'cs');
    setHodLeaves(list);
    setHodLeavesLoading(false);
  };

  useEffect(() => {
    loadHodLeaves();
  }, [currentUser]);

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
      setHodLeaveToast({
        type: 'success',
        text: decision === 'approve'
          ? (isLong
              ? '⚠️ 10+ Days Leave: Endorsed and forwarded to Principal / Admin for executive sanction!'
              : '✅ Leave officially sanctioned and approved!')
          : '❌ Application rejected.',
      });
      await loadHodLeaves();
      setTimeout(() => setHodLeaveToast(null), 4000);
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
  const isSuperHOD = currentUser.department === 'admin';
  const deptStudents = isSuperHOD
    ? students
    : students.filter((s) => s.department === currentUser.department);

  const pendingCount  = deptStudents.filter((s) => s.status === 'pending').length;
  const approvedCount = deptStudents.filter((s) => s.status === 'approved').length;
  const rejectedCount = deptStudents.filter((s) => s.status === 'rejected').length;

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
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 1: Student Approval Portal            */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'approvals' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <UserCheck size={22} color="var(--primary)" />
                  Student Registration Verification &amp; Approvals
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Review and approve newly registered students before granting ERP login access
                </p>
              </div>

              {/* Filter Tabs */}
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
            </div>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              📎 Document Attached: {app.attachmentName}
                            </span>
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

        {/* ── Document Verification & Inspection Modal ── */}
        {verificationStudent && (
          <DocumentVerificationModal
            student={verificationStudent}
            onUpdateStatus={updateStudentDocuments}
            onClose={() => setVerificationStudent(null)}
          />
        )}

      </div>
    </div>
  );
}
