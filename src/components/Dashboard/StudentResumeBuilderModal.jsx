import React, { useState } from 'react';
import {
  FileText, Printer, X, Sparkles, CheckCircle2, User,
  Mail, Phone, GraduationCap, Award, Briefcase, Code, Plus, Trash2, Globe
} from 'lucide-react';
import './Dashboard.css';

export function StudentResumeBuilderModal({ currentUser, onClose }) {
  if (!currentUser) return null;

  // State for editable sections
  const [skills, setSkills] = useState([
    'JavaScript (ES6+)', 'React.js', 'Python', 'SQL & Databases',
    'Sports Biomechanics', 'Event Management', 'Git & GitHub'
  ]);
  const [newSkill, setNewSkill] = useState('');

  const [projects, setProjects] = useState([
    {
      title: 'DCPE ERP & Campus Management System',
      duration: '2026',
      description: 'Built full-stack React ERP module featuring QR gatepass verifications, real-time Supabase toast notifications, and automated academic predictor tools.'
    },
    {
      title: 'Sports Performance Analytics Dashboard',
      duration: '2025',
      description: 'Analyzed athlete physiological metrics using data visualization tools to track stamina recovery curves.'
    }
  ]);

  const [certifications, setCertifications] = useState([
    'National Sports & Fitness Training Certification (HVPM)',
    'Full Stack Web Development Professional — Udemy (2025)'
  ]);
  const [newCert, setNewCert] = useState('');

  const [summary, setSummary] = useState(
    `Dedicated ${currentUser.course || 'Student'} candidate at Degree College of Physical Education (HVPM Autonomous Institute). Strong academic background (CGPA: ${currentUser.cgpa || '8.5'}) with hands-on technical skills and proven leadership in campus sports & technology initiatives.`
  );

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setCertifications([...certifications, newCert.trim()]);
    setNewCert('');
  };

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
          maxWidth: '850px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '92vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '15px', color: 'var(--text-heading)' }}>
            <FileText size={18} color="var(--primary)" />
            Automated ATS Resume & Professional Portfolio Generator
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print / Save PDF Resume
            </button>
            <button className="btn btn-white btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Split Pane */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left Control Panel (Hidden during print) */}
          <div
            className="no-print"
            style={{
              padding: '20px',
              background: '#f8fafc',
              borderRight: '1px solid var(--border-light)',
              overflowY: 'auto',
              fontSize: '12px',
            }}
          >
            <h4 style={{ fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              ⚙️ Customize Resume Info
            </h4>

            {/* Executive Summary */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Professional Summary:</label>
              <textarea
                className="form-control"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={{ fontSize: '11px', width: '100%', resize: 'vertical' }}
              />
            </div>

            {/* Skills Inputs */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Add Technical Skill:</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Java, DBMS..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{ fontSize: '11px', flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddSkill}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Certifications Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '4px' }}>Add Certification:</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Course title..."
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  style={{ fontSize: '11px', flex: 1 }}
                />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddCert}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right ATS Resume Live Document Preview */}
          <div style={{ padding: '32px', overflowY: 'auto', background: 'white' }}>
            <div
              id="printable-ats-resume"
              style={{
                background: 'white',
                fontFamily: `'Inter', sans-serif`,
                color: '#1e293b',
                lineHeight: 1.5,
              }}
            >
              {/* Header */}
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentUser.name}
                </h1>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <span>🎓 {currentUser.course}</span>
                  <span>📍 {currentUser.departmentName}</span>
                  <span>📧 {currentUser.email}</span>
                  <span>📱 {currentUser.phone || '+91 9876543210'}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Permanent PRN: <strong>{currentUser.prn}</strong> • Institutional Roll No: <strong>{currentUser.rollNo || 'MCA-2026-001'}</strong>
                </div>
              </div>

              {/* Professional Summary */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Professional Summary
                </h3>
                <p style={{ fontSize: '11.5px', color: '#334155', margin: 0 }}>
                  {summary}
                </p>
              </div>

              {/* Education */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Education & Academic Qualifications
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                  <span>Degree College of Physical Education (HVPM Autonomous), Amravati</span>
                  <span>2024 – 2026</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{currentUser.course} ({currentUser.departmentName})</span>
                  <span>Cumulative CGPA: <strong>{currentUser.cgpa || '8.5'} / 10.0</strong> • Attendance: <strong>{currentUser.attendance || '90%'}</strong></span>
                </div>
              </div>

              {/* Technical Skills */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Skills & Technical Competencies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {skill}
                      <X
                        size={12}
                        className="no-print"
                        style={{ cursor: 'pointer', opacity: 0.6 }}
                        onClick={() => handleRemoveSkill(index)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Key Technical & Sports Science Projects
                </h3>
                {projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                      <span>{proj.title}</span>
                      <span style={{ color: '#64748b' }}>{proj.duration}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#334155', margin: '2px 0 0' }}>
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                  Certifications & Achievements
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#334155' }}>
                  {certifications.map((cert, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
