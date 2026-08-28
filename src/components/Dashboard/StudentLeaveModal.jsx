import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Calendar, Clock, User, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, ShieldCheck, Printer, X, Plus,
  Send, Sparkles, Building2, Upload, Paperclip, QrCode, ShieldAlert,
  ArrowRight, Check, AlertTriangle
} from 'lucide-react';
import {
  submitLeaveApplication,
  fetchStudentApplications,
  calculateLeaveDays,
} from '../../lib/leaveService';
import './Dashboard.css';

const LEAVE_CATEGORIES = [
  'Medical Leave (Sickness / Doctor Advice)',
  'Sports Event / Inter-University Championship',
  'Academic Conference / Workshop / Project',
  'Family Emergency / Urgent Personal Work',
  'Hostel Night Out / Weekend Leave',
];

const GRIEVANCE_CATEGORIES = [
  'Academic Instruction & Faculty Query',
  'Computer Lab & Infrastructure Maintenance',
  'Central Library & E-Resource Access',
  'Hostel, Canteen & Drinking Water Facilities',
  'Anti-Ragging & Campus Discipline Cell',
  'Semester Examination / Hall Ticket Query',
];

export function StudentLeaveModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'apply' | 'pass'
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppForPass, setSelectedAppForPass] = useState(null);

  // Form State
  const [appType, setAppType] = useState('leave'); // 'leave' | 'grievance'
  const [category, setCategory] = useState(LEAVE_CATEGORIES[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [emergencyContact, setEmergencyContact] = useState(currentUser.phone || '+91 98765 43210');
  const [attachmentName, setAttachmentName] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);   // File object
  const [attachmentDataUrl, setAttachmentDataUrl] = useState(null); // base64 for storage
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  // Accepted file types
  const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE_MB = 5;

  const processFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSubmitToast({ type: 'error', text: '❌ Unsupported file type. Please upload PDF, PNG, JPG, or DOC.' });
      setTimeout(() => setSubmitToast(null), 4000);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSubmitToast({ type: 'error', text: `❌ File too large. Maximum allowed size is ${MAX_SIZE_MB}MB.` });
      setTimeout(() => setSubmitToast(null), 4000);
      return;
    }
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachmentFile(file);
      setAttachmentName(file.name);
      setAttachmentDataUrl(ev.target.result);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      setSubmitToast({ type: 'error', text: '❌ Failed to read file. Please try again.' });
      setTimeout(() => setSubmitToast(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAttachment = () => {
    setAttachmentFile(null);
    setAttachmentName(null);
    setAttachmentDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Calculate day difference (excluding Sundays as official holiday)
  const { totalDays: diffDays, sundaysCount } = calculateLeaveDays(startDate, endDate);
  const isLongLeave = diffDays >= 10;

  const loadData = async () => {
    setLoading(true);
    const list = await fetchStudentApplications(currentUser.id, currentUser.prn);
    setApplications(list);
    if (list.length > 0 && !selectedAppForPass) {
      const firstApproved = list.find((a) => a.status === 'approved') || list[0];
      setSelectedAppForPass(firstApproved);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setSubmitToast({ type: 'error', text: 'Please provide a clear reason / explanation.' });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      prn: currentUser.prn,
      rollNo: currentUser.rollNo,
      department: currentUser.department || 'cs',
      departmentName: currentUser.departmentName,
      course: currentUser.course,
      type: appType,
      category,
      startDate,
      endDate,
      totalDays: diffDays,
      reason,
      emergencyContact,
      attachmentName,
      attachmentUrl: attachmentDataUrl || null,
    };

    const res = await submitLeaveApplication(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSubmitToast({
        type: 'success',
        text: isLongLeave
          ? `🎉 Application submitted! Because leave is ${diffDays} working days (10+ days), it will route through Teacher Mentor ➔ HOD ➔ Principal for final sanction.`
          : `🎉 Application submitted! It will route through your Teacher Mentor ➔ HOD for verification.`,
      });
      setReason('');
      clearAttachment();
      await loadData();
      setTimeout(() => {
        setSubmitToast(null);
        setActiveTab('tracker');
      }, 3000);
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: activeTab === 'pass' ? '700px' : '780px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Top Control Bar */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            Student Leave Application &amp; Grievance Portal
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'pass' && (
              <button className="btn btn-primary btn-sm" onClick={handlePrintPass}>
                <Printer size={15} /> Print Sanction Order / Gate Pass
              </button>
            )}
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 24px',
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-white'}`}
            style={{ borderRadius: '20px' }}
            onClick={() => setActiveTab('tracker')}
          >
            <Clock size={14} /> My Applications ({applications.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'apply' ? 'btn-primary' : 'btn-white'}`}
            style={{ borderRadius: '20px' }}
            onClick={() => setActiveTab('apply')}
          >
            <Plus size={14} /> Submit New Application / Grievance
          </button>
          {selectedAppForPass && selectedAppForPass.status === 'approved' && (
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'pass' ? 'btn-primary' : 'btn-white'}`}
              style={{ borderRadius: '20px', background: activeTab === 'pass' ? undefined : '#ecfdf5', color: activeTab === 'pass' ? undefined : '#047857', border: '1px solid #a7f3d0' }}
              onClick={() => setActiveTab('pass')}
            >
              <FileText size={14} /> Digital Sanction Order &amp; Gate Pass ✓
            </button>
          )}
        </div>

        {/* Notification Toast */}
        {submitToast && (
          <div
            className="no-print"
            style={{
              padding: '12px 24px',
              background: submitToast.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: submitToast.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '13px',
              fontWeight: 600,
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {submitToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <div>{submitToast.text}</div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: APPLICATION TRACKER & HIERARCHICAL PROGRESS STEPPER
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'tracker' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                    Leave &amp; Grievance Tracking
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Approval Pipeline: <strong>Teacher / Mentor</strong> ➔ <strong>HOD</strong> ➔ <strong>Principal (for 10+ Days)</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('apply')}
                >
                  <Plus size={14} /> New Application
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading applications...
                </div>
              ) : applications.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-body)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                  <FileText size={36} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '14px', color: 'var(--text-heading)', margin: '0 0 4px' }}>No Applications Filed Yet</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                    You can submit medical leaves, tournament outpasses, or institutional grievances directly here.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('apply')}>
                    Submit First Application
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {applications.map((app) => {
                    const isAppApproved = app.status === 'approved';
                    const isAppRejected = app.status === 'rejected';
                    const isTeacherPassed = app.teacherApproval?.approved;
                    const isHodPassed = app.hodApproval?.approved;
                    const isPrincipalPassed = app.principalApproval?.approved;
                    const requiresPrincipal = app.requiresPrincipal || app.totalDays >= 10;

                    return (
                      <div
                        key={app.id}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          border: isAppApproved
                            ? '1px solid #86efac'
                            : isAppRejected
                            ? '1px solid #fca5a5'
                            : '1px solid var(--border-light)',
                          padding: '20px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {/* Application Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
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
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Filed on {app.createdAt}
                              </span>
                              {requiresPrincipal && (
                                <span style={{ fontSize: '10px', fontWeight: 800, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 6px', borderRadius: '6px' }}>
                                  10+ Days (Principal Review Req.)
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 2px' }}>
                              {app.category}
                            </h4>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                              Dates: <strong>{app.startDate}</strong> to <strong>{app.endDate}</strong> • Duration: <strong>{app.totalDays} Working Day(s)</strong>
                            </p>
                          </div>

                          <div>
                            {isAppApproved ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                                <CheckCircle2 size={14} /> SANCTIONED &amp; APPROVED
                              </span>
                            ) : isAppRejected ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                                <XCircle size={14} /> REJECTED
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                                <Clock size={14} /> {app.status.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reason Box */}
                        <div style={{ background: 'var(--bg-body)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', color: 'var(--text-body)', marginBottom: '16px' }}>
                          <strong>Reason:</strong> {app.reason}
                          {app.attachmentName && (
                            <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Paperclip size={13} /> Attached: {app.attachmentName}
                            </div>
                          )}
                        </div>

                        {/* 4-TIER HIERARCHY VISUAL STEPPER */}
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                            Hierarchical Approval Status:
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: requiresPrincipal ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '10px', position: 'relative' }}>
                            {/* Step 1: Student Submission */}
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '12px', fontWeight: 800 }}>
                                ✓
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b' }}>1. Student</div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Submitted</div>
                            </div>

                            {/* Step 2: Teacher / Faculty */}
                            <div style={{ textAlign: 'center' }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: isTeacherPassed ? '#059669' : app.stage === 'teacher' ? '#d97706' : '#cbd5e1',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 6px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                }}
                              >
                                {isTeacherPassed ? '✓' : '2'}
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: isTeacherPassed ? '#059669' : '#1e1b4b' }}>2. Teacher Mentor</div>
                              <div style={{ fontSize: '10px', color: isTeacherPassed ? '#15803d' : app.stage === 'teacher' ? '#d97706' : '#94a3b8' }}>
                                {isTeacherPassed ? 'Endorsed ✓' : app.stage === 'teacher' ? 'Reviewing...' : 'Pending'}
                              </div>
                            </div>

                            {/* Step 3: HOD */}
                            <div style={{ textAlign: 'center' }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: isHodPassed ? '#059669' : app.stage === 'hod' ? '#d97706' : '#cbd5e1',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 6px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                }}
                              >
                                {isHodPassed ? '✓' : '3'}
                              </div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: isHodPassed ? '#059669' : '#1e1b4b' }}>3. Head of Dept</div>
                              <div style={{ fontSize: '10px', color: isHodPassed ? '#15803d' : app.stage === 'hod' ? '#d97706' : '#94a3b8' }}>
                                {isHodPassed ? 'Approved ✓' : app.stage === 'hod' ? 'Reviewing...' : 'Waiting'}
                              </div>
                            </div>

                            {/* Step 4: Principal / Admin (If 10+ Days) */}
                            {requiresPrincipal && (
                              <div style={{ textAlign: 'center' }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: isPrincipalPassed ? '#059669' : app.stage === 'principal' ? '#dc2626' : '#cbd5e1',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 6px',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                  }}
                                >
                                  {isPrincipalPassed ? '✓' : '4'}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: isPrincipalPassed ? '#059669' : '#1e1b4b' }}>4. Principal / Admin</div>
                                <div style={{ fontSize: '10px', color: isPrincipalPassed ? '#15803d' : app.stage === 'principal' ? '#dc2626' : '#94a3b8' }}>
                                  {isPrincipalPassed ? 'Sanctioned ✓' : app.stage === 'principal' ? 'Final Review (10+ Days)' : 'Waiting'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rejection notice if applicable */}
                        {isAppRejected && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#991b1b', marginBottom: '12px' }}>
                            <strong>❌ Rejection Remarks ({app.rejectionStage}):</strong> {app.rejectionReason}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          {isAppApproved && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => {
                                setSelectedAppForPass(app);
                                setActiveTab('pass');
                              }}
                            >
                              <Printer size={14} /> View Official Sanction Letter &amp; Gate Pass
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: SUBMIT NEW APPLICATION / COMPLAINT FORM
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'apply' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
                  Submit Leave or Grievance Application
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Student: <strong>{currentUser.name}</strong> • PRN: <code>{currentUser.prn}</code> • {currentUser.course}
                </p>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: appType === 'leave' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: appType === 'leave' ? 'rgba(79, 70, 229, 0.05)' : 'white',
                    color: appType === 'leave' ? 'var(--primary)' : 'var(--text-heading)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onClick={() => {
                    setAppType('leave');
                    setCategory(LEAVE_CATEGORIES[0]);
                  }}
                >
                  <Calendar size={18} />
                  Leave Application / Outpass
                </button>

                <button
                  type="button"
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: appType === 'grievance' ? '2px solid #d97706' : '1px solid var(--border-light)',
                    background: appType === 'grievance' ? '#fffbeb' : 'white',
                    color: appType === 'grievance' ? '#b45309' : 'var(--text-heading)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onClick={() => {
                    setAppType('grievance');
                    setCategory(GRIEVANCE_CATEGORIES[0]);
                  }}
                >
                  <ShieldAlert size={18} />
                  Grievance / Complaint Cell
                </button>
              </div>

              {/* Category Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                  {appType === 'leave' ? 'Leave Purpose Category' : 'Grievance / Issue Category'}
                </label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ height: '42px', fontSize: '13px' }}
                >
                  {(appType === 'leave' ? LEAVE_CATEGORIES : GRIEVANCE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ height: '42px', fontSize: '13px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                    To Date (Inclusive)
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    style={{ height: '42px', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              {/* LEAVE ROUTING RULE ALERT BANNER */}
              {(() => {
                const isShort = diffDays < 3;
                const isMedium = diffDays >= 3 && !isLongLeave;
                const bg = isLongLeave ? '#fef2f2' : isShort ? '#f0fdf4' : '#eff6ff';
                const border = isLongLeave ? '1px solid #fecaca' : isShort ? '1px solid #bbf7d0' : '1px solid #bfdbfe';
                const color = isLongLeave ? '#991b1b' : isShort ? '#15803d' : '#1e40af';
                return (
                  <div style={{ background: bg, border, borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color }}>
                    {isLongLeave ? (
                      <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : isShort ? (
                      <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong>Calculated Duration: {diffDays} Working Day(s)</strong>
                        {sundaysCount > 0 && (
                          <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            ({sundaysCount} Sunday{sundaysCount > 1 ? 's' : ''} Excluded - Official Holiday)
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                        {isLongLeave
                          ? '⚠️ Extended Leave Rule: Leaves of 10 or more working days strictly require Level-1 (Teacher) ➔ Level-2 (HOD) ➔ Level-3 (Principal / Admin Executive Sanction) before being approved.'
                          : isShort
                            ? '✅ Short Leave Rule: Under 3 working days — your Teacher / Faculty Mentor can directly sanction without HOD escalation.'
                            : 'ℹ️ Standard Leave Rule: 3 to 9 working days will be sanctioned upon Level-1 (Teacher) endorsement ➔ Level-2 (HOD) final approval.'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Reason Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                  Detailed Reason / Description <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Explain your situation clearly (e.g. medical illness, tournament selection, family event, or lab grievance)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ fontSize: '13px', lineHeight: 1.5 }}
                  required
                />
              </div>

              {/* Emergency Contact & Attachment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                    Parent / Emergency Phone Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    style={{ height: '42px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '6px' }}>
                    Optional Proof / Medical Certificate
                  </label>
                  {/* Hidden real file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  {/* File drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      processFile(file);
                    }}
                    style={{
                      border: isDragOver ? '2px dashed #2563eb' : attachmentName ? '2px solid #16a34a' : '2px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '14px 12px',
                      background: isDragOver ? '#eff6ff' : attachmentName ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                    onClick={() => !attachmentName && fileInputRef.current?.click()}
                  >
                    {isReadingFile ? (
                      <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                        ⏳ Reading file, please wait...
                      </div>
                    ) : attachmentName ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <Paperclip size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {attachmentName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {attachmentFile ? `${(attachmentFile.size / 1024).toFixed(1)} KB – Attached ✓` : 'Attached ✓'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); clearAttachment(); }}
                          style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#dc2626', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}
                        >
                          × Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={18} color="#94a3b8" style={{ marginBottom: '4px' }} />
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                          Click to browse or drag &amp; drop
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          PDF, PNG, JPG, DOC – Max {MAX_SIZE_MB}MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-white"
                  onClick={() => setActiveTab('tracker')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Submitting to Teacher Mentor...'
                  ) : (
                    <>
                      <Send size={15} /> Submit for Faculty &amp; HOD Approval
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: OFFICIAL PRINTABLE SANCTION ORDER & CAMPUS GATE PASS
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'pass' && selectedAppForPass && (
            <div
              id="printable-sanction-order"
              style={{
                background: 'white',
                border: '2px solid #1e1b4b',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
              }}
            >
              {/* Background Watermark */}
              <div
                style={{
                  position: 'absolute',
                  right: '15px',
                  bottom: '15px',
                  opacity: 0.04,
                  pointerEvents: 'none',
                }}
              >
                <ShieldCheck size={320} color="#1e1b4b" />
              </div>

              {/* Letterhead Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '2px solid #1e1b4b', paddingBottom: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    background: '#1e1b4b',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '18px',
                    letterSpacing: '1px',
                    flexShrink: 0,
                  }}
                >
                  DCPE
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 800 }}>
                    Shree H.V.P. Mandal’s
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>
                    DEGREE COLLEGE OF PHYSICAL EDUCATION
                  </h2>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    Autonomous College • Multi-Faculty Post-Graduate & Degree Institution • Amravati (M.S.)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> OFFICIAL SANCTION
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Order: <strong>{selectedAppForPass.sanctionNumber || 'DCPE/SANCTION/2026/4102'}</strong>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#1e1b4b', background: '#f1f5f9', padding: '6px', borderRadius: '6px' }}>
                  OFFICIAL LEAVE SANCTION ORDER &amp; CAMPUS SECURITY GATE PASS
                </h3>
              </div>

              {/* Student & Leave Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Student Name:</span> <strong>{selectedAppForPass.studentName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>PRN / Enrollment:</span> <strong>{selectedAppForPass.prn}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Course &amp; Roll No:</span> <strong>{selectedAppForPass.course} ({selectedAppForPass.rollNo})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Department:</span> <strong>{selectedAppForPass.departmentName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Sanctioned Period:</span> <strong>{selectedAppForPass.startDate} to {selectedAppForPass.endDate} ({selectedAppForPass.totalDays} Days)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Category:</span> <strong>{selectedAppForPass.category}</strong>
                </div>
              </div>

              {/* Sanction Statement */}
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155', marginBottom: '20px', padding: '0 4px' }}>
                This is to officially certify that the student named above has been granted leave of absence from classes, labs, and hostel premises for the sanctioned period stated above. The attendance percentage for these dates will be regularized as per university ordinance.
              </div>

              {/* 3 Signatures / Endorsements Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedAppForPass.requiresPrincipal ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '16px', paddingTop: '16px', borderTop: '2px dashed #cbd5e1', marginBottom: '16px' }}>
                {/* Teacher Seal */}
                <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800 }}>LEVEL 1 VERIFIED ✓</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b', marginTop: '2px' }}>
                    {selectedAppForPass.teacherApproval?.reviewedBy || 'Prof. S. Sharma'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Faculty Class Mentor</div>
                </div>

                {/* HOD Seal */}
                <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800 }}>LEVEL 2 ENDORSED ✓</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b', marginTop: '2px' }}>
                    {selectedAppForPass.hodApproval?.reviewedBy || 'Dr. V. M. Thakare'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Head of Department</div>
                </div>

                {/* Principal Seal (for 10+ Days) */}
                {selectedAppForPass.requiresPrincipal && (
                  <div style={{ textAlign: 'center', background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 800 }}>EXECUTIVE SANCTION ✓</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b', marginTop: '2px' }}>
                      {selectedAppForPass.principalApproval?.reviewedBy || 'Principal / Registrar'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>DCPE HVPM Amravati</div>
                  </div>
                )}
              </div>

              {/* Bottom Security QR Code & Gatekeeper instructions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'white', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <QrCode size={52} color="#1e1b4b" />
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    <strong>Campus Security Instructions:</strong>
                    <div>Present this dynamic QR code at the Main HVPM Security Gate when departing or entering campus.</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                  Valid Until: <strong>{selectedAppForPass.endDate} 11:59 PM</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
