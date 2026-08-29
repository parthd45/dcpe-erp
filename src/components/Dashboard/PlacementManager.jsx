import React, { useState, useEffect } from 'react';
import {
  Briefcase, Plus, Users, Award, CheckCircle2, XCircle,
  Building2, Search, Filter, Send, Edit3, ChevronRight,
  MapPin, Calendar, Clock, DollarSign, Sparkles
} from 'lucide-react';
import {
  fetchPlacementDrives,
  fetchAllApplications,
  createPlacementDrive,
  updateApplicationStatus
} from '../../lib/placementService';
import './Dashboard.css';

export default function PlacementManager() {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'drives' | 'new_drive'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driveFilter, setDriveFilter] = useState('all');

  // New Drive Form
  const [newDrive, setNewDrive] = useState({
    companyName: '',
    jobTitle: '',
    jobType: 'Full-Time Campus Drive',
    packageCtc: '',
    location: '',
    eligibleCourses: ['MCA', 'B.Tech'],
    minCgpa: 6.5,
    minAttendance: 75.0,
    deadline: '',
    driveDate: '',
    jobDescription: '',
    selectionRounds: 'Online Assessment -> Technical Interview -> HR Round',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const driveList = await fetchPlacementDrives();
    const appList = await fetchAllApplications();
    setDrives(driveList);
    setApplications(appList);
    setLoading(false);
  };

  const handleStatusChange = async (appId, newStatus) => {
    await updateApplicationStatus(appId, newStatus, `Candidate status updated to ${newStatus} by T&P Officer`);
    setToast({ type: 'success', text: `Candidate marked as "${newStatus}"!` });
    await loadData();
    setTimeout(() => setToast(null), 3000);
  };

  const handleAutoShortlist = async () => {
    let count = 0;
    for (const app of applications) {
      const cgpaNum = parseFloat(app.cgpa || '0');
      const attNum = parseFloat(app.attendance || '0');
      if (app.applicationStatus === 'Applied' && cgpaNum >= 7.0 && attNum >= 75) {
        await updateApplicationStatus(app.id, 'Shortlisted', 'Auto-Shortlisted by T&P System Matrix (CGPA >= 7.0 & Attendance >= 75%)');
        count++;
      }
    }
    setToast({ type: 'success', text: `✨ Auto-shortlisted ${count} eligible candidates (CGPA >= 7.0 & Attendance >= 75%)!` });
    await loadData();
    setTimeout(() => setToast(null), 4000);
  };

  const handlePublishDrive = async (e) => {
    e.preventDefault();
    if (!newDrive.companyName || !newDrive.jobTitle || !newDrive.packageCtc) {
      setToast({ type: 'error', text: 'Please fill in all required drive details.' });
      return;
    }

    setIsPublishing(true);
    const res = await createPlacementDrive(newDrive);
    setIsPublishing(false);

    if (res.success) {
      setToast({ type: 'success', text: `🎉 Campus drive for ${newDrive.companyName} published live to student portal!` });
      setNewDrive({
        companyName: '',
        jobTitle: '',
        jobType: 'Full-Time Campus Drive',
        packageCtc: '',
        location: '',
        eligibleCourses: ['MCA', 'B.Tech'],
        minCgpa: 6.5,
        minAttendance: 75.0,
        deadline: '',
        driveDate: '',
        jobDescription: '',
        selectionRounds: 'Online Assessment -> Technical Interview -> HR Round',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
      });
      await loadData();
      setActiveTab('drives');
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Filtered applicants
  const filteredApplicants = applications.filter((app) => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentPrn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.applicationStatus === statusFilter;
    const matchesDrive = driveFilter === 'all' || app.driveId === driveFilter;

    return matchesSearch && matchesStatus && matchesDrive;
  });

  return (
    <div className="dashboard-panel">
      <div className="panel-header placement-manager-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-heading)' }}>
                Training &amp; Placement (T&amp;P) Cell Officer Console
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Campus recruitment drive management, candidate shortlisting, and hiring pipeline
              </span>
            </div>
          </div>

          <div className="placement-tab-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'applicants' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('applicants')}
            >
              <Users size={14} /> Applicants ({applications.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'drives' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('drives')}
            >
              <Building2 size={14} /> Active Drives ({drives.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'new_drive' ? 'btn-primary' : 'btn-white'}`}
              onClick={() => setActiveTab('new_drive')}
              style={{ background: activeTab === 'new_drive' ? '#059669' : undefined, color: activeTab === 'new_drive' ? 'white' : undefined }}
            >
              <Plus size={14} /> Announce Drive
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`alert-message ${toast.type}`} style={{ marginBottom: '20px' }}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <div>{toast.text}</div>
        </div>
      )}

      {/* ── TAB 1: APPLICANTS PIPELINE ── */}
      {activeTab === 'applicants' && (
        <div>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="form-input-wrap" style={{ flex: 1, minWidth: '220px' }}>
              <span className="form-input-icon"><Search size={16} /></span>
              <input
                type="text"
                className="form-input"
                placeholder="Search candidate by name, PRN, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="form-select"
                style={{ width: '180px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Selected - Offer Issued">Selected (Offer Issued)</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                className="form-select"
                style={{ width: '200px' }}
                value={driveFilter}
                onChange={(e) => setDriveFilter(e.target.value)}
              >
                <option value="all">All Companies / Drives</option>
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>{d.companyName}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={handleAutoShortlist}
                title="Automatically shortlist all applicants meeting eligibility thresholds (CGPA >= 7.0 & Attendance >= 75%)"
              >
                <Sparkles size={14} /> Auto-Shortlist Eligible Candidates
              </button>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Drive / Company</th>
                  <th>Course &amp; CGPA</th>
                  <th>Applied On</th>
                  <th>Hiring Status</th>
                  <th style={{ textAlign: 'center' }}>T&amp;P Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No candidate applications match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong style={{ fontSize: '13px', color: 'var(--text-heading)', display: 'block' }}>
                          {app.studentName}
                        </strong>
                        <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.studentPrn}</code>
                      </td>
                      <td>
                        <strong style={{ fontSize: '13px', color: 'var(--primary)', display: 'block' }}>
                          {app.companyName}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.jobTitle}</span>
                      </td>
                      <td>
                        <span className="status-pill blue" style={{ fontSize: '10px' }}>{app.studentCourse}</span>
                        <strong style={{ fontSize: '12px', color: '#059669', marginLeft: '6px' }}>{app.studentCgpa} CGPA</strong>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            app.applicationStatus.includes('Selected')
                              ? 'approved'
                              : app.applicationStatus.includes('Rejected')
                              ? 'pending'
                              : 'blue'
                          }`}
                          style={{ fontSize: '11px', fontWeight: 700 }}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <select
                          className="form-select"
                          style={{ fontSize: '11px', padding: '4px 8px', width: '160px' }}
                          value={app.applicationStatus}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted ✓</option>
                          <option value="Technical Interview">Schedule Tech Interview 🗓️</option>
                          <option value="Selected - Offer Issued">Select &amp; Issue Offer 🏆</option>
                          <option value="Rejected">Reject Candidate</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACTIVE DRIVES LIST ── */}
      {activeTab === 'drives' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {drives.map((drive) => (
            <div
              key={drive.id}
              style={{
                background: 'var(--bg-body)',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <img
                  src={drive.companyLogo}
                  alt={drive.companyName}
                  style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-heading)' }}>{drive.jobTitle}</h4>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{drive.companyName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', fontSize: '11px' }}>
                <span className="status-pill approved">{drive.packageCtc}</span>
                <span className="status-pill blue">{drive.location}</span>
                <span className="status-pill">{drive.jobType}</span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Min CGPA: <strong>{drive.minCgpa}</strong> • Eligible: <strong>{drive.eligibleCourses?.join(', ')}</strong>
              </div>

              <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600 }}>
                ⏳ Application Deadline: {drive.deadline}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: ANNOUNCE NEW RECRUITMENT DRIVE ── */}
      {activeTab === 'new_drive' && (
        <form onSubmit={handlePublishDrive} style={{ background: 'var(--bg-body)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>
            Publish Campus Placement Drive / Internship
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Company / Recruiter Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Tata Consultancy Services (TCS)"
                value={newDrive.companyName}
                onChange={(e) => setNewDrive({ ...newDrive, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Job Role *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer / Sports Officer"
                value={newDrive.jobTitle}
                onChange={(e) => setNewDrive({ ...newDrive, jobTitle: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Package / Salary (CTC) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ₹8.50 LPA or ₹30,000 / month"
                value={newDrive.packageCtc}
                onChange={(e) => setNewDrive({ ...newDrive, packageCtc: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pune / Amravati / Hybrid"
                value={newDrive.location}
                onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Eligibility CGPA *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 6.5"
                value={newDrive.minCgpa}
                onChange={(e) => setNewDrive({ ...newDrive, minCgpa: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                className="form-input"
                value={newDrive.deadline}
                onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Job Description &amp; Candidate Responsibilities</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Describe key duties, technical stack, skills required..."
              value={newDrive.jobDescription}
              onChange={(e) => setNewDrive({ ...newDrive, jobDescription: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setActiveTab('drives')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPublishing}>
              <Send size={14} />
              {isPublishing ? 'Publishing Drive...' : 'Publish Campus Drive 🚀'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
