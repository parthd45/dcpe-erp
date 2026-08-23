import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, BookOpen, Calendar, Award, CheckCircle2,
  Clock, AlertCircle, LogOut, FileText, CreditCard, User,
  TrendingUp, Library, Bell, Download, Megaphone, Camera, Upload, Lock,
  Briefcase
} from 'lucide-react';
import { fetchNotices, subscribeToNotices } from '../../lib/noticesService';
import { calculateStudentAttendanceStats } from '../../lib/attendanceService';
import { fetchStudentGradeReport } from '../../lib/marksService';
import {
  StudentIDCardModal,
  ExamHallTicketModal,
  DigitalMarksheetModal,
  StudentDocumentUploadModal
} from './StudentDocumentModals';
import { PlacementModal } from './PlacementModal';
import { FeePaymentModal } from './FeePaymentModal';
import { TimetableModal } from './TimetableModal';
import { LibraryModal } from './LibraryModal';
import { StudentLeaveModal } from './StudentLeaveModal';
import './Dashboard.css';


export default function StudentDashboard({ onBackToHome }) {
  const { currentUser, updateStudentDocuments, updateStudentAcademicRecord, logout } = useAuth();
  const [deptNotices, setDeptNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [gradeReport, setGradeReport] = useState(null);

  // Modals state
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);
  const [showMarksheetModal, setShowMarksheetModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Hall ticket lock toast
  const [hallTicketToast, setHallTicketToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNotices(5, currentUser?.department);
      setDeptNotices(data);
      setNoticesLoading(false);

      if (currentUser?.id && currentUser?.department && currentUser?.course) {
        const stats = await calculateStudentAttendanceStats(
          currentUser.id,
          currentUser.department,
          currentUser.course
        );
        setAttendanceStats(stats);

        const report = await fetchStudentGradeReport(currentUser.id, 'Semester I');
        setGradeReport(report);
      }
    };
    load();

    const unsubscribe = subscribeToNotices(() => load());
    return unsubscribe;
  }, [currentUser?.id, currentUser?.department, currentUser?.course]);

  if (!currentUser) return null;

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-xl)',
                  objectFit: 'cover',
                  border: '2px solid white',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
            ) : (
              <div className="user-avatar-badge">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="user-meta">
              <h2>Welcome, {currentUser.name}</h2>
              <p>
                {currentUser.course} • {currentUser.year} • PRN: <strong>{currentUser.prn}</strong>
              </p>
              <div className="user-role-tag student">
                <CheckCircle2 size={12} />
                Student Portal — Active
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

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setShowMarksheetModal(true)} style={{ cursor: 'pointer' }} title="Click to view full academic marksheet">
            <div className="kpi-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-details">
              <span>Overall Attendance</span>
              <h3>{attendanceStats?.overallPercentage || currentUser.attendance || '0.0%'}</h3>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setShowMarksheetModal(true)} style={{ cursor: 'pointer' }} title="Click to view SGPA / CGPA Grade Card">
            <div className="kpi-icon primary">
              <Award size={24} />
            </div>
            <div className="kpi-details">
              <span>Cumulative SGPA / CGPA</span>
              <h3>{gradeReport?.sgpa ? `${gradeReport.sgpa}` : (currentUser.cgpa || '8.80')}</h3>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setShowFeeModal(true)} style={{ cursor: 'pointer' }} title="Click to view fee breakdown & print receipt">
            <div className="kpi-icon blue">
              <CreditCard size={24} />
            </div>
            <div className="kpi-details">
              <span>Semester Fee Status</span>
              <h3 style={{ fontSize: '1.25rem', color: '#059669' }}>
                {currentUser.feesStatus || 'Paid ✓'}
              </h3>
            </div>
          </div>

          <div className="kpi-card" onClick={() => setShowLibraryModal(true)} style={{ cursor: 'pointer' }} title="Click to open Library Catalog & Issued Books">
            <div className="kpi-icon purple">
              <Library size={24} />
            </div>
            <div className="kpi-details">
              <span>Library Books</span>
              <h3>2 Active (Catalog)</h3>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid-2">
          {/* Left Panel: Academic Profile & HOD Approval Verification */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title">
                <User size={20} color="var(--primary)" />
                Student Academic Profile
              </div>
              <span className="status-pill approved">
                <CheckCircle2 size={14} /> Approved by HOD
              </span>
            </div>

            <div className="profile-detail-grid">
              <div className="profile-detail-item">
                <span>Full Name</span>
                <strong>{currentUser.name}</strong>
              </div>
              <div className="profile-detail-item">
                <span>PRN / Enrollment Number</span>
                <strong>{currentUser.prn}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Department</span>
                <strong>{currentUser.departmentName}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Course & Program</span>
                <strong>{currentUser.course}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Email Address</span>
                <strong>{currentUser.email}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Contact Phone</span>
                <strong>{currentUser.phone || '+91 98765 43210'}</strong>
              </div>
              <div className="profile-detail-item">
                <span>College Roll Number</span>
                <strong>{currentUser.rollNo || 'MCA-24-42'}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Registration Date</span>
                <strong>{currentUser.registeredAt}</strong>
              </div>
            </div>

            {/* Official HOD Verification Stamp Card */}
            <div className="approval-stamp-card">
              <div className="stamp-icon">
                <CheckCircle2 size={28} />
              </div>
              <div className="approval-stamp-text">
                <h4>Official Department Approval Stamp</h4>
                <p>
                  This student's identity and admission eligibility have been officially 
                  verified and <strong>approved by {currentUser.approvedBy || 'HOD Dr. V. M. Thakare'}</strong>
                  {currentUser.approvedAt ? ` on ${currentUser.approvedAt}` : ''}.
                </p>
              </div>
            </div>

            {/* Subject-wise Mathematical Attendance Breakdown */}
            {attendanceStats?.subjectBreakdown && attendanceStats.subjectBreakdown.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)' }}>
                    <TrendingUp size={18} color="#059669" />
                    Subject-wise Attendance Breakdown
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Calculated from Faculty Lecture Sheets
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {attendanceStats.subjectBreakdown.map((sub) => (
                    <div key={sub.subjectId} style={{ background: 'var(--bg-body)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <strong style={{ color: 'var(--text-heading)' }}>
                          {sub.name} <code style={{ fontSize: '11px', opacity: 0.85 }}>({sub.code})</code>
                        </strong>
                        <span style={{ fontWeight: 700, color: sub.percentageNum >= 75 ? '#059669' : sub.percentageNum >= 65 ? '#d97706' : '#dc2626' }}>
                          {sub.attendedCount} / {sub.totalConducted} ({sub.percentage})
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, sub.percentageNum)}%`,
                            height: '100%',
                            background: sub.percentageNum >= 75 ? '#059669' : sub.percentageNum >= 65 ? '#d97706' : '#dc2626',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hallTicketToast && (
              <div
                className="alert-message warning"
                style={{
                  marginTop: '16px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                }}
              >
                <Lock size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Hall Ticket Access Locked:</strong> {hallTicketToast}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowIdCardModal(true)}>
                <Download size={15} /> Student ID Card
              </button>

              <button
                className={`btn btn-sm ${currentUser.hallTicketApproved ? 'btn-outline-dark' : 'btn-white'}`}
                style={{
                  border: currentUser.hallTicketApproved ? '1px solid #1e1b4b' : '1px solid #fde68a',
                  background: currentUser.hallTicketApproved ? undefined : '#fefce8',
                  color: currentUser.hallTicketApproved ? undefined : '#b45309',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={() => {
                  if (currentUser.hallTicketApproved) {
                    setShowHallTicketModal(true);
                  } else {
                    setHallTicketToast('Your Examination Hall Ticket is currently locked pending HOD approval. Once your attendance (min 75%) and semester fees are verified, HOD will grant Hall Ticket approval.');
                    setTimeout(() => setHallTicketToast(null), 7000);
                  }
                }}
                title={currentUser.hallTicketApproved ? 'HOD Approved ✓' : 'Awaiting HOD Approval'}
              >
                {currentUser.hallTicketApproved ? (
                  <>
                    <FileText size={15} color="#059669" /> Hall Ticket (Approved ✓)
                  </>
                ) : (
                  <>
                    <Lock size={14} color="#d97706" /> Hall Ticket (Locked)
                  </>
                )}
              </button>

              <button className="btn btn-white btn-sm" style={{ border: '1px solid var(--border-light)' }} onClick={() => setShowMarksheetModal(true)}>
                <Award size={15} color="var(--primary)" /> Digital Marksheet
              </button>
              <button className="btn btn-white btn-sm" style={{ border: '1px solid #a7f3d0', color: '#047857' }} onClick={() => setShowDocUploadModal(true)}>
                <Camera size={15} color="#059669" /> Photo &amp; Documents
              </button>
              <button className="btn btn-white btn-sm" style={{ border: '1px solid #bfdbfe', color: '#1d4ed8' }} onClick={() => setShowFeeModal(true)}>
                <CreditCard size={15} color="#2563eb" /> Fees &amp; Receipt
              </button>
              <button className="btn btn-white btn-sm" style={{ border: '1px solid #fbcfe8', color: '#be185d' }} onClick={() => setShowLibraryModal(true)}>
                <Library size={15} color="#db2777" /> Library Services
              </button>
              <button className="btn btn-white btn-sm" style={{ border: '1px solid #fed7aa', color: '#c2410c' }} onClick={() => setShowLeaveModal(true)}>
                <Clock size={15} color="#ea580c" /> Leaves &amp; Grievances 📋
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowPlacementModal(true)}
              >
                <Briefcase size={15} color="#67e8f9" /> T&amp;P Campus Placements 🚀
              </button>
            </div>
          </div>

          {/* Right Panel: Class Schedule & Notices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Calendar size={18} color="var(--primary)" />
                  Today's Class Schedule
                </div>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => setShowTimetableModal(true)}
                >
                  Full Weekly Timetable →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <strong style={{ display: 'block', fontSize: '13px' }}>09:00 AM - 10:00 AM</strong>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>Cloud Computing & Virtualization</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Lab 4 (CS Building) • Prof. S. Sharma</p>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <strong style={{ display: 'block', fontSize: '13px' }}>10:00 AM - 11:00 AM</strong>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>Machine Learning & Neural Networks</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Room 204 • Dr. V. M. Thakare</p>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-body)', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                  <strong style={{ display: 'block', fontSize: '13px' }}>11:30 AM - 01:30 PM</strong>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>AI & Data Science Laboratory</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Advanced Computing Lab 2 • Prof. S. Sharma</p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Bell size={18} color="var(--primary)" />
                  Department Notices
                </div>
                {deptNotices.length > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {deptNotices.length} active
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {noticesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div className="skeleton-box" style={{ height: 12, width: '80%', borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton-box" style={{ height: 10, width: '60%', borderRadius: 4 }} />
                    </div>
                  ))
                ) : deptNotices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                    <Megaphone size={24} style={{ opacity: 0.3, marginBottom: 6 }} />
                    <p style={{ fontSize: '13px' }}>No notices for your department yet.</p>
                  </div>
                ) : (
                  deptNotices.map((notice) => (
                    <div key={notice.id} style={{ fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span className={`notice-tag ${notice.tag}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {notice.tagLabel}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {notice.day} {notice.month}
                        </span>
                      </div>
                      <strong style={{ color: 'var(--text-heading)', display: 'block', lineHeight: 1.4 }}>
                        {notice.title}
                      </strong>
                      <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.4 }}>
                        {notice.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Official Student ID Card Modal ── */}
        {showIdCardModal && (
          <StudentIDCardModal
            currentUser={currentUser}
            onClose={() => setShowIdCardModal(false)}
          />
        )}

        {/* ── Official Exam Hall Ticket Modal ── */}
        {showHallTicketModal && (
          <ExamHallTicketModal
            currentUser={currentUser}
            attendanceStats={attendanceStats}
            onClose={() => setShowHallTicketModal(false)}
          />
        )}

        {/* ── Official Digital Marksheet Modal ── */}
        {showMarksheetModal && (
          <DigitalMarksheetModal
            currentUser={currentUser}
            gradeReport={gradeReport}
            onClose={() => setShowMarksheetModal(false)}
          />
        )}

        {/* ── Photo & Document Upload Modal ── */}
        {showDocUploadModal && (
          <StudentDocumentUploadModal
            currentUser={currentUser}
            onSave={updateStudentDocuments}
            onClose={() => setShowDocUploadModal(false)}
          />
        )}

        {/* ── Training & Placement (T&P) Cell Modal ── */}
        {showPlacementModal && (
          <PlacementModal
            currentUser={currentUser}
            onClose={() => setShowPlacementModal(false)}
          />
        )}

        {/* ── Semester Fee Payment & Receipt Modal ── */}
        {showFeeModal && (
          <FeePaymentModal
            currentUser={currentUser}
            onClose={() => setShowFeeModal(false)}
            onPaymentSuccess={(newStatus) => {
              if (updateStudentAcademicRecord) {
                updateStudentAcademicRecord(currentUser.id, { feesStatus: newStatus });
              }
            }}
          />
        )}

        {/* ── Weekly Class Timetable Modal ── */}
        {showTimetableModal && (
          <TimetableModal
            currentUser={currentUser}
            onClose={() => setShowTimetableModal(false)}
          />
        )}

        {/* ── Central Library & Catalog Modal ── */}
        {showLibraryModal && (
          <LibraryModal
            currentUser={currentUser}
            onClose={() => setShowLibraryModal(false)}
          />
        )}

        {/* ── Leave Application & Grievance Modal ── */}
        {showLeaveModal && (
          <StudentLeaveModal
            currentUser={currentUser}
            onClose={() => setShowLeaveModal(false)}
          />
        )}

      </div>
    </div>
  );
}
