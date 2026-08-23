import React, { useState, useEffect } from 'react';
import { useAuth, getBranchCode } from '../../context/AuthContext';
import {
  UserPlus, Mail, Lock, User, Hash, Phone, Building2,
  BookOpen, Calendar, ShieldAlert, CheckCircle2, AlertCircle,
  ArrowRight, Sparkles, Tag, AtSign, ShieldCheck, Heart, FileText,
  CreditCard, MapPin, Users
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

const GENDERS = ['Male', 'Female', 'Other'];

const BLOOD_GROUPS = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

const CATEGORIES = [
  'OPEN / General',
  'OBC (Other Backward Class)',
  'SC (Scheduled Caste)',
  'ST (Scheduled Tribe)',
  'NT (Nomadic Tribes)',
  'VJNT',
  'EWS (Economically Weaker Section)',
  'SBC (Special Backward Class)',
];

export default function StudentRegister({ onSwitchToLogin }) {
  const { registerStudent, getNextEnrollmentNumberForBranch, getAutoCollegeEmail } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    category: 'OPEN / General',
    phone: '',
    aadhaarNo: '',
    guardianName: '',
    guardianPhone: '',
    permanentAddress: '',
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
    if (!formData.name.trim() || !formData.phone.trim() || !formData.password) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all mandatory fields marked with (*)',
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
      gender: formData.gender,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      category: formData.category,
      phone: formData.phone.trim(),
      aadhaarNo: formData.aadhaarNo.trim(),
      guardianName: formData.guardianName.trim(),
      guardianPhone: formData.guardianPhone.trim(),
      permanentAddress: formData.permanentAddress.trim(),
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
        gender: 'Male',
        dob: '',
        bloodGroup: 'O+',
        category: 'OPEN / General',
        phone: '',
        aadhaarNo: '',
        guardianName: '',
        guardianPhone: '',
        permanentAddress: '',
        department: 'cs',
        course: 'MCA (Master of Computer Applications)',
        year: '1st Year (Semester I & II)',
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
          <strong>Auto-Generated Credentials &amp; HOD Verification:</strong> Your 
          <strong> College Email ID</strong> (<code>[name].[branch]@dcpehvpm.org</code>) and 
          <strong> Permanent Enrollment Number</strong> (<code>DCPE/{activeBranchCode}/2026/XXXX</code>) are 
          automatically generated. Registration requires 
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
          
          {/* ── SECTION 1: ACADEMIC PROGRAM ── */}
          <div className="full-width" style={{ marginTop: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> 1. Academic Program &amp; Branch Selection
            </span>
          </div>

          {/* Department Selection */}
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
                <Sparkles size={16} /> Auto-Generated Permanent Enrollment Number *
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

          {/* Academic Year */}
          <div className="form-group full-width">
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

          {/* ── SECTION 2: PERSONAL & DEMOGRAPHIC DETAILS ── */}
          <div className="full-width" style={{ marginTop: '16px', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> 2. Personal &amp; Demographic Information
            </span>
          </div>

          {/* Full Name */}
          <div className="form-group full-width">
            <label className="form-label">Full Name (As per SSC / College Certificate) *</label>
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
          </div>

          {/* Auto-Generated Unique College Email ID (Live Preview) */}
          <div className="form-group full-width">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AtSign size={16} /> Auto-Generated Official College Email ID (Login ID) *
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
                🔒 Institutional Email
              </span>
            </div>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Mail size={16} color="#059669" /></span>
              <input
                type="text"
                value={autoCollegeEmail || 'Type full name above to generate college email...'}
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
          </div>

          {/* Gender Selection */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Users size={16} /></span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
                required
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Calendar size={16} /></span>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Heart size={16} color="#dc2626" /></span>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="form-select"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Reservation Category</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Tag size={16} /></span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── SECTION 3: CONTACT & IDENTIFICATION ── */}
          <div className="full-width" style={{ marginTop: '16px', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} /> 3. Contact &amp; Parent / Guardian Details
            </span>
          </div>

          {/* Mobile Phone */}
          <div className="form-group">
            <label className="form-label">Student Mobile Number *</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          {/* Aadhaar Number */}
          <div className="form-group">
            <label className="form-label">Aadhaar Card Number (12 Digits)</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><CreditCard size={16} /></span>
              <input
                type="text"
                name="aadhaarNo"
                maxLength={12}
                value={formData.aadhaarNo}
                onChange={handleChange}
                className="form-input"
                placeholder="12-digit UIDAI number"
              />
            </div>
          </div>

          {/* Parent Name */}
          <div className="form-group">
            <label className="form-label">Parent / Guardian Full Name</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><User size={16} /></span>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                className="form-input"
                placeholder="Parent or Guardian name"
              />
            </div>
          </div>

          {/* Parent Phone */}
          <div className="form-group">
            <label className="form-label">Parent / Emergency Phone</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><Phone size={16} /></span>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                className="form-input"
                placeholder="+91 98234 56789"
              />
            </div>
          </div>

          {/* Permanent Address */}
          <div className="form-group full-width">
            <label className="form-label">Permanent Residential Address</label>
            <div className="form-input-wrap">
              <span className="form-input-icon"><MapPin size={16} /></span>
              <input
                type="text"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="form-input"
                placeholder="House No, Street Name, City, District, Pincode"
              />
            </div>
          </div>

          {/* ── SECTION 4: SECURITY ── */}
          <div className="full-width" style={{ marginTop: '16px', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} /> 4. Account Security
            </span>
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
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

        </div>

        <div className="form-actions-bar">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
          >
            {isSubmitting ? (
              <>Submitting Registration to HOD Portal...</>
            ) : (
              <>
                <UserPlus size={18} /> Submit Registration for Verification
              </>
            )}
          </button>
        </div>
      </form>

      <div className="register-footer-switch">
        <span>Already have an approved student account?</span>{' '}
        <button className="btn-link" onClick={onSwitchToLogin}>
          Sign In to Student Portal
        </button>
      </div>
    </div>
  );
}
