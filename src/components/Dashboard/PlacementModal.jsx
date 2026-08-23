import React, { useState, useEffect } from 'react';
import {
  Briefcase, Building2, MapPin, Calendar, Clock, Award,
  CheckCircle2, AlertCircle, X, ChevronRight, Send, User,
  FileText, ExternalLink, Filter, Sparkles, ShieldCheck, Check
} from 'lucide-react';
import { fetchPlacementDrives, applyForPlacementDrive, fetchStudentApplications } from '../../lib/placementService';
import './Dashboard.css';

export function PlacementModal({ currentUser, onClose }) {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'my_applications'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'eligible' | 'internship' | 'fulltime'
  
  // Apply Modal state
  const [applyingDrive, setApplyingDrive] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessToast, setApplySuccessToast] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const driveList = await fetchPlacementDrives();
    setDrives(driveList);

    if (currentUser?.id) {
      const myApps = await fetchStudentApplications(currentUser.id);
      setApplications(myApps);
    }
    setLoading(false);
  };

  // Parse CGPA cleanly from strings like "10", "8.75 CGPA", "9.2"
  const rawCgpa = String(currentUser?.cgpa || '').replace(/[^0-9.]/g, '');
  const studentCgpa = rawCgpa ? parseFloat(rawCgpa) : 8.50;

  const isEligible = (drive) => {
    const meetsCgpa = studentCgpa >= (parseFloat(drive.minCgpa) || 0);

    const studentCourse = (currentUser?.course || '').toUpperCase();
    const studentDeptId = (currentUser?.department || currentUser?.departmentName || '').toLowerCase();

    // 1. Course Match: check if student's course matches any of drive's eligible courses
    let meetsCourse = true;
    if (Array.isArray(drive.eligibleCourses) && drive.eligibleCourses.length > 0) {
      meetsCourse = drive.eligibleCourses.some((c) => {
        const cUpper = c.toUpperCase().trim();
        if (!cUpper) return false;
        if (cUpper.includes('MCA') && studentCourse.includes('MCA')) return true;
        if (cUpper.includes('BCA') && studentCourse.includes('BCA')) return true;
        if (cUpper.includes('B.P.ED') && (studentCourse.includes('B.P.ED') || studentCourse.includes('BPED'))) return true;
        if (cUpper.includes('M.P.ED') && (studentCourse.includes('M.P.ED') || studentCourse.includes('MPED'))) return true;
        if (cUpper.includes('B.TECH') && (studentCourse.includes('B.TECH') || studentCourse.includes('BTECH'))) return true;
        if (cUpper.includes('M.SC') && studentCourse.includes('M.SC')) return true;
        if (cUpper.includes('B.SC') && (studentCourse.includes('B.SC') || studentCourse.includes('BSC')) && !cUpper.includes('B.P.ED')) return true;
        return false;
      });
    }

    // 2. Department Match: check department alignment
    let meetsDept = true;
    if (Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0) {
      meetsDept = drive.eligibleDepartments.some((d) => {
        const dUpper = d.toUpperCase().trim();
        if (studentDeptId.includes('cs') || studentDeptId.includes('science')) {
          return dUpper.includes('COMPUTER') || dUpper.includes('SCIENCE & IT') || dUpper.includes('INFORMATION');
        }
        if (studentDeptId.includes('phy') || studentDeptId.includes('ed') || studentDeptId.includes('sports')) {
          return dUpper.includes('PHYSICAL') || (dUpper.includes('SPORTS') && !dUpper.includes('SCIENCE & IT'));
        }
        if (studentDeptId.includes('commerce')) {
          return dUpper.includes('COMMERCE') || dUpper.includes('MANAGEMENT') || dUpper.includes('BBA');
        }
        if (studentDeptId.includes('yoga')) {
          return dUpper.includes('YOGA') || dUpper.includes('WELLNESS') || dUpper.includes('NATUROPATHY');
        }
        return true;
      });
    }

    const eligible = meetsCgpa && meetsCourse && meetsDept;

    return {
      eligible,
      meetsCgpa,
      meetsCourse,
      meetsDept,
    };
  };

  const hasApplied = (driveId) => {
    return applications.some((a) => a.driveId === driveId);
  };

  const handleConfirmApply = async () => {
    if (!applyingDrive || !currentUser) return;
    setIsApplying(true);
    const res = await applyForPlacementDrive(applyingDrive, currentUser);
    setIsApplying(false);

    if (res.success) {
      setApplySuccessToast(`🎉 Application submitted to ${applyingDrive.companyName}!`);
      setApplyingDrive(null);
      await loadData();
      setTimeout(() => setApplySuccessToast(null), 4000);
    } else {
      alert(res.message || 'Failed to apply.');
    }
  };

  // Filter drives
  const filteredDrives = drives.filter((drive) => {
    const { eligible } = isEligible(drive);
    if (selectedCategory === 'eligible') return eligible;
    if (selectedCategory === 'internship') return drive.jobType?.toLowerCase().includes('intern');
    if (selectedCategory === 'fulltime') return !drive.jobType?.toLowerCase().includes('intern');
    return true;
  });

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
          maxWidth: '900px',
          width: '100%',
          boxShadow: 'var(--shadow-2xl)',
          padding: '28px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
                Training &amp; Placement (T&amp;P) Cell Hub
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Degree College of Physical Education (DCPE HVPM) • Campus Recruitment 2026
              </span>
            </div>
          </div>
          <button className="btn btn-white btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Placement Metrics Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highest Package</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>₹9.50 LPA</div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>Infosys Power Prog.</div>
          </div>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Average CTC</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>₹7.20 LPA</div>
            <div style={{ fontSize: '11px', color: '#047857' }}>Across All Branches</div>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase' }}>Active Drives</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af', marginTop: '4px' }}>{drives.length} Companies</div>
            <div style={{ fontSize: '11px', color: '#1d4ed8' }}>Open for Applications</div>
          </div>
          <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '16px', borderRadius: '16px' }}>
            <div style={{ fontSize: '11px', color: '#a21caf', fontWeight: 600, textTransform: 'uppercase' }}>My Applications</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#86198f', marginTop: '4px' }}>{applications.length} Drives</div>
            <div style={{ fontSize: '11px', color: '#a21caf' }}>Applied &amp; Tracking</div>
          </div>
        </div>

        {applySuccessToast && (
          <div className="alert-message success" style={{ marginBottom: '18px' }}>
            <CheckCircle2 size={18} />
            <div>{applySuccessToast}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'drives' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('drives')}
              style={{ fontWeight: 700 }}
            >
              <Building2 size={14} /> Campus Placement Drives ({filteredDrives.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'my_applications' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('my_applications')}
              style={{ fontWeight: 700 }}
            >
              <Send size={14} /> My Applications &amp; Status ({applications.length})
            </button>
          </div>

          {activeTab === 'drives' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-outline-primary' : 'btn-white'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${selectedCategory === 'eligible' ? 'btn-outline-primary' : 'btn-white'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSelectedCategory('eligible')}
              >
                ✨ Eligible for Me
              </button>
              <button
                className={`btn btn-sm ${selectedCategory === 'fulltime' ? 'btn-outline-primary' : 'btn-white'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setSelectedCategory('fulltime')}
              >
                Full-Time
              </button>
            </div>
          )}
        </div>

        {/* ── TAB 1: PLACEMENT DRIVES LIST ── */}
        {activeTab === 'drives' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Loading recruitment drives...
              </div>
            ) : filteredDrives.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--bg-body)', borderRadius: '16px' }}>
                No campus drives match this filter criteria.
              </div>
            ) : (
              filteredDrives.map((drive) => {
                const { eligible, meetsCgpa, meetsCourse } = isEligible(drive);
                const applied = hasApplied(drive.id);

                return (
                  <div
                    key={drive.id}
                    style={{
                      background: 'var(--bg-body)',
                      borderRadius: '16px',
                      border: eligible ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                      padding: '20px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <img
                          src={drive.companyLogo}
                          alt={drive.companyName}
                          style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                        />
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
                            {drive.jobTitle}
                          </h4>
                          <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{drive.companyName}</strong>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={13} /> {drive.location}
                            </span>
                            <span>•</span>
                            <span style={{ fontWeight: 700, color: '#059669' }}>{drive.packageCtc}</span>
                            <span>•</span>
                            <span className="status-pill blue" style={{ fontSize: '10px' }}>{drive.jobType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {applied ? (
                          <span className="status-pill approved" style={{ fontSize: '11px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Check size={14} /> Applied ✓
                          </span>
                        ) : eligible ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ padding: '8px 18px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setApplyingDrive(drive)}
                          >
                            <Send size={14} /> Apply Now
                          </button>
                        ) : (
                          <button
                            className="btn btn-white btn-sm"
                            disabled
                            style={{ fontSize: '11px', padding: '6px 12px', opacity: 0.6 }}
                            title="You do not meet the minimum criteria for this drive"
                          >
                            Not Eligible
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px' }}>
                      {drive.jobDescription}
                    </p>

                    {/* Eligibility & Details Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span>
                          Eligible Courses: <strong>{drive.eligibleCourses?.join(', ')}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Min CGPA: <strong>{drive.minCgpa}</strong> {meetsCgpa ? '✓' : `(Your CGPA: ${studentCgpa})`}
                        </span>
                      </div>
                      <div style={{ color: '#b91c1c', fontWeight: 600 }}>
                        ⏳ Deadline: {drive.deadline}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── TAB 2: MY APPLICATIONS TRACKER ── */}
        {activeTab === 'my_applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-body)', borderRadius: '16px' }}>
                <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--text-heading)' }}>No Applications Yet</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  Explore active campus drives and submit your profile with 1-click!
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('drives')}>
                  Browse Campus Drives
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: 'var(--bg-body)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontSize: '16px', color: 'var(--text-heading)' }}>{app.jobTitle}</h4>
                      <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{app.companyName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                        Applied on: {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${
                        app.applicationStatus.includes('Selected')
                          ? 'approved'
                          : app.applicationStatus.includes('Rejected')
                          ? 'pending'
                          : 'blue'
                      }`}
                      style={{ fontSize: '12px', padding: '4px 12px', fontWeight: 700 }}
                    >
                      {app.applicationStatus}
                    </span>
                  </div>

                  {/* Visual Hiring Progress Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                    {['Applied', 'Shortlisted', 'Technical Interview', 'Selected - Offer Issued'].map((stage, idx) => {
                      const stages = ['Applied', 'Shortlisted', 'Technical Interview', 'Selected - Offer Issued'];
                      const currentIdx = stages.indexOf(app.applicationStatus);
                      const isCompleted = currentIdx >= idx;

                      return (
                        <div
                          key={stage}
                          style={{
                            textAlign: 'center',
                            background: isCompleted ? '#dcfce7' : 'white',
                            color: isCompleted ? '#15803d' : '#94a3b8',
                            border: isCompleted ? '1px solid #86efac' : '1px solid #e2e8f0',
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          {isCompleted ? '✓ ' : ''}{stage}
                        </div>
                      );
                    })}
                  </div>

                  {/* TPO Remarks */}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    💬 <strong>TPO Remarks:</strong> {app.tpoRemarks || 'Under preliminary evaluation by recruitment panel.'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 1-CLICK APPLY CONFIRMATION MODAL ── */}
        {applyingDrive && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1100,
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
                maxWidth: '540px',
                width: '100%',
                boxShadow: 'var(--shadow-2xl)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', color: 'var(--text-heading)' }}>Confirm Application</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{applyingDrive.companyName}</span>
                  </div>
                </div>
                <button className="btn btn-white btn-sm" onClick={() => setApplyingDrive(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: 'var(--bg-body)', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Candidate:</span> <strong style={{ display: 'block' }}>{currentUser?.name}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>PRN:</span> <code style={{ display: 'block' }}>{currentUser?.prn}</code></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> <strong style={{ display: 'block' }}>{currentUser?.course}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Current CGPA:</span> <strong style={{ display: 'block', color: '#059669' }}>{studentCgpa} CGPA</strong></div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', fontSize: '11px', color: '#1d4ed8', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                ✓ Your official academic record, marksheet grades, and verified credentials will be transmitted to {applyingDrive.companyName} T&amp;P coordination team.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setApplyingDrive(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ background: '#059669' }}
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                >
                  <Send size={14} />
                  {isApplying ? 'Submitting Application...' : 'Confirm & Apply 🚀'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
