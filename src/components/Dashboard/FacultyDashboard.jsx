import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Calendar, CheckCircle2, XCircle, Clock, UserCheck,
  Send, Search, LogOut, Users, Sparkles, AlertCircle, History,
  Building2, CheckSquare, Square, Award, Save, TrendingUp
} from 'lucide-react';
import {
  fetchFacultyAssignedSubjects,
  fetchSubjectStudents,
  submitAttendanceSheet,
  fetchSubjectLectureLogs
} from '../../lib/attendanceService';
import {
  calculateGrade,
  fetchSubjectMarks,
  saveBatchStudentMarks
} from '../../lib/marksService';
import './Dashboard.css';

export default function FacultyDashboard({ onBackToHome }) {
  const { currentUser, logout } = useAuth();

  const [activeFacultyTab, setActiveFacultyTab] = useState('attendance'); // 'attendance' | 'marks'

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Student roster for selected subject
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Attendance Sheet Form State
  const [lectureDate, setLectureDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [presentMap, setPresentMap] = useState({}); // studentId -> boolean
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitToast, setSubmitToast] = useState(null);

  // Marks Entry Form State
  const [marksMap, setMarksMap] = useState({}); // studentId -> { internal, external }
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [marksToast, setMarksToast] = useState(null);

  // Past Lecture History
  const [lectureLogs, setLectureLogs] = useState([]);

  // Load faculty subjects on mount
  useEffect(() => {
    const loadSubjects = async () => {
      if (currentUser?.id) {
        setIsLoadingSubjects(true);
        const list = await fetchFacultyAssignedSubjects(currentUser.id);
        setAssignedSubjects(list);
        if (list.length > 0) {
          setSelectedSubject(list[0]);
        }
        setIsLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, [currentUser?.id]);

  // Load roster & past lecture history whenever selected subject changes
  useEffect(() => {
    const loadSubjectData = async () => {
      if (selectedSubject) {
        setIsLoadingStudents(true);

        // Fetch enrolled students
        const stuList = await fetchSubjectStudents(
          selectedSubject.department_id,
          selectedSubject.course
        );
        setStudents(stuList);

        // Initialize all students as Present by default for convenience
        const initialMap = {};
        stuList.forEach((s) => {
          initialMap[s.id] = true;
        });
        setPresentMap(initialMap);

        // Fetch past lecture history logs
        const logs = await fetchSubjectLectureLogs(selectedSubject.id);
        setLectureLogs(logs);

        // Fetch existing marks from DB
        const existingMarks = await fetchSubjectMarks(selectedSubject.id, 'Semester I');
        const initialMarksMap = {};
        stuList.forEach((s) => {
          const match = existingMarks.find((m) => m.student_id === s.id);
          initialMarksMap[s.id] = {
            internal: match ? match.internal_marks : 25,
            external: match ? match.external_marks : 55,
          };
        });
        setMarksMap(initialMarksMap);

        setIsLoadingStudents(false);
      }
    };
    loadSubjectData();
  }, [selectedSubject]);

  // Handle Marks input change
  const handleMarkChange = (studentId, field, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Save Batch Marks
  const handleSaveMarksSubmit = async (e) => {
    e.preventDefault();
    setMarksToast(null);

    if (!selectedSubject) return;

    setIsSavingMarks(true);

    const payload = students.map((s) => ({
      studentId: s.id,
      subjectId: selectedSubject.id,
      semester: 'Semester I',
      internal: parseFloat(marksMap[s.id]?.internal) || 0,
      external: parseFloat(marksMap[s.id]?.external) || 0,
      credits: 4,
      staffId: currentUser.id,
    }));

    const res = await saveBatchStudentMarks(payload);
    setIsSavingMarks(false);

    if (res.success) {
      setMarksToast({
        type: 'success',
        text: `✅ Examination & Internal Assessment marks for ${students.length} students published successfully!`,
      });
      setTimeout(() => setMarksToast(null), 5000);
    } else {
      setMarksToast({ type: 'error', text: `Failed to save marks: ${res.message}` });
    }
  };

  // Toggle present/absent for a single student
  const toggleAttendance = (studentId) => {
    setPresentMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Mark all students present
  const handleMarkAllPresent = () => {
    const nextMap = {};
    students.forEach((s) => {
      nextMap[s.id] = true;
    });
    setPresentMap(nextMap);
  };

  // Mark all students absent
  const handleMarkAllAbsent = () => {
    const nextMap = {};
    students.forEach((s) => {
      nextMap[s.id] = false;
    });
    setPresentMap(nextMap);
  };

  // Filter roster by search input
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(presentMap).filter(Boolean).length;
  const absentCount = students.length - presentCount;
  const calculatedPercent =
    students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : '0';

  // Handle Sheet Submission
  const handleSubmitSheet = async (e) => {
    e.preventDefault();
    setSubmitToast(null);

    if (!topic.trim()) {
      setSubmitToast({ type: 'error', text: 'Please enter a lecture topic before submitting.' });
      return;
    }

    if (!selectedSubject) return;

    setIsSubmitting(true);

    const presentIds = Object.keys(presentMap).filter((id) => presentMap[id]);

    const res = await submitAttendanceSheet({
      subjectId: selectedSubject.id,
      facultyId: currentUser.id,
      lectureDate,
      topic,
      presentStudentIds: presentIds,
      totalStudentsCount: students.length,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitToast({
        type: 'success',
        text: `✅ Attendance sheet for "${topic}" submitted! ${presentCount} / ${students.length} students marked present (${calculatedPercent}%).`,
      });

      // Refresh past lecture logs
      const updatedLogs = await fetchSubjectLectureLogs(selectedSubject.id);
      setLectureLogs(updatedLogs);

      // Reset topic input
      setTopic('');
      setTimeout(() => setSubmitToast(null), 5000);
    } else {
      setSubmitToast({ type: 'error', text: `Failed to submit sheet: ${res.message}` });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-container">
      <div className="container">

        {/* Faculty Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="user-avatar-badge" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
              FAC
            </div>
            <div className="user-meta">
              <h2>{currentUser.name}</h2>
              <p>
                {currentUser.designation} • <strong>{currentUser.departmentName}</strong>
              </p>
              <div className="user-role-tag student" style={{ background: '#ecfdf5', color: '#047857' }}>
                <UserCheck size={12} /> Faculty Academic Portal
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="btn btn-outline-dark btn-sm" onClick={onBackToHome}>
              College Website
            </button>
            <button className="btn btn-primary btn-sm" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {submitToast && (
          <div className={`alert-message ${submitToast.type}`} style={{ marginBottom: '24px' }}>
            {submitToast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>{submitToast.text}</div>
          </div>
        )}

        {/* Assigned Subjects Cards Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Assigned Subject / Class:
          </div>

          {isLoadingSubjects ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading assigned subjects...</div>
          ) : assignedSubjects.length === 0 ? (
            <div className="alert-message warning">
              <AlertCircle size={20} />
              <div>No subjects allocated to your account yet. Contact department administrator.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {assignedSubjects.map((sub) => {
                const isSelected = selectedSubject?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub)}
                    style={{
                      padding: '14px 20px',
                      borderRadius: 'var(--radius-xl)',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-white)',
                      color: isSelected ? 'white' : 'var(--text-heading)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      boxShadow: isSelected ? '0 4px 12px rgba(217,35,79,0.25)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    <BookOpen size={20} color={isSelected ? 'white' : 'var(--primary)'} />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{sub.name}</strong>
                      <span style={{ fontSize: '11px', opacity: 0.85 }}>
                        Code: <code>{sub.code}</code> • {sub.course}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Faculty Sub-Tab Switcher */}
        <div className="hod-tab-bar" style={{ marginBottom: '20px' }}>
          <button
            className={`hod-tab-btn ${activeFacultyTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveFacultyTab('attendance')}
          >
            <UserCheck size={16} />
            Mark Class Attendance
          </button>
          <button
            className={`hod-tab-btn ${activeFacultyTab === 'marks' ? 'active' : ''}`}
            onClick={() => setActiveFacultyTab('marks')}
          >
            <Award size={16} />
            Examination &amp; Internal Marks Entry
          </button>
        </div>

        {marksToast && (
          <div className={`alert-message ${marksToast.type}`} style={{ marginBottom: '24px' }}>
            {marksToast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>{marksToast.text}</div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 1: LECTURE ATTENDANCE MARKER SHEET    */}
        {/* ═══════════════════════════════════════════ */}
        {selectedSubject && activeFacultyTab === 'attendance' && (
          <div className="dashboard-grid-2">
            
            {/* Left Workspace: Interactive Lecture Sheet Marker */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">
                    <UserCheck size={22} color="var(--primary)" />
                    Mark Class Lecture Attendance Sheet
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Subject: <strong>{selectedSubject.name}</strong> (<code>{selectedSubject.code}</code>)
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="status-pill approved" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {presentCount} Present / {absentCount} Absent ({calculatedPercent}%)
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitSheet}>
                
                {/* Lecture Meta Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }}>
                  
                  {/* Date */}
                  <div className="form-group">
                    <label className="form-label">Lecture Date *</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><Calendar size={16} /></span>
                      <input
                        type="date"
                        className="form-input"
                        value={lectureDate}
                        onChange={(e) => setLectureDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="form-group">
                    <label className="form-label">Lecture Topic / Unit Details *</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><BookOpen size={16} /></span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Unit 3: Kubernetes Pod Scaling & Services"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Toolbar Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-body)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div className="form-input-wrap" style={{ maxWidth: '280px', flex: 1 }}>
                    <span className="form-input-icon"><Search size={15} /></span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: '36px', fontSize: '13px' }}
                      placeholder="Search by Roll No or Student..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-white btn-sm"
                      onClick={handleMarkAllPresent}
                      style={{ fontSize: '11px', color: '#059669', borderColor: '#a7f3d0' }}
                    >
                      <CheckSquare size={14} /> Mark All Present
                    </button>
                    <button
                      type="button"
                      className="btn btn-white btn-sm"
                      onClick={handleMarkAllAbsent}
                      style={{ fontSize: '11px', color: '#dc2626', borderColor: '#fecaca' }}
                    >
                      <Square size={14} /> Clear All
                    </button>
                  </div>
                </div>

                {/* Class Student Roster Grid */}
                <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
                  {isLoadingStudents ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading class student roster...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No approved students found for this class.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {filteredStudents.map((student) => {
                        const isPresent = !!presentMap[student.id];
                        return (
                          <div
                            key={student.id}
                            onClick={() => toggleAttendance(student.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-lg)',
                              border: isPresent ? '2px solid #059669' : '2px solid #fca5a5',
                              background: isPresent ? '#f0fdf4' : '#fef2f2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              userSelect: 'none',
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-heading)' }}>
                                {student.name}
                              </strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Roll: <strong>{student.rollNo}</strong> • <code>{student.prn}</code>
                              </span>
                            </div>

                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '11px',
                                fontWeight: 800,
                                background: isPresent ? '#059669' : '#dc2626',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {isPresent ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {isPresent ? 'PRESENT' : 'ABSENT'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || students.length === 0}
                  style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                >
                  <Send size={18} />
                  {isSubmitting ? 'Calculating & Saving...' : `Submit Attendance Sheet (${presentCount} Present)`}
                </button>

              </form>
            </div>

            {/* Right Workspace: Past Lecture History Log */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <History size={18} color="var(--primary)" />
                  Past Conducted Lectures History
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '580px', overflowY: 'auto' }}>
                {lectureLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No lectures recorded yet for {selectedSubject.name}. Submit your first sheet on the left!
                  </div>
                ) : (
                  lectureLogs.map((log) => {
                    const percent = log.total_students_count > 0
                      ? ((log.present_student_ids.length / log.total_students_count) * 100).toFixed(1)
                      : '0';
                    return (
                      <div
                        key={log.id}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--bg-body)',
                          border: '1px solid var(--border-light)',
                          borderLeft: '4px solid var(--primary)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                            {log.topic}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {log.lecture_date}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Turnout: <strong style={{ color: '#059669' }}>{log.present_student_ids?.length || 0}</strong> / {log.total_students_count}
                          </span>
                          <span className="status-pill approved" style={{ fontSize: '10px', padding: '2px 8px' }}>
                            {percent}% Present
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 2: EXAMINATION & INTERNAL MARKS ENTRY */}
        {/* ═══════════════════════════════════════════ */}
        {selectedSubject && activeFacultyTab === 'marks' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Award size={22} color="var(--primary)" />
                  Enter Subject Internal Assessment &amp; Semester Marks
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Subject: <strong>{selectedSubject.name}</strong> (<code>{selectedSubject.code}</code>) • Term: <strong>Semester I</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Passing Rule: Internal (Min 12/30) • External (Min 28/70) • Total (Min 40/100)
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveMarksSubmit}>
              <div className="table-responsive" style={{ marginBottom: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Roster</th>
                      <th>Permanent PRN</th>
                      <th style={{ width: '140px' }}>Internal Marks (Max 30)</th>
                      <th style={{ width: '140px' }}>End-Sem Theory (Max 70)</th>
                      <th style={{ width: '110px', textAlign: 'center' }}>Total (100)</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Letter Grade</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Result Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          No enrolled students found for this subject.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => {
                        const internalVal = marksMap[student.id]?.internal ?? 25;
                        const externalVal = marksMap[student.id]?.external ?? 55;
                        const totalVal = (parseFloat(internalVal) || 0) + (parseFloat(externalVal) || 0);
                        const gradeResult = calculateGrade(totalVal);

                        return (
                          <tr key={student.id}>
                            <td>
                              <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{student.name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll: {student.rollNo}</span>
                            </td>
                            <td>
                              <code style={{ fontSize: '11px' }}>{student.prn}</code>
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max="30"
                                step="1"
                                className="form-input"
                                style={{ height: '36px', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}
                                value={internalVal}
                                onChange={(e) => handleMarkChange(student.id, 'internal', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max="70"
                                step="1"
                                className="form-input"
                                style={{ height: '36px', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}
                                value={externalVal}
                                onChange={(e) => handleMarkChange(student.id, 'external', e.target.value)}
                                required
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <strong style={{ fontSize: '15px', color: '#1e1b4b' }}>
                                {totalVal}
                              </strong>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>/ 100</span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  background: gradeResult.grade === 'F' ? '#fee2e2' : '#dcfce7',
                                  color: gradeResult.grade === 'F' ? '#b91c1c' : '#15803d',
                                }}
                              >
                                {gradeResult.grade}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                className={`status-pill ${gradeResult.status === 'Pass' ? 'approved' : 'rejected'}`}
                                style={{ fontSize: '11px', padding: '2px 8px' }}
                              >
                                {gradeResult.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingMarks || students.length === 0}
                  style={{ padding: '12px 28px' }}
                >
                  <Save size={16} />
                  {isSavingMarks ? 'Publishing Marks...' : `Save & Publish Marks for ${students.length} Students`}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
