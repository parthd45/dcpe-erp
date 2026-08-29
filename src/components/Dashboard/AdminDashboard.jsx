import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Users, ShieldCheck, CheckCircle2, Clock, XCircle,
  TrendingUp, BarChart3, UserPlus, BookOpen, LogOut, Megaphone,
  Send, Award, CreditCard, Plus, Search, ShieldAlert, AlertCircle, RefreshCw,
  Pencil, Trash2, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { postNotice } from '../../lib/noticesService';
import {
  fetchPrincipalPendingApplications,
  reviewLeaveApplication
} from '../../lib/leaveService';
import { hashPassword } from '../../lib/authCrypto';
import { AIAssistantWidget } from './AIAssistantWidget';
import './Dashboard.css';

export default function AdminDashboard({ onBackToHome }) {
  const { currentUser, students, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'staff' | 'broadcast' | 'sanctions'
  const [staffList, setStaffList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  // Principal Leaves State
  const [principalLeaves, setPrincipalLeaves] = useState([]);
  const [principalLeavesLoading, setPrincipalLeavesLoading] = useState(false);
  const [principalLeaveToast, setPrincipalLeaveToast] = useState(null);

  // New Faculty Modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'faculty',
    departmentId: 'cs',
    designation: 'Assistant Professor',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [addStaffResult, setAddStaffResult] = useState(null);

  // Edit Faculty Modal state
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editStaffTarget, setEditStaffTarget] = useState(null); // the staff row being edited
  const [editStaffForm, setEditStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    newPassword: '', // leave empty to keep existing password
    role: 'faculty',
    departmentId: 'cs',
    designation: 'Assistant Professor',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffResult, setEditStaffResult] = useState(null);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Document Viewer Modal
  const [viewProofUrl, setViewProofUrl] = useState(null);
  const [viewProofName, setViewProofName] = useState('');

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

  const loadPrincipalLeaves = async () => {
    setPrincipalLeavesLoading(true);
    const list = await fetchPrincipalPendingApplications();
    setPrincipalLeaves(list);
    setPrincipalLeavesLoading(false);
  };

  useEffect(() => {
    loadStaffAndSubjects();
    loadPrincipalLeaves();
  }, []);

  const handlePrincipalReview = async (appId, decision) => {
    const remarks = decision === 'approve'
      ? 'Executive Institutional Sanction Granted by Principal / Registrar for Extended Absence.'
      : 'Extended leave request rejected by Principal Executive Council.';

    const res = await reviewLeaveApplication({
      applicationId: appId,
      stage: 'principal',
      decision,
      reviewerName: currentUser.name || 'Principal Dr. V. M. Thakare',
      remarks,
    });

    if (res.success) {
      setPrincipalLeaveToast({
        type: 'success',
        text: decision === 'approve'
          ? '🎉 Official Principal Sanction Order generated and authorized for student!'
          : '❌ Application rejected by Principal.',
      });
      await loadPrincipalLeaves();
      setTimeout(() => setPrincipalLeaveToast(null), 4000);
    }
  };

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

  // Predefined designations list
  const DESIGNATIONS = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Head of Department (HOD)',
    'Director',
    'Principal',
    'Registrar',
    'Lab Instructor / Assistant',
    'Academic Coordinator',
    'Assistant Registrar',
    'Administrative Officer',
    'Senior Clerk',
    'Junior Clerk'
  ];

  // Helper to auto-generate staff email address based on first & last name and role, resolving duplicates
  const autoGenerateEmail = (firstName, lastName, role, currentStaffList = [], excludeId = null) => {
    if (!firstName && !lastName) return '';
    const fPart = (firstName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const lPart = (lastName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let prefix = '';
    if (fPart && lPart) {
      prefix = `${fPart}.${lPart}`;
    } else {
      prefix = fPart || lPart;
    }
    
    const baseEmail = `${role}.${prefix}@dcpehvpm.org`;
    
    // Filter out the staff member we are currently editing
    const emailsInUse = new Set(
      currentStaffList
        .filter(s => s.id !== excludeId)
        .map(s => s.email?.toLowerCase().trim())
    );
    
    if (!emailsInUse.has(baseEmail)) {
      return baseEmail;
    }
    
    // If taken, append counter starting from 2
    let counter = 2;
    while (true) {
      const candidate = `${role}.${prefix}${counter}@dcpehvpm.org`;
      if (!emailsInUse.has(candidate)) {
        return candidate;
      }
      counter++;
    }
  };

  // Helper to get matching Account Role based on selected Designation
  const getRoleFromDesignation = (designation) => {
    if (!designation) return 'faculty';
    if (designation === 'Head of Department (HOD)') return 'hod';
    const adminDesignations = [
      'Director',
      'Principal',
      'Registrar',
      'Assistant Registrar',
      'Administrative Officer',
      'Senior Clerk',
      'Junior Clerk'
    ];
    if (adminDesignations.includes(designation)) return 'admin';
    return 'faculty';
  };

  // Helper to generate a relatable, easy-to-remember staff passcode
  const autoGeneratePasscode = (firstName, lastName) => {
    const namePart = (lastName || firstName || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    return namePart ? `dcpe@${namePart}` : 'dcpe@123';
  };

  // Open Add Staff Modal pre-filled with a default relatable passcode
  const openAddStaffModal = () => {
    setNewStaffForm({
      firstName: '',
      lastName: '',
      email: '',
      password: 'dcpe@123',
      role: 'faculty',
      departmentId: 'cs',
      designation: 'Assistant Professor',
    });
    setAddStaffResult(null);
    setShowAddPassword(true); // make password visible by default during register
    setShowAddStaffModal(true);
  };

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

    const fullName = `${newStaffForm.firstName.trim()} ${newStaffForm.lastName.trim()}`.trim();
    if (!fullName || !newStaffForm.email.trim()) {
      setAddStaffResult({ type: 'error', text: 'Please fill in Name and Email.' });
      return;
    }
    if (!newStaffForm.password || newStaffForm.password.length < 6) {
      setAddStaffResult({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsAddingStaff(true);
    try {
      const deptObj = DEPARTMENTS.find((d) => d.id === newStaffForm.departmentId);
      const hash = await hashPassword(newStaffForm.password);

      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: fullName,
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
        text: `✅ ${newStaffForm.role.toUpperCase()} account for ${fullName} created! Login: ${newStaffForm.email}`,
      });
      setNewStaffForm({ firstName: '', lastName: '', email: '', password: '', role: 'faculty', departmentId: 'cs', designation: 'Assistant Professor' });
      setShowAddStaffModal(false);
      loadStaffAndSubjects();
      setTimeout(() => setAddStaffResult(null), 5000);
    } catch (err) {
      setAddStaffResult({ type: 'error', text: `Failed to create staff account: ${err.message}` });
    } finally {
      setIsAddingStaff(false);
    }
  };

  // ── Open Edit Modal pre-filled with existing staff data
  const openEditStaff = (st) => {
    const deptId = DEPARTMENTS.find((d) => d.name === st.department_name)?.id ||
      DEPARTMENTS.find((d) => d.id === st.department_id)?.id || 'cs';
    
    // Split name into first and last name
    const parts = (st.name || '').trim().split(/\s+/);
    const fName = parts[0] || '';
    const lName = parts.slice(1).join(' ') || '';

    setEditStaffTarget(st);
    setEditStaffForm({
      firstName: fName,
      lastName: lName,
      email: st.email,
      newPassword: '',
      role: st.role,
      departmentId: deptId,
      designation: st.designation || 'Assistant Professor',
    });
    setEditStaffResult(null);
    setShowEditPassword(false);
    setShowEditStaffModal(true);
  };

  // ── Save edits to an existing staff member
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setEditStaffResult(null);

    const fullName = `${editStaffForm.firstName.trim()} ${editStaffForm.lastName.trim()}`.trim();
    if (!fullName || !editStaffForm.email.trim()) {
      setEditStaffResult({ type: 'error', text: 'Name and Email are required.' });
      return;
    }
    if (editStaffForm.newPassword && editStaffForm.newPassword.length < 6) {
      setEditStaffResult({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setIsEditingStaff(true);
    try {
      const deptObj = DEPARTMENTS.find((d) => d.id === editStaffForm.departmentId);
      const updatePayload = {
        name: fullName,
        email: editStaffForm.email.trim().toLowerCase(),
        role: editStaffForm.role,
        department_id: editStaffForm.departmentId,
        department_name: deptObj ? deptObj.name : editStaffTarget.department_name,
        designation: editStaffForm.designation,
      };
      // Only update password if a new one was provided
      if (editStaffForm.newPassword.trim()) {
        updatePayload.password_hash = await hashPassword(editStaffForm.newPassword.trim());
      }
      const { error } = await supabase
        .from('staff')
        .update(updatePayload)
        .eq('id', editStaffTarget.id);
      if (error) throw error;

      setEditStaffResult({ type: 'success', text: `✅ ${fullName}'s account updated successfully!` });
      loadStaffAndSubjects();
      setTimeout(() => {
        setShowEditStaffModal(false);
        setEditStaffTarget(null);
        setEditStaffResult(null);
      }, 1800);
    } catch (err) {
      setEditStaffResult({ type: 'error', text: `Update failed: ${err.message}` });
    } finally {
      setIsEditingStaff(false);
    }
  };

  // Export Faculty/Staff roster to CSV/Excel
  const handleExportStaffCSV = () => {
    const headers = [
      'Staff Name',
      'Designation',
      'Institutional Email',
      'Account Role',
      'Department Name'
    ];

    const rows = staffList.map(s => [
      s.name,
      s.designation || 'Staff',
      s.email,
      s.role.toUpperCase(),
      s.department_name || 'Central Administration'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DCPE_Faculty_Staff_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Delete a staff account (with inline confirmation)
  const handleDeleteStaff = async (staffId) => {
    try {
      // 1. Clean up notices publisher/posted reference constraint
      await supabase.from('notices').delete().eq('publisher_id', staffId);
      await supabase.from('notices').delete().eq('posted_by', staffId);

      // 2. Clean up marks reference constraint
      await supabase.from('marks').update({ staff_id: null }).eq('staff_id', staffId);

      // 3. Delete the staff member
      const { error } = await supabase.from('staff').delete().eq('id', staffId);
      if (error) throw error;

      setDeleteConfirmId(null);
      setAddStaffResult({ type: 'success', text: '🗑️ Staff account deleted successfully.' });
      loadStaffAndSubjects();
      setTimeout(() => setAddStaffResult(null), 4000);
    } catch (err) {
      setAddStaffResult({ type: 'error', text: `Delete failed: ${err.message}` });
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
          <button
            className={`hod-tab-btn ${activeTab === 'sanctions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sanctions')}
          >
            <ShieldCheck size={16} />
            Principal Sanctions (10+ Days)
            {principalLeaves.length > 0 && (
              <span className="tab-badge" style={{ background: '#dc2626' }}>
                {principalLeaves.length}
              </span>
            )}
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

            {/* Visual Charts Dashboard Section */}
            {(() => {
              const maxVal = Math.max(...deptStats.map(d => d.totalCount), 10);
              const totalFeePaid = totalFeePaidCount;
              const totalFeePending = totalStudentsCount - totalFeePaid;
              const feePaidPercent = Math.round((totalFeePaid / (totalStudentsCount || 1)) * 100);
              
              // Doughnut SVG calculations
              const radius = 60;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (feePaidPercent / 100) * circumference;

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  {/* Department Comparison Bar Chart */}
                  <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} color="var(--primary)" />
                      Departmental Student Distribution Comparison
                    </h4>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></span>
                        <span style={{ color: 'var(--text-muted)' }}>Total Students</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: '#059669', borderRadius: '3px' }}></span>
                        <span style={{ color: 'var(--text-muted)' }}>Approved Active</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '3px' }}></span>
                        <span style={{ color: 'var(--text-muted)' }}>Attendance Shortage</span>
                      </div>
                    </div>

                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
                      {/* Grid background lines */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} style={{ width: '100%', borderBottom: '1px dashed var(--border-light)', height: 0 }}></div>
                        ))}
                      </div>

                      {deptStats.map((dept) => {
                        const totalH = (dept.totalCount / maxVal) * 160;
                        const approvedH = (dept.approvedCount / maxVal) * 160;
                        const shortageH = (dept.shortageCount / maxVal) * 160;

                        return (
                          <div key={dept.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1, position: 'relative' }}>
                            {/* Bars container */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', position: 'relative' }}>
                              
                              {/* Tooltip on group hover */}
                              <div className="chart-tooltip" style={{
                                position: 'absolute',
                                bottom: `${Math.max(totalH, approvedH, shortageH) + 10}px`,
                                background: 'rgba(15, 23, 42, 0.95)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                opacity: 0,
                                transform: 'translateY(10px) translateX(-50%)',
                                left: '50%',
                                transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-md)',
                              }}>
                                <strong>{dept.name}</strong><br/>
                                • Total: {dept.totalCount}<br/>
                                • Approved: {dept.approvedCount}<br/>
                                • Shortage: {dept.shortageCount}
                              </div>

                              <style>{`
                                div[key="${dept.id}"]:hover .chart-tooltip {
                                  opacity: 1 !important;
                                  transform: translateY(0) translateX(-50%) !important;
                                }
                              `}</style>

                              {/* Total Bar */}
                              <div style={{
                                width: '12px',
                                height: `${Math.max(totalH, 4)}px`,
                                background: 'var(--primary)',
                                borderRadius: '3px 3px 0 0',
                                transition: 'height 0.8s ease',
                              }}></div>

                              {/* Approved Bar */}
                              <div style={{
                                width: '12px',
                                height: `${Math.max(approvedH, 4)}px`,
                                background: '#059669',
                                borderRadius: '3px 3px 0 0',
                                transition: 'height 0.8s ease',
                              }}></div>

                              {/* Shortage Bar */}
                              <div style={{
                                width: '12px',
                                height: `${Math.max(shortageH, 4)}px`,
                                background: '#dc2626',
                                borderRadius: '3px 3px 0 0',
                                transition: 'height 0.8s ease',
                              }}></div>
                            </div>
                            
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-heading)', marginTop: '8px' }}>
                              {dept.code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* College Fees Clearance Ring Chart */}
                  <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#059669" />
                      Fee Clearance Status
                    </h4>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <svg width="150" height="150" viewBox="0 0 150 150">
                        {/* Background Ring */}
                        <circle
                          cx="75"
                          cy="75"
                          r={radius}
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="14"
                        />
                        {/* Foreground Progress Ring */}
                        <circle
                          cx="75"
                          cy="75"
                          r={radius}
                          fill="transparent"
                          stroke="#059669"
                          strokeWidth="14"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          transform="rotate(-90 75 75)"
                          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                        />
                      </svg>
                      {/* Percent Center Label */}
                      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-heading)' }}>
                          {feePaidPercent}%
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Cleared
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', fontSize: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Paid Students</span>
                        <strong style={{ color: '#059669', fontSize: '15px' }}>{totalFeePaid}</strong>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>Pending Check</span>
                        <strong style={{ color: '#d97706', fontSize: '15px' }}>{totalFeePending}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

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

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline-dark btn-sm" onClick={handleExportStaffCSV}>
                  📥 Export Staff List (CSV)
                </button>
                <button className="btn btn-primary btn-sm" onClick={openAddStaffModal}>
                  <UserPlus size={16} /> Add New Faculty Member
                </button>
              </div>
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
                    <th style={{ textAlign: 'center' }}>Actions</th>
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
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {deleteConfirmId === st.id ? (
                            <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Confirm?</span>
                              <button
                                className="btn btn-white btn-sm"
                                style={{ color: '#dc2626', border: '1px solid #fecaca', fontSize: '11px', padding: '2px 8px' }}
                                onClick={() => handleDeleteStaff(st.id)}
                              >
                                Yes, Delete
                              </button>
                              <button
                                className="btn btn-white btn-sm"
                                style={{ fontSize: '11px', padding: '2px 8px' }}
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                className="btn btn-white btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px', border: '1px solid #bfdbfe', color: '#1d4ed8' }}
                                onClick={() => openEditStaff(st)}
                                title="Edit Staff Account"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                className="btn btn-white btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 10px', border: '1px solid #fecaca', color: '#dc2626' }}
                                onClick={() => setDeleteConfirmId(st.id)}
                                title="Delete Staff Account"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </span>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isBroadcasting}
                  style={{ padding: '12px 28px' }}
                >
                  <Send size={16} />
                  {isBroadcasting ? 'Broadcasting...' : 'Broadcast College-Wide Circular'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/*  TAB 4: Principal Executive Sanctions (10+ Days) */}
        {/* ═════════════════════════════════════════════════ */}
        {activeTab === 'sanctions' && (
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <ShieldCheck size={22} color="#dc2626" />
                  Level-3 Executive Sanctions: Extended Student Leaves (10+ Days)
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Institutional governance for long-term absences and escalated grievances verified by <strong>Faculty Mentors</strong> and <strong>HODs</strong>.
                </p>
              </div>
              <button className="btn btn-white btn-sm" onClick={loadPrincipalLeaves}>
                <RefreshCw size={14} /> Refresh Requests
              </button>
            </div>

            {principalLeaveToast && (
              <div className={`alert-message ${principalLeaveToast.type}`} style={{ marginBottom: '16px' }}>
                {principalLeaveToast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <div>{principalLeaveToast.text}</div>
              </div>
            )}

            {principalLeavesLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading pending executive sanctions...
              </div>
            ) : principalLeaves.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-body)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                <CheckCircle2 size={40} color="#059669" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '15px', color: 'var(--text-heading)', margin: '0 0 4px' }}>Zero Pending Executive Sanctions</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  All 10+ days leaves and escalated grievances have been reviewed and sanctioned by the Principal's office.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {principalLeaves.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: 'white',
                      border: '2px solid #fecaca',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'var(--shadow-md)',
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
                              background: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                            }}
                          >
                            ⚠️ Extended Absence: {app.totalDays} Days
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Filed {app.createdAt}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px' }}>
                          {app.studentName} <code style={{ fontSize: '12px', fontWeight: 600 }}>({app.prn} • Roll {app.rollNo})</code>
                        </h4>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          <strong>{app.course}</strong> • Department: <strong>{app.departmentName}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626' }}>
                          {app.startDate} to {app.endDate}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Purpose: <strong>{app.category}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Dual Verification Seals (Teacher & HOD) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#166534' }}>
                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} color="#16a34a" /> Level-1 Teacher Verified
                        </div>
                        <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                          "{app.teacherApproval?.remarks || 'Endorsed by Faculty'}"
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                          By: {app.teacherApproval?.reviewedBy} ({app.teacherApproval?.reviewedAt})
                        </div>
                      </div>

                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#166534' }}>
                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} color="#16a34a" /> Level-2 HOD Endorsed
                        </div>
                        <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                          "{app.hodApproval?.remarks || 'Recommended by HOD'}"
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                          By: {app.hodApproval?.reviewedBy} ({app.hodApproval?.reviewedAt})
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-body)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Student Explanation:</strong> {app.reason}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '6px' }}>
                        <span>Parent / Emergency Contact: <strong>{app.emergencyContact}</strong></span>
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
                              📎 Verified Certificate: {app.attachmentName}
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
                        onClick={() => handlePrincipalReview(app.id, 'reject')}
                      >
                        <XCircle size={15} /> Reject Sanction
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
                        onClick={() => handlePrincipalReview(app.id, 'approve')}
                      >
                        <ShieldCheck size={15} color="#67e8f9" /> Grant Principal Executive Sanction Order ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Add Staff Modal ── */}
        {showAddStaffModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <UserPlus size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>Create New Faculty / Staff Account</h3>
              </div>

              {addStaffResult && (
                <div className={`alert-message ${addStaffResult.type}`} style={{ marginBottom: '16px' }}>
                  {addStaffResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <div>{addStaffResult.text}</div>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Jaydeep"
                      value={newStaffForm.firstName}
                      onChange={(e) => {
                        const newFirst = e.target.value;
                        setNewStaffForm((prev) => {
                          const nextForm = { ...prev, firstName: newFirst };
                          // Auto email
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(newFirst, prev.lastName, prev.role, staffList);
                          }
                          // Auto passcode
                          const oldAutoGenPass = autoGeneratePasscode(prev.firstName, prev.lastName);
                          if (!prev.password || prev.password === oldAutoGenPass) {
                            nextForm.password = autoGeneratePasscode(newFirst, prev.lastName);
                          }
                          return nextForm;
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ravat"
                      value={newStaffForm.lastName}
                      onChange={(e) => {
                        const newLast = e.target.value;
                        setNewStaffForm((prev) => {
                          const nextForm = { ...prev, lastName: newLast };
                          // Auto email
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, newLast, prev.role, staffList);
                          }
                          // Auto passcode
                          const oldAutoGenPass = autoGeneratePasscode(prev.firstName, prev.lastName);
                          if (!prev.password || prev.password === oldAutoGenPass) {
                            nextForm.password = autoGeneratePasscode(prev.firstName, newLast);
                          }
                          return nextForm;
                        });
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <select
                      className="form-select"
                      value={newStaffForm.designation}
                      onChange={(e) => {
                        const newDesignation = e.target.value;
                        const newRole = getRoleFromDesignation(newDesignation);
                        setNewStaffForm((prev) => {
                          const nextForm = { ...prev, designation: newDesignation, role: newRole };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, prev.lastName, newRole, staffList);
                          }
                          return nextForm;
                        });
                      }}
                    >
                      {DESIGNATIONS.map((des) => (
                        <option key={des} value={des}>{des}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={newStaffForm.departmentId} onChange={(e) => setNewStaffForm({ ...newStaffForm, departmentId: e.target.value })}>
                      {DEPARTMENTS.map((d) => (<option key={d.id} value={d.id}>{d.code} — {d.name.split('(')[0].trim()}</option>))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Institutional Email *</label>
                  <input type="email" className="form-input" placeholder="faculty.deshmukh@dcpehvpm.org"
                    value={newStaffForm.email} onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })} required />
                </div>

                 <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Login Password * <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(min. 6 characters)</span></label>
                    <button
                      type="button"
                      onClick={() => setNewStaffForm({ ...newStaffForm, password: autoGeneratePasscode(newStaffForm.firstName, newStaffForm.lastName) })}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0 }}
                    >
                      🔄 Reset Default
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Set a secure password for this account"
                      value={newStaffForm.password}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                      style={{ paddingRight: '42px' }}
                      required
                    />
                    <button type="button" onClick={() => setShowAddPassword(!showAddPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-select"
                      value={newStaffForm.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setNewStaffForm((prev) => {
                          const nextForm = { ...prev, role: newRole };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, prev.lastName, newRole, staffList);
                          }
                          return nextForm;
                        });
                      }}
                    >
                      <option value="faculty">Faculty Teacher</option>
                      <option value="hod">Head of Department (HOD)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {/* Empty spacer or password inside grid */}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setShowAddStaffModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isAddingStaff}>
                    <UserPlus size={15} /> {isAddingStaff ? 'Creating Account...' : 'Create Staff Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Staff Modal ── */}
        {showEditStaffModal && editStaffTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <Pencil size={22} color="#1d4ed8" />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>Edit Staff Account</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Editing: <strong>{editStaffTarget.name}</strong> — <code>{editStaffTarget.email}</code></p>
                </div>
              </div>

              {editStaffResult && (
                <div className={`alert-message ${editStaffResult.type}`} style={{ marginBottom: '16px' }}>
                  {editStaffResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <div>{editStaffResult.text}</div>
                </div>
              )}

              <form onSubmit={handleEditStaffSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editStaffForm.firstName}
                      onChange={(e) => {
                        const newFirst = e.target.value;
                        setEditStaffForm((prev) => {
                          const nextForm = { ...prev, firstName: newFirst };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList, editStaffTarget?.id);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(newFirst, prev.lastName, prev.role, staffList, editStaffTarget?.id);
                          }
                          return nextForm;
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editStaffForm.lastName}
                      onChange={(e) => {
                        const newLast = e.target.value;
                        setEditStaffForm((prev) => {
                          const nextForm = { ...prev, lastName: newLast };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList, editStaffTarget?.id);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, newLast, prev.role, staffList, editStaffTarget?.id);
                          }
                          return nextForm;
                        });
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <select
                      className="form-select"
                      value={editStaffForm.designation}
                      onChange={(e) => {
                        const newDesignation = e.target.value;
                        const newRole = getRoleFromDesignation(newDesignation);
                        setEditStaffForm((prev) => {
                          const nextForm = { ...prev, designation: newDesignation, role: newRole };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList, editStaffTarget?.id);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, prev.lastName, newRole, staffList, editStaffTarget?.id);
                          }
                          return nextForm;
                        });
                      }}
                    >
                      {DESIGNATIONS.map((des) => (
                        <option key={des} value={des}>{des}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-select" value={editStaffForm.departmentId} onChange={(e) => setEditStaffForm({ ...editStaffForm, departmentId: e.target.value })}>
                      {DEPARTMENTS.map((d) => (<option key={d.id} value={d.id}>{d.code} — {d.name.split('(')[0].trim()}</option>))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Institutional Email *</label>
                  <input type="email" className="form-input"
                    value={editStaffForm.email} onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })} required />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">Reset Password <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep existing password)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter new password to change it..."
                      value={editStaffForm.newPassword}
                      onChange={(e) => setEditStaffForm({ ...editStaffForm, newPassword: e.target.value })}
                      style={{ paddingRight: '42px' }}
                    />
                    <button type="button" onClick={() => setShowEditPassword(!showEditPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select
                      className="form-select"
                      value={editStaffForm.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        setEditStaffForm((prev) => {
                          const nextForm = { ...prev, role: newRole };
                          const oldAutoGen = autoGenerateEmail(prev.firstName, prev.lastName, prev.role, staffList, editStaffTarget?.id);
                          if (!prev.email || prev.email === oldAutoGen) {
                            nextForm.email = autoGenerateEmail(prev.firstName, prev.lastName, newRole, staffList, editStaffTarget?.id);
                          }
                          return nextForm;
                        });
                      }}
                    >
                      <option value="faculty">Faculty Teacher</option>
                      <option value="hod">Head of Department (HOD)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="form-group">
                    {/* Empty spacer */}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="btn btn-outline-dark btn-sm"
                    onClick={() => { setShowEditStaffModal(false); setEditStaffTarget(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isEditingStaff}
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                    <Pencil size={14} /> {isEditingStaff ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
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

        {/* ── Admin AI Copilot Assistant Widget ── */}
        <AIAssistantWidget
          currentUser={currentUser}
          onOpenModal={(key) => {
            if (key === 'analytics') setActiveTab('analytics');
            if (key === 'staff') setActiveTab('staff');
            if (key === 'broadcast' || key === 'notices') setActiveTab('broadcast');
            if (key === 'sanctions' || key === 'leaves') setActiveTab('sanctions');
          }}
        />

      </div>
    </div>
  );
}
