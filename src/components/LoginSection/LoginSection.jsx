import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, User, ShieldCheck, BookOpenCheck, Mail, Lock,
  Users, LogIn, UserPlus, ChevronRight, AlertCircle, Clock,
  CheckCircle2, XCircle, KeyRound, Sparkles
} from 'lucide-react';
import StudentRegister from '../StudentRegister/StudentRegister';
import { QuickHallTicketSearchModal } from './QuickHallTicketSearchModal';
import './LoginSection.css';

const roles = [
  { id: 'student', icon: GraduationCap, name: 'Student', desc: 'Access results, attendance & fees' },
  { id: 'hod', icon: BookOpenCheck, name: 'HOD', desc: 'Verify registrations & dept stats' },
  { id: 'admin', icon: ShieldCheck, name: 'Admin', desc: 'Central institutional control' },
  { id: 'faculty', icon: User, name: 'Faculty', desc: 'Manage classes & internal marks' },
];

const DEMO_ACCOUNTS = [
  {
    role: 'student',
    label: 'Registered Student (Parth Deshmukh - BCA)',
    email: 'parth.deshmukh.bca@dcpehvpm.org',
    password: 'password123',
    status: 'approved',
  },
  {
    role: 'hod',
    label: 'HOD Computer Science (Dr. V. M. Thakare - MCA)',
    email: 'hod.cs@dcpehvpm.org',
    password: 'password123',
    status: 'hod',
  },
  {
    role: 'hod',
    label: 'HOD Science (Prof. R. S. Kulkarni - BCA / B.Sc)',
    email: 'hod.science@dcpehvpm.org',
    password: 'password123',
    status: 'hod',
  },
  {
    role: 'faculty',
    label: 'Faculty Teacher (Prof. S. Sharma - Cloud Computing)',
    email: 'faculty.sharma@dcpehvpm.org',
    password: 'password123',
    status: 'approved',
  },
  {
    role: 'admin',
    label: 'College Administrator / Registrar (Prof. S. R. Ingle)',
    email: 'admin@dcpehvpm.org',
    password: 'password123',
    status: 'admin',
  },
];

export default function LoginSection() {
  const { login, changeStaffPassword, students } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showQuickLookupModal, setShowQuickLookupModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [pendingWarning, setPendingWarning] = useState(null);
  const [rejectedError, setRejectedError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Change password modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [resetRole, setResetRole] = useState('faculty');
  const [resetEmail, setResetEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setResetResult(null);

    if (!resetEmail.trim() || !currentPassword || !newPassword) {
      setResetResult({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setResetResult({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setIsResetting(true);
    const res = await changeStaffPassword(resetEmail, currentPassword, newPassword, resetRole);
    setIsResetting(false);

    if (res.success) {
      setResetResult({ type: 'success', text: '✅ Password changed successfully! You can now log in.' });
      setResetEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setResetResult(null);
      }, 2000);
    } else {
      setResetResult({ type: 'error', text: res.message || 'Verification failed. Check your email or current password.' });
    }
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage(null);
    setPendingWarning(null);
    setRejectedError(null);
  };

  const handleDemoFill = (demo) => {
    setSelectedRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.password);
    setErrorMessage(null);
    setPendingWarning(null);
    setRejectedError(null);
    setActiveTab('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingWarning(null);
    setRejectedError(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both Email/PRN and Password.');
      return;
    }

    setIsLoggingIn(true);
    const res = await login(email, password, selectedRole);
    setIsLoggingIn(false);

    if (!res.success) {
      if (res.isPendingApproval) {
        setPendingWarning(res.message);
      } else if (res.isRejected) {
        setRejectedError(res.message);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <section className="login-section section" id="login-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">
            <KeyRound size={14} />
            Institutional Portal Access
          </span>
          <h2 className="section-title">
            {activeTab === 'login' ? 'Sign In to DCPE ERP' : 'Student Online Registration'}
          </h2>
          <p className="section-subtitle">
            {activeTab === 'login'
              ? 'Access your role-based academic and administrative services'
              : 'Submit your enrollment details to your department HOD for verification'}
          </p>

          <div
            className="login-tab-bar"
            style={{
              display: 'inline-flex',
              background: 'var(--bg-white)',
              padding: '6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              marginTop: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'login' ? 'btn-primary' : 'btn-white'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '8px 24px' }}
              onClick={() => setActiveTab('login')}
            >
              <LogIn size={15} />
              Existing User Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'register' ? 'btn-primary' : 'btn-white'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '8px 24px' }}
              onClick={() => setActiveTab('register')}
            >
              <UserPlus size={15} />
              New Student Registration
            </button>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '8px 20px',
                marginLeft: '10px',
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(30,27,75,0.3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setShowQuickLookupModal(true)}
            >
              <Sparkles size={15} color="#fbbf24" />
              ⚡ Quick Offline Gatepass Search (PRN)
            </button>
          </div>
        </div>

        {showQuickLookupModal && (
          <QuickHallTicketSearchModal
            allStudents={students}
            onClose={() => setShowQuickLookupModal(false)}
          />
        )}

        {activeTab === 'register' ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <StudentRegister onSwitchToLogin={() => setActiveTab('login')} />
          </div>
        ) : (
          <div className="login-grid">
            {/* Left Side: Role Selector Cards & Demo Helper */}
            <div>
              <div className="login-cards">
                {roles.map((role) => (
                  <div
                    className={`login-role-card ${role.id} ${selectedRole === role.id ? 'active' : ''}`}
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <div className={`login-role-icon ${role.id}`}>
                      <role.icon size={26} />
                    </div>
                    <div className="login-role-name">{role.name}</div>
                    <div className="login-role-desc">{role.desc}</div>
                  </div>
                ))}
              </div>

              {/* Quick Demo Credentials Panel for testing HOD & Student */}
              <div
                style={{
                  marginTop: '24px',
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-heading)' }}>
                    Quick Demo Test Accounts (1-Click Fill)
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DEMO_ACCOUNTS.map((demo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDemoFill(demo)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: 'var(--bg-body)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <span>
                        <strong>{demo.label}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>({demo.email})</span>
                      </span>
                      <span
                        className={`status-pill ${
                          demo.status === 'approved'
                            ? 'approved'
                            : demo.status === 'pending'
                            ? 'pending'
                            : 'approved'
                        }`}
                        style={{ fontSize: '10px', padding: '2px 8px' }}
                      >
                        {demo.status === 'pending' ? 'Pending Approval' : 'Fill Credentials'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="login-form-wrap">
              <div className="login-form-header">
                <h3>Sign In as {selectedRole.toUpperCase()}</h3>
                <p>Enter your institutional login credentials</p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="alert-message error">
                  <AlertCircle size={20} />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Pending Approval Warning */}
              {pendingWarning && (
                <div className="alert-message warning" style={{ borderLeft: '4px solid #d97706' }}>
                  <Clock size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>HOD Approval Required!</strong>
                    {pendingWarning}
                  </div>
                </div>
              )}

              {/* Rejection Alert */}
              {rejectedError && (
                <div className="alert-message error" style={{ borderLeft: '4px solid #dc2626' }}>
                  <XCircle size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Registration Not Approved</strong>
                    {rejectedError}
                  </div>
                </div>
              )}

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Login Role</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon"><Users size={16} /></span>
                    <select
                      className="form-select"
                      value={selectedRole}
                      onChange={(e) => handleRoleSelect(e.target.value)}
                    >
                      <option value="student">Student (Approved Only)</option>
                      <option value="hod">Head of Department (HOD)</option>
                      <option value="faculty">Faculty Member</option>
                      <option value="admin">ERP Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {selectedRole === 'student'
                        ? 'College Email / Registered Mobile No / PRN'
                        : 'Official Staff Email Address'}
                    </span>
                    {selectedRole === 'student' && (
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                        📱 Mobile Login Enabled
                      </span>
                    )}
                  </label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">
                      {selectedRole === 'student' ? <User size={16} /> : <Mail size={16} />}
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={
                        selectedRole === 'student'
                          ? 'e.g. 7028030836 or parth.deshmukh.bca@dcpehvpm.org or DCPE/BCA/...'
                          : 'e.g. hod.cs@dcpehvpm.org or admin@dcpehvpm.org'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password (default: password123)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label className="form-checkbox-label">
                    <input type="checkbox" defaultChecked />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="form-forgot"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setResetResult(null);
                      setShowChangePasswordModal(true);
                    }}
                  >
                    Forgot / Change Password?
                  </button>
                </div>

                <button
                  className="btn btn-primary login-btn"
                  type="submit"
                  disabled={isLoggingIn}
                >
                  <LogIn size={18} />
                  {isLoggingIn ? 'Signing in...' : 'Sign In to Dashboard'}
                  <ChevronRight size={16} />
                </button>

                <div className="login-divider">or</div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => setActiveTab('register')}
                  >
                    <UserPlus size={16} />
                    New Student? Register Here
                  </button>
                </div>

                <p className="login-help">
                  Need assistance? Contact the Department Office or{' '}
                  <a href="#contact">IT Helpdesk</a>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ── Change Password Modal ── */}
        {showChangePasswordModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '20px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                <KeyRound size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>Change Faculty / Staff Password</h3>
              </div>

              {resetResult && (
                <div className={`alert-message ${resetResult.type}`} style={{ marginBottom: '16px', fontSize: '13px' }}>
                  {resetResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <div>{resetResult.text}</div>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>Select Account Role</label>
                  <select
                    className="form-select"
                    value={resetRole}
                    onChange={(e) => setResetRole(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  >
                    <option value="faculty">Faculty Member</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="admin">ERP Administrator</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>Official Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. faculty.sharma@dcpehvpm.org"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>Current Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'block', marginBottom: '6px' }}>New Password * <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(min. 6 characters)</span></label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter your new secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => { setShowChangePasswordModal(false); setResetResult(null); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isResetting}>
                    {isResetting ? 'Saving Password...' : 'Update Password ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
