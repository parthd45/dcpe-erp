import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Users, ShieldCheck, CheckCircle2, Clock, XCircle,
  TrendingUp, BarChart3, UserPlus, BookOpen, LogOut, Megaphone,
  Send, Award, CreditCard, Plus, Search, ShieldAlert, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { postNotice } from '../../lib/noticesService';
import './Dashboard.css';

export default function AdminDashboard({ onBackToHome }) {
  const { currentUser, students, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'staff' | 'broadcast'
  const [staffList, setStaffList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  // New Faculty Modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'faculty',
    departmentId: 'cs',
    designation: 'Assistant Professor',
  });
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [addStaffResult, setAddStaffResult] = useState(null);

  // Central Broadcast Notice state
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    body: '',
    tag: 'urgent',
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // ── Load Staff & Subjects from Supabase
  const loadStaffAndSubjects = async () => {
    setIsLoadingStaff(true);
    try {
      const { data: staffData } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
      setStaffList(staffData || []);

      const { data: subData } = await supabase.from('subjects').select('*').order('code', { ascending: true });
      setSubjectsList(subData || []);
    } catch (err) {
      console.error('[DCPE ERP Admin] Error loading data:', err.message);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadStaffAndSubjects();
  }, []);

  // ── Compute College-Wide Statistics
  const totalStudentsCount = students.length;
  const totalPendingCount = students.filter((s) => s.status === 'pending').length;
  const totalApprovedCount = students.filter((s) => s.status === 'approved').length;
  const totalRejectedCount = students.filter((s) => s.status === 'rejected').length;

  const totalFeePaidCount = students.filter(
    (s) => s.feesStatus?.toLowerCase().includes('paid') && !s.feesStatus?.toLowerCase().includes('unpaid')
  ).length;

  const feeClearanceRate =
    totalStudentsCount > 0 ? ((totalFeePaidCount / totalStudentsCount) * 100).toFixed(1) : '0';

  const shortageStudentsCount = students.filter((s) => parseFloat(s.attendance || '0') < 75).length;

  // Department-wise Groupings
  const DEPARTMENTS = [
    { id: 'cs',         name: 'P.G. Dept. of Computer Science & Technology', code: 'CS', hod: 'Dr. V. M. Thakare' },
    { id: 'science',    name: 'Department of Science',                      code: 'SCI', hod: 'Prof. R. S. Kulkarni' },
    { id: 'phy-ed',     name: 'Department of Physical Education & Sports',  code: 'PE',  hod: 'Dr. S. P. Deshpande' },
    { id: 'commerce',   name: 'Department of Commerce & Administration',    code: 'COM', hod: 'HOD Commerce' },
    { id: 'yoga',       name: 'Department of Yoga & Naturopathy',           code: 'YOG', hod: 'HOD Yoga' },
    { id: 'vocational', name: 'Department of Vocational & Skill Education', code: 'VOC', hod: 'HOD Vocational' },
  ];

  const deptStats = DEPARTMENTS.map((dept) => {
    const deptStus = students.filter((s) => s.department === dept.id);
    const pending = deptStus.filter((s) => s.status === 'pending').length;
    const approved = deptStus.filter((s) => s.status === 'approved').length;
    const shortage = deptStus.filter((s) => parseFloat(s.attendance || '0') < 75).length;
    return {
      ...dept,
      totalCount: deptStus.length,
      pendingCount: pending,
      approvedCount: approved,
      shortageCount: shortage,
    };
  });

  // ── Add New Staff Member (HOD / Faculty)
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setAddStaffResult(null);

    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) {
      setAddStaffResult({ type: 'error', text: 'Please fill in Name and Email.' });
      return;
    }

    setIsAddingStaff(true);
    try {
      const deptObj = DEPARTMENTS.find((d) => d.id === newStaffForm.departmentId);
      // Hash password using bcrypt JS or store hash
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash(newStaffForm.password, 10);

      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: newStaffForm.name.trim(),
          email: newStaffForm.email.trim().toLowerCase(),
          password_hash: hash,
          role: newStaffForm.role,
          department_id: newStaffForm.departmentId,
          department_name: deptObj ? deptObj.name : 'Central College Administration',
          designation: newStaffForm.designation,
        })
        .select()
        .single();

      if (error) throw error;

      setAddStaffResult({
        type: 'success',
        text: `✅ ${newStaffForm.role.toUpperCase()} Account for ${newStaffForm.name} created! Login email: ${newStaffForm.email}`,
      });

      setNewStaffForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'faculty',
        departmentId: 'cs',
        designation: 'Assistant Professor',
      });

      setShowAddStaffModal(false);
      loadStaffAndSubjects();
      setTimeout(() => setAddStaffResult(null), 5000);
    } catch (err) {
      setAddStaffResult({ type: 'error', text: `Failed to create staff account: ${err.message}` });
    } finally {
      setIsAddingStaff(false);
    }
  };

  // ── Central Broadcast Notice
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcastResult(null);

    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      setBroadcastResult({ type: 'error', text: 'Please fill in Title and Body.' });
      return;
    }

    setIsBroadcasting(true);

    const tagLabelMap = {
      urgent: 'Urgent Circular',
      exam: 'Examination Directive',
      event: 'Institutional Event',
      general: 'Principal Circular',
    };

    const res = await postNotice(
      currentUser.id,
      'admin',
      broadcastForm.title,
      broadcastForm.body,
      broadcastForm.tag,
      tagLabelMap[broadcastForm.tag] || 'Principal Circular',
      'college' // College-wide scope
    );

    setIsBroadcasting(false);

    if (res.success) {
      setBroadcastResult({
        type: 'success',
        text: '🌐 Central Principal Broadcast Notice published live across all department portals!',
      });
      setBroadcastForm({ title: '', body: '', tag: 'urgent' });
      setTimeout(() => setBroadcastResult(null), 5000);
    } else {
      setBroadcastResult({ type: 'error', text: res.message || 'Broadcast failed.' });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-container">
      <div className="container">
        
        {/* Admin Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="user-avatar-badge admin">PRIN</div>
            <div className="user-meta">
              <h2>{currentUser.name}</h2>
              <p>
                {currentUser.designation} • <strong>Degree College of Physical Education, HVPM Amravati</strong>
              </p>
              <div className="user-role-tag admin">
                <ShieldCheck size={12} /> Principal &amp; ERP Registrar Portal
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

        {/* Global Action Result Notification */}
        {addStaffResult && (
          <div className={`alert-message ${addStaffResult.type}`} style={{ marginBottom: '24px' }}>
            {addStaffResult.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <div>{addStaffResult.text}</div>
          </div>
        )}

        {/* College-Wide KPI Summary Grid */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon purple"><Users size={24} /></div>
            <div className="kpi-details">
              <span>Total Enrolled Students</span>
              <h3>{totalStudentsCount}</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #d97706' }}>
            <div className="kpi-icon warning"><Clock size={24} /></div>
            <div className="kpi-details">
              <span>Pending Approvals</span>
              <h3 style={{ color: '#d97706' }}>{totalPendingCount}</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #059669' }}>
            <div className="kpi-icon success"><CheckCircle2 size={24} /></div>
            <div className="kpi-details">
              <span>Fee Clearance Rate</span>
              <h3 style={{ color: '#059669' }}>{feeClearanceRate}%</h3>
            </div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div className="kpi-icon primary"><ShieldAlert size={24} /></div>
            <div className="kpi-details">
              <span>Attendance Shortage (&lt;75%)</span>
              <h3 style={{ color: '#dc2626' }}>{shortageStudentsCount}</h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hod-tab-bar">
          <button
            className={`hod-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Department Analytics
          </button>
          <button
            className={`hod-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={16} />
            Faculty &amp; Staff Roster ({staffList.length})
          </button>
          <button
            className={`hod-tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            <Megaphone size={16} />
            Principal Broadcast Circular
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 1: Department Comparison Analytics   */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Building2 size={22} color="var(--primary)" />
                  College-Wide Departmental Analytics &amp; Performance
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Real-time breakdown across all 6 academic departments at DCPE HVPM
                </p>
              </div>
              <button className="btn btn-white btn-sm" onClick={loadStaffAndSubjects}>
                <RefreshCw size={14} /> Refresh Stats
              </button>
            </div>

            {/* Department Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {deptStats.map((dept) => (
                <div
                  key={dept.id}
                  style={{
                    background: 'var(--bg-body)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '20px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--text-heading)', display: 'block' }}>
                        {dept.name}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        HOD: <strong>{dept.hod}</strong>
                      </span>
                    </div>
                    <span
                      style={{
                        background: 'var(--primary-50)',
                        color: 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {dept.code}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', fontSize: '12px' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Total Students</span>
                      <strong style={{ fontSize: '16px', color: 'var(--text-heading)' }}>{dept.totalCount}</strong>
                    </div>

                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Approved Active</span>
                      <strong style={{ fontSize: '16px', color: '#059669' }}>{dept.approvedCount}</strong>
                    </div>

                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Pending Verification</span>
                      <strong style={{ fontSize: '16px', color: '#d97706' }}>{dept.pendingCount}</strong>
                    </div>

                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Shortage (&lt;75%)</span>
                      <strong style={{ fontSize: '16px', color: '#dc2626' }}>{dept.shortageCount}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/*  TAB 2: Faculty & Staff Roster             */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'staff' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Users size={22} color="var(--primary)" />
                  Faculty &amp; Staff Roster Management
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Manage HODs, Professor accounts, and subject allocations
                </p>
              </div>

              <button className="btn btn-primary btn-sm" onClick={() => setShowAddStaffModal(true)}>
                <UserPlus size={16} /> Add New Faculty Member
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Staff Name &amp; Designation</th>
                    <th>Institutional Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingStaff ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        Loading staff roster...
                      </td>
                    </tr>
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No staff members found.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((st) => (
                      <tr key={st.id}>
                        <td>
                          <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{st.name}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{st.designation || 'Staff'}</span>
                        </td>
                        <td>
                          <code>{st.email}</code>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              st.role === 'admin' ? 'approved' : st.role === 'hod' ? 'pending' : 'approved'
                            }`}
                            style={{ textTransform: 'uppercase' }}
                          >
                            {st.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px' }}>{st.department_name}</span>
                        </td>
                        <td>
                          <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>Active ✓</span>
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
        {/*  TAB 3: Principal Broadcast Circular        */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'broadcast' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Megaphone size={22} color="var(--primary)" />
                  Principal Central Broadcast Circular
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Broadcast an official circular directly to all student portals and landing pages
                </p>
              </div>
            </div>

            {broadcastResult && (
              <div className={`alert-message ${broadcastResult.type}`} style={{ marginBottom: '20px' }}>
                {broadcastResult.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <div>{broadcastResult.text}</div>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} style={{ maxWidth: '680px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Circular Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. End-Semester Examination Schedule & Code of Conduct"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Circular Content *</label>
                <textarea
                  className="form-input"
                  style={{ height: '120px', resize: 'vertical' }}
                  placeholder="Full circular details from the Principal's office..."
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Circular Category / Priority</label>
                <select
                  className="form-select"
                  value={broadcastForm.tag}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, tag: e.target.value })}
                >
                  <option value="urgent">🚨 Urgent Circular</option>
                  <option value="exam">📋 Examination Directive</option>
                  <option value="event">🎉 Institutional Event</option>
                  <option value="general">📌 General Principal Circular</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isBroadcasting}
                style={{ padding: '12px 28px' }}
              >
                <Send size={16} />
                {isBroadcasting ? 'Broadcasting...' : 'Broadcast College-Wide Circular'}
              </button>
            </form>
          </div>
        )}

        {/* ── Add Staff Modal ── */}
        {showAddStaffModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '480px', width: '100%', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <UserPlus size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Add New Faculty / Staff Member
                </h3>
              </div>

              <form onSubmit={handleAddStaffSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Prof. A. B. Deshmukh"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Institutional Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. faculty.deshmukh@dcpehvpm.org"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-select"
                      value={newStaffForm.role}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value })}
                    >
                      <option value="faculty">Faculty Teacher</option>
                      <option value="hod">Head of Department (HOD)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={newStaffForm.departmentId}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, departmentId: e.target.value })}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} - {d.name.split(' ')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Assistant Professor"
                    value={newStaffForm.designation}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, designation: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setShowAddStaffModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isAddingStaff}>
                    {isAddingStaff ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
