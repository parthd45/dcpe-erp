import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Filter, Save, TrendingUp, Award, CreditCard,
  User, CheckCircle2, Clock, XCircle, ArrowLeft, Sparkles, BookOpen,
  Mail, Phone, Hash, ShieldCheck, AlertCircle, FileText, Lock, FileBadge, Eye
} from 'lucide-react';
import { DocumentVerificationModal } from './StudentDocumentModals';
import './Dashboard.css';

export default function StudentManager({
  students,
  onUpdateStudent,
  onBackToTable,
  initialSelectedId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state for selected student
  const [formData, setFormData] = useState({
    rollNo: '',
    attendance: '90.0%',
    cgpa: '8.50',
    feesStatus: 'Paid ✓',
    phone: '',
    hallTicketApproved: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Filter students list
  const filteredStudents = students.filter((s) => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Set initial selected student
  useEffect(() => {
    if (students.length > 0) {
      const found = initialSelectedId
        ? students.find((s) => s.id === initialSelectedId)
        : students[0];
      const target = found || students[0];
      setSelectedStudent(target);
    }
  }, [students, initialSelectedId]);

  // When selected student changes, populate form
  useEffect(() => {
    if (selectedStudent) {
      setFormData({
        rollNo: selectedStudent.rollNo || '',
        attendance: selectedStudent.attendance || '0.0%',
        cgpa: selectedStudent.cgpa || 'N/A',
        feesStatus: selectedStudent.feesStatus || 'Pending Verification',
        phone: selectedStudent.phone || '',
        hallTicketApproved: Boolean(selectedStudent.hallTicketApproved),
      });
      setSaveSuccess(null);
    }
  }, [selectedStudent]);

  // Helper for attendance numeric percentage
  const getAttendanceValue = (str) => {
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  };

  const attendanceNum = getAttendanceValue(formData.attendance);

  // CGPA Grade Label
  const getCgpaGrade = (cgpaStr) => {
    const num = parseFloat(cgpaStr);
    if (isNaN(num)) return { label: 'Not Graded Yet', color: 'var(--text-muted)' };
    if (num >= 8.5) return { label: 'First Class with Distinction 🏆', color: '#059669' };
    if (num >= 7.5) return { label: 'First Class ⭐', color: '#2563eb' };
    if (num >= 6.0) return { label: 'Second Class 👍', color: '#d97706' };
    return { label: 'Pass Class', color: '#4b5563' };
  };

  const gradeInfo = getCgpaGrade(formData.cgpa);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSaving(true);
    setSaveSuccess(null);

    const res = await onUpdateStudent(selectedStudent.id, formData);
    setIsSaving(false);

    if (res?.success !== false) {
      setSaveSuccess(`✅ Academic & Fee records for ${selectedStudent.name} saved successfully!`);
      setTimeout(() => setSaveSuccess(null), 5000);
    } else {
      setSaveSuccess(`❌ Update failed: ${res.message}`);
    }
  };

  return (
    <div className="dashboard-panel" style={{ padding: '24px' }}>
      {/* Header bar */}
      <div className="panel-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-white btn-sm"
            onClick={onBackToTable}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <ArrowLeft size={16} /> Back to Table
          </button>
          <div>
            <div className="panel-title" style={{ fontSize: '1.2rem' }}>
              <UserCheck size={22} color="var(--primary)" />
              Dedicated Student Academic &amp; Fee Manager
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Select a student to edit attendance %, CGPA, semester fee status &amp; roll numbers
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        
        {/* Left Column: Student Roster */}
        <div
          style={{
            background: 'var(--bg-body)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            height: 'fit-content',
            maxHeight: '720px',
          }}
        >
          {/* Search bar */}
          <div className="form-input-wrap">
            <span className="form-input-icon"><Search size={15} /></span>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '13px', height: '38px' }}
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-white'}`}
              style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
              onClick={() => setFilterStatus('all')}
            >
              All ({students.length})
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'approved' ? 'btn-primary' : 'btn-white'}`}
              style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-white'}`}
              style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
          </div>

          {/* Student Cards List */}
          <div
            style={{
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '560px',
              paddingRight: '4px',
            }}
          >
            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No students found.
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isSelected = selectedStudent?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-lg)',
                      background: isSelected ? 'var(--bg-white)' : 'transparent',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                        {s.name}
                      </strong>
                      <span className={`status-pill ${s.status}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {s.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <code>{s.prn}</code>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Att: <strong style={{ color: '#059669' }}>{s.attendance || '0%'}</strong></span>
                      <span>CGPA: <strong>{s.cgpa || 'N/A'}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Student Editor Workspace */}
        {selectedStudent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Selected Student Details Card Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                borderRadius: 'var(--radius-xl)',
                color: 'white',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid white',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: 800,
                    }}
                  >
                    {selectedStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'white' }}>
                    {selectedStudent.name}
                  </h2>
                  <div style={{ fontSize: '13px', opacity: 0.85, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>{selectedStudent.course}</span>
                    <span>•</span>
                    <span>{selectedStudent.year}</span>
                    <span>•</span>
                    <span style={{ color: '#a7f3d0' }}>Docs: {selectedStudent.docStatus || 'Uploaded'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ fontWeight: 700, color: '#1e1b4b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setShowVerifyModal(true)}
                  title="Inspect and preview 10th/12th/Degree certificates and photo"
                >
                  <FileBadge size={16} color="#059669" /> Inspect Documents
                </button>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '2px' }}>Permanent PRN</div>
                  <code style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', letterSpacing: '0.05em' }}>
                    {selectedStudent.prn}
                  </code>
                </div>
              </div>

              {/* Comprehensive Student Demographic Details Grid */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '12px' }}>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>GENDER</span> <strong>{selectedStudent.gender || 'Male'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>DATE OF BIRTH</span> <strong>{selectedStudent.dob || 'N/A'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>BLOOD GROUP</span> <strong>{selectedStudent.bloodGroup || 'N/A'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>RESERVATION CATEGORY</span> <strong>{selectedStudent.category || 'OPEN / General'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>AADHAAR CARD NO</span> <strong>{selectedStudent.aadhaarNo || 'N/A'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>PARENT / GUARDIAN</span> <strong>{selectedStudent.guardianName || 'N/A'}</strong></div>
                <div><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>GUARDIAN PHONE</span> <strong>{selectedStudent.guardianPhone || 'N/A'}</strong></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ opacity: 0.75, display: 'block', fontSize: '10px' }}>PERMANENT ADDRESS</span> <strong>{selectedStudent.permanentAddress || 'N/A'}</strong></div>
              </div>
            </div>

            {/* Save Notification Toast */}
            {saveSuccess && (
              <div className="alert-message success" style={{ margin: 0 }}>
                <CheckCircle2 size={20} />
                <div>{saveSuccess}</div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Academic Records */}
              <div
                style={{
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)', fontWeight: 700 }}>
                  <TrendingUp size={18} />
                  Academic Performance &amp; Roll Number Assignment
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  
                  {/* Roll Number */}
                  <div className="form-group">
                    <label className="form-label">College Roll Number *</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><Hash size={16} /></span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. MCA-26-042"
                        value={formData.rollNo}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="form-group">
                    <label className="form-label">Overall Attendance % *</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><TrendingUp size={16} color="#059669" /></span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 91.5%"
                        value={formData.attendance}
                        onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* CGPA */}
                  <div className="form-group">
                    <label className="form-label">Cumulative CGPA *</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><Award size={16} color="#7c3aed" /></span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 8.75 or N/A"
                        value={formData.cgpa}
                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Visual Attendance Bar Preview */}
                <div style={{ marginTop: '16px', background: 'var(--bg-body)', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Attendance Progress Gauge:</span>
                    <strong style={{ color: attendanceNum >= 75 ? '#059669' : '#d97706' }}>
                      {formData.attendance} ({attendanceNum >= 75 ? 'Eligible for Exams ✓' : 'Shortage Alert ⚠️'})
                    </strong>
                  </div>

                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${attendanceNum}%`,
                        height: '100%',
                        background: attendanceNum >= 75 ? '#059669' : attendanceNum >= 65 ? '#d97706' : '#dc2626',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* CGPA Grade Badge Preview */}
                <div style={{ marginTop: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Degree Classification Preview:</span>
                  <span style={{ fontWeight: 700, color: gradeInfo.color }}>{gradeInfo.label}</span>
                </div>
              </div>

              {/* Section 2: Fee & Accounts Management */}
              <div
                style={{
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2563eb', fontWeight: 700 }}>
                  <CreditCard size={18} />
                  Semester Fee Payment Status &amp; Clearance
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Fee Status Dropdown */}
                  <div className="form-group">
                    <label className="form-label">Semester Fee Status *</label>
                    <div className="form-input-wrap">
                      <select
                        className="form-select"
                        value={formData.feesStatus}
                        onChange={(e) => setFormData({ ...formData, feesStatus: e.target.value })}
                      >
                        <option value="Paid ✓">Paid ✓ (Full Clearance)</option>
                        <option value="Partial (50% Paid)">Partial (50% Installment Paid)</option>
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Unpaid Surcharge">Unpaid Surcharge / Dues</option>
                      </select>
                    </div>
                  </div>

                  {/* Student Phone */}
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><Phone size={16} /></span>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 3: Examination Hall Ticket Clearance & Authorization */}
              <div
                style={{
                  background: formData.hallTicketApproved ? '#f0fdf4' : '#fffbeb',
                  border: formData.hallTicketApproved ? '1px solid #bbf7d0' : '1px solid #fde68a',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: formData.hallTicketApproved ? '#15803d' : '#b45309', fontWeight: 700 }}>
                    <FileText size={18} />
                    Examination Hall Ticket Clearance
                  </div>

                  <span
                    className={`status-pill ${formData.hallTicketApproved ? 'approved' : 'pending'}`}
                    style={{ fontSize: '11px', padding: '3px 10px' }}
                  >
                    {formData.hallTicketApproved ? '✓ Hall Ticket Authorized' : '🔒 Hall Ticket Locked'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Students can only view and print their official Examination Hall Ticket if approved by HOD.
                </div>

                {/* Eligibility checklist preview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '12px' }}>
                  <div style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {attendanceNum >= 75 ? <CheckCircle2 size={15} color="#059669" /> : <AlertCircle size={15} color="#dc2626" />}
                    <span>Attendance: <strong>{attendanceNum}%</strong> ({attendanceNum >= 75 ? 'Meets 75% Rule ✓' : 'Shortage ⚠️'})</span>
                  </div>

                  <div style={{ padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {formData.feesStatus?.includes('Paid') && !formData.feesStatus?.includes('Unpaid') ? <CheckCircle2 size={15} color="#059669" /> : <AlertCircle size={15} color="#d97706" />}
                    <span>Fee Clearance: <strong>{formData.feesStatus}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: 'var(--text-heading)' }}>
                    <input
                      type="checkbox"
                      checked={formData.hallTicketApproved}
                      onChange={(e) => setFormData({ ...formData, hallTicketApproved: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#059669', cursor: 'pointer' }}
                    />
                    Grant Examination Hall Ticket Download Permission to Student
                  </label>
                </div>
              </div>

              {/* Save Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={onBackToTable}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ padding: '12px 28px' }}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving & Syncing...' : 'Save & Sync Student Record'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Select a student from the roster list on the left to edit their academic details.
          </div>
        )}

      </div>

      {/* ── Document Verification Modal in Student Manager ── */}
      {showVerifyModal && selectedStudent && (
        <DocumentVerificationModal
          student={selectedStudent}
          onUpdateStatus={onUpdateStudent}
          onClose={() => setShowVerifyModal(false)}
        />
      )}

    </div>
  );
}
