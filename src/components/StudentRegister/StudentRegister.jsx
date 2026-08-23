import React, { useState, useEffect } from 'react';
import { useAuth, getBranchCode } from '../../context/AuthContext';
import {
  UserPlus, Mail, Lock, User, Hash, Phone, Building2,
  BookOpen, Calendar, ShieldAlert, CheckCircle2, AlertCircle,
  ArrowRight, Sparkles, Tag, AtSign, ShieldCheck
} from 'lucide-react';
import './StudentRegister.css';

const DEPARTMENTS = [
  {
    id: 'cs',
    name: 'P.G. Dept. of Computer Science & Technology',
    courses: ['MCA (Master of Computer Applications)'],
  },
  {
    id: 'science',
    name: 'Department of Science',
    courses: [
      'BCA (Bachelor of Computer Applications)',
      'B.Sc. (Computer Science)',
      'M.Sc. (Computer Science)',
    ],
  },
  {
    id: 'phy-ed',
    name: 'Department of Physical Education & Sports',
    courses: [
      'B.P.Ed (Bachelor of Physical Education)',
      'M.P.Ed (Master of Physical Education)',
      'B.P.E.S. (Physical Education & Sports)',
    ],
  },
  {
    id: 'commerce',
    name: 'Department of Commerce & Administration',
    courses: [
      'BBA (Bachelor of Business Administration)',
      'M.Com (Master of Commerce)',
    ],
  },
  {
    id: 'yoga',
    name: 'Department of Yoga & Naturopathy',
    courses: [
      'B.A. Yoga (Bachelor of Arts in Yoga)',
      'M.A. Yoga (Master of Arts in Yoga)',
      'PGDYT (PG Diploma in Yoga Therapy)',
      'DYNS (Diploma in Yoga & Naturopathy)',
    ],
  },
  {
    id: 'vocational',
    name: 'Department of Vocational & Skill Education',
    courses: [
      'B.Voc (Software Development)',
      'B.Voc (Sports Management)',
    ],
  },
];

const YEARS = [
  '1st Year (Semester I & II)',
  '2nd Year (Semester III & IV)',
  '3rd Year (Semester V & VI)',
  'Final Year',
];

export default function StudentRegister({ onSwitchToLogin }) {
  const { registerStudent, getNextEnrollmentNumberForBranch, getAutoCollegeEmail } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    personalEmail: '',
    department: 'cs',
    course: 'MCA (Master of Computer Applications)',
    year: '1st Year (Semester I & II)',
    password: '',
    confirmPassword: '',
  });

  const [branchEnrollmentNo, setBranchEnrollmentNo] = useState('');
  const [autoCollegeEmail, setAutoCollegeEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically update branch-specific enrollment number when course changes
  useEffect(() => {
    if (formData.course) {
      getNextEnrollmentNumberForBranch(formData.course).then((nextNo) => {
        setBranchEnrollmentNo(nextNo);
      });
    }
  }, [formData.course, getNextEnrollmentNumberForBranch]);

  // Automatically update unique college email as student types name or changes course
  useEffect(() => {
    if (formData.name && formData.course) {
      getAutoCollegeEmail(formData.name, formData.course).then((email) => {
        setAutoCollegeEmail(email);
      });
    } else {
      setAutoCollegeEmail('');
    }
  }, [formData.name, formData.course, getAutoCollegeEmail]);

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const selectedDept = DEPARTMENTS.find((d) => d.id === deptId);
    const firstCourse = selectedDept ? selectedDept.courses[0] : '';
    setFormData({
      ...formData,
      department: deptId,
      course: firstCourse,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    // Form validations
    if (!formData.name.trim() || !formData.password) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all mandatory fields (*)',
      });
      return;
    }

    if (formData.password.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match. Please re-enter carefully.',
      });
      return;
    }

    setIsSubmitting(true);

    const selectedDept = DEPARTMENTS.find((d) => d.id === formData.department);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      personalEmail: formData.personalEmail.trim(),
      department: formData.department,
      departmentName: selectedDept ? selectedDept.name : formData.department,
      course: formData.course,
      year: formData.year,
      password: formData.password,
    };

    const res = await registerStudent(payload);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: res.message,
        assignedNo: res.enrollmentNo,
        assignedEmail: res.collegeEmail,
      });
      // Reset form
      setFormData({
        name: '',
        phone: '',
        personalEmail: '',
        department: 'cs',
        course: DEPARTMENTS[0].courses[0],
        year: YEARS[0],
        password: '',
        confirmPassword: '',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.message,
      });
    }
  };

  const currentDeptObj = DEPARTMENTS.find((d) => d.id === formData.department) || DEPARTMENTS[0];
  const activeBranchCode = getBranchCode(formData.course);

  return (
    <div className="register-card-wrap">
      <div className="register-header">
        <h3>New Student Registration</h3>
        <p>Create your institutional account for DCPE ERP</p>
      </div>

      <div className="approval-notice-banner">
        <ShieldAlert size={20} className="icon" />
        <p>
          <strong>Auto-Generated Credentials & HOD Verification:</strong> Your 
          <strong> College Email ID</strong> (<code>[name].[branch]@dcpehvpm.org</code>) and 
          <strong> Enrollment Number</strong> (<code>DCPE/{activeBranchCode}/2026/XXXX</code>) are 
          automatically generated with guaranteed uniqueness. Registration requires 
          <strong> HOD approval</strong> before login access is activated.
        </p>
      </div>

      {statusMessage && (
        <div className={`alert-message ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
          )}
          <div>
            <strong>
              {statusMessage.type === 'success'
                ? `Registration Submitted Successfully!`
                : 'Registration Error:'}
            </strong>{' '}
            <div style={{ margin: '4px 0 0', fontSize: '13px' }}>
              {statusMessage.assignedEmail && (
                <div style={{ marginBottom: '2px' }}>
                  📧 <strong>Assigned College Email:</strong> <code>{statusMessage.assignedEmail}</code>
                </div>
              )}
              {statusMessage.assignedNo && (
                <div style={{ marginBottom: '4px' }}>
                  🔢 <strong>Assigned Enrollment No:</strong> <code>{statusMessage.assignedNo}</code>
                </div>
              )}
              <p style={{ margin: 0 }}>{statusMessage.text}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-form-grid">
          {/* Department Selection First */}
          <div className="form-group">
            <label className="form-label">Department *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Building2 size={16} /></span>
              <select
                name="department"
                value={formData.department}
                onChange={handleDepartmentChange}
                className="form-select"
                required
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Branch / Course Selection */}
          <div className="form-group">
            <label className="form-label">Branch / Program *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><BookOpen size={16} /></span>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="form-select"
                required
              >
                {currentDeptObj.courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Branch-Specific Permanent Enrollment Number */}
          <div className="form-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Auto-Generated Branch Enrollment Number *
              </label>
              <span
                style={{
                  fontSize: '11px',
                  background: '#fef2f4',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  border: '1px solid #fbd0d9',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Tag size={12} /> Branch: {activeBranchCode}
              </span>
            </div>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Hash size={16} color="var(--primary)" /></span>
              <input
                type="text"
                value={branchEnrollmentNo}
                readOnly
                disabled
                className="form-input"
                style={{
                  background: '#f8fafc',
                  borderColor: '#fbd0d9',
                  color: 'var(--text-heading)',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.05em',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group full-width">
            <label className="form-label">Full Name (As per College Records) *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Ramesh Vijay Deshmukh"
                required
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              💡 Your official college email will be automatically crafted from your name and branch.
            </span>
          </div>

          {/* Auto-Generated Unique College Email ID (Live Preview) */}
          <div className="form-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AtSign size={16} /> Auto-Generated College Email ID (Login ID) *
              </label>
              <span
                style={{
                  fontSize: '11px',
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  border: '1px solid #a7f3d0',
                }}
              >
                🔒 Guaranteed Unique Institutional ID
              </span>
            </div>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Mail size={16} color="#059669" /></span>
              <input
                type="text"
                value={autoCollegeEmail || 'Type your name above to generate institutional email...'}
                readOnly
                disabled
                className="form-input"
                style={{
                  background: '#f0fdf4',
                  borderColor: '#a7f3d0',
                  color: autoCollegeEmail ? '#065f46' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'not-allowed',
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
              ✨ Unique collision-free email ending in <code>@dcpehvpm.org</code>. If names match, an automatic counter is appended.
            </span>
          </div>

          {/* Mobile Phone */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Academic Year */}
          <div className="form-group">
            <label className="form-label">Current Academic Year *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Calendar size={16} /></span>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-select"
                required
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Create Password *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Lock size={16} /></span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Lock size={16} /></span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Re-type password"
                required
              />
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary register-btn"
          type="submit"
          disabled={isSubmitting || !autoCollegeEmail}
        >
          <UserPlus size={18} />
          {isSubmitting ? 'Submitting to HOD...' : `Submit Application (${autoCollegeEmail || 'Enter Name'})`}
          <ArrowRight size={16} />
        </button>

        <div className="switch-mode-text">
          Already registered?{' '}
          <button type="button" onClick={onSwitchToLogin}>
            Go to Login
          </button>
        </div>
      </form>
    </div>
  );
}
