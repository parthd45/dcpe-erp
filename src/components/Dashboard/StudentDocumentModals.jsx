import React, { useState, useRef } from 'react';
import {
  Printer, X, ShieldCheck, QrCode, CheckCircle2,
  Building2, GraduationCap, Calendar, Clock, MapPin, Download, FileText, Award,
  Upload, Camera, FileCheck, Eye, Check, AlertCircle, FileBadge, Shield,
  Image, Folder, ExternalLink, Sparkles, Scan, Percent
} from 'lucide-react';
import { scanDocumentMetrics } from '../../lib/documentScanner';
import './Dashboard.css';

// ─────────────────────────────────────────────────────────────
// 1. OFFICIAL DCPE HVPM STUDENT ID CARD MODAL
// ─────────────────────────────────────────────────────────────
export function StudentIDCardModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  const handlePrint = () => {
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
          maxWidth: '560px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Top Control Bar (Hidden during print) */}
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
            <GraduationCap size={18} color="var(--primary)" />
            Official Student ID Card Preview
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable ID Card Graphic Body */}
        <div style={{ padding: '24px' }}>
          <div
            id="printable-id-card"
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Background Watermark Pattern */}
            <div
              style={{
                position: 'absolute',
                right: '-40px',
                bottom: '-40px',
                opacity: 0.04,
                pointerEvents: 'none',
              }}
            >
              <ShieldCheck size={260} color="#1e1b4b" />
            </div>

            {/* Institution Header Banner */}
            <div
              style={{
                borderBottom: '2px solid var(--primary)',
                paddingBottom: '14px',
                marginBottom: '18px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Shree Hanuman Vyayam Prasarak Mandal's
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  margin: '2px 0',
                  lineHeight: 1.2,
                }}
              >
                DEGREE COLLEGE OF PHYSICAL EDUCATION
              </h3>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Autonomous College • HVPM Campus, Amravati - 444605 (M.S.)
              </div>
            </div>

            {/* ID Card Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center' }}>
              
              {/* Left Photo & Role Badge */}
              <div style={{ textAlign: 'center' }}>
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    style={{
                      width: '110px',
                      height: '130px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      margin: '0 auto 8px',
                      boxShadow: 'var(--shadow-md)',
                      border: '3px solid white',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '110px',
                      height: '130px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #d9234f, #4f46e5)',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      boxShadow: 'var(--shadow-md)',
                      border: '3px solid white',
                    }}
                  >
                    <div style={{ fontSize: '42px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {currentUser.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                      STUDENT
                    </span>
                  </div>
                )}

                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #a7f3d0',
                    display: 'inline-block',
                  }}
                >
                  ✓ VERIFIED
                </div>
              </div>

              {/* Right Student Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Student Name</span>
                  <strong style={{ fontSize: '15px', color: '#1e1b4b', display: 'block', lineHeight: 1.2 }}>
                    {currentUser.name}
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Permanent PRN</span>
                    <code style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>{currentUser.prn}</code>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Roll No</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-heading)' }}>{currentUser.rollNo || 'MCA-26-001'}</strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Course &amp; Department</span>
                  <strong style={{ fontSize: '12px', color: 'var(--text-heading)' }}>{currentUser.course}</strong>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{currentUser.departmentName}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Academic Session</span>
                    <strong>2026 - 2028</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Validity</span>
                    <strong style={{ color: '#059669' }}>JUN 2028</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Bar: QR Code, Barcode & Stamp */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Simulated QR Code SVG */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: '#f1f5f9',
                    padding: 4,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode size={36} color="#1e1b4b" />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>SCAN TO VERIFY</div>
                  <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>DCPE ERP SECURE TOKEN</div>
                </div>
              </div>

              {/* Principal / CoE Stamp Seal */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#1e1b4b', marginBottom: '2px' }}>
                  Dr. V. M. Thakare
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                  Head of Department / Issuing Authority
                </div>
                <div style={{ fontSize: '7px', color: '#059669', fontWeight: 800, marginTop: '2px' }}>
                  OFFICIALLY STAMPED &amp; SIGNED
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. OFFICIAL EXAMINATION HALL TICKET MODAL
// ─────────────────────────────────────────────────────────────
export function ExamHallTicketModal({ currentUser, attendanceStats, onClose }) {
  if (!currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  const isEligible = parseFloat(attendanceStats?.overallPercentage || currentUser.attendance || '90') >= 75;

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
        overflowY: 'auto',
      }}
    >
      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '780px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            <FileText size={18} color="var(--primary)" />
            Examination Hall Ticket Preview
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Ticket Content Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          <div
            id="printable-hall-ticket"
            style={{
              background: 'white',
              border: '2px solid #1e1b4b',
              padding: '28px',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #1e1b4b', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e1b4b', letterSpacing: '0.1em' }}>
                SHREE HANUMAN VYAYAM PRASARAK MANDAL'S
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#d9234f', margin: '4px 0' }}>
                DEGREE COLLEGE OF PHYSICAL EDUCATION, AMRAVATI
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Autonomy Examination Cell • SGBAU Affiliated Autonomous Institute
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: '#1e1b4b',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 16px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  letterSpacing: '0.08em',
                }}
              >
                END SEMESTER EXAMINATION HALL TICKET — ODD SEMESTER 2026
              </div>
            </div>

            {/* Student Candidate Meta & Photo Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: '16px', marginBottom: '20px', alignItems: 'stretch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, width: '130px' }}>Candidate Name:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '13px' }}>{currentUser.name}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, width: '120px' }}>Permanent PRN:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}><code>{currentUser.prn}</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Course &amp; Program:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{currentUser.course}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Examination Seat No:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700, color: 'var(--primary)' }}>
                      SEAT-MCA-2026-042
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Department:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{currentUser.departmentName}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Exam Center:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Main Exam Complex, DCPE Campus</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Overall Attendance:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700, color: isEligible ? '#059669' : '#dc2626' }}>
                      {attendanceStats?.overallPercentage || currentUser.attendance || '90.0%'} ({isEligible ? 'Eligible ✓' : 'Shortage Detained ⚠️'})
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Semester Fee Status:</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', color: '#059669', fontWeight: 700 }}>
                      {currentUser.feesStatus || 'Paid ✓'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Candidate Photograph Box */}
              <div
                style={{
                  border: '2px solid #1e1b4b',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    style={{
                      width: '105px',
                      height: '125px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                      display: 'block',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '105px',
                      height: '125px',
                      borderRadius: '4px',
                      background: '#e2e8f0',
                      border: '1px dashed #94a3b8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    <Camera size={24} style={{ marginBottom: '4px' }} />
                    Affix Photo
                  </div>
                )}
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#1e1b4b', marginTop: '4px', letterSpacing: '0.04em' }}>
                  CANDIDATE PHOTO
                </div>
              </div>
            </div>

            {/* Exam Timetable Schedule Table */}
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e1b4b', marginBottom: '8px' }}>
              📋 Confirmed Examination Schedule:
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#1e1b4b', color: 'white' }}>
                  <th style={{ padding: '8px 12px', border: '1px solid #1e1b4b' }}>Date &amp; Time</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #1e1b4b' }}>Course Code</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #1e1b4b' }}>Subject Title</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #1e1b4b' }}>Hall No</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #1e1b4b', textAlign: 'center' }}>Invigilator Sign</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><strong>25-AUG-2026</strong> (10:00 AM - 01:00 PM)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><code>MCA-101</code></td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Cloud Computing &amp; DevOps</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Lab 3</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><strong>27-AUG-2026</strong> (10:00 AM - 01:00 PM)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><code>MCA-102</code></td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Advanced Database Systems</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Room 204</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><strong>29-AUG-2026</strong> (10:00 AM - 01:00 PM)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}><code>MCA-103</code></td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Software Engineering &amp; Agile</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Main Hall</td>
                  <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
                </tr>
              </tbody>
            </table>

            {/* Candidate Rules */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#92400e', marginBottom: '24px' }}>
              <strong>Important Candidate Rules:</strong>
              <ol style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                <li>Candidates must bring this original Hall Ticket and valid College ID Card to every examination session.</li>
                <li>Mobile phones, smartwatches, and programmable devices are strictly prohibited in the exam hall.</li>
                <li>Report to the examination center at least 20 minutes before commencement.</li>
              </ol>
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px' }}>
              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{ height: '32px', borderBottom: '1px solid #94a3b8', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Candidate's Signature</div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 800 }}>VERIFIED BY COE CELL</div>
                <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} color="#1e1b4b" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b' }}>Controller of Examinations</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>DCPE HVPM Autonomous College</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. OFFICIAL DIGITAL MARKSHEET / GRADE REPORT MODAL
// ─────────────────────────────────────────────────────────────
export function DigitalMarksheetModal({ currentUser, gradeReport, onClose }) {
  if (!currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  // Fallback demo subjects if no marks entered in DB yet
  const displaySubjects = gradeReport?.subjects?.length > 0
    ? gradeReport.subjects
    : [
        { code: 'MCA-101', name: 'Cloud Computing & DevOps', credits: 4, internalMarks: 28, externalMarks: 64, totalMarks: 92, letterGrade: 'O', gradePoint: 10, creditPoints: 40 },
        { code: 'MCA-102', name: 'Advanced Database Systems', credits: 4, internalMarks: 26, externalMarks: 58, totalMarks: 84, letterGrade: 'A+', gradePoint: 9, creditPoints: 36 },
        { code: 'MCA-103', name: 'Software Engineering & Agile', credits: 4, internalMarks: 27, externalMarks: 61, totalMarks: 88, letterGrade: 'A+', gradePoint: 9, creditPoints: 36 },
      ];

  const totalCredits = displaySubjects.reduce((sum, s) => sum + (parseFloat(s.credits) || 4), 0);
  const totalCreditPoints = displaySubjects.reduce((sum, s) => sum + (parseFloat(s.creditPoints) || 0), 0);
  const calculatedSgpa = gradeReport?.sgpa || (totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : '9.33');
  const resultClassification = gradeReport?.resultClassification || 'PASS WITH DISTINCTION';

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
        overflowY: 'auto',
      }}
    >
      <div
        className="printable-document-container"
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '820px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Control Bar */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-heading)' }}>
            <Award size={18} color="var(--primary)" />
            Official Semester Grade Report &amp; Marksheet
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save Marksheet PDF
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          <div
            id="printable-marksheet"
            style={{
              background: 'white',
              border: '2px solid #1e1b4b',
              padding: '28px',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e1b4b', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.12em' }}>
                SHREE HANUMAN VYAYAM PRASARAK MANDAL'S
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#1e1b4b', margin: '4px 0' }}>
                DEGREE COLLEGE OF PHYSICAL EDUCATION
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                An Autonomous Institute • Affiliated to Sant Gadge Baba Amravati University (SGBAU)
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 18px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  letterSpacing: '0.08em',
                }}
              >
                STATEMENT OF MARKS &amp; GRADES — SEMESTER I EXAMINATION (2026-2027)
              </div>
            </div>

            {/* Candidate Metadata Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, width: '140px' }}>Student Name:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '14px', color: '#1e1b4b' }}>{currentUser.name}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700, width: '130px' }}>Permanent PRN:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}><code>{currentUser.prn}</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Course &amp; Program:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{currentUser.course}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>College Roll No:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{currentUser.rollNo || 'MCA-26-001'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Department:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{currentUser.departmentName}</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 700 }}>Academic Term:</td>
                  <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>Semester I (Winter 2026)</td>
                </tr>
              </tbody>
            </table>

            {/* Subject Marks Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#1e1b4b', color: 'white' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #1e1b4b', textAlign: 'left' }}>Course Code &amp; Title</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Credits</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Internal (30)</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>External (70)</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Total (100)</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Grade Point</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Letter Grade</th>
                  <th style={{ padding: '8px 8px', border: '1px solid #1e1b4b' }}>Credit Points</th>
                </tr>
              </thead>
              <tbody>
                {displaySubjects.map((sub, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 1 ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <strong style={{ display: 'block', color: 'var(--text-heading)' }}>{sub.name}</strong>
                      <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.code}</code>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{sub.credits || 4}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{sub.internalMarks}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{sub.externalMarks}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#1e1b4b' }}>{sub.totalMarks}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{sub.gradePoint}</td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '11px',
                          background: sub.letterGrade === 'F' ? '#fee2e2' : '#dcfce7',
                          color: sub.letterGrade === 'F' ? '#b91c1c' : '#15803d',
                        }}
                      >
                        {sub.letterGrade}
                      </span>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: 'var(--primary)' }}>
                      {sub.creditPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Performance Summary Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                background: '#f8fafc',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Semester Credits</span>
                <strong style={{ fontSize: '16px', color: '#1e1b4b' }}>{totalCredits}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Credit Points</span>
                <strong style={{ fontSize: '16px', color: '#1e1b4b' }}>{totalCreditPoints}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Semester SGPA</span>
                <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>{calculatedSgpa} / 10.0</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Final Result</span>
                <strong style={{ fontSize: '13px', color: '#059669', display: 'block', marginTop: '2px' }}>
                  {resultClassification}
                </strong>
              </div>
            </div>

            {/* Grading Scale Reference */}
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginBottom: '24px' }}>
              <strong>SGBAU Autonomous 10-Point Grading Scale:</strong> O (90-100%): 10 | A+ (80-89%): 9 | A (70-79%): 8 | B+ (60-69%): 7 | B (55-59%): 6 | C (50-54%): 5 | P (40-49%): 4 | F (&lt;40%): 0
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px' }}>
              <div style={{ textAlign: 'center', width: '160px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>Date: 22-AUG-2026</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Amravati, Maharashtra</div>
              </div>

              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={26} color="#059669" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b' }}>Controller of Examinations</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>DCPE Autonomous Board</div>
              </div>

              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{ height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={26} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e1b4b' }}>Principal / Director</div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>DCPE HVPM Amravati</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. STUDENT DOCUMENT & PHOTO UPLOAD MODAL (Student View)
// ─────────────────────────────────────────────────────────────
export function StudentDocumentUploadModal({ currentUser, onSave, onClose }) {
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');
  
  // Real document names and base64 data (strictly no fake data)
  const [doc10th, setDoc10th] = useState(
    currentUser?.docMarksheet10th
      ? (currentUser.docMarksheet10th.startsWith('data:') ? 'Uploaded_10th_Marksheet.pdf' : currentUser.docMarksheet10th)
      : ''
  );
  const [doc10thData, setDoc10thData] = useState(currentUser?.docMarksheet10th || null);
  const [score10th, setScore10th] = useState(currentUser?.score10th || '');

  const [doc12th, setDoc12th] = useState(
    currentUser?.docMarksheet12th
      ? (currentUser.docMarksheet12th.startsWith('data:') ? 'Uploaded_12th_Marksheet.pdf' : currentUser.docMarksheet12th)
      : ''
  );
  const [doc12thData, setDoc12thData] = useState(currentUser?.docMarksheet12th || null);
  const [score12th, setScore12th] = useState(currentUser?.score12th || '');

  const [docGrad, setDocGrad] = useState(
    currentUser?.docGradMarksheet
      ? (currentUser.docGradMarksheet.startsWith('data:') ? 'Uploaded_Graduation_Marksheet.pdf' : currentUser.docGradMarksheet)
      : ''
  );
  const [docGradData, setDocGradData] = useState(currentUser?.docGradMarksheet || null);
  const [scoreGrad, setScoreGrad] = useState(currentUser?.scoreGrad || '');

  const [docAadhaar, setDocAadhaar] = useState(
    currentUser?.docIdProof
      ? (currentUser.docIdProof.startsWith('data:') ? 'Uploaded_Aadhaar_ID.pdf' : currentUser.docIdProof)
      : ''
  );
  const [docAadhaarData, setDocAadhaarData] = useState(currentUser?.docIdProof || null);
  const [scoreAadhaar, setScoreAadhaar] = useState(currentUser?.scoreAadhaar || '');

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Hidden file input refs
  const photoInputRef = useRef(null);
  const doc10thRef = useRef(null);
  const doc12thRef = useRef(null);
  const docGradRef = useRef(null);
  const docAadhaarRef = useRef(null);

  // Handle Photo selection from device / gallery
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ type: 'error', text: 'Please select an image smaller than 5MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
        setToast({ type: 'success', text: `📸 Photo "${file.name}" loaded from device!` });
        setTimeout(() => setToast(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Document selection from device & run automatic real scanner
  const handleDocFileSelect = (nameSetter, dataSetter, scoreSetter, docLabel, docType) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      nameSetter(file.name);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        dataSetter(dataUrl);

        // Run client-side document scanner on the uploaded file
        const scannedResult = await scanDocumentMetrics(dataUrl, docType);
        if (scannedResult) {
          scoreSetter(scannedResult);
        }

        setToast({
          type: 'success',
          text: `📄 ${docLabel} "${file.name}" (${(file.size / 1024).toFixed(1)} KB) scanned & loaded!`,
        });
        setTimeout(() => setToast(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setToast(null);

    const res = await onSave(currentUser.id, {
      photoUrl,
      docMarksheet10th: doc10thData || doc10th,
      docMarksheet12th: doc12thData || doc12th,
      docGradMarksheet: docGradData || docGrad,
      docIdProof: docAadhaarData || docAadhaar,
      score10th,
      score12th,
      scoreGrad,
      scoreAadhaar,
      docStatus: 'Uploaded - Awaiting HOD Verification',
    });

    setIsUploading(false);

    if (res?.success !== false) {
      setToast({ type: 'success', text: '✅ Your real documents & marks saved and submitted for HOD verification!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setToast({ type: 'error', text: res.message || 'Failed to update documents.' });
    }
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
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '660px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>
                Upload Profile Photo &amp; Documents
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                PRN: <code>{currentUser?.prn}</code> • {currentUser?.course}
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {toast && (
          <div className={`alert-message ${toast.type}`} style={{ marginBottom: '18px' }}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>{toast.text}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Passport Photo From Device Gallery */}
          <div style={{ background: 'var(--bg-body)', padding: '18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Camera size={16} color="var(--primary)" />
              Official Passport Photo (Select from Device / Gallery)
            </label>

            {/* Hidden Photo File Input */}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Passport Photo Preview"
                    style={{
                      width: '84px',
                      height: '100px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '3px solid white',
                      boxShadow: 'var(--shadow-md)',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '84px',
                      height: '100px',
                      borderRadius: '12px',
                      background: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '11px',
                      textAlign: 'center',
                      padding: '8px',
                    }}
                  >
                    No Photo
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  title="Change Photo from Gallery"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Image size={16} /> Choose Photo from Gallery / Device
                </button>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, JPEG, WEBP (Max 5MB). Photo will be rendered on your Student ID Card.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Admission Document Certificates (Real Scanner) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scan size={16} color="var(--primary)" /> Admission Certificates (Automatic PDF &amp; Document Text Scanner):
            </div>

            {/* 1. 10th SSC */}
            <input
              type="file"
              ref={doc10thRef}
              accept=".pdf,image/png,image/jpeg,image/jpg"
              style={{ display: 'none' }}
              onChange={handleDocFileSelect(setDoc10th, setDoc10thData, setScore10th, '10th Marksheet', 'marksheet')}
            />
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '12px', margin: 0 }}>1. 10th Standard SSC Marksheet (PDF / Image) *</label>
                {score10th && (
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    ✨ {score10th}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="form-input-wrap" style={{ flex: 1 }}>
                  <span className="form-input-icon"><FileCheck size={16} color="#059669" /></span>
                  <input
                    type="text"
                    className="form-input"
                    value={doc10th.startsWith('data:') ? 'Uploaded_10th_Marksheet.pdf' : doc10th}
                    readOnly
                    placeholder="No file chosen"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                  onClick={() => doc10thRef.current?.click()}
                >
                  <Folder size={14} /> Browse Device
                </button>
              </div>
            </div>

            {/* 2. 12th HSC */}
            <input
              type="file"
              ref={doc12thRef}
              accept=".pdf,image/png,image/jpeg,image/jpg"
              style={{ display: 'none' }}
              onChange={handleDocFileSelect(setDoc12th, setDoc12thData, setScore12th, '12th Marksheet', 'marksheet')}
            />
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '12px', margin: 0 }}>2. 12th Standard HSC / Diploma Marksheet (PDF / Image) *</label>
                {score12th && (
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    ✨ {score12th}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="form-input-wrap" style={{ flex: 1 }}>
                  <span className="form-input-icon"><FileCheck size={16} color="#059669" /></span>
                  <input
                    type="text"
                    className="form-input"
                    value={doc12th.startsWith('data:') ? 'Uploaded_12th_Marksheet.pdf' : doc12th}
                    readOnly
                    placeholder="No file chosen"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                  onClick={() => doc12thRef.current?.click()}
                >
                  <Folder size={14} /> Browse Device
                </button>
              </div>
            </div>

            {/* 3. Graduation */}
            <input
              type="file"
              ref={docGradRef}
              accept=".pdf,image/png,image/jpeg,image/jpg"
              style={{ display: 'none' }}
              onChange={handleDocFileSelect(setDocGrad, setDocGradData, setScoreGrad, 'Graduation Marksheet', 'marksheet')}
            />
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '12px', margin: 0 }}>3. Graduation / Degree Marksheet (PDF / Image) *</label>
                {scoreGrad && (
                  <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    ✨ {scoreGrad}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="form-input-wrap" style={{ flex: 1 }}>
                  <span className="form-input-icon"><FileCheck size={16} color="#059669" /></span>
                  <input
                    type="text"
                    className="form-input"
                    value={docGrad.startsWith('data:') ? 'Uploaded_Graduation_Marksheet.pdf' : docGrad}
                    readOnly
                    placeholder="No file chosen"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                  onClick={() => docGradRef.current?.click()}
                >
                  <Folder size={14} /> Browse Device
                </button>
              </div>
            </div>

            {/* 4. Aadhaar ID */}
            <input
              type="file"
              ref={docAadhaarRef}
              accept=".pdf,image/png,image/jpeg,image/jpg"
              style={{ display: 'none' }}
              onChange={handleDocFileSelect(setDocAadhaar, setDocAadhaarData, setScoreAadhaar, 'Aadhaar ID Proof', 'aadhaar')}
            />
            <div className="form-group" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontSize: '12px', margin: 0 }}>4. Aadhaar Card / National ID Proof (PDF / Image) *</label>
                {scoreAadhaar && (
                  <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    🛡️ {scoreAadhaar}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="form-input-wrap" style={{ flex: 1 }}>
                  <span className="form-input-icon"><Shield size={16} color="#2563eb" /></span>
                  <input
                    type="text"
                    className="form-input"
                    value={docAadhaar.startsWith('data:') ? 'Uploaded_Aadhaar_ID.pdf' : docAadhaar}
                    readOnly
                    placeholder="No file chosen"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-white btn-sm"
                  style={{ border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}
                  onClick={() => docAadhaarRef.current?.click()}
                >
                  <Folder size={14} /> Browse Device
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isUploading}>
              <Upload size={14} />
              {isUploading ? 'Scanning & Uploading...' : 'Save & Submit Documents'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HOD DOCUMENT VERIFICATION & INSPECTION MODAL
// ─────────────────────────────────────────────────────────────
export function DocumentVerificationModal({ student, onUpdateStatus, onClose }) {
  if (!student) return null;

  const [verifiedDocs, setVerifiedDocs] = useState({
    doc10th: true,
    doc12th: true,
    docGrad: true,
    docAadhaar: true,
  });

  const [verificationNote, setVerificationNote] = useState('All admission documents and marks verified against university entrance register.');
  const [isSaving, setIsSaving] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const toggleDoc = (key) => {
    setVerifiedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApproveDocs = async () => {
    setIsSaving(true);
    await onUpdateStatus(student.id, {
      docStatus: 'Verified ✓',
    });
    setIsSaving(false);
    onClose();
  };

  const handleRequestResubmit = async () => {
    setIsSaving(true);
    await onUpdateStatus(student.id, {
      docStatus: 'Resubmission Required: ' + verificationNote,
    });
    setIsSaving(false);
    onClose();
  };

  const getDocDisplayName = (val) => {
    if (!val) return 'No file uploaded yet';
    if (val.startsWith('data:image')) return 'Uploaded_Scanned_Image.png';
    if (val.startsWith('data:application/pdf')) return 'Uploaded_Document.pdf';
    return val;
  };

  const docList = [
    {
      key: 'doc10th',
      label: '10th Standard SSC Marksheet',
      filename: getDocDisplayName(student.docMarksheet10th),
      fileContent: student.docMarksheet10th,
      score: student.score10th || (student.docMarksheet10th ? 'Document Attached' : null),
      badgeType: 'marks',
      hasFile: Boolean(student.docMarksheet10th),
    },
    {
      key: 'doc12th',
      label: '12th Standard HSC Marksheet',
      filename: getDocDisplayName(student.docMarksheet12th),
      fileContent: student.docMarksheet12th,
      score: student.score12th || (student.docMarksheet12th ? 'Document Attached' : null),
      badgeType: 'marks',
      hasFile: Boolean(student.docMarksheet12th),
    },
    {
      key: 'docGrad',
      label: 'Graduation Qualifying Marksheet',
      filename: getDocDisplayName(student.docGradMarksheet),
      fileContent: student.docGradMarksheet,
      score: student.scoreGrad || (student.docGradMarksheet ? 'Document Attached' : null),
      badgeType: 'marks',
      hasFile: Boolean(student.docGradMarksheet),
    },
    {
      key: 'docAadhaar',
      label: 'Aadhaar / National ID Proof',
      filename: getDocDisplayName(student.docIdProof),
      fileContent: student.docIdProof,
      score: 'UIDAI Govt ID Proof',
      badgeType: 'id',
      hasFile: Boolean(student.docIdProof),
    },
  ];

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
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '680px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileBadge size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>
                HOD Document Verification &amp; Inspection
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Candidate: <strong>{student.name}</strong> • PRN: <code>{student.prn}</code>
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Student Profile Snapshot Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-body)', padding: '16px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-light)' }}>
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.name}
              style={{ width: 64, height: 76, borderRadius: 10, objectFit: 'cover', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}
            />
          ) : (
            <div style={{ width: 64, height: 76, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
              {student.name.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '15px', color: 'var(--text-heading)', display: 'block' }}>{student.name}</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{student.course} • {student.departmentName}</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="status-pill approved" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Status: {student.docStatus || 'Pending Upload'}
              </span>
              <span className="status-pill blue" style={{ fontSize: '10px', padding: '2px 8px' }}>
                PRN: {student.prn}
              </span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Verification Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>
            Click &quot;View Document&quot; to inspect actual uploaded student certificates:
          </div>

          {docList.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={verifiedDocs[item.key]}
                  onChange={() => toggleDoc(item.key)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#059669' }}
                  title="Toggle document verified status"
                />
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-heading)' }}>{item.label}</strong>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                    <code style={{ fontSize: '11px', color: item.hasFile ? 'var(--text-heading)' : '#94a3b8' }}>{item.filename}</code>
                    {item.score && item.hasFile && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: item.badgeType === 'id' ? '#dbeafe' : '#dcfce7',
                          color: item.badgeType === 'id' ? '#1d4ed8' : '#15803d',
                          padding: '1px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        {item.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.hasFile ? (
                  <button
                    type="button"
                    className="btn btn-white btn-sm"
                    style={{ fontSize: '11px', padding: '5px 12px', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary)' }}
                    onClick={() => setPreviewDoc(item)}
                  >
                    <Eye size={14} color="var(--primary)" /> View Document
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', padding: '4px 8px' }}>
                    Not uploaded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Verification Note */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ fontSize: '12px' }}>HOD Verification Comments / Remarks</label>
          <textarea
            className="form-input"
            rows="2"
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={handleRequestResubmit} disabled={isSaving}>
            Request Resubmission
          </button>
          <button type="button" className="btn btn-primary btn-sm" style={{ background: '#059669' }} onClick={handleApproveDocs} disabled={isSaving}>
            <Check size={14} />
            {isSaving ? 'Verifying...' : 'Mark All Documents Verified ✓'}
          </button>
        </div>

        {/* ── Document Inspection Viewer Overlay (Displays Actual Real File) ── */}
        {previewDoc && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '720px',
                width: '100%',
                boxShadow: 'var(--shadow-2xl)',
                padding: '28px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>{previewDoc.label}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real File: <code>{previewDoc.filename}</code></span>
                  </div>
                </div>
                <button className="btn btn-white btn-sm" onClick={() => setPreviewDoc(null)}>
                  <X size={16} />
                </button>
              </div>

              {/* View Real Document Content */}
              {previewDoc.fileContent?.startsWith('data:image') ? (
                <div style={{ textAlign: 'center', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <img
                    src={previewDoc.fileContent}
                    alt={previewDoc.label}
                    style={{ maxWidth: '100%', maxHeight: '520px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <div style={{ marginTop: '12px' }}>
                    <a href={previewDoc.fileContent} download={previewDoc.filename} className="btn btn-outline-dark btn-sm" style={{ fontSize: '11px' }}>
                      <Download size={13} /> Download Uploaded Scanned File
                    </a>
                  </div>
                </div>
              ) : previewDoc.fileContent?.startsWith('data:application/pdf') ? (
                <div style={{ marginBottom: '20px' }}>
                  <iframe
                    src={previewDoc.fileContent}
                    title={previewDoc.label}
                    style={{ width: '100%', height: '520px', border: '1px solid #cbd5e1', borderRadius: '12px' }}
                  />
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Student Score: <strong>{previewDoc.score}</strong></span>
                    <a href={previewDoc.fileContent} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm" style={{ fontSize: '11px' }}>
                      <ExternalLink size={13} /> Open Full PDF in New Tab / Window
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                  <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                  <h4 style={{ margin: '0 0 6px', color: 'var(--text-heading)', fontSize: '15px' }}>No Document Uploaded</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    The student has not uploaded a file for this certificate yet.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setPreviewDoc(null)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669' }}
                  onClick={() => {
                    setVerifiedDocs((prev) => ({ ...prev, [previewDoc.key]: true }));
                    setPreviewDoc(null);
                  }}
                >
                  <Check size={14} /> Mark Verified ✓
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}


